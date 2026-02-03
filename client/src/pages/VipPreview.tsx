import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Star, Heart, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function VipPreview() {
  const [email, setEmail] = useState("");

  const handlePremiumClick = () => {
    const url = "https://onlyfans.com/evaparadis?utm_source=bridge&utm_medium=vip_preview&utm_campaign=premium_cta";
    window.open(url, "_blank");
  };

  const handleVipClick = () => {
    const url = "https://onlyfans.com/evaparadis?utm_source=bridge&utm_medium=vip_preview&utm_campaign=vip_cta";
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            Eva Paradis
          </a>
          <Button 
            onClick={handlePremiumClick}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
          >
            Subscribe Now
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm mb-6">
            <Star className="w-4 h-4" />
            VIP Preview Access
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Exclusive Content Awaits
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Get a taste of what my VIP subscribers enjoy. Ready for the full experience?
          </p>
        </div>
      </section>

      {/* Preview Grid */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Preview Cards - Blurred/Locked */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card 
                key={i}
                className="relative aspect-[3/4] bg-zinc-800 border-zinc-700 overflow-hidden group cursor-pointer"
                onClick={handleVipClick}
              >
                {/* Placeholder gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-zinc-800 to-purple-900/30" />
                
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-xl bg-black/40" />
                
                {/* Lock icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Lock className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-sm text-zinc-400">Unlock</span>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-300" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent">
        <div className="container mx-auto max-w-2xl text-center">
          <Heart className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Ready for More?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join my exclusive community and unlock all my premium content.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handlePremiumClick}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-lg px-8"
            >
              Subscribe Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-500">50K+</div>
              <div className="text-sm text-zinc-500">Followers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-500">1000+</div>
              <div className="text-sm text-zinc-500">Exclusive Posts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-500">Daily</div>
              <div className="text-sm text-zinc-500">New Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-4xl text-center text-zinc-500 text-sm">
          <p>© 2026 Eva Paradis. All rights reserved.</p>
          <p className="mt-2">
            <a href="/" className="hover:text-amber-500 transition-colors">Home</a>
            {" · "}
            <a href="/telegram" className="hover:text-amber-500 transition-colors">Telegram</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
