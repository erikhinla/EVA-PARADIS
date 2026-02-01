"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";

export function SocialProof() {
     return (
          <section className="bg-nero px-4 py-20" aria-label="Social proof">
               <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm sm:p-12">
                    <div className="grid gap-12 text-center sm:grid-cols-3">
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                         >
                              <div className="text-4xl font-bold text-oro sm:text-5xl">50K+</div>
                              <div className="mt-2 text-sm uppercase tracking-widest text-cream/40">Loyal Fans</div>
                         </motion.div>

                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.1 }}
                         >
                              <div className="flex justify-center gap-1 mb-2">
                                   {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-oro text-oro" />
                                   ))}
                              </div>
                              <div className="text-sm uppercase tracking-widest text-cream/40">Top Rated</div>
                         </motion.div>

                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 }}
                         >
                              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-cream sm:text-5xl">
                                   100%
                                   <CheckCircle2 className="h-8 w-8 text-blue-500" />
                              </div>
                              <div className="mt-2 text-sm uppercase tracking-widest text-cream/40">Verified Real</div>
                         </motion.div>
                    </div>

                    <motion.div
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.5 }}
                         className="mt-16 text-center"
                    >
                         <blockquote className="text-2xl font-medium italic text-cream/90">
                              &quot;The only place where I can actually be myself. Thank you for the support.&quot;
                         </blockquote>
                         <cite className="mt-4 block not-italic font-bold text-oro">— Eva Paradis</cite>
                    </motion.div>
               </div>
          </section>
     );
}
