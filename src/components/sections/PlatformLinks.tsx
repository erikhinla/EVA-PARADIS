"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { UtmParams } from "@/hooks/useUtmParams";

interface PlatformLinksProps {
  utmParams: UtmParams;
}

const secondaryPlatforms = [
  {
    name: "Fansly",
    url: "https://fansly.com/evaparadis",
    emoji: "🔥",
  },
  {
    name: "X (Twitter)",
    url: "https://x.com/evaparadisxxx",
    emoji: "𝕏",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/evaparadis.me",
    emoji: "📸",
  },
  {
    name: "TikTok",
    url: "https://tiktok.com/@eva.paradis",
    emoji: "🎵",
  },
];

export function PlatformLinks({ utmParams: _utmParams }: PlatformLinksProps) {
  return (
    <section className="bg-nero px-4 py-16 sm:py-20" aria-label="Connect on other platforms">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-cream sm:text-3xl">
            Find me elsewhere
          </h2>
          <p className="mt-3 text-sm text-cream/40">
            Choose your preferred platform.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {secondaryPlatforms.map((platform, index) => (
            <motion.a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-oro/20 hover:bg-white/5"
            >
              <span className="text-lg">{platform.emoji}</span>
              <span className="text-sm font-medium text-cream/80">{platform.name}</span>
              <ExternalLink className="ml-auto h-3 w-3 text-cream/20" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
