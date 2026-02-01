import { NextResponse } from "next/server";

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

    // Log the lead capture (replace with your database/CRM integration)
    console.log("[Lead Captured]", {
      email,
      phone: phone || null,
      utm_params: utm_params || {},
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // TODO: Add your integrations here:
    // - Database insert (Supabase, PlanetScale, etc.)
    // - Email service (SendGrid, Resend, etc.)

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
            to: ["delivered@resend.dev"], // Replace with your email
            subject: "New Lead Captured!",
            html: `<p>New lead captured:</p><ul><li>Email: ${email}</li><li>Phone: ${phone || "N/A"}</li></ul>`,
          }),
        });
      } catch (err) {
        console.error("Resend error:", err);
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
