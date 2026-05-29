"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VibrantCard } from "@/components/vibrant-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function TitlePage() {
  const router = useRouter();
  const { resetGame, isVolumeOn, setVolumeOn } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("cto_sim_decision_count");
      setHasSave(!!(savedCount && Number(savedCount) > 0));
    }
  }, []);

  const handleStartGame = () => {
    resetGame();
    localStorage.setItem("cto_sim_specialty", "architect"); // Default specialty
    router.push("/setup");
  };

  const handleResume = () => {
    router.push("/game");
  };

  return (
    <main className="bg-[--canvas] font-sans min-h-screen text-[--ink] flex flex-col relative select-none">
      
      {/* PROMO BANNER */}
      <div className="bg-[--primary] text-[--on-primary] py-3 text-center text-sm font-medium tracking-wide w-full">
        CTO Simulator — Can you survive one quarter as Chief Technology Officer? →
      </div>

      {/* TOP NAV */}
      <header className="sticky top-0 z-40 h-16 bg-[--canvas]/90 backdrop-blur-md border-b border-[--hairline-soft] w-full">
        <div className="max-w-[1280px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="text-[--ink] text-sm font-semibold cursor-pointer" onClick={() => router.push("/")}>
            CTO Simulator
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowHowToPlay(true)}>How to Play</Button>
            {hasSave ? (
              <Button variant="default" onClick={handleResume}>Resume Career →</Button>
            ) : (
              <Button variant="default" onClick={handleStartGame}>Start Game →</Button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-[96px] pb-[80px] text-center max-w-[1280px] mx-auto px-8 flex flex-col items-center">
        <Badge variant="brand" className="mb-6 bg-[--blue-200] text-[--blue-700] font-semibold border-0">
          Season 1 · 2026
        </Badge>
        
        <h1 className="text-[32px] sm:text-[40px] md:text-[56px] lg:text-[80px] font-semibold leading-[1.10] tracking-[-2px] text-[--ink-strong] select-text">
          Run the tech stack.
        </h1>
        <h1 className="text-[32px] sm:text-[40px] md:text-[56px] lg:text-[80px] font-semibold leading-[1.10] tracking-[-2px] text-[--coral] select-text mt-1">
          Don't run it into the ground.
        </h1>
        
        <p className="mt-6 text-[18px] font-medium text-[--slate] leading-[1.5] max-w-[560px] mx-auto select-text">
          Step into the hot seat as CTO. Every decision shapes your company's fate. One quarter. Infinite ways to get fired.
        </p>

        <div className="mt-10 flex gap-3 justify-center">
          <Button variant="default" className="px-8 py-3 text-base h-auto" onClick={handleStartGame}>
            Start Your Company →
          </Button>
          <Button variant="secondary" className="px-8 py-3 text-base h-auto" onClick={() => setShowHowToPlay(true)}>
            See How It Works
          </Button>
        </div>
      </section>

      {/* SCENARIO PREVIEW CARDS */}
      <section className="max-w-[1280px] mx-auto px-8 w-full mt-10">
        <div className="text-xs font-semibold text-[--steel] uppercase tracking-widest mb-8 text-center">
          What you'll face as CTO
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1 - Coral */}
          <VibrantCard color="coral">
            <Badge className="bg-white/20 text-white border-0 mb-3 w-fit">CRISIS</Badge>
            <p className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-white">
              Budget<br/>Freeze.
            </p>
            <p className="text-sm text-white/70 mt-3 font-sans">
              Finance just cut your Q4 headcount by 30%.
            </p>
          </VibrantCard>

          {/* Card 2 - Blue */}
          <VibrantCard color="blue">
            <Badge className="bg-white/20 text-white border-0 mb-3 w-fit">TECHNICAL</Badge>
            <p className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-white">
              2AM<br/>Outage.
            </p>
            <p className="text-sm text-white/70 mt-3 font-sans">
              P0 down. Your on-call is overwhelmed.
            </p>
          </VibrantCard>

          {/* Card 3 - Magenta */}
          <VibrantCard color="magenta">
            <Badge className="bg-white/20 text-white border-0 mb-3 w-fit">TALENT</Badge>
            <p className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-white">
              Mass<br/>Exodus.
            </p>
            <p className="text-sm text-white/70 mt-3 font-sans">
              3 senior engineers quit over Slack.
            </p>
          </VibrantCard>

          {/* Card 4 - Purple */}
          <VibrantCard color="purple">
            <Badge className="bg-white/20 text-white border-0 mb-3 w-fit">POLITICAL</Badge>
            <p className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-white">
              Board<br/>Audit.
            </p>
            <p className="text-sm text-white/70 mt-3 font-sans">
              They're questioning your entire roadmap.
            </p>
          </VibrantCard>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-t border-b border-[--hairline] py-12 mt-[80px] w-full">
        <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0">
          <div className="text-center md:border-r md:border-[--hairline]">
            <div className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-[--ink]">12</div>
            <div className="text-sm text-[--steel] mt-1">Weeks Per Game</div>
          </div>
          <div className="text-center md:border-r md:border-[--hairline]">
            <div className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-[--ink]">8</div>
            <div className="text-sm text-[--steel] mt-1">Live Metrics</div>
          </div>
          <div className="text-center md:border-r md:border-[--hairline]">
            <div className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-[--ink]">20+</div>
            <div className="text-sm text-[--steel] mt-1">Industries</div>
          </div>
          <div className="text-center">
            <div className="text-[40px] font-semibold leading-[1.2] tracking-[-1px] text-[--ink]">∞</div>
            <div className="text-sm text-[--steel] mt-1">Unique Scenarios</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[--footer-bg] text-white mt-[80px] w-full">
        <div className="max-w-[1280px] mx-auto py-[64px] px-[32px]">
          <div className="flex justify-between items-start flex-col sm:flex-row gap-6">
            <div>
              <div className="font-semibold text-lg">CTO Simulator</div>
              <p className="text-sm text-[--muted] mt-1">Can you lead the org?</p>
            </div>
            <div className="flex gap-6 text-sm text-[--muted]">
              <a href="#" className="hover:underline" onClick={(e) => { e.preventDefault(); setShowHowToPlay(true); }}>About</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
              <a href="#" className="hover:underline" onClick={(e) => e.preventDefault()}>Privacy</a>
            </div>
          </div>
          
          <div className="border-t border-white/10 my-8" />
          
          <div className="text-xs text-[--muted] text-center">
            Built with Claude AI · © 2026 CTO Simulator
          </div>
        </div>
      </footer>

      {/* HOW TO PLAY DIALOG */}
      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent className="max-w-lg rounded-[32px] p-8 bg-[--canvas]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-[--ink]">How to Play</DialogTitle>
            <DialogDescription className="text-sm text-[--slate] mt-1">
              Survive 12 consecutive weeks as Chief Technology Officer without getting fired.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto pr-1 text-sm text-[--charcoal] space-y-4">
            <p>
              <strong>1. Balance your Metrics:</strong> You have 8 key metrics that shift based on your decisions: Budget, Morale, Tech Debt, Velocity, CEO Trust, Customer Satisfaction, Security Posture, and Talent Pipeline.
            </p>
            <p>
              <strong>2. Handle Weekly Decisions:</strong> Each week, an incident requires your intervention. Choose the best strategic order to safeguard the stack, satisfy the business pressures of the CEO, or placate developer frustration.
            </p>
            <p>
              <strong>3. Custom Solutions:</strong> If the default options don't suit you, draft your own custom action. The server-side evaluation model will analyze your custom strategy's tradeoffs.
            </p>
            <p>
              <strong>4. Avoid Collapse:</strong> If CEO Trust hits 0, you'll be fired. If Budget hits 0, the company faces wind-up. Keep all indicators above critical levels!
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="default" className="w-full" onClick={() => setShowHowToPlay(false)}>
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
