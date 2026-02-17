/**
 * Shared TypeScript types for the Eva Paradis application.
 * These replace the Drizzle ORM schema types now that we use Supabase directly.
 */

// =====================
// Users
// =====================
export interface User {
    id: number;
    open_id: string;
    name: string | null;
    email: string | null;
    login_method: string | null;
    role: "user" | "admin";
    created_at: string;
    updated_at: string;
    last_signed_in: string;
}

export interface InsertUser {
    open_id: string;
    name?: string | null;
    email?: string | null;
    login_method?: string | null;
    role?: "user" | "admin";
    last_signed_in?: string;
}

// =====================
// Assets
// =====================
export type AssetStatus = "pending" | "processing" | "ready" | "failed";

export interface Asset {
    id: number;
    file_key: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    concept_name: string;
    status: AssetStatus;
    redgifs_url: string | null;
    storage_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface InsertAsset {
    file_key: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    concept_name: string;
    status?: AssetStatus;
    redgifs_url?: string | null;
    storage_path?: string | null;
}

// =====================
// Posts
// =====================
export type PostStatus =
    | "queued"
    | "awaiting_redgifs_url"
    | "uploading_redgifs"
    | "awaiting_reddit_post"
    | "posting_reddit"
    | "posted"
    | "failed";

export type PostPlatform = "reddit" | "instagram" | "twitter";

export interface Post {
    id: number;
    asset_id: number;
    platform: PostPlatform;
    target_subreddit: string | null;
    post_title: string | null;
    post_url: string | null;
    status: PostStatus;
    scheduled_for: string | null;
    posted_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export interface InsertPost {
    asset_id: number;
    platform: PostPlatform;
    target_subreddit?: string | null;
    post_title?: string | null;
    status?: PostStatus;
    scheduled_for?: string | null;
}

// =====================
// Leads
// =====================
export interface Lead {
    id: string;
    email: string;
    phone: string | null;
    source: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    referrer: string | null;
    captured_at: string;
    converted: boolean;
}

// =====================
// Bridge Events
// =====================
export interface BridgeEvent {
    id: string;
    event_type: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    referrer: string | null;
    session_id: string | null;
    path: string | null;
    user_agent: string | null;
    ip_address: string | null;
    created_at: string;
}

// =====================
// Constants
// =====================
export const AXIOS_TIMEOUT_MS = 30_000;
export const COOKIE_NAME = "eva_session";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
