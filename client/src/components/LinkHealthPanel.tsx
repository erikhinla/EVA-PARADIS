import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Globe,
  Instagram,
  Clock,
  Zap,
  Link2,
  Eye,
  MousePointerClick,
  ShieldCheck,
  ShieldAlert,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/* ── Helpers ─────────────────────────────────────────────── */

function statusBadge(status: number | null, error: string | null) {
  if (error || !status)
    return {
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: <XCircle className="w-4 h-4" />,
      label: error ? "Error" : "No Response",
    };
  if (status >= 200 && status < 300)
    return {
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: `${status} OK`,
    };
  if (status >= 300 && status < 400)
    return {
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: <AlertTriangle className="w-4 h-4" />,
      label: `${status} Redirect`,
    };
  return {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <XCircle className="w-4 h-4" />,
    label: `${status} Error`,
  };
}

function latencyColor(ms: number) {
  if (ms < 500) return "text-green-400";
  if (ms < 1500) return "text-amber-400";
  return "text-red-400";
}

/* ── Component ───────────────────────────────────────────── */

export default function LinkHealthPanel() {
  const [igTestResult, setIgTestResult] = useState<any>(null);
  const [igTesting, setIgTesting] = useState(false);

  // Fetch link checks (auto-refresh every 60s)
  const {
    data: linkChecks,
    isLoading: linksLoading,
    refetch: refetchLinks,
    isFetching: linksFetching,
  } = trpc.diagnostics.checkLinks.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Fetch IG preview
  const {
    data: igPreview,
    isLoading: igLoading,
    refetch: refetchIg,
    isFetching: igFetching,
  } = trpc.diagnostics.igPreview.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Last click
  const { data: lastClick, refetch: refetchClick } =
    trpc.diagnostics.getLastClick.useQuery(undefined, {
      refetchInterval: 10_000,
    });

  // Test IG flow mutation
  const testIgFlow = trpc.diagnostics.testIgFlow.useMutation({
    onSuccess: (data) => {
      setIgTestResult(data);
      setIgTesting(false);
      toast.success("IG flow test complete");
    },
    onError: (err) => {
      setIgTesting(false);
      toast.error(`IG flow test failed: ${err.message}`);
    },
  });

  const handleTestIgFlow = () => {
    setIgTesting(true);
    setIgTestResult(null);
    testIgFlow.mutate();
  };

  const handleRefreshAll = () => {
    refetchLinks();
    refetchIg();
    refetchClick();
    toast.success("Refreshing diagnostics...");
  };

  const isLoading = linksLoading || igLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Link Health</h2>
          <p className="text-white/60 text-sm">
            Monitor link status, redirects, and IG previews
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={linksFetching || igFetching}
          className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
        >
          {linksFetching || igFetching ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh All
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 bg-black/40 backdrop-blur-xl border-white/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-white/60 text-sm">Checking links...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* ── Link Status Cards ────────────────────────────── */}
          <div className="grid gap-4">
            {linkChecks?.map((link) => {
              const badge = statusBadge(link.status, link.error);
              const hasRedirects = link.redirectChain.length > 1;

              return (
                <Card
                  key={link.key}
                  className="p-5 bg-black/40 backdrop-blur-xl border-white/10"
                >
                  {/* Top row: label + status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-amber-400" />
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          {link.label}
                        </h3>
                        <p className="text-white/40 text-xs font-mono truncate max-w-sm">
                          {link.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Latency */}
                      <span
                        className={`text-xs font-mono ${latencyColor(link.responseTimeMs)}`}
                      >
                        {link.responseTimeMs}ms
                      </span>
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Redirect chain */}
                  {hasRedirects && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Link2 className="w-3 h-3" />
                        Redirect Chain ({link.redirectChain.length} hops)
                      </p>
                      <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
                        {link.redirectChain.map((hop, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded ${hop.status >= 200 && hop.status < 300
                                  ? "bg-green-500/10 text-green-400"
                                  : hop.status >= 300 && hop.status < 400
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                            >
                              {hop.status}
                            </span>
                            <span className="text-white/30 truncate max-w-[200px]">
                              {new URL(hop.url).pathname || "/"}
                            </span>
                            {i < link.redirectChain.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-white/20" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error detail */}
                  {link.error && (
                    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-300 text-xs font-mono">
                        {link.error}
                      </p>
                    </div>
                  )}

                  {/* Enhanced Details */}
                  {!link.error && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider">
                        <FileJson className="w-3 h-3" />
                        Type: <span className="text-white/70 normal-case">{link.contentType?.split(";")[0] || "unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider">
                        {link.sslValid ? (
                          <ShieldCheck className="w-3 h-3 text-green-400" />
                        ) : (
                          <ShieldAlert className="w-3 h-3 text-red-400" />
                        )}
                        SSL: <span className={link.sslValid ? "text-green-400" : "text-red-400"}>{link.sslValid ? "VALID" : "INVALID/INSECURE"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider ml-auto">
                        <span className={link.status === 200 ? "text-green-400 font-bold" : "text-amber-400"}>
                          {link.status === 200 ? "✓ PASS" : "⚠ CHECK"}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* ── IG Preview Card ──────────────────────────────── */}
          <Card className="p-5 bg-black/40 backdrop-blur-xl border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Instagram Preview Fetch
                  </h3>
                  <p className="text-white/40 text-xs">
                    How IG sees your bridge page (OG tags)
                  </p>
                </div>
              </div>
              {igPreview && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(igPreview.status, igPreview.error).color
                    }`}
                >
                  {statusBadge(igPreview.status, igPreview.error).icon}
                  {igPreview.status ?? "N/A"}
                </span>
              )}
            </div>

            {igPreview && !igPreview.error && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                      og:title
                    </p>
                    <p className="text-white text-sm font-medium truncate">
                      {igPreview.ogTitle || (
                        <span className="text-red-400 italic">Missing</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                      og:description
                    </p>
                    <p className="text-white text-sm truncate">
                      {igPreview.ogDescription || (
                        <span className="text-red-400 italic">Missing</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                      og:image
                    </p>
                    {igPreview.ogImage ? (
                      <a
                        href={igPreview.ogImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 text-sm underline truncate block hover:text-amber-300"
                      >
                        View Image
                      </a>
                    ) : (
                      <p className="text-red-400 text-sm italic">Missing</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Zap className="w-3 h-3" />
                  Response time: {igPreview.responseTimeMs}ms
                </div>
              </div>
            )}

            {igPreview?.error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-300 text-xs font-mono">
                  {igPreview.error}
                </p>
              </div>
            )}
          </Card>

          {/* ── Test IG Flow Button ──────────────────────────── */}
          <Card className="p-5 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Test IG Flow
                  </h3>
                  <p className="text-white/40 text-xs">
                    Simulate full Instagram click &rarr; bridge &rarr; redirect
                  </p>
                </div>
              </div>
              <Button
                onClick={handleTestIgFlow}
                disabled={igTesting}
                className="bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 hover:text-pink-200"
              >
                {igTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>
            </div>

            {/* IG test results */}
            {igTestResult && (
              <div className="mt-4 pt-4 border-t border-pink-500/20 space-y-3">
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(igTestResult.finalStatus, igTestResult.error)
                        .color
                      }`}
                  >
                    {
                      statusBadge(igTestResult.finalStatus, igTestResult.error)
                        .icon
                    }
                    {igTestResult.finalStatus || "Failed"}
                  </span>
                  <span
                    className={`text-xs font-mono ${latencyColor(igTestResult.elapsed)}`}
                  >
                    {igTestResult.elapsed}ms
                  </span>
                  <div className="ml-auto flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider">
                      {igTestResult.sslValid ? (
                        <ShieldCheck className="w-3 h-3 text-green-400" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                      )}
                      <span className={igTestResult.sslValid ? "text-green-400" : "text-red-400"}>SSL</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded bg-black/40 border ${igTestResult.finalStatus === 200 && igTestResult.sslValid
                        ? "text-green-400 border-green-500/30"
                        : "text-red-400 border-red-500/30"
                      }`}>
                      {igTestResult.finalStatus === 200 && igTestResult.sslValid ? "STATUS: PASS" : "STATUS: FAIL"}
                    </span>
                  </div>
                </div>

                {/* Redirect chain */}
                {igTestResult.redirectChain?.length > 0 && (
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" />
                      Redirect Chain
                    </p>
                    <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
                      {igTestResult.redirectChain.map(
                        (hop: any, i: number) => (
                          <span key={i} className="flex items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded ${hop.status >= 200 && hop.status < 300
                                  ? "bg-green-500/10 text-green-400"
                                  : hop.status >= 300 && hop.status < 400
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                            >
                              {hop.status}
                            </span>
                            <span className="text-white/30 truncate max-w-[200px]">
                              {(() => {
                                try {
                                  return new URL(hop.url).pathname || "/";
                                } catch {
                                  return hop.url;
                                }
                              })()}
                            </span>
                            {i < igTestResult.redirectChain.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-white/20" />
                            )}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* OG tags from test */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      og:title
                    </p>
                    <p className="text-white text-xs truncate">
                      {igTestResult.ogTitle || (
                        <span className="text-red-400 italic">Missing</span>
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      og:description
                    </p>
                    <p className="text-white text-xs truncate">
                      {igTestResult.ogDescription || (
                        <span className="text-red-400 italic">Missing</span>
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      og:image
                    </p>
                    <p className="text-xs truncate">
                      {igTestResult.ogImage ? (
                        <a
                          href={igTestResult.ogImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 underline hover:text-amber-300"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-red-400 italic">Missing</span>
                      )}
                    </p>
                  </div>
                </div>

                {igTestResult.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-300 text-xs font-mono">
                      {igTestResult.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* ── Last Successful Click ────────────────────────── */}
          <Card className="p-5 bg-black/40 backdrop-blur-xl border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <MousePointerClick className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold text-sm">
                Last Successful Click
              </h3>
            </div>
            {lastClick ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                    Destination
                  </p>
                  <p className="text-white text-sm font-mono truncate">
                    {lastClick.url}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                    Source
                  </p>
                  <p className="text-white text-sm">{lastClick.source}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                    Timestamp
                  </p>
                  <p className="text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-white/40" />
                    {new Date(lastClick.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-sm">
                No clicks recorded yet. Clicks are logged when users interact
                with the bridge page.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
