"use client";

import React from "react";

/**
 * AnimatedLogo Component
 * Direct implementation from GenWorks_Animated_Logo.zip:
 * - Vertical layout with centered spinning 2x2 cube grid and wordmark below
 * - Grid: w-16 h-16 with gap-1.5, animate-spin-slow (8s)
 * - 4 Cubes: 3 dark (#1A1A1A), 1 accent caramel (#D3A373) with pulse-sequence (1.5s)
 * - Wordmark: text-4xl "GenWorks" (ExtraBold + Medium)
 */
export function AnimatedLogo() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none">
      {/* Grid Icon Container - Spins Slowly */}
      <div className="grid grid-cols-2 gap-1.5 w-16 h-16 animate-spin-slow">
        <div 
          className="bg-[#1A1A1A] rounded-md animate-pulse-sequence" 
          style={{ animationDelay: "0s" }}
        />
        <div 
          className="bg-[#1A1A1A] rounded-md animate-pulse-sequence" 
          style={{ animationDelay: "0.2s" }}
        />
        <div 
          className="bg-[#1A1A1A] rounded-md animate-pulse-sequence" 
          style={{ animationDelay: "0.6s" }}
        />
        <div 
          className="bg-[#D3A373] rounded-md animate-pulse-sequence shadow-sm" 
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      
      {/* Wordmark */}
      <div className="text-4xl tracking-tight text-[#1A1A1A] leading-none">
        <strong className="font-extrabold font-sans">Gen</strong>
        <span className="font-medium font-sans">Works</span>
      </div>
    </div>
  );
}

interface GenWorksLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  animated?: boolean;
  inverted?: boolean;
}

/**
 * GenWorks Horizontal Navbar & Footer Logo Component (Matches image_48eb78.png)
 */
export function GenWorksLogo({
  size = "md",
  className = "",
  showText = true,
  animated = false,
  inverted = false,
}: GenWorksLogoProps) {
  const iconConfig = {
    sm: {
      container: "w-6 h-6 gap-[2.5px]",
      tileRadius: "rounded-[2px]",
    },
    md: {
      container: "w-8 h-8 gap-[3.5px]",
      tileRadius: "rounded-[3px]",
    },
    lg: {
      container: "w-11 h-11 gap-[4.5px]",
      tileRadius: "rounded-[4.5px]",
    },
    xl: {
      container: "w-14 h-14 gap-[6px]",
      tileRadius: "rounded-[6px]",
    },
  };

  const textSizes = {
    sm: "text-[20px]",
    md: "text-[24px]",
    lg: "text-[34px]",
    xl: "text-[50px]",
  };

  const config = iconConfig[size];
  const darkTileColor = inverted ? "bg-white" : "bg-[#1A1A1A]";
  const accentTileColor = "bg-[#D3A373]";
  const textColor = inverted ? "text-white" : "text-[#1A1A1A]";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 2x2 Modular Cube Grid Icon */}
      <div
        className={`grid grid-cols-2 ${config.container} shrink-0 ${
          animated ? "animate-spin-slow" : ""
        }`}
      >
        <div
          className={`${darkTileColor} ${config.tileRadius} aspect-square ${
            animated ? "animate-pulse-sequence" : ""
          }`}
          style={{ animationDelay: "0s" }}
        />
        <div
          className={`${darkTileColor} ${config.tileRadius} aspect-square ${
            animated ? "animate-pulse-sequence" : ""
          }`}
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className={`${darkTileColor} ${config.tileRadius} aspect-square ${
            animated ? "animate-pulse-sequence" : ""
          }`}
          style={{ animationDelay: "0.6s" }}
        />
        <div
          className={`${accentTileColor} ${config.tileRadius} aspect-square shadow-sm ${
            animated ? "animate-pulse-sequence" : ""
          }`}
          style={{ animationDelay: "0.4s" }}
        />
      </div>

      {/* Wordmark: Gen (ExtraBold) + Works (Medium) */}
      {showText && (
        <div className={`${textSizes[size]} tracking-tight ${textColor} leading-none font-headline`}>
          <strong className="font-extrabold tracking-tight">Gen</strong>
          <span className="font-medium tracking-tight">Works</span>
        </div>
      )}
    </div>
  );
}

/**
 * GenWorks Full-Screen Splash Screen
 * Automatically displays on first load and smoothly fades out after 1.8 seconds
 */
export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [visible, setVisible] = React.useState(true);
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    // Hold splash for 1.8 seconds, then initiate smooth fade out
    const timer = setTimeout(() => {
      setFading(true);
      const closeTimer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 600);
      return () => clearTimeout(closeTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#fbfaf0] flex flex-col items-center justify-center transition-opacity duration-600 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        {/* Exact Animated Logo from GenWorks_Animated_Logo.zip */}
        <AnimatedLogo />

        {/* Minimalist Progress Indicator */}
        <div className="w-40 h-1 bg-[#efeee4] rounded-full overflow-hidden mt-6">
          <div className="w-full h-full bg-[#d3a373] rounded-full origin-left animate-pulse" />
        </div>

        <p className="font-mono text-[11px] tracking-widest uppercase text-[#50453b] mt-3 font-semibold">
          CURATED AI CREATIVE STUDIO
        </p>
      </div>
    </div>
  );
}
