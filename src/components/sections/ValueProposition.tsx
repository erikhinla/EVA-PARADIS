"use client";

import { motion } from "framer-motion";
import { Zap, Lock, Heart, Camera, ShieldCheck } from "lucide-react";

const benefits = [
  {
    title: "Raw & Unfiltered",
    description: "No agencies. No scripts. Just me and my camera.",
    icon: Camera,
  },
  {
    title: "Instant Access",
    description: "500+ photos and videos the moment you subscribe.",
    icon: Zap,
  },
  {
    title: "1-on-1 Chat",
    description: "I personally respond to every DM.",
    icon: Heart,
  },
  {
    title: "Secure & Private",
    description: "Your privacy is my priority. Always discreet.",
    icon: Lock,
  },
  {
    title: "Verified Authentic",
    description: "OnlyFans verified. No catfish. The real me.",
    icon: ShieldCheck,
  },
];

export function ValueProposition() {
  return (
    <section className="bg-nero px-4 py-20 sm:py-28" aria-label="Why join me">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-20">
            <h2 className="font-heading text-3xl font-bold leading-tight text-cream sm:text-4xl lg:text-5xl">
              More than just <span className="text-oro italic">content.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/50">
              I built this for the people who want the side of me that
              social media censors. Intimate. Real. Always available.
            </p>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-oro/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-oro/10 text-oro">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-cream">{benefit.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-cream/40">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
