import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const SESSION_KEY = "bridge_redirect_ts";
const RETURN_WINDOW_MS = 30 * 60 * 1000;

export default function Capture() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Guard: only show if returning from redirect within the window
  useEffect(() => {
    const ts = sessionStorage.getItem(SESSION_KEY);
    if (!ts || Date.now() - parseInt(ts, 10) >= RETURN_WINDOW_MS) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    const utmRaw = sessionStorage.getItem("bridge_utm");
    const utm = utmRaw ? JSON.parse(utmRaw) : {};

    const payload = {
      email: email.trim(),
      source: "bridge_return",
      referrer: document.referrer || null,
      utm,
      capturedAt: new Date().toISOString(),
    };

    // Store locally — backend route can be wired later
    try {
      const existing = JSON.parse(localStorage.getItem("bridge_emails") || "[]");
      existing.push(payload);
      localStorage.setItem("bridge_emails", JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }

    console.log("[Capture] Email collected:", payload);

    // Simulate brief delay for UX
    await new Promise((r) => setTimeout(r, 600));

    setSubmitted(true);
    setLoading(false);

    // Clear session state
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("bridge_utm");
  };

  const handleSkip = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("bridge_utm");
    navigate("/");
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center px-6">
      {!submitted ? (
        <div className="w-full max-w-sm flex flex-col items-center text-center animate-capture-in">
          <h2
            className="text-2xl sm:text-3xl tracking-[0.12em] mb-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#E8D5A3" }}
          >
            Private drops &amp; updates
          </h2>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-[#D4AF37]/40 text-white placeholder:text-white/30 text-sm tracking-wider outline-none focus:border-[#D4AF37] transition-colors"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="capture-btn w-full py-3 text-sm tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {loading ? "..." : "Get Access"}
            </button>
          </form>

          <button
            onClick={handleSkip}
            className="mt-6 text-white/25 text-xs tracking-wider hover:text-white/50 transition-colors"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Continue without
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center animate-capture-in">
          <p
            className="text-2xl tracking-[0.12em]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#D4AF37" }}
          >
            You're in
          </p>
        </div>
      )}

      <style>{`
        .capture-btn {
          font-weight: 600;
          color: #D4AF37;
          border: 1px solid #D4AF37;
          background: transparent;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .capture-btn:hover:not(:disabled) {
          background: #D4AF37;
          color: #0a0a0a;
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.35);
        }
        .capture-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .animate-capture-in {
          animation: capture-fade 0.8s ease-out forwards;
        }
        @keyframes capture-fade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
