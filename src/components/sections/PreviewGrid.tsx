"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export function PreviewGrid() {
  const teasers = [
    { id: 1, label: "Exclusive", gradient: "from-oro/20 via-nero to-nero" },
    { id: 2, label: "Unfiltered", gradient: "from-blu/20 via-nero to-nero" },
    { id: 3, label: "Private", gradient: "from-oro/15 via-nero to-nero" },
    { id: 4, label: "Behind the Scenes", gradient: "from-blu/15 via-nero to-nero" },
  ];

  return (
    <section className="bg-nero px-4 py-16 sm:py-24" aria-label="Content Preview">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-cream sm:text-4xl">
            A taste of what&apos;s <span className="text-oro italic">inside.</span>
          </h2>
          <p className="mt-3 text-sm text-cream/40">Subscribers-only content. Updated daily.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {teasers.map((teaser, index) => (
            <motion.div
              key={teaser.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/5 sm:rounded-2xl"
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${teaser.gradient} transition-transform duration-700 group-hover:scale-110`}
              />

              {/* Blurred lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-nero/50 backdrop-blur-sm">
                <Lock className="h-5 w-5 text-oro/40 sm:h-6 sm:w-6" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 sm:text-xs">
                  {teaser.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
