"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Heart, Camera } from "lucide-react";

const benefits = [
     {
          title: "Raw & Unfiltered",
          description: "No agencies, no scripts. Just me and my camera, 24/7.",
          icon: Camera,
     },
     {
          title: "Instant Access",
          description: "Unlock 500+ photos and videos immediately upon entry.",
          icon: Zap,
     },
     {
          title: "1-on-1 Chat",
          description: "I personally respond to all my DMs. Let's get to know each other.",
          icon: Heart,
     },
     {
          title: "Secure & Private",
          description: "Your privacy is my priority. Discretion is always guaranteed.",
          icon: Lock,
     },
     {
          title: "Verified Authentic",
          description: "The OnlyFans verified badge ensures you're with the real me.",
          icon: ShieldCheck,
     },
];

export function ValueProposition() {
     return (
          <section className="bg-nero px-4 py-24 sm:py-32" aria-label="Why join me">
               <div className="mx-auto max-w-4xl">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                         <div>
                              <h2 className="font-heading text-4xl font-bold leading-tight text-cream sm:text-5xl">
                                   More than just <span className="text-oro italic">content.</span>
                              </h2>
                              <p className="mt-6 text-lg text-cream/70">
                                   I built this space for the people who want to see the side of me that social media
                                   censors. It&apos;s intimate, it&apos;s real, and it&apos;s always available.
                              </p>
                         </div>

                         <div className="space-y-8">
                              {benefits.map((benefit, index) => (
                                   <motion.div
                                        key={benefit.title}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="flex gap-4"
                                   >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-oro/10 text-oro">
                                             <benefit.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                             <h3 className="text-lg font-bold text-cream">{benefit.title}</h3>
                                             <p className="text-sm text-cream/50">{benefit.description}</p>
                                        </div>
                                   </motion.div>
                              ))}
                         </div>
                    </div>
               </div>
          </section>
     );
}
