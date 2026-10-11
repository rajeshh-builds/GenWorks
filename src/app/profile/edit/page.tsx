"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { User, Lightbulb, Trophy } from "lucide-react";

const AI_TOOLS = ["Midjourney", "Runway Gen-2", "ChatGPT", "ElevenLabs", "Sora", "Kling", "Stable Diffusion", "Luma AI", "Pika Labs"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    tagline: "",
    bio: "",
    experience: "",
    tools: [] as string[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool) 
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.displayName.trim() || !formData.tagline.trim() || !formData.bio.trim()) {
        setErrorMsg("Please fill in all identity fields to proceed.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.experience) {
        setErrorMsg("Please select your experience level.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (formData.tools.length === 0) {
        setErrorMsg("Please select at least one AI tool.");
        return;
      }
      handleSave();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let userEmail = "";
      if (typeof window !== "undefined") {
        try {
          const prev = localStorage.getItem("genworks_creator_user");
          const parsed = prev ? JSON.parse(prev) : {};
          userEmail = parsed.email || "";
          localStorage.setItem(
            "genworks_creator_user",
            JSON.stringify({
              ...parsed,
              name: formData.displayName,
              tagline: formData.tagline,
              bio: formData.bio,
              tools: formData.tools,
            })
          );
        } catch (e) {
          console.error("Storage error:", e);
        }
      }

      await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          displayName: formData.displayName,
          tagline: formData.tagline,
          bio: formData.bio,
          tools: formData.tools,
        }),
      });

      setIsSaving(false);
      router.push("/profile/portfolio");
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      router.push("/profile/portfolio");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* Header with Progress Bar */}
      <div className="w-full max-w-4xl mx-auto px-6 pt-10">
        <div className="flex flex-col mb-12">
          <span className="text-sm font-semibold text-[#1A1A1A] mb-2">{step}/3</span>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden flex">
            <div className="h-full bg-[#1A1A1A] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 flex flex-col relative">
        {errorMsg && (
          <div className="absolute top-0 left-6 right-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
          <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
              A few quick questions: first, what is your professional identity?
            </h1>
            <p className="text-[17px] text-gray-600 mb-10 leading-relaxed">
              This lets brands know who you are and what you do. We&apos;ll use this to set up your public GenWorks portfolio.
            </p>

            <div className="space-y-6">
              <div>
                <Input 
                  placeholder="Display Name (e.g. Sarah AI Studio)" 
                  className="h-14 text-lg border-gray-300 rounded-xl px-5 focus-visible:ring-[#D3A373] focus-visible:border-[#D3A373]" 
                  value={formData.displayName} 
                  onChange={e => setFormData({...formData, displayName: e.target.value})} 
                />
              </div>
              
              <div>
                <Input 
                  placeholder="Professional Tagline (e.g. Cinematic AI Video Director)" 
                  className="h-14 text-lg border-gray-300 rounded-xl px-5 focus-visible:ring-[#D3A373] focus-visible:border-[#D3A373]" 
                  value={formData.tagline} 
                  onChange={e => setFormData({...formData, tagline: e.target.value})} 
                />
              </div>

              <div>
                <textarea 
                  className="w-full rounded-xl border border-gray-300 p-5 text-lg focus:outline-none focus:ring-2 focus:ring-[#D3A373] focus:border-transparent min-h-[140px] resize-none"
                  placeholder="Short Bio: Tell brands about your creative process..."
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full mt-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4 text-center">
              Got it. What&apos;s your AI experience level?
            </h1>
            <p className="text-[17px] text-gray-600 mb-12 leading-relaxed text-center max-w-2xl mx-auto">
              Different creators come to GenWorks for various reasons. We want to highlight opportunities that fit your expertise best.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { level: "Beginner", desc: "I am brand new to this", icon: User },
                { level: "Intermediate", desc: "I have some experience", icon: Lightbulb },
                { level: "Expert", desc: "I am an expert", icon: Trophy }
              ].map((item) => (
                <div 
                  key={item.level}
                  onClick={() => setFormData({...formData, experience: item.level})}
                  className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] text-center
                    ${formData.experience === item.level 
                      ? 'border-[#D3A373] bg-[#FEF9E1] shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${formData.experience === item.level ? 'border-[#D3A373]' : 'border-gray-300'}`}>
                      {formData.experience === item.level && <div className="w-3 h-3 rounded-full bg-[#D3A373]" />}
                    </div>
                  </div>
                  
                  <div className={`w-20 h-20 rounded-full mb-6 flex items-center justify-center
                    ${formData.experience === item.level ? 'bg-white shadow-sm text-[#D3A373]' : 'bg-gray-50 text-gray-500'}`}>
                    <item.icon size={36} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-[17px] font-semibold text-[#1A1A1A] mb-2">{item.desc}</h3>
                  <p className="text-sm text-gray-500">{item.level} Level</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full mt-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4 text-center">
              Almost done! Which AI tools do you master?
            </h1>
            <p className="text-[17px] text-gray-600 mb-12 leading-relaxed text-center max-w-2xl mx-auto">
              Select all the AI platforms you actively use for generating content. This helps match you with the right briefs.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {AI_TOOLS.map(tool => {
                const isSelected = formData.tools.includes(tool);
                return (
                  <div 
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-center h-24
                      ${isSelected 
                        ? 'border-[#D3A373] bg-[#FEF9E1] text-[#1A1A1A] font-semibold' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSelected ? 'border-[#D3A373]' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#D3A373]" />}
                      </div>
                    </div>
                    <span className="text-[16px]">{tool}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="w-full border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Button 
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="rounded-full px-8 h-12 text-[16px] font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back
          </Button>

          <div className="flex items-center space-x-6">
            <button className="text-[16px] font-medium text-gray-600 hover:text-[#1A1A1A] transition-colors">
              Skip for now
            </button>
            <Button 
              onClick={handleNext} 
              disabled={isSaving}
              className="rounded-full px-10 h-12 text-[16px] font-medium bg-[#1A1A1A] hover:bg-[#333333] text-white"
            >
              {isSaving ? "Saving..." : "Next"}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}