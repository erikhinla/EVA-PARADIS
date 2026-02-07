"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";

export function SocialProof() {
  return (
    <section className="bg-nero px-4 py-16 sm:py-24" aria-label="Social proof">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-10">
        <div className="grid gap-8 text-center sm:grid-cols-3 sm:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl font-bold text-oro sm:text-4xl">367K+</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream/30">
              Social Followers
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-oro text-oro sm:h-5 sm:w-5" />
              ))}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cream/30">
              Top Rated Creator
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-cream sm:text-4xl">
              100%
              <CheckCircle2 className="h-6 w-6 text-blue-400 sm:h-7 sm:w-7" />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream/30">
              Verified Real
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <blockquote className="text-lg font-medium italic leading-relaxed text-cream/70 sm:text-xl">
            &quot;The only place where I can actually be myself.
            Thank you for the support.&quot;
          </blockquote>
          <cite className="mt-4 block text-sm not-italic font-semibold text-oro/80">
            — Eva Paradis
          </cite>
        </motion.div>
      </div>
    </section>
  );
}
