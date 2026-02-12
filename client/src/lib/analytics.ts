const SESSION_KEY = "analytics_session";
const ATTRIBUTION_KEY = "analytics_attribution";
const PAGEVIEW_KEY = "analytics_pageview_key";
const PAGEVIEW_ID_KEY = "analytics_pageview_id";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type AnalyticsAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

type StoredSession = {
  id: string;
  createdAt: number;
  expiresAt: number;
};

const isBrowser = typeof window !== "undefined";

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const saveSession = (session: StoredSession) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
};

const createSession = (): StoredSession => {
  const now = Date.now();
  const sessionId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${now}-${Math.random().toString(16).slice(2)}`;
  const session: StoredSession = {
    id: sessionId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  saveSession(session);
  try {
    localStorage.removeItem(ATTRIBUTION_KEY);
  } catch {
    // ignore storage errors
  }
  return session;
};

export const getAnalyticsSession = (): StoredSession => {
  if (!isBrowser) {
    return {
      id: "server",
      createdAt: 0,
      expiresAt: 0,
    };
  }

  let stored: StoredSession | null = null;
  try {
    stored = safeJsonParse<StoredSession>(localStorage.getItem(SESSION_KEY));
  } catch {
    stored = null;
  }
  if (!stored || stored.expiresAt < Date.now()) {
    return createSession();
  }

  return stored;
};

const readAttributionFromUrl = (): AnalyticsAttribution => {
  if (!isBrowser) return {};
  const params = new URLSearchParams(window.location.search);
  const attribution: AnalyticsAttribution = {};
  const read = (key: keyof AnalyticsAttribution, param: string) => {
    const value = params.get(param);
    if (value) attribution[key] = value;
  };

  read("utmSource", "utm_source");
  read("utmMedium", "utm_medium");
  read("utmCampaign", "utm_campaign");
  read("utmContent", "utm_content");
  read("utmTerm", "utm_term");

  return attribution;
};

export const getStickyAttribution = (): AnalyticsAttribution => {
  if (!isBrowser) return {};

  let stored: AnalyticsAttribution | null = null;
  try {
    stored = safeJsonParse<AnalyticsAttribution>(localStorage.getItem(ATTRIBUTION_KEY));
  } catch {
    stored = null;
  }
  if (stored && Object.keys(stored).length > 0) {
    return stored;
  }

  const fromUrl = readAttributionFromUrl();
  if (Object.keys(fromUrl).length > 0) {
    try {
      localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(fromUrl));
    } catch {
      // ignore storage errors
    }
  }

  return fromUrl;
};

export const getTenMinuteBucket = (timestamp = Date.now()) => {
  return Math.floor(timestamp / 600000);
};

export const getPageviewKey = (sessionId: string, path: string, timestamp = Date.now()) => {
  return `${sessionId}:${path}:${getTenMinuteBucket(timestamp)}`;
};

export const getStoredPageviewId = (pageviewKey: string): number | null => {
  if (!isBrowser) return null;
  try {
    const storedKey = sessionStorage.getItem(PAGEVIEW_KEY);
    if (storedKey !== pageviewKey) {
      return null;
    }
    const storedId = sessionStorage.getItem(PAGEVIEW_ID_KEY);
    if (!storedId) return null;
    const parsed = Number(storedId);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const storePageviewId = (pageviewKey: string, pageviewId: number) => {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(PAGEVIEW_KEY, pageviewKey);
    sessionStorage.setItem(PAGEVIEW_ID_KEY, String(pageviewId));
  } catch {
    // ignore storage errors
  }
};
