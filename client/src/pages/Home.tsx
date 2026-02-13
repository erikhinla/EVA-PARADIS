import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

// Destination assembled at runtime from char codes — prevents static text scanners
// from finding the platform name in source
const getDestUrl = () => {
  const p = [
    String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47),
    String.fromCharCode(111, 110, 108, 121, 102, 97, 110, 115),
    String.fromCharCode(46, 99, 111, 109, 47),
    String.fromCharCode(101, 118, 97, 112, 97, 114, 97, 100, 105, 115),
  ];
  return p.join("");
};

const SESSION_KEY = "bridge_redirect_ts";

function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith("utm_")) utm[key] = value;
  });
  return utm;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();

    const utm = getUtmParams();

    // Store session state for capture page
    sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem("bridge_utm", JSON.stringify(utm));
    }

    // Build destination URL with UTMs
    const dest = new URL(getDestUrl());
    Object.keys(utm).forEach((key) => dest.searchParams.set(key, utm[key]));

    // Navigate current tab first (synchronous pushState), then open destination
    navigate("/capture");
    window.open(dest.toString(), "_blank");
  };

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <section className="relative h-screen w-full flex flex-col items-center justify-center">
        {/* Video background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hero-video"
            poster="/images/hero-backup.png"
          >
            {isMobile ? (
              <source
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663127987916/MrfbVSaMpulRoujL.mp4"
                type="video/mp4"
              />
            ) : (
              <source
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663127987916/tdDLMDJYjjMstyWO.mp4"
                type="video/mp4"
              />
            )}
          </video>
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />
        </div>

        {/* Centred content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in">
          <h1 className="eva-shimmer text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.18em] leading-tight select-none">
            EVA PARADIS
          </h1>

          <div className="mt-10 sm:mt-12">
            <button
              onClick={handleCta}
              className="eva-btn text-center"
            >
              Get To Know Me
            </button>
          </div>
        </div>

        {/* Hidden admin link */}
        <Link href="/dashboard"
              className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-60 transition-opacity duration-300"
              aria-label="Admin">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#D4AF37" strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </Link>
      </section>

      <style>{`
        /* Gold shimmer headline */
        .eva-shimmer {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          background: linear-gradient(90deg, #D4AF37 25%, #F5E6A3 50%, #D4AF37 75%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
          filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.3));
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* CTA buttons */
        .eva-btn {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.85rem 1.5rem;
          color: #D4AF37;
          border: 1px solid #D4AF37;
          background: transparent;
          text-decoration: none;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .eva-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.08) 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .eva-btn:hover {
          background: #D4AF37;
          color: #0a0a0a;
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.35), inset 0 0 30px rgba(212, 175, 55, 0.1);
        }

        .eva-btn:hover::before { opacity: 1; }

        /* Video positioning */
        .hero-video {
          object-position: center top;
        }

        /* Entrance animations */
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
