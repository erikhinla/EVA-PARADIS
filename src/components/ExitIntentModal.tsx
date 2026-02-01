"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExitIntentModalProps {
  open: boolean;
  onClose: () => void;
  onCtaClick: () => void;
}

export function ExitIntentModal({
  open,
  onClose,
  onCtaClick,
}: ExitIntentModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl bg-nero p-6 shadow-2xl sm:inset-x-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Special offer before you go"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-cream/40 transition-colors hover:text-cream"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-4xl" aria-hidden="true">
                🔥
              </p>
              <h3 className="mt-4 font-heading text-2xl font-bold text-cream">
                Wait — don&apos;t miss this
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/60">
                60% off is only available right now.
                <br />
                Once you leave, this deal disappears.
              </p>

              <Button
                onClick={onCtaClick}
                size="lg"
                className="mt-6 h-14 w-full rounded-lg bg-oro text-base font-semibold text-nero transition-transform hover:scale-105 hover:bg-oro/90 active:scale-100"
              >
                Claim My 60% Discount
              </Button>

              <button
                onClick={onClose}
                className="mt-3 w-full py-2 text-xs text-cream/30 transition-colors hover:text-cream/50"
              >
                No thanks, I&apos;ll pass
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
