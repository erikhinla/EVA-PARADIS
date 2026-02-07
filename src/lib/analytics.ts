// Meta Pixel
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
// GA4
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID || "";

// ── Bridge Event Tracking (Supabase) ──────────────────────────────────
// Fire-and-forget POST to /api/bridge-event for funnel analytics
function trackBridgeEvent(
  eventType: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const payload = {
    event_type: eventType,
    utm_source: urlParams.get("utm_source") || (params?.utm_source as string) || null,
    utm_medium: urlParams.get("utm_medium") || (params?.utm_medium as string) || null,
    utm_campaign: urlParams.get("utm_campaign") || (params?.utm_campaign as string) || null,
    referrer: document.referrer || null,
    metadata: params || {},
  };

  // Fire-and-forget — don't await, don't block UI
  fetch("/api/bridge-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silent fail — analytics should never break the page
  });
}

// Track Meta Pixel events
export function trackPixelEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

// Track GA4 events
export function trackGA4Event(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Combined tracking — fires Meta, GA4, AND bridge event
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  trackPixelEvent(eventName, params);
  trackGA4Event(eventName, params);
  trackBridgeEvent(eventName, params);
}

// Dedicated bridge-only tracker for page_view (auto-fires on load)
export function trackPageView() {
  trackBridgeEvent("page_view");
  trackPixelEvent("PageView");
  trackGA4Event("page_view");
}

// Dedicated tracker for OF clicks
export function trackOfClick(location: string) {
  trackEvent("of_click", { location });
}

// Type declarations for window
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
