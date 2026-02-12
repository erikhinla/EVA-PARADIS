import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { pageviews, clicks, InsertPageview, InsertClick } from "../drizzle/schema";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

const attributionSchema = z.object({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});

export const analyticsRouter = router({
  trackPageview: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        path: z.string().min(1),
        pageviewKey: z.string().min(1),
        referrer: z.string().optional(),
        attribution: attributionSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const payload: InsertPageview = {
        sessionId: input.sessionId,
        path: input.path,
        pageviewKey: input.pageviewKey,
        referrer: input.referrer,
        utmSource: input.attribution?.utmSource,
        utmMedium: input.attribution?.utmMedium,
        utmCampaign: input.attribution?.utmCampaign,
        utmContent: input.attribution?.utmContent,
        utmTerm: input.attribution?.utmTerm,
      };

      await db.insert(pageviews).values(payload).onDuplicateKeyUpdate({
        set: {
          referrer: payload.referrer ?? null,
        },
      });

      const [existing] = await db
        .select({ id: pageviews.id })
        .from(pageviews)
        .where(eq(pageviews.pageviewKey, input.pageviewKey))
        .limit(1);

      return { success: true, pageviewId: existing?.id ?? null };
    }),

  trackClick: publicProcedure
    .input(
      z.object({
        pageviewId: z.number(),
        sessionId: z.string().min(1),
        path: z.string().min(1),
        target: z.string().optional(),
        clickUrl: z.string().min(1),
        attribution: attributionSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const payload: InsertClick = {
        pageviewId: input.pageviewId,
        sessionId: input.sessionId,
        path: input.path,
        target: input.target ?? "onlyfans",
        clickUrl: input.clickUrl,
        utmSource: input.attribution?.utmSource,
        utmMedium: input.attribution?.utmMedium,
        utmCampaign: input.attribution?.utmCampaign,
        utmContent: input.attribution?.utmContent,
        utmTerm: input.attribution?.utmTerm,
      };

      await db.insert(clicks).values(payload);

      return { success: true };
    }),

  getDashboardStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const [pageviewStats] = await db
      .select({
        visits: sql<number>`count(*)`,
        uniqueSessions: sql<number>`count(distinct ${pageviews.sessionId})`,
      })
      .from(pageviews);

    const [clickStats] = await db
      .select({
        clicks: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(eq(clicks.target, "onlyfans"));

    const visits = Number(pageviewStats?.visits ?? 0);
    const uniqueSessions = Number(pageviewStats?.uniqueSessions ?? 0);
    const totalClicks = Number(clickStats?.clicks ?? 0);
    const ctr = visits > 0 ? (totalClicks / visits) * 100 : 0;

    return {
      visits,
      uniqueSessions,
      clicks: totalClicks,
      ctr,
    };
  }),
});
