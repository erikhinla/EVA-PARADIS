import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getSupabaseClient } from "./_core/supabase";
import { storagePut, storageDelete } from "./storage";
import type { Asset, InsertAsset } from "../shared/types";

const BUCKET = "eva-assets";

/**
 * Assets router — handles content upload and management
 * Now uses Supabase PostgreSQL instead of Drizzle/MySQL.
 */
export const assetsRouter = router({
  /**
   * List all assets, newest first
   */
  list: publicProcedure.query(async (): Promise<Asset[]> => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Assets] List failed:", error);
      throw new Error("Failed to list assets");
    }

    return (data ?? []) as Asset[];
  }),

  /**
   * Get a single asset by ID
   */
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }): Promise<Asset> => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !data) {
        throw new Error("Asset not found");
      }

      return data as Asset;
    }),

  /**
   * Upload a new asset.
   * Accepts base64-encoded file data, stores it in Supabase Storage,
   * and creates a database record.
   */
  upload: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // base64 encoded
        conceptName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      // Decode base64 data
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Generate unique file key
      const timestamp = Date.now();
      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `assets/${timestamp}-${sanitizedName}`;

      // Upload to Supabase Storage
      const { url: fileUrl } = await storagePut(fileKey, buffer, input.fileType);

      // Create database record
      const newAsset: InsertAsset = {
        file_key: fileKey,
        file_url: fileUrl,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: fileSize,
        concept_name: input.conceptName,
        status: "ready",
        storage_path: fileKey,
      };

      const { data, error } = await supabase
        .from("assets")
        .insert(newAsset)
        .select("id")
        .single();

      if (error) {
        console.error("[Assets] Insert failed:", error);
        throw new Error("Failed to create asset record");
      }

      return {
        id: data.id,
        fileUrl,
        fileKey,
      };
    }),

  /**
   * Get a presigned upload URL for direct browser-to-Supabase uploads.
   * Use this for large files to bypass Vercel's 4.5MB body limit.
   * Flow: 1) Call getUploadUrl 2) PUT file directly to Supabase 3) Call confirmUpload
   */
  getUploadUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        conceptName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();
      const timestamp = Date.now();
      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `assets/${timestamp}-${sanitizedName}`;

      // Create a signed upload URL (valid for 10 minutes)
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(fileKey);

      if (error) {
        console.error("[Assets] Signed URL failed:", error);
        throw new Error("Failed to create upload URL");
      }

      return {
        signedUrl: data.signedUrl,
        token: data.token,
        fileKey,
        fileType: input.fileType,
        conceptName: input.conceptName,
      };
    }),

  /**
   * Confirm an upload after the file has been uploaded directly to Supabase Storage.
   * Creates the database record.
   */
  confirmUpload: publicProcedure
    .input(
      z.object({
        fileKey: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        conceptName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(input.fileKey);

      const newAsset: InsertAsset = {
        file_key: input.fileKey,
        file_url: urlData.publicUrl,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: input.fileSize,
        concept_name: input.conceptName,
        status: "ready",
        storage_path: input.fileKey,
      };

      const { data, error } = await supabase
        .from("assets")
        .insert(newAsset)
        .select("id")
        .single();

      if (error) {
        console.error("[Assets] Insert failed:", error);
        throw new Error("Failed to create asset record");
      }

      return {
        id: data.id,
        fileUrl: urlData.publicUrl,
        fileKey: input.fileKey,
      };
    }),

  /**
   * Update asset status
   */
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "ready", "failed"]),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("assets")
        .update({ status: input.status })
        .eq("id", input.id);

      if (error) {
        throw new Error("Failed to update asset status");
      }

      return { success: true };
    }),

  /**
   * Update RedGifs URL for an asset
   */
  updateRedGifsUrl: publicProcedure
    .input(
      z.object({
        id: z.number(),
        redgifsUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("assets")
        .update({ redgifs_url: input.redgifsUrl })
        .eq("id", input.id);

      if (error) {
        throw new Error("Failed to update RedGifs URL");
      }

      return { success: true };
    }),

  /**
   * Delete an asset (removes from both DB and Storage)
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      // Get the asset first so we can clean up storage
      const { data: asset } = await supabase
        .from("assets")
        .select("storage_path, file_key")
        .eq("id", input.id)
        .single();

      // Delete from database
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", input.id);

      if (error) {
        throw new Error("Failed to delete asset");
      }

      // Best-effort storage cleanup
      if (asset?.storage_path) {
        try {
          await storageDelete(asset.storage_path);
        } catch (e) {
          console.warn("[Assets] Storage cleanup failed:", e);
        }
      }

      return { success: true };
    }),
});
