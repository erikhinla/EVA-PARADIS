import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Content assets table - stores uploaded content with metadata
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 file key
  fileUrl: text("fileUrl").notNull(), // S3 public URL
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(), // MIME type
  fileSize: int("fileSize").notNull(), // bytes
  conceptName: varchar("conceptName", { length: 255 }).notNull(), // tagging/categorization
  status: mysqlEnum("status", ["pending", "processing", "ready", "failed"]).default("pending").notNull(),
  redgifsUrl: text("redgifsUrl"), // RedGifs hosted URL after upload
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * Posts table - tracks distribution to Reddit/Instagram
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("assetId").notNull().references(() => assets.id),
  platform: mysqlEnum("platform", ["reddit", "instagram"]).notNull(),
  targetSubreddit: varchar("targetSubreddit", { length: 255 }), // for Reddit
  postTitle: text("postTitle"),
  postUrl: text("postUrl"), // URL to posted content
  status: mysqlEnum("status", [
    "queued",
    "awaiting_redgifs_url",
    "uploading_redgifs", 
    "awaiting_reddit_post",
    "posting_reddit",
    "posted",
    "failed"
  ]).default("queued").notNull(),
  scheduledFor: timestamp("scheduledFor"), // when to post
  postedAt: timestamp("postedAt"), // actual post time
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Pageviews table - tracks landing page visits
 */
export const pageviews = mysqlTable(
  "pageviews",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    path: varchar("path", { length: 255 }).notNull(),
    pageviewKey: varchar("pageviewKey", { length: 255 }).notNull().unique(),
    referrer: text("referrer"),
    utmSource: varchar("utmSource", { length: 100 }),
    utmMedium: varchar("utmMedium", { length: 100 }),
    utmCampaign: varchar("utmCampaign", { length: 150 }),
    utmContent: varchar("utmContent", { length: 150 }),
    utmTerm: varchar("utmTerm", { length: 150 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("pageviews_session_idx").on(table.sessionId),
    createdAtIdx: index("pageviews_created_at_idx").on(table.createdAt),
    sourceIdx: index("pageviews_source_idx").on(table.utmSource),
  })
);

export type Pageview = typeof pageviews.$inferSelect;
export type InsertPageview = typeof pageviews.$inferInsert;

/**
 * Clicks table - tracks OnlyFans CTA clicks
 */
export const clicks = mysqlTable(
  "clicks",
  {
    id: int("id").autoincrement().primaryKey(),
    pageviewId: int("pageviewId").notNull().references(() => pageviews.id),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    path: varchar("path", { length: 255 }).notNull(),
    target: varchar("target", { length: 64 }).default("onlyfans").notNull(),
    clickUrl: text("clickUrl").notNull(),
    utmSource: varchar("utmSource", { length: 100 }),
    utmMedium: varchar("utmMedium", { length: 100 }),
    utmCampaign: varchar("utmCampaign", { length: 150 }),
    utmContent: varchar("utmContent", { length: 150 }),
    utmTerm: varchar("utmTerm", { length: 150 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    pageviewIdx: index("clicks_pageview_idx").on(table.pageviewId),
    sessionIdx: index("clicks_session_idx").on(table.sessionId),
    createdAtIdx: index("clicks_created_at_idx").on(table.createdAt),
    targetIdx: index("clicks_target_idx").on(table.target),
  })
);

export type Click = typeof clicks.$inferSelect;
export type InsertClick = typeof clicks.$inferInsert;
