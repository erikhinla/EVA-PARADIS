// server/vercel-entry.ts
import dotenv from "dotenv";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  // Forge platform (LLM, image gen, notifications, etc.)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/assetsRouter.ts
import { z as z2 } from "zod";

// server/_core/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabase = null;
function ensureEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      throw new Error("Missing required environment variable: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
    }
    const serviceRoleKey = ensureEnv("SUPABASE_SERVICE_ROLE_KEY");
    supabase = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false
      }
    });
  }
  return supabase;
}

// server/storage.ts
var BUCKET = "eva-assets";
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const supabase2 = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");
  let blob;
  if (typeof data === "string") {
    blob = new Blob([data], { type: contentType });
  } else {
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    blob = new Blob([ab], { type: contentType });
  }
  const { error } = await supabase2.storage.from(BUCKET).upload(key, blob, {
    contentType,
    upsert: true
    // Overwrite if exists
  });
  if (error) {
    console.error("[Storage] Upload failed:", error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  const { data: urlData } = supabase2.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: urlData.publicUrl };
}
async function storageDelete(relKey) {
  const supabase2 = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");
  const { error } = await supabase2.storage.from(BUCKET).remove([key]);
  if (error) {
    console.error("[Storage] Delete failed:", error);
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}

// server/assetsRouter.ts
var BUCKET2 = "eva-assets";
var assetsRouter = router({
  /**
   * List all assets, newest first
   */
  list: publicProcedure.query(async () => {
    const supabase2 = getSupabaseClient();
    const { data, error } = await supabase2.from("assets").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[Assets] List failed:", error);
      throw new Error("Failed to list assets");
    }
    return data ?? [];
  }),
  /**
   * Get a single asset by ID
   */
  get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { data, error } = await supabase2.from("assets").select("*").eq("id", input.id).single();
    if (error || !data) {
      throw new Error("Asset not found");
    }
    return data;
  }),
  /**
   * Upload a new asset.
   * Accepts base64-encoded file data, stores it in Supabase Storage,
   * and creates a database record.
   */
  upload: publicProcedure.input(
    z2.object({
      fileName: z2.string(),
      fileType: z2.string(),
      fileData: z2.string(),
      // base64 encoded
      conceptName: z2.string()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    const timestamp = Date.now();
    const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `assets/${timestamp}-${sanitizedName}`;
    const { url: fileUrl } = await storagePut(fileKey, buffer, input.fileType);
    const newAsset = {
      file_key: fileKey,
      file_url: fileUrl,
      file_name: input.fileName,
      file_type: input.fileType,
      file_size: fileSize,
      concept_name: input.conceptName,
      status: "ready",
      storage_path: fileKey
    };
    const { data, error } = await supabase2.from("assets").insert(newAsset).select("id").single();
    if (error) {
      console.error("[Assets] Insert failed:", error);
      throw new Error("Failed to create asset record");
    }
    return {
      id: data.id,
      fileUrl,
      fileKey
    };
  }),
  /**
   * Get a presigned upload URL for direct browser-to-Supabase uploads.
   * Use this for large files to bypass Vercel's 4.5MB body limit.
   * Flow: 1) Call getUploadUrl 2) PUT file directly to Supabase 3) Call confirmUpload
   */
  getUploadUrl: publicProcedure.input(
    z2.object({
      fileName: z2.string(),
      fileType: z2.string(),
      conceptName: z2.string()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const timestamp = Date.now();
    const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `assets/${timestamp}-${sanitizedName}`;
    const { data, error } = await supabase2.storage.from(BUCKET2).createSignedUploadUrl(fileKey);
    if (error) {
      console.error("[Assets] Signed URL failed:", error);
      throw new Error("Failed to create upload URL");
    }
    return {
      signedUrl: data.signedUrl,
      token: data.token,
      fileKey,
      fileType: input.fileType,
      conceptName: input.conceptName
    };
  }),
  /**
   * Confirm an upload after the file has been uploaded directly to Supabase Storage.
   * Creates the database record.
   */
  confirmUpload: publicProcedure.input(
    z2.object({
      fileKey: z2.string(),
      fileName: z2.string(),
      fileType: z2.string(),
      fileSize: z2.number(),
      conceptName: z2.string()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { data: urlData } = supabase2.storage.from(BUCKET2).getPublicUrl(input.fileKey);
    const newAsset = {
      file_key: input.fileKey,
      file_url: urlData.publicUrl,
      file_name: input.fileName,
      file_type: input.fileType,
      file_size: input.fileSize,
      concept_name: input.conceptName,
      status: "ready",
      storage_path: input.fileKey
    };
    const { data, error } = await supabase2.from("assets").insert(newAsset).select("id").single();
    if (error) {
      console.error("[Assets] Insert failed:", error);
      throw new Error("Failed to create asset record");
    }
    return {
      id: data.id,
      fileUrl: urlData.publicUrl,
      fileKey: input.fileKey
    };
  }),
  /**
   * Update asset status
   */
  updateStatus: publicProcedure.input(
    z2.object({
      id: z2.number(),
      status: z2.enum(["pending", "processing", "ready", "failed"])
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { error } = await supabase2.from("assets").update({ status: input.status }).eq("id", input.id);
    if (error) {
      throw new Error("Failed to update asset status");
    }
    return { success: true };
  }),
  /**
   * Update RedGifs URL for an asset
   */
  updateRedGifsUrl: publicProcedure.input(
    z2.object({
      id: z2.number(),
      redgifsUrl: z2.string()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { error } = await supabase2.from("assets").update({ redgifs_url: input.redgifsUrl }).eq("id", input.id);
    if (error) {
      throw new Error("Failed to update RedGifs URL");
    }
    return { success: true };
  }),
  /**
   * Delete an asset (removes from both DB and Storage)
   */
  delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { data: asset } = await supabase2.from("assets").select("storage_path, file_key").eq("id", input.id).single();
    const { error } = await supabase2.from("assets").delete().eq("id", input.id);
    if (error) {
      throw new Error("Failed to delete asset");
    }
    if (asset?.storage_path) {
      try {
        await storageDelete(asset.storage_path);
      } catch (e) {
        console.warn("[Assets] Storage cleanup failed:", e);
      }
    }
    return { success: true };
  })
});

// server/queueRouter.ts
import { z as z3 } from "zod";

// server/redgifs.ts
async function uploadToRedGifs(_videoUrl, _title, _tags = []) {
  console.warn("[RedGifs] API access unavailable \u2014 upload skipped");
  return "";
}

// server/reddit.ts
async function postToReddit(_subreddit, _title, _url, _nsfw = true) {
  console.warn("[Reddit] API access unavailable \u2014 post skipped");
  return "";
}

// server/mode.ts
function getPublishingMode() {
  const hasRedGifs = !!(process.env.REDGIFS_API_KEY || process.env.REDGIFS_ACCESS_TOKEN);
  const hasReddit = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET && process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD);
  return {
    redgifs: hasRedGifs ? "auto" : "manual",
    reddit: hasReddit ? "auto" : "manual"
  };
}

// server/queueRouter.ts
var CONCEPT_TITLE_PATTERNS = {
  DOMINANCE_WORSHIP: [
    "Think you're worthy?",
    "POV: admiring your queen",
    "Can you handle this energy?"
  ],
  HARDCORE_GROUP: [
    "Who wants to be next?",
    "Ready for this?",
    "Think you could keep up?"
  ],
  ANATOMY_SOLO: [
    "Can you handle this?",
    "What would you do?",
    "Rate this"
  ]
};
var CONCEPT_SUBREDDITS = {
  DOMINANCE_WORSHIP: ["TransGoneWild", "Tgirls", "TransPorn"],
  HARDCORE_GROUP: ["TransGoneWild", "GroupSex"],
  ANATOMY_SOLO: ["TransGoneWild", "Tgirls", "TransPorn"]
};
function generateTitle(conceptTag) {
  const patterns = CONCEPT_TITLE_PATTERNS[conceptTag.toUpperCase()];
  if (!patterns || patterns.length === 0) {
    return "Check this out";
  }
  return patterns[Math.floor(Math.random() * patterns.length)];
}
function getTargetSubreddit(conceptTag, customSubreddit) {
  if (customSubreddit) {
    return customSubreddit.replace(/^r\//, "");
  }
  const subreddits = CONCEPT_SUBREDDITS[conceptTag.toUpperCase()];
  if (!subreddits || subreddits.length === 0) {
    return "TransGoneWild";
  }
  return subreddits[0];
}
var queueRouter = router({
  /**
   * List all posts, newest first
   */
  list: publicProcedure.query(async () => {
    const supabase2 = getSupabaseClient();
    const { data, error } = await supabase2.from("posts").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[Queue] List failed:", error);
      throw new Error("Failed to list posts");
    }
    return data ?? [];
  }),
  /**
   * Get a single post by ID
   */
  get: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { data, error } = await supabase2.from("posts").select("*").eq("id", input.id).single();
    if (error || !data) {
      throw new Error("Post not found");
    }
    return data;
  }),
  /**
   * Publish an asset to Reddit via RedGifs.
   * Orchestrates the full flow:
   * 1. Upload video to RedGifs (auto or manual)
   * 2. Generate Reddit title
   * 3. Post to Reddit (auto or manual)
   * 4. Track status throughout
   */
  publish: publicProcedure.input(
    z3.object({
      assetId: z3.number(),
      targetSubreddit: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { data: asset, error: assetError } = await supabase2.from("assets").select("*").eq("id", input.assetId).single();
    if (assetError || !asset) {
      throw new Error("Asset not found");
    }
    const postTitle = generateTitle(asset.concept_name);
    const targetSubreddit = getTargetSubreddit(
      asset.concept_name,
      input.targetSubreddit
    );
    const mode = getPublishingMode();
    let initialStatus = "queued";
    if (mode.redgifs === "manual") {
      initialStatus = "awaiting_redgifs_url";
    }
    const newPost = {
      asset_id: input.assetId,
      platform: "reddit",
      target_subreddit: targetSubreddit,
      post_title: postTitle,
      status: initialStatus
    };
    const { data: insertedPost, error: insertError } = await supabase2.from("posts").insert(newPost).select("id").single();
    if (insertError || !insertedPost) {
      console.error("[Queue] Insert failed:", insertError);
      throw new Error("Failed to create post record");
    }
    const postId = insertedPost.id;
    if (mode.redgifs === "auto" && mode.reddit === "auto") {
      processPost(postId, asset, postTitle, targetSubreddit).catch(
        (error) => {
          console.error(`[Queue] Failed to process post ${postId}:`, error);
        }
      );
      return {
        postId,
        status: "queued",
        postTitle,
        targetSubreddit,
        mode: "auto"
      };
    }
    return {
      postId,
      status: initialStatus,
      postTitle,
      targetSubreddit,
      mode: "manual",
      step: mode.redgifs === "manual" ? "redgifs" : "reddit",
      message: mode.redgifs === "manual" ? "Upload video to RedGifs and paste URL below" : "Post to Reddit and paste permalink below"
    };
  }),
  /**
   * Get posts for a specific asset
   */
  getByAsset: publicProcedure.input(z3.object({ assetId: z3.number() })).query(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const { data, error } = await supabase2.from("posts").select("*").eq("asset_id", input.assetId).order("created_at", { ascending: false });
    if (error) {
      throw new Error("Failed to get posts for asset");
    }
    return data ?? [];
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
  saveRedGifsUrl: publicProcedure.input(
    z3.object({
      postId: z3.number(),
      redgifsUrl: z3.string().url()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    if (!input.redgifsUrl.includes("redgifs.com")) {
      throw new Error("Invalid RedGifs URL \u2014 must contain redgifs.com");
    }
    const { data: post, error: postError } = await supabase2.from("posts").select("*").eq("id", input.postId).single();
    if (postError || !post) {
      throw new Error("Post not found");
    }
    await supabase2.from("assets").update({ redgifs_url: input.redgifsUrl }).eq("id", post.asset_id);
    await supabase2.from("posts").update({ status: "awaiting_reddit_post" }).eq("id", input.postId);
    return {
      success: true,
      postPackage: {
        title: post.post_title || "",
        url: input.redgifsUrl,
        subreddit: post.target_subreddit || "",
        nsfw: true
      }
    };
  }),
  /**
   * Save Reddit permalink (manual mode).
   * Eva pastes the Reddit permalink after manual posting.
   */
  saveRedditPermalink: publicProcedure.input(
    z3.object({
      postId: z3.number(),
      redditUrl: z3.string().url()
    })
  ).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    if (!input.redditUrl.includes("reddit.com")) {
      throw new Error("Invalid Reddit URL \u2014 must contain reddit.com");
    }
    const { error } = await supabase2.from("posts").update({
      post_url: input.redditUrl,
      status: "posted",
      posted_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", input.postId);
    if (error) {
      throw new Error("Failed to save Reddit permalink");
    }
    return { success: true };
  })
});
async function processPost(postId, asset, postTitle, targetSubreddit) {
  const supabase2 = getSupabaseClient();
  try {
    await supabase2.from("posts").update({ status: "uploading_redgifs" }).eq("id", postId);
    let redgifsUrl = asset.redgifs_url;
    if (!redgifsUrl) {
      console.log(`[Queue] Uploading asset ${asset.id} to RedGifs...`);
      redgifsUrl = await uploadToRedGifs(
        asset.file_url,
        postTitle,
        [asset.concept_name]
      );
      await supabase2.from("assets").update({ redgifs_url: redgifsUrl }).eq("id", asset.id);
      console.log(`[Queue] RedGifs upload complete: ${redgifsUrl}`);
    }
    await supabase2.from("posts").update({ status: "posting_reddit" }).eq("id", postId);
    console.log(`[Queue] Posting to r/${targetSubreddit}...`);
    const redditPostUrl = await postToReddit(
      targetSubreddit,
      postTitle,
      redgifsUrl,
      true
    );
    console.log(`[Queue] Reddit post created: ${redditPostUrl}`);
    await supabase2.from("posts").update({
      status: "posted",
      post_url: redditPostUrl,
      posted_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", postId);
    console.log(`[Queue] Post ${postId} completed successfully`);
  } catch (error) {
    console.error(`[Queue] Error processing post ${postId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await supabase2.from("posts").update({
      status: "failed",
      error_message: errorMessage
    }).eq("id", postId);
  }
}

// server/diagnosticsRouter.ts
import { z as z4 } from "zod";
var MONITORED_LINKS = [
  { key: "onlyfans", label: "OnlyFans Profile", url: "https://onlyfans.com/evaparadis" },
  { key: "bridge", label: "Bridge Page (net)", url: "https://evaparadis.net" },
  { key: "relay", label: "IG Relay (/go)", url: "https://evaparadis.net/go" },
  { key: "out", label: "Redirect Page (/out)", url: "https://evaparadis.net/out" }
];
async function traceRedirects(targetUrl, userAgent) {
  const chain = [];
  let current = targetUrl;
  const MAX_HOPS = 10;
  const start = Date.now();
  let finalContentType = null;
  let sslValid = targetUrl.startsWith("https");
  try {
    for (let i = 0; i < MAX_HOPS; i++) {
      const isHttps = current.startsWith("https");
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent": userAgent ?? "Mozilla/5.0 (compatible; EvaDiagBot/1.0)",
          Accept: "text/html,application/xhtml+xml"
        },
        signal: AbortSignal.timeout(1e4)
      });
      const contentType = res.headers.get("content-type");
      finalContentType = contentType;
      chain.push({
        url: current,
        status: res.status,
        contentType,
        isHttps
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        current = new URL(location, current).href;
        continue;
      }
      return {
        finalStatus: res.status,
        statusText: res.statusText || httpStatusLabel(res.status),
        chain,
        error: null,
        elapsed: Date.now() - start,
        contentType: finalContentType,
        isHttps,
        sslValid: isHttps
        // Simple check; true if we reached here on https
      };
    }
    return {
      finalStatus: chain[chain.length - 1]?.status ?? 0,
      statusText: "Too many redirects",
      chain,
      error: `Exceeded ${MAX_HOPS} redirect hops`,
      elapsed: Date.now() - start,
      contentType: finalContentType,
      isHttps: current.startsWith("https"),
      sslValid: current.startsWith("https")
    };
  } catch (err) {
    return {
      finalStatus: 0,
      statusText: "Connection failed",
      chain,
      error: err?.message ?? String(err),
      elapsed: Date.now() - start,
      contentType: finalContentType,
      isHttps: current.startsWith("https"),
      sslValid: false
    };
  }
}
async function fetchIgPreview(targetUrl) {
  const IG_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 302.0.0.0.64";
  const start = Date.now();
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": IG_UA,
        Accept: "text/html,application/xhtml+xml"
      },
      signal: AbortSignal.timeout(1e4)
    });
    const html = await res.text();
    const elapsed = Date.now() - start;
    const ogTitle = extractMeta(html, "og:title");
    const ogImage = extractMeta(html, "og:image");
    const ogDescription = extractMeta(html, "og:description");
    return {
      url: targetUrl,
      status: res.status,
      statusText: res.statusText || httpStatusLabel(res.status),
      ogTitle,
      ogImage,
      ogDescription,
      error: null,
      responseTimeMs: elapsed
    };
  } catch (err) {
    return {
      url: targetUrl,
      status: null,
      statusText: "Connection failed",
      ogTitle: null,
      ogImage: null,
      ogDescription: null,
      error: err?.message ?? String(err),
      responseTimeMs: Date.now() - start
    };
  }
}
function extractMeta(html, property) {
  const regex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const match = regex.exec(html);
  if (match) return match[1];
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
    "i"
  );
  const match2 = regex2.exec(html);
  return match2 ? match2[1] : null;
}
function httpStatusLabel(code) {
  const labels = {
    200: "OK",
    301: "Moved Permanently",
    302: "Found (Redirect)",
    303: "See Other",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable"
  };
  return labels[code] ?? `HTTP ${code}`;
}
var lastClickLog = null;
var diagnosticsRouter = router({
  /**
   * Check all monitored links — HTTP status + redirect chain.
   */
  checkLinks: publicProcedure.query(async () => {
    const results = await Promise.all(
      MONITORED_LINKS.map(async (link) => {
        const { finalStatus, statusText, chain, error, elapsed, contentType, isHttps, sslValid } = await traceRedirects(link.url);
        return {
          key: link.key,
          label: link.label,
          url: link.url,
          status: finalStatus || null,
          statusText,
          redirectChain: chain,
          responseTimeMs: elapsed,
          error,
          contentType,
          isHttps,
          sslValid
        };
      })
    );
    return results;
  }),
  /**
   * Check a single link by URL (for ad-hoc testing).
   */
  checkSingleLink: publicProcedure.input(z4.object({ url: z4.string().url() })).query(async ({ input }) => {
    const { finalStatus, statusText, chain, error, elapsed, contentType, isHttps, sslValid } = await traceRedirects(input.url);
    return {
      key: "custom",
      label: "Custom URL",
      url: input.url,
      status: finalStatus || null,
      statusText,
      redirectChain: chain,
      responseTimeMs: elapsed,
      error,
      contentType,
      isHttps,
      sslValid
    };
  }),
  /**
   * Simulate how Instagram previews the bridge page (OG tags).
   */
  igPreview: publicProcedure.query(async () => {
    const bridgeUrl = process.env.SITE_URL ?? "https://evaparadis.net";
    return fetchIgPreview(bridgeUrl);
  }),
  /**
   * Test IG flow: fetch with IG user-agent, return status + OG + redirect chain.
   */
  testIgFlow: publicProcedure.mutation(async () => {
    const bridgeUrl = process.env.SITE_URL ?? "https://evaparadis.net";
    const relayUrl = `${bridgeUrl}/go`;
    const IG_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 302.0.0.0.64";
    const [redirectResult, preview] = await Promise.all([
      traceRedirects(relayUrl, IG_UA),
      fetchIgPreview(bridgeUrl)
    ]);
    return {
      redirectChain: redirectResult.chain,
      finalStatus: redirectResult.finalStatus,
      statusText: redirectResult.statusText,
      elapsed: redirectResult.elapsed,
      error: redirectResult.error,
      contentType: redirectResult.contentType,
      isHttps: redirectResult.isHttps,
      sslValid: redirectResult.sslValid,
      ogTitle: preview.ogTitle,
      ogImage: preview.ogImage,
      ogDescription: preview.ogDescription
    };
  }),
  /**
   * Log a click event (called from the bridge page).
   */
  logClick: publicProcedure.input(
    z4.object({
      url: z4.string(),
      source: z4.string().optional()
    })
  ).mutation(({ input }) => {
    lastClickLog = {
      url: input.url,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: input.source ?? "unknown"
    };
    return { success: true };
  }),
  /**
   * Get last successful click log.
   */
  getLastClick: publicProcedure.query(() => {
    return lastClickLog;
  })
});

// server/analyticsRouter.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z5 } from "zod";
var bridgeEventInput = z5.object({
  eventType: z5.enum(["visit", "of_click", "cta_click"]).default("visit"),
  utmSource: z5.string().optional(),
  utmMedium: z5.string().optional(),
  utmCampaign: z5.string().optional(),
  referrer: z5.string().optional(),
  sessionId: z5.string().optional(),
  path: z5.string().optional(),
  userAgent: z5.string().optional()
});
var emailSignupInput = z5.object({
  email: z5.string().email(),
  phone: z5.string().optional(),
  source: z5.string().default("bridge_return"),
  utmSource: z5.string().optional(),
  utmMedium: z5.string().optional(),
  utmCampaign: z5.string().optional(),
  referrer: z5.string().optional()
});
function maybeString(value) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
var analyticsRouter = router({
  trackBridgeEvent: publicProcedure.input(bridgeEventInput).mutation(async ({ input, ctx }) => {
    const supabase2 = getSupabaseClient();
    const ipAddress = ctx.req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? ctx.req.socket.remoteAddress ?? null;
    const { error } = await supabase2.from("bridge_events").insert({
      event_type: input.eventType,
      utm_source: maybeString(input.utmSource),
      utm_medium: maybeString(input.utmMedium),
      utm_campaign: maybeString(input.utmCampaign),
      referrer: maybeString(input.referrer ?? ctx.req.get("referer") ?? null),
      session_id: maybeString(input.sessionId),
      path: maybeString(input.path ?? ctx.req.path),
      user_agent: maybeString(input.userAgent ?? ctx.req.headers["user-agent"]),
      ip_address: ipAddress
    });
    if (error) {
      console.error("[analytics] trackBridgeEvent failed", error);
      throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record bridge event" });
    }
    return { success: true };
  }),
  emailSignup: publicProcedure.input(emailSignupInput).mutation(async ({ input }) => {
    const supabase2 = getSupabaseClient();
    const email = input.email.trim().toLowerCase();
    const payload = {
      email,
      phone: maybeString(input.phone),
      utm_source: maybeString(input.source) ?? maybeString(input.utmSource) ?? "bridge_return",
      utm_medium: maybeString(input.utmMedium),
      utm_campaign: maybeString(input.utmCampaign),
      referrer: maybeString(input.referrer)
    };
    const { data, error } = await supabase2.from("leads").upsert(payload, { onConflict: "email" }).select("id").single();
    if (error) {
      console.error("[analytics] emailSignup failed", error);
      throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save lead" });
    }
    return { success: true, id: data?.id ?? null };
  }),
  leadsStats: publicProcedure.query(async () => {
    const supabase2 = getSupabaseClient();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
    const [totalResult, weekResult, recentResult] = await Promise.all([
      supabase2.from("leads").select("id", { count: "exact", head: true }),
      supabase2.from("leads").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo),
      supabase2.from("leads").select("id, email, utm_source, created_at").order("created_at", { ascending: false }).limit(20)
    ]);
    if (totalResult.error || weekResult.error || recentResult.error) {
      console.error("[analytics] leadsStats failed", {
        totalError: totalResult.error,
        weekError: weekResult.error,
        recentError: recentResult.error
      });
      throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load lead stats" });
    }
    return {
      total_signups: totalResult.count ?? 0,
      this_week_signups: weekResult.count ?? 0,
      recent_leads: (recentResult.data ?? []).map((lead) => ({
        id: lead.id,
        email: lead.email,
        source: lead.utm_source,
        captured_at: lead.created_at
      }))
    };
  }),
  getSnapshot: publicProcedure.query(async () => {
    const supabase2 = getSupabaseClient();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
    const [leadsResult, visitResult, clickResult, weeklyLeadsResult] = await Promise.all([
      supabase2.from("leads").select("id", { count: "exact", head: true }),
      supabase2.from("bridge_events").select("id", { count: "exact", head: true }).in("event_type", ["visit", "page_view"]),
      supabase2.from("bridge_events").select("id", { count: "exact", head: true }).in("event_type", ["of_click", "cta_click"]),
      supabase2.from("leads").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo)
    ]);
    if (leadsResult.error || visitResult.error || clickResult.error) {
      console.error("[analytics] snapshot failed", {
        leadsError: leadsResult.error,
        visitError: visitResult.error,
        clickError: clickResult.error
      });
      throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load analytics" });
    }
    const visits = visitResult.count ?? 0;
    const clicks = clickResult.count ?? 0;
    const leads = leadsResult.count ?? 0;
    const weeklySignups = weeklyLeadsResult.count ?? 0;
    const conversionRate = visits === 0 ? 0 : Number((leads / visits * 100).toFixed(1));
    return {
      metrics: {
        totalVisits: visits,
        uniqueVisitors: visits,
        ofClicks: clicks,
        conversions: leads,
        conversionRate,
        avgTimeOnPage: "0:00",
        bounceRate: 0,
        dmsSent: 0,
        dmResponses: 0,
        emailSignups: leads
      },
      trafficSources: [],
      dmMetrics: {
        reddit: { sent: 0, responses: 0, rate: 0 },
        instagram: { sent: 0, responses: 0, rate: 0 },
        x: { sent: 0, responses: 0, rate: 0 }
      },
      email: {
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        weeklySignups
      },
      summaryItems: [
        {
          key: "bridge_visits",
          label: "Bridge Visits",
          value: visits.toLocaleString(),
          detail: "Lifetime tracked visits"
        },
        {
          key: "email_signups",
          label: "Email Signups",
          value: leads.toLocaleString(),
          detail: "Captured via bridge"
        },
        {
          key: "conversion_rate",
          label: "Conversion Rate",
          value: `${conversionRate}%`,
          detail: visits > 0 ? "Signups / visits" : "Collect more data"
        }
      ]
    };
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Content management and publishing
  assets: assetsRouter,
  queue: queueRouter,
  // Link diagnostics
  diagnostics: diagnosticsRouter,
  // Supabase-backed analytics + lead capture
  analytics: analyticsRouter
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
async function upsertUser(user) {
  if (!user.open_id) {
    throw new Error("User open_id is required for upsert");
  }
  const supabase2 = getSupabaseClient();
  const record = {
    open_id: user.open_id,
    last_signed_in: user.last_signed_in ?? (/* @__PURE__ */ new Date()).toISOString()
  };
  if (user.name !== void 0) record.name = user.name;
  if (user.email !== void 0) record.email = user.email;
  if (user.login_method !== void 0) record.login_method = user.login_method;
  if (user.role !== void 0) record.role = user.role;
  const { error } = await supabase2.from("users").upsert(record, { onConflict: "open_id" });
  if (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const supabase2 = getSupabaseClient();
  const { data, error } = await supabase2.from("users").select("*").eq("open_id", openId).limit(1).single();
  if (error && error.code !== "PGRST116") {
    console.error("[Database] Failed to get user:", error);
    return void 0;
  }
  return data ?? void 0;
}

// server/_core/sdk.ts
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          open_id: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          login_method: userInfo.loginMethod ?? userInfo.platform ?? null,
          last_signed_in: signedInAt.toISOString()
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      open_id: user.open_id,
      last_signed_in: signedInAt.toISOString()
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vercel-entry.ts
dotenv.config({ path: ".env.local", override: true });
dotenv.config();
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/go", (req, res) => {
  const bridgeUrl = process.env.SITE_URL ?? `${req.protocol}://${req.get("host")}`;
  const target = new URL("/", bridgeUrl);
  Object.entries(req.query).forEach(([key, value]) => {
    if (typeof value === "string") target.searchParams.set(key, value);
  });
  if (!target.searchParams.has("utm_source")) {
    target.searchParams.set("utm_source", "instagram");
  }
  if (!target.searchParams.has("utm_medium")) {
    target.searchParams.set("utm_medium", "dm");
  }
  res.redirect(302, target.toString());
});
app.get("/go/of", (req, res) => {
  const d = [
    String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47),
    String.fromCharCode(111, 110, 108, 121, 102, 97, 110, 115),
    String.fromCharCode(46, 99, 111, 109, 47),
    String.fromCharCode(101, 118, 97, 112, 97, 114, 97, 100, 105, 115)
  ].join("");
  const target = new URL(d);
  Object.entries(req.query).forEach(([key, value]) => {
    if (typeof value === "string") target.searchParams.set(key, value);
  });
  res.redirect(302, target.toString());
});
app.get("/api/oauth/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : void 0;
  const state = typeof req.query.state === "string" ? req.query.state : void 0;
  if (!code || !state) {
    res.status(400).json({ error: "code and state are required" });
    return;
  }
  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    if (!userInfo.openId) {
      res.status(400).json({ error: "openId missing from user info" });
      return;
    }
    await upsertUser({
      open_id: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      login_method: userInfo.loginMethod ?? userInfo.platform ?? null,
      last_signed_in: (/* @__PURE__ */ new Date()).toISOString()
    });
    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS
    });
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.redirect(302, "/");
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    res.status(500).json({ error: "OAuth callback failed" });
  }
});
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};
