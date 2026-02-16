import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SESSION_KEY = "bridge_redirect_ts";

export default function Capture() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const emailSignup = trpc.analytics.emailSignup.useMutation();

  // No strict guard — always show the capture page.
  // If someone lands here directly it still works as a standalone email capture.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    setLoading(true);

    const utmRaw = sessionStorage.getItem("bridge_utm");
    const utm = utmRaw ? JSON.parse(utmRaw) : {};

    const trimmedEmail = email.trim();

    try {
      await emailSignup.mutateAsync({
        email: trimmedEmail,
        source: "bridge_return",
        utmSource: utm.utm_source,
        utmMedium: utm.utm_medium,
        utmCampaign: utm.utm_campaign,
        referrer: document.referrer || undefined,
      });
    } catch (err) {
      console.error("[Capture] Email signup failed", err);
      setErrorMessage("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

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
            {errorMessage && (
              <p className="text-sm text-red-300" role="alert">
                {errorMessage}
              </p>
            )}
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
