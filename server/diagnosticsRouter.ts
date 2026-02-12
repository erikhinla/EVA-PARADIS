import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

/**
 * Links the operator cares about.
 * Add more entries here if the funnel grows new destinations.
 */
const MONITORED_LINKS = [
  { key: "onlyfans", label: "OnlyFans Profile", url: "https://onlyfans.com/evaparadis" },
  { key: "bridge", label: "Bridge Page (net)", url: "https://evaparadis.net" },
  { key: "relay", label: "IG Relay (/go)", url: "https://evaparadis.net/go" },
  { key: "out", label: "Redirect Page (/out)", url: "https://evaparadis.net/out" },
];

interface RedirectHop {
  url: string;
  status: number;
  contentType: string | null;
  isHttps: boolean;
}

interface LinkCheckResult {
  key: string;
  label: string;
  url: string;
  status: number | null;
  statusText: string;
  redirectChain: RedirectHop[];
  responseTimeMs: number;
  error: string | null;
  contentType: string | null;
  isHttps: boolean;
  sslValid: boolean;
}

interface IgPreviewResult {
  url: string;
  status: number | null;
  statusText: string;
  ogTitle: string | null;
  ogImage: string | null;
  ogDescription: string | null;
  error: string | null;
  responseTimeMs: number;
}

/**
 * Follow redirects manually so we can record each hop.
 */
async function traceRedirects(
  targetUrl: string,
  userAgent?: string,
): Promise<{
  finalStatus: number;
  statusText: string;
  chain: RedirectHop[];
  error: string | null;
  elapsed: number;
  contentType: string | null;
  isHttps: boolean;
  sslValid: boolean;
}> {
  const chain: RedirectHop[] = [];
  let current = targetUrl;
  const MAX_HOPS = 10;
  const start = Date.now();
  let finalContentType: string | null = null;
  let sslValid = targetUrl.startsWith("https");

  try {
    for (let i = 0; i < MAX_HOPS; i++) {
      const isHttps = current.startsWith("https");
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent":
            userAgent ??
            "Mozilla/5.0 (compatible; EvaDiagBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(10_000),
      });

      const contentType = res.headers.get("content-type");
      finalContentType = contentType;
      chain.push({
        url: current,
        status: res.status,
        contentType,
        isHttps
      });

      // 3xx → follow Location header
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        current = new URL(location, current).href;
        continue;
      }

      // Final response
      return {
        finalStatus: res.status,
        statusText: res.statusText || httpStatusLabel(res.status),
        chain,
        error: null,
        elapsed: Date.now() - start,
        contentType: finalContentType,
        isHttps,
        sslValid: isHttps, // Simple check; true if we reached here on https
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
      sslValid: current.startsWith("https"),
    };
  } catch (err: any) {
    return {
      finalStatus: 0,
      statusText: "Connection failed",
      chain,
      error: err?.message ?? String(err),
      elapsed: Date.now() - start,
      contentType: finalContentType,
      isHttps: current.startsWith("https"),
      sslValid: false,
    };
  }
}

/**
 * Extract Open Graph tags from an HTML response,
 * simulating how Instagram's crawler sees the page.
 */
async function fetchIgPreview(targetUrl: string): Promise<IgPreviewResult> {
  const IG_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 302.0.0.0.64";
  const start = Date.now();

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": IG_UA,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
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
      responseTimeMs: elapsed,
    };
  } catch (err: any) {
    return {
      url: targetUrl,
      status: null,
      statusText: "Connection failed",
      ogTitle: null,
      ogImage: null,
      ogDescription: null,
      error: err?.message ?? String(err),
      responseTimeMs: Date.now() - start,
    };
  }
}

function extractMeta(html: string, property: string): string | null {
  // Match <meta property="og:title" content="..." />
  const regex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const match = regex.exec(html);
  if (match) return match[1];

  // Also try content before property (some pages swap order)
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
    "i",
  );
  const match2 = regex2.exec(html);
  return match2 ? match2[1] : null;
}

function httpStatusLabel(code: number): string {
  const labels: Record<number, string> = {
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
    503: "Service Unavailable",
  };
  return labels[code] ?? `HTTP ${code}`;
}

// In-memory store for last click events (persists across requests until server restart)
let lastClickLog: { url: string; timestamp: string; source: string } | null = null;

export const diagnosticsRouter = router({
  /**
   * Check all monitored links — HTTP status + redirect chain.
   */
  checkLinks: publicProcedure.query(async (): Promise<LinkCheckResult[]> => {
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
          sslValid,
        };
      }),
    );
    return results;
  }),

  /**
   * Check a single link by URL (for ad-hoc testing).
   */
  checkSingleLink: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }): Promise<LinkCheckResult> => {
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
        sslValid,
      };
    }),

  /**
   * Simulate how Instagram previews the bridge page (OG tags).
   */
  igPreview: publicProcedure.query(async (): Promise<IgPreviewResult> => {
    const bridgeUrl = process.env.SITE_URL ?? "https://evaparadis.me";
    return fetchIgPreview(bridgeUrl);
  }),

  /**
   * Test IG flow: fetch with IG user-agent, return status + OG + redirect chain.
   */
  testIgFlow: publicProcedure.mutation(async () => {
    const bridgeUrl = process.env.SITE_URL ?? "https://evaparadis.me";
    const relayUrl = `${bridgeUrl}/go/of`;
    const IG_UA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 302.0.0.0.64";

    const [redirectResult, preview] = await Promise.all([
      traceRedirects(relayUrl, IG_UA),
      fetchIgPreview(bridgeUrl),
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
      ogDescription: preview.ogDescription,
    };
  }),

  /**
   * Log a click event (called from the bridge page).
   */
  logClick: publicProcedure
    .input(
      z.object({
        url: z.string(),
        source: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      lastClickLog = {
        url: input.url,
        timestamp: new Date().toISOString(),
        source: input.source ?? "unknown",
      };
      return { success: true };
    }),

  /**
   * Get last successful click log.
   */
  getLastClick: publicProcedure.query(() => {
    return lastClickLog;
  }),
});
