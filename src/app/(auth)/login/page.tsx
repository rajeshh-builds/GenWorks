"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { auth, googleProvider } from "@/lib/firebase/config";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-redirect removed to enforce strict real-time MongoDB authentication validation
  // useEffect(() => { ... })


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }
    try {
      setIsLoading(true);
      setErrorMsg("");

      // Authenticate with Firebase & MongoDB
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user in MongoDB / Prisma
      const checkRes = await fetch(`/api/creator/profile?email=${encodeURIComponent(user.email || email)}`);
      const checkData = await checkRes.json();

      if (checkData.success && checkData.profile) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "genworks_creator_user",
            JSON.stringify({
              email: user.email || email,
              name: checkData.profile.user?.name || "AI Creator",
              id: checkData.profile.id,
              userId: checkData.profile.userId,
              role: checkData.profile.isVerified ? "AI Creator • Elite Gold Verified" : "AI Content Creator",
            })
          );
        }
        router.push("/dashboard/creator");
      } else {
        // Not yet in MongoDB -> sync account and direct to profile setup
        try {
          await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email || email, name: (user.email || email).split("@")[0], role: 'CREATOR' }),
          });
        } catch (e) {
          console.error("Auto sync on login failed:", e);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "genworks_creator_user",
            JSON.stringify({
              email: user.email || email,
              name: (user.email || email).split("@")[0],
              role: "CREATOR",
            })
          );
        }
        router.push("/profile/edit");
      }
    } catch (error: any) {
      console.error("Error signing in with Email:", error);
      setErrorMsg(error?.message?.includes("invalid-credential") 
        ? "Invalid email or password. Please check your credentials." 
        : error?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user?.email) {
        throw new Error("Unable to retrieve email from Google.");
      }

      // Check DB if creator is already registered in MongoDB / Prisma
      const checkRes = await fetch(`/api/creator/profile?email=${encodeURIComponent(user.email)}`);
      const checkData = await checkRes.json();

      if (checkData.success && checkData.profile) {
        // Registered creator -> Allow entry into Studio Dashboard
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "genworks_creator_user",
            JSON.stringify({
              email: user.email,
              name: user.displayName || checkData.profile.user?.name || "AI Creator",
              id: checkData.profile.id,
              userId: checkData.profile.userId,
              role: checkData.profile.isVerified ? "AI Creator • Elite Gold Verified" : "AI Content Creator",
            })
          );
        }
        router.push("/dashboard/creator");
      } else {
        // NOT registered -> Must complete registration & onboarding first!
        setErrorMsg("Account not found. Please complete creator registration & onboarding first.");
        setTimeout(() => {
          router.push(`/register?email=${encodeURIComponent(user.email || "")}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setErrorMsg(error?.message || "Google sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col-reverse lg:grid lg:grid-cols-2 bg-white">
      
      {/* LEFT SIDE - CREATOR SHOWCASE & ANIMATION (MNC Level) */}
      <div className="relative flex flex-col justify-between bg-[#FEF9E1] overflow-hidden p-8 sm:p-12 lg:border-r border-[#E5E0C8] min-h-[50vh] lg:min-h-screen">
        
        {/* Subtle background gradient/glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-[#D3A373]/10 pointer-events-none" />
        
        {/* Top left logo */}
        <div className="relative z-10 hidden lg:block">
          <Logo className="scale-110 origin-left" />
        </div>

        {/* Center Animation: The Spinning GenWorks MNC Logo */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-16 my-auto py-12 lg:py-0">
          
          {/* Animated Component Wrapper */}
          <div className="relative flex items-center justify-center">
            
            {/* Inner Grid Blocks */}
            <div className="grid grid-cols-2 gap-[10px] animate-[scatterRotate_8s_ease-in-out_infinite]">
              <div 
                className="w-16 h-16 bg-[#1A1A1A] rounded-[24px]" 
              />
              <div 
                className="w-16 h-16 bg-[#F5E6D3] rounded-[24px]" 
              />
              <div 
                className="w-16 h-16 bg-[#8C7A6B] rounded-[24px]" 
              />
              <div 
                className="w-16 h-16 bg-[#1A1A1A] rounded-[24px]" 
              />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scatterRotate {
                0% {
                  transform: rotate(0deg) scale(1) translateY(0);
                  gap: 10px;
                  border-radius: 24px;
                }
                25% {
                  transform: rotate(90deg) scale(0.9) translateY(-20px);
                  gap: 40px;
                  border-radius: 32px;
                }
                50% {
                  transform: rotate(180deg) scale(1.1) translateY(10px);
                  gap: 60px;
                  border-radius: 40px;
                }
                75% {
                  transform: rotate(270deg) scale(0.9) translateY(-10px);
                  gap: 30px;
                  border-radius: 32px;
                }
                100% {
                  transform: rotate(360deg) scale(1) translateY(0);
                  gap: 10px;
                  border-radius: 24px;
                }
              }
            `}} />
          </div>
          
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight mb-4">
              Forge Your AI Masterpieces.
            </h2>
            <p className="text-[#1A1A1A]/70 font-medium text-base sm:text-lg leading-relaxed">
              Join the elite marketplace where world-class brands discover visionary AI creators.
            </p>
          </div>
        </div>

        {/* Bottom left footer text */}
        <div className="relative z-10 text-xs sm:text-sm font-bold text-[#1A1A1A]/40 tracking-widest uppercase text-center lg:text-left mt-8 lg:mt-0">
          Creator Studio • GenWorks © 2026
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex items-center justify-center p-8 sm:p-12 min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-[400px]">
          
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden mb-8 flex justify-center">
               <Logo className="scale-110" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] mb-2">
              Welcome Back
            </h1>
            <p className="text-[15px] text-gray-500 font-medium">
              Log in to your GenWorks creator account.
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5 mb-8">
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Work Email</label>
              <Input 
                type="email" 
                placeholder="name@genworks.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Password</label>
              <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="h-12 bg-white border-gray-200 text-[#1A1A1A] rounded-xl px-4 text-[15px] focus-visible:ring-1 focus-visible:ring-[#1A1A1A] pr-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-semibold">{errorMsg}</p>
            )}

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-[15px] shadow-lg shadow-[#D3A373]/20 bg-[#D3A373] hover:bg-[#c29362] text-white font-bold rounded-xl"
            >
              {isLoading ? "Signing In..." : "Sign In to Studio"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[14px] text-gray-500 font-medium">
            New to GenWorks?{" "}
            <Link href="/register" className="text-[#D3A373] font-bold hover:underline">
              Sign up here.
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}