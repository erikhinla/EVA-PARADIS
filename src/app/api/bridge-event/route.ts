import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, event_data } = body;

    if (!event_type || typeof event_type !== "string") {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bridge_events")
      .insert({
        event_type,
        event_data: event_data || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to log event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, event: data });
  } catch (err) {
    console.error("Bridge event error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
