import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, FileVideo, X, Download, ExternalLink, Copy, Check,
  AlertCircle, Clock, CheckCircle2, XCircle 
} from "lucide-react";
import { toast } from "sonner";
import ConversionAnalytics from "./ConversionAnalytics";

interface Asset {
  id: string;
  file: File;
  conceptName: string;
  status: "pending" | "processing" | "ready" | "failed";
  progress: number;
  thumbnail: string;
  fileUrl: string; // S3 URL in production
}

interface PostPackage {
  id: string;
  assetId: string;
  postTitle: string;
  targetSubreddit: string;
  redgifsUrl: string;
  postUrl: string;
  status: "queued" | "posted" | "failed" | "needs-retry";
  createdAt: Date;
  postedAt: Date | null;
  errorNotes: string;
}

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"posting" | "analytics">("posting");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [postPackages, setPostPackages] = useState<PostPackage[]>([]);
  const [conceptName, setConceptName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const uploadRawAsset = (file: File) => {
    if (!conceptName.trim()) {
      toast.error("Enter concept name before uploading");
      return;
    }

    const thumbnailUrl = URL.createObjectURL(file);
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      conceptName: conceptName.trim(),
      status: "processing",
      progress: 0,
      thumbnail: thumbnailUrl,
      fileUrl: thumbnailUrl, // In production, this would be S3 URL
    };

    setAssets((prev) => [newAsset, ...prev]);
    setConceptName("");

    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === newAsset.id ? { ...asset, progress } : asset
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setAssets((prev) =>
          prev.map((asset) =>
            asset.id === newAsset.id ? { ...asset, status: "ready" } : asset
          )
        );
        toast.success(`${file.name} ready`);
      }
    }, 300);
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

  const removeAsset = (id: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  const downloadAsset = (asset: Asset) => {
    const url = URL.createObjectURL(asset.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = asset.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${asset.file.name}`);
  };

  const generatePostPackage = (asset: Asset) => {
    const subreddits = {
      general: ["gonewild", "RealGirls", "nsfw", "BustyPetite"],
      trans: ["traps", "GoneWildTrans", "transporn", "Tgirls"],
      lingerie: ["lingerie", "UnderwearGW"],
      videos: ["NSFW_GIF", "porn_gifs"],
      creators: ["OnlyFansPromotions", "OnlyFans101"],
    };

    // Simple targeting logic based on concept name
    let targetSub = "gonewild"; // default
    const concept = asset.conceptName.toLowerCase();
    
    if (concept.includes("lingerie") || concept.includes("underwear")) {
      targetSub = subreddits.lingerie[0];
    } else if (concept.includes("video") || asset.file.type.startsWith("video/")) {
      targetSub = subreddits.videos[0];
    } else if (concept.includes("trans") || concept.includes("tgirl")) {
      targetSub = subreddits.trans[0];
    }

    const postTitle = `${asset.conceptName} [OC]`;

    const newPackage: PostPackage = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: asset.id,
      postTitle,
      targetSubreddit: targetSub,
      redgifsUrl: "",
      postUrl: "",
      status: "queued",
      createdAt: new Date(),
      postedAt: null,
      errorNotes: "",
    };

    setPostPackages((prev) => [newPackage, ...prev]);
    toast.success("Post package created");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied");
  };

  const updatePackage = (id: string, updates: Partial<PostPackage>) => {
    setPostPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, ...updates } : pkg))
    );
  };

  const markAsPosted = (id: string) => {
    const pkg = postPackages.find((p) => p.id === id);
    if (!pkg?.redgifsUrl || !pkg?.postUrl) {
      toast.error("Paste RedGifs URL and Reddit URL first");
      return;
    }
    updatePackage(id, { status: "posted", postedAt: new Date() });
    toast.success("Marked as posted");
  };

  const markAsFailed = (id: string, errorNotes: string) => {
    updatePackage(id, { status: "failed", errorNotes });
    toast.error("Marked as failed");
  };

  const markAsRetry = (id: string) => {
    updatePackage(id, { status: "needs-retry", errorNotes: "" });
    toast.info("Moved to retry queue");
  };

  const getStatusIcon = (status: PostPackage["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "posted":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "needs-retry":
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
    }
  };

  const getStatusColor = (status: PostPackage["status"]) => {
    switch (status) {
      case "queued":
        return "bg-amber-500/20 text-amber-400";
      case "posted":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      case "needs-retry":
        return "bg-orange-500/20 text-orange-400";
    }
  };

  const queuedPackages = postPackages.filter(
    (p) => p.status === "queued" || p.status === "needs-retry"
  );
  const postedPackages = postPackages.filter((p) => p.status === "posted");
  const failedPackages = postPackages.filter((p) => p.status === "failed");

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
                    <span className="text-amber-400 font-bold">{queuedPackages.length}</span> Queued
                  </div>
                  <div>
                    <span className="text-green-400 font-bold">{postedPackages.length}</span> Posted
                  </div>
                  <div>
                    <span className="text-red-400 font-bold">{failedPackages.length}</span> Failed
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
                        {asset.file.type.startsWith("video/") ? (
                          <>
                            <video
                              src={asset.thumbnail}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <FileVideo className="w-6 h-6 text-purple-400" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={asset.thumbnail}
                            alt={asset.file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium truncate">{asset.file.name}</p>
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

                        {asset.status === "processing" && (
                          <div className="space-y-1">
                            <Progress value={asset.progress} className="h-2" />
                            <p className="text-white/40 text-xs">{asset.progress}%</p>
                          </div>
                        )}

                        {asset.status === "ready" && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                              Ready
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadAsset(asset)}
                              className="h-7 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generatePostPackage(asset)}
                              className="h-7 text-xs bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
                            >
                              Create Post Package
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

          {/* Queued Post Packages */}
          {queuedPackages.length > 0 && (
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-amber-500/20">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Queued Posts</h2>
                  <p className="text-white/60 text-sm">{queuedPackages.length} ready to execute</p>
                </div>

                <div className="space-y-4">
                  {queuedPackages.map((pkg) => {
                    const asset = assets.find((a) => a.id === pkg.assetId);
                    return (
                      <div
                        key={pkg.id}
                        className="p-6 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 space-y-4"
                      >
                        {/* Package Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(pkg.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                              {pkg.status}
                            </span>
                            <span className="text-white/40 text-xs">
                              #{pkg.id}
                            </span>
                          </div>
                          <span className="text-white/40 text-xs">
                            {pkg.createdAt.toLocaleDateString()}
                          </span>
                        </div>

                        {/* Post Title */}
                        <div className="space-y-2">
                          <label className="text-white/60 text-xs uppercase tracking-wider">Title</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 rounded bg-black/40 text-white text-sm font-mono border border-white/10">
                              {pkg.postTitle}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(pkg.postTitle, `title-${pkg.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedId === `title-${pkg.id}` ? (
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
                              r/{pkg.targetSubreddit}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                window.open(`https://reddit.com/r/${pkg.targetSubreddit}/submit`, "_blank")
                              }
                              className="h-8 text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>

                        {/* Content File */}
                        <div className="space-y-2">
                          <label className="text-white/60 text-xs uppercase tracking-wider">Content File</label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 rounded bg-black/40 text-white/60 text-xs font-mono border border-white/10 truncate">
                              {asset?.fileUrl || "N/A"}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(asset?.fileUrl || "", `file-${pkg.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedId === `file-${pkg.id}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* RedGifs Instructions */}
                        <div className="space-y-2 p-4 rounded bg-purple-500/10 border border-purple-500/20">
                          <label className="text-purple-300 text-xs uppercase tracking-wider font-bold">
                            RedGifs Upload
                          </label>
                          <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
                            <li>Go to redgifs.com/upload</li>
                            <li>Upload file from URL above</li>
                            <li>Set title: {pkg.postTitle}</li>
                            <li>Copy RedGifs URL</li>
                            <li>Paste below</li>
                          </ol>
                          <Input
                            placeholder="Paste RedGifs URL here"
                            value={pkg.redgifsUrl}
                            onChange={(e) => updatePackage(pkg.id, { redgifsUrl: e.target.value })}
                            className="bg-black/40 border-purple-500/30 text-white placeholder:text-white/40"
                          />
                        </div>

                        {/* Reddit Posting */}
                        <div className="space-y-2 p-4 rounded bg-orange-500/10 border border-orange-500/20">
                          <label className="text-orange-300 text-xs uppercase tracking-wider font-bold">
                            Reddit Post
                          </label>
                          <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
                            <li>Go to reddit.com/r/{pkg.targetSubreddit}/submit</li>
                            <li>Choose "Link" post</li>
                            <li>Title: {pkg.postTitle}</li>
                            <li>URL: Paste RedGifs URL</li>
                            <li>Mark NSFW: YES</li>
                            <li>Submit</li>
                            <li>Copy Reddit post URL</li>
                            <li>Paste below</li>
                          </ol>
                          <Input
                            placeholder="Paste Reddit post URL here"
                            value={pkg.postUrl}
                            onChange={(e) => updatePackage(pkg.id, { postUrl: e.target.value })}
                            className="bg-black/40 border-orange-500/30 text-white placeholder:text-white/40"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            onClick={() => markAsPosted(pkg.id)}
                            className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Posted
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const notes = prompt("Error reason:");
                              if (notes) markAsFailed(pkg.id, notes);
                            }}
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Mark Failed
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Posted Packages */}
          {postedPackages.length > 0 && (
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-green-500/20">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Posted</h2>
                  <p className="text-white/60 text-sm">{postedPackages.length} successful</p>
                </div>

                <div className="space-y-2">
                  {postedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{pkg.postTitle}</p>
                          <p className="text-white/60 text-xs">
                            r/{pkg.targetSubreddit} • {pkg.postedAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(pkg.postUrl, "_blank")}
                        className="h-8 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Failed Packages */}
          {failedPackages.length > 0 && (
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-red-500/20">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Failed</h2>
                  <p className="text-white/60 text-sm">{failedPackages.length} need attention</p>
                </div>

                <div className="space-y-2">
                  {failedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="text-white text-sm font-medium">{pkg.postTitle}</p>
                            <p className="text-white/60 text-xs">r/{pkg.targetSubreddit}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRetry(pkg.id)}
                          className="h-8 text-xs bg-orange-500/20 border-orange-500/30 text-orange-400"
                        >
                          Retry
                        </Button>
                      </div>
                      {pkg.errorNotes && (
                        <p className="text-red-300 text-xs pl-7">{pkg.errorNotes}</p>
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
