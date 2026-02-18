import { useEffect } from "react";
import { useLocation } from "wouter";

// Destination assembled at runtime from char codes
const getDestUrl = (key: string) => {
  const map: Record<string, () => string> = {
    default: () => {
      const p = [
        String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47),
        String.fromCharCode(111, 110, 108, 121, 102, 97, 110, 115),
        String.fromCharCode(46, 99, 111, 109, 47),
        String.fromCharCode(101, 118, 97, 112, 97, 114, 97, 100, 105, 115),
      ];
      return p.join("");
    },
  };
  return (map[key] || map.default)();
};

const SESSION_KEY = "bridge_redirect_ts";
const RETURN_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export default function Out() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get("dest") || "default";
    const baseUrl = getDestUrl(dest);

    // Collect UTM params
    const utm: Record<string, string> = {};
    params.forEach((value, key) => {
      if (key.startsWith("utm_")) utm[key] = value;
    });

    // If returning from a recent redirect, show capture
    const existingTs = sessionStorage.getItem(SESSION_KEY);
    if (existingTs) {
      const elapsed = Date.now() - parseInt(existingTs, 10);
      if (elapsed < RETURN_WINDOW_MS) {
        navigate("/capture");
        return;
      }
      sessionStorage.removeItem(SESSION_KEY);
    }

    // Store session state BEFORE redirecting
    sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem("bridge_utm", JSON.stringify(utm));
    }

    // Register visibilitychange listener BEFORE redirect.
    // If user switches back to this tab within the window, navigate to /capture.
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const ts = sessionStorage.getItem(SESSION_KEY);
      if (!ts) return;
      const elapsed = Date.now() - parseInt(ts, 10);
      if (elapsed < RETURN_WINDOW_MS) {
        navigate("/capture");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Build destination URL with UTMs
    const destUrl = new URL(baseUrl);
    Object.keys(utm).forEach((key) => destUrl.searchParams.set(key, utm[key]));

    // Redirect current tab to OF (deferred capture — only non-converters come back)
    window.location.href = destUrl.toString();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <p className="text-white/30 text-sm tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Redirecting...
      </p>
    </div>
  );
}
