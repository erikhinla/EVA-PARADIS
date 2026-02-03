import axios from "axios";
import { AXIOS_TIMEOUT_MS } from "@shared/const";

/**
 * Reddit API Integration
 * Handles posting content to Reddit subreddits
 */

interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RedditSubmitResponse {
  json: {
    data: {
      url: string;
      id: string;
    };
  };
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Reddit API access token using OAuth2
 */
async function getRedditToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Reddit credentials not configured in environment variables");
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post<RedditAuthResponse>(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "password",
        username,
        password,
      }),
      {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "EvaParadis:v1.0.0 (by /u/evaparadis)",
        },
        timeout: AXIOS_TIMEOUT_MS,
      }
    );

    cachedToken = response.data.access_token;
    // Cache for slightly less than expiry time
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

    return cachedToken;
  } catch (error) {
    console.error("[Reddit] Failed to get auth token:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Reddit auth failed: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to authenticate with Reddit");
  }
}

/**
 * Post content to a subreddit
 * @param subreddit - Target subreddit (without r/ prefix)
 * @param title - Post title
 * @param url - URL to content (RedGifs link or image)
 * @param nsfw - Mark as NSFW
 * @returns Reddit post URL
 */
export async function postToReddit(
  subreddit: string,
  title: string,
  url: string,
  nsfw: boolean = true
): Promise<string> {
  try {
    const token = await getRedditToken();

    const response = await axios.post<RedditSubmitResponse>(
      "https://oauth.reddit.com/api/submit",
      new URLSearchParams({
        sr: subreddit,
        kind: "link",
        title: title.substring(0, 300), // Reddit title max length
        url,
        nsfw: nsfw ? "true" : "false",
        sendreplies: "false", // Don't send reply notifications
      }),
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "EvaParadis:v1.0.0 (by /u/evaparadis)",
        },
        timeout: AXIOS_TIMEOUT_MS,
      }
    );

    return response.data.json.data.url;
  } catch (error) {
    console.error("[Reddit] Post failed:", error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.json?.errors?.[0]?.[1] || error.message;
      throw new Error(`Reddit post failed: ${errorMsg}`);
    }
    throw new Error("Reddit post failed");
  }
}

/**
 * Validate subreddit name format
 */
export function isValidSubreddit(name: string): boolean {
  // Subreddit names: 3-21 chars, alphanumeric + underscore
  return /^[a-zA-Z0-9_]{3,21}$/.test(name);
}

/**
 * Default target subreddits for Eva Paradis content
 * Organized by content type and audience
 */
export const DEFAULT_SUBREDDITS = {
  // High-traffic general NSFW
  general: ["gonewild", "RealGirls", "nsfw", "BustyPetite"],
  
  // Trans/LGBTQ+ focused
  trans: ["traps", "GoneWildTrans", "transporn", "Tgirls"],
  
  // Specific content types
  lingerie: ["lingerie", "UnderwearGW"],
  videos: ["NSFW_GIF", "porn_gifs", "PornGifs"],
  
  // Creator-friendly (allow OF links)
  creators: ["OnlyFansPromotions", "OnlyFans101", "OnlyFansAsstastic"],
};
