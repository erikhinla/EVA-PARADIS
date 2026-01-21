import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [vipCode, setVipCode] = useState("");

  const handlePremiumClick = () => {
    window.open("https://onlyfans.com/evaparadis", "_blank");
  };

  const handleVipClick = () => {
    if (vipCode.trim()) {
      window.open(`https://onlyfans.com/evaparadis/vip?code=${vipCode}`, "_blank");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-bleed video background - NO BLOCKING */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-backup.png"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* MINIMAL gradient overlay - 25% opacity to let video shine through */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/30" />
      </div>

      {/* Content overlay - positioned to not block Eva */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* Logo/Brand - compact and out of the way */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight drop-shadow-2xl">
            Eva Paradis
          </h1>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
        </div>

        {/* Entry portals - HORIZONTAL, ABOVE THE FOLD, HIGHLY TRANSLUCENT */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Premium Portal */}
          <Card className="group relative overflow-hidden bg-black/20 backdrop-blur-md border-white/10 hover:border-primary/40 transition-all duration-700 hover:scale-[1.03] hover:bg-black/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <Sparkles className="w-7 h-7 text-primary drop-shadow-lg" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  Premium Access
                </h2>
                <p className="text-white/80 text-sm sm:text-base max-w-xs mx-auto drop-shadow-md">
                  Exclusive content, behind-the-scenes moments, and direct interaction
                </p>
              </div>

              <Button
                onClick={handlePremiumClick}
                size="lg"
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base sm:text-lg py-5 rounded-lg shadow-2xl hover:shadow-primary/60 transition-all duration-500 hover:scale-105"
              >
                Enter Premium
              </Button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                <span className="drop-shadow-md">Instant access</span>
              </div>
            </div>
          </Card>

          {/* VIP Portal */}
          <Card className="group relative overflow-hidden bg-black/20 backdrop-blur-md border-white/10 hover:border-primary/40 transition-all duration-700 hover:scale-[1.03] hover:bg-black/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                <Lock className="w-7 h-7 text-primary drop-shadow-lg" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  VIP Experience
                </h2>
                <p className="text-white/80 text-sm sm:text-base max-w-xs mx-auto drop-shadow-md">
                  Ultra-exclusive content reserved for VIP members only
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3">
                <Input
                  type="text"
                  placeholder="Enter unlock code"
                  value={vipCode}
                  onChange={(e) => setVipCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVipClick()}
                  className="bg-black/30 backdrop-blur-sm border-white/20 focus:border-primary text-white placeholder:text-white/50 text-center text-base py-5 rounded-lg shadow-lg transition-all duration-300 focus:scale-[1.02]"
                />
                
                <Button
                  onClick={handleVipClick}
                  size="lg"
                  disabled={!vipCode.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base sm:text-lg py-5 rounded-lg shadow-2xl hover:shadow-primary/60 transition-all duration-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Unlock VIP
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                <Lock className="w-3 h-3 drop-shadow-md" />
                <span className="drop-shadow-md">Code required</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer tagline - minimal */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-white/60 text-xs sm:text-sm drop-shadow-md">
            Choose your experience
          </p>
        </div>
      </div>

      {/* Fluid micro-animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        /* Smooth entrance animations */
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .group:hover .w-14 {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
