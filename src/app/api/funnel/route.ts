import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const [funnel24h, trafficSources] = await Promise.all([
      supabase.from("funnel_24h").select("*").single(),
      supabase.from("traffic_sources_24h").select("*"),
    ]);

    if (funnel24h.error) {
      console.error("Funnel error:", funnel24h.error);
      return NextResponse.json(
        { error: "Failed to fetch funnel data" },
        { status: 500 }
      );
    }

    if (trafficSources.error) {
      console.error("Traffic sources error:", trafficSources.error);
      return NextResponse.json(
        { error: "Failed to fetch traffic sources" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      funnel: funnel24h.data,
      trafficSources: trafficSources.data,
    });
  } catch (err) {
    console.error("Funnel API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
