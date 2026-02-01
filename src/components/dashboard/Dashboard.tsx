"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ACCESS_HUB_DEFAULT_ROWS,
  ACCESS_HUB_STORAGE_KEY,
  type AccessHubRow,
} from "@/lib/accessHub";

// ============================================================================
// MOCK DATA
// ============================================================================

const FUNNEL_DATA = {
  total_traffic: 12847,
  traffic_by_layout: {
    A: { visits: 4231, label: "Paid" },
    B: { visits: 8616, label: "Social" },
  },
  bridge_ctr: 0.382,
  bridge_ctr_benchmark: 0.35,
  net_revenue_today_cents: 124700,
  total_subs: 847,
};

const WINNERS_DATA: WinnerRow[] = [
  {
    master_asset_id: "a1b2c3d4",
    variant_id: "v-001",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "tiktok",
    posted_at: "2026-01-26T14:00:00Z",
    bridge_ctr: 0.421,
    revenue_per_view: 0.041,
    revenue_cents: 18450,
    impressions: 45000,
    new_subs: 34,
    repost_eligible: true,
    repost_count: 0,
    max_reposts: 3,
  },
  {
    master_asset_id: "e5f6g7h8",
    variant_id: "v-002",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "reddit",
    posted_at: "2026-01-26T09:00:00Z",
    bridge_ctr: 0.398,
    revenue_per_view: 0.038,
    revenue_cents: 14820,
    impressions: 39000,
    new_subs: 28,
    repost_eligible: true,
    repost_count: 1,
    max_reposts: 3,
  },
  {
    master_asset_id: "i9j0k1l2",
    variant_id: "v-003",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "ig",
    posted_at: "2026-01-25T18:00:00Z",
    bridge_ctr: 0.372,
    revenue_per_view: 0.029,
    revenue_cents: 9570,
    impressions: 33000,
    new_subs: 19,
    repost_eligible: true,
    repost_count: 0,
    max_reposts: 3,
  },
  {
    master_asset_id: "m3n4o5p6",
    variant_id: "v-004",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "x",
    posted_at: "2026-01-25T22:00:00Z",
    bridge_ctr: 0.356,
    revenue_per_view: 0.024,
    revenue_cents: 7200,
    impressions: 30000,
    new_subs: 14,
    repost_eligible: false,
    repost_count: 3,
    max_reposts: 3,
  },
  {
    master_asset_id: "q7r8s9t0",
    variant_id: "v-005",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "reddit",
    posted_at: "2026-01-25T20:00:00Z",
    bridge_ctr: 0.351,
    revenue_per_view: 0.022,
    revenue_cents: 6160,
    impressions: 28000,
    new_subs: 11,
    repost_eligible: true,
    repost_count: 1,
    max_reposts: 3,
  },
  {
    master_asset_id: "u1v2w3x4",
    variant_id: "v-006",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "tiktok",
    posted_at: "2026-01-24T17:00:00Z",
    bridge_ctr: 0.341,
    revenue_per_view: 0.019,
    revenue_cents: 4940,
    impressions: 26000,
    new_subs: 9,
    repost_eligible: true,
    repost_count: 0,
    max_reposts: 3,
  },
  {
    master_asset_id: "y5z6a7b8",
    variant_id: "v-007",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "ig",
    posted_at: "2026-01-24T12:00:00Z",
    bridge_ctr: 0.338,
    revenue_per_view: 0.017,
    revenue_cents: 3910,
    impressions: 23000,
    new_subs: 7,
    repost_eligible: true,
    repost_count: 2,
    max_reposts: 3,
  },
  {
    master_asset_id: "c9d0e1f2",
    variant_id: "v-008",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "tj",
    posted_at: "2026-01-25T00:00:00Z",
    bridge_ctr: 0.044,
    revenue_per_view: 0.062,
    revenue_cents: 24180,
    impressions: 390000,
    new_subs: 41,
    repost_eligible: true,
    repost_count: 0,
    max_reposts: 3,
  },
  {
    master_asset_id: "g3h4i5j6",
    variant_id: "v-009",
    thumbnail_url: "/placeholder-thumb.jpg",
    platform: "redgifs",
    posted_at: "2026-01-25T11:00:00Z",
    bridge_ctr: 0.389,
    revenue_per_view: 0.033,
    revenue_cents: 11220,
    impressions: 34000,
    new_subs: 22,
    repost_eligible: true,
    repost_count: 0,
    max_reposts: 3,
  },
];

interface PlatformCounts {
  queued: number;
  scheduled: number;
  dispatched: number;
  live: number;
  failed: number;
  manual_only: number;
}

interface InventoryData {
  platforms: Record<string, PlatformCounts>;
  total_ready_assets: number;
  daily_posting_rate: number;
  days_of_content_remaining: number;
  alert_level: "GREEN" | "YELLOW" | "RED";
}

const INVENTORY_DATA: InventoryData = {
  platforms: {
    ig: { queued: 12, scheduled: 3, dispatched: 0, live: 87, failed: 0, manual_only: 0 },
    reddit: { queued: 8, scheduled: 2, dispatched: 0, live: 124, failed: 0, manual_only: 0 },
    x: { queued: 15, scheduled: 4, dispatched: 0, live: 96, failed: 2, manual_only: 0 },
    tiktok: { queued: 9, scheduled: 3, dispatched: 0, live: 64, failed: 0, manual_only: 0 },
    tj: { queued: 4, scheduled: 1, dispatched: 0, live: 18, failed: 0, manual_only: 0 },
    redgifs: { queued: 6, scheduled: 2, dispatched: 0, live: 98, failed: 0, manual_only: 0 },
  },
  total_ready_assets: 48,
  daily_posting_rate: 7.0,
  days_of_content_remaining: 6.9,
  alert_level: "GREEN",
};

const QUEUE_TIMELINE: TimelineEntry[] = [
  { platform: "ig", label: "IG", slots: [1, 4, 9] },
  { platform: "reddit", label: "RD", slots: [2, 8, 14] },
  { platform: "x", label: "X", slots: [1, 3, 6, 10, 15] },
  { platform: "tiktok", label: "TT", slots: [0, 5, 10, 14] },
  { platform: "tj", label: "TJ", slots: [0, 6, 12, 18] },
  { platform: "redgifs", label: "RG", slots: [2, 8, 14] },
];

const ACCESS_EDITOR_PLACEHOLDER = JSON.stringify(ACCESS_HUB_DEFAULT_ROWS, null, 2);

// ============================================================================
// TYPES
// ============================================================================

interface WinnerRow {
  master_asset_id: string;
  variant_id: string;
  thumbnail_url: string;
  platform: string;
  posted_at: string;
  bridge_ctr: number;
  revenue_per_view: number;
  revenue_cents: number;
  impressions: number;
  new_subs: number;
  repost_eligible: boolean;
  repost_count: number;
  max_reposts: number;
}

interface TimelineEntry {
  platform: string;
  label: string;
  slots: number[];
}

type SortField = "bridge_ctr" | "revenue_per_view" | "impressions" | "revenue_cents" | "new_subs";
type SortOrder = "asc" | "desc";
type PlatformFilter = "all" | "ig" | "reddit" | "x" | "tiktok" | "tj" | "redgifs";

// ============================================================================
// CONSTANTS
// ============================================================================

const PLATFORM_COLORS: Record<string, string> = {
  ig: "bg-pink-600",
  reddit: "bg-orange-600",
  x: "bg-sky-500",
  tiktok: "bg-neutral-100 text-black",
  tj: "bg-amber-600",
  redgifs: "bg-red-600",
};

const PLATFORM_LABELS: Record<string, string> = {
  ig: "IG",
  reddit: "Reddit",
  x: "X",
  tiktok: "TikTok",
  tj: "TJ",
  redgifs: "RG",
};

const TIMELINE_HOURS = [0, 4, 8, 12, 16, 20, 24];

// ============================================================================
// UTILITIES
// ============================================================================

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function formatRevPerView(n: number): string {
  return `$${n.toFixed(3)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function MetricCard({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub?: string;
  status?: "above" | "below" | "neutral";
}) {
  const borderColor =
    status === "above"
      ? "border-emerald-500/40"
      : status === "below"
        ? "border-red-500/40"
        : "border-neutral-700";
  return (
    <div className={`border ${borderColor} bg-neutral-900 px-5 py-4`}>
      <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-neutral-400">{sub}</div>
      )}
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${PLATFORM_COLORS[platform] ?? "bg-neutral-600"}`}
    >
      {PLATFORM_LABELS[platform] ?? platform}
    </span>
  );
}

function InventoryRow({
  platform,
  data,
}: {
  platform: string;
  data: PlatformCounts;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 py-2 last:border-0">
      <div className="flex items-center gap-2">
        <PlatformBadge platform={platform} />
      </div>
      <div className="flex gap-3 text-xs tabular-nums">
        <span className="text-neutral-400">
          <span className="text-white font-medium">{data.queued}</span> q
        </span>
        <span className="text-neutral-400">
          <span className="text-sky-400 font-medium">{data.scheduled}</span> s
        </span>
        {data.dispatched > 0 && (
          <span className="text-neutral-400">
            <span className="text-violet-400 font-medium">{data.dispatched}</span> disp
          </span>
        )}
        <span className="text-neutral-400">
          <span className="text-emerald-400 font-medium">{data.live}</span> live
        </span>
        {data.failed > 0 && (
          <span className="text-red-400 font-medium">{data.failed} fail</span>
        )}
        {data.manual_only > 0 && (
          <span className="text-amber-400 font-medium">{data.manual_only} manual</span>
        )}
      </div>
    </div>
  );
}

function QueueTimeline({ data }: { data: TimelineEntry[] }) {
  const totalSlots = 24;
  return (
    <div className="border border-neutral-700 bg-neutral-900 p-4">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
        Queue Timeline (next 24h)
      </div>
      <div className="space-y-2">
        {data.map((row) => (
          <div key={row.platform} className="flex items-center gap-3">
            <div className="w-6 text-right text-[10px] font-bold text-neutral-500">
              {row.label}
            </div>
            <div className="relative h-4 flex-1 bg-neutral-800 rounded-sm">
              {/* hour marks */}
              {TIMELINE_HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute top-0 h-full w-px bg-neutral-700"
                  style={{ left: `${(h / totalSlots) * 100}%` }}
                />
              ))}
              {/* now line */}
              <div
                className="absolute top-0 h-full w-px bg-red-500"
                style={{ left: "0%" }}
              />
              {/* posts */}
              {row.slots.map((slot, i) => (
                <div
                  key={i}
                  className={`absolute top-0.5 h-3 w-3 rounded-full border border-neutral-600 ${PLATFORM_COLORS[row.platform] ?? "bg-neutral-500"}`}
                  style={{ left: `${(slot / totalSlots) * 100}%` }}
                  title={`Scheduled at +${slot}h`}
                />
              ))}
            </div>
          </div>
        ))}
        {/* hour labels */}
        <div className="flex items-center gap-3">
          <div className="w-6" />
          <div className="relative flex-1 h-3">
            {TIMELINE_HOURS.map((h) => (
              <div
                key={h}
                className="absolute text-[9px] text-neutral-600 -translate-x-1/2"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                +{h}h
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function Dashboard() {
  const [sortField, setSortField] = useState<SortField>("revenue_per_view");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [repostingId, setRepostingId] = useState<string | null>(null);
  const [accessEditorValue, setAccessEditorValue] = useState(ACCESS_EDITOR_PLACEHOLDER);
  const [accessEditorStatus, setAccessEditorStatus] = useState<"idle" | "saved" | "error">("idle");
  const [accessEditorError, setAccessEditorError] = useState<string | null>(null);
  const [liveInventory, setLiveInventory] = useState<InventoryData | null>(null);

  useEffect(() => {
    async function fetchQueueData() {
      try {
        const res = await fetch("/api/queue?limit=100");
        if (!res.ok) return;
        const { jobs } = await res.json() as { jobs: Array<{ platform: string; status: string }> };

        const platforms: Record<string, PlatformCounts> = {};
        for (const p of ["ig", "reddit", "x", "tiktok", "tj", "redgifs"]) {
          platforms[p] = { queued: 0, scheduled: 0, dispatched: 0, live: 0, failed: 0, manual_only: 0 };
        }
        for (const job of jobs) {
          const bucket = platforms[job.platform];
          if (!bucket) continue;
          if (job.status === "queued") bucket.queued++;
          else if (job.status === "scheduled") bucket.scheduled++;
          else if (job.status === "dispatched") bucket.dispatched++;
          else if (job.status === "published") bucket.live++;
          else if (job.status === "failed") bucket.failed++;
          else if (job.status === "manual_only") bucket.manual_only++;
        }

        const totalQueued = Object.values(platforms).reduce((s, p) => s + p.queued, 0);
        setLiveInventory({
          platforms,
          total_ready_assets: totalQueued,
          daily_posting_rate: INVENTORY_DATA.daily_posting_rate,
          days_of_content_remaining: totalQueued > 0 ? totalQueued / INVENTORY_DATA.daily_posting_rate : 0,
          alert_level: totalQueued < 10 ? "RED" as const : totalQueued < 20 ? "YELLOW" as const : "GREEN" as const,
        });
      } catch {
        // Supabase not configured — fall back to mock data
      }
    }
    fetchQueueData();
  }, []);

  const inventory = liveInventory ?? INVENTORY_DATA;

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
      } else {
        setSortField(field);
        setSortOrder("desc");
      }
    },
    [sortField]
  );

  const handleRepost = useCallback((variant: WinnerRow) => {
    setRepostingId(variant.variant_id);
    // Placeholder for POST /api/dashboard/repost
    console.log("[REPOST]", {
      variant_id: variant.variant_id,
      master_asset_id: variant.master_asset_id,
      platform: variant.platform,
      caption_strategy: "ROTATE",
      timestamp: new Date().toISOString(),
    });
    setTimeout(() => setRepostingId(null), 1200);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(ACCESS_HUB_STORAGE_KEY);
    if (stored) {
      setAccessEditorValue(stored);
    }
  }, []);

  const handleAccessSave = useCallback(() => {
    try {
      const parsed = JSON.parse(accessEditorValue) as AccessHubRow[];
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of rows.");
      }
      localStorage.setItem(ACCESS_HUB_STORAGE_KEY, JSON.stringify(parsed, null, 2));
      setAccessEditorStatus("saved");
      setAccessEditorError(null);
      setTimeout(() => setAccessEditorStatus("idle"), 1500);
    } catch (error) {
      setAccessEditorStatus("error");
      setAccessEditorError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }, [accessEditorValue]);

  const handleAccessReset = useCallback(() => {
    localStorage.removeItem(ACCESS_HUB_STORAGE_KEY);
    setAccessEditorValue(ACCESS_EDITOR_PLACEHOLDER);
    setAccessEditorStatus("saved");
    setAccessEditorError(null);
    setTimeout(() => setAccessEditorStatus("idle"), 1500);
  }, []);

  const sortedWinners = [...WINNERS_DATA]
    .filter((w) => platformFilter === "all" || w.platform === platformFilter)
    .sort((a, b) => {
      const mul = sortOrder === "desc" ? -1 : 1;
      return (a[sortField] - b[sortField]) * mul;
    });

  const ctrStatus: "above" | "below" =
    FUNNEL_DATA.bridge_ctr >= FUNNEL_DATA.bridge_ctr_benchmark ? "above" : "below";

  const inventoryAlertColor =
    inventory.days_of_content_remaining < 3
      ? "text-red-400"
      : inventory.days_of_content_remaining < 5
        ? "text-amber-400"
        : "text-emerald-400";

  const inventoryBarPercent = Math.min(
    (inventory.days_of_content_remaining / 14) * 100,
    100
  );

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-neutral-600 ml-1">&#x2195;</span>;
    return (
      <span className="text-white ml-1">
        {sortOrder === "desc" ? "\u2193" : "\u2191"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      {/* HEADER */}
      <header className="border-b border-neutral-800 bg-neutral-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Command Center
          </h1>
          <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
            Finished
          </span>
          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
            Eva Paradis Content Engine
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/compose"
            className="text-[10px] text-neutral-500 uppercase tracking-wider hover:text-white transition-colors"
          >
            Composer
          </Link>
          <div className="text-[10px] text-neutral-600 tabular-nums uppercase tracking-wider">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            &middot; Ready
          </div>
        </div>
      </header>

      {/* ZONE A: FUNNEL HEALTH */}
      <section className="border-b border-neutral-800 px-6 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Total Traffic"
            value={formatNumber(FUNNEL_DATA.total_traffic)}
            sub={`${FUNNEL_DATA.traffic_by_layout.A.label}: ${formatNumber(FUNNEL_DATA.traffic_by_layout.A.visits)} / ${FUNNEL_DATA.traffic_by_layout.B.label}: ${formatNumber(FUNNEL_DATA.traffic_by_layout.B.visits)}`}
            status="neutral"
          />
          <MetricCard
            label="Bridge CTR"
            value={formatPercent(FUNNEL_DATA.bridge_ctr)}
            sub={`${ctrStatus === "above" ? "\u25B2" : "\u25BC"} vs ${formatPercent(FUNNEL_DATA.bridge_ctr_benchmark)} benchmark`}
            status={ctrStatus}
          />
          <MetricCard
            label="Net Revenue"
            value={formatCurrency(FUNNEL_DATA.net_revenue_today_cents)}
            sub="today"
            status="neutral"
          />
          <MetricCard
            label="New Subs"
            value={formatNumber(FUNNEL_DATA.total_subs)}
            sub="lifetime"
            status="neutral"
          />
        </div>
      </section>

      {/* BODY: ZONE B + ZONE C */}
      <div className="flex flex-col lg:flex-row">
        {/* ZONE B: WINNER FEED */}
        <main className="flex-1 border-r border-neutral-800 px-6 py-4">
          {/* Controls */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
              Winner Feed &middot;{" "}
              <span className="text-white">{sortedWinners.length}</span> assets
            </div>
            <div className="flex gap-1">
              {(["all", "ig", "reddit", "x", "tiktok", "tj", "redgifs"] as PlatformFilter[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                      platformFilter === p
                        ? "border-white bg-white text-black"
                        : "border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {p === "all" ? "All" : PLATFORM_LABELS[p]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  <th className="py-2 pr-3 text-left w-10">&nbsp;</th>
                  <th className="py-2 pr-3 text-left">Origin</th>
                  <th className="py-2 pr-3 text-left">Age</th>
                  <th
                    className="py-2 pr-3 text-right cursor-pointer select-none hover:text-neutral-300"
                    onClick={() => handleSort("bridge_ctr")}
                  >
                    Bridge CTR
                    <SortIndicator field="bridge_ctr" />
                  </th>
                  <th
                    className="py-2 pr-3 text-right cursor-pointer select-none hover:text-neutral-300"
                    onClick={() => handleSort("revenue_per_view")}
                  >
                    Rev/View
                    <SortIndicator field="revenue_per_view" />
                  </th>
                  <th
                    className="py-2 pr-3 text-right cursor-pointer select-none hover:text-neutral-300"
                    onClick={() => handleSort("impressions")}
                  >
                    Views
                    <SortIndicator field="impressions" />
                  </th>
                  <th
                    className="py-2 pr-3 text-right cursor-pointer select-none hover:text-neutral-300"
                    onClick={() => handleSort("revenue_cents")}
                  >
                    Revenue
                    <SortIndicator field="revenue_cents" />
                  </th>
                  <th
                    className="py-2 pr-3 text-right cursor-pointer select-none hover:text-neutral-300"
                    onClick={() => handleSort("new_subs")}
                  >
                    Subs
                    <SortIndicator field="new_subs" />
                  </th>
                  <th className="py-2 text-right w-28">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {sortedWinners.map((w, i) => {
                  const ctrHigh = w.bridge_ctr >= FUNNEL_DATA.bridge_ctr_benchmark;
                  const isReposting = repostingId === w.variant_id;
                  return (
                    <tr
                      key={w.variant_id}
                      className={`border-b border-neutral-800/60 hover:bg-neutral-900/80 ${
                        i === 0 ? "bg-neutral-900/40" : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <td className="py-2.5 pr-3">
                        <div className="h-8 w-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-600 font-mono">
                          {i + 1}
                        </div>
                      </td>
                      {/* Platform */}
                      <td className="py-2.5 pr-3">
                        <PlatformBadge platform={w.platform} />
                      </td>
                      {/* Age */}
                      <td className="py-2.5 pr-3 text-neutral-500 tabular-nums">
                        {timeAgo(w.posted_at)}
                      </td>
                      {/* CTR */}
                      <td
                        className={`py-2.5 pr-3 text-right font-bold tabular-nums ${
                          ctrHigh ? "text-emerald-400" : "text-neutral-300"
                        }`}
                      >
                        {formatPercent(w.bridge_ctr)}
                      </td>
                      {/* Rev/View */}
                      <td className="py-2.5 pr-3 text-right tabular-nums text-white font-medium">
                        {formatRevPerView(w.revenue_per_view)}
                      </td>
                      {/* Views */}
                      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-400">
                        {formatNumber(w.impressions)}
                      </td>
                      {/* Revenue */}
                      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-300">
                        {formatCurrency(w.revenue_cents)}
                      </td>
                      {/* Subs */}
                      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-400">
                        +{w.new_subs}
                      </td>
                      {/* Action */}
                      <td className="py-2.5 text-right">
                        {w.repost_eligible ? (
                          <button
                            onClick={() => handleRepost(w)}
                            disabled={isReposting}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                              isReposting
                                ? "border-emerald-600 bg-emerald-900/30 text-emerald-400 cursor-wait"
                                : "border-neutral-600 text-neutral-300 hover:border-white hover:bg-white hover:text-black"
                            }`}
                          >
                            {isReposting ? "Queued" : "Repost"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
                            {w.repost_count}/{w.max_reposts} used
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sortedWinners.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-neutral-600 text-sm"
                    >
                      No winners for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* ZONE C: INVENTORY HEALTH */}
        <aside className="w-full lg:w-72 shrink-0 px-6 py-4 space-y-5">
          {/* Days Remaining */}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 mb-2">
              Content Inventory
            </div>
            <div className={`text-2xl font-bold tabular-nums ${inventoryAlertColor}`}>
              {inventory.days_of_content_remaining.toFixed(1)}
              <span className="text-sm font-normal text-neutral-500 ml-1">
                days
              </span>
            </div>
            {/* Bar */}
            <div className="mt-2 h-2 w-full bg-neutral-800 rounded-sm overflow-hidden">
              <div
                className={`h-full ${
                  inventory.days_of_content_remaining < 3
                    ? "bg-red-500"
                    : inventory.days_of_content_remaining < 5
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${inventoryBarPercent}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-600 tabular-nums">
              <span>{inventory.total_ready_assets} assets ready</span>
              <span>{inventory.daily_posting_rate}/day</span>
            </div>
            {inventory.days_of_content_remaining < 3 && (
              <div className="mt-2 border border-red-500/30 bg-red-950/30 px-3 py-2 text-[11px] text-red-400">
                CRITICAL: Content inventory below 3-day threshold. Upload new assets.
              </div>
            )}
          </div>

          {/* Platform Breakdown */}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 mb-2">
              By Platform
            </div>
            <div className="border border-neutral-800 bg-neutral-900 p-3">
              {(
                Object.entries(inventory.platforms) as [string, PlatformCounts][]
              ).map(([platform, data]) => (
                <InventoryRow key={platform} platform={platform} data={data} />
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border border-neutral-800 bg-neutral-900 p-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500 uppercase tracking-wider">Total Live</span>
              <span className="text-white font-bold tabular-nums">
                {Object.values(inventory.platforms).reduce(
                  (s, p) => s + p.live,
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500 uppercase tracking-wider">Total Failed</span>
              <span
                className={`font-bold tabular-nums ${
                  Object.values(inventory.platforms).reduce(
                    (s, p) => s + p.failed,
                    0
                  ) > 0
                    ? "text-red-400"
                    : "text-neutral-500"
                }`}
              >
                {Object.values(inventory.platforms).reduce(
                  (s, p) => s + p.failed,
                  0
                )}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* ZONE D: QUEUE TIMELINE */}
      <section className="border-t border-neutral-800 px-6 py-4">
        <QueueTimeline data={QUEUE_TIMELINE} />
      </section>

      {/* ACCESS HUB EDITOR */}
      <section className="border-t border-neutral-800 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
              Access Hub Editor
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              Update the `/access` page by editing the JSON rows below.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/access"
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-neutral-700 text-neutral-300 hover:border-white hover:bg-white hover:text-black"
              target="_blank"
              rel="noreferrer"
            >
              Open /access
            </Link>
            <button
              onClick={handleAccessReset}
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-neutral-700 text-neutral-300 hover:border-white hover:bg-white hover:text-black"
            >
              Reset
            </button>
            <button
              onClick={handleAccessSave}
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-500 text-emerald-300 hover:bg-emerald-500 hover:text-black"
            >
              Save
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="border border-neutral-800 bg-neutral-900 p-3">
            <textarea
              className="h-72 w-full resize-y bg-transparent text-xs text-neutral-200 outline-none font-mono"
              aria-label="Access hub JSON editor"
              value={accessEditorValue}
              onChange={(e) => setAccessEditorValue(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="border border-neutral-800 bg-neutral-900 p-4 text-xs text-neutral-400 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">
              Status
            </div>
            {accessEditorStatus === "saved" && (
              <div className="text-emerald-400">Saved to browser storage.</div>
            )}
            {accessEditorStatus === "error" && (
              <div className="text-red-400">Error: {accessEditorError}</div>
            )}
            {accessEditorStatus === "idle" && (
              <div className="text-neutral-500">
                Saved data loads on `/access` automatically.
              </div>
            )}
            <div className="border-t border-neutral-800 pt-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
                Format
              </div>
              <div className="text-neutral-500">
                Array of objects with keys:
              </div>
              <div className="mt-1 text-neutral-300">
                platform, url, twoFaMethod, twoFaDestination, access, owner, notes
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
