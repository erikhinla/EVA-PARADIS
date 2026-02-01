"use client";

import { motion } from "framer-motion";
import { ExternalLink, Twitter, Instagram, Globe } from "lucide-react";
import type { UtmParams } from "@/hooks/useUtmParams";

interface PlatformLinksProps {
     utmParams: UtmParams;
}

const secondaryPlatforms = [
     {
          name: "Fansly",
          url: "https://fansly.com/evaparadis",
          icon: "🔥",
     },
     {
          name: "X (Twitter)",
          url: "https://x.com/evaparadisxxx",
          icon: <Twitter className="h-5 w-5" />,
     },
     {
          name: "Instagram",
          url: "https://instagram.com/evaparadis.me",
          icon: <Instagram className="h-5 w-5" />,
     },
     {
          name: "TikTok",
          url: "https://tiktok.com/@eva.paradis",
          icon: <Globe className="h-5 w-5" />,
     },
];

export function PlatformLinks({ utmParams: _utmParams }: PlatformLinksProps) {
     return (
          <section className="bg-nero px-4 py-20" aria-label="Connect on other platforms">
               <div className="mx-auto max-w-2xl">
                    <div className="mb-12 text-center">
                         <h2 className="font-heading text-3xl font-bold text-cream">Find me elsewhere</h2>
                         <p className="mt-4 text-cream/60">Choose your preferred platform for more content.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                         {secondaryPlatforms.map((platform, index) => (
                              <motion.a
                                   key={platform.name}
                                   href={platform.url}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   initial={{ opacity: 0, y: 10 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: index * 0.1 }}
                                   className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
                              >
                                   <div className="flex items-center gap-4">
                                        <span className="text-2xl">{platform.icon}</span>
                                        <span className="font-semibold text-cream">{platform.name}</span>
                                   </div>
                                   <ExternalLink className="h-4 w-4 text-oro" />
                              </motion.a>
                         ))}
                    </div>
               </div>
          </section>
     );
}
