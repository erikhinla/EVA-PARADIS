// Meta Pixel
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
// GA4
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID || "";

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

// Combined tracking
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  trackPixelEvent(eventName, params);
  trackGA4Event(eventName, params);
}

// Type declarations for window
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
