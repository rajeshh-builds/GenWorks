"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Cpu,
  Layers,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface PortfolioItem {
  id?: string;
  title: string;
  contentType: string;
  toolsUsed: string[];
  workflow: string;
  mediaUrl: string;
}

const AI_TOOLS_LIST = [
  "Midjourney v6",
  "Runway Gen-3",
  "Kling 1.5",
  "Flux.1 Schnell",
  "Sora AI",
  "Luma Dream Machine",
  "ComfyUI",
  "Pika 2.0",
  "Leonardo AI",
  "Stable Diffusion XL",
];

const CONTENT_TYPES = [
  { label: "AI Video", icon: Film, value: "Video" },
  { label: "AI Image / Concept", icon: ImageIcon, value: "Image" },
  { label: "3D / Motion", icon: Layers, value: "3D" },
];

export default function CreatorPortfolioPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("Video");
  const [selectedTools, setSelectedTools] = useState<string[]>(["Runway Gen-3", "Midjourney v6"]);
  const [workflow, setWorkflow] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>([]);

  // Fetch real-time creator portfolio from MongoDB on mount
  useEffect(() => {
    let email = "";
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("genworks_creator_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          email = parsed.email || "";
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (email) {
      fetch(`/api/creator/profile?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.profile?.portfolioItems && data.profile.portfolioItems.length > 0) {
            setPortfolioList(data.profile.portfolioItems);
          }
        })
        .catch((err) => console.error("Error loading portfolio:", err));
    }
  }, []);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && (data.url || data.secure_url)) {
        setMediaUrl(data.url || data.secure_url);
      } else {
        setUploadError(data.error || "Upload failed. Please check file format.");
      }
    } catch (err: any) {
      setUploadError("Network error during file upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError("Please provide a project title.");
      return;
    }
    if (!mediaUrl.trim()) {
      setUploadError("Please upload media or provide an image/video URL.");
      return;
    }

    let userEmail = "";
    if (typeof window !== "undefined") {
      try {
        const prev = localStorage.getItem("genworks_creator_user");
        const parsed = prev ? JSON.parse(prev) : {};
        userEmail = parsed.email || "";
      } catch (e) {
        console.error(e);
      }
    }

    const newItem: PortfolioItem = {
      title,
      contentType,
      toolsUsed: selectedTools,
      workflow,
      mediaUrl,
    };

    try {
      const res = await fetch("/api/creator/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newItem, email: userEmail }),
      });
      const data = await res.json();
      if (data && data.item) {
        setPortfolioList([data.item, ...portfolioList]);
      } else {
        setPortfolioList([newItem, ...portfolioList]);
      }
    } catch {
      setPortfolioList([newItem, ...portfolioList]);
    }

    setTitle("");
    setWorkflow("");
    setMediaUrl("");
    setUploadError("");
  };

  const handleDelete = (index: number) => {
    setPortfolioList(portfolioList.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#FEF9E1] text-[#1A1A1A] font-sans antialiased selection:bg-[#D3A373]/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FEF9E1]/80 backdrop-blur-md border-b border-[#E5DEC9] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/profile/edit")}
              className="p-2 hover:bg-[#E5DEC9]/40 rounded-xl transition text-[#555]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">
                GenWorks
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D3A373]/20 text-[#A67C52] font-semibold uppercase tracking-wider">
                Creator Onboarding
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#777] font-medium hidden sm:inline">
              Step 2 of 4: Portfolio Setup
            </span>
            <button
              onClick={() => router.push("/profile/verification-choice")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] text-[#FEF9E1] text-xs font-semibold hover:bg-[#333] transition shadow-md"
            >
              Continue to AI Verification
              <ArrowRight className="w-4 h-4 text-[#D3A373]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Step Indicator Progress Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-[#888] mb-3">
            <span className="text-[#1A1A1A] font-bold">1. Profile</span>
            <span className="text-[#D3A373] font-bold">2. Portfolio</span>
            <span>3. Verification</span>
            <span>4. Studio</span>
          </div>
          <div className="w-full bg-[#E5DEC9] h-2 rounded-full overflow-hidden">
            <div className="bg-[#D3A373] h-full w-2/4 transition-all duration-300 rounded-full" />
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3A373]/15 text-[#8A5F35] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Portfolio Setup</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Curate Your AI Portfolio
          </h1>
          <p className="text-[#666] text-sm mt-2">
            Upload generative assets and prompts. Real-time Cloudinary conversion stores verified media in MongoDB.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add Project Form (Left Column) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DEC9] shadow-sm">
            <h2 className="text-lg font-bold font-serif text-[#1A1A1A] mb-1">
              Add New AI Masterpiece
            </h2>
            <p className="text-xs text-[#777] mb-6">
              Upload your best image or video generated using leading diffusion models.
            </p>

            <form onSubmit={handleAddProject} className="space-y-5">
              {/* Project Title */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cinematic Luma Drone Commercial"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FEF9E1]/30 border border-[#E5DEC9] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D3A373] transition placeholder:text-[#AAA]"
                />
              </div>

              {/* Content Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                  Content Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = contentType === type.value;
                    return (
                      <button
                        type="button"
                        key={type.value}
                        onClick={() => setContentType(type.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition ${
                          isSelected
                            ? "bg-[#1A1A1A] text-[#FEF9E1] border-[#1A1A1A] shadow-sm"
                            : "bg-[#FEF9E1]/40 border-[#E5DEC9] text-[#555] hover:border-[#D3A373]"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Tools Used */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                  AI Generation Tools Used
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {AI_TOOLS_LIST.map((tool) => {
                    const isSelected = selectedTools.includes(tool);
                    return (
                      <button
                        type="button"
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                          isSelected
                            ? "bg-[#D3A373] text-white border-[#D3A373]"
                            : "bg-white text-[#666] border-[#E5DEC9] hover:border-[#D3A373]"
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cloudinary Media Uploader */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                  Upload Media Asset (Cloudinary Engine) *
                </label>
                <div className="border-2 border-dashed border-[#D3A373]/60 rounded-2xl p-5 text-center bg-[#FEF9E1]/40 hover:bg-[#FEF9E1] transition">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="portfolio-upload-input"
                  />
                  <label
                    htmlFor="portfolio-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#D3A373] py-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading to Cloudinary CDN...
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-[#D3A373] mb-1" />
                        <span className="text-xs font-semibold text-[#1A1A1A]">
                          Click to upload file
                        </span>
                        <span className="text-[10px] text-[#777] mt-0.5">
                          High-res PNG, JPG, MP4 (Automatic Cloudinary CDN Conversion)
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                )}

                {mediaUrl && (
                  <div className="mt-2 p-2 bg-white border border-[#D3A373]/40 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#2e5c38] font-semibold truncate max-w-[320px]">
                      ✓ Cloudinary Asset Ready: {mediaUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaUrl("")}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold ml-2"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Prompt Workflow */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                  Prompt & Generation Settings
                </label>
                <textarea
                  rows={2}
                  value={workflow}
                  onChange={(e) => setWorkflow(e.target.value)}
                  placeholder="e.g. Model: Runway Gen-3 Alpha, Motion: 7, Prompt: 35mm cinematic anamorphic..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FEF9E1]/30 border border-[#E5DEC9] text-[#1A1A1A] focus:outline-none focus:border-[#D3A373]"
                />
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#1A1A1A] text-[#FEF9E1] font-semibold text-xs tracking-wider uppercase hover:bg-[#333] transition shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#D3A373]" />
                Add to Showcase
              </button>
            </form>
          </div>

          {/* Portfolio Live Grid (Right Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">
                Your Showcase Grid ({portfolioList.length})
              </h2>
              <span className="text-xs text-[#777]">
                Live preview of your public creator profile
              </span>
            </div>

            {portfolioList.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-dashed border-[#E5DEC9] text-center">
                <Layers className="w-10 h-10 text-[#D3A373] mx-auto mb-3 opacity-60" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">No portfolio items added yet</h3>
                <p className="text-xs text-[#777] mt-1 max-w-sm mx-auto">
                  Add at least 1-2 items using the form on the left to verify your prompt craft.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolioList.map((item, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video w-full bg-[#1A1A1A] overflow-hidden">
                      {item.contentType === "Video" && item.mediaUrl.endsWith(".mp4") ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A1A1A]/80 text-[#FEF9E1] backdrop-blur-sm">
                        {item.contentType}
                      </span>
                      <button
                        onClick={() => handleDelete(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 shadow"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-1 mb-1.5">
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.toolsUsed.map((tool, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FEF9E1] text-[#8A5F35] border border-[#E5DEC9]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                        {item.workflow && (
                          <p className="text-[11px] text-[#666] line-clamp-2 italic bg-[#FEF9E1]/30 p-2 rounded-lg border border-[#E5DEC9]/50">
                            {item.workflow}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Proceed CTA */}
            <div className="pt-6 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#777]">
                ✓ Portfolio synced with GenWorks MongoDB Atlas & Cloudinary CDN
              </div>
              <button
                onClick={() => router.push("/profile/verification-choice")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1A1A1A] text-[#FEF9E1] text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition shadow-lg flex items-center justify-center gap-2"
              >
                Continue to AI Verification Choice
                <ArrowRight className="w-4 h-4 text-[#D3A373]" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
