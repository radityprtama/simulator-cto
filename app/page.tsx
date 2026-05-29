"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import {
  AsciiBox,
  AsciiTitle,
  PromptButton,
  BlinkCursor,
  TypewriterText,
  ScanlinePanel,
} from "@/components/retro-tui";

export default function TitlePage() {
  const router = useRouter();
  const { resetGame } = useGameStore();

  const [isBooting, setIsBooting] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0); // 0: Start, 1: Resume, 2: How to Play, 3: Quit

  // Keyboard navigation
  useEffect(() => {
    if (isBooting || bootComplete === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHowToPlay) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          setShowHowToPlay(false);
        }
        return;
      }

      const menuOptionsCount = 4;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSelectedOption((prev) => (prev + 1) % menuOptionsCount);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        setSelectedOption((prev) => (prev - 1 + menuOptionsCount) % menuOptionsCount);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleExecuteOption(selectedOption);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBooting, bootComplete, showHowToPlay, selectedOption]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("cto_sim_decision_count");
      setHasSave(!!(savedCount && Number(savedCount) > 0));
    }
  }, []);

  const handleExecuteOption = (optionIdx: number) => {
    if (optionIdx === 0) {
      // Start New Simulation
      resetGame();
      router.push("/setup");
    } else if (optionIdx === 1) {
      // Load Previous Session
      if (hasSave) {
        router.push("/game");
      } else {
        alert("NO PREVIOUS SESSION FOUND. CONFIGURING NEW INSTANCE.");
        resetGame();
        router.push("/setup");
      }
    } else if (optionIdx === 2) {
      // How to Play
      setShowHowToPlay(true);
    } else if (optionIdx === 3) {
      // Quit
      if (confirm("TERMINATE CORRUPTED CONSOLE SESSION?")) {
        resetGame();
        window.close();
      }
    }
  };

  const handleBootComplete = () => {
    setTimeout(() => {
      setIsBooting(false);
      setBootComplete(true);
    }, 500);
  };

  const bootLines = [
    "NOVACORP ENTERPRISE TERMINAL v4.2.1",
    "COPYRIGHT (C) 2026 SYNTHETIC SYSTEMS INC.",
    "────────────────────────────────────────",
    "INITIALIZING CORE MODULES...       [OK]",
    "LOADING DECISION ENGINE...         [OK]",
    "MOUNTING TELEMETRY STREAMS...      [OK]",
    "AUTHENTICATING CTO CREDENTIALS...  [OK]",
    "────────────────────────────────────────",
    "SYSTEM READY.",
  ];

  const howToPlayLines = [
    "YOU ARE THE CTO. YOUR COMPANY IS IN TROUBLE.",
    "",
    "EACH WEEK THE SYSTEM GENERATES A SCENARIO:",
    "A CRISIS, A THREAT, OR AN OPPORTUNITY.",
    "",
    "YOU CHOOSE HOW TO RESPOND. YOUR CHOICE",
    "AFFECTS 8 COMPANY METRICS IN REAL TIME.",
    "",
    "SURVIVE 12 WEEKS WITHOUT HITTING ZERO",
    "ON BUDGET, MORALE, OR CEO TRUST.",
    "",
    "GOOD LUCK. YOU WILL NEED IT.",
    "",
    "─────────────────────────────────────────────",
    "> PRESS ENTER TO RETURN",
  ];

  if (isBooting) {
    return (
      <main className="bg-[var(--canvas)] h-screen w-screen flex items-center justify-center p-8 select-none">
        <div className="w-[120ch] h-[30ch] flex flex-col justify-start">
          <TypewriterText lines={bootLines} delayMs={30} onComplete={handleBootComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[var(--canvas)] h-screen w-screen flex flex-col items-center justify-center p-4 relative select-none">
      
      {/* 120x30 Terminal grid wrapper */}
      <div className="w-full max-w-[120ch] h-[30ch] flex flex-col justify-between relative">
        
        {/* Title Block */}
        <div className="flex flex-col items-center mt-2">
          <AsciiTitle size="xxl" text="CTO" />
          <AsciiTitle size="xl" text="SIMULATOR" className="mt-[-8px]" />
          
          <div className="text-[var(--text-muted)] font-mono text-center text-xs tracking-wider mt-2 select-none">
            ═══════════════════════════════════════════════════════════<br />
            CHIEF TECHNOLOGY OFFICER CRISIS MANAGEMENT SYSTEM // v1.0<br />
            ═══════════════════════════════════════════════════════════
          </div>

          <div className="text-[var(--text-standard)] font-mono text-center text-xs mt-3 select-none">
            &gt; You have one quarter. Eight metrics. Infinite ways to fail.
          </div>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col items-center justify-center gap-1 my-4">
          <PromptButton
            label="START NEW SIMULATION"
            active={selectedOption === 0}
            onClick={() => {
              setSelectedOption(0);
              handleExecuteOption(0);
            }}
          />
          <PromptButton
            label={hasSave ? "RESUME PREVIOUS SESSION" : "LOAD PREVIOUS SESSION"}
            active={selectedOption === 1}
            disabled={!hasSave}
            onClick={() => {
              setSelectedOption(1);
              handleExecuteOption(1);
            }}
          />
          <PromptButton
            label="HOW TO PLAY"
            active={selectedOption === 2}
            onClick={() => {
              setSelectedOption(2);
              handleExecuteOption(2);
            }}
          />
          <PromptButton
            label="QUIT"
            active={selectedOption === 3}
            onClick={() => {
              setSelectedOption(3);
              handleExecuteOption(3);
            }}
          />
        </div>

        {/* Footer strip */}
        <div className="border-t border-[var(--matrix-line)] pt-2 mt-auto font-mono text-[10px] text-[var(--text-muted)] flex justify-between select-none">
          <div>
            [SYS]  TERMINAL READY   [VER] 1.0.0   [DATE] 2026-05-29
          </div>
          <div>
            USE ARROW KEYS TO NAVIGATE  //  PRESS ENTER TO CONFIRM
            <span className="text-[var(--primary)] cursor-blink ml-1">_</span>
          </div>
        </div>
      </div>

      {/* HOW TO PLAY overlay modal */}
      {showHowToPlay && (
        <div className="absolute inset-0 bg-[var(--canvas)]/90 flex items-center justify-center p-4 z-40">
          <div className="w-full max-w-[60ch]">
            <AsciiBox variant="double" title="HOW TO PLAY">
              <ScanlinePanel className="py-2">
                <TypewriterText lines={howToPlayLines} delayMs={20} />
              </ScanlinePanel>
            </AsciiBox>
          </div>
        </div>
      )}
    </main>
  );
}
