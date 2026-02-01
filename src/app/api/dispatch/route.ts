import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  isPostizConfigured,
  isPostizSupported,
  mapVariantToPostizSettings,
  createPost,
} from "@/lib/postiz";
import { MANUAL_ONLY_PLATFORMS, type Platform } from "@/lib/schemas/queue";

const dispatchRequestSchema = z.object({
  job_id: z.string().uuid(),
  integration_id: z.string(),
  schedule_at: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }

    if (!isPostizConfigured()) {
      return NextResponse.json(
        { error: "Postiz is not configured. Add POSTIZ_API_URL and POSTIZ_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = dispatchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { job_id, integration_id, schedule_at } = parsed.data;

    // Fetch the queue job
    const { data: job, error: fetchError } = await supabaseAdmin
      .from("queue_jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { error: "Job not found", details: fetchError?.message },
        { status: 404 }
      );
    }

    // Check if platform is supported by Postiz
    if (MANUAL_ONLY_PLATFORMS.includes(job.platform as Platform)) {
      return NextResponse.json(
        { error: `Platform '${job.platform}' is not supported by Postiz. Use manual posting.` },
        { status: 422 }
      );
    }

    if (!isPostizSupported(job.platform)) {
      return NextResponse.json(
        { error: `Platform '${job.platform}' is not mapped to Postiz` },
        { status: 422 }
      );
    }

    // Map variant data to Postiz payload
    const settings = mapVariantToPostizSettings(
      job.platform,
      job.variant_data as Record<string, unknown>,
      integration_id
    );

    if (!settings) {
      return NextResponse.json(
        { error: "Failed to map variant to Postiz settings" },
        { status: 500 }
      );
    }

    // Send to Postiz
    const postizPost = await createPost({
      type: schedule_at ? "schedule" : "now",
      date: schedule_at,
      settings: [settings],
    });

    // Update queue job with Postiz post ID and status
    const newStatus = schedule_at ? "scheduled" : "dispatched";
    const { error: updateError } = await supabaseAdmin
      .from("queue_jobs")
      .update({
        status: newStatus,
        postiz_post_id: postizPost.id,
        scheduled_at: schedule_at || null,
      })
      .eq("id", job_id);

    if (updateError) {
      console.error("[Dispatch] Failed to update job status:", updateError);
    }

    return NextResponse.json({
      success: true,
      postiz_post_id: postizPost.id,
      status: newStatus,
    });
  } catch (err) {
    console.error("[Dispatch] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dispatch failed" },
      { status: 500 }
    );
  }
}
