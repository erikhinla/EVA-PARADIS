import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Volume2, VolumeX, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [vipCode, setVipCode] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Detect mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handlePremiumClick = () => {
    const url = "https://onlyfans.com/evaparadis?utm_source=landing&utm_medium=premium_portal&utm_campaign=eva_bridge";
    window.open(url, "_blank");
  };

  const handleVipClick = () => {
    if (vipCode.trim()) {
      const url = `https://onlyfans.com/evaparadis/vip?code=${vipCode}&utm_source=landing&utm_medium=vip_portal&utm_campaign=eva_bridge`;
      window.open(url, "_blank");
    }
  };

  const handleCopyFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVipCode(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-bleed video background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover video-responsive"
          poster="/images/hero-backup.png"
        >
          {isMobile ? (
            <source src="/videos/hero-mobile.mp4" type="video/mp4" />
          ) : (
            <source src="/videos/hero.mp4" type="video/mp4" />
          )}
        </video>
        {/* Minimal gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/25" />
      </div>

      {/* Audio toggle button */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/30 hover:border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
        ) : (
          <Volume2 className="w-5 h-5 text-white/80 group-hover:text-white/60 transition-colors" />
        )}
      </button>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
            Eva Paradis
          </h1>
        </div>

        {/* Entry portals - ASYMMETRIC DESIGN with animations */}
        <div className="w-full max-w-2xl flex flex-col md:flex-row justify-center items-end gap-3">
          {/* Premium Portal - moved down to align with VIP bottom */}
          <Card className="group relative overflow-hidden metallic-card w-full md:flex-1 md:max-w-xs animate-slide-up animation-delay-200">
            <div className="relative p-4 flex flex-col items-center text-center space-y-3">
              <h2 className="text-lg font-bold text-white/90 drop-shadow-lg tracking-wide etched-text">
                Premium Access
              </h2>

              <Button
                onClick={handlePremiumClick}
                size="default"
                className="w-full bg-gradient-to-br from-amber-600/80 to-amber-800/80 hover:from-amber-500/90 hover:to-amber-700/90 text-white font-bold text-base py-4 rounded-md shadow-2xl border border-amber-400/30 transition-all duration-500 hover:scale-105 metallic-button glow-button-amber"
              >
                Enter Now
              </Button>
            </div>
          </Card>

          {/* VIP Portal - reduced height by 50% */}
          <Card className="group relative overflow-hidden metallic-card w-full md:flex-1 md:max-w-xs vip-compact animate-slide-up animation-delay-400">
            <div className="relative p-2 flex flex-col items-center text-center space-y-2">
              <h2 className="text-sm font-bold text-white/90 drop-shadow-lg tracking-wide etched-text">
                VIP Experience
              </h2>

              <div className="w-full space-y-1.5">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Unlock code"
                    value={vipCode}
                    onChange={(e) => setVipCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVipClick()}
                    className="bg-black/20 backdrop-blur-sm border-white/20 focus:border-amber-400/50 text-white placeholder:text-white/40 text-center text-xs py-2 pr-8 rounded-md shadow-lg transition-all duration-300 focus:scale-[1.02] metallic-input"
                  />
                  <button
                    onClick={handleCopyFromClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                    aria-label="Paste from clipboard"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                
                <Button
                  onClick={handleVipClick}
                  size="sm"
                  disabled={!vipCode.trim()}
                  className="w-full bg-gradient-to-br from-slate-600/80 to-slate-800/80 hover:from-slate-500/90 hover:to-slate-700/90 text-white font-bold text-xs py-2 rounded-md shadow-2xl border border-slate-400/30 transition-all duration-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 metallic-button glow-button-slate"
                >
                  Unlock Access
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Metallic styling, animations, and responsive video positioning */}
      <style>{`
         /* Responsive video positioning to keep Eva's head in frame */
        .video-responsive {
          object-position: center 35%;
        }
        
        /* Mobile portrait */
        @media (max-width: 640px) and (orientation: portrait) {
          .video-responsive {
            object-position: center 30%;
          }
        }
        
        /* Tablet */
        @media (min-width: 641px) and (max-width: 1024px) {
          .video-responsive {
            object-position: center 33%;
          }
        }
        
        /* Large desktop */
        @media (min-width: 1920px) {
          .video-responsive {
            object-position: center 37%;
          }
        }
        
        /* VIP compact tile - 50% height reduction */
        .vip-compact {
          min-height: fit-content;
        }
        
        /* Metallic card styling */
        .metallic-card {
          background: linear-gradient(
            135deg,
            rgba(100, 100, 110, 0.15) 0%,
            rgba(70, 70, 80, 0.2) 50%,
            rgba(100, 100, 110, 0.15) 100%
          );
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 10px 40px rgba(0, 0, 0, 0.4);
        }
        
        .metallic-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 15px 50px rgba(0, 0, 0, 0.5);
        }
        
        /* Etched text effect */
        .etched-text {
          text-shadow: 
            0 1px 0 rgba(0, 0, 0, 0.8),
            0 -1px 0 rgba(255, 255, 255, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.6);
          letter-spacing: 0.05em;
        }
        
        /* Metallic button styling */
        .metallic-button {
          position: relative;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            0 4px 15px rgba(0, 0, 0, 0.4);
        }
        
        .metallic-button:hover:not(:disabled) {
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            0 6px 25px currentColor;
        }
        
        /* Glowing button animations */
        @keyframes glow-amber {
          0%, 100% {
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 15px rgba(0, 0, 0, 0.4),
              0 0 15px rgba(251, 191, 36, 0.3);
          }
          50% {
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 15px rgba(0, 0, 0, 0.4),
              0 0 25px rgba(251, 191, 36, 0.6);
          }
        }
        
        @keyframes glow-slate {
          0%, 100% {
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 15px rgba(0, 0, 0, 0.4),
              0 0 15px rgba(148, 163, 184, 0.3);
          }
          50% {
            box-shadow: 
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 4px 15px rgba(0, 0, 0, 0.4),
              0 0 25px rgba(148, 163, 184, 0.6);
          }
        }
        
        .glow-button-amber {
          animation: glow-amber 2s ease-in-out infinite;
        }
        
        .glow-button-slate:not(:disabled) {
          animation: glow-slate 2s ease-in-out infinite;
        }
        
        /* Entrance animations */
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        /* Metallic input styling */
        .metallic-input {
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .metallic-input:focus {
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.4),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 2px rgba(251, 191, 36, 0.2);
        }
      `}</style>
    </div>
  );
}
