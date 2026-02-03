import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, Camera, Heart, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    
    // Simulate submission - replace with actual email service integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
    toast.success("You're in! Check your inbox for a special welcome gift.");
  };

  const handlePremiumClick = () => {
    const url = "https://onlyfans.com/evaparadis?utm_source=bridge&utm_medium=email_page&utm_campaign=premium_cta";
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
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          >
            OnlyFans
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Get Exclusive Access
            </h1>
            <p className="text-lg text-zinc-400">
              Join my VIP list for exclusive content, special offers, and behind-the-scenes updates.
            </p>
          </div>

          {/* Form or Success */}
          {!submitted ? (
            <>
              {/* Benefits */}
              <div className="grid gap-4 mb-8">
                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Free Welcome Gift</h3>
                      <p className="text-zinc-400 text-sm">Exclusive content just for signing up</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Behind-the-Scenes</h3>
                      <p className="text-zinc-400 text-sm">See what happens off-camera</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">VIP Discounts</h3>
                      <p className="text-zinc-400 text-sm">Exclusive offers for email subscribers</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
                  />
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold h-12 px-8"
                  >
                    {loading ? "Joining..." : "Get Access"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <p className="text-zinc-500 text-xs text-center">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </>
          ) : (
            /* Success State */
            <Card className="bg-zinc-800/50 border-zinc-700 p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're In!</h2>
              <p className="text-zinc-400 mb-6">
                Check your inbox for your welcome gift. While you wait...
              </p>
              <Button 
                onClick={handlePremiumClick}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                Get Full Access on OnlyFans
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Alternative CTA */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-zinc-400 mb-4">
            Want instant access to everything?
          </p>
          <Button 
            onClick={handlePremiumClick}
            variant="outline"
            className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
          >
            Subscribe on OnlyFans
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-4xl text-center text-zinc-500 text-sm">
          <p>© 2026 Eva Paradis. All rights reserved.</p>
          <p className="mt-2">
            <a href="/" className="hover:text-amber-500 transition-colors">Home</a>
            {" · "}
            <a href="/vip" className="hover:text-amber-500 transition-colors">VIP Preview</a>
            {" · "}
            <a href="/telegram" className="hover:text-amber-500 transition-colors">Telegram</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
