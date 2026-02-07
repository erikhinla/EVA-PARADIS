"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackPageView, trackOfClick } from "@/lib/analytics";
import clsx from "clsx";

interface HeroSectionProps {
  onCtaClick: () => void;
  variant?: "fast" | "narrative";
}

export function HeroSection({ onCtaClick, variant = "narrative" }: HeroSectionProps) {
  const isFast = variant === "fast";

  // Track page view on mount
  useEffect(() => {
    trackPageView();
  }, []);

  const handleOfClick = (location: string) => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    params.set("rec", "10434169");

    trackOfClick(location);

    window.location.href = `https://onlyfans.com/evaparadis?${params.toString()}`;
  };

  return (
    <section
      className={clsx(
        "relative flex flex-col items-center justify-center px-4 text-center",
        isFast ? "h-dvh overflow-hidden" : "min-h-[90vh] py-20 sm:min-h-dvh"
      )}
      aria-label="Hero"
    >
      {/* Gradient background — elegant dark-to-gold without requiring video */}
      <div className="absolute inset-0 bg-gradient-to-b from-nero via-nero/95 to-nero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08)_0%,transparent_60%)]" />

      {/* Subtle animated accent line */}
      <motion.div
        className="absolute top-0 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-oro/40 to-transparent"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 128, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-8">
        {/* Name badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-oro/60">
            Eva Paradis
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-heading text-4xl font-bold leading-tight tracking-tight text-cream sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {isFast ? (
            "You already know why you\u2019re here."
          ) : (
            <>
              The <span className="text-oro italic">uncensored</span> timeline.
            </>
          )}
        </motion.h1>

        {!isFast && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-md text-base leading-relaxed text-cream/60 sm:text-lg"
          >
            Everything that gets removed from Instagram lives here.
            No filters. No bans. No limits.
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex w-full flex-col items-center gap-5"
        >
          <Button
            onClick={() => handleOfClick(isFast ? "Hero_Fast" : "Hero_Narrative")}
            size="lg"
            className="h-14 w-full max-w-xs rounded-lg bg-oro px-12 text-base font-bold tracking-wide text-nero transition-all hover:scale-[1.03] hover:bg-oro/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-100 sm:h-16 sm:w-auto sm:text-lg"
          >
            {isFast ? "ENTER" : "SEE THE REST"}
          </Button>

          {isFast ? (
            <p className="text-xs font-medium tracking-wide text-cream/40">
              Don&apos;t hesitate.
            </p>
          ) : (
            <button
              onClick={onCtaClick}
              className="text-sm font-medium text-cream/40 underline-offset-4 transition-colors hover:text-oro/80 hover:underline"
            >
              Or get private drops to your inbox
            </button>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {!isFast && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ChevronDown className="h-5 w-5 text-oro/40" />
        </motion.div>
      )}
    </section>
  );
}
