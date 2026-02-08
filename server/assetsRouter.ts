import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { assets, Asset, InsertAsset } from "../drizzle/schema";
import { storagePut } from "./storage";

/**
 * Assets router - handles content upload and management
 */
export const assetsRouter = router({
  /**
   * List all assets
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allAssets = await db
      .select()
      .from(assets)
      .orderBy(desc(assets.createdAt));

    return allAssets;
  }),

  /**
   * Get a single asset by ID
   */
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db
        .select()
        .from(assets)
        .where(eq(assets.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Asset not found");
      }

      return result[0];
    }),

  /**
   * Upload a new asset
   * Accepts base64 encoded file data
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
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Decode base64 data
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Generate unique file key
      const timestamp = Date.now();
      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `assets/${timestamp}-${sanitizedName}`;

      // Upload to storage
      const { url: fileUrl } = await storagePut(fileKey, buffer, input.fileType);

      // Create database record
      const newAsset: InsertAsset = {
        fileKey,
        fileUrl,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize,
        conceptName: input.conceptName,
        status: "ready",
      };

      const result = await db.insert(assets).values(newAsset);

      return {
        id: result[0].insertId,
        fileUrl,
        fileKey,
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
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(assets)
        .set({ status: input.status })
        .where(eq(assets.id, input.id));

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
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(assets)
        .set({ redgifsUrl: input.redgifsUrl })
        .where(eq(assets.id, input.id));

      return { success: true };
    }),

  /**
   * Delete an asset
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db.delete(assets).where(eq(assets.id, input.id));

      return { success: true };
    }),
});
