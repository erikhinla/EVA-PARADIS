import { z } from "zod";

// ---------------------------------------------------------------------------
// Queue Job Schema
// ---------------------------------------------------------------------------

export const PLATFORMS = [
  "x",
  "reddit",
  "ig",
  "tj",
  "tiktok",
  "redgifs",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const JOB_STATUSES = [
  "queued",
  "scheduled",
  "dispatched",
  "published",
  "failed",
  "manual_only",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const POSTIZ_SUPPORTED_PLATFORMS: Platform[] = [
  "x",
  "reddit",
  "ig",
  "tiktok",
];

export const MANUAL_ONLY_PLATFORMS: Platform[] = ["tj", "redgifs"];

export const queueJobSchema = z.object({
  id: z.string().uuid(),
  compose_run: z.string().uuid(),
  platform: z.enum(PLATFORMS),
  pillar: z.string(),
  variant_data: z.record(z.string(), z.unknown()),
  master_caption: z.string(),
  status: z.enum(JOB_STATUSES),
  scheduled_at: z.string().nullable(),
  published_at: z.string().nullable(),
  postiz_post_id: z.string().nullable(),
  error_message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type QueueJob = z.infer<typeof queueJobSchema>;

// ---------------------------------------------------------------------------
// API Request/Response Schemas
// ---------------------------------------------------------------------------

export const queueCreateRequestSchema = z.object({
  compose_output: z.object({
    master_caption_raw: z.string(),
    selected_pillar: z.string(),
    variants: z.record(z.string(), z.record(z.string(), z.unknown())),
  }),
});

export type QueueCreateRequest = z.infer<typeof queueCreateRequestSchema>;

export const queueListParamsSchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  platform: z.enum(PLATFORMS).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type QueueListParams = z.infer<typeof queueListParamsSchema>;
