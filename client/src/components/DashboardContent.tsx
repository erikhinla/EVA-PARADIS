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

// Concept tags for the dropdown
const CONCEPT_TAGS = [
  { value: "DOMINANCE_WORSHIP", label: "Dominance Worship" },
  { value: "HARDCORE_GROUP", label: "Hardcore Group" },
  { value: "ANATOMY_SOLO", label: "Anatomy Solo" },
];

// Target subreddits organized by concept
const SUBREDDIT_OPTIONS = [
  { value: "TransGoneWild", label: "r/TransGoneWild" },
  { value: "Tgirls", label: "r/Tgirls" },
  { value: "TransPorn", label: "r/TransPorn" },
  { value: "GroupSex", label: "r/GroupSex" },
];

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"posting" | "analytics">("posting");
  const [conceptName, setConceptName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [subredditSelections, setSubredditSelections] = useState<Record<number, string>>({});

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "posting":
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
      case "posting":
        return "bg-blue-500/20 text-blue-400";
      case "posted":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const queuedPosts = posts.filter((p) => p.status === "queued" || p.status === "posting");
  const postedPosts = posts.filter((p) => p.status === "posted");
  const failedPosts = posts.filter((p) => p.status === "failed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Eva Dashboard</h1>
              <p className="text-white/60 text-sm">
                {activeTab === "posting" ? "Manual Posting Control" : "Conversion Analytics"}
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Tab Navigation */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("posting")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "posting"
                      ? "bg-amber-500 text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Posting
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "analytics"
                      ? "bg-amber-500 text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Analytics
                </button>
              </div>
              {/* Stats */}
              {activeTab === "posting" && (
                <div className="flex gap-6 text-right text-xs text-white/60">
                  <div>
                    <span className="text-amber-400 font-bold">{queuedPosts.length}</span> Queued
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
        {activeTab === "analytics" ? (
          <ConversionAnalytics />
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
                className={`border-2 border-dashed rounded-lg p-12 transition-all ${
                  isDragging
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
                        {asset.fileType.startsWith("video/") ? (
                          <>
                            <video
                              src={asset.fileUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <FileVideo className="w-6 h-6 text-purple-400" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={asset.fileUrl}
                            alt={asset.fileName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium truncate">{asset.fileName}</p>
                          <button
                            onClick={() => removeAsset(asset.id)}
                            className="text-white/40 hover:text-white/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-white/60 text-sm mb-2">
                          {asset.conceptName}
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
                                <SelectValue placeholder="Select subreddit" />
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
                              disabled={publishToReddit.isLoading}
                              className="h-7 text-xs bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
                            >
                              {publishToReddit.isLoading ? (
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
                    const asset = assets.find((a) => a.id === post.assetId);
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
                              {post.status}
                            </span>
                            <span className="text-white/40 text-xs">
                              #{post.id}
                            </span>
                          </div>
                          <span className="text-white/40 text-xs">
                            {new Date(post.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Post Title */}
                        <div className="space-y-2">
                          <label className="text-white/60 text-xs uppercase tracking-wider">Title</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 rounded bg-black/40 text-white text-sm font-mono border border-white/10">
                              {post.postTitle}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(post.postTitle || "", `title-${post.id}`)}
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
                              r/{post.targetSubreddit}
                            </code>
                          </div>
                        </div>

                        {/* Asset Info */}
                        {asset && (
                          <div className="space-y-2">
                            <label className="text-white/60 text-xs uppercase tracking-wider">Asset</label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 rounded bg-black/40 text-white/60 text-xs font-mono border border-white/10 truncate">
                                {asset.fileName}
                              </code>
                            </div>
                          </div>
                        )}

                        {/* Status Messages */}
                        {post.status === "posting" && (
                          <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                              <p className="text-blue-300 text-sm">
                                Publishing in progress... Uploading to RedGifs and posting to Reddit
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
                          <p className="text-white text-sm font-medium">{post.postTitle}</p>
                          <p className="text-white/60 text-xs">
                            r/{post.targetSubreddit} • {post.postedAt ? new Date(post.postedAt).toLocaleString() : "Recently"}
                          </p>
                        </div>
                      </div>
                      {post.postUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(post.postUrl || "", "_blank")}
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
                            <p className="text-white text-sm font-medium">{post.postTitle}</p>
                            <p className="text-white/60 text-xs">r/{post.targetSubreddit}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => queueForDistribution(post.assetId)}
                          className="h-8 text-xs bg-orange-500/20 border-orange-500/30 text-orange-400"
                        >
                          Retry
                        </Button>
                      </div>
                      {post.errorMessage && (
                        <p className="text-red-300 text-xs pl-7">{post.errorMessage}</p>
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
