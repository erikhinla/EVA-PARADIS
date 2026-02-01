import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { isPostizConfigured, getPost } from "@/lib/postiz";

// ---------------------------------------------------------------------------
// POST /api/dispatch/status — Poll Postiz for dispatched job statuses
// ---------------------------------------------------------------------------

export async function POST() {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }

    if (!isPostizConfigured()) {
      return NextResponse.json(
        { error: "Postiz is not configured" },
        { status: 503 }
      );
    }

    // Fetch all dispatched/scheduled jobs with a Postiz post ID
    const { data: jobs, error: fetchError } = await supabaseAdmin
      .from("queue_jobs")
      .select("id, postiz_post_id, status")
      .in("status", ["dispatched", "scheduled"])
      .not("postiz_post_id", "is", null)
      .limit(50);

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch jobs", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        checked: 0,
        updated: 0,
        summary: [],
      });
    }

    const summary: Array<{
      job_id: string;
      postiz_post_id: string;
      previous_status: string;
      new_status: string | null;
    }> = [];

    for (const job of jobs) {
      try {
        const postizPost = await getPost(job.postiz_post_id);

        let newStatus: string | null = null;

        if (postizPost.state === "PUBLISHED") {
          newStatus = "published";
          await supabaseAdmin
            .from("queue_jobs")
            .update({
              status: "published",
              published_at: new Date().toISOString(),
            })
            .eq("id", job.id);
        } else if (postizPost.state === "ERROR") {
          newStatus = "failed";
          await supabaseAdmin
            .from("queue_jobs")
            .update({
              status: "failed",
              error_message: "Postiz reported an error",
            })
            .eq("id", job.id);
        }

        summary.push({
          job_id: job.id,
          postiz_post_id: job.postiz_post_id,
          previous_status: job.status,
          new_status: newStatus,
        });
      } catch (err) {
        console.error(
          `[DispatchStatus] Failed to check job ${job.id}:`,
          err
        );
        summary.push({
          job_id: job.id,
          postiz_post_id: job.postiz_post_id,
          previous_status: job.status,
          new_status: null,
        });
      }
    }

    return NextResponse.json({
      checked: jobs.length,
      updated: summary.filter((s) => s.new_status !== null).length,
      summary,
    });
  } catch (err) {
    console.error("[DispatchStatus] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
