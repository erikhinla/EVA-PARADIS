// ---------------------------------------------------------------------------
// Postiz API Client
// Docs: https://docs.postiz.com/public-api/introduction
// ---------------------------------------------------------------------------

const POSTIZ_BASE_URL =
  process.env.POSTIZ_API_URL || "https://api.postiz.com/public/v1";
const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;

export function isPostizConfigured(): boolean {
  return Boolean(POSTIZ_API_KEY);
}

async function postizFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!POSTIZ_API_KEY) {
    throw new Error("POSTIZ_API_KEY is not configured");
  }

  const res = await fetch(`${POSTIZ_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${POSTIZ_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Postiz API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostizIntegration {
  id: string;
  name: string;
  providerIdentifier: string;
  picture?: string;
}

export interface PostizPost {
  id: string;
  state: "QUEUE" | "PUBLISHED" | "ERROR" | "DRAFT";
  publishDate?: string;
  releaseURL?: string;
}

export interface PostizCreatePostPayload {
  type: "now" | "schedule";
  date?: string; // ISO 8601 for scheduled posts
  settings: PostizPostSettings[];
}

export interface PostizPostSettings {
  __type: string;
  integration: string; // integration ID
  content?: string;
  title?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

export async function listIntegrations(): Promise<PostizIntegration[]> {
  return postizFetch<PostizIntegration[]>("/integrations");
}

export async function createPost(
  payload: PostizCreatePostPayload
): Promise<PostizPost> {
  return postizFetch<PostizPost>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPost(postId: string): Promise<PostizPost> {
  return postizFetch<PostizPost>(`/posts/${postId}`);
}

export async function listPosts(params?: {
  from?: string;
  to?: string;
}): Promise<PostizPost[]> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);
  const query = searchParams.toString();
  return postizFetch<PostizPost[]>(`/posts${query ? `?${query}` : ""}`);
}

// ---------------------------------------------------------------------------
// Platform Mapping: our variant → Postiz settings
// ---------------------------------------------------------------------------

const PLATFORM_TO_POSTIZ_TYPE: Record<string, string | null> = {
  x: "x",
  reddit: "reddit",
  ig: "instagram",
  tiktok: "tiktok",
  tj: null, // Not supported by Postiz
  redgifs: null, // Not supported by Postiz
};

export function isPostizSupported(platform: string): boolean {
  return PLATFORM_TO_POSTIZ_TYPE[platform] != null;
}

export function mapVariantToPostizSettings(
  platform: string,
  variantData: Record<string, unknown>,
  integrationId: string
): PostizPostSettings | null {
  const postizType = PLATFORM_TO_POSTIZ_TYPE[platform];
  if (!postizType) return null;

  const base: PostizPostSettings = {
    __type: postizType,
    integration: integrationId,
  };

  switch (platform) {
    case "x":
      base.content = String(variantData.caption || "");
      break;
    case "reddit":
      base.title = String(variantData.title || "");
      break;
    case "ig": {
      const caption = String(variantData.caption || "");
      const hashtags = Array.isArray(variantData.hashtags)
        ? (variantData.hashtags as string[]).join(" ")
        : "";
      base.content = hashtags ? `${caption}\n\n${hashtags}` : caption;
      break;
    }
    case "tiktok": {
      const tCaption = String(variantData.caption || "");
      const tHashtags = Array.isArray(variantData.hashtags)
        ? (variantData.hashtags as string[]).join(" ")
        : "";
      base.content = tHashtags ? `${tCaption}\n\n${tHashtags}` : tCaption;
      break;
    }
  }

  return base;
}
