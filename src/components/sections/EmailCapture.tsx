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
import { trackEvent } from "@/lib/analytics";
import type { UtmParams } from "@/hooks/useUtmParams";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{7,}$/.test(val),
      "Please enter a valid phone number"
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
        body: JSON.stringify({ ...data, utm_params: utmParams }),
      });

      trackEvent("Lead", {
        content_name: "email_capture",
        email: data.email,
      });

      setSubmitted(true);

      trackEvent("CaptureSuccess", {
        platform: "OnlyFans",
        has_email: !!data.email,
        has_phone: !!data.phone
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        const search = typeof window !== "undefined" ? window.location.search : "";
        const params = new URLSearchParams(search);
        params.set("rec", "10434169");
        window.location.href = `https://onlyfans.com/evaparadis?${params.toString()}`;
      }, 3000);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <section
      id="email-capture"
      className="bg-nero px-4 py-20 sm:py-28"
      aria-label="Get exclusive access"
    >
      <div className="mx-auto max-w-md">
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
              <p className="mb-8 text-center text-sm text-cream/60">
                {isFast
                  ? "Don’t hesitate. Get the private backup links sent directly to you."
                  : "Drop your email and get an exclusive preview gallery — on the house."}
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
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/30"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isFast ? "Email address" : "Drop your email for the archives."}
                      autoComplete="email"
                      className="h-14 rounded-lg border-white/10 bg-white/5 pl-10 text-cream placeholder:text-cream/30 focus:border-oro focus:ring-oro"
                      {...register("email")}
                    />
                  </div>
                </div>

                {!isFast && (
                  <>
                    <div className="relative flex items-center py-2">
                      <div className="grow border-t border-white/5"></div>
                      <span className="mx-4 text-[10px] font-medium uppercase tracking-widest text-cream/20">
                        OR
                      </span>
                      <div className="grow border-t border-white/5"></div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="sr-only">
                        Phone number
                      </Label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/30"
                          aria-hidden="true"
                        />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Phone for SMS"
                          autoComplete="tel"
                          className="h-14 rounded-lg border-white/10 bg-white/5 pl-10 text-cream placeholder:text-cream/30 focus:border-oro focus:ring-oro"
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
                  className="h-16 rounded-lg bg-oro text-lg font-bold text-nero transition-transform hover:scale-105 hover:bg-oro/90 active:scale-100 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Sending..." : (isFast ? "ENTER" : "SEE THE REST")}
                </Button>

                <p className="text-center text-[11px] leading-relaxed text-cream/30">
                  {isFast ? "No spam. Just backups." : "Join 12k+ others inside."}
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
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
                <CheckCircle2 className="h-16 w-16 text-oro" />
              </motion.div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-cream">
                You&apos;re in.
              </h3>
              <p className="mt-3 text-cream/60">
                Check your inbox for the first drop.
              </p>
              <p className="mt-2 text-sm text-oro/80">
                Opening the full experience...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
