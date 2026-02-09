import { useState } from "react";
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
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const MOCK_LABEL = "Mock Data";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  subtitle?: string;
}

function MetricCard({ title, value, change, icon, subtitle }: MetricCardProps) {
  const isPositive = change >= 0;

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
        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{MOCK_LABEL}</span>
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

export default function ConversionAnalytics() {
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState<string | null>(null);

  // Mock data - will be replaced with Supabase queries when connected
  const metrics = {
    totalVisits: 12847,
    uniqueVisitors: 8234,
    ofClicks: 1456,
    conversions: 89,
    conversionRate: 3.2,
    avgTimeOnPage: "2:34",
    bounceRate: 42,
    dmsSent: 234,
    dmResponses: 67,
    emailSignups: 156,
  };

  const trafficSources: TrafficSourceData[] = [
    { source: "Reddit r/gonewild", visits: 3420, conversions: 34, rate: 4.2, color: "bg-orange-500" },
    { source: "Reddit r/RealGirls", visits: 2180, conversions: 21, rate: 3.8, color: "bg-orange-400" },
    { source: "Reddit r/amateur", visits: 1560, conversions: 14, rate: 3.5, color: "bg-orange-300" },
    { source: "Reddit r/OnOff", visits: 980, conversions: 8, rate: 3.1, color: "bg-orange-200" },
    { source: "RedGifs", visits: 2340, conversions: 18, rate: 2.7, color: "bg-red-500" },
    { source: "X (Twitter)", visits: 1780, conversions: 11, rate: 2.4, color: "bg-sky-500" },
    { source: "Instagram Bio", visits: 1890, conversions: 15, rate: 2.9, color: "bg-pink-500" },
    { source: "Instagram DM", visits: 1240, conversions: 12, rate: 3.1, color: "bg-pink-400" },
    { source: "TikTok", visits: 920, conversions: 4, rate: 1.4, color: "bg-cyan-400" },
    { source: "TrafficJunky", visits: 1640, conversions: 9, rate: 1.9, color: "bg-yellow-500" },
    { source: "Direct", visits: 3227, conversions: 2, rate: 0.6, color: "bg-zinc-500" },
  ];

  const dmMetrics = {
    reddit: { sent: 156, responses: 42, rate: 26.9 },
    instagram: { sent: 78, responses: 25, rate: 32.1 },
    x: { sent: 64, responses: 12, rate: 18.8 },
    onlyfans: { sent: 210, responses: 89, rate: 42.4 },
  };

  const summaryItems = [
    {
      key: "bestSource",
      label: "Best Performing Source",
      value: "Reddit r/gonewild (4.2% conv.)",
      detail: "r/gonewild consistently converts at 4.2%, outperforming all other sources. Consider increasing post frequency and testing new content formats in this subreddit.",
    },
    {
      key: "bestScript",
      label: "Best DM Script",
      value: "R2: Profile Follow-up (32% response)",
      detail: "The R2 script (profile follow-up after initial engagement) drives a 32% response rate on Instagram. Adapt this approach for X and Reddit DMs.",
    },
    {
      key: "recommendation",
      label: "Recommendation",
      value: "Increase Reddit posting frequency",
      detail: "Reddit subreddits drive the highest conversion rates. Scaling from 3 to 5 posts/day across top subreddits could yield ~40% more conversions.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Conversion Analytics</h2>
          <p className="text-white/60 text-sm">Last 7 days</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{MOCK_LABEL} — No live Supabase connection</span>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            No live data
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Bridge Visits"
          value={metrics.totalVisits.toLocaleString()}
          change={12}
          icon={<Globe className="w-5 h-5 text-amber-400" />}
          subtitle={`${metrics.uniqueVisitors.toLocaleString()} unique`}
        />
        <MetricCard
          title="OF Clicks"
          value={metrics.ofClicks.toLocaleString()}
          change={8}
          icon={<MousePointerClick className="w-5 h-5 text-amber-400" />}
          subtitle={`${((metrics.ofClicks / metrics.totalVisits) * 100).toFixed(1)}% CTR`}
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions.toString()}
          change={15}
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
          subtitle="New subscribers"
        />
        <MetricCard
          title="Conv. Rate"
          value={`${metrics.conversionRate}%`}
          change={3}
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
            <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{MOCK_LABEL}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span className="w-16 text-right">Visits</span>
            <span className="w-12 text-right">Conv.</span>
            <span className="w-14 text-right">Rate</span>
            <span className="w-4" /> {/* spacer for chevron */}
          </div>
        </div>
        <div className="space-y-1">
          {trafficSources.map((source) => (
            <TrafficSourceRow key={source.source} {...source} />
          ))}
        </div>
      </Card>

      {/* DM Performance */}
      <div className="grid md:grid-cols-2 gap-4">
        <DmCard
          platform="Reddit DMs"
          icon={<MessageCircle className="w-5 h-5 text-orange-400" />}
          iconColor="text-orange-400"
          gradientFrom="from-orange-500"
          gradientTo="to-orange-400"
          metrics={dmMetrics.reddit}
        />
        <DmCard
          platform="Instagram DMs"
          icon={<MessageCircle className="w-5 h-5 text-pink-400" />}
          iconColor="text-pink-400"
          gradientFrom="from-pink-500"
          gradientTo="to-pink-400"
          metrics={dmMetrics.instagram}
        />
        <DmCard
          platform="X DMs"
          icon={<MessageCircle className="w-5 h-5 text-sky-400" />}
          iconColor="text-sky-400"
          gradientFrom="from-sky-500"
          gradientTo="to-sky-400"
          metrics={dmMetrics.x}
        />
        <DmCard
          platform="OnlyFans DMs"
          icon={<MessageCircle className="w-5 h-5 text-cyan-400" />}
          iconColor="text-cyan-400"
          gradientFrom="from-cyan-500"
          gradientTo="to-cyan-400"
          metrics={dmMetrics.onlyfans}
        />
      </div>

      {/* Email Capture */}
      <Card
        className="p-6 bg-black/40 backdrop-blur-xl border-white/10 cursor-pointer hover:bg-black/50 transition-colors"
        onClick={() => {
          setEmailExpanded(!emailExpanded);
          console.log("[Email List] Toggled panel. Navigate to /dashboard/email for full view.");
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Email List</h3>
            <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{MOCK_LABEL}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{metrics.emailSignups}</p>
              <p className="text-white/40 text-xs">Total signups</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-400">+23</p>
              <p className="text-white/40 text-xs">This week</p>
            </div>
            {emailExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/40" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/40" />
            )}
          </div>
        </div>
        {emailExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Open Rate</span>
              <span className="text-white font-medium">38.2%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Click Rate</span>
              <span className="text-white font-medium">12.4%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Unsubscribe Rate</span>
              <span className="text-white font-medium">0.8%</span>
            </div>
            <p className="text-white/30 text-xs pt-2">Full email dashboard → /dashboard/email</p>
          </div>
        )}
      </Card>

      {/* Performance Summary */}
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Performance Summary</h3>
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{MOCK_LABEL}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {summaryItems.map((item) => (
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
              {summaryExpanded === item.key && (
                <p className="text-white/40 text-xs mt-1 leading-relaxed">{item.detail}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
