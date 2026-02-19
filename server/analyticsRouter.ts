import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getSupabaseClient } from "./_core/supabase";

const bridgeEventInput = z.object({
  eventType: z.enum(["visit", "of_click", "cta_click"]).default("visit"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
  path: z.string().optional(),
  userAgent: z.string().optional(),
});

const emailSignupInput = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().default("bridge_return"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  referrer: z.string().optional(),
});

function maybeString(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export const analyticsRouter = router({
  trackBridgeEvent: publicProcedure
    .input(bridgeEventInput)
    .mutation(async ({ input, ctx }) => {
      const supabase = getSupabaseClient();
      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
        ctx.req.socket.remoteAddress ??
        null;

      const { error } = await supabase.from("bridge_events").insert({
        event_type: input.eventType,
        utm_source: maybeString(input.utmSource),
        utm_medium: maybeString(input.utmMedium),
        utm_campaign: maybeString(input.utmCampaign),
        referrer: maybeString(input.referrer ?? ctx.req.get("referer") ?? null),
        session_id: maybeString(input.sessionId),
        path: maybeString(input.path ?? ctx.req.path),
        user_agent: maybeString(input.userAgent ?? (ctx.req.headers["user-agent"] as string | undefined)),
        ip_address: ipAddress,
      });

      if (error) {
        console.error("[analytics] trackBridgeEvent failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record bridge event" });
      }

      return { success: true } as const;
    }),

  emailSignup: publicProcedure
    .input(emailSignupInput)
    .mutation(async ({ input }) => {
      const supabase = getSupabaseClient();
      const email = input.email.trim().toLowerCase();
      const payload: Record<string, unknown> = {
        email,
        phone: maybeString(input.phone),
        utm_source: maybeString(input.source) ?? maybeString(input.utmSource) ?? "bridge_return",
        utm_medium: maybeString(input.utmMedium),
        utm_campaign: maybeString(input.utmCampaign),
        referrer: maybeString(input.referrer),
      };

      // Upsert: on duplicate email, update captured_at + source
      const { data, error } = await supabase
        .from("leads")
        .upsert(payload, { onConflict: "email" })
        .select("id")
        .single();

      if (error) {
        console.error("[analytics] emailSignup failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save lead" });
      }

      return { success: true, id: data?.id ?? null } as const;
    }),

  leadsStats: publicProcedure.query(async () => {
    const supabase = getSupabaseClient();

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalResult, weekResult, recentResult] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo),
      supabase
        .from("leads")
        .select("id, email, utm_source, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (totalResult.error || weekResult.error || recentResult.error) {
      console.error("[analytics] leadsStats failed", {
        totalError: totalResult.error,
        weekError: weekResult.error,
        recentError: recentResult.error,
      });
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load lead stats" });
    }

    return {
      total_signups: totalResult.count ?? 0,
      this_week_signups: weekResult.count ?? 0,
      recent_leads: (recentResult.data ?? []).map((lead) => ({
        id: lead.id,
        email: lead.email,
        source: lead.utm_source,
        captured_at: lead.created_at,
      })),
    };
  }),

  getSnapshot: publicProcedure.query(async () => {
    const supabase = getSupabaseClient();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [leadsResult, visitResult, clickResult, weeklyLeadsResult] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("bridge_events")
        .select("id", { count: "exact", head: true })
        .in("event_type", ["visit", "page_view"]),
      supabase
        .from("bridge_events")
        .select("id", { count: "exact", head: true })
        .in("event_type", ["of_click", "cta_click"]),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo),
    ]);

    if (leadsResult.error || visitResult.error || clickResult.error) {
      console.error("[analytics] snapshot failed", {
        leadsError: leadsResult.error,
        visitError: visitResult.error,
        clickError: clickResult.error,
      });
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load analytics" });
    }

    const visits = visitResult.count ?? 0;
    const clicks = clickResult.count ?? 0;
    const leads = leadsResult.count ?? 0;
    const weeklySignups = weeklyLeadsResult.count ?? 0;
    const conversionRate = visits === 0 ? 0 : Number(((leads / visits) * 100).toFixed(1));

    return {
      metrics: {
        totalVisits: visits,
        uniqueVisitors: visits,
        ofClicks: clicks,
        conversions: leads,
        conversionRate,
        avgTimeOnPage: "0:00",
        bounceRate: 0,
        dmsSent: 0,
        dmResponses: 0,
        emailSignups: leads,
      },
      trafficSources: [],
      dmMetrics: {
        reddit: { sent: 0, responses: 0, rate: 0 },
        instagram: { sent: 0, responses: 0, rate: 0 },
        x: { sent: 0, responses: 0, rate: 0 },
      },
      email: {
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        weeklySignups,
      },
      summaryItems: [
        {
          key: "bridge_visits",
          label: "Bridge Visits",
          value: visits.toLocaleString(),
          detail: "Lifetime tracked visits",
        },
        {
          key: "email_signups",
          label: "Email Signups",
          value: leads.toLocaleString(),
          detail: "Captured via bridge",
        },
        {
          key: "conversion_rate",
          label: "Conversion Rate",
          value: `${conversionRate}%`,
          detail: visits > 0 ? "Signups / visits" : "Collect more data",
        },
      ],
    };
  }),
});
