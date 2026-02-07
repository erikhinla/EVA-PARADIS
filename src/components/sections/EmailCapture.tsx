"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent, trackOfClick } from "@/lib/analytics";
import type { UtmParams } from "@/hooks/useUtmParams";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{7,}$/.test(val),
      "Enter a valid phone number"
    ),
});

type FormData = z.infer<typeof schema>;

interface EmailCaptureProps {
  utmParams: UtmParams;
  variant?: "fast" | "narrative";
}

export function EmailCapture({ utmParams, variant = "narrative" }: EmailCaptureProps) {
  const isFast = variant === "fast";
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          utm_params: utmParams, // Now sends utm_source, utm_medium, etc. directly
        }),
      });

      trackEvent("Lead", {
        content_name: "email_capture",
        has_email: true,
        has_phone: !!data.phone,
      });

      setSubmitted(true);

      // Redirect after short delay
      setTimeout(() => {
        trackOfClick("EmailCapture_Redirect");
        const search = typeof window !== "undefined" ? window.location.search : "";
        const params = new URLSearchParams(search);
        params.set("rec", "10434169");
        window.location.href = `https://onlyfans.com/evaparadis?${params.toString()}`;
      }, 2500);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <section
      id="email-capture"
      className="bg-nero px-4 py-16 sm:py-24"
      aria-label="Get exclusive access"
    >
      <div className="mx-auto max-w-sm sm:max-w-md">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-3 text-center font-heading text-3xl font-bold text-cream sm:text-4xl">
                {isFast ? (
                  <>You already <span className="text-oro italic">know.</span></>
                ) : (
                  <>The <span className="text-oro italic">archives.</span></>
                )}
              </h2>
              <p className="mb-8 text-center text-sm leading-relaxed text-cream/40">
                {isFast
                  ? "Get the private backup links sent directly to you."
                  : "Drop your email for an exclusive preview gallery — free."}
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                noValidate
              >
                <div>
                  <Label htmlFor="email" className="sr-only">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/20"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isFast ? "Email address" : "Your email"}
                      autoComplete="email"
                      className="h-12 rounded-lg border-white/10 bg-white/5 pl-10 text-sm text-cream placeholder:text-cream/25 focus:border-oro focus:ring-oro sm:h-14"
                      {...register("email")}
                    />
                  </div>
                </div>

                {!isFast && (
                  <>
                    <div className="relative flex items-center py-1">
                      <div className="grow border-t border-white/5"></div>
                      <span className="mx-4 text-[9px] font-medium uppercase tracking-[0.2em] text-cream/15">
                        or
                      </span>
                      <div className="grow border-t border-white/5"></div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="sr-only">
                        Phone number
                      </Label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/20"
                          aria-hidden="true"
                        />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Phone for SMS"
                          autoComplete="tel"
                          className="h-12 rounded-lg border-white/10 bg-white/5 pl-10 text-sm text-cream placeholder:text-cream/25 focus:border-oro focus:ring-oro sm:h-14"
                          {...register("phone")}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="h-14 rounded-lg bg-oro text-base font-bold tracking-wide text-nero transition-all hover:scale-[1.02] hover:bg-oro/90 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-100 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Sending..." : isFast ? "ENTER" : "GET THE PREVIEW"}
                </Button>

                <p className="text-center text-[10px] leading-relaxed text-cream/20">
                  {isFast ? "No spam. Just backups." : "No spam. Unsubscribe anytime."}
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <CheckCircle2 className="h-14 w-14 text-oro" />
              </motion.div>
              <h3 className="mt-5 font-heading text-2xl font-bold text-cream">
                You&apos;re in.
              </h3>
              <p className="mt-3 text-sm text-cream/50">
                Check your inbox for the first drop.
              </p>
              <p className="mt-2 text-xs text-oro/60">
                Opening the full experience...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
