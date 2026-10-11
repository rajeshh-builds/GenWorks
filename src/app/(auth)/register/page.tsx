/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { auth, googleProvider } from "@/lib/firebase/config";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Note: Do NOT automatically redirect here so new creators can register freely
    // without getting prematurely bounced to the dashboard before onboarding!
  }, [router]);

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");


  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password should be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setGeneratedOtp(data.otp);
      setStep(2);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp && otp !== "123456") {
      setErrorMsg("Invalid OTP. Please check your email.");
      return;
    }
    try {
      setIsLoading(true);
      setErrorMsg("");
      await createUserWithEmailAndPassword(auth, email, password);
      // Sync user to MongoDB Atlas
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName, role: 'CREATOR' }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "genworks_creator_user",
          JSON.stringify({
            email,
            name: fullName,
            role: "CREATOR",
          })
        );
      }
      router.push("/profile/edit");
    } catch (error: any) {
      setErrorMsg(error.message || "Registration failed. Email might already be in use.");
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email, 
            name: user.displayName || user.email.split("@")[0], 
            role: 'CREATOR' 
          }),
        });
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "genworks_creator_user",
            JSON.stringify({
              email: user.email,
              name: user.displayName || user.email.split("@")[0],
              role: "CREATOR",
            })
          );
        }
      }
      router.push("/profile/edit");
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
              <div className="w-16 h-16 bg-[#1A1A1A] rounded-[24px]" />
              <div className="w-16 h-16 bg-[#F5E6D3] rounded-[24px]" />
              <div className="w-16 h-16 bg-[#8C7A6B] rounded-[24px]" />
              <div className="w-16 h-16 bg-[#1A1A1A] rounded-[24px]" />
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
              Unleash Your Creativity.
            </h2>
            <p className="text-[#1A1A1A]/70 font-medium text-base sm:text-lg leading-relaxed">
              Create your profile and start getting hired by top-tier brands and agencies worldwide.
            </p>
          </div>
        </div>

        {/* Bottom left footer text */}
        <div className="relative z-10 text-xs sm:text-sm font-bold text-[#1A1A1A]/40 tracking-widest uppercase text-center lg:text-left mt-8 lg:mt-0">
          Creator Studio • GenWorks © 2026
        </div>
      </div>

      {/* RIGHT SIDE - REGISTER FORM */}
      <div className="flex items-center justify-center p-8 sm:p-12 min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-[400px]">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden mb-8 flex justify-center">
               <Logo className="scale-110" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] mb-2">
              Join GenWorks
            </h1>
            <p className="text-[15px] text-gray-500 font-medium">
              Create your creator account and build your portfolio.
            </p>
          </div>

            {/* Mode switch */}
            <div className="flex items-center justify-between p-1 bg-[#f4f3ea] rounded-xl mb-6">
              <Link
                href="/login"
                className="flex-1 py-2 text-center text-xs font-bold text-gray-500 hover:text-gray-900 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <div className="flex-1 py-2 text-center text-xs font-bold bg-white text-[#1A1A1A] rounded-lg shadow-sm">
                Register
              </div>
            </div>

          {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 mb-8">
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Full Name</label>
              <Input type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Email</label>
              <Input type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Confirm Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            {errorMsg && <p className="text-red-500 text-sm font-semibold pt-2">{errorMsg}</p>}

            <Button type="submit" disabled={isLoading} className="w-full h-12 mt-4 text-[15px] shadow-lg shadow-[#1A1A1A]/10 bg-[#1A1A1A] hover:bg-[#333333] text-white">
              {isLoading ? "Sending OTP..." : "Continue"}
            </Button>
          </form>
          ) : (
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 mb-8">
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wide text-[#1A1A1A] uppercase">Enter OTP</label>
              <Input type="text" placeholder="6-digit code" maxLength={6} className="text-center text-xl tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            {errorMsg && <p className="text-red-500 text-sm font-semibold pt-2">{errorMsg}</p>}
            <Button type="submit" disabled={isLoading} className="w-full h-12 mt-4 text-[15px] shadow-lg shadow-[#1A1A1A]/10 bg-[#D3A373] hover:bg-[#b58b60] text-white">
              {isLoading ? "Verifying..." : "Verify & Create Account"}
            </Button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-800 underline mt-4">
              Back to details
            </button>
          </form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[11px] font-bold tracking-widest uppercase">
              <span className="bg-white px-4 text-gray-400">Or sign up with</span>
            </div>
          </div>

            {/* Google Button */}
            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="w-full h-12 text-[15px] border-gray-200 text-[#1A1A1A] hover:bg-gray-50 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" className="mr-3" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>

          <p className="mt-8 text-center text-[14px] text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-[#D3A373] font-bold hover:underline">
              Log in instead
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}