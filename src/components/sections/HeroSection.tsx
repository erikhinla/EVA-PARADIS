"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import clsx from "clsx";

interface HeroSectionProps {
  onCtaClick: () => void;
  variant?: "fast" | "narrative";
}

export function HeroSection({ onCtaClick, variant = "narrative" }: HeroSectionProps) {
  const isFast = variant === "fast";

  return (
    <section
      className={clsx(
        "relative flex flex-col items-center justify-center px-4 text-center",
        isFast ? "h-dvh overflow-hidden" : "min-h-dvh py-20"
      )}
      aria-label="Hero"
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-top"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-nero/95 via-nero/70 to-nero/95" />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-heading text-5xl font-bold leading-tight tracking-tight text-cream sm:text-6xl md:text-7xl"
        >
          {isFast ? (
            "You already know why you’re here."
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
            className="max-w-md text-lg leading-relaxed text-cream/80 sm:text-xl"
          >
            Everything that gets removed from Instagram lives here. No filters. No bans.
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex w-full flex-col items-center gap-4"
        >
          <Button
            onClick={() => {
              const search = typeof window !== "undefined" ? window.location.search : "";
              const params = new URLSearchParams(search);
              params.set("rec", "10434169");

              if (isFast) {
                trackEvent("InitiateCheckout", {
                  platform: "OnlyFans",
                  location: "Hero_Fast",
                  base_url: "evaparadis"
                });
              } else {
                trackEvent("OutboundClick", {
                  platform: "OnlyFans",
                  location: "Hero_Narrative",
                  base_url: "evaparadis"
                });
              }

              window.location.href = `https://onlyfans.com/evaparadis?${params.toString()}`;
            }}
            size="lg"
            className="h-16 w-full rounded-lg bg-oro px-12 text-xl font-bold text-nero transition-transform hover:scale-105 hover:bg-oro/90 active:scale-100 sm:w-auto"
          >
            {isFast ? "ENTER" : "SEE THE REST"}
          </Button>

          {isFast ? (
            <p className="text-sm font-medium tracking-wide text-cream/60">
              Don’t hesitate.
            </p>
          ) : (
            <button
              onClick={onCtaClick}
              className="text-sm font-medium text-oro/80 underline-offset-4 hover:underline"
            >
              Get private drops
            </button>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator - hide in fast mode */}
      {!isFast && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ChevronDown className="h-6 w-6 text-oro/60" />
        </motion.div>
      )}
    </section>
  );
}
