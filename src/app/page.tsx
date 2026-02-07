"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { useUtmParams } from "@/hooks/useUtmParams";
import { trackPageView, trackOfClick } from "@/lib/analytics";

export default function Home() {
  const { ...utmParams } = useUtmParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    trackPageView();
  }, []);

  const handleAccessClick = () => {
    trackOfClick("Hero_AccessFree");
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    params.set("rec", "10434169");
    window.location.href = `https://onlyfans.com/evaparadis?${params.toString()}`;
  };

  return (
    <>
      <AnalyticsScripts />
      <main className="bg-nero min-h-dvh overflow-x-hidden">
        {/* ═══════════════════════════════════════════
            HERO — Red carpet video, Eva waist-up
        ═══════════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-end min-h-[85vh] sm:min-h-[90vh] overflow-hidden">
          {/* Video background */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-top"
            poster="/hero-poster.jpg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Gradient overlay — bottom fade only so Eva stays visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-nero via-nero/20 to-transparent" />

                    {/* Name + CTA — left-aligned stack */}
          <div className="relative z-10 flex flex-col items-start gap-3 pb-8 sm:pb-12 px-4 w-full max-w-xs mx-auto animate-[fadeInUp_1.5s_ease-out_0.3s_both]">
            {/* Stacked name */}
            <div className="w-full">
              <div
                className="
                  font-heading text-4xl sm:text-5xl font-bold
                  tracking-[0.25em] uppercase
                  text-transparent bg-clip-text
                  bg-gradient-to-r from-[#B8941F] via-[#F5E6A3] to-[#B8941F]
                  bg-[length:200%_100%]
                  animate-[shimmer_3s_ease-in-out_infinite]
                  leading-none
                "
              >
                Eva
              </div>
              <div
                className="
                  font-heading text-[2.65rem] sm:text-[3.4rem] font-bold
                  tracking-[0.12em] uppercase
                  text-transparent bg-clip-text
                  bg-gradient-to-r from-[#B8941F] via-[#F5E6A3] to-[#B8941F]
                  bg-[length:200%_100%]
                  animate-[shimmer_3s_ease-in-out_infinite]
                  leading-none mt-1
                  w-full
                "
              >
                Paradis
              </div>
            </div>

            {/* ACCESS FOR FREE button */}
            <button
              onClick={handleAccessClick}
              className="
                group relative w-full
                h-14 sm:h-16
                rounded-xl
                font-heading text-base sm:text-lg font-bold tracking-[0.15em] uppercase
                text-nero
                bg-gradient-to-b from-[#E8C84A] via-oro to-[#B8941F]
                shadow-[0_4px_20px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)]
                hover:shadow-[0_6px_30px_rgba(212,175,55,0.6),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)]
                hover:translate-y-[-1px]
                active:translate-y-[1px]
                active:shadow-[0_2px_10px_rgba(212,175,55,0.3),inset_0_2px_4px_rgba(0,0,0,0.3)]
                transition-all duration-200 ease-out
                overflow-hidden
              "
            >
              <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">
                Access for Free
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </button>

            {/* Legal line */}
            <p className="text-[10px] text-cream/40 text-center w-full tracking-wide">
              30 days free then $3/mo. after trial ends.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            THE VAULT — exclusive content store
        ═══════════════════════════════════════════ */}
        <section className="relative px-4 py-16 sm:py-24 bg-nero">
          {/* Subtle top divider */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-oro/30 to-transparent" />

          <div className="mx-auto max-w-lg flex flex-col items-center text-center">
            {/* Vault header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-oro/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-oro/60">
                EXCLUSIVE
              </span>
              <div className="h-px w-8 bg-oro/30" />
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-cream leading-tight">
              The Vault
            </h2>
            <p className="mt-3 text-sm text-cream/40 max-w-sm">
              Never released content, you won&apos;t find anywhere else.
            </p>

            {/* Promo code input */}
            <div className="mt-8 w-full max-w-sm">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="
                    flex-1 h-12 px-4
                    rounded-lg border border-white/10 bg-white/5
                    text-sm text-cream placeholder:text-cream/25
                    focus:border-oro focus:ring-1 focus:ring-oro focus:outline-none
                    transition-colors
                  "
                />
                <button
                  className="
                    h-12 px-6 rounded-lg
                    bg-oro/10 border border-oro/20
                    text-sm font-bold text-oro tracking-wide uppercase
                    hover:bg-oro/20 hover:border-oro/40
                    active:bg-oro/15
                    transition-all
                  "
                >
                  Redeem
                </button>
              </div>
              <p className="mt-2 text-[10px] text-cream/20">
                Promo codes are sent via DM on Instagram, X, and Facebook.
              </p>
            </div>

            {/* Coming soon content grid placeholder */}
            <div className="mt-12 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="
                      aspect-[3/4] rounded-xl
                      border border-white/5 bg-white/[0.02]
                      flex flex-col items-center justify-center gap-2
                      group hover:border-oro/15 transition-colors
                    "
                  >
                    <svg className="w-5 h-5 text-oro/20 group-hover:text-oro/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cream/20 group-hover:text-cream/30 transition-colors">
                      Coming Soon
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Email capture for vault notifications */}
            <div className="mt-12 w-full max-w-sm">
              <p className="text-xs text-cream/30 mb-3">
                Get notified when The Vault opens.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const email = (form.elements.namedItem("vault_email") as HTMLInputElement).value;
                  try {
                    await fetch("/api/capture-lead", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email,
                        utm_params: utmParams,
                        source: "vault_notify",
                      }),
                    });
                    form.reset();
                    const btn = form.querySelector("button");
                    if (btn) { btn.textContent = "You're in ✓"; btn.disabled = true; }
                  } catch { /* silent */ }
                }}
                className="flex gap-2"
              >
                <input
                  name="vault_email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="
                    flex-1 h-12 px-4
                    rounded-lg border border-white/10 bg-white/5
                    text-sm text-cream placeholder:text-cream/25
                    focus:border-oro focus:ring-1 focus:ring-oro focus:outline-none
                    transition-colors
                  "
                />
                <button
                  type="submit"
                  className="
                    h-12 px-6 rounded-lg
                    bg-oro text-nero text-sm font-bold tracking-wide
                    hover:bg-oro/90 active:bg-oro/80
                    transition-colors
                  "
                >
                  Notify Me
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER — minimal
        ═══════════════════════════════════════════ */}
        <footer className="bg-nero px-4 pb-8 pt-4">
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <p className="text-[10px] leading-relaxed text-cream/15">
              This site contains links to age-restricted content. By proceeding,
              you confirm you are 18+ and agree to view adult content. All content
              is produced by consenting adults.
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="text-[9px] uppercase tracking-[0.2em] text-oro/30 hover:text-oro/60 transition-colors"
              >
                Command Center
              </Link>
              <span className="text-cream/10">·</span>
              <Link
                href="/dashboard/compose"
                className="text-[9px] uppercase tracking-[0.2em] text-oro/30 hover:text-oro/60 transition-colors"
              >
                Composer
              </Link>
            </div>
            <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-cream/10">
              &copy; {new Date().getFullYear()} Eva Paradis
            </p>
          </div>
        </footer>
      </main>

      <Analytics />
    </>
  );
}
