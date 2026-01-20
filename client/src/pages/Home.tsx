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
      // Validate code and redirect
      window.open(`https://onlyfans.com/evaparadis/vip?code=${vipCode}`, "_blank");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-bleed video background */}
      <div className="absolute inset-0 z-0">
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
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            Eva Paradis
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Entry portals */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Premium Portal */}
          <Card className="group relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Premium Access
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-sm mx-auto">
                  Exclusive content, behind-the-scenes moments, and direct interaction
                </p>
              </div>

              <Button
                onClick={handlePremiumClick}
                size="lg"
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105"
              >
                Enter Premium
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Instant access</span>
              </div>
            </div>
          </Card>

          {/* VIP Portal */}
          <Card className="group relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  VIP Experience
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-sm mx-auto">
                  Ultra-exclusive content reserved for VIP members only
                </p>
              </div>

              <div className="w-full max-w-xs space-y-4">
                <Input
                  type="text"
                  placeholder="Enter unlock code"
                  value={vipCode}
                  onChange={(e) => setVipCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVipClick()}
                  className="bg-background/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground text-center text-lg py-6 rounded-lg"
                />
                
                <Button
                  onClick={handleVipClick}
                  size="lg"
                  disabled={!vipCode.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unlock VIP
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Code required</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer tagline */}
        <div className="mt-16 text-center animate-fade-in-delay">
          <p className="text-muted-foreground text-sm sm:text-base">
            Choose your experience
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
