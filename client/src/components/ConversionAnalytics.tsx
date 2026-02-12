import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  MousePointerClick,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Globe,
  MessageCircle,
  Mail,
  ChevronRight
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  subtitle?: string;
}

function MetricCard({ title, value, change, icon, subtitle }: MetricCardProps) {
  const isPositive = typeof change === "number" ? change >= 0 : true;

  return (
    <Card className="p-4 bg-white/5 border-white/10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-white/60 text-xs uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      {typeof change === "number" && (
        <div className="mt-3 flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-white/40 text-xs">vs last week</span>
        </div>
      )}
    </Card>
  );
}

interface TrafficSourceData {
  source: string;
  visits: number;
  conversions: number;
  rate: number;
  color: string;
}

function TrafficSourceRow({ source, visits, conversions, rate, color }: TrafficSourceData & { onClick?: () => void }) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 rounded-lg px-2 transition-colors group"
      onClick={() => console.log(`[Traffic Source] Clicked: ${source}`, { visits, conversions, rate })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') console.log(`[Traffic Source] Clicked: ${source}`); }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-white text-sm">{source}</span>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <span className="text-white/60 w-16 text-right">{visits.toLocaleString()}</span>
        <span className="text-white/60 w-12 text-right">{conversions}</span>
        <span className={`w-14 text-right font-medium ${rate >= 3 ? 'text-green-400' : rate >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
          {rate.toFixed(1)}%
        </span>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
      </div>
    </div>
  );
}

interface DmCardProps {
  platform: string;
  icon: React.ReactNode;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  metrics: { sent: number; responses: number; rate: number };
}

function DmCard({ platform, icon, iconColor, gradientFrom, gradientTo, metrics }: DmCardProps) {
  return (
    <Card
      className="p-6 bg-black/40 backdrop-blur-xl border-white/10 cursor-pointer hover:bg-black/50 transition-colors"
      onClick={() => console.log(`[DM Card] Clicked: ${platform}`, metrics)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-white">{platform}</h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Sent</span>
          <span className="text-white font-medium">{metrics.sent}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Responses</span>
          <span className="text-white font-medium">{metrics.responses}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Response Rate</span>
          <span className={`font-bold ${metrics.rate >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
            {metrics.rate}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-full`}
            style={{ width: `${metrics.rate}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

interface DmMetric {
  sent: number;
  responses: number;
  rate: number;
}

interface DmMetricsGroup {
  reddit: DmMetric;
  instagram: DmMetric;
  x: DmMetric;
}

interface SummaryItem {
  key: string;
  label: string;
  value: string;
  detail?: string;
}

interface EmailStats {
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  weeklySignups: number;
}

interface AnalyticsSnapshot {
  metrics: {
    totalVisits: number;
    uniqueVisitors: number;
    ofClicks: number;
    conversions: number;
    conversionRate: number;
    avgTimeOnPage: string;
    bounceRate: number;
    dmsSent: number;
    dmResponses: number;
    emailSignups: number;
  };
  trafficSources: TrafficSourceData[];
  dmMetrics: DmMetricsGroup;
  email: EmailStats;
  summaryItems: SummaryItem[];
}

interface ConversionAnalyticsProps {
  snapshot?: Partial<AnalyticsSnapshot>;
}

const ZERO_SNAPSHOT: AnalyticsSnapshot = {
  metrics: {
    totalVisits: 0,
    uniqueVisitors: 0,
    ofClicks: 0,
    conversions: 0,
    conversionRate: 0,
    avgTimeOnPage: "0:00",
    bounceRate: 0,
    dmsSent: 0,
    dmResponses: 0,
    emailSignups: 0,
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
    weeklySignups: 0,
  },
  summaryItems: [],
};

function calculateRate(sent: number, responses: number, override?: number) {
  if (typeof override === "number") {
    return override;
  }
  if (!sent || sent === 0) {
    return 0;
  }
  return Number(((responses / sent) * 100).toFixed(1));
}

function safePercent(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }
  return Number(((numerator / denominator) * 100).toFixed(1));
}

export default function ConversionAnalytics({ snapshot }: ConversionAnalyticsProps = {}) {
  const [summaryExpanded, setSummaryExpanded] = useState<string | null>(null);

  const analytics = useMemo<AnalyticsSnapshot>(() => ({
    metrics: { ...ZERO_SNAPSHOT.metrics, ...(snapshot?.metrics ?? {}) },
    trafficSources: snapshot?.trafficSources ?? ZERO_SNAPSHOT.trafficSources,
    dmMetrics: {
      reddit: {
        sent: snapshot?.dmMetrics?.reddit?.sent ?? ZERO_SNAPSHOT.dmMetrics.reddit.sent,
        responses: snapshot?.dmMetrics?.reddit?.responses ?? ZERO_SNAPSHOT.dmMetrics.reddit.responses,
        rate: calculateRate(
          snapshot?.dmMetrics?.reddit?.sent ?? ZERO_SNAPSHOT.dmMetrics.reddit.sent,
          snapshot?.dmMetrics?.reddit?.responses ?? ZERO_SNAPSHOT.dmMetrics.reddit.responses,
          snapshot?.dmMetrics?.reddit?.rate
        ),
      },
      instagram: {
        sent: snapshot?.dmMetrics?.instagram?.sent ?? ZERO_SNAPSHOT.dmMetrics.instagram.sent,
        responses: snapshot?.dmMetrics?.instagram?.responses ?? ZERO_SNAPSHOT.dmMetrics.instagram.responses,
        rate: calculateRate(
          snapshot?.dmMetrics?.instagram?.sent ?? ZERO_SNAPSHOT.dmMetrics.instagram.sent,
          snapshot?.dmMetrics?.instagram?.responses ?? ZERO_SNAPSHOT.dmMetrics.instagram.responses,
          snapshot?.dmMetrics?.instagram?.rate
        ),
      },
      x: {
        sent: snapshot?.dmMetrics?.x?.sent ?? ZERO_SNAPSHOT.dmMetrics.x.sent,
        responses: snapshot?.dmMetrics?.x?.responses ?? ZERO_SNAPSHOT.dmMetrics.x.responses,
        rate: calculateRate(
          snapshot?.dmMetrics?.x?.sent ?? ZERO_SNAPSHOT.dmMetrics.x.sent,
          snapshot?.dmMetrics?.x?.responses ?? ZERO_SNAPSHOT.dmMetrics.x.responses,
          snapshot?.dmMetrics?.x?.rate
        ),
      },
    },
    email: { ...ZERO_SNAPSHOT.email, ...(snapshot?.email ?? {}) },
    summaryItems: snapshot?.summaryItems ?? ZERO_SNAPSHOT.summaryItems,
  }), [snapshot]);

  const ctr = safePercent(analytics.metrics.ofClicks, analytics.metrics.totalVisits);
  const hasTrafficSources = analytics.trafficSources.length > 0;
  const hasSummaryItems = analytics.summaryItems.length > 0;
  const weeklySignupCopy = analytics.email.weeklySignups > 0
    ? `+${analytics.email.weeklySignups} this week`
    : "No new signups yet";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Conversion Analytics</h2>
          <p className="text-white/60 text-sm">Last 7 days</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live data (defaults to zero)
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Bridge Visits"
          value={analytics.metrics.totalVisits.toLocaleString()}
          icon={<Globe className="w-5 h-5 text-amber-400" />}
          subtitle={`${analytics.metrics.uniqueVisitors.toLocaleString()} unique`}
        />
        <MetricCard
          title="OF Clicks"
          value={analytics.metrics.ofClicks.toLocaleString()}
          icon={<MousePointerClick className="w-5 h-5 text-amber-400" />}
          subtitle={`${ctr.toFixed(1)}% CTR`}
        />
        <MetricCard
          title="Conversions"
          value={analytics.metrics.conversions.toString()}
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
          subtitle="New subscribers"
        />
        <MetricCard
          title="Conv. Rate"
          value={`${analytics.metrics.conversionRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
          subtitle="Target: 3%+"
        />
      </div>

      {/* Traffic Sources */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Traffic Sources</h3>
            <span className="text-xs text-white/40">{hasTrafficSources ? `${analytics.trafficSources.length} sources` : "No sources yet"}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span className="w-16 text-right">Visits</span>
            <span className="w-12 text-right">Conv.</span>
            <span className="w-14 text-right">Rate</span>
            <span className="w-4" /> {/* spacer for chevron */}
          </div>
        </div>
        {hasTrafficSources ? (
          <div className="space-y-1">
            {analytics.trafficSources.map((source) => (
              <TrafficSourceRow key={source.source} {...source} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-white/40 text-sm border border-dashed border-white/10 rounded-lg">
            No tracked traffic sources yet.
          </div>
        )}
      </Card>

      {/* DM Performance */}
      <div className="grid md:grid-cols-3 gap-4">
        <DmCard
          platform="Reddit DMs"
          icon={<MessageCircle className="w-5 h-5 text-orange-400" />}
          iconColor="text-orange-400"
          gradientFrom="from-orange-500"
          gradientTo="to-orange-400"
          metrics={analytics.dmMetrics.reddit}
        />
        <DmCard
          platform="Instagram DMs"
          icon={<MessageCircle className="w-5 h-5 text-pink-400" />}
          iconColor="text-pink-400"
          gradientFrom="from-pink-500"
          gradientTo="to-pink-400"
          metrics={analytics.dmMetrics.instagram}
        />
        <DmCard
          platform="X DMs"
          icon={<MessageCircle className="w-5 h-5 text-sky-400" />}
          iconColor="text-sky-400"
          gradientFrom="from-sky-500"
          gradientTo="to-sky-400"
          metrics={analytics.dmMetrics.x}
        />
      </div>

      {/* Email Capture */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Email List</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total Signups</p>
            <p className="text-2xl font-bold text-white">{analytics.metrics.emailSignups}</p>
            <p className="text-green-400 text-xs font-medium mt-1">{weeklySignupCopy}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Open Rate</p>
            <p className="text-2xl font-bold text-white">{analytics.email.openRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Click Rate</p>
            <p className="text-2xl font-bold text-white">{analytics.email.clickRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Unsubscribe Rate</p>
            <p className="text-2xl font-bold text-white">{analytics.email.unsubscribeRate.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      {/* Performance Summary */}
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Performance Summary</h3>
        </div>
        {hasSummaryItems ? (
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {analytics.summaryItems.map((item) => (
              <div
                key={item.key}
                className="space-y-2 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors group"
                onClick={() => {
                  setSummaryExpanded(summaryExpanded === item.key ? null : item.key);
                  console.log(`[Performance Summary] Clicked: ${item.label}`);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSummaryExpanded(summaryExpanded === item.key ? null : item.key); }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-white/60">{item.label}</p>
                  <ChevronRight className={`w-4 h-4 text-white/20 group-hover:text-white/60 transition-all ${summaryExpanded === item.key ? 'rotate-90' : ''}`} />
                </div>
                <p className={`font-medium ${item.key === 'recommendation' ? 'text-amber-400' : 'text-white'}`}>
                  {item.value}
                </p>
                {summaryExpanded === item.key && item.detail && (
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">{item.detail}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-white/50 text-sm">
            No performance notes yet. Insights will appear once data is captured.
          </div>
        )}
      </Card>
    </div>
  );
}
