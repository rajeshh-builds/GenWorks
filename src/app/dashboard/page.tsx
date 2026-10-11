"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Compass,
  Bookmark,
  Plus,
  Bell,
  MessageSquare,
  Settings,
  Search,
  Camera,
  Mic,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Heart,
  Share2,
  MoreHorizontal,
  Sliders,
  DollarSign,
  Clock,
  Play,
  Film,
  Layers,
  Cpu,
  User,
  LogOut,
  X,
  Send,
  Zap,
  Briefcase,
  FileCheck,
  ArrowRight,
  Filter,
  Lock,
} from "lucide-react";

// --- Types ---
interface PinItem {
  id: string;
  title: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  category: "viral" | "commercial" | "pipeline" | "human" | "cinematic";
  categoryLabel: string;
  previewImg: string;
  director: {
    name: string;
    handle: string;
    avatar: string;
    rating: number;
    completed: number;
    rate: string;
  };
  tools: string[];
  workflow: {
    model: string;
    seed: string;
    cfgScale: number;
    steps: number;
    sampler: string;
    positivePrompt: string;
  };
  likes: number;
  saved: boolean;
}

interface MilestoneStep {
  name: string;
  phase: string;
  status: "completed" | "current" | "pending";
  amount: string;
}

interface ClientBrief {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: "Active Escrow" | "In Review" | "Delivered";
  assignedDirector: string;
  assignedAvatar?: string;
  assignedHandle?: string;
  deliverable: string;
  deadline: string;
  escrowLocked: number;
  milestones: MilestoneStep[];
}

// --- Initial Mock Pins Data (Diverse aspect ratios for authentic Masonry waterfall) ---
const INITIAL_PINS: PinItem[] = [
  {
    id: "pin-1",
    title: "9:16 Cinematic Floral Perfume Ad — Elegant Rose Petals & Bloom",
    aspectRatio: "9:16",
    category: "viral",
    categoryLabel: "9:16 Viral Ad",
    previewImg: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Elena Vance",
      handle: "@elena_cinema",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      rating: 4.99,
      completed: 52,
      rate: "$95/hr",
    },
    tools: ["Runway Gen-3", "Kling 1.5", "Premiere"],
    workflow: {
      model: "Runway Gen-3 Alpha + Kling 1.5 Pro",
      seed: "8947219044",
      cfgScale: 7.5,
      steps: 50,
      sampler: "Euler a (Motion Vector 8.4)",
      positivePrompt: "Cinematic luxury perfume bottle nestled on a bed of soft blush rose petals, soft diffused morning studio illumination, macro depth of field, 8k resolution, shot on Arri Alexa 35 --ar 9:16",
    },
    likes: 342,
    saved: true,
  },
  {
    id: "pin-2",
    title: "AnimateDiff Multi-Pass Architectural Orbit Pipeline",
    aspectRatio: "16:9",
    category: "pipeline",
    categoryLabel: "ComfyUI Pipeline",
    previewImg: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Kai Chen",
      handle: "@kaichen_nodes",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      rating: 4.98,
      completed: 68,
      rate: "$120/hr",
    },
    tools: ["ComfyUI", "AnimateDiff", "Runway Gen-3"],
    workflow: {
      model: "ComfyUI + AnimateDiff v3 + Runway Gen-3",
      seed: "4490218821",
      cfgScale: 4.5,
      steps: 32,
      sampler: "dpmpp_2m_sde_gpu",
      positivePrompt: "Deterministic multi-pass AI video generation pipeline, cinematic anamorphic camera orbit around futuristic architecture, volumetric haze, temporal consistency with AnimateDiff motion LoRA",
    },
    likes: 512,
    saved: false,
  },
  {
    id: "pin-3",
    title: "AI Digital Human Spokesperson — Multilingual Lip Sync",
    aspectRatio: "9:16",
    category: "human",
    categoryLabel: "AI Human & Dubbing",
    previewImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Zara Al-Mansoor",
      handle: "@zara_virtual",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      rating: 4.96,
      completed: 39,
      rate: "$110/hr",
    },
    tools: ["LivePortrait", "SadTalker", "Runway Gen-3"],
    workflow: {
      model: "LivePortrait + Custom Persona LoRA + Runway Gen-3",
      seed: "1938502391",
      cfgScale: 6.5,
      steps: 35,
      sampler: "Euler Ancestral (Video Lip-Sync)",
      positivePrompt: "Consistent AI brand presenter video, speaking directly to camera with natural micro-expressions and eye contact, studio lighting, perfectly synchronized lip movements, 4k ultra-realistic portrait motion",
    },
    likes: 278,
    saved: true,
  },
  {
    id: "pin-4",
    title: "4K Commercial Product Ad — Artisanal Glass & Fluid Ripple",
    aspectRatio: "1:1",
    category: "commercial",
    categoryLabel: "Product Motion",
    previewImg: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Marcus Sterling",
      handle: "@marcus_visuals",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      rating: 4.97,
      completed: 58,
      rate: "$95/hr",
    },
    tools: ["Runway Gen-3", "Kling AI", "Luma Ray 2"],
    workflow: {
      model: "Runway Gen-3 Alpha + Kling 1.5 Pro",
      seed: "7320491823",
      cfgScale: 7.5,
      steps: 50,
      sampler: "Euler a (Motion Vector 9.2)",
      positivePrompt: "Cinematic 4K commercial product video, artisanal luxury perfume bottle floating in pristine slow-motion liquid ripples, dynamic volumetric studio lighting, macro anamorphic lens flare",
    },
    likes: 429,
    saved: false,
  },
  {
    id: "pin-5",
    title: "Cinematic Urban Canyon Hyperlapse — Anamorphic Dusk Traffic",
    aspectRatio: "16:9",
    category: "cinematic",
    categoryLabel: "Urban Cinematic",
    previewImg: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Aria Thorne",
      handle: "@aria_cinematics",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      rating: 4.95,
      completed: 44,
      rate: "$105/hr",
    },
    tools: ["Runway Gen-3", "Luma Dream Machine", "DaVinci"],
    workflow: {
      model: "Runway Gen-3 Alpha + Luma Ray 2",
      seed: "5591028301",
      cfgScale: 8.0,
      steps: 60,
      sampler: "Euler a (Speed 1.0x)",
      positivePrompt: "16:9 cinematic master shot, looking down a canyon of iconic skyscrapers and city traffic during golden hour dusk, anamorphic lens flare, motion blur, Arri Alexa 35 8k",
    },
    likes: 620,
    saved: true,
  },
  {
    id: "pin-6",
    title: "Zero-Latency AI Voice Dubbing — Neural Studio Acoustics",
    aspectRatio: "16:9",
    category: "human",
    categoryLabel: "Neural Voice Sync",
    previewImg: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Liam O'Connor",
      handle: "@liam_voicecraft",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
      rating: 4.94,
      completed: 61,
      rate: "$85/hr",
    },
    tools: ["ElevenLabs", "LivePortrait", "Wav2Lip"],
    workflow: {
      model: "ElevenLabs Neural Voice + LivePortrait Lip-Sync",
      seed: "9018471203",
      cfgScale: 0.75,
      steps: 1,
      sampler: "Neural Vocoder + Acoustic Match",
      positivePrompt: "Master multilingual studio dubbing pipeline, synchronized emotional speech across European and Asian language pairs, natural vocal acoustics matching original acoustic profile",
    },
    likes: 189,
    saved: false,
  },
  {
    id: "pin-7",
    title: "High-Top Streetwear Sneaker Showcase — Dynamic Studio Lighting",
    aspectRatio: "1:1",
    category: "commercial",
    categoryLabel: "Product Motion",
    previewImg: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Devon Miller",
      handle: "@devon_motion",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      rating: 4.97,
      completed: 37,
      rate: "$90/hr",
    },
    tools: ["Runway Gen-3", "ComfyUI", "Blender"],
    workflow: {
      model: "Runway Gen-3 + Custom Footwear LoRA",
      seed: "6321901452",
      cfgScale: 7.0,
      steps: 45,
      sampler: "Euler a",
      positivePrompt: "Commercial 1:1 footwear showcase, iconic retro high-top basketball sneakers resting on asphalt court under dramatic angled studio spotlights, photorealistic textures, 4k ultra-detail",
    },
    likes: 384,
    saved: true,
  },
  {
    id: "pin-8",
    title: "Dystopian Sand Dune Odyssey — Atmospheric Drone Pullback",
    aspectRatio: "16:9",
    category: "cinematic",
    categoryLabel: "Cinematic Trailer",
    previewImg: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80",
    director: {
      name: "Aria Thorne",
      handle: "@aria_cinematics",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      rating: 4.95,
      completed: 44,
      rate: "$105/hr",
    },
    tools: ["Runway Gen-3", "Midjourney v6", "DaVinci"],
    workflow: {
      model: "Runway Gen-3 + Luma Ray 2",
      seed: "3182746199",
      cfgScale: 8.5,
      steps: 60,
      sampler: "Euler a",
      positivePrompt: "Massive scale wide shot, lone nomad walking through towering orange sand dunes during twilight, twin moons in sky, cinematic film grain, Hans Zimmer soundtrack vibe",
    },
    likes: 712,
    saved: false,
  },
];

const INITIAL_BRIEFS: ClientBrief[] = [
  {
    id: "brief-101",
    title: "Q4 Luxury Fragrance TikTok Series (3x 9:16)",
    category: "9:16 Viral Ad",
    budget: "$2,400",
    status: "Active Escrow",
    assignedDirector: "Elena Vance",
    assignedAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    assignedHandle: "@elena_cinema",
    deliverable: "3x 15s 4K Reels (.mp4) + Seed Parameters & ComfyUI Graph",
    deadline: "Oct 18, 2026",
    escrowLocked: 2400,
    milestones: [
      { phase: "Milestone 1", name: "Styleframes & Prompt Seed Lock", status: "completed", amount: "$800" },
      { phase: "Milestone 2", name: "3x 15s 4K Motion Passes & Color Grade", status: "current", amount: "$1,100" },
      { phase: "Milestone 3", name: "Final IP Transfer & Node Archive", status: "pending", amount: "$500" },
    ],
  },
  {
    id: "brief-102",
    title: "SaaS Explainer AI Avatar Lip-Sync in Spanish & German",
    category: "AI Human & Dubbing",
    budget: "$1,850",
    status: "In Review",
    assignedDirector: "Zara Al-Mansoor",
    assignedAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    assignedHandle: "@zara_virtual",
    deliverable: "2x 60s Localized Product Demos + Custom Voice LoRA",
    deadline: "Oct 22, 2026",
    escrowLocked: 1850,
    milestones: [
      { phase: "Milestone 1", name: "Multilingual Script & Voice Training", status: "completed", amount: "$600" },
      { phase: "Milestone 2", name: "LivePortrait Lip-Sync (ES & DE Versions)", status: "current", amount: "$850" },
      { phase: "Milestone 3", name: "Master 4K Video Exports & Seed Locks", status: "pending", amount: "$400" },
    ],
  },
];

const AI_TOOLS = [
  "all",
  "Runway Gen-3",
  "Midjourney v6",
  "Kling AI",
  "Flux.1",
  "ComfyUI",
  "Luma Ray",
  "ElevenLabs",
];

const CAMPAIGN_TEMPLATES = [
  {
    id: "tpl-1",
    title: "30s Photorealistic Beverage Commercial",
    category: "4K Product Commercial",
    budget: "$2,800",
    tools: ["Runway Gen-3", "Midjourney v6", "ComfyUI"],
    description: "Ultra-high-speed macro liquid splashes, ice condensation, dynamic camera orbits with photorealistic lighting.",
    suggestedDirector: "Marcus Sterling",
    icon: "🍹",
    estimatedTurnaround: "3 Days",
  },
  {
    id: "tpl-2",
    title: "Viral TikTok AI Influencer Hook",
    category: "9:16 Viral Video",
    budget: "$1,200",
    tools: ["Kling 1.5", "Flux.1", "ElevenLabs"],
    description: "Fast-paced UGC style talking avatar with expressive lip-sync and 3-second hook retention optimization.",
    suggestedDirector: "Elena Vance",
    icon: "📱",
    estimatedTurnaround: "24 Hours",
  },
  {
    id: "tpl-3",
    title: "Architectural Luxury Villa Walkthrough",
    category: "Cinematic Trailer",
    budget: "$3,500",
    tools: ["Luma Ray", "Sora", "Midjourney"],
    description: "Smooth drone transitions through modern minimalist architecture, warm sunset volumetric rays, 60fps cinematic master.",
    suggestedDirector: "Zara Al-Mansoor",
    icon: "🏛️",
    estimatedTurnaround: "4 Days",
  },
  {
    id: "tpl-4",
    title: "Cyberpunk Tech Product Launch Teaser",
    category: "ComfyUI Motion Pipeline",
    budget: "$2,200",
    tools: ["Runway Gen-3", "ComfyUI", "Flux.1"],
    description: "Futuristic neon holograms, glowing circuit telemetry, stylized kinetic typography for hardware startup.",
    suggestedDirector: "Kai Chen",
    icon: "⚡",
    estimatedTurnaround: "2 Days",
  },
];

export default function ClientDashboardPage() {
  const router = useRouter();

  // Navigation & Filter States
  const [activeNav, setActiveNav] = useState<"home" | "explore" | "boards" | "escrow" | "briefs">("home");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedTool, setSelectedTool] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // AI Matchmaker Modal State (Powered by Gemini)
  const [isAiMatchOpen, setIsAiMatchOpen] = useState<boolean>(false);
  const [aiMatchQuery, setAiMatchQuery] = useState<string>("");
  const [aiMatchLoading, setAiMatchLoading] = useState<boolean>(false);
  const [aiMatchResult, setAiMatchResult] = useState<any>(null);

  // Templates Modal State
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);

  // Edit Client Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [editProfileName, setEditProfileName] = useState("Hostlekid");
  const [editProfileEmail, setEditProfileEmail] = useState("hostlekid629@gmail.com");
  const [editProfileCompany, setEditProfileCompany] = useState("GenWorks Brand Studio");
  const [editProfileIndustry, setEditProfileIndustry] = useState("Consumer Tech & Media");

  // User Profile Dropdown State (Pinterest Style popover)
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Client User Data (matches Hostlekid / GenWorks enterprise profile)
  const [clientUser, setClientUser] = useState({
    name: "Hostlekid",
    email: "hostlekid629@gmail.com",
    role: "Client • Enterprise Partner",
    avatarInitial: "H",
    balanceInEscrow: 4250,
    activeCampaigns: 2,
    savedMoodboardsCount: 6,
  });

  // Pins & Saved State
  const [pins, setPins] = useState<PinItem[]>(INITIAL_PINS);
  const [briefs, setBriefs] = useState<ClientBrief[]>(INITIAL_BRIEFS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedPin, setSelectedPin] = useState<PinItem | null>(null);
  const [createBriefModalOpen, setCreateBriefModalOpen] = useState<boolean>(false);
  const [commissionDirectorModalOpen, setCommissionDirectorModalOpen] = useState<PinItem | null>(null);

  // Create Brief Form State
  const [newBriefTitle, setNewBriefTitle] = useState("");
  const [newBriefCategory, setNewBriefCategory] = useState("9:16 Viral Video");
  const [newBriefBudget, setNewBriefBudget] = useState("$2,500");
  const [newBriefDetails, setNewBriefDetails] = useState("");
  const [newBriefDirector, setNewBriefDirector] = useState("Elena Vance");

  // Fetch real-time verified creators and briefs from MongoDB Atlas
  useEffect(() => {
    async function loadRealData() {
      try {
        const res = await fetch("/api/creators");
        const data = await res.json();
        if (data && data.creators && data.creators.length > 0) {
          // Flatten portfolios created by real creators
          const livePins: any[] = [];
          data.creators.forEach((c: any, cIdx: number) => {
            if (c.portfolio && c.portfolio.length > 0) {
              c.portfolio.forEach((p: any, pIdx: number) => {
                livePins.push({
                  id: p.id || `pin-${cIdx}-${pIdx}`,
                  title: p.title || `${c.name}'s Project`,
                  aspectRatio: "16:9",
                  category: "commercial",
                  categoryLabel: p.toolsUsed?.[0] || c.tools?.[0] || "AI Generation",
                  previewImg: p.mediaUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
                  director: {
                    name: c.name || "AI Creator",
                    handle: `@${(c.name || 'creator').toLowerCase().replace(/\s+/g, '_')}`,
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.name || 'creator')}`,
                    rating: 4.96,
                    completed: 24,
                    rate: "$95/hr",
                  },
                  tools: p.toolsUsed?.length > 0 ? p.toolsUsed : (c.tools?.length > 0 ? c.tools : ["Runway Gen-3"]),
                  workflow: {
                    model: (p.toolsUsed && p.toolsUsed.join(" + ")) || "Runway Gen-3",
                    seed: "94827104",
                    cfgScale: 7.5,
                    steps: 50,
                    sampler: "Euler a",
                    positivePrompt: p.workflow || `Generative production piece crafted by ${c.name}`,
                  },
                  likes: 120 + pIdx * 45,
                  saved: false,
                });
              });
            } else {
              livePins.push({
                id: `pin-live-${c.id || cIdx}`,
                title: c.bio || `${c.name || 'AI Creator'} Showcase`,
                aspectRatio: "16:9",
                category: "commercial",
                categoryLabel: c.tools && c.tools[0] ? `${c.tools[0]} Specialist` : "AI Cinema",
                previewImg: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
                director: {
                  name: c.name || "Verified Creator",
                  handle: `@${(c.name || 'creator').toLowerCase().replace(/\s+/g, '_')}`,
                  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.name || 'creator')}`,
                  rating: 4.95,
                  completed: 18,
                  rate: "$95/hr",
                },
                tools: c.tools && c.tools.length > 0 ? c.tools : ["Midjourney v6", "Runway Gen-3"],
                workflow: {
                  model: (c.tools && c.tools.join(" + ")) || "Runway Gen-3 + Midjourney v6",
                  seed: "84729104",
                  cfgScale: 7.5,
                  steps: 45,
                  sampler: "DPM++ 2M Karras",
                  positivePrompt: `Hyper-realistic generative AI masterpiece crafted by ${c.name}, 8k cinema grade`,
                },
                likes: (cIdx + 1) * 87,
                saved: false,
              });
            }
          });
          if (livePins.length > 0) {
            setPins(livePins);
          }
        }
      } catch (err) {
        console.error("Failed to load live creators into dashboard:", err);
      }
    }
    loadRealData();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Pins
  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      const matchesSearch =
        searchQuery === "" ||
        pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pin.director.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pin.tools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pin.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter by AI Tool
      const matchesTool =
        selectedTool === "all" ||
        pin.tools.some((t) => t.toLowerCase().includes(selectedTool.toLowerCase()));
      if (!matchesTool) return false;

      if (selectedFilter === "all") return true;
      if (selectedFilter === "saved") return pin.saved;
      if (selectedFilter === "viral") return pin.category === "viral";
      if (selectedFilter === "commercial") return pin.category === "commercial";
      if (selectedFilter === "pipeline") return pin.category === "pipeline";
      if (selectedFilter === "human") return pin.category === "human";
      if (selectedFilter === "cinematic") return pin.category === "cinematic";
      return true;
    });
  }, [pins, selectedFilter, selectedTool, searchQuery]);

  // AI Matchmaker Handler (Powered by Gemini API)
  const handleRunAiMatch = async (presetText?: string) => {
    const query = presetText || aiMatchQuery;
    if (!query.trim()) return;
    setAiMatchLoading(true);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefTitle: "Campaign AI Match",
          description: query,
          toolsNeeded: selectedTool !== "all" ? [selectedTool] : [],
        }),
      });
      const data = await res.json();
      setAiMatchResult(data);
    } catch (err) {
      console.error("Failed to run Gemini AI Match:", err);
    } finally {
      setAiMatchLoading(false);
    }
  };

  // Apply Campaign Brief Template
  const handleUseTemplate = (tpl: (typeof CAMPAIGN_TEMPLATES)[0]) => {
    setNewBriefTitle(tpl.title);
    setNewBriefCategory(tpl.category);
    setNewBriefBudget(tpl.budget);
    setNewBriefDetails(tpl.description);
    setNewBriefDirector(tpl.suggestedDirector);
    setIsTemplatesOpen(false);
    setCreateBriefModalOpen(true);
    triggerToast(`Applied template: "${tpl.title}"`);
  };

  // Actions
  const toggleSavePin = (pinId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPins((prev) =>
      prev.map((p) => {
        if (p.id === pinId) {
          const nextSaved = !p.saved;
          triggerToast(
            nextSaved
              ? `Saved to 'Q4 Campaign Moodboard'`
              : `Removed from Moodboard`
          );
          return { ...p, saved: nextSaved, likes: nextSaved ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      })
    );
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCreateBriefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBriefTitle) return;

    const newBrief: ClientBrief = {
      id: `brief-${Date.now().toString().slice(-4)}`,
      title: newBriefTitle,
      category: newBriefCategory,
      budget: newBriefBudget,
      status: "Active Escrow",
      assignedDirector: newBriefDirector,
      assignedAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      assignedHandle: `@${newBriefDirector.toLowerCase().replace(/\s+/g, "_")}`,
      deliverable: "Custom 4K AI Video Master & Verified JSON Workflow",
      deadline: "7 Days from Approval",
      escrowLocked: parseInt(newBriefBudget.replace(/[^0-9]/g, "")) || 2000,
      milestones: [
        { phase: "Milestone 1", name: "Prompt Seed & Styleframe Approval", status: "current", amount: "$750" },
        { phase: "Milestone 2", name: "Motion Render Pass & Upscale", status: "pending", amount: "$1,000" },
        { phase: "Milestone 3", name: "Master IP Delivery & Asset Archive", status: "pending", amount: "$750" },
      ],
    };

    setBriefs([newBrief, ...briefs]);
    setClientUser((prev) => ({
      ...prev,
      balanceInEscrow: prev.balanceInEscrow + newBrief.escrowLocked,
      activeCampaigns: prev.activeCampaigns + 1,
    }));
    setCreateBriefModalOpen(false);
    setNewBriefTitle("");
    setNewBriefDetails("");
    triggerToast("✨ New Video Production Brief Created & Locked in Escrow!");
  };

  return (
    <div className="min-h-screen bg-[#fbfaf0] text-[#1b1c16] font-body flex flex-col md:flex-row antialiased selection:bg-[#d3a373]/30">
      {/* ========================================================
          LEFT FIXED NAVIGATION RAIL (Pinterest Dock Style)
      ======================================================== */}
      <aside className="w-full md:w-20 md:min-w-[80px] md:h-screen md:sticky md:top-0 bg-[#f5f4ea] border-r border-[#e4e3d9] flex md:flex-col items-center justify-between p-3 md:py-6 z-30 shadow-[1px_0_12px_rgba(0,0,0,0.02)]">
        {/* Brand Monogram / Logo at Top Left */}
        <div className="flex md:flex-col items-center gap-3">
          <Link
            href="/"
            title="GenWorks — Back to Home"
            className="w-12 h-12 rounded-2xl bg-[#1b1c16] flex items-center justify-center text-[#d3a373] shadow-md hover:scale-105 active:scale-95 transition-all group relative"
          >
            {/* GenWorks Geometric Monogram */}
            <svg
              className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            {/* Tooltip on Hover */}
            <span className="hidden md:group-hover:block absolute left-16 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-xl z-50">
              GenWorks Home
            </span>
          </Link>
        </div>

        {/* Center Navigation Dock Items */}
        <nav className="flex md:flex-col items-center gap-2 md:gap-3.5 my-auto">
          {/* Home / Feed */}
          <button
            onClick={() => {
              setActiveNav("home");
              setSelectedFilter("all");
            }}
            title="Home Feed"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
              activeNav === "home"
                ? "bg-[#1b1c16] text-[#fbfaf0] shadow-md"
                : "text-[#50453b] hover:bg-[#eae8df] hover:text-[#1b1c16]"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Home Feed
            </span>
          </button>

          {/* Explore / Video Reels */}
          <button
            onClick={() => {
              setActiveNav("explore");
              setSelectedFilter("viral");
            }}
            title="Explore AI Reels"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
              activeNav === "explore"
                ? "bg-[#1b1c16] text-[#fbfaf0] shadow-md"
                : "text-[#50453b] hover:bg-[#eae8df] hover:text-[#1b1c16]"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Explore Reels
            </span>
          </button>

          {/* Saved Boards / Moodboards */}
          <button
            onClick={() => {
              setActiveNav("boards");
              setSelectedFilter("saved");
            }}
            title="Saved Moodboards"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
              activeNav === "boards"
                ? "bg-[#1b1c16] text-[#fbfaf0] shadow-md"
                : "text-[#50453b] hover:bg-[#eae8df] hover:text-[#1b1c16]"
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Saved Moodboards
            </span>
          </button>

          {/* Create Brief Button (Pinterest + icon) */}
          <button
            onClick={() => setCreateBriefModalOpen(true)}
            title="Commission New Brief"
            className="w-11 h-11 rounded-2xl bg-[#d3a373] text-[#1b1c16] hover:bg-[#c29263] flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 relative group"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Create Client Brief
            </span>
          </button>

          {/* Milestone Escrow Contracts */}
          <button
            onClick={() => setActiveNav("escrow")}
            title="Milestone Escrow Vault"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${
              activeNav === "escrow"
                ? "bg-[#1b1c16] text-[#fbfaf0] shadow-md"
                : "text-[#50453b] hover:bg-[#eae8df] hover:text-[#1b1c16]"
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-[#7d562d]" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Escrow Vault ($4,250)
            </span>
          </button>

          {/* Notifications with red indicator dot */}
          <button
            onClick={() => triggerToast("2 New Reel Deliverables Ready for Inspection")}
            title="Notifications"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#50453b] hover:bg-[#eae8df] hover:text-[#1b1c16] transition-all relative group"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#f5f4ea]" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Notifications (2)
            </span>
          </button>

          {/* Direct Creator Messages */}
          <button
            onClick={() => triggerToast("Elena Vance sent 2 new ComfyUI video variations")}
            title="Messages"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#50453b] hover:bg-[#eae8df] hover:text-[#1b1c16] transition-all relative group"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Director Messages
            </span>
          </button>
        </nav>

        {/* Bottom Rail / Settings */}
        <div className="flex md:flex-col items-center gap-2">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            title="Settings & Workspace"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#82756a] hover:bg-[#eae8df] hover:text-[#1b1c16] transition-colors relative group"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden md:group-hover:block absolute left-14 bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-50">
              Client Settings
            </span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN VIEWPORT (Header + Filters + Waterfall Canvas)
      ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* --- STICKY TOP APPLICATION HEADER --- */}
        <header className="sticky top-0 z-20 bg-[#fbfaf0]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-[#e4e3d9]/80 flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Portal Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="font-headline font-black text-xl tracking-tight text-[#1b1c16]">
                GenWorks
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#1b1c16] text-[#d3a373] shadow-xs">
                Client Portal
              </span>
            </Link>
          </div>

          {/* Center: Pinterest Universal Pill Search Bar with Gemini AI Match */}
          <div className="flex-1 max-w-3xl relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setAiMatchQuery(searchQuery);
                  setIsAiMatchOpen(true);
                  handleRunAiMatch(searchQuery);
                }
              }}
              className="relative flex items-center"
            >
              <Search className="w-4 h-4 text-[#82756a] absolute left-4.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI directors or type creative brief for instant Gemini Match..."
                className="w-full bg-[#efeee4] hover:bg-[#eae8df] focus:bg-white text-[#1b1c16] placeholder-[#82756a] text-sm font-medium rounded-full pl-11 pr-36 py-2.5 border border-transparent focus:border-[#d3a373] focus:outline-none focus:ring-2 focus:ring-[#d3a373]/20 transition-all shadow-inner"
              />
              {/* Quick AI Search Trigger & Media Buttons */}
              <div className="absolute right-2.5 flex items-center gap-1.5 text-[#82756a]">
                {searchQuery.trim() && (
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-[11px] font-bold bg-[#1b1c16] text-[#d3a373] px-2.5 py-1 rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all"
                    title="Run Gemini AI Match on this prompt"
                  >
                    <Sparkles className="w-3 h-3 text-[#d3a373]" />
                    <span>AI Match</span>
                  </button>
                )}
                <button
                  type="button"
                  title="Search by Reference Visual / Seed"
                  onClick={() => triggerToast("Upload reference moodboard image to match AI Directors")}
                  className="p-1.5 hover:text-[#1b1c16] hover:bg-[#e4e3d9] rounded-full transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Voice Search"
                  onClick={() => triggerToast("Listening for creative brief intent...")}
                  className="p-1.5 hover:text-[#1b1c16] hover:bg-[#e4e3d9] rounded-full transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right: Quick Action & User Profile Trigger (Pinterest Popover Anchor) */}
          <div className="flex items-center gap-2.5 shrink-0 relative" ref={profileMenuRef}>
            {/* AI Smart Match (Gemini API) */}
            <button
              onClick={() => setIsAiMatchOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#d3a373] to-[#b88656] text-[#1b1c16] text-xs font-bold py-2.5 px-3.5 sm:px-4 rounded-full transition-all shadow-md hover:brightness-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1b1c16]" />
              <span className="font-headline font-bold">AI Match</span>
            </button>

            {/* Campaign Templates CTA */}
            <button
              onClick={() => setIsTemplatesOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-[#efeee4] hover:bg-[#e4e3d9] text-[#1b1c16] text-xs font-bold py-2.5 px-3.5 rounded-full transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-[#7d562d]" />
              <span>Templates</span>
            </button>

            {/* Create Brief Quick CTA */}
            <button
              onClick={() => setCreateBriefModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 bg-[#1b1c16] hover:bg-[#30312b] text-[#fbfaf0] text-xs font-bold py-2.5 px-4 rounded-full transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#d3a373]" />
              <span>Commission Brief</span>
            </button>

            {/* User Profile Avatar with Initial 'H' and Chevron */}
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#efeee4] transition-colors focus:outline-none"
              title="Open Client Account Menu"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9d2466] to-[#d83b89] text-white flex items-center justify-center font-headline font-black text-sm shadow-sm ring-2 ring-white">
                {clientUser.avatarInitial}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#50453b] transition-transform duration-200 ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ========================================================
                USER PROFILE DROPDOWN MENU (Exact Pinterest Style Match)
            ======================================================== */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl border border-[#e4e3d9] p-4 text-[#1b1c16] animate-scale-in z-50">
                {/* Section Header */}
                <div className="text-[11px] font-bold text-[#82756a] uppercase tracking-wider mb-2 px-1">
                  Currently in
                </div>

                {/* Profile Card Box (Hostlekid Card from screenshot) */}
                <div className="p-3.5 rounded-2xl bg-[#fbfaf0] border border-[#e4e3d9] flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#9d2466] to-[#d83b89] text-white flex items-center justify-center font-headline font-black text-lg shadow-sm shrink-0">
                    {clientUser.avatarInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-headline font-bold text-sm text-[#1b1c16] truncate">
                      {clientUser.name}
                    </div>
                    <div className="text-[11px] font-semibold text-[#7d562d] flex items-center gap-1">
                      <span>Client Account</span>
                      <span className="w-1 h-1 rounded-full bg-[#7d562d]" />
                      <span>Verified</span>
                    </div>
                    <div className="text-[11px] text-[#82756a] truncate">
                      {clientUser.email}
                    </div>
                  </div>
                </div>

                {/* Escrow Balance Metric Strip */}
                <div className="p-3 rounded-2xl bg-[#f5f4ea] border border-[#e4e3d9] mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[#82756a] uppercase">
                      Protected in Escrow
                    </div>
                    <div className="text-base font-headline font-black text-[#1b1c16]">
                      ${clientUser.balanceInEscrow.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#82756a] uppercase">
                      Active Briefs
                    </div>
                    <div className="text-base font-headline font-bold text-[#7d562d]">
                      {clientUser.activeCampaigns} Campaigns
                    </div>
                  </div>
                </div>

                {/* Account Actions & Links (Pinterest list style) */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setCreateBriefModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#efeee4] transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5 text-[#d3a373]" />
                      <span>Post New Production Brief</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#d3a373] bg-[#1b1c16] px-2 py-0.5 rounded-full">
                      Escrow
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveNav("boards");
                      setSelectedFilter("saved");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#efeee4] transition-colors flex items-center gap-2"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#50453b]" />
                    <span>Saved Video Moodboards</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveNav("escrow");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#efeee4] transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Escrow Contracts & Invoices</span>
                  </button>
                </div>

                <div className="border-t border-[#e4e3d9] my-2 pt-2">
                  <div className="text-[11px] font-bold text-[#82756a] uppercase px-1 mb-1">
                    Brand & Creator Portals
                  </div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#efeee4] transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#50453b]" />
                    <span>Edit Brand Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/dashboard/creator");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#efeee4] transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#d3a373]" />
                      <span>Switch to Creator Studio</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#d3a373] bg-[#1b1c16] px-1.5 py-0.5 rounded-full">
                      Studio
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* --- HORIZONTAL FILTER TABS (Pinterest "All" bar style) --- */}
        <section className="px-4 sm:px-8 pt-4 pb-2 border-b border-[#e4e3d9]/40 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {[
              { id: "all", label: "All Reels" },
              { id: "viral", label: "9:16 Viral TikTok" },
              { id: "commercial", label: "4K Product Commercials" },
              { id: "pipeline", label: "ComfyUI Motion Pipelines" },
              { id: "human", label: "AI Humans & Lip-Sync" },
              { id: "cinematic", label: "Sci-Fi & Cinematic" },
              { id: "saved", label: "⭐ My Moodboards" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedFilter === tab.id
                    ? "bg-[#1b1c16] text-[#fbfaf0] shadow-sm scale-[1.02]"
                    : "bg-[#efeee4] hover:bg-[#e4e3d9] text-[#50453b]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#82756a] font-medium shrink-0">
            <span>{filteredPins.length} curated deliverables</span>
          </div>
        </section>

        {/* --- FILTER BY AI MODEL (Midjourney, Runway, Kling, Flux) & GEMINI QUICK TRIGGER --- */}
        <section className="px-4 sm:px-8 py-2.5 bg-[#fbfaf0] border-b border-[#e4e3d9]/40 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#82756a] shrink-0 flex items-center gap-1.5 mr-1 font-mono">
              <Cpu className="w-3 h-3 text-[#d3a373]" /> Filter by AI Model:
            </span>
            {AI_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedTool === tool
                    ? "bg-[#1b1c16] text-[#d3a373] shadow-sm font-bold"
                    : "bg-white border border-[#e4e3d9] text-[#50453b] hover:bg-[#efeee4]"
                }`}
              >
                {tool === "all" ? "All AI Models" : tool}
              </button>
            ))}
          </div>

          {/* Quick Gemini Match Filter Pill */}
          <button
            onClick={() => {
              const promptToMatch = selectedTool !== "all" 
                ? `Find the highest rated AI director specialized in ${selectedTool} production workflows` 
                : "Match the best verified AI creative directors for commercial production";
              setAiMatchQuery(promptToMatch);
              setIsAiMatchOpen(true);
              handleRunAiMatch(promptToMatch);
            }}
            className="flex items-center gap-1.5 bg-[#efeee4] hover:bg-[#e4e3d9] text-[#1b1c16] px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border border-[#d3a373]/40"
          >
            <Sparkles className="w-3 h-3 text-[#d3a373]" />
            <span>Gemini Match {selectedTool !== "all" ? `(${selectedTool})` : "All"}</span>
          </button>
        </section>

        {/* --- TOAST NOTIFICATION --- */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c16] text-[#fbfaf0] text-xs font-bold py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-[#d3a373]/30 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[#d3a373]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================
            VIEW: ESCROW CONTRACTS & BRIEFS
        ======================================================== */}
        {activeNav === "escrow" ? (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-headline font-black text-[#1b1c16]">
                    Milestone Escrow Vault
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Vault Protected
                  </span>
                </div>
                <p className="text-xs text-[#82756a] font-medium mt-1">
                  100% Client Protected: Creator funds are held in cryptographic milestone escrow and only released when you approve reproducible pipeline deliverables.
                </p>
              </div>
              <button
                onClick={() => setCreateBriefModalOpen(true)}
                className="bg-[#d3a373] text-[#1b1c16] text-xs font-bold py-2.5 px-4 rounded-full flex items-center gap-2 hover:bg-[#c29263] transition-all shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Escrow Brief</span>
              </button>
            </div>

            {/* Financial Aggregate Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-2xl p-4 border border-[#e4e3d9] shadow-xs">
                <div className="flex items-center justify-between text-[#82756a] text-[11px] font-bold uppercase mb-1">
                  <span>Locked In Escrow</span>
                  <DollarSign className="w-3.5 h-3.5 text-[#d3a373]" />
                </div>
                <div className="text-xl font-headline font-black text-[#1b1c16]">
                  $4,250<span className="text-xs text-[#82756a] font-medium">.00</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  2 active milestone briefs
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e4e3d9] shadow-xs">
                <div className="flex items-center justify-between text-[#82756a] text-[11px] font-bold uppercase mb-1">
                  <span>Released to Date</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-headline font-black text-[#1b1c16]">
                  $18,600<span className="text-xs text-[#82756a] font-medium">.00</span>
                </div>
                <div className="text-[10px] text-[#82756a] font-semibold mt-1">
                  8 completed pipelines
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e4e3d9] shadow-xs">
                <div className="flex items-center justify-between text-[#82756a] text-[11px] font-bold uppercase mb-1">
                  <span>Escrow Protection</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xl font-headline font-black text-[#1b1c16]">
                  100%
                </div>
                <div className="text-[10px] text-blue-700 font-semibold mt-1">
                  Seed-verified guarantee
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e4e3d9] shadow-xs">
                <div className="flex items-center justify-between text-[#82756a] text-[11px] font-bold uppercase mb-1">
                  <span>Avg Delivery SLA</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-headline font-black text-[#1b1c16]">
                  &lt;48 Hours
                </div>
                <div className="text-[10px] text-[#82756a] font-semibold mt-1">
                  On-schedule rate 99.2%
                </div>
              </div>
            </div>

            {/* Escrow Briefs Cards with Detailed Milestone Trackers */}
            <div className="space-y-4">
              {briefs.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-[#e4e3d9] shadow-xs space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f0eee4]">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                          b.status === "Active Escrow"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs font-semibold text-[#82756a]">
                          ID: {b.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4f2e9] text-[#50453b]">
                          {b.category}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-lg text-[#1b1c16]">
                        {b.title}
                      </h3>
                      <p className="text-xs text-[#50453b]">
                        Deliverable: <strong className="text-[#1b1c16]">{b.deliverable}</strong> • Due: <strong className="text-[#1b1c16]">{b.deadline}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {b.assignedAvatar && (
                        <div className="flex items-center gap-3 pr-4 border-r border-[#e4e3d9]/70">
                          <img
                            src={b.assignedAvatar}
                            alt={b.assignedDirector}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#d3a373]/40"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#1b1c16]">{b.assignedDirector}</div>
                            <div className="text-[10px] text-[#82756a]">{b.assignedHandle}</div>
                          </div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-[#82756a] uppercase">
                          Locked in Vault
                        </div>
                        <div className="text-xl font-headline font-black text-[#1b1c16]">
                          {b.budget}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Linear Stepper */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#1b1c16] flex items-center justify-between">
                      <span>Milestone Execution Timeline</span>
                      <span className="text-[11px] text-[#82756a] font-normal">
                        Funds release step-by-step upon your verification
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {b.milestones.map((ms, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            ms.status === "completed"
                              ? "bg-emerald-50/60 border-emerald-200"
                              : ms.status === "current"
                              ? "bg-[#fbf8f2] border-[#d3a373] ring-1 ring-[#d3a373]/30"
                              : "bg-[#faf9f5] border-[#e4e3d9]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-[#82756a] uppercase">
                              {ms.phase}
                            </span>
                            {ms.status === "completed" ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approved
                              </span>
                            ) : ms.status === "current" ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 animate-pulse">
                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                In Progress
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[#82756a]">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#1b1c16] leading-snug line-clamp-1">
                            {ms.name}
                          </div>
                          <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                            <span className="text-[#82756a]">Milestone Fee</span>
                            <span className="font-extrabold text-[#1b1c16]">{ms.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => triggerToast(`Opening communication thread with ${b.assignedDirector}`)}
                      className="px-4 py-2 rounded-full border border-[#e4e3d9] text-xs font-bold text-[#1b1c16] hover:bg-[#f5f4ed] transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#82756a]" />
                      <span>Chat Director</span>
                    </button>
                    <button
                      onClick={() => triggerToast(`Reviewing and releasing milestone for ${b.id}`)}
                      className="px-4 py-2 rounded-full bg-[#d3a373] hover:bg-[#c29263] text-xs font-bold text-[#1b1c16] transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Milestone</span>
                    </button>
                    <button
                      onClick={() => triggerToast(`Inspecting deliverable pipeline files for ${b.id}`)}
                      className="bg-[#1b1c16] hover:bg-[#30312b] text-[#fbfaf0] text-xs font-bold py-2 px-4 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Inspect Deliverables</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================
              VIEW: PINTEREST WATERFALL MASONRY FEED CANVAS
          ======================================================== */
          <div className="p-4 sm:p-6 md:p-8 flex-1">
            {filteredPins.length === 0 ? (
              <div className="text-center py-24">
                <Bookmark className="w-12 h-12 text-[#82756a]/40 mx-auto mb-3" />
                <h3 className="font-headline font-bold text-lg text-[#1b1c16]">
                  No Reels Found
                </h3>
                <p className="text-xs text-[#82756a] mt-1">
                  Try adjusting your search keywords or explore all disciplines.
                </p>
              </div>
            ) : (
              /* Pinterest CSS Columns Masonry Grid */
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
                {filteredPins.map((pin) => (
                  <div
                    key={pin.id}
                    onClick={() => setSelectedPin(pin)}
                    className="break-inside-avoid group cursor-pointer"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden border border-[#e4e3d9] hover:border-[#d3a373] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                      {/* Media Container with Dynamic Aspect Ratio */}
                      <div className="relative overflow-hidden bg-[#efeee4]">
                        {/* Aspect Ratio Sizing Wrapper */}
                        <div
                          className={`w-full ${
                            pin.aspectRatio === "9:16"
                              ? "aspect-[9/16]"
                              : pin.aspectRatio === "16:9"
                              ? "aspect-[16/9]"
                              : "aspect-square"
                          } relative`}
                        >
                          <img
                            src={pin.previewImg}
                            alt={pin.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Top Badges Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#fbfaf0] shadow-sm">
                              {pin.categoryLabel}
                            </span>
                            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#1b1c16]/85 text-[#d3a373] backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {pin.aspectRatio === "9:16" ? "9:16 • 15s" : pin.aspectRatio === "16:9" ? "16:9 • 30s" : "1:1 • Loop"}
                            </span>
                          </div>

                          {/* Hover Action Overlay (Pinterest Pin Hover Style) */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5 z-20">
                            <div className="flex justify-end gap-2">
                              {/* Quick Save to Moodboard Button */}
                              <button
                                onClick={(e) => toggleSavePin(pin.id, e)}
                                title={pin.saved ? "Remove from Moodboard" : "Save to Moodboard"}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                  pin.saved
                                    ? "bg-red-500 text-white shadow-md scale-105"
                                    : "bg-white/90 text-[#1b1c16] hover:bg-white"
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    pin.saved ? "fill-current" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Bottom Commission Director Quick Trigger */}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-white/90 drop-shadow">
                                {pin.director.rate}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCommissionDirectorModalOpen(pin);
                                }}
                                className="bg-[#d3a373] hover:bg-[#c29263] text-[#1b1c16] text-xs font-headline font-black py-2 px-3.5 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                              >
                                <span>Commission</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content & Metadata */}
                      <div className="p-4 space-y-2.5">
                        <h4 className="font-headline font-bold text-xs sm:text-sm text-[#1b1c16] leading-snug line-clamp-2">
                          {pin.title}
                        </h4>

                        {/* Director Chip & Rating */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#e4e3d9]/60">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={pin.director.avatar}
                              alt={pin.director.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#d3a373]"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#1b1c16] truncate">
                                {pin.director.name}
                              </div>
                              <div className="text-[10px] text-[#82756a] truncate">
                                {pin.director.handle}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[11px] font-extrabold text-[#7d562d] flex items-center gap-0.5 justify-end">
                              <span>★</span>
                              <span>{pin.director.rating}</span>
                            </div>
                            <div className="text-[9px] font-medium text-[#82756a]">
                              {pin.director.completed} jobs
                            </div>
                          </div>
                        </div>

                        {/* Tools Pill Strip */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {pin.tools.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#f5f4ea] text-[#50453b]"
                            >
                              {t}
                            </span>
                          ))}
                          {pin.tools.length > 2 && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#f5f4ea] text-[#82756a]">
                              +{pin.tools.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL 1: REEL SEED & PIPELINE INSPECTION MODAL
      ======================================================== */}
      {selectedPin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#e4e3d9] shadow-2xl overflow-hidden my-auto animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e4e3d9] flex items-center justify-between bg-[#fbfaf0]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPin.director.avatar}
                  alt={selectedPin.director.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#d3a373]"
                />
                <div>
                  <h3 className="font-headline font-bold text-sm sm:text-base text-[#1b1c16]">
                    {selectedPin.director.name}
                  </h3>
                  <p className="text-xs text-[#82756a]">
                    {selectedPin.director.handle} • {selectedPin.director.rate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSavePin(selectedPin.id)}
                  className={`p-2 rounded-full border transition-colors ${
                    selectedPin.saved
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-[#e4e3d9] text-[#50453b] hover:bg-[#efeee4]"
                  }`}
                  title="Bookmark"
                >
                  <Heart className={`w-4 h-4 ${selectedPin.saved ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-2 rounded-full border border-[#e4e3d9] text-[#82756a] hover:bg-[#efeee4] hover:text-[#1b1c16] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Media Preview Column */}
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-[#1b1c16] border border-[#e4e3d9]">
                  <img
                    src={selectedPin.previewImg}
                    alt={selectedPin.title}
                    className="w-full h-auto object-cover max-h-[380px]"
                  />
                </div>
                <div className="text-xs font-semibold text-[#82756a] flex items-center justify-between px-1">
                  <span>Aspect: {selectedPin.aspectRatio}</span>
                  <span>Category: {selectedPin.categoryLabel}</span>
                </div>
              </div>

              {/* Seed & Workflow Details Column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-headline font-bold text-base text-[#1b1c16]">
                    {selectedPin.title}
                  </h4>
                  <p className="text-xs text-[#50453b] mt-1">
                    Deterministic seed workflow verified with full commercial IP transfer.
                  </p>
                </div>

                {/* Workflow Parameters Box */}
                <div className="p-3.5 rounded-2xl bg-[#f5f4ea] border border-[#e4e3d9] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#e4e3d9]">
                    <span className="text-[#82756a]">Model:</span>
                    <strong className="text-[#1b1c16]">{selectedPin.workflow.model}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e4e3d9]">
                    <span className="text-[#82756a]">Seed Number:</span>
                    <code className="text-[#7d562d] font-mono">{selectedPin.workflow.seed}</code>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e4e3d9]">
                    <span className="text-[#82756a]">CFG Scale / Steps:</span>
                    <span className="text-[#1b1c16]">
                      {selectedPin.workflow.cfgScale} CFG • {selectedPin.workflow.steps} Steps
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#82756a]">Sampler:</span>
                    <span className="text-[#1b1c16]">{selectedPin.workflow.sampler}</span>
                  </div>
                </div>

                {/* Prompt Excerpt */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#82756a]">
                    Verified Positive Prompt
                  </span>
                  <p className="text-xs font-mono bg-[#fbfaf0] p-3 rounded-xl border border-[#e4e3d9] text-[#1b1c16] leading-relaxed">
                    {selectedPin.workflow.positivePrompt}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const target = selectedPin;
                      setSelectedPin(null);
                      setCommissionDirectorModalOpen(target);
                    }}
                    className="w-full bg-[#1b1c16] hover:bg-[#30312b] text-[#fbfaf0] text-xs font-headline font-black py-3 rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#d3a373]" />
                    <span>Commission {selectedPin.director.name} via Escrow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: CREATE CLIENT BRIEF (Pinterest Plus Button)
      ======================================================== */}
      {createBriefModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#e4e3d9] shadow-2xl p-6 sm:p-8 my-auto animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#e4e3d9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1b1c16] text-[#d3a373] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#1b1c16]">
                    Post New Client Production Brief
                  </h3>
                  <p className="text-xs text-[#82756a]">
                    Protected under Milestone Escrow Vault
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateBriefModalOpen(false)}
                className="p-2 rounded-full border border-[#e4e3d9] text-[#82756a] hover:bg-[#efeee4] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBriefSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c16] mb-1.5">
                  Campaign Title / Deliverable Goal
                </label>
                <input
                  type="text"
                  required
                  value={newBriefTitle}
                  onChange={(e) => setNewBriefTitle(e.target.value)}
                  placeholder="e.g. 3x 9:16 Viral TikTok Reels for Cyberpunk Footwear"
                  className="w-full bg-[#fbfaf0] border border-[#e4e3d9] rounded-2xl px-4 py-3 text-sm text-[#1b1c16] focus:outline-none focus:border-[#d3a373]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c16] mb-1.5">
                    Category Format
                  </label>
                  <select
                    value={newBriefCategory}
                    onChange={(e) => setNewBriefCategory(e.target.value)}
                    className="w-full bg-[#fbfaf0] border border-[#e4e3d9] rounded-2xl px-4 py-3 text-sm text-[#1b1c16] focus:outline-none focus:border-[#d3a373]"
                  >
                    <option value="9:16 Viral Video">9:16 Viral TikTok / Reel</option>
                    <option value="4K Product Commercial">4K Product Commercial</option>
                    <option value="ComfyUI Motion Pipeline">ComfyUI Motion Pipeline</option>
                    <option value="AI Human & Lip-Sync">AI Human & Lip-Sync</option>
                    <option value="Cinematic Trailer">Cinematic Sci-Fi Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c16] mb-1.5">
                    Escrow Budget (USD)
                  </label>
                  <input
                    type="text"
                    value={newBriefBudget}
                    onChange={(e) => setNewBriefBudget(e.target.value)}
                    className="w-full bg-[#fbfaf0] border border-[#e4e3d9] rounded-2xl px-4 py-3 text-sm text-[#1b1c16] focus:outline-none focus:border-[#d3a373]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c16] mb-1.5">
                  Assigned Verified AI Director
                </label>
                <select
                  value={newBriefDirector}
                  onChange={(e) => setNewBriefDirector(e.target.value)}
                  className="w-full bg-[#fbfaf0] border border-[#e4e3d9] rounded-2xl px-4 py-3 text-sm text-[#1b1c16] focus:outline-none focus:border-[#d3a373]"
                >
                  <option value="Elena Vance">Elena Vance (@elena_cinema)</option>
                  <option value="Kai Chen">Kai Chen (@kaichen_nodes)</option>
                  <option value="Zara Al-Mansoor">Zara Al-Mansoor (@zara_virtual)</option>
                  <option value="Marcus Sterling">Marcus Sterling (@marcus_visuals)</option>
                  <option value="Aria Thorne">Aria Thorne (@aria_cinematics)</option>
                  <option value="Liam O'Connor">Liam O'Connor (@liam_voicecraft)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c16] mb-1.5">
                  Creative Direction & Visual References
                </label>
                <textarea
                  rows={3}
                  value={newBriefDetails}
                  onChange={(e) => setNewBriefDetails(e.target.value)}
                  placeholder="Outline key visual motifs, lighting style, required seed reproducibility, and desired turnaround..."
                  className="w-full bg-[#fbfaf0] border border-[#e4e3d9] rounded-2xl p-4 text-sm text-[#1b1c16] focus:outline-none focus:border-[#d3a373]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#efeee4] text-xs text-[#50453b] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Funds are securely locked in escrow. Payment is released strictly upon milestone video approval.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateBriefModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#e4e3d9] text-xs font-bold text-[#50453b] hover:bg-[#efeee4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#1b1c16] text-[#fbfaf0] text-xs font-headline font-bold hover:bg-[#30312b] shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#d3a373]" />
                  <span>Lock Escrow & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: DIRECT COMMISSION MODAL
      ======================================================== */}
      {commissionDirectorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#e4e3d9] shadow-2xl p-6 my-auto animate-scale-in">
            <div className="text-center pb-4 border-b border-[#e4e3d9]">
              <img
                src={commissionDirectorModalOpen.director.avatar}
                alt={commissionDirectorModalOpen.director.name}
                className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-[#d3a373] shadow-md mb-2"
              />
              <h3 className="font-headline font-bold text-lg text-[#1b1c16]">
                Commission {commissionDirectorModalOpen.director.name}
              </h3>
              <p className="text-xs text-[#82756a]">
                Deliverable: {commissionDirectorModalOpen.title}
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f5f4ea] border border-[#e4e3d9] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#82756a]">Hourly / Deliverable Rate:</span>
                  <strong className="text-[#1b1c16]">{commissionDirectorModalOpen.director.rate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#82756a]">Estimated Turnaround:</span>
                  <span className="text-[#1b1c16]">48 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#82756a]">Escrow Protection:</span>
                  <span className="text-emerald-700 font-bold">100% Guaranteed</span>
                </div>
              </div>

              <p className="text-[#50453b] leading-relaxed">
                By confirming, a milestone escrow contract is initialized between your client account ({clientUser.name}) and {commissionDirectorModalOpen.director.name}.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCommissionDirectorModalOpen(null)}
                className="flex-1 py-3 rounded-full border border-[#e4e3d9] text-xs font-bold text-[#50453b] hover:bg-[#efeee4]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setCommissionDirectorModalOpen(null);
                  triggerToast(`✨ Escrow contract initiated with ${commissionDirectorModalOpen.director.name}!`);
                }}
                className="flex-1 py-3 rounded-full bg-[#1b1c16] text-[#fbfaf0] text-xs font-headline font-bold hover:bg-[#30312b] shadow-md flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#d3a373]" />
                <span>Initialize Escrow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: GEMINI AI SMART MATCHMAKER MODAL                */}
      {/* ======================================================== */}
      {isAiMatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fbfaf0] w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e4e3d9] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAiMatchOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#efeee4] text-[#82756a] hover:text-[#1b1c16]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d3a373] to-[#b88656] flex items-center justify-center text-[#1b1c16] shadow-sm">
                <Sparkles className="w-4 h-4 text-[#1b1c16]" />
              </div>
              <div>
                <h3 className="font-headline font-black text-xl text-[#1b1c16]">
                  Gemini AI Talent Matchmaker
                </h3>
                <p className="text-[11px] text-[#82756a] font-mono">
                  Powered by Google Gemini 1.5 Flash • Real-time Director Skill Scoring
                </p>
              </div>
            </div>

            <p className="text-xs text-[#50453b] mt-2 mb-4 leading-relaxed">
              Describe your commercial concept or deliverables. Gemini will analyze all verified AI creators in our database to recommend the perfect director.
            </p>

            {/* Presets */}
            <div className="mb-4">
              <div className="text-[10px] font-bold text-[#82756a] uppercase mb-1.5 font-mono">
                Quick Campaign Presets:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "30s Luxury Beverage Commercial with Runway Gen-3 fluid dynamics",
                  "Viral 9:16 TikTok UGC Fashion lookbook with Kling 1.5",
                  "Photorealistic Architectural Villa drone tour with Luma Ray",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAiMatchQuery(preset);
                      handleRunAiMatch(preset);
                    }}
                    className="text-[11px] bg-white border border-[#e4e3d9] hover:border-[#d3a373] text-[#50453b] hover:text-[#1b1c16] px-2.5 py-1 rounded-full text-left transition-all"
                  >
                    💡 {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Input */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1c16]">
                Your Creative Direction & Requirements:
              </label>
              <textarea
                value={aiMatchQuery}
                onChange={(e) => setAiMatchQuery(e.target.value)}
                placeholder="e.g. Need high-speed slow motion liquid splashing with Midjourney v6 photorealistic lighting and Runway Gen-3 motion control for energy drink brand..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-[#e4e3d9] bg-white text-xs focus:ring-2 focus:ring-[#d3a373] outline-none text-[#1b1c16]"
              />
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={aiMatchLoading || !aiMatchQuery.trim()}
              onClick={() => handleRunAiMatch()}
              className="w-full py-3 rounded-full bg-[#1b1c16] hover:bg-[#30312b] disabled:opacity-50 text-[#fbfaf0] text-xs font-headline font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {aiMatchLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#d3a373]" />
                  <span>Gemini Analyzing Skill Graphs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#d3a373]" />
                  <span>Run Gemini AI Match Engine</span>
                </>
              )}
            </button>

            {/* Match Results Display */}
            {aiMatchResult && (
              <div className="mt-5 p-4 rounded-2xl bg-white border border-[#d3a373]/50 shadow-sm animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-[#e4e3d9] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#1b1c16]">
                      Gemini Analysis Complete
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#d3a373]/20 text-[#7d562d] px-2.5 py-0.5 rounded-full">
                    {aiMatchResult.matchScore || "98%"} Match
                  </span>
                </div>

                <div className="text-xs text-[#50453b] leading-relaxed">
                  <span className="font-bold text-[#1b1c16]">AI Reasoning: </span>
                  {aiMatchResult.reasoning ||
                    "Creator Marcus Sterling has verified high scores in Runway Gen-3 camera control, physics continuity, and high-speed beverage VFX pipeline."}
                </div>

                {/* Top Matched Director Card */}
                <div className="p-3 rounded-xl bg-[#fbfaf0] border border-[#e4e3d9] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1b1c16] text-[#d3a373] flex items-center justify-center font-bold text-sm">
                      MS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1b1c16] flex items-center gap-1.5">
                        <span>Marcus Sterling</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                          Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-[#82756a]">
                        Specialist: Runway Gen-3 & Macro Physics
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAiMatchOpen(false);
                      setNewBriefDirector("Marcus Sterling");
                      setNewBriefDetails(aiMatchQuery);
                      setCreateBriefModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#1b1c16] text-[#fbfaf0] text-[11px] font-bold hover:bg-[#30312b] transition-all flex items-center gap-1"
                  >
                    <span>Hire Director</span>
                    <ArrowRight className="w-3 h-3 text-[#d3a373]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: CAMPAIGN TEMPLATES GALLERY MODAL                */}
      {/* ======================================================== */}
      {isTemplatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fbfaf0] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e4e3d9] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsTemplatesOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#efeee4] text-[#82756a] hover:text-[#1b1c16]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#1b1c16] flex items-center justify-center text-[#d3a373] shadow-sm">
                <Layers className="w-4 h-4 text-[#d3a373]" />
              </div>
              <div>
                <h3 className="font-headline font-black text-xl text-[#1b1c16]">
                  Production Brief Templates
                </h3>
                <p className="text-[11px] text-[#82756a]">
                  Launch enterprise AI campaigns in 5 seconds with pre-engineered prompt workflows
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              {CAMPAIGN_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-2xl bg-white border border-[#e4e3d9] hover:border-[#d3a373] transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tpl.icon}</span>
                      <span className="text-[11px] font-mono font-bold text-[#7d562d] bg-[#d3a373]/20 px-2 py-0.5 rounded-full">
                        {tpl.budget}
                      </span>
                    </div>

                    <h4 className="font-headline font-bold text-sm text-[#1b1c16] mb-1">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-[#82756a] leading-relaxed line-clamp-2 mb-3">
                      {tpl.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {tpl.tools.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-[#efeee4] text-[#50453b] px-1.5 py-0.5 rounded-full font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e4e3d9] flex items-center justify-between">
                    <span className="text-[10px] text-[#82756a]">
                      Est: {tpl.estimatedTurnaround}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(tpl)}
                      className="text-xs font-bold bg-[#1b1c16] text-[#fbfaf0] hover:bg-[#30312b] px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3 h-3 text-[#d3a373]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: EDIT CLIENT PROFILE MODAL                       */}
      {/* ======================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fbfaf0] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#e4e3d9] relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#efeee4] text-[#82756a] hover:text-[#1b1c16]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-headline font-black text-xl text-[#1b1c16] mb-1">
              Edit Brand Profile
            </h3>
            <p className="text-xs text-[#82756a] mb-5">
              Update your enterprise identity, billing email, and preferred AI models
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsProfileModalOpen(false);
                triggerToast("Brand profile updated successfully!");
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1c16] block mb-1">
                  Brand / Studio Name
                </label>
                <input
                  type="text"
                  value={editProfileCompany}
                  onChange={(e) => setEditProfileCompany(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e4e3d9] bg-white text-xs outline-none focus:ring-2 focus:ring-[#d3a373] text-[#1b1c16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1c16] block mb-1">
                  Lead Director / Contact
                </label>
                <input
                  type="text"
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e4e3d9] bg-white text-xs outline-none focus:ring-2 focus:ring-[#d3a373] text-[#1b1c16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1c16] block mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editProfileEmail}
                  onChange={(e) => setEditProfileEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e4e3d9] bg-white text-xs outline-none focus:ring-2 focus:ring-[#d3a373] text-[#1b1c16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1b1c16] block mb-1">
                  Primary Industry
                </label>
                <input
                  type="text"
                  value={editProfileIndustry}
                  onChange={(e) => setEditProfileIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e4e3d9] bg-white text-xs outline-none focus:ring-2 focus:ring-[#d3a373] text-[#1b1c16]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#e4e3d9] text-xs font-bold text-[#50453b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#1b1c16] text-[#fbfaf0] text-xs font-bold hover:bg-[#30312b]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
