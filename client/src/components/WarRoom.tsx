import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Target,
  Zap,
  FileText,
  Activity,
  Users,
  DollarSign,
  BarChart3,
  Globe,
  MessageCircle,
  Mail,
  Smartphone,
  Radio,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
type VerifyStatus = "verified" | "needs_verify" | "estimated";
type RiskLevel = "HIGH" | "MEDIUM" | "LOW";
type ComponentStatus = "LIVE" | "BUILT" | "PARTIAL" | "NOT STARTED" | "BLOCKED" | "STALLED";
type Priority = "VERY HIGH" | "HIGH" | "MEDIUM-HIGH" | "MEDIUM" | "LOW" | "NONE";

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  status: VerifyStatus;
}

interface Whale {
  name: string;
  badge?: string;
  note: string;
  ltv: number;
  lastActive: string;
  risk: RiskLevel;
  subs: number;
  messages: number;
  tips: number;
}

interface Initiative {
  rank: number;
  status: ComponentStatus;
  name: string;
  priority: Priority;
  current: string;
  effort: string;
  next: string;
}

interface SystemComponent {
  status: ComponentStatus;
  name: string;
  detail: string;
}

interface DocConflict {
  title: string;
  docA: string;
  docB: string;
  verdict: string;
}

interface KeyMetric {
  label: string;
  current: string;
  target: string;
  pct: number;
  status: VerifyStatus;
}

interface RevenueRow {
  stream: string;
  gross: string;
  net: string;
  share: string;
  trend: string;
  trendDir: "up" | "down" | "flat";
}

// ─── Data ────────────────────────────────────────────────────────
const KPI_CARDS: KpiCard[] = [
  { label: "MONTHLY NET", value: "$7,266", sub: "Last 30 days", status: "verified" },
  { label: "TOP RANK", value: "2.8%", sub: "Of all creators", status: "verified" },
  { label: "ALL-TIME SUBS", value: "65,255", sub: "56K new / 9.2K renews", status: "needs_verify" },
  { label: "RENEW RATE", value: "16.5%", sub: "83.5% churn after 1st period", status: "needs_verify" },
  { label: "LIFETIME SUB $", value: "$272,883", sub: "All-time subscription earnings", status: "needs_verify" },
  { label: "WHALES AT RISK", value: "3", sub: "Charles, mrwan, Simone", status: "estimated" },
];

const REVENUE_ROWS: RevenueRow[] = [
  { stream: "Subscriptions", gross: "$1,207", net: "$965", share: "13%", trend: "-15.2%", trendDir: "down" },
  { stream: "Messages / PPV", gross: "$5,083", net: "$4,546", share: "63%", trend: "-4.9%", trendDir: "down" },
  { stream: "Tips", gross: "$2,194", net: "$1,755", share: "24%", trend: "+118.1%", trendDir: "up" },
];

const WHALES: Whale[] = [
  { name: "Charles_Peligro", badge: "LIFETIME VIP", note: "#1 ALL-TIME — Rebill OFF, expires Feb 18. 5-year fan. URGENT re-engage.", ltv: 4192, lastActive: "Feb 3", risk: "HIGH", subs: 243, messages: 1505, tips: 2445 },
  { name: "mrwan", badge: "DIAMOND VIP", note: "High spender — 16 days inactive", ltv: 1030, lastActive: "Jan 28", risk: "HIGH", subs: 32, messages: 438, tips: 560 },
  { name: "Simone", badge: "LIFETIME VIP", note: "Custom content buyer — 11 days inactive", ltv: 1174, lastActive: "Feb 2", risk: "MEDIUM", subs: 147, messages: 302, tips: 726 },
  { name: "Lidovale_Traine", note: "#2 Subs, #3 Messages", ltv: 2134, lastActive: "—", risk: "LOW", subs: 509, messages: 1282, tips: 0 },
  { name: "Johnny", note: "#2 Tipper", ltv: 1780, lastActive: "—", risk: "LOW", subs: 0, messages: 0, tips: 1361 },
  { name: "cemsss", note: "#4 Tipper", ltv: 1755, lastActive: "—", risk: "LOW", subs: 0, messages: 0, tips: 1108 },
  { name: "u6932549", note: "#8 Subs, #4 Messages", ltv: 1691, lastActive: "—", risk: "LOW", subs: 424, messages: 1074, tips: 0 },
  { name: "Rad", note: "#3 Tipper", ltv: 1475, lastActive: "—", risk: "LOW", subs: 0, messages: 0, tips: 1143 },
  { name: "jose", note: "#5 Messages buyer", ltv: 1442, lastActive: "—", risk: "LOW", subs: 0, messages: 1054, tips: 0 },
  { name: "chito754", note: "#7 Messages buyer", ltv: 1241, lastActive: "—", risk: "LOW", subs: 0, messages: 874, tips: 0 },
  { name: "Alberto/Italy", badge: "LIFETIME VIP", note: "Heavy PPV buyer", ltv: 1162, lastActive: "Feb 9", risk: "LOW", subs: 106, messages: 756, tips: 300 },
  { name: "knlzft", note: "#8 Messages buyer", ltv: 1086, lastActive: "—", risk: "LOW", subs: 0, messages: 826, tips: 0 },
  { name: "Iskander", note: "#5 Subs", ltv: 1025, lastActive: "—", risk: "LOW", subs: 463, messages: 0, tips: 0 },
];

const INITIATIVES: Initiative[] = [
  { rank: 1, status: "NOT STARTED", name: "Whale retention — Charles expires Feb 18", priority: "VERY HIGH", current: "No system in place", effort: "Low", next: "DM outreach NOW" },
  { rank: 2, status: "PARTIAL", name: "Email capture → welcome sequence → sub recovery", priority: "VERY HIGH", current: "UI built, no backend", effort: "Medium", next: "Connect Brevo, build 4-email sequence" },
  { rank: 3, status: "PARTIAL", name: "PPV cadence optimization — coordinate w/ PPV team", priority: "VERY HIGH", current: "Active but uncoordinated", effort: "Low", next: "Align on calendar" },
  { rank: 4, status: "LIVE", name: "Bridge page with working IG Story link", priority: "HIGH", current: "LIVE — PR #10 merged", effort: "Done", next: "Done" },
  { rank: 5, status: "BUILT", name: "Reddit content pipeline (Phase 2)", priority: "HIGH", current: "Built (manual mode)", effort: "Low", next: "Start using it" },
  { rank: 6, status: "PARTIAL", name: "DM scripts with UTM tracking", priority: "MEDIUM-HIGH", current: "Written, not deployed", effort: "Low", next: "Start sending manually" },
  { rank: 7, status: "NOT STARTED", name: "Meta/X pixel installation", priority: "MEDIUM", current: "Not started", effort: "Low", next: "Add pixel code to bridge page" },
  { rank: 8, status: "PARTIAL", name: "Sub funnel volume — maximize free/cheap trial entries", priority: "MEDIUM", current: "Active but untracked", effort: "Low", next: "Track promo conversion to PPV buyers" },
  { rank: 9, status: "PARTIAL", name: "X/Twitter content cadence", priority: "MEDIUM", current: "Sporadic", effort: "Low", next: "Follow the content calendar" },
  { rank: 10, status: "PARTIAL", name: "TikTok growth", priority: "MEDIUM", current: "8K followers, low output", effort: "Medium", next: "Daily content production" },
  { rank: 11, status: "BLOCKED", name: "Retargeting ads", priority: "MEDIUM", current: "Blocked by pixels", effort: "Medium", next: "Needs 1,000+ pixel audience first" },
  { rank: 12, status: "STALLED", name: "Press coverage (PR Package)", priority: "LOW", current: "Not started", effort: "Medium", next: "Need someone to send pitches" },
  { rank: 13, status: "BLOCKED", name: "Wikipedia article", priority: "NONE", current: "Blocked until Phase 3", effort: "High", next: "Needs press placements first" },
];

const SYSTEM_COMPONENTS: SystemComponent[] = [
  { status: "LIVE", name: "Bridge Page (evaparadis.net)", detail: "Hero video, 'Get To Know Me' button, routes to OF" },
  { status: "LIVE", name: "/go Server-Side Relay", detail: "302 redirect — neutral for IG crawlers" },
  { status: "LIVE", name: "/go/of Server-Side Relay", detail: "302 redirect to OF — obfuscated URL deployed" },
  { status: "LIVE", name: "PPV / Messaging Revenue", detail: "$4,546/mo net — primary revenue driver" },
  { status: "PARTIAL", name: "/capture Email Capture", detail: "UI exists, stores to localStorage only" },
  { status: "BUILT", name: "/vip Preview Page", detail: "Exists in codebase, referenced in DM scripts" },
  { status: "BUILT", name: "/telegram Opt-in Page", detail: "Exists in codebase" },
  { status: "BUILT", name: "/email Capture Page", detail: "Separate email capture route" },
  { status: "BUILT", name: "Reddit + RedGifs Pipeline", detail: "Dashboard at /dashboard, manual wizard" },
  { status: "BLOCKED", name: "Auto-mode (Reddit/RedGifs API)", detail: "Requires API credentials in env vars" },
  { status: "PARTIAL", name: "DM Scripts", detail: "Written, not automated — copy/paste templates" },
  { status: "NOT STARTED", name: "Email/SMS CRM", detail: "No Brevo, no Twilio, no email delivery connected" },
  { status: "NOT STARTED", name: "Pixel Tracking (Meta/X/GA4)", detail: "No pixel code in the bridge page" },
  { status: "BLOCKED", name: "Retargeting Campaigns", detail: "Depends on pixel data that doesn't exist yet" },
  { status: "LIVE", name: "OF Pricing Model", detail: "Loss-leader: $3 or free trial → monetize via PPV + tips" },
  { status: "STALLED", name: "Press Outreach", detail: "PR Package written but no pitches sent" },
  { status: "BLOCKED", name: "Wikipedia Draft", detail: "Correctly blocked — needs 2+ independent sources first" },
];

const DOC_CONFLICTS: DocConflict[] = [
  { title: "SUBSCRIPTION MODEL", docA: "Revenue Strategy: raise price to $9.99", docB: "Actual model: $3 or free trial as loss leader", verdict: "Subs are a funnel entry, not a revenue source. Optimize for volume of new subs entering the PPV funnel, not sub price." },
  { title: "PPV STATUS", docA: "Strategy listed PPV as 'not started'", docB: "Actual: PPV team active, $4,546/mo net", verdict: "PPV is the primary revenue engine. Coordinate with existing team, don't build from scratch." },
  { title: "LANDING PAGE PLATFORM", docA: "Revenue Strategy: WordPress + Elementor", docB: "Current system: React + Vercel", verdict: "Keep React/Vercel. It's built, deployed, and working." },
  { title: "EMAIL CRM", docA: "Revenue Strategy: Brevo", docB: "Current: localStorage only", verdict: "Adopt Brevo. Free tier handles 300 emails/day. Critical for churn recovery." },
  { title: "PR TIMELINE", docA: "PR Package: Month 1 = Jan 2026", docB: "Reality: Feb 2026, nothing sent", verdict: "Start now. Send Tier 1 + Tier 4 pitches this week." },
];

const KEY_METRICS: KeyMetric[] = [
  { label: "MONTHLY NET", current: "$7,266", target: "$15,000", pct: 48, status: "verified" },
  { label: "PPV REVENUE", current: "$4,546", target: "$8,000", pct: 57, status: "verified" },
  { label: "TIPS (30D)", current: "$1,755", target: "$3,000", pct: 59, status: "verified" },
  { label: "SUB REVENUE", current: "$965", target: "$2,500", pct: 39, status: "verified" },
  { label: "CREATOR RANK", current: "Top 2.8%", target: "Top 1%", pct: 72, status: "verified" },
  { label: "EMAIL LIST", current: "0", target: "3,000", pct: 0, status: "needs_verify" },
  { label: "PRESS PLACEMENTS", current: "0", target: "4-5", pct: 0, status: "needs_verify" },
  { label: "WHALES AT RISK", current: "3", target: "0", pct: 100, status: "estimated" },
];

const PRIORITY_ACTIONS = {
  thisWeek: [
    { text: "DONE: PR #10 merged — IG Story link now live at evaparadis.net", owner: "Erik", done: true },
    { text: "URGENT: Re-engage Charles_Peligro — #1 all-time ($4,192 LTV), rebill OFF, expires Feb 18", owner: "Eva / PPV Team", done: false },
    { text: "Re-engage mrwan (DIAMOND VIP) — 16 days inactive, $1,030 LTV at risk", owner: "Eva / PPV Team", done: false },
    { text: "Check on Simone — 11 days inactive, $1,174 LTV", owner: "Eva / PPV Team", done: false },
    { text: "Connect email capture to Brevo for churned sub recovery", owner: "Manus + Erik", done: false, auto: true },
  ],
  next2Weeks: [
    { text: "Start using the Reddit pipeline — upload content, post to 2-3 subreddits", owner: "Eva / Erik" },
    { text: "Install Meta and GA4 pixels on the bridge page", owner: "Manus", auto: true },
    { text: "Coordinate with PPV team on content calendar — tease Mon, release Wed, mass DM Fri", owner: "Erik + PPV Team" },
    { text: "Analyze promo vs full-price sub conversion rates", owner: "Erik" },
  ],
  next30Days: [
    { text: "Begin DM outreach using scripts — start with Reddit, 10-15/day", owner: "Eva / Erik" },
    { text: "Send Tier 1 press pitches (AVN, XBIZ)", owner: "Publicist / Erik" },
    { text: "Add UTM parameters to all social bio links", owner: "Manus", auto: true },
    { text: "Build whale early-warning system — alert when top fans go inactive 7+ days", owner: "Manus + Erik" },
  ],
};

const FUNNEL_HEALTH = [
  { label: "IG → Bridge", value: "~7-18K", sub: "Story viewers/day", color: "text-green-400" },
  { label: "Bridge → OF", value: "0.09%", sub: "Conversion rate", color: "text-amber-400" },
  { label: "Sub → PPV Buyer", value: "~15%", sub: "Estimated", color: "text-green-400" },
  { label: "Recovery Rate", value: "0%", sub: "No email/retargeting", color: "text-red-400" },
];

// ─── Helper Components ───────────────────────────────────────────

function StatusBadge({ status }: { status: VerifyStatus }) {
  if (status === "verified") return <span className="text-green-400 text-xs">✅</span>;
  if (status === "needs_verify") return <span className="text-amber-400 text-xs">🔍</span>;
  return <span className="text-amber-500 text-xs">⚠️</span>;
}

function ComponentStatusBadge({ status }: { status: ComponentStatus }) {
  const colors: Record<ComponentStatus, string> = {
    LIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    BUILT: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    PARTIAL: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "NOT STARTED": "bg-gray-500/20 text-gray-400 border-gray-500/30",
    BLOCKED: "bg-red-500/20 text-red-400 border-red-500/30",
    STALLED: "bg-red-500/20 text-orange-400 border-orange-500/30",
  };
  const dotColors: Record<ComponentStatus, string> = {
    LIVE: "bg-green-400",
    BUILT: "bg-teal-400",
    PARTIAL: "bg-amber-400",
    "NOT STARTED": "bg-gray-400",
    BLOCKED: "bg-red-400",
    STALLED: "bg-orange-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${colors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const colors: Record<Priority, string> = {
    "VERY HIGH": "bg-red-600/80 text-white",
    HIGH: "bg-amber-600/80 text-white",
    "MEDIUM-HIGH": "bg-amber-500/60 text-amber-100",
    MEDIUM: "bg-yellow-600/60 text-yellow-100",
    LOW: "bg-gray-600/60 text-gray-300",
    NONE: "bg-gray-700/60 text-gray-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${colors[priority]}`}>
      {priority}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    HIGH: "text-red-400",
    MEDIUM: "text-amber-400",
    LOW: "text-green-400",
  };
  return <span className={`text-xs font-mono uppercase ${colors[risk]}`}>{risk}</span>;
}

function CollapsibleSection({
  title,
  badge,
  subtitle,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  badge?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const open = isOpen;
  return (
    <div className="border border-dashed border-amber-500/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
          <span className="text-white font-mono text-sm uppercase tracking-wider">{title}</span>
          {badge}
        </div>
        {subtitle && <span className="text-white/40 text-xs font-mono hidden sm:block">{subtitle}</span>}
      </button>
      {open && <div className="px-4 pb-4 border-t border-white/5">{children}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

const SECTION_KEYS = [
  "priority", "funnel", "revenue", "lifetime", "whales",
  "initiatives", "system", "strategy", "conflicts", "metrics",
] as const;
type SectionKey = typeof SECTION_KEYS[number];

export default function WarRoom() {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set());
  const allOpen = openSections.size === SECTION_KEYS.length;

  const toggleAll = () => {
    if (allOpen) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(SECTION_KEYS));
    }
  };

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h2 className="text-lg font-mono text-white uppercase tracking-wider">
            Eva Paradis — War Room
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAll}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 uppercase tracking-wider"
          >
            {allOpen ? "Collapse All" : "Expand All"}
          </button>
          <span className="text-xs font-mono text-white/30">
            Last Updated: Feb 13, 2026
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                {kpi.label}
              </span>
              <StatusBadge status={kpi.status} />
            </div>
            <p className="text-xl font-bold text-white font-mono">{kpi.value}</p>
            <p className="text-[10px] text-white/40">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Data Legend */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
        <span>DATA:</span>
        <span className="flex items-center gap-1">✅ Verified from OF Stats PDF</span>
        <span className="flex items-center gap-1">🔍 Needs verification</span>
        <span className="flex items-center gap-1">⚠️ Estimated</span>
      </div>

      {/* ── Priority Actions ── */}
      <CollapsibleSection
        title="Priority Actions"
        badge={<span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-600/80 text-white">Action Required</span>}
        subtitle="Ordered by revenue impact — whale retention first"
        isOpen={openSections.has("priority")}
        onToggle={() => toggleSection("priority")}
      >
        <div className="space-y-6 pt-4">
          {/* This Week */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">This Week</span>
            </div>
            <div className="space-y-2">
              {PRIORITY_ACTIONS.thisWeek.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-start gap-3">
                    <span className="text-white/30 text-xs font-mono w-4 flex-shrink-0 pt-0.5">{i + 1}</span>
                    <span className={`text-sm ${item.done ? "text-white/40 line-through" : "text-white/90"}`}>
                      {item.done && "✅ "}{item.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-white/40 font-mono">{item.owner}</span>
                    {item.auto && <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">⚡ AUTO</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Next 2 Weeks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Next 2 Weeks</span>
            </div>
            <div className="space-y-2">
              {PRIORITY_ACTIONS.next2Weeks.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-start gap-3">
                    <span className="text-white/30 text-xs font-mono w-4 flex-shrink-0 pt-0.5">{i + 1}</span>
                    <span className="text-sm text-white/90">{item.text}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-white/40 font-mono">{item.owner}</span>
                    {item.auto && <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">⚡ AUTO</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Next 30 Days */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Next 30 Days</span>
            </div>
            <div className="space-y-2">
              {PRIORITY_ACTIONS.next30Days.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-start gap-3">
                    <span className="text-white/30 text-xs font-mono w-4 flex-shrink-0 pt-0.5">{i + 1}</span>
                    <span className="text-sm text-white/90">{item.text}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-white/40 font-mono">{item.owner}</span>
                    {item.auto && <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">⚡ AUTO</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Acquisition Funnel ── */}
      <CollapsibleSection
        title="Acquisition Funnel"
        subtitle="Complete traffic → conversion → revenue flow"
        isOpen={openSections.has("funnel")}
        onToggle={() => toggleSection("funnel")}
      >
        <div className="pt-4 space-y-6">
          {/* Traffic Sources */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">1</span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Traffic Sources</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { name: "Instagram", detail: "367K followers", status: "LIVE" as ComponentStatus },
                { name: "Reddit", detail: "Pipeline built, unused", status: "PARTIAL" as ComponentStatus },
                { name: "X / Twitter", detail: "Sporadic posting", status: "PARTIAL" as ComponentStatus },
                { name: "TikTok", detail: "8K followers", status: "PARTIAL" as ComponentStatus },
                { name: "DM Outreach", detail: "Scripts written", status: "PARTIAL" as ComponentStatus },
              ].map((src) => (
                <div key={src.name} className={`p-3 rounded border ${src.status === "LIVE" ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                  <ComponentStatusBadge status={src.status} />
                  <p className="text-white text-sm font-medium mt-1">{src.name}</p>
                  <p className="text-white/40 text-[10px]">{src.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center text-white/20 text-xs font-mono">↓ CLICK LINK</div>

          {/* Bridge Page */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">2</span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Bridge Page</span>
            </div>
            <div className="flex justify-center">
              <div className="p-3 rounded border border-green-500/30 bg-green-500/5 w-64 text-center">
                <ComponentStatusBadge status="LIVE" />
                <p className="text-white text-sm font-medium mt-1">evaparadis.net</p>
                <p className="text-white/40 text-[10px]">Bridge Page</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-white/20 text-xs font-mono gap-12">
            <span>↓ CLICKS CTA</span>
            <span>or</span>
            <span>↓ BOUNCES</span>
          </div>

          {/* Conversion Gate */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">3</span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Conversion Gate</span>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="p-3 rounded border border-green-500/30 bg-green-500/5">
                <ComponentStatusBadge status="LIVE" />
                <p className="text-white text-sm font-medium mt-1">OF Subscribe</p>
                <p className="text-white/40 text-[10px]">$3 or Free Trial</p>
              </div>
              <div className="p-3 rounded border border-red-500/30 bg-red-500/5">
                <ComponentStatusBadge status="NOT STARTED" />
                <p className="text-white text-sm font-medium mt-1">Email Capture</p>
                <p className="text-white/40 text-[10px]">For non-converters</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-white/20 text-xs font-mono gap-12">
            <span>↓ SUBSCRIBES</span>
            <span>↓ GIVES EMAIL</span>
          </div>

          {/* Revenue Streams */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">4</span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Revenue Streams</span>
              <span className="text-xs font-mono text-green-400">$7,266/mo net</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "PPV / Messages", detail: "$4,546/mo net" },
                { name: "Tips", detail: "$1,755/mo net" },
                { name: "Sub Revenue", detail: "$965/mo net" },
              ].map((s) => (
                <div key={s.name} className="p-3 rounded border border-green-500/30 bg-green-500/5">
                  <ComponentStatusBadge status="LIVE" />
                  <p className="text-white text-sm font-medium mt-1">{s.name}</p>
                  <p className="text-white/40 text-[10px]">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center text-white/20 text-xs font-mono">↓ CHURNS / DOESN'T CONVERT</div>

          {/* Recovery Loop */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">5</span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Recovery Loop</span>
              <span className="text-xs font-mono text-red-400 uppercase">Not Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="p-3 rounded border border-red-500/30 bg-red-500/5">
                <ComponentStatusBadge status="NOT STARTED" />
                <p className="text-white text-sm font-medium mt-1">Email Recovery</p>
                <p className="text-white/40 text-[10px]">4-email welcome sequence</p>
              </div>
              <div className="p-3 rounded border border-red-500/30 bg-red-500/5">
                <ComponentStatusBadge status="BLOCKED" />
                <p className="text-white text-sm font-medium mt-1">Retargeting Ads</p>
                <p className="text-white/40 text-[10px]">Meta / X pixels</p>
              </div>
            </div>
            <div className="mt-3 p-3 rounded bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                <strong>No recovery loop exists.</strong> Every visitor who doesn't subscribe on their first visit is lost permanently. Email capture + retargeting pixels would create a second chance to convert. This is the single biggest revenue leak in the funnel.
              </p>
            </div>
          </div>

          {/* Funnel Health Summary */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
            <p className="text-xs font-mono text-white/50 uppercase tracking-wider mb-3">Funnel Health Summary</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FUNNEL_HEALTH.map((f) => (
                <div key={f.label} className="text-center p-3 rounded bg-white/5">
                  <p className="text-[10px] font-mono text-white/40">{f.label}</p>
                  <p className={`text-lg font-bold font-mono ${f.color}`}>{f.value}</p>
                  <p className="text-[10px] text-white/30">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Revenue Breakdown ── */}
      <CollapsibleSection
        title="Revenue Breakdown"
        badge={<span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-600/80 text-white">✅ VERIFIED</span>}
        subtitle="$7,266 net — Jan 14 – Feb 13, 2026"
        isOpen={openSections.has("revenue")}
        onToggle={() => toggleSection("revenue")}
      >
        <div className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">
                  <th className="pb-2 pr-4">Stream</th>
                  <th className="pb-2 pr-4 text-right">Gross</th>
                  <th className="pb-2 pr-4 text-right">Net</th>
                  <th className="pb-2 pr-4 text-right">Share</th>
                  <th className="pb-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_ROWS.map((row) => (
                  <tr key={row.stream} className="border-t border-white/5">
                    <td className="py-2 pr-4 text-white/80 flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      {row.stream}
                    </td>
                    <td className="py-2 pr-4 text-right text-white/60 font-mono">{row.gross}</td>
                    <td className="py-2 pr-4 text-right text-white font-mono font-bold">{row.net}</td>
                    <td className="py-2 pr-4 text-right text-white/60 font-mono">{row.share}</td>
                    <td className={`py-2 text-right font-mono ${row.trendDir === "up" ? "text-green-400" : "text-red-400"}`}>
                      {row.trendDir === "up" ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                      {row.trend}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/10 font-bold">
                  <td className="py-2 pr-4 text-white">Total</td>
                  <td className="py-2 pr-4 text-right text-white/60 font-mono">$9,083</td>
                  <td className="py-2 pr-4 text-right text-white font-mono">$7,266</td>
                  <td className="py-2 pr-4 text-right text-white/60 font-mono">100%</td>
                  <td className="py-2 text-right text-white/40 font-mono">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 rounded bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-xs">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              <strong>Subscription revenue is declining (-15.2%).</strong> Subs are the loss-leader funnel entry — most come in at $3 or free. But PPV ($4,546) and tips ($1,755) depend on having subscribers to sell to. If the sub base shrinks, all revenue follows.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Account Lifetime ── */}
      <CollapsibleSection
        title="Account Lifetime"
        badge={<span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-600/80 text-white">🔍 NEEDS VERIFY</span>}
        subtitle="All-time metrics (Jun 28, 2017 – Feb 13, 2026)"
        isOpen={openSections.has("lifetime")}
        onToggle={() => toggleSection("lifetime")}
      >
        <div className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Total Subs</p>
              <p className="text-2xl font-bold text-white font-mono">65,255</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">New / Renews</p>
              <p className="text-2xl font-bold text-white font-mono">56,021 <span className="text-white/40 text-sm">/ 9,234</span></p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Renew Rate</p>
              <p className="text-2xl font-bold text-red-400 font-mono">16.5%</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Lifetime Sub Revenue</p>
              <p className="text-2xl font-bold text-white font-mono">$272,883</p>
            </div>
          </div>
          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-xs">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              <strong>83.5% of subscribers churn after their first billing period.</strong> With most entering at $3 or free, the window to convert them into PPV buyers is narrow. The funnel depends on immediate engagement after subscription.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Whale Watch ── */}
      <CollapsibleSection
        title="Whale Watch"
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/60">15</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600/80 text-white">3 AT RISK</span>
          </div>
        }
        subtitle="Top 15 fans by lifetime value"
        isOpen={openSections.has("whales")}
        onToggle={() => toggleSection("whales")}
      >
        <div className="pt-4 space-y-3">
          {WHALES.map((w) => (
            <div
              key={w.name}
              className={`p-3 rounded border ${
                w.risk === "HIGH"
                  ? "border-red-500/30 bg-red-500/5"
                  : w.risk === "MEDIUM"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className={`w-4 h-4 ${w.risk === "HIGH" ? "text-red-400" : w.risk === "MEDIUM" ? "text-amber-400" : "text-white/30"}`} />
                  <span className="text-white font-medium text-sm">{w.name}</span>
                  {w.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400">{w.badge}</span>
                  )}
                  <span className="text-white/40 text-xs">—</span>
                  <span className="text-white/50 text-xs">{w.note}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0">
                  <div className="text-right">
                    <span className="text-white/40">LTV</span>
                    <p className="text-white font-bold">${w.ltv.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40">LAST ACTIVE</span>
                    <p className={w.risk === "HIGH" ? "text-red-400" : w.risk === "MEDIUM" ? "text-amber-400" : "text-white/60"}>{w.lastActive}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40">RISK</span>
                    <p><RiskBadge risk={w.risk} /></p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded p-2 text-center">
                  <p className="text-[10px] font-mono text-white/30">Subs</p>
                  <p className="text-sm font-mono text-white/70">${w.subs}</p>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <p className="text-[10px] font-mono text-white/30">Messages</p>
                  <p className="text-sm font-mono text-white/70">${w.messages}</p>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <p className="text-[10px] font-mono text-white/30">Tips</p>
                  <p className="text-sm font-mono text-white/70">${w.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Initiative Rankings ── */}
      <CollapsibleSection
        title="Initiative Rankings"
        badge={<span className="text-xs font-mono text-white/60">13</span>}
        subtitle="All initiatives ranked by direct impact on revenue"
        isOpen={openSections.has("initiatives")}
        onToggle={() => toggleSection("initiatives")}
      >
        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">
                <th className="pb-2 pr-2 w-8">#</th>
                <th className="pb-2 pr-4 w-24">Status</th>
                <th className="pb-2 pr-4">Initiative</th>
                <th className="pb-2 pr-4 w-24">Priority</th>
                <th className="pb-2 pr-4">Current State</th>
                <th className="pb-2 pr-4 w-16">Effort</th>
                <th className="pb-2">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {INITIATIVES.map((init) => (
                <tr key={init.rank} className="border-t border-white/5">
                  <td className="py-2 pr-2 text-white/30 font-mono">{init.rank}</td>
                  <td className="py-2 pr-4"><ComponentStatusBadge status={init.status} /></td>
                  <td className="py-2 pr-4 text-white/80">{init.name}</td>
                  <td className="py-2 pr-4"><PriorityBadge priority={init.priority} /></td>
                  <td className="py-2 pr-4 text-white/50 text-xs">{init.current}</td>
                  <td className="py-2 pr-4 text-white/40 text-xs font-mono">{init.effort}</td>
                  <td className="py-2 text-white/60 text-xs">{init.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* ── System Status ── */}
      <CollapsibleSection
        title="System Status"
        badge={<span className="text-xs font-mono text-white/60">17</span>}
        subtitle="Current operational state of all components"
        isOpen={openSections.has("system")}
        onToggle={() => toggleSection("system")}
      >
        <div className="pt-4 space-y-2">
          {SYSTEM_COMPONENTS.map((comp, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <ComponentStatusBadge status={comp.status} />
                <span className="text-white/80 text-sm">{comp.name}</span>
              </div>
              <span className="text-white/40 text-xs">{comp.detail}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Strategy Verdicts ── */}
      <CollapsibleSection
        title="Strategy Verdicts"
        subtitle="Assessment of the two core strategy documents"
        isOpen={openSections.has("strategy")}
        onToggle={() => toggleSection("strategy")}
      >
        <div className="pt-4 grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-white/40" />
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider">PR Package</span>
            </div>
            <p className="text-amber-400 font-medium text-sm mb-2">Strategically sound, operationally stalled</p>
            <p className="text-white/50 text-xs">Materials are professional and ready to use. Zero pitches sent. Immediate blocker: identifying who sends the pitches.</p>
          </div>
          <div className="p-4 rounded border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-white/40" />
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Revenue Strategy</span>
            </div>
            <p className="text-amber-400 font-medium text-sm mb-2">Correct diagnosis, execution gap remains</p>
            <p className="text-white/50 text-xs">Correctly identified the 0.09% conversion problem and $3 effective sub price. Sub revenue is a loss leader — PPV ($4,546/mo) and tips ($1,755/mo) are the real engine. Strategy prescriptions are sound but none are running yet: no email capture, no pixels, no retargeting.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Document Conflicts ── */}
      <CollapsibleSection
        title="Document Conflicts"
        badge={<span className="text-xs font-mono text-white/60">5</span>}
        subtitle="Where strategy documents contradict reality"
        isOpen={openSections.has("conflicts")}
        onToggle={() => toggleSection("conflicts")}
      >
        <div className="pt-4 space-y-4">
          {DOC_CONFLICTS.map((conflict) => (
            <div key={conflict.title} className="p-4 rounded border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-white/80 uppercase tracking-wider">{conflict.title}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-mono text-white/30">DOC A:</span>
                  <p className="text-white/60 text-xs">{conflict.docA}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/30">DOC B:</span>
                  <p className="text-white/60 text-xs">{conflict.docB}</p>
                </div>
              </div>
              <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-xs">{conflict.verdict}</p>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Key Metrics ── */}
      <CollapsibleSection
        title="Key Metrics"
        subtitle="Current numbers vs. targets"
        isOpen={openSections.has("metrics")}
        onToggle={() => toggleSection("metrics")}
      >
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {KEY_METRICS.map((m) => (
            <div key={m.label} className="p-3 rounded border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{m.label}</span>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-xl font-bold text-white font-mono">{m.current}</p>
              {/* Progress bar */}
              <div className="mt-2 mb-1">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.pct >= 70 ? "bg-green-400" : m.pct >= 40 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(m.pct, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30">Target: {m.target}</span>
                <span className="text-[10px] text-white/40 font-mono">{m.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
          Eva Paradis Digital Authority Initiative — Strategy Implementation Dashboard — Confidential
        </p>
      </div>
    </div>
  );
}
