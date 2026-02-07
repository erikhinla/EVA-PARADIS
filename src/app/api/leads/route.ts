import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

// GET /api/leads — Return lead stats + recent leads for dashboard
export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);

    // Fetch summary stats
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from("leads_summary")
      .select("*")
      .single();

    // Fetch recent leads
    const { data: recent, error: recentError } = await supabaseAdmin
      .from("leads")
      .select("id, email, phone, utm_source, utm_medium, converted, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Fetch source breakdown
    const { data: bySrc, error: srcError } = await supabaseAdmin
      .from("leads")
      .select("utm_source")
      .not("utm_source", "is", null);

    const sourceBreakdown: Record<string, number> = {};
    if (bySrc) {
      for (const row of bySrc) {
        const src = row.utm_source || "direct";
        sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
      }
    }

    if (summaryError) console.error("[Leads API] Summary error:", summaryError);
    if (recentError) console.error("[Leads API] Recent error:", recentError);
    if (srcError) console.error("[Leads API] Source error:", srcError);

    return NextResponse.json({
      summary: summary || { total_leads: 0, leads_24h: 0, leads_7d: 0, converted_leads: 0 },
      recent: recent || [],
      source_breakdown: sourceBreakdown,
    });
  } catch (err) {
    console.error("[Leads API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
