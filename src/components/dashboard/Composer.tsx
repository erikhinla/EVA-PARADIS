"use client";

import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Copy, Check, ListPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  composeInputSchema,
  type ComposeInput,
  type ComposeOutput,
  PILLAR_OPTIONS,
} from "@/lib/schemas/compose";

// ============================================================================
// CONSTANTS
// ============================================================================

const PLATFORM_COLORS: Record<string, string> = {
  ig: "bg-pink-600",
  reddit: "bg-orange-600",
  x: "bg-sky-500",
  tiktok: "bg-neutral-100 text-black",
  tj: "bg-amber-600",
  redgifs: "bg-red-600",
};

const PLATFORM_LABELS: Record<string, string> = {
  ig: "Instagram",
  reddit: "Reddit",
  x: "X (Twitter)",
  tiktok: "TikTok",
  tj: "TrafficJunky",
  redgifs: "RedGIFs",
};

const PLATFORM_ORDER: (keyof ComposeOutput["variants"])[] = [
  "x",
  "reddit",
  "ig",
  "tj",
  "tiktok",
  "redgifs",
];

const PILLAR_LABELS: Record<string, string> = {
  HARDCORE_GROUP: "Hardcore Group",
  DOMINANCE_WORSHIP: "Dominance Worship",
  ANATOMY_SOLO: "Anatomy Solo",
};

// ============================================================================
// HELPERS
// ============================================================================

function variantToText(
  platformKey: string,
  variant: Record<string, unknown>
): string {
  const label = PLATFORM_LABELS[platformKey] ?? platformKey;
  const lines = [`--- ${label} ---`];
  for (const [key, value] of Object.entries(variant)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.join(", ")}`);
    } else {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  return lines.join("\n");
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${PLATFORM_COLORS[platform] ?? "bg-neutral-600"}`}
    >
      {PLATFORM_LABELS[platform] ?? platform}
    </span>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-neutral-800 last:border-0">
      <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </div>
      <div className="text-sm text-white break-words">{children}</div>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function PlatformCard({
  platformKey,
  variant,
  copiedPlatform,
  onCopy,
}: {
  platformKey: string;
  variant: Record<string, unknown>;
  copiedPlatform: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const isCopied = copiedPlatform === platformKey;

  return (
    <div className="border border-neutral-700 bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
        <PlatformBadge platform={platformKey} />
        <button
          onClick={() => onCopy(platformKey, variantToText(platformKey, variant))}
          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
            isCopied
              ? "border-emerald-600 text-emerald-400"
              : "border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
          }`}
        >
          {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Fields */}
      <div className="px-4 py-2 flex-1">
        {Object.entries(variant).map(([key, value]) => {
          if (key === "format") return null;

          let content: React.ReactNode;
          if (Array.isArray(value)) {
            content = <TagList items={value as string[]} />;
          } else if (typeof value === "boolean") {
            content = (
              <span
                className={
                  value ? "text-amber-400 font-bold" : "text-neutral-500"
                }
              >
                {value ? "YES" : "NO"}
              </span>
            );
          } else {
            content = String(value);
          }

          return (
            <FieldRow key={key} label={key.replace(/_/g, " ")}>
              {content}
            </FieldRow>
          );
        })}
      </div>

      {/* Footer: format */}
      {typeof variant.format === "string" && (
        <div className="border-t border-neutral-800 px-4 py-2">
          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
            {variant.format}
          </span>
        </div>
      )}
    </div>
  );
}

function ComposeForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: ComposeInput) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ComposeInput>({
    resolver: zodResolver(composeInputSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 mb-4">
        Compose Content Package
      </div>

      {/* Visual Description */}
      <div className="space-y-2">
        <Label className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
          Visual Description
        </Label>
        <Textarea
          {...register("visual_description")}
          placeholder="Describe the raw image or video file..."
          rows={6}
          disabled={isSubmitting}
          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-neutral-500/20 resize-none"
        />
        {errors.visual_description && (
          <p className="text-red-400 text-[11px]">
            {errors.visual_description.message}
          </p>
        )}
      </div>

      {/* Pillar Select */}
      <div className="space-y-2">
        <Label className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
          Content Pillar
        </Label>
        <Controller
          name="selected_pillar"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white">
                <SelectValue placeholder="Select a pillar" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {PILLAR_OPTIONS.map((pillar) => (
                  <SelectItem
                    key={pillar}
                    value={pillar}
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-white"
                  >
                    {PILLAR_LABELS[pillar]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.selected_pillar && (
          <p className="text-red-400 text-[11px]">
            {errors.selected_pillar.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2.5 text-[11px] font-bold uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
          isSubmitting
            ? "border-neutral-700 bg-neutral-800 text-neutral-500 cursor-wait"
            : "border-neutral-600 text-neutral-300 hover:border-white hover:bg-white hover:text-black"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate"
        )}
      </button>
    </form>
  );
}

function ResultsPanel({
  data,
  onQueueAll,
  copiedPlatform,
  onCopy,
  isQueued,
  queueError,
  queueJobCount,
}: {
  data: ComposeOutput;
  onQueueAll: () => void;
  copiedPlatform: string | null;
  onCopy: (key: string, text: string) => void;
  isQueued: boolean;
  queueError: string | null;
  queueJobCount: number | null;
}) {
  return (
    <div className="space-y-4">
      {/* Master Caption */}
      <div className="border border-neutral-700 bg-neutral-900 px-5 py-4">
        <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          Master Caption
        </div>
        <div className="mt-1 text-sm text-white">
          {data.master_caption_raw}
        </div>
        <div className="mt-2 text-[10px] text-neutral-600 uppercase tracking-wider">
          Pillar: {PILLAR_LABELS[data.selected_pillar] ?? data.selected_pillar}
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {PLATFORM_ORDER.map((key) => {
          const variant = data.variants[key];
          if (!variant) return null;
          return (
            <PlatformCard
              key={key}
              platformKey={key}
              variant={variant as unknown as Record<string, unknown>}
              copiedPlatform={copiedPlatform}
              onCopy={onCopy}
            />
          );
        })}
      </div>

      {/* Queue All */}
      <div className="flex items-center justify-end gap-3">
        {queueJobCount !== null && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider">
              {queueJobCount} jobs queued
            </span>
            <Link
              href="/dashboard"
              className="text-[10px] text-neutral-500 uppercase tracking-wider hover:text-white transition-colors underline underline-offset-2"
            >
              View Dashboard
            </Link>
          </div>
        )}
        {queueError && (
          <span className="text-[10px] text-red-400 uppercase tracking-wider">
            {queueError}
          </span>
        )}
        <button
          onClick={onQueueAll}
          disabled={isQueued && queueJobCount === null}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
            queueJobCount !== null
              ? "border-emerald-600 bg-emerald-900/30 text-emerald-400"
              : isQueued
                ? "border-neutral-700 bg-neutral-800 text-neutral-500 cursor-wait"
                : "border-neutral-600 text-neutral-300 hover:border-white hover:bg-white hover:text-black"
          }`}
        >
          <ListPlus className="h-3.5 w-3.5" />
          {queueJobCount !== null ? "Queued" : isQueued ? "Queuing..." : "Queue All"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPOSER
// ============================================================================

export default function Composer() {
  const [result, setResult] = useState<ComposeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isQueued, setIsQueued] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [queueJobCount, setQueueJobCount] = useState<number | null>(null);

  const handleCompose = useCallback(async (data: ComposeInput) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setIsQueued(false);

    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }

      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleCopy = useCallback(async (platformKey: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platformKey);
    setTimeout(() => setCopiedPlatform(null), 2000);
  }, []);

  const handleQueueAll = useCallback(async () => {
    if (!result) return;
    setIsQueued(true);
    setQueueError(null);
    setQueueJobCount(null);

    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compose_output: result }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to queue jobs");
      }

      setQueueJobCount(json.jobs_created);
    } catch (err) {
      setQueueError(err instanceof Error ? err.message : "Queue failed");
      setIsQueued(false);
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      {/* HEADER */}
      <header className="border-b border-neutral-800 bg-neutral-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Composer
          </h1>
          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
            Module B
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[10px] text-neutral-500 uppercase tracking-wider hover:text-white transition-colors"
          >
            Command Center
          </Link>
          <div className="text-[10px] text-neutral-600 tabular-nums uppercase tracking-wider">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            &middot; Live
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row">
        {/* LEFT: Form */}
        <aside className="w-full lg:w-96 shrink-0 border-r border-neutral-800 px-6 py-6">
          <ComposeForm onSubmit={handleCompose} isSubmitting={isSubmitting} />
        </aside>

        {/* RIGHT: Results */}
        <main className="flex-1 px-6 py-6 min-h-[60vh]">
          {isSubmitting && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                <div className="text-[11px] text-neutral-500 uppercase tracking-widest">
                  Generating content packages...
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-950/30 px-5 py-4">
              <div className="text-[11px] font-medium uppercase tracking-widest text-red-400 mb-1">
                Error
              </div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          {result && (
            <ResultsPanel
              data={result}
              onQueueAll={handleQueueAll}
              copiedPlatform={copiedPlatform}
              onCopy={handleCopy}
              isQueued={isQueued}
              queueError={queueError}
              queueJobCount={queueJobCount}
            />
          )}

          {!result && !isSubmitting && !error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-[11px] text-neutral-600 uppercase tracking-widest mb-2">
                  No content generated
                </div>
                <div className="text-xs text-neutral-700">
                  Describe a visual and select a pillar to generate 5 platform packages.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
