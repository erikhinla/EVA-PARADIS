/**
 * Storage layer — Supabase Storage
 * Replaces the previous Manus "Forge" storage proxy.
 * Uses the "eva-assets" bucket created in the migration.
 */
import { getSupabaseClient } from "./_core/supabase";

const BUCKET = "eva-assets";

/**
 * Upload a file to Supabase Storage.
 *
 * @param relKey  - Relative path inside the bucket, e.g. "assets/123-photo.jpg"
 * @param data    - File contents as Buffer, Uint8Array, or string
 * @param contentType - MIME type for the upload
 * @returns The storage key and a public URL to the file
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");

  // Convert to Blob for Supabase SDK
  let blob: Blob;
  if (typeof data === "string") {
    blob = new Blob([data], { type: contentType });
  } else {
    // Ensure we have a plain ArrayBuffer (not SharedArrayBuffer)
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    blob = new Blob([ab], { type: contentType });
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, blob, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error("[Storage] Upload failed:", error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(key);

  return { key, url: urlData.publicUrl };
}

/**
 * Get the public URL for a file already in storage.
 */
export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(key);

  return { key, url: data.publicUrl };
}

/**
 * Delete a file from storage.
 */
export async function storageDelete(relKey: string): Promise<void> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([key]);

  if (error) {
    console.error("[Storage] Delete failed:", error);
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
