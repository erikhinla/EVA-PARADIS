import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getSupabaseClient } from "./_core/supabase";
import { uploadToRedGifs } from "./redgifs";
import { postToReddit } from "./reddit";
import { getPublishingMode } from "./mode";
import type { Asset, Post, InsertPost } from "../shared/types";

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
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * Get target subreddit from concept tag
 */
function getTargetSubreddit(conceptTag: string, customSubreddit?: string): string {
  if (customSubreddit) {
    return customSubreddit.replace(/^r\//, "");
  }
  const subreddits = CONCEPT_SUBREDDITS[conceptTag.toUpperCase()];
  if (!subreddits || subreddits.length === 0) {
    return "TransGoneWild";
  }
  return subreddits[0];
}

/**
 * Queue router — handles post publishing orchestration
 * Now uses Supabase PostgreSQL instead of Drizzle/MySQL.
 */
export const queueRouter = router({
  /**
   * List all posts, newest first
   */
  list: publicProcedure.query(async (): Promise<Post[]> => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Queue] List failed:", error);
      throw new Error("Failed to list posts");
    }

    return (data ?? []) as Post[];
  }),

  /**
   * Get a single post by ID
   */
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }): Promise<Post> => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !data) {
        throw new Error("Post not found");
      }

      return data as Post;
    }),

  /**
   * Publish an asset to Reddit via RedGifs.
   * Orchestrates the full flow:
   * 1. Upload video to RedGifs (auto or manual)
   * 2. Generate Reddit title
   * 3. Post to Reddit (auto or manual)
   * 4. Track status throughout
   */
  publish: publicProcedure
    .input(
      z.object({
        assetId: z.number(),
        targetSubreddit: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      // Get the asset
      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("*")
        .eq("id", input.assetId)
        .single();

      if (assetError || !asset) {
        throw new Error("Asset not found");
      }

      // Generate title and determine subreddit
      const postTitle = generateTitle(asset.concept_name);
      const targetSubreddit = getTargetSubreddit(
        asset.concept_name,
        input.targetSubreddit
      );

      // Check publishing mode
      const mode = getPublishingMode();

      // Determine initial status based on mode
      let initialStatus: "queued" | "awaiting_redgifs_url" = "queued";
      if (mode.redgifs === "manual") {
        initialStatus = "awaiting_redgifs_url";
      }

      // Create post record
      const newPost: InsertPost = {
        asset_id: input.assetId,
        platform: "reddit",
        target_subreddit: targetSubreddit,
        post_title: postTitle,
        status: initialStatus,
      };

      const { data: insertedPost, error: insertError } = await supabase
        .from("posts")
        .insert(newPost)
        .select("id")
        .single();

      if (insertError || !insertedPost) {
        console.error("[Queue] Insert failed:", insertError);
        throw new Error("Failed to create post record");
      }

      const postId = insertedPost.id;

      // If auto mode, start async processing
      if (mode.redgifs === "auto" && mode.reddit === "auto") {
        processPost(postId, asset as Asset, postTitle, targetSubreddit).catch(
          (error) => {
            console.error(`[Queue] Failed to process post ${postId}:`, error);
          }
        );

        return {
          postId,
          status: "queued",
          postTitle,
          targetSubreddit,
          mode: "auto" as const,
        };
      }

      // Manual mode — return the post package for the user
      return {
        postId,
        status: initialStatus,
        postTitle,
        targetSubreddit,
        mode: "manual" as const,
        step: mode.redgifs === "manual" ? "redgifs" : "reddit",
        message:
          mode.redgifs === "manual"
            ? "Upload video to RedGifs and paste URL below"
            : "Post to Reddit and paste permalink below",
      };
    }),

  /**
   * Get posts for a specific asset
   */
  getByAsset: publicProcedure
    .input(z.object({ assetId: z.number() }))
    .query(async ({ input }): Promise<Post[]> => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("asset_id", input.assetId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to get posts for asset");
      }

      return (data ?? []) as Post[];
    }),

  /**
   * Get current publishing mode (auto or manual)
   */
  getPublishingMode: publicProcedure.query(() => {
    return getPublishingMode();
  }),

  /**
   * Save RedGifs URL (manual mode).
   * Eva pastes the RedGifs URL after manual upload.
   */
  saveRedGifsUrl: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        redgifsUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      // Validate URL contains redgifs.com
      if (!input.redgifsUrl.includes("redgifs.com")) {
        throw new Error("Invalid RedGifs URL — must contain redgifs.com");
      }

      // Get the post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", input.postId)
        .single();

      if (postError || !post) {
        throw new Error("Post not found");
      }

      // Update asset with RedGifs URL
      await supabase
        .from("assets")
        .update({ redgifs_url: input.redgifsUrl })
        .eq("id", post.asset_id);

      // Update post status to awaiting Reddit post
      await supabase
        .from("posts")
        .update({ status: "awaiting_reddit_post" })
        .eq("id", input.postId);

      // Return the post package for manual Reddit posting
      return {
        success: true,
        postPackage: {
          title: post.post_title || "",
          url: input.redgifsUrl,
          subreddit: post.target_subreddit || "",
          nsfw: true,
        },
      };
    }),

  /**
   * Save Reddit permalink (manual mode).
   * Eva pastes the Reddit permalink after manual posting.
   */
  saveRedditPermalink: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        redditUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();

      // Validate URL contains reddit.com
      if (!input.redditUrl.includes("reddit.com")) {
        throw new Error("Invalid Reddit URL — must contain reddit.com");
      }

      // Update post with Reddit URL and mark as posted
      const { error } = await supabase
        .from("posts")
        .update({
          post_url: input.redditUrl,
          status: "posted",
          posted_at: new Date().toISOString(),
        })
        .eq("id", input.postId);

      if (error) {
        throw new Error("Failed to save Reddit permalink");
      }

      return { success: true };
    }),
});

/**
 * Process a post asynchronously (auto mode only).
 * Uploads to RedGifs and posts to Reddit.
 */
async function processPost(
  postId: number,
  asset: Asset,
  postTitle: string,
  targetSubreddit: string
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    // Update status to uploading_redgifs
    await supabase
      .from("posts")
      .update({ status: "uploading_redgifs" })
      .eq("id", postId);

    // Step 1: Upload to RedGifs if not already uploaded
    let redgifsUrl = asset.redgifs_url;
    if (!redgifsUrl) {
      console.log(`[Queue] Uploading asset ${asset.id} to RedGifs...`);
      redgifsUrl = await uploadToRedGifs(
        asset.file_url,
        postTitle,
        [asset.concept_name]
      );

      // Update asset with RedGifs URL
      await supabase
        .from("assets")
        .update({ redgifs_url: redgifsUrl })
        .eq("id", asset.id);

      console.log(`[Queue] RedGifs upload complete: ${redgifsUrl}`);
    }

    // Update status to posting_reddit
    await supabase
      .from("posts")
      .update({ status: "posting_reddit" })
      .eq("id", postId);

    // Step 2: Post to Reddit
    console.log(`[Queue] Posting to r/${targetSubreddit}...`);
    const redditPostUrl = await postToReddit(
      targetSubreddit,
      postTitle,
      redgifsUrl,
      true
    );

    console.log(`[Queue] Reddit post created: ${redditPostUrl}`);

    // Update post status to posted
    await supabase
      .from("posts")
      .update({
        status: "posted",
        post_url: redditPostUrl,
        posted_at: new Date().toISOString(),
      })
      .eq("id", postId);

    console.log(`[Queue] Post ${postId} completed successfully`);
  } catch (error) {
    console.error(`[Queue] Error processing post ${postId}:`, error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await supabase
      .from("posts")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", postId);
  }
}
