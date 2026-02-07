import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

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

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || null;

    // ── Store in Supabase ──────────────────────────────────────────────
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { error: leadError } = await supabaseAdmin
        .from("leads")
        .upsert(
          {
            email: email.toLowerCase().trim(),
            phone: phone || null,
            utm_source: utm_params?.source || null,
            utm_medium: utm_params?.medium || null,
            utm_campaign: utm_params?.campaign || null,
            utm_content: utm_params?.content || null,
            utm_term: utm_params?.term || null,
            referrer: referer,
            ip_address: ip,
            user_agent: userAgent,
          },
          { onConflict: "email", ignoreDuplicates: false }
        );

      if (leadError) {
        console.error("[Lead Capture] Supabase insert error:", leadError);
        // Don't fail the request — log and continue
      }

      // Also log as bridge_event for funnel tracking
      const { error: eventError } = await supabaseAdmin
        .from("bridge_events")
        .insert({
          event_type: "email_capture",
          utm_source: utm_params?.source || null,
          utm_medium: utm_params?.medium || null,
          utm_campaign: utm_params?.campaign || null,
          ip_address: ip,
          user_agent: userAgent,
          referrer: referer,
        });

      if (eventError) {
        console.error("[Lead Capture] Bridge event insert error:", eventError);
      }
    } else {
      // Fallback: log to console when Supabase isn't configured
      console.log("[Lead Captured — no DB]", {
        email,
        phone: phone || null,
        utm_params: utm_params || {},
        timestamp: new Date().toISOString(),
      });
    }

    // ── Send notification email via Resend ─────────────────────────────
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Eva Paradis Hub <onboarding@resend.dev>",
            to: [process.env.NOTIFICATION_EMAIL || "delivered@resend.dev"],
            subject: `New Lead: ${email}`,
            html: `
              <h3>New Lead Captured</h3>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone || "N/A"}</li>
                <li><strong>Source:</strong> ${utm_params?.source || "direct"}</li>
                <li><strong>Medium:</strong> ${utm_params?.medium || "N/A"}</li>
                <li><strong>Campaign:</strong> ${utm_params?.campaign || "N/A"}</li>
                <li><strong>Time:</strong> ${new Date().toISOString()}</li>
              </ul>
            `,
          }),
        });
      } catch (err) {
        console.error("[Lead Capture] Resend error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
