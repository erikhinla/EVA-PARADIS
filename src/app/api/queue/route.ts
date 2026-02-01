import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  queueCreateRequestSchema,
  queueListParamsSchema,
  MANUAL_ONLY_PLATFORMS,
  type Platform,
} from "@/lib/schemas/queue";

// ---------------------------------------------------------------------------
// POST /api/queue — Create queue jobs from a compose output
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = queueCreateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { compose_output } = parsed.data;
    const composeRun = crypto.randomUUID();

    const rows = Object.entries(compose_output.variants).map(
      ([platform, variantData]) => ({
        compose_run: composeRun,
        platform,
        pillar: compose_output.selected_pillar,
        variant_data: variantData,
        master_caption: compose_output.master_caption_raw,
        status: MANUAL_ONLY_PLATFORMS.includes(platform as Platform)
          ? "manual_only"
          : "queued",
      })
    );

    const { data, error } = await supabaseAdmin
      .from("queue_jobs")
      .insert(rows)
      .select();

    if (error) {
      console.error("[Queue] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to create queue jobs", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      compose_run: composeRun,
      jobs_created: data.length,
      jobs: data,
    });
  } catch (err) {
    console.error("[Queue] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/queue — List queue jobs with optional filters
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = queueListParamsSchema.safeParse({
      status: searchParams.get("status") || undefined,
      platform: searchParams.get("platform") || undefined,
      limit: searchParams.get("limit") || 50,
    });

    if (!params.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: params.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("queue_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(params.data.limit);

    if (params.data.status) {
      query = query.eq("status", params.data.status);
    }
    if (params.data.platform) {
      query = query.eq("platform", params.data.platform);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Queue] Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch queue jobs", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: data });
  } catch (err) {
    console.error("[Queue] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
