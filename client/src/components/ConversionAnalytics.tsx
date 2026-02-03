import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  MousePointerClick, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Globe,
  MessageCircle,
  Mail
} from "lucide-react";

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

interface TrafficSourceProps {
  source: string;
  visits: number;
  conversions: number;
  rate: number;
  color: string;
}

function TrafficSource({ source, visits, conversions, rate, color }: TrafficSourceProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
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
      </div>
    </div>
  );
}

export default function ConversionAnalytics() {
  // Mock data - in production, this would come from analytics API
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

  const trafficSources: TrafficSourceProps[] = [
    { source: "Reddit r/gonewild", visits: 3420, conversions: 34, rate: 4.2, color: "bg-orange-500" },
    { source: "Reddit r/RealGirls", visits: 2180, conversions: 21, rate: 3.8, color: "bg-orange-400" },
    { source: "Instagram Bio", visits: 1890, conversions: 15, rate: 2.9, color: "bg-pink-500" },
    { source: "Instagram DM", visits: 1240, conversions: 12, rate: 3.1, color: "bg-pink-400" },
    { source: "Telegram", visits: 890, conversions: 5, rate: 1.8, color: "bg-blue-500" },
    { source: "Direct", visits: 3227, conversions: 2, rate: 0.6, color: "bg-zinc-500" },
  ];

  const dmMetrics = {
    reddit: { sent: 156, responses: 42, rate: 26.9 },
    instagram: { sent: 78, responses: 25, rate: 32.1 },
  };

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
          Live tracking
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
          </div>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span className="w-16 text-right">Visits</span>
            <span className="w-12 text-right">Conv.</span>
            <span className="w-14 text-right">Rate</span>
          </div>
        </div>
        <div className="space-y-1">
          {trafficSources.map((source) => (
            <TrafficSource key={source.source} {...source} />
          ))}
        </div>
      </Card>

      {/* DM Performance */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Reddit DMs</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Sent</span>
              <span className="text-white font-medium">{dmMetrics.reddit.sent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Responses</span>
              <span className="text-white font-medium">{dmMetrics.reddit.responses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Response Rate</span>
              <span className={`font-bold ${dmMetrics.reddit.rate >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
                {dmMetrics.reddit.rate}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                style={{ width: `${dmMetrics.reddit.rate}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Instagram DMs</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Sent</span>
              <span className="text-white font-medium">{dmMetrics.instagram.sent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Responses</span>
              <span className="text-white font-medium">{dmMetrics.instagram.responses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Response Rate</span>
              <span className={`font-bold ${dmMetrics.instagram.rate >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
                {dmMetrics.instagram.rate}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"
                style={{ width: `${dmMetrics.instagram.rate}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Email Capture */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Email List</h3>
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
          </div>
        </div>
      </Card>

      {/* Performance Summary */}
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-white/60">Best Performing Source</p>
            <p className="text-white font-medium">Reddit r/gonewild (4.2% conv.)</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/60">Best DM Script</p>
            <p className="text-white font-medium">R2: Profile Follow-up (32% response)</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/60">Recommendation</p>
            <p className="text-amber-400 font-medium">Increase Reddit posting frequency</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
