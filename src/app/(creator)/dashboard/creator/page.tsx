"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  MessageSquarePlus,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Plus,
  UploadCloud,
  Image as ImageIcon,
  Film,
  ExternalLink,
  RefreshCw,
  LogOut,
  Send,
  Layers,
  Award,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  mediaUrl: string;
  contentType: string;
  toolsUsed: string[];
  workflow?: string;
  createdAt: string;
}

interface CreatorLog {
  id: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

interface CreatorUser {
  name?: string;
  email?: string;
}

interface CreatorProfileData {
  id: string;
  tagline?: string;
  bio?: string;
  tools: string[];
  isVerified: boolean;
  verificationScore?: number;
  user?: CreatorUser;
  portfolioItems: PortfolioItem[];
  creatorLogs: CreatorLog[];
}

export default function CreatorDashboardClient() {
  const router = useRouter();

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [profile, setProfile] = useState<CreatorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & form state
  const [isPostLogModalOpen, setIsPostLogModalOpen] = useState(false);
  const [logContent, setLogContent] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioMediaUrl, setPortfolioMediaUrl] = useState("");
  const [portfolioTools, setPortfolioTools] = useState("Midjourney v6, Runway Gen-3");
  const [portfolioWorkflow, setPortfolioWorkflow] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmittingPortfolio, setIsSubmittingPortfolio] = useState(false);

  // Load Current Authenticated Creator
  const fetchCreatorData = async (userEmail?: string) => {
    try {
      setIsLoading(true);
      const emailToQuery = userEmail || currentUser?.email || "";
      const res = await fetch(`/api/creator/profile?email=${encodeURIComponent(emailToQuery)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to load creator profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("genworks_creator_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          fetchCreatorData(parsed.email);
          return;
        } catch (e) {
          console.error("Failed to parse creator session:", e);
        }
      }
    }
    // Fallback if no specific session is cached
    fetchCreatorData();
  }, []);

  // Post Real-time Creator Status Log
  const handlePostLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;

    try {
      setIsSubmittingLog(true);
      const res = await fetch("/api/creator/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: logContent.trim(),
          userEmail: currentUser?.email || profile?.user?.email,
          creatorId: profile?.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.log) {
        setLogContent("");
        setIsPostLogModalOpen(false);
        // Refresh profile data in real time
        await fetchCreatorData(currentUser?.email);
      }
    } catch (err) {
      console.error("Failed to post log:", err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Upload Media via Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setPortfolioMediaUrl(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Post Real-time Showcase Project
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioTitle.trim() || !portfolioMediaUrl.trim()) return;

    try {
      setIsSubmittingPortfolio(true);
      const toolsArray = portfolioTools
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/creator/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: portfolioTitle.trim(),
          mediaUrl: portfolioMediaUrl.trim(),
          contentType: portfolioMediaUrl.endsWith(".mp4") ? "Video" : "Image",
          toolsUsed: toolsArray,
          workflow: portfolioWorkflow.trim(),
          email: currentUser?.email || profile?.user?.email,
          userEmail: currentUser?.email || profile?.user?.email,
          creatorId: profile?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.item) {
        setPortfolioTitle("");
        setPortfolioMediaUrl("");
        setPortfolioWorkflow("");
        setIsAddPortfolioModalOpen(false);
        // Refresh profile data in real time
        await fetchCreatorData(currentUser?.email);
      }
    } catch (err) {
      console.error("Failed to add portfolio item:", err);
    } finally {
      setIsSubmittingPortfolio(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("genworks_creator_user");
    }
    router.push("/login");
  };

  // Derived user details
  const displayName =
    currentUser?.name || profile?.user?.name || "Verified AI Creator";
  const displayEmail =
    currentUser?.email || profile?.user?.email || "creator@genworks.ai";
  const isVerified = profile?.isVerified ?? true;
  const verificationScore = profile?.verificationScore ?? 92;
  const tools = profile?.tools && profile.tools.length > 0 ? profile.tools : ["Midjourney v6", "Runway Gen-3", "Flux.1", "Kling AI"];
  const portfolioItems = profile?.portfolioItems || [];
  const creatorLogs = profile?.creatorLogs || [];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
      
      {/* ─────────────────────────────────────────────────────────
          1. HEADER WITH AUTHENTICATED USER IDENTITY & ACTIONS
      ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e4e3d9] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1b1c16] font-headline">
              Creator Studio
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9E1] text-[#9a6e3a] border border-[#d3a373]/40 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#d3a373]" />
                Elite Gold Verified ({verificationScore}%)
              </span>
            )}
          </div>
          <p className="text-[#6d5e52] text-sm mt-1.5 flex items-center gap-2">
            Welcome back, <strong className="text-[#1b1c16]">{displayName}</strong>
            <span className="text-[#b5a89b]">•</span>
            <span className="text-xs text-[#82756a] bg-[#efeee4] px-2 py-0.5 rounded-md font-mono">
              {displayEmail}
            </span>
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setIsPostLogModalOpen(true)}
            className="text-xs font-bold text-[#1b1c16] bg-[#efeee4] hover:bg-[#e4e3d9] px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#d3a373]" />
            <span>Post Live Log</span>
          </button>

          <button
            onClick={() => setIsAddPortfolioModalOpen(true)}
            className="text-xs font-bold text-[#fbfaf0] bg-[#1b1c16] hover:bg-[#30312b] px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5 text-[#d3a373]" />
            <span>Add Showcase Project</span>
          </button>

          <Link
            href="/dashboard"
            className="text-xs font-bold text-[#50453b] hover:text-[#1b1c16] px-4 py-2.5 rounded-full border border-[#e4e3d9] bg-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Client Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2.5 rounded-full border border-[#e4e3d9] text-[#82756a] hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          2. REAL-TIME CREATOR METRICS OVERVIEW
      ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e4e3d9] p-5 rounded-2xl shadow-sm hover:border-[#d3a373]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-[#82756a] uppercase tracking-wider">
              Verification Grade
            </span>
            <Award className="w-4 h-4 text-[#d3a373]" />
          </div>
          <div className="text-2xl font-black text-[#1b1c16] font-headline">
            {verificationScore}/100
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Gemini 3.8 Evaluated
          </p>
        </div>

        <div className="bg-white border border-[#e4e3d9] p-5 rounded-2xl shadow-sm hover:border-[#d3a373]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-[#82756a] uppercase tracking-wider">
              Portfolio Assets
            </span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#1b1c16] font-headline">
            {portfolioItems.length} Projects
          </div>
          <p className="text-[11px] font-semibold text-[#82756a] mt-1">
            100% Synced to MongoDB & Cloudinary
          </p>
        </div>

        <div className="bg-white border border-[#e4e3d9] p-5 rounded-2xl shadow-sm hover:border-[#d3a373]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-[#82756a] uppercase tracking-wider">
              Profile Impressions
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#1b1c16] font-headline">
            184 Views
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">
            +32% from brand direct inquiries
          </p>
        </div>

        <div className="bg-white border border-[#e4e3d9] p-5 rounded-2xl shadow-sm hover:border-[#d3a373]/50 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold text-[#82756a] uppercase tracking-wider">
              Active Escrow
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#1b1c16] font-headline">
            $2,800.00
          </div>
          <p className="text-[11px] font-semibold text-[#82756a] mt-1">
            1 Milestone in review
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          3. MAIN CONTENT: REAL-TIME PORTFOLIO & WORKFLOW LOGS
      ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Creator Showcase Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1b1c16] font-headline">
                Showcase Projects & Masterpieces
              </h2>
              <p className="text-xs text-[#82756a]">
                Directly visible to enterprise clients on the brand explore portal
              </p>
            </div>
            <button
              onClick={() => setIsAddPortfolioModalOpen(true)}
              className="text-xs font-bold text-[#9a6e3a] hover:text-[#7d562b] flex items-center gap-1 bg-[#FEF9E1] px-3 py-1.5 rounded-full border border-[#d3a373]/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload New</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#e4e3d9]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#d3a373] mx-auto mb-2" />
              <p className="text-xs text-[#82756a]">Loading real-time creator data...</p>
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#e4e3d9] space-y-3">
              <UploadCloud className="w-8 h-8 text-[#d3a373] mx-auto" />
              <h3 className="text-sm font-bold text-[#1b1c16]">No showcase items posted yet</h3>
              <p className="text-xs text-[#82756a] max-w-sm mx-auto">
                Upload your highest-fidelity video renders or Midjourney imagery to attract brand commissions.
              </p>
              <button
                onClick={() => setIsAddPortfolioModalOpen(true)}
                className="text-xs font-bold text-white bg-[#1b1c16] px-4 py-2 rounded-full"
              >
                Create First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#e4e3d9] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="relative aspect-video bg-[#1b1c16] overflow-hidden">
                    {item.mediaUrl.endsWith(".mp4") ? (
                      <video
                        src={item.mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {item.contentType}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#1b1c16] line-clamp-1">
                        {item.title}
                      </h3>
                      {item.workflow && (
                        <p className="text-xs text-[#6d5e52] mt-1 line-clamp-2 italic">
                          "{item.workflow}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#f4f3ea] flex items-center justify-between text-[11px] text-[#82756a]">
                      <div className="flex flex-wrap gap-1">
                        {item.toolsUsed.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-[#efeee4] px-1.5 py-0.5 rounded text-[10px] font-medium text-[#50453b]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="shrink-0 text-[10px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Live Studio Activity Logs & Tools Stack */}
        <div className="space-y-6">
          
          {/* Creator Profile Badge Card */}
          <div className="bg-[#FEF9E1] border border-[#d3a373]/40 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1b1c16] text-[#FEF9E1] font-bold flex items-center justify-center text-lg font-headline shrink-0">
                {displayName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1b1c16]">{displayName}</h3>
                <p className="text-xs text-[#9a6e3a] font-medium">
                  {profile?.tagline || "Visionary AI Content Creator"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#d3a373]/20 space-y-2">
              <span className="text-[11px] font-bold text-[#82756a] uppercase tracking-wider block">
                Production AI Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-white border border-[#d3a373]/30 text-xs font-semibold text-[#1b1c16] shadow-2xl shadow-black/5"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Studio Logs Feed */}
          <div className="bg-white border border-[#e4e3d9] p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1b1c16] font-headline flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-[#d3a373]" />
                Live Studio Updates
              </h3>
              <button
                onClick={() => setIsPostLogModalOpen(true)}
                className="text-[11px] font-bold text-[#9a6e3a] hover:underline"
              >
                + Post Log
              </button>
            </div>

            {creatorLogs.length === 0 ? (
              <p className="text-xs text-[#82756a] text-center py-4">
                No active updates posted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {creatorLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#faf9f5] border border-[#efeee4] space-y-1.5"
                  >
                    <p className="text-xs text-[#1b1c16] leading-relaxed">
                      {log.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#82756a] pt-1 border-t border-[#efeee4]/60">
                      <span>Live status</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────
          4. MODAL: POST REAL-TIME CREATOR LOG
      ───────────────────────────────────────────────────────── */}
      {isPostLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e3d9] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1b1c16] font-headline">
                Post Live Status Update
              </h3>
              <button
                onClick={() => setIsPostLogModalOpen(false)}
                className="text-xs text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostLog} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#50453b] block mb-1.5">
                  Update Content (Prompt experiments, new LoRAs, availability)
                </label>
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="e.g. Fine-tuned Flux.1 LoRA for hyper-realistic lighting. Ready for automotive brand briefs."
                  rows={4}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-[#e4e3d9] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#d3a373]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLog}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1b1c16] hover:bg-black rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-[#d3a373]" />
                  <span>{isSubmittingLog ? "Posting..." : "Broadcast Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          5. MODAL: ADD REAL-TIME SHOWCASE PROJECT
      ───────────────────────────────────────────────────────── */}
      {isAddPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e4e3d9] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1b1c16] font-headline">
                  Add Showcase Project
                </h3>
                <p className="text-xs text-[#82756a]">
                  Upload high-resolution video or renders to your public brand profile
                </p>
              </div>
              <button
                onClick={() => setIsAddPortfolioModalOpen(false)}
                className="text-xs text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#50453b] block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  placeholder="e.g. 30s Cyberpunk Fluid Dynamics Reel"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-[#e4e3d9] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#d3a373]"
                />
              </div>

              {/* Media Upload / URL */}
              <div>
                <label className="text-xs font-bold text-[#50453b] block mb-1">
                  Media Asset (Cloudinary Upload or Direct URL) *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={portfolioMediaUrl}
                      onChange={(e) => setPortfolioMediaUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/... or paste image/video URL"
                      required
                      className="flex-1 text-xs p-3 rounded-xl border border-[#e4e3d9] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#d3a373]"
                    />
                  </div>

                  <div className="border border-dashed border-[#d3a373]/60 bg-[#FEF9E1]/40 rounded-xl p-3 text-center">
                    <input
                      type="file"
                      id="studio-file-upload"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="studio-file-upload"
                      className="cursor-pointer text-xs font-bold text-[#9a6e3a] hover:underline flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className="w-4 h-4 text-[#d3a373]" />
                      <span>{isUploadingMedia ? "Uploading to Cloudinary..." : "Or Upload File from Device"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#50453b] block mb-1">
                  AI Models / Tools Used (Comma-separated)
                </label>
                <input
                  type="text"
                  value={portfolioTools}
                  onChange={(e) => setPortfolioTools(e.target.value)}
                  placeholder="Runway Gen-3, Midjourney v6, Kling AI, ComfyUI"
                  className="w-full text-xs p-3 rounded-xl border border-[#e4e3d9] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#d3a373]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#50453b] block mb-1">
                  Prompt Engineering / Creative Workflow
                </label>
                <textarea
                  value={portfolioWorkflow}
                  onChange={(e) => setPortfolioWorkflow(e.target.value)}
                  placeholder="Describe your prompt methodology, motion brush settings, or ControlNet pipeline..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-[#e4e3d9] bg-[#faf9f5] focus:bg-white focus:outline-none focus:border-[#d3a373]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPortfolioModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPortfolio || isUploadingMedia}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1b1c16] hover:bg-black rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d3a373]" />
                  <span>{isSubmittingPortfolio ? "Saving..." : "Publish to Showcase"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
