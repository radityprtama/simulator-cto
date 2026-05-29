"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import {
  AsciiBox,
  AsciiBar,
  PromptButton,
  AsciiTitle,
  TypewriterText,
  ScanlinePanel,
} from "@/components/retro-tui";

export default function ResultsPage() {
  const router = useRouter();
  const {
    companyState,
    playerStats,
    badges,
    scenarioHistory,
    gameOverType,
    gameOverReason,
    resetGame,
  } = useGameStore();

  const [selectedIdx, setSelectedIdx] = useState(0); // 0: New Simulation, 1: Return to Menu
  const [showContent, setShowContent] = useState(false);

  const win = gameOverType === "win";
  const finalXp = playerStats.xp;
  const decisionsMade = scenarioHistory.length;
  const weeksSurvived = Math.max(1, companyState.company.week - 1);
  const companyName = companyState.company.name || "NOVACORP";
  const playerName = companyState.company.playerName || "OPERATOR";

  // Trigger content reveal after a tiny delay to simulate CRT warming up
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev === 0 ? 1 : 0));
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev === 1 ? 0 : 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleExecuteOption(selectedIdx);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx]);

  const handleExecuteOption = (idx: number) => {
    if (idx === 0) {
      resetGame();
      router.push("/setup");
    } else {
      resetGame();
      router.push("/");
    }
  };

  const getStrategicScore = () => playerStats.scores.strategic;
  const getPeopleScore = () => playerStats.scores.people;
  const getTechnicalScore = () => playerStats.scores.technical;
  const getBusinessScore = () => playerStats.scores.business;
  const getRiskScore = () => playerStats.scores.risk;

  const debriefLines = wrapText(
    gameOverReason || 
    (win
      ? "You stabilized the core infrastructure, kept leadership aligned, and navigated structural tech debt under volatile quarter circumstances."
      : "The board voted to replace you. Debt backlog reached unacceptable boundaries, causing organizational trust to dissolve completely."),
    80
  ).slice(0, 3); // Max 3 lines as required

  function wrapText(text: string, limit: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if (currentLine.length + word.length + (currentLine ? 1 : 0) <= limit) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  if (!showContent) {
    return (
      <main className="bg-[var(--canvas)] h-screen w-screen flex items-center justify-center p-8 select-none">
        <span className="text-[var(--primary)] cursor-blink">█</span>
      </main>
    );
  }

  return (
    <main className="bg-[var(--canvas)] min-h-screen w-screen flex flex-col items-center justify-center p-4 relative select-none">
      
      {/* 90ch container box */}
      <div className="w-full max-w-[90ch] flex flex-col gap-5">
        
        {/* Outcome Titles */}
        <div className="text-center">
          {win ? (
            <>
              <AsciiTitle size="xxl" text="SURVIVED" />
              <AsciiTitle size="xl" text="QUARTER COMPLETE" className="mt-[-8px]" />
              <div className="text-[var(--text-bright)] font-mono text-center text-xs my-2">
                ════════════════════════════════════════════════════════════<br />
                {companyName} HAS COMPLETED Q3 2026 UNDER YOUR LEADERSHIP.<br />
                ════════════════════════════════════════════════════════════
              </div>
            </>
          ) : (
            <>
              <AsciiTitle size="xxl" text="TERMINATED" />
              <AsciiTitle size="xl" text="GAME OVER" className="mt-[-8px]" />
              <div className="text-[var(--text-alert)] font-mono text-center text-xs my-2">
                ════════════════════════════════════════════════════════════<br />
                THE BOARD HAS VOTED TO REPLACE YOU EFFECTIVE IMMEDIATELY.<br />
                ════════════════════════════════════════════════════════════
              </div>
            </>
          )}
        </div>

        {/* performance report splits */}
        <div className="border-t border-b border-[var(--matrix-line)] py-3">
          <div className="font-mono text-[10px] text-[var(--text-muted)] text-center uppercase tracking-wide">
            FINAL PERFORMANCE REPORT // {playerName} // {companyName}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Competency score charts */}
          <div className="border border-[var(--matrix-line)] p-4 flex flex-col gap-2.5">
            <span className="font-mono text-xs text-[var(--primary)] font-bold mb-1">
              [ SCORE BREAKDOWN ]
            </span>
            <AsciiBar label="STRATEGIC" value={getStrategicScore()} width={16} />
            <AsciiBar label="PEOPLE" value={getPeopleScore()} width={16} />
            <AsciiBar label="TECHNICAL" value={getTechnicalScore()} width={16} />
            <AsciiBar label="BUSINESS" value={getBusinessScore()} width={16} />
            <AsciiBar label="RISK MGMT" value={getRiskScore()} width={16} />
          </div>

          {/* Company metrics recap */}
          <div className="border border-[var(--matrix-line)] p-4 flex flex-col gap-2 bg-[var(--surface-dim)]">
            <span className="font-mono text-xs text-[var(--text-bright)] font-bold mb-1">
              [ FINAL COMPANY STATE ]
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <AsciiBar label="BUDGET" value={companyState.metrics.budget} width={12} />
              <AsciiBar label="MORALE" value={companyState.metrics.teamMorale} width={12} />
              <AsciiBar label="T.DEBT" value={companyState.metrics.technicalDebt} width={12} />
              <AsciiBar label="VELOC" value={companyState.metrics.productVelocity} width={12} />
              <AsciiBar label="CEO.TR" value={companyState.metrics.ceoRelationship} width={12} />
              <AsciiBar label="TALENT" value={companyState.metrics.talentPipeline || 40} width={12} />
            </div>
          </div>

        </div>

        {/* telemetry log stats */}
        <div className="border border-[var(--matrix-line)] p-3 grid grid-cols-3 gap-2 text-xs text-center font-mono">
          <div>
            <span className="text-[var(--text-muted)] block uppercase text-[10px]">DECISIONS MADE</span>
            <span className="text-[var(--text-bright)] font-bold text-sm">{decisionsMade}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block uppercase text-[10px]">WEEKS SURVIVED</span>
            <span className="text-[var(--text-bright)] font-bold text-sm">{weeksSurvived} / 12</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block uppercase text-[10px]">FINAL STATUS XP</span>
            <span className="text-[var(--primary)] font-bold text-sm">{finalXp} XP</span>
          </div>
        </div>

        {/* Badges collected list */}
        <div className="border border-[var(--matrix-line)] p-3">
          <span className="font-mono text-xs text-[var(--primary)] font-bold block mb-2">
            [ ACHIEVEMENTS COLLECTED ]
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <span key={idx} className="text-green-400 font-bold">
                  [{badge.label.toUpperCase()}]
                </span>
              ))
            ) : (
              <span className="text-[var(--text-muted)] italic">
                NO BADGES EARNED IN THIS TIMELINE.
              </span>
            )}
          </div>
        </div>

        {/* CTO Final debrief memo */}
        <div className="border border-[var(--primary-dim)] p-3 relative bg-[var(--canvas)]">
          <span className="absolute -top-2 left-3 px-1 text-[10px] bg-[var(--canvas)] text-[var(--primary)] font-bold">
            ┌─[ CTO FINAL DEBRIEF ]
          </span>
          <div className="text-xs text-[var(--primary)] font-mono leading-relaxed select-text py-1 italic">
            {debriefLines.map((line, idx) => (
              <div key={idx}>&gt;&gt; {line}</div>
            ))}
          </div>
        </div>

        {/* Menu selections */}
        <div className="flex justify-center gap-4 mt-2">
          <PromptButton
            label="NEW SIMULATION"
            active={selectedIdx === 0}
            onClick={() => handleExecuteOption(0)}
          />
          <PromptButton
            label="RETURN TO MENU"
            active={selectedIdx === 1}
            onClick={() => handleExecuteOption(1)}
          />
        </div>

      </div>
    </main>
  );
}
