import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileVideo,
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
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

  const getUploadUrl = trpc.assets.getUploadUrl.useMutation();

  const confirmUpload = trpc.assets.confirmUpload.useMutation({
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
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const DIRECT_UPLOAD_THRESHOLD = 3 * 1024 * 1024; // 3MB - use presigned URL above this

  const uploadRawAsset = async (file: File) => {
    if (!conceptName.trim()) {
      toast.error("Enter concept name before uploading");
      return;
    }

    const fileId = `${file.name}-${Date.now()}`;
    setUploadingFiles((prev) => new Set(prev).add(fileId));

    try {
      if (file.size > DIRECT_UPLOAD_THRESHOLD) {
        // Large file: use presigned URL to upload directly to Supabase Storage
        const { signedUrl, fileKey } = await getUploadUrl.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          conceptName: conceptName.trim(),
        });

        // Upload directly to Supabase Storage
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text().catch(() => "");
          throw new Error(`Storage upload failed: ${uploadRes.status} ${uploadRes.statusText}${errorText ? `: ${errorText}` : ""}`);
        }

        // Confirm upload and create DB record
        await confirmUpload.mutateAsync({
          fileKey,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          conceptName: conceptName.trim(),
        });
      } else {
        // Small file: use base64 upload through API
        const base64Data = await fileToBase64(file);
        await uploadAsset.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data,
          conceptName: conceptName.trim(),
        });
      }
      setConceptName("");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
    const text = `Title: ${title}
URL: ${url}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied title and URL");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4" />;
      case "awaiting_redgifs_url":
        return <Upload className="h-4 w-4" />;
      case "uploading_redgifs":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "awaiting_reddit_post":
        return <ExternalLink className="h-4 w-4" />;
      case "posting_reddit":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "posted":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Eva Paradis</h1>
          <p className="text-white/40 text-sm">
            {activeTab === "warroom"
              ? "Bacheca"
              : activeTab === "posting"
              ? "Posting"
              : activeTab === "analytics"
              ? "Analytics"
              : "Link Health"}
          </p>
        </div>

        {/* Mode Indicator Badge - manual override disabled */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Auto Mode
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("warroom")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "warroom" ? "bg-[#D4AF37] text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Bacheca
          </button>
          <button
            onClick={() => setActiveTab("posting")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "posting" ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Posting
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "analytics" ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("linkhealth")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "linkhealth" ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Link Health
          </button>
        </div>

        {/* Stats */}
        {activeTab === "posting" && (
          <div className="flex gap-4">
            <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/60">
              <span className="text-amber-400 font-bold mr-1">{queuedPosts.length}</span> Queued
            </div>
            <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/60">
              <span className="text-green-400 font-bold mr-1">{postedPosts.length}</span> Posted
            </div>
            <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/60">
              <span className="text-red-400 font-bold mr-1">{failedPosts.length}</span> Failed
            </div>
          </div>
        )}
      </div>

      {activeTab === "warroom" ? (
        <WarRoom />
      ) : activeTab === "analytics" ? (
        <ConversionAnalytics snapshot={analyticsSnapshot} />
      ) : activeTab === "linkhealth" ? (
        <LinkHealthPanel />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Assets */}
          <div className="lg:col-span-4 space-y-8">
            {/* Ingest Module */}
            <Card className="p-6 bg-black/40 border-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Ingest</h2>
                  <p className="text-white/40 text-xs">Upload raw assets</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Upload className="h-5 w-5 text-amber-500" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Concept Name</label>
                  <Input
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
                  className={`border-2 border-dashed rounded-lg p-12 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    isDragging ? "border-amber-400 bg-amber-400/10" : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input type="file" id="file-upload" multiple accept="video/*,image/*" onChange={handleFileSelect} className="hidden" />
                  <Upload className="h-8 w-8 text-white/20" />
                  <div className="text-center">
                    <p className="text-sm text-white font-medium">Drop files or click</p>
                    <p className="text-xs text-white/40">Video/Image</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Asset Queue */}
            {assets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Assets</h2>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40">{assets.length} ready</span>
                </div>

                <div className="space-y-3">
                  {assets.map((asset) => (
                    <Card key={asset.id} className="p-4 bg-white/5 border-white/10 group hover:border-amber-500/30 transition-all">
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded overflow-hidden bg-black flex-shrink-0 border border-white/10">
                          {asset.file_type.startsWith("video/") ? (
                            <video src={asset.file_url} className="h-full w-full object-cover opacity-60" />
                          ) : (
                            <img src={asset.file_url} className="h-full w-full object-cover opacity-60" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-medium text-white truncate pr-2">{asset.file_name}</h3>
                            <button onClick={() => removeAsset(asset.id)} className="text-white/40 hover:text-white/80">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-amber-500/80 mb-3">{asset.concept_name}</p>

                          {asset.status === "ready" && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={subredditSelections[asset.id] || ""}
                                onValueChange={(value) => setSubredditSelections((prev) => ({ ...prev, [asset.id]: value }))}
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
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                )}
                                Queue
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Queue */}
          <div className="lg:col-span-8 space-y-8">
            {/* Queued/Publishing Posts */}
            {queuedPosts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Active Posts</h2>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    {queuedPosts.length} in progress
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {queuedPosts.map((post) => {
                    const asset = assets.find((a) => a.id === post.asset_id);
                    return (
                      <Card key={post.id} className="bg-black/40 border-white/5 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                          {/* Package Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(post.status)}`}>
                              {getStatusIcon(post.status)}
                              {getStatusLabel(post.status)}
                            </div>
                            <span className="text-[10px] text-white/20 font-mono">#{post.id}</span>
                          </div>
                          <div className="text-[10px] text-white/40">{new Date(post.created_at).toLocaleString()}</div>
                        </div>

                        <div className="p-4 space-y-4 flex-1">
                          {/* Post Title */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wider text-white/20 font-semibold">Title</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(post.post_title || "", `title-${post.id}`)}
                                className="h-8 w-8 p-0"
                              >
                                {copiedId === `title-${post.id}` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-white/40" />}
                              </Button>
                            </div>
                            <div className="p-2 bg-black/60 rounded border border-white/5 text-xs text-white/80 line-clamp-2">
                              {post.post_title}
                            </div>
                          </div>

                          {/* Target Subreddit */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-white/20 font-semibold">Subreddit</span>
                            <div className="flex items-center gap-1.5 text-xs text-white/60">
                              <div className="w-1 h-1 rounded-full bg-orange-500" />
                              r/{post.target_subreddit}
                            </div>
                          </div>

                          {/* Asset Info */}
                          {asset && (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-white/20 font-semibold">Asset</span>
                              <div className="flex items-center gap-2 text-xs text-white/40 truncate">
                                <FileVideo className="h-3 w-3" />
                                {asset.file_name}
                              </div>
                            </div>
                          )}

                          {/* Status Messages & Manual Wizards */}
                          {/* Manual Mode: RedGifs Upload Step */}
                          {post.status === "awaiting_redgifs_url" && asset && (
                            <div className="mt-4 pt-4 border-t border-purple-500/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-400 uppercase">STEP 1: Upload to RedGifs</span>
                              </div>
                              <p className="text-[10px] text-white/40">Upload this video to RedGifs, then paste the URL below.</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open("https://www.redgifs.com/upload", "_blank", "noopener,noreferrer")}
                                className="h-8 text-xs bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                              >
                                <Upload className="h-3 w-3 mr-1.5" />
                                Open RedGifs Upload
                              </Button>
                              <div className="flex gap-2">
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
                                  className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                                >
                                  {saveRedGifsUrl.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Manual Mode: Reddit Posting Step */}
                          {post.status === "awaiting_reddit_post" && asset && (
                            <div className="mt-4 pt-4 border-t border-orange-500/20 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-orange-400 uppercase">STEP 2: Post to Reddit</span>
                              </div>

                              <div className="space-y-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/20">Title:</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(post.post_title || "", `manual-title-${post.id}`)}
                                      className="h-6 text-xs"
                                    >
                                      {copiedId === `manual-title-${post.id}` ? (
                                        <>
                                          <Check className="h-2 w-2 mr-1" /> Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-2 w-2 mr-1" /> Copy
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="text-xs text-white/80 font-mono break-all">{post.post_title}</div>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/20">RedGifs URL:</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(asset.redgifs_url || "", `manual-url-${post.id}`)}
                                      className="h-6 text-xs"
                                    >
                                      {copiedId === `manual-url-${post.id}` ? (
                                        <>
                                          <Check className="h-2 w-2 mr-1" /> Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-2 w-2 mr-1" /> Copy
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="text-xs text-blue-400 font-mono break-all">{asset.redgifs_url}</div>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://www.reddit.com/r/${post.target_subreddit}/submit`, "_blank", "noopener,noreferrer")}
                                className="w-full h-8 text-xs bg-orange-500/20 border-orange-500/30 text-orange-300"
                              >
                                <ExternalLink className="h-3 w-3 mr-1.5" />
                                Open Subreddit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyAllForReddit(post.post_title || "", asset.redgifs_url || "", `manual-all-${post.id}`)}
                                className="w-full h-8 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
                              >
                                {copiedId === `manual-all-${post.id}` ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1.5" /> Copied All
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1.5" /> Copy All (Title + URL)
                                  </>
                                )}
                              </Button>

                              <div className="space-y-2">
                                <p className="text-[10px] text-white/40 uppercase font-bold">After posting, paste Reddit permalink:</p>
                                <div className="flex gap-2">
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
                                    className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                                  >
                                    {saveRedditPermalink.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Auto Mode: Processing Status */}
                          {(post.status === "uploading_redgifs" || post.status === "posting_reddit") && (
                            <div className="mt-4 flex flex-col items-center gap-2 p-4 bg-white/5 rounded border border-white/5">
                              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                              <span className="text-[10px] text-white/40 uppercase tracking-widest animate-pulse">
                                {post.status === "uploading_redgifs" ? "Uploading to RedGifs..." : "Posting to Reddit..."}
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Posted Packages */}
            {postedPosts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 px-1">Posted</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {postedPosts.map((post) => (
                    <Card key={post.id} className="p-4 bg-white/5 border-white/10 group hover:border-green-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center border border-green-500/20">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{post.post_title}</h3>
                          <p className="text-[10px] text-white/40">
                            r/{post.target_subreddit} • {post.posted_at ? new Date(post.posted_at).toLocaleString() : "Recently"}
                          </p>
                        </div>
                        {post.post_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(post.post_url || "", "_blank")}
                            className="h-8 text-xs text-white/40 hover:text-white hover:bg-white/10"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Packages */}
            {failedPosts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 px-1">Failed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {failedPosts.map((post) => (
                    <Card key={post.id} className="p-4 bg-white/5 border-white/10 group hover:border-red-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{post.post_title}</h3>
                          <p className="text-[10px] text-white/40">r/{post.target_subreddit}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => queueForDistribution(post.asset_id)}
                          className="h-8 text-xs bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                        >
                          Retry
                        </Button>
                      </div>
                      {post.error_message && (
                        <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/20 text-[10px] text-red-400 font-mono">
                          {post.error_message}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
