"use client";

import { useEffect, useState } from "react";

interface LeadSummary {
  total_leads: number;
  leads_24h: number;
  leads_7d: number;
  converted_leads: number;
}

interface FunnelData {
  total_visits: number;
  of_clicks: number;
  email_captures: number;
  conversions: number;
  bridge_ctr: number;
}

interface TrafficSource {
  source: string;
  visits: number;
  clicks: number;
  captures: number;
}

export default function Dashboard() {
  const [leadSummary, setLeadSummary] = useState<LeadSummary | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, funnelRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/funnel"),
        ]);

        if (!leadsRes.ok || !funnelRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const leadsData = await leadsRes.json();
        const funnelData = await funnelRes.json();

        setLeadSummary(leadsData);
        setFunnelData(funnelData.funnel);
        setTrafficSources(funnelData.trafficSources || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">EVA Paradis Dashboard</h1>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Total Leads</div>
            <div className="text-3xl font-bold">
              {leadSummary?.total_leads || 0}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Last 24h</div>
            <div className="text-3xl font-bold">
              {leadSummary?.leads_24h || 0}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Last 7 Days</div>
            <div className="text-3xl font-bold">
              {leadSummary?.leads_7d || 0}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Converted</div>
            <div className="text-3xl font-bold">
              {leadSummary?.converted_leads || 0}
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Funnel (Last 24h)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-gray-600">Visits</div>
              <div className="text-2xl font-bold">
                {funnelData?.total_visits || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Clicks</div>
              <div className="text-2xl font-bold">
                {funnelData?.of_clicks || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Captures</div>
              <div className="text-2xl font-bold">
                {funnelData?.email_captures || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Bridge CTR</div>
              <div className="text-2xl font-bold">
                {funnelData?.bridge_ctr
                  ? `${(funnelData.bridge_ctr * 100).toFixed(2)}%`
                  : "0%"}
              </div>
            </div>
          </div>
        </div>

        {trafficSources.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Traffic Sources (Last 24h)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left">Source</th>
                    <th className="pb-2 text-right">Visits</th>
                    <th className="pb-2 text-right">Clicks</th>
                    <th className="pb-2 text-right">Captures</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficSources.map((source, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{source.source || "Direct"}</td>
                      <td className="py-2 text-right">{source.visits}</td>
                      <td className="py-2 text-right">{source.clicks}</td>
                      <td className="py-2 text-right">{source.captures}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
