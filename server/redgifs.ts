/**
 * RedGifs Integration — STUBBED
 * RedGifs denied API access for this use case.
 * These stubs keep the queue router from crashing.
 */

/**
 * Upload video to RedGifs (STUBBED — API access denied)
 * Returns a placeholder message instead of throwing.
 */
export async function uploadToRedGifs(
  _videoUrl: string,
  _title: string,
  _tags: string[] = []
): Promise<string> {
  console.warn("[RedGifs] API access unavailable — upload skipped");
  return "";
}

/**
 * Check if a file is a video type supported by RedGifs
 */
export function isVideoFile(mimeType: string): boolean {
  const supportedTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ];
  return supportedTypes.includes(mimeType.toLowerCase());
}
