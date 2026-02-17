/**
 * Reddit Integration — STUBBED
 * Reddit denied API access for this use case.
 * These stubs keep the queue router from crashing.
 */

/**
 * Post content to a subreddit (STUBBED — API access denied)
 * Returns empty string instead of throwing.
 */
export async function postToReddit(
  _subreddit: string,
  _title: string,
  _url: string,
  _nsfw: boolean = true
): Promise<string> {
  console.warn("[Reddit] API access unavailable — post skipped");
  return "";
}

/**
 * Validate subreddit name format
 */
export function isValidSubreddit(name: string): boolean {
  return /^[a-zA-Z0-9_]{3,21}$/.test(name);
}

/**
 * Default target subreddits (retained for UI dropdowns)
 */
export const DEFAULT_SUBREDDITS = {
  general: ["gonewild", "RealGirls", "nsfw", "BustyPetite"],
  trans: ["traps", "GoneWildTrans", "transporn", "Tgirls"],
  lingerie: ["lingerie", "UnderwearGW"],
  videos: ["NSFW_GIF", "porn_gifs", "PornGifs"],
  creators: ["OnlyFansPromotions", "OnlyFans101", "OnlyFansAsstastic"],
};
