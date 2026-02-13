// server/vercel-entry.ts
import "dotenv/config";
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
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
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
import { eq as eq2, desc } from "drizzle-orm";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  // S3 file key
  fileUrl: text("fileUrl").notNull(),
  // S3 public URL
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(),
  // MIME type
  fileSize: int("fileSize").notNull(),
  // bytes
  conceptName: varchar("conceptName", { length: 255 }).notNull(),
  // tagging/categorization
  status: mysqlEnum("status", ["pending", "processing", "ready", "failed"]).default("pending").notNull(),
  redgifsUrl: text("redgifsUrl"),
  // RedGifs hosted URL after upload
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("assetId").notNull().references(() => assets.id),
  platform: mysqlEnum("platform", ["reddit", "instagram"]).notNull(),
  targetSubreddit: varchar("targetSubreddit", { length: 255 }),
  // for Reddit
  postTitle: text("postTitle"),
  postUrl: text("postUrl"),
  // URL to posted content
  status: mysqlEnum("status", [
    "queued",
    "awaiting_redgifs_url",
    "uploading_redgifs",
    "awaiting_reddit_post",
    "posting_reddit",
    "posted",
    "failed"
  ]).default("queued").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  // when to post
  postedAt: timestamp("postedAt"),
  // actual post time
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/assetsRouter.ts
var assetsRouter = router({
  /**
   * List all assets
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const allAssets = await db.select().from(assets).orderBy(desc(assets.createdAt));
    return allAssets;
  }),
  /**
   * Get a single asset by ID
   */
  get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const result = await db.select().from(assets).where(eq2(assets.id, input.id)).limit(1);
    if (result.length === 0) {
      throw new Error("Asset not found");
    }
    return result[0];
  }),
  /**
   * Upload a new asset
   * Accepts base64 encoded file data
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
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    const timestamp2 = Date.now();
    const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `assets/${timestamp2}-${sanitizedName}`;
    const { url: fileUrl } = await storagePut(fileKey, buffer, input.fileType);
    const newAsset = {
      fileKey,
      fileUrl,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize,
      conceptName: input.conceptName,
      status: "ready"
    };
    const result = await db.insert(assets).values(newAsset);
    return {
      id: result[0].insertId,
      fileUrl,
      fileKey
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
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    await db.update(assets).set({ status: input.status }).where(eq2(assets.id, input.id));
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
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    await db.update(assets).set({ redgifsUrl: input.redgifsUrl }).where(eq2(assets.id, input.id));
    return { success: true };
  }),
  /**
   * Delete an asset
   */
  delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    await db.delete(assets).where(eq2(assets.id, input.id));
    return { success: true };
  })
});

// server/queueRouter.ts
import { z as z3 } from "zod";
import { eq as eq3, desc as desc2 } from "drizzle-orm";

// server/redgifs.ts
import axios from "axios";
var cachedToken = null;
var tokenExpiry = 0;
async function getRedGifsToken(apiKey) {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  try {
    const response = await axios.post(
      "https://api.redgifs.com/v2/auth/temporary",
      {},
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: AXIOS_TIMEOUT_MS
      }
    );
    cachedToken = response.data.token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1e3;
    return cachedToken;
  } catch (error) {
    console.error("[RedGifs] Failed to get auth token:", error);
    throw new Error("Failed to authenticate with RedGifs");
  }
}
async function uploadToRedGifs(videoUrl, title, tags = []) {
  const apiKey = process.env.REDGIFS_API_KEY;
  if (!apiKey) {
    throw new Error("REDGIFS_API_KEY environment variable not set");
  }
  try {
    const token = await getRedGifsToken(apiKey);
    const response = await axios.post(
      "https://api.redgifs.com/v2/gifs",
      {
        url: videoUrl,
        title: title.substring(0, 100),
        // Max 100 chars
        tags: tags.slice(0, 5)
        // Max 5 tags
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: AXIOS_TIMEOUT_MS * 3
        // Longer timeout for upload processing
      }
    );
    return response.data.gif.urls.hd || response.data.url;
  } catch (error) {
    console.error("[RedGifs] Upload failed:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`RedGifs upload failed: ${error.response?.data?.message || error.message}`);
    }
    throw new Error("RedGifs upload failed");
  }
}

// server/reddit.ts
import axios2 from "axios";
var cachedToken2 = null;
var tokenExpiry2 = 0;
async function getRedditToken() {
  if (cachedToken2 && Date.now() < tokenExpiry2) {
    return cachedToken2;
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
    const response = await axios2.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "password",
        username,
        password
      }),
      {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "EvaParadis:v1.0.0 (by /u/evaparadis)"
        },
        timeout: AXIOS_TIMEOUT_MS
      }
    );
    cachedToken2 = response.data.access_token;
    tokenExpiry2 = Date.now() + (response.data.expires_in - 60) * 1e3;
    return cachedToken2;
  } catch (error) {
    console.error("[Reddit] Failed to get auth token:", error);
    if (axios2.isAxiosError(error)) {
      throw new Error(`Reddit auth failed: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to authenticate with Reddit");
  }
}
async function postToReddit(subreddit, title, url, nsfw = true) {
  try {
    const token = await getRedditToken();
    const response = await axios2.post(
      "https://oauth.reddit.com/api/submit",
      new URLSearchParams({
        sr: subreddit,
        kind: "link",
        title: title.substring(0, 300),
        // Reddit title max length
        url,
        nsfw: nsfw ? "true" : "false",
        sendreplies: "false"
        // Don't send reply notifications
      }),
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "EvaParadis:v1.0.0 (by /u/evaparadis)"
        },
        timeout: AXIOS_TIMEOUT_MS
      }
    );
    return response.data.json.data.url;
  } catch (error) {
    console.error("[Reddit] Post failed:", error);
    if (axios2.isAxiosError(error)) {
      const errorMsg = error.response?.data?.json?.errors?.[0]?.[1] || error.message;
      throw new Error(`Reddit post failed: ${errorMsg}`);
    }
    throw new Error("Reddit post failed");
  }
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
   * List all posts
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const allPosts = await db.select().from(posts).orderBy(desc2(posts.createdAt));
    return allPosts;
  }),
  /**
   * Get a single post by ID
   */
  get: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const result = await db.select().from(posts).where(eq3(posts.id, input.id)).limit(1);
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
  publish: publicProcedure.input(
    z3.object({
      assetId: z3.number(),
      targetSubreddit: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const assetResult = await db.select().from(assets).where(eq3(assets.id, input.assetId)).limit(1);
    if (assetResult.length === 0) {
      throw new Error("Asset not found");
    }
    const asset = assetResult[0];
    const postTitle = generateTitle(asset.conceptName);
    const targetSubreddit = getTargetSubreddit(
      asset.conceptName,
      input.targetSubreddit
    );
    const mode = getPublishingMode();
    let initialStatus = "queued";
    if (mode.redgifs === "manual") {
      initialStatus = "awaiting_redgifs_url";
    }
    const newPost = {
      assetId: input.assetId,
      platform: "reddit",
      targetSubreddit,
      postTitle,
      status: initialStatus
    };
    const insertResult = await db.insert(posts).values(newPost);
    const postId = insertResult[0].insertId;
    if (mode.redgifs === "auto" && mode.reddit === "auto") {
      processPost(postId, asset, postTitle, targetSubreddit).catch((error) => {
        console.error(`[Queue] Failed to process post ${postId}:`, error);
      });
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
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const result = await db.select().from(posts).where(eq3(posts.assetId, input.assetId)).orderBy(desc2(posts.createdAt));
    return result;
  }),
  /**
   * Get current publishing mode (auto or manual)
   */
  getPublishingMode: publicProcedure.query(() => {
    return getPublishingMode();
  }),
  /**
   * Save RedGifs URL (manual mode)
   * Eva pastes the RedGifs URL after manual upload
   */
  saveRedGifsUrl: publicProcedure.input(
    z3.object({
      postId: z3.number(),
      redgifsUrl: z3.string().url()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    if (!input.redgifsUrl.includes("redgifs.com")) {
      throw new Error("Invalid RedGifs URL - must contain redgifs.com");
    }
    const postResult = await db.select().from(posts).where(eq3(posts.id, input.postId)).limit(1);
    if (postResult.length === 0) {
      throw new Error("Post not found");
    }
    const post = postResult[0];
    const assetResult = await db.select().from(assets).where(eq3(assets.id, post.assetId)).limit(1);
    if (assetResult.length === 0) {
      throw new Error("Asset not found");
    }
    const asset = assetResult[0];
    await db.update(assets).set({ redgifsUrl: input.redgifsUrl }).where(eq3(assets.id, asset.id));
    await db.update(posts).set({ status: "awaiting_reddit_post" }).where(eq3(posts.id, input.postId));
    return {
      success: true,
      postPackage: {
        title: post.postTitle || "",
        url: input.redgifsUrl,
        subreddit: post.targetSubreddit || "",
        nsfw: true
      }
    };
  }),
  /**
   * Save Reddit permalink (manual mode)
   * Eva pastes the Reddit permalink after manual posting
   */
  saveRedditPermalink: publicProcedure.input(
    z3.object({
      postId: z3.number(),
      redditUrl: z3.string().url()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    if (!input.redditUrl.includes("reddit.com")) {
      throw new Error("Invalid Reddit URL - must contain reddit.com");
    }
    await db.update(posts).set({
      postUrl: input.redditUrl,
      status: "posted",
      postedAt: /* @__PURE__ */ new Date()
    }).where(eq3(posts.id, input.postId));
    return {
      success: true
    };
  })
});
async function processPost(postId, asset, postTitle, targetSubreddit) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(posts).set({ status: "uploading_redgifs" }).where(eq3(posts.id, postId));
    let redgifsUrl = asset.redgifsUrl;
    if (!redgifsUrl) {
      console.log(`[Queue] Uploading asset ${asset.id} to RedGifs...`);
      redgifsUrl = await uploadToRedGifs(
        asset.fileUrl,
        postTitle,
        [asset.conceptName]
      );
      await db.update(assets).set({ redgifsUrl }).where(eq3(assets.id, asset.id));
      console.log(`[Queue] RedGifs upload complete: ${redgifsUrl}`);
    }
    await db.update(posts).set({ status: "posting_reddit" }).where(eq3(posts.id, postId));
    console.log(`[Queue] Posting to r/${targetSubreddit}...`);
    const redditPostUrl = await postToReddit(
      targetSubreddit,
      postTitle,
      redgifsUrl,
      true
      // NSFW flag always true
    );
    console.log(`[Queue] Reddit post created: ${redditPostUrl}`);
    await db.update(posts).set({
      status: "posted",
      postUrl: redditPostUrl,
      postedAt: /* @__PURE__ */ new Date()
    }).where(eq3(posts.id, postId));
    console.log(`[Queue] Post ${postId} completed successfully`);
  } catch (error) {
    console.error(`[Queue] Error processing post ${postId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await db.update(posts).set({
      status: "failed",
      errorMessage
    }).where(eq3(posts.id, postId));
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
    const bridgeUrl = process.env.SITE_URL ?? "https://evaparadis.me";
    return fetchIgPreview(bridgeUrl);
  }),
  /**
   * Test IG flow: fetch with IG user-agent, return status + OG + redirect chain.
   */
  testIgFlow: publicProcedure.mutation(async () => {
    const bridgeUrl = process.env.SITE_URL ?? "https://evaparadis.me";
    const relayUrl = `${bridgeUrl}/go/of`;
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
  diagnostics: diagnosticsRouter
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
import axios3 from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
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
var createOAuthHttpClient = () => axios3.create({
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
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
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
      openId: user.openId,
      lastSignedIn: signedInAt
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
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/go", (req, res) => {
  const bridgeUrl = process.env.SITE_URL ?? `${req.protocol}://${req.get("host")}`;
  const target = new URL("/", bridgeUrl);
  Object.entries(req.query).forEach(([key, value]) => {
    if (typeof value === "string") target.searchParams.set(key, value);
  });
  res.redirect(302, target.toString());
});
app.get("/go/of", (req, res) => {
  const target = new URL("https://onlyfans.com/evaparadis");
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
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: /* @__PURE__ */ new Date()
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
