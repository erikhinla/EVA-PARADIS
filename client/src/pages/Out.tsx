import { useEffect } from "react";
import { useLocation } from "wouter";

const DESTINATIONS: Record<string, string> = {
  onlyfans: "https://onlyfans.com/evaparadis",
};

const SESSION_KEY = "bridge_redirect_ts";
const RETURN_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function getUtmParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith("utm_")) {
      utm[key] = value;
    }
  });
  return utm;
}

function buildDestUrl(base: string, utmParams: Record<string, string>): string {
  const url = new URL(base);
  Object.keys(utmParams).forEach((key) => {
    url.searchParams.set(key, utmParams[key]);
  });
  return url.toString();
}

export default function Out() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const dest = params.get("dest") || "onlyfans";
    const baseUrl = DESTINATIONS[dest] || DESTINATIONS.onlyfans;
    const utmParams = getUtmParams(search);

    // Check if this is a return visit (tab became visible again)
    const existingTs = sessionStorage.getItem(SESSION_KEY);
    if (existingTs) {
      const elapsed = Date.now() - parseInt(existingTs, 10);
      if (elapsed < RETURN_WINDOW_MS) {
        // User came back — show capture page
        navigate("/capture");
        return;
      }
      // Expired — clear and re-redirect
      sessionStorage.removeItem(SESSION_KEY);
    }

    // Set timestamp before redirecting
    sessionStorage.setItem(SESSION_KEY, Date.now().toString());

    // Store UTM params for the capture page
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem("bridge_utm", JSON.stringify(utmParams));
    }

    // Listen for return (user switches back to this tab)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const ts = sessionStorage.getItem(SESSION_KEY);
        if (ts && Date.now() - parseInt(ts, 10) < RETURN_WINDOW_MS) {
          navigate("/capture");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Redirect
    const destUrl = buildDestUrl(baseUrl, utmParams);
    window.location.href = destUrl;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [navigate]);

  // User should barely see this — it's a pass-through
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <p className="text-white/30 text-sm tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Redirecting...
      </p>
    </div>
  );
}
