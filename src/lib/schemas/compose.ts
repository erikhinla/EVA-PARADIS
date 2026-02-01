import { z } from "zod";

// ---------------------------------------------------------------------------
// Input Schema (form validation)
// ---------------------------------------------------------------------------

export const PILLAR_OPTIONS = [
  "HARDCORE_GROUP",
  "DOMINANCE_WORSHIP",
  "ANATOMY_SOLO",
] as const;

export type Pillar = (typeof PILLAR_OPTIONS)[number];

export const composeInputSchema = z.object({
  visual_description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  selected_pillar: z.enum(PILLAR_OPTIONS, {
    message: "Select a content pillar",
  }),
});

export type ComposeInput = z.infer<typeof composeInputSchema>;

// ---------------------------------------------------------------------------
// Output Schema (API response validation)
// ---------------------------------------------------------------------------

const xVariantSchema = z.object({
  caption: z.string(),
  instruction: z.string(),
  trigger_word: z.string(),
  utm: z.string(),
  automation_tag: z.string(),
  format: z.string(),
});

const redditVariantSchema = z.object({
  title: z.string(),
  target_subreddits: z.array(z.string()),
  nsfw_flag: z.boolean(),
  format: z.string(),
});

const igVariantSchema = z.object({
  caption: z.string(),
  cta: z.string(),
  trigger_word: z.string(),
  hashtags: z.array(z.string()),
  format: z.string(),
});

const tjVariantSchema = z.object({
  headline: z.string(),
  button_text: z.string(),
  targeting_categories: z.array(z.string()),
  banner_format: z.string(),
  utm: z.string(),
  format: z.string(),
});

const tiktokVariantSchema = z.object({
  caption: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  sound_directive: z.string(),
  format: z.string(),
});

const redgifsVariantSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
  description: z.string(),
  crosspost_reddit: z.boolean(),
  utm: z.string(),
  format: z.string(),
});

export const composeOutputSchema = z.object({
  master_caption_raw: z.string(),
  selected_pillar: z.enum(PILLAR_OPTIONS),
  variants: z.object({
    x: xVariantSchema,
    reddit: redditVariantSchema,
    ig: igVariantSchema,
    tj: tjVariantSchema,
    tiktok: tiktokVariantSchema,
    redgifs: redgifsVariantSchema,
  }),
});

export type ComposeOutput = z.infer<typeof composeOutputSchema>;
