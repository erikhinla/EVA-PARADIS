"use client";

import { motion } from "framer-motion";

export function PreviewGrid() {
     const teasers = [
          { id: 1, label: "Exclusive" },
          { id: 2, label: "Unfiltered" },
          { id: 3, label: "Private" },
          { id: 4, label: "Behind the Scenes" },
     ];

     return (
          <section className="bg-nero px-4 py-20" aria-label="Content Preview">
               <div className="mx-auto max-w-4xl">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                         {teasers.map((teaser, index) => (
                              <motion.div
                                   key={teaser.id}
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   whileInView={{ opacity: 1, scale: 1 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: index * 0.1 }}
                                   className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5"
                              >
                                   {/* Blurred Background Placeholder */}
                                   <div
                                        className="absolute inset-0 bg-cover bg-center blur-2xl grayscale transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('/hero.png')` }}
                                   />

                                   <div className="absolute inset-0 flex items-center justify-center bg-nero/40 backdrop-blur-md">
                                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-oro/60">
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
