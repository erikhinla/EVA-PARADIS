"use client";

import { useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import clsx from "clsx"; // Added import for clsx
import { HeroSection } from "@/components/sections/HeroSection";
import { PreviewGrid } from "@/components/sections/PreviewGrid"; // Added import for PreviewGrid
import { ValueProposition } from "@/components/sections/ValueProposition";
import { SocialProof } from "@/components/sections/SocialProof";
import { EmailCapture } from "@/components/sections/EmailCapture";
import { PlatformLinks } from "@/components/sections/PlatformLinks";
import { Footer } from "@/components/sections/Footer";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { useUtmParams } from "@/hooks/useUtmParams";
import { useExitIntent } from "@/hooks/useExitIntent";

export default function Home() {
  const { isFastBridge, ...utmParams } = useUtmParams(); // Modified utmParams destructuring
  const { showModal, dismiss } = useExitIntent(5000);

  const scrollToEmailCapture = useCallback(() => {
    document.getElementById("email-capture")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  const goToOnlyFans = useCallback(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    params.set("rec", "10434169");
    window.location.href = `https://onlyfans.com/evaparadis?${params.toString()}`;
    dismiss();
  }, [dismiss]);

  return (
    <>
      <AnalyticsScripts />
      {/* Conditional Preload for Layout A Background */}
      {isFastBridge && (
        <link rel="preload" href="/hero-video.mp4" as="video" type="video/mp4" />
      )}

      <main className={clsx("bg-nero", isFastBridge ? "h-dvh overflow-hidden" : "min-h-dvh overflow-x-hidden")}>
        <HeroSection
          onCtaClick={scrollToEmailCapture}
          variant={isFastBridge ? "fast" : "narrative"}
        />

        {!isFastBridge && (
          <>
            <PreviewGrid /> {/* Added PreviewGrid */}
            <ValueProposition />
            <SocialProof />
          </>
        )}

        <EmailCapture
          utmParams={utmParams}
          variant={isFastBridge ? "fast" : "narrative"}
        />

        {!isFastBridge && <PlatformLinks utmParams={utmParams} />}

        <Footer />
      </main>

      <ExitIntentModal
        open={showModal}
        onClose={dismiss}
        onCtaClick={goToOnlyFans}
      />

      <Analytics />
    </>
  );
}
