import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — 100vh
      ═══════════════════════════════════════════════════════════ */}
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
          {/* Dark overlay — 70 % gradient from bottom */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />
        </div>

        {/* Centred text block */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in">
          <h1 className="eva-shimmer text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.18em] leading-tight select-none">
            EVA PARADIS
          </h1>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl tracking-[0.25em] uppercase select-none"
             style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#E8D5A3" }}>
            Beyond Limits
          </p>

          {/* CTA buttons */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md">
            <a
              href="https://onlyfans.com/evaparadis?utm_source=bridge&utm_medium=hero&utm_campaign=premium"
              target="_blank"
              rel="noopener noreferrer"
              className="eva-btn flex-1 text-center"
            >
              Premium Access
            </a>
            <a
              href="https://onlyfans.com/evaparadisfree?utm_source=bridge&utm_medium=hero&utm_campaign=free"
              target="_blank"
              rel="noopener noreferrer"
              className="eva-btn flex-1 text-center"
            >
              Free Preview
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2 animate-fade-in-delayed">
          <span className="text-[10px] tracking-[0.35em] uppercase"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#E8D5A3" }}>
            Scroll
          </span>
          <svg className="scroll-arrow w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — minimal
      ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-6">
          {/* Social icons */}
          <div className="flex items-center gap-8">
            {/* Instagram */}
            <a href="https://instagram.com/evaparadis" target="_blank" rel="noopener noreferrer"
               className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"
                   strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a href="https://x.com/evaparadis" target="_blank" rel="noopener noreferrer"
               className="social-icon" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="https://tiktok.com/@evaparadis" target="_blank" rel="noopener noreferrer"
               className="social-icon" aria-label="TikTok">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.46v-7.15a8.16 8.16 0 005.58 2.18V11.3a4.85 4.85 0 01-3.58-1.58V6.69h3.58z" />
              </svg>
            </a>
            {/* OnlyFans */}
            <a href="https://onlyfans.com/evaparadis" target="_blank" rel="noopener noreferrer"
               className="social-icon" aria-label="OnlyFans">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 110 14 7 7 0 010-14zm0 2.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[11px] tracking-[0.2em] uppercase"
             style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(212,175,55,0.4)" }}>
            &copy; 2026 Eva Paradis. All rights reserved.
          </p>

          {/* Hidden admin link — tiny lock icon in bottom-right corner */}
          <Link href="/dashboard"
                className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-60 transition-opacity duration-300"
                aria-label="Admin">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#D4AF37" strokeWidth="1.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </Link>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          STYLES — shimmer, buttons, animations
      ═══════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Gold shimmer headline ── */
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

        /* ── CTA buttons — gold border, transparent fill ── */
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

        /* ── Social icons ── */
        .social-icon {
          color: rgba(212, 175, 55, 0.45);
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .social-icon:hover {
          color: #D4AF37;
          transform: translateY(-2px);
        }

        /* ── Video positioning ── */
        .hero-video {
          object-position: center 30%;
        }
        @media (max-width: 640px) and (orientation: portrait) {
          .hero-video { object-position: center 25%; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-video { object-position: center 28%; }
        }
        @media (min-width: 1920px) {
          .hero-video { object-position: center 33%; }
        }

        /* ── Scroll arrow bounce ── */
        .scroll-arrow {
          animation: bounce-down 2s ease-in-out infinite;
        }
        @keyframes bounce-down {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50%      { transform: translateY(6px); opacity: 1; }
        }

        /* ── Entrance animations ── */
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
        .animate-fade-in-delayed {
          animation: fade-in 1.2s ease-out 0.6s forwards;
          opacity: 0;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
