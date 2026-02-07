import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

// POST /api/bridge-event — Track page views, OF clicks, conversions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, utm_source, utm_medium, utm_campaign, layout_variant } = body;

    const validEvents = ["page_view", "of_click", "email_capture", "conversion"];
    if (!event_type || !validEvents.includes(event_type)) {
      return NextResponse.json(
        { error: "Invalid event_type" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      // Silent pass — no DB, no tracking. Don't break the UX.
      return NextResponse.json({ success: true, stored: false });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;

    const { error } = await supabaseAdmin.from("bridge_events").insert({
      event_type,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      layout_variant: layout_variant || null,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
    });

    if (error) {
      console.error("[BridgeEvent] Insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stored: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
