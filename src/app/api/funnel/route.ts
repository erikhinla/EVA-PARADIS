import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

// GET /api/funnel — Return funnel health metrics for dashboard
export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }

    // Funnel summary (last 24h)
    const { data: funnel, error: funnelError } = await supabaseAdmin
      .from("funnel_24h")
      .select("*")
      .single();

    // Traffic sources
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from("traffic_sources_24h")
      .select("*");

    // Lead count
    const { data: leadsSummary, error: leadsError } = await supabaseAdmin
      .from("leads_summary")
      .select("*")
      .single();

    if (funnelError) console.error("[Funnel API] Funnel error:", funnelError);
    if (sourcesError) console.error("[Funnel API] Sources error:", sourcesError);
    if (leadsError) console.error("[Funnel API] Leads error:", leadsError);

    return NextResponse.json({
      funnel: funnel || {
        total_visits: 0,
        of_clicks: 0,
        email_captures: 0,
        conversions: 0,
        bridge_ctr: 0,
      },
      sources: sources || [],
      leads: leadsSummary || {
        total_leads: 0,
        leads_24h: 0,
        leads_7d: 0,
        converted_leads: 0,
      },
    });
  } catch (err) {
    console.error("[Funnel API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
