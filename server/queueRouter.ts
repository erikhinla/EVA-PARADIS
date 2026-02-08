import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { posts, assets, Post, InsertPost } from "../drizzle/schema";
import { uploadToRedGifs } from "./redgifs";
import { postToReddit } from "./reddit";

/**
 * Concept tag to Reddit title mapping
 */
const CONCEPT_TITLE_PATTERNS: Record<string, string[]> = {
  DOMINANCE_WORSHIP: [
    "Think you're worthy?",
    "POV: admiring your queen",
    "Can you handle this energy?",
  ],
  HARDCORE_GROUP: [
    "Who wants to be next?",
    "Ready for this?",
    "Think you could keep up?",
  ],
  ANATOMY_SOLO: [
    "Can you handle this?",
    "What would you do?",
    "Rate this",
  ],
};

/**
 * Concept tag to target subreddits mapping
 */
const CONCEPT_SUBREDDITS: Record<string, string[]> = {
  DOMINANCE_WORSHIP: ["TransGoneWild", "Tgirls", "TransPorn"],
  HARDCORE_GROUP: ["TransGoneWild", "GroupSex"],
  ANATOMY_SOLO: ["TransGoneWild", "Tgirls", "TransPorn"],
};

/**
 * Generate Reddit title from concept tag
 */
function generateTitle(conceptTag: string): string {
  const patterns = CONCEPT_TITLE_PATTERNS[conceptTag.toUpperCase()];
  if (!patterns || patterns.length === 0) {
    return "Check this out";
  }
  // Pick a random pattern
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * Get target subreddit from concept tag
 * Returns the first available subreddit for the concept
 */
function getTargetSubreddit(conceptTag: string, customSubreddit?: string): string {
  if (customSubreddit) {
    return customSubreddit.replace(/^r\//, ""); // Remove r/ prefix if present
  }

  const subreddits = CONCEPT_SUBREDDITS[conceptTag.toUpperCase()];
  if (!subreddits || subreddits.length === 0) {
    return "TransGoneWild"; // Default fallback
  }
  return subreddits[0];
}

/**
 * Queue router - handles post publishing orchestration
 */
export const queueRouter = router({
  /**
   * List all posts
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return allPosts;
  }),

  /**
   * Get a single post by ID
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
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Post not found");
      }

      return result[0];
    }),

  /**
   * Publish an asset to Reddit via RedGifs
   * This is the main orchestrator that:
   * 1. Uploads video to RedGifs
   * 2. Generates Reddit title
   * 3. Posts to Reddit
   * 4. Tracks status
   */
  publish: publicProcedure
    .input(
      z.object({
        assetId: z.number(),
        targetSubreddit: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Get the asset
      const assetResult = await db
        .select()
        .from(assets)
        .where(eq(assets.id, input.assetId))
        .limit(1);

      if (assetResult.length === 0) {
        throw new Error("Asset not found");
      }

      const asset = assetResult[0];

      // Generate title and determine subreddit
      const postTitle = generateTitle(asset.conceptName);
      const targetSubreddit = getTargetSubreddit(
        asset.conceptName,
        input.targetSubreddit
      );

      // Create post record with queued status
      const newPost: InsertPost = {
        assetId: input.assetId,
        platform: "reddit",
        targetSubreddit,
        postTitle,
        status: "queued",
      };

      const insertResult = await db.insert(posts).values(newPost);
      const postId = insertResult[0].insertId;

      // Start async processing
      processPost(postId, asset, postTitle, targetSubreddit).catch((error) => {
        console.error(`[Queue] Failed to process post ${postId}:`, error);
      });

      return {
        postId,
        status: "queued",
        postTitle,
        targetSubreddit,
      };
    }),

  /**
   * Get posts for a specific asset
   */
  getByAsset: publicProcedure
    .input(z.object({ assetId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db
        .select()
        .from(posts)
        .where(eq(posts.assetId, input.assetId))
        .orderBy(desc(posts.createdAt));

      return result;
    }),
});

/**
 * Process a post asynchronously
 * Uploads to RedGifs and posts to Reddit
 */
async function processPost(
  postId: number,
  asset: any,
  postTitle: string,
  targetSubreddit: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Update status to posting
    await db
      .update(posts)
      .set({ status: "posting" })
      .where(eq(posts.id, postId));

    // Step 1: Upload to RedGifs if not already uploaded
    let redgifsUrl = asset.redgifsUrl;
    if (!redgifsUrl) {
      console.log(`[Queue] Uploading asset ${asset.id} to RedGifs...`);
      redgifsUrl = await uploadToRedGifs(
        asset.fileUrl,
        postTitle,
        [asset.conceptName]
      );

      // Update asset with RedGifs URL
      await db
        .update(assets)
        .set({ redgifsUrl })
        .where(eq(assets.id, asset.id));

      console.log(`[Queue] RedGifs upload complete: ${redgifsUrl}`);
    }

    // Step 2: Post to Reddit
    console.log(`[Queue] Posting to r/${targetSubreddit}...`);
    const redditPostUrl = await postToReddit(
      targetSubreddit,
      postTitle,
      redgifsUrl,
      true // NSFW flag always true
    );

    console.log(`[Queue] Reddit post created: ${redditPostUrl}`);

    // Update post status to posted
    await db
      .update(posts)
      .set({
        status: "posted",
        postUrl: redditPostUrl,
        postedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    console.log(`[Queue] Post ${postId} completed successfully`);
  } catch (error) {
    console.error(`[Queue] Error processing post ${postId}:`, error);

    // Update post status to failed
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await db
      .update(posts)
      .set({
        status: "failed",
        errorMessage,
      })
      .where(eq(posts.id, postId));
  }
}
