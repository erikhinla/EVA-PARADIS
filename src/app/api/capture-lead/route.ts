import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, utm_params } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        email,
        phone: phone || null,
        utm_source: utm_params?.utm_source || null,
        utm_medium: utm_params?.utm_medium || null,
        utm_campaign: utm_params?.utm_campaign || null,
        utm_content: utm_params?.utm_content || null,
        utm_term: utm_params?.utm_term || null,
        referrer: utm_params?.referrer || null,
        ip_address: utm_params?.ip || null,
        user_agent: utm_params?.userAgent || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to store lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (err) {
    console.error("Capture error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
