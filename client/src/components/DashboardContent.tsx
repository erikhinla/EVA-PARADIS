import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileVideo, X, Download, ExternalLink, Copy, Check,
  AlertCircle, Clock, CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ConversionAnalytics from "./ConversionAnalytics";
import LinkHealthPanel from "./LinkHealthPanel";
import WarRoom from "./WarRoom";

// Concept tags for the dropdown
const CONCEPT_TAGS = [
  { value: "DOMINANCE_WORSHIP", label: "Dominance Worship" },
  { value: "HARDCORE_GROUP", label: "Hardcore Group" },
  { value: "ANATOMY_SOLO", label: "Anatomy Solo" },
];

// Distribution targets organized by platform
const DISTRIBUTION_TARGETS = [
  // Reddit
  { value: "reddit:TransGoneWild", label: "🔴 r/TransGoneWild", platform: "reddit" },
  { value: "reddit:Tgirls", label: "🔴 r/Tgirls", platform: "reddit" },
  { value: "reddit:TransPorn", label: "🔴 r/TransPorn", platform: "reddit" },
  { value: "reddit:GroupSex", label: "🔴 r/GroupSex", platform: "reddit" },
  // X / Twitter
  { value: "twitter:main", label: "🐦 X / Twitter", platform: "twitter" },
  // Instagram
  { value: "instagram:story", label: "📸 IG Story", platform: "instagram" },
  { value: "instagram:reel", label: "📸 IG Reel", platform: "instagram" },
  { value: "instagram:feed", label: "📸 IG Feed Post", platform: "instagram" },
  // TikTok
  { value: "tiktok:video", label: "🎵 TikTok Video", platform: "tiktok" },
  { value: "tiktok:story", label: "🎵 TikTok Story", platform: "tiktok" },
];

// Keep backward compat alias
const SUBREDDIT_OPTIONS = DISTRIBUTION_TARGETS;

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"warroom" | "posting" | "analytics" | "linkhealth">("warroom");
  const [conceptName, setConceptName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [subredditSelections, setSubredditSelections] = useState<Record<number, string>>({});

  // Manual mode state
  const [redgifsUrls, setRedgifsUrls] = useState<Record<number, string>>({});
  const [redditUrls, setRedditUrls] = useState<Record<number, string>>({});

  // tRPC queries and mutations
  const { data: assets = [], refetch: refetchAssets } = trpc.assets.list.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { data: posts = [], refetch: refetchPosts } = trpc.queue.list.useQuery(undefined, {
    refetchInterval: 3000, // Poll every 3 seconds for post status updates
  });

  const uploadAsset = trpc.assets.upload.useMutation({
    onSuccess: () => {
      refetchAssets();
      toast.success("Asset uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const publishToReddit = trpc.queue.publish.useMutation({
    onSuccess: () => {
      refetchPosts();
      toast.success("Publishing started - check status updates");
    },
    onError: (error) => {
      toast.error(`Failed to start publishing: ${error.message}`);
    },
  });

  const deleteAsset = trpc.assets.delete.useMutation({
    onSuccess: () => {
      refetchAssets();
      toast.success("Asset deleted");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const saveRedGifsUrl = trpc.queue.saveRedGifsUrl.useMutation({
    onSuccess: () => {
      refetchPosts();
      toast.success("RedGifs URL saved - ready for Reddit");
    },
    onError: (error) => {
      toast.error(`Failed to save RedGifs URL: ${error.message}`);
    },
  });

  const saveRedditPermalink = trpc.queue.saveRedditPermalink.useMutation({
    onSuccess: () => {
      refetchPosts();
      toast.success("Post marked as published!");
    },
    onError: (error) => {
      toast.error(`Failed to save Reddit URL: ${error.message}`);
    },
  });

  const { data: analyticsSnapshot } = trpc.analytics.getSnapshot.useQuery(undefined, {
    refetchInterval: 30000,
    enabled: activeTab === "analytics",
  });

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:mime/type;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadRawAsset = async (file: File) => {
    if (!conceptName.trim()) {
      toast.error("Enter concept name before uploading");
      return;
    }

    const fileId = `${file.name}-${Date.now()}`;
    setUploadingFiles((prev) => new Set(prev).add(fileId));

    try {
      const base64Data = await fileToBase64(file);

      await uploadAsset.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileData: base64Data,
        conceptName: conceptName.trim(),
      });

      setConceptName("");
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
        uploadRawAsset(file);
      } else {
        toast.error(`${file.name} not supported`);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => uploadRawAsset(file));
  };

  const removeAsset = (id: number) => {
    if (confirm("Delete this asset?")) {
      deleteAsset.mutate({ id });
    }
  };

  const queueForDistribution = (assetId: number, targetSubreddit?: string) => {
    publishToReddit.mutate({ assetId, targetSubreddit });
  };

  const handleSaveRedGifsUrl = (postId: number) => {
    const url = redgifsUrls[postId];
    if (!url || !url.trim()) {
      toast.error("Please enter a RedGifs URL");
      return;
    }
    saveRedGifsUrl.mutate({ postId, redgifsUrl: url.trim() });
  };

  const handleSaveRedditPermalink = (postId: number) => {
    const url = redditUrls[postId];
    if (!url || !url.trim()) {
      toast.error("Please enter a Reddit URL");
      return;
    }
    saveRedditPermalink.mutate({ postId, redditUrl: url.trim() });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied");
  };

  const copyAllForReddit = (title: string, url: string, id: string) => {
    const text = `Title: ${title}\nURL: ${url}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied title and URL");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "awaiting_redgifs_url":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "uploading_redgifs":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "awaiting_reddit_post":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "posting_reddit":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "posted":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "bg-amber-500/20 text-amber-400";
      case "awaiting_redgifs_url":
        return "bg-blue-500/20 text-blue-400";
      case "uploading_redgifs":
        return "bg-blue-500/20 text-blue-400";
      case "awaiting_reddit_post":
        return "bg-blue-500/20 text-blue-400";
      case "posting_reddit":
        return "bg-blue-500/20 text-blue-400";
      case "posted":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "queued":
        return "Queued";
      case "awaiting_redgifs_url":
        return "Upload to RedGifs";
      case "uploading_redgifs":
        return "Uploading to RedGifs...";
      case "awaiting_reddit_post":
        return "Post to Reddit";
      case "posting_reddit":
        return "Posting to Reddit...";
      case "posted":
        return "Posted";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const queuedPosts = posts.filter(
    (p) =>
      p.status === "queued" ||
      p.status === "awaiting_redgifs_url" ||
      p.status === "uploading_redgifs" ||
      p.status === "awaiting_reddit_post" ||
      p.status === "posting_reddit"
  );
  const postedPosts = posts.filter((p) => p.status === "posted");
  const failedPosts = posts.filter((p) => p.status === "failed");

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1005 50%, #0a0a0a 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>Eva Paradis</h1>
              <p className="text-white/40 text-sm">
                {activeTab === "warroom" ? "Bacheca" : activeTab === "posting" ? "Posting" : activeTab === "analytics" ? "Analytics" : "Link Health"}
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Mode Indicator Badge - manual override disabled */}
              <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-green-500/20 text-green-400">
                ⚡ Auto Mode
              </div>
              {/* Tab Navigation */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("warroom")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "warroom"
                    ? "bg-[#D4AF37] text-black"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Bacheca
                </button>
                <button
                  onClick={() => setActiveTab("posting")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "posting"
                    ? "bg-amber-500 text-black"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Posting
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "analytics"
                    ? "bg-amber-500 text-black"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab("linkhealth")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "linkhealth"
                    ? "bg-amber-500 text-black"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Link Health
                </button>
              </div>
              {/* Stats */}
              {activeTab === "posting" && (
                <div className="flex gap-6 text-right text-xs text-white/60">
                  <div>
                    <span className="text-[#D4AF37] font-bold">{queuedPosts.length}</span> Queued
                  </div>
                  <div>
                    <span className="text-green-400 font-bold">{postedPosts.length}</span> Posted
                  </div>
                  <div>
                    <span className="text-red-400 font-bold">{failedPosts.length}</span> Failed
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {activeTab === "warroom" ? (
          <WarRoom />
        ) : activeTab === "analytics" ? (
          <ConversionAnalytics snapshot={analyticsSnapshot} />
        ) : activeTab === "linkhealth" ? (
          <LinkHealthPanel />
        ) : (
          <div className="grid gap-6">
            {/* Ingest Module */}
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Ingest</h2>
                  <p className="text-white/60 text-sm">Upload raw assets</p>
                </div>

                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium">Concept Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., Red Carpet Glam, Behind Scenes"
                    value={conceptName}
                    onChange={(e) => setConceptName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 transition-all ${isDragging
                    ? "border-amber-400 bg-amber-400/10"
                    : "border-white/20 bg-white/5"
                    }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="video/*,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-white/40 mb-4" />
                    <p className="text-white text-lg font-medium mb-2">
                      Drop files or click
                    </p>
                    <p className="text-white/60 text-sm">Video/Image</p>
                  </label>
                </div>
              </div>
            </Card>

            {/* Asset Queue */}
            {assets.length > 0 && (
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Assets</h2>
                    <p className="text-white/60 text-sm">{assets.length} ready</p>
                  </div>

                  <div className="space-y-3">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden bg-black/40">
                          {asset.file_type.startsWith("video/") ? (
                            <>
                              <video
                                src={asset.file_url}
                                className="w-full h-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <FileVideo className="w-6 h-6 text-purple-400" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={asset.file_url}
                              alt={asset.file_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium truncate">{asset.file_name}</p>
                            <button
                              onClick={() => removeAsset(asset.id)}
                              className="text-white/40 hover:text-white/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-white/60 text-sm mb-2">
                            {asset.concept_name}
                          </p>

                          {asset.status === "ready" && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                Ready
                              </span>
                              <Select
                                value={subredditSelections[asset.id] || ""}
                                onValueChange={(value) =>
                                  setSubredditSelections(prev => ({ ...prev, [asset.id]: value }))
                                }
                              >
                                <SelectTrigger className="h-7 w-[160px] text-xs bg-white/5 border-white/10 text-white">
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUBREDDIT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => queueForDistribution(asset.id, subredditSelections[asset.id])}
                                disabled={publishToReddit.isPending}
                                className="h-7 text-xs bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
                              >
                                {publishToReddit.isPending ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                )}
                                Queue for Distribution
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Queued/Publishing Posts */}
            {queuedPosts.length > 0 && (
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-amber-500/20">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Active Posts</h2>
                    <p className="text-white/60 text-sm">{queuedPosts.length} in progress</p>
                  </div>

                  <div className="space-y-4">
                    {queuedPosts.map((post) => {
                      const asset = assets.find((a) => a.id === post.asset_id);
                      return (
                        <div
                          key={post.id}
                          className="p-6 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 space-y-4"
                        >
                          {/* Package Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(post.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                {getStatusLabel(post.status)}
                              </span>
                              <span className="text-white/40 text-xs">
                                #{post.id}
                              </span>
                            </div>
                            <span className="text-white/40 text-xs">
                              {new Date(post.created_at).toLocaleString()}
                            </span>
                          </div>

                          {/* Post Title */}
                          <div className="space-y-2">
                            <label className="text-white/60 text-xs uppercase tracking-wider">Title</label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 rounded bg-black/40 text-white text-sm font-mono border border-white/10">
                                {post.post_title}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(post.post_title || "", `title-${post.id}`)}
                                className="h-8 w-8 p-0"
                              >
                                {copiedId === `title-${post.id}` ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Target Subreddit */}
                          <div className="space-y-2">
                            <label className="text-white/60 text-xs uppercase tracking-wider">Subreddit</label>
                            <div className="flex items-center gap-2">
                              <code className="px-3 py-2 rounded bg-black/40 text-amber-400 text-sm font-mono border border-white/10">
                                r/{post.target_subreddit}
                              </code>
                            </div>
                          </div>

                          {/* Asset Info */}
                          {asset && (
                            <div className="space-y-2">
                              <label className="text-white/60 text-xs uppercase tracking-wider">Asset</label>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 rounded bg-black/40 text-white/60 text-xs font-mono border border-white/10 truncate">
                                  {asset.file_name}
                                </code>
                              </div>
                            </div>
                          )}

                          {/* Status Messages & Manual Wizards */}

                          {/* Manual Mode: RedGifs Upload Step */}
                          {post.status === "awaiting_redgifs_url" && asset && (
                            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-purple-300 text-sm font-bold uppercase tracking-wider">
                                  STEP 1: Upload to RedGifs
                                </label>
                              </div>
                              <p className="text-white/80 text-sm">
                                Upload this video to RedGifs, then paste the URL below.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open("https://www.redgifs.com/upload", "_blank", "noopener,noreferrer")}
                                className="h-8 text-xs bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Open RedGifs Upload
                              </Button>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Paste RedGifs URL here (e.g., https://redgifs.com/watch/...)"
                                  value={redgifsUrls[post.id] || ""}
                                  onChange={(e) => setRedgifsUrls({ ...redgifsUrls, [post.id]: e.target.value })}
                                  className="bg-black/40 border-purple-500/30 text-white placeholder:text-white/40"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveRedGifsUrl(post.id)}
                                  disabled={saveRedGifsUrl.isPending}
                                  className="w-full bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                                >
                                  {saveRedGifsUrl.isPending ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save RedGifs URL"
                                  )}
                                </Button>
                              </div>
                              <p className="text-blue-300 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ⏳ Waiting for RedGifs URL
                              </p>
                            </div>
                          )}

                          {/* Manual Mode: Reddit Posting Step */}
                          {post.status === "awaiting_reddit_post" && asset && (
                            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-orange-300 text-sm font-bold uppercase tracking-wider">
                                  STEP 2: Post to Reddit
                                </label>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60 text-xs">Title:</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(post.post_title || "", `manual-title-${post.id}`)}
                                    className="h-6 text-xs"
                                  >
                                    {copiedId === `manual-title-${post.id}` ? (
                                      <><Check className="w-3 h-3 mr-1" /> Copied</>
                                    ) : (
                                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                    )}
                                  </Button>
                                </div>
                                <code className="block px-3 py-2 rounded bg-black/40 text-white text-sm font-mono border border-white/10">
                                  {post.post_title}
                                </code>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60 text-xs">RedGifs URL:</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(asset.redgifs_url || "", `manual-url-${post.id}`)}
                                    className="h-6 text-xs"
                                  >
                                    {copiedId === `manual-url-${post.id}` ? (
                                      <><Check className="w-3 h-3 mr-1" /> Copied</>
                                    ) : (
                                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                    )}
                                  </Button>
                                </div>
                                <code className="block px-3 py-2 rounded bg-black/40 text-white/60 text-xs font-mono border border-white/10 truncate">
                                  {asset.redgifs_url}
                                </code>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60 text-xs">Subreddit: r/{post.target_subreddit}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`https://www.reddit.com/r/${post.target_subreddit}/submit`, "_blank", "noopener,noreferrer")}
                                    className="h-6 text-xs bg-orange-500/20 border-orange-500/30 text-orange-300"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Open Subreddit
                                  </Button>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyAllForReddit(post.post_title || "", asset.redgifs_url || "", `manual-all-${post.id}`)}
                                className="w-full h-8 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
                              >
                                {copiedId === `manual-all-${post.id}` ? (
                                  <><Check className="w-3 h-3 mr-2" /> Copied All</>
                                ) : (
                                  <><Copy className="w-3 h-3 mr-2" /> Copy All (Title + URL)</>
                                )}
                              </Button>

                              <div className="space-y-2 pt-2">
                                <label className="text-white/60 text-xs">After posting, paste Reddit permalink:</label>
                                <Input
                                  placeholder="Paste Reddit post URL here (e.g., https://reddit.com/r/...)"
                                  value={redditUrls[post.id] || ""}
                                  onChange={(e) => setRedditUrls({ ...redditUrls, [post.id]: e.target.value })}
                                  className="bg-black/40 border-orange-500/30 text-white placeholder:text-white/40"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveRedditPermalink(post.id)}
                                  disabled={saveRedditPermalink.isPending}
                                  className="w-full bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                                >
                                  {saveRedditPermalink.isPending ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save Reddit Permalink"
                                  )}
                                </Button>
                              </div>

                              <p className="text-blue-300 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ⏳ Waiting for Reddit permalink
                              </p>
                            </div>
                          )}

                          {/* Auto Mode: Processing Status */}
                          {(post.status === "uploading_redgifs" || post.status === "posting_reddit") && (
                            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                <p className="text-blue-300 text-sm">
                                  {post.status === "uploading_redgifs"
                                    ? "Uploading to RedGifs..."
                                    : "Posting to Reddit..."}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Posted Packages */}
            {postedPosts.length > 0 && (
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-green-500/20">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Posted</h2>
                    <p className="text-white/60 text-sm">{postedPosts.length} successful</p>
                  </div>

                  <div className="space-y-2">
                    {postedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-white text-sm font-medium">{post.post_title}</p>
                            <p className="text-white/60 text-xs">
                              r/{post.target_subreddit} • {post.posted_at ? new Date(post.posted_at).toLocaleString() : "Recently"}
                            </p>
                          </div>
                        </div>
                        {post.post_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(post.post_url || "", "_blank")}
                            className="h-8 text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Failed Packages */}
            {failedPosts.length > 0 && (
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-red-500/20">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Failed</h2>
                    <p className="text-white/60 text-sm">{failedPosts.length} need attention</p>
                  </div>

                  <div className="space-y-2">
                    {failedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <div>
                              <p className="text-white text-sm font-medium">{post.post_title}</p>
                              <p className="text-white/60 text-xs">r/{post.target_subreddit}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => queueForDistribution(post.asset_id)}
                            className="h-8 text-xs bg-orange-500/20 border-orange-500/30 text-orange-400"
                          >
                            Retry
                          </Button>
                        </div>
                        {post.error_message && (
                          <p className="text-red-300 text-xs pl-7">{post.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
