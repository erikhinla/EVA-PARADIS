import axios from "axios";
import { AXIOS_TIMEOUT_MS } from "@shared/const";

/**
 * RedGifs API Integration
 * Handles video hosting for Reddit compliance
 */

interface RedGifsAuthResponse {
  token: string;
}

interface RedGifsUploadResponse {
  id: string;
  url: string;
  gif: {
    urls: {
      hd: string;
      sd: string;
    };
  };
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get RedGifs API token
 */
async function getRedGifsToken(apiKey: string): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post<RedGifsAuthResponse>(
      "https://api.redgifs.com/v2/auth/temporary",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: AXIOS_TIMEOUT_MS,
      }
    );

    cachedToken = response.data.token;
    // Tokens typically expire in 24 hours, cache for 23 hours to be safe
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

    return cachedToken;
  } catch (error) {
    console.error("[RedGifs] Failed to get auth token:", error);
    throw new Error("Failed to authenticate with RedGifs");
  }
}

/**
 * Upload video to RedGifs
 * @param videoUrl - Public URL to the video file (S3)
 * @param title - Video title
 * @param tags - Array of tags for categorization
 * @returns RedGifs URL
 */
export async function uploadToRedGifs(
  videoUrl: string,
  title: string,
  tags: string[] = []
): Promise<string> {
  const apiKey = process.env.REDGIFS_API_KEY;
  
  if (!apiKey) {
    throw new Error("REDGIFS_API_KEY environment variable not set");
  }

  try {
    const token = await getRedGifsToken(apiKey);

    // RedGifs requires uploading via URL
    const response = await axios.post<RedGifsUploadResponse>(
      "https://api.redgifs.com/v2/gifs",
      {
        url: videoUrl,
        title: title.substring(0, 100), // Max 100 chars
        tags: tags.slice(0, 5), // Max 5 tags
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: AXIOS_TIMEOUT_MS * 3, // Longer timeout for upload processing
      }
    );

    // Return HD URL
    return response.data.gif.urls.hd || response.data.url;
  } catch (error) {
    console.error("[RedGifs] Upload failed:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`RedGifs upload failed: ${error.response?.data?.message || error.message}`);
    }
    throw new Error("RedGifs upload failed");
  }
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
