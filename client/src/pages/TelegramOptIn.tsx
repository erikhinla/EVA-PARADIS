import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Bell, Gift, Lock, ArrowRight } from "lucide-react";

export default function TelegramOptIn() {
  const handleTelegramClick = () => {
    // Replace with actual Telegram channel/group link
    const url = "https://t.me/evaparadis?utm_source=bridge&utm_medium=telegram_page&utm_campaign=telegram_join";
    window.open(url, "_blank");
  };

  const handlePremiumClick = () => {
    const url = "https://onlyfans.com/evaparadis?utm_source=bridge&utm_medium=telegram_page&utm_campaign=premium_cta";
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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Join My Telegram
            </h1>
            <p className="text-lg text-zinc-400">
              Get exclusive updates, behind-the-scenes content, and direct access to me.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid gap-4 mb-12">
            <Card className="bg-zinc-800/50 border-zinc-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Instant Notifications</h3>
                  <p className="text-zinc-400 text-sm">
                    Be the first to know when I post new content or go live.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Exclusive Giveaways</h3>
                  <p className="text-zinc-400 text-sm">
                    Telegram members get access to special promotions and free content.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">VIP Access</h3>
                  <p className="text-zinc-400 text-sm">
                    Get early access to new releases and exclusive Telegram-only content.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              onClick={handleTelegramClick}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-lg px-12 py-6 h-auto"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Join Telegram Channel
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            <p className="text-zinc-500 text-sm mt-4">
              Free to join · No spam · Unsubscribe anytime
            </p>
          </div>
        </div>
      </main>

      {/* Alternative CTA */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-zinc-400 mb-4">
            Want the full experience?
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
          </p>
        </div>
      </footer>
    </div>
  );
}
