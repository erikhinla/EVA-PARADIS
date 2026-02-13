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

    // Set session state
    sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem("bridge_utm", JSON.stringify(utm));
    }

    // Build destination URL
    const destUrl = new URL(baseUrl);
    Object.keys(utm).forEach((key) => destUrl.searchParams.set(key, utm[key]));

    // Open destination in new tab, show capture in current tab
    const opened = window.open(destUrl.toString(), "_blank");
    if (opened) {
      navigate("/capture");
    } else {
      // Popup blocked — fall back to direct redirect
      window.location.href = destUrl.toString();
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <p className="text-white/30 text-sm tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Redirecting...
      </p>
    </div>
  );
}
