import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileVideo, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface Asset {
  id: string;
  file: File;
  conceptName: string;
  status: "pending" | "processing" | "ready";
  progress: number;
  thumbnail: string;
}

export default function DashboardContent() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [conceptName, setConceptName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const uploadRawAsset = (file: File) => {
    if (!conceptName.trim()) {
      toast.error("Please enter a concept name before uploading");
      return;
    }

    // Generate thumbnail
    const thumbnailUrl = URL.createObjectURL(file);

    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      conceptName: conceptName.trim(),
      status: "processing",
      progress: 0,
      thumbnail: thumbnailUrl,
    };

    setAssets((prev) => [newAsset, ...prev]);
    setConceptName("");

    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === newAsset.id
            ? { ...asset, progress }
            : asset
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setAssets((prev) =>
          prev.map((asset) =>
            asset.id === newAsset.id
              ? { ...asset, status: "ready" }
              : asset
          )
        );
        toast.success(`${file.name} ready for distribution`);
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
        toast.error(`${file.name} is not a video or image`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Eva Dashboard</h1>
              <p className="text-white/60 text-sm">Content Distribution Control</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Reddit • Instagram • OnlyFans</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-6">
          {/* Ingest Module */}
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Ingest</h2>
                <p className="text-white/60 text-sm">Upload raw assets for distribution pipeline</p>
              </div>

              {/* Concept Name Input */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium">Concept Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Red Carpet Glam, Behind Scenes, etc."
                  value={conceptName}
                  onChange={(e) => setConceptName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 transition-all ${
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
                    Drop files here or click to upload
                  </p>
                  <p className="text-white/60 text-sm">
                    Supports videos and images for Reddit, RedGifs, Instagram
                  </p>
                </label>
              </div>
            </div>
          </Card>

          {/* Asset Queue */}
          {assets.length > 0 && (
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-white/10">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Asset Queue</h2>
                  <p className="text-white/60 text-sm">{assets.length} assets in pipeline</p>
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
                            className="text-white/40 hover:text-white/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-white/60 text-sm mb-2">
                          Concept: {asset.conceptName}
                        </p>

                        {asset.status === "processing" && (
                          <div className="space-y-1">
                            <Progress value={asset.progress} className="h-2" />
                            <p className="text-white/40 text-xs">Processing... {asset.progress}%</p>
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
                              className="h-7 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
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
        </div>
      </div>
    </div>
  );
}
