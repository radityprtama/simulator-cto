"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import {
  AsciiBox,
  AsciiBar,
  PromptButton,
  StatusBadge,
  TerminalInput,
  TypewriterText,
  ScanlinePanel,
  BlinkCursor,
} from "@/components/retro-tui";
import { Metrics, Scenario } from "@/lib/game.types";

export default function GamePage() {
  const router = useRouter();
  const {
    companyState,
    playerStats,
    badges,
    currentScenario,
    decisionCount,
    isGameOver,
    weeklyDigest,
    activeEvaluation,
    isLoading,
    isSubmitting,
    loadNextScenario,
    submitChoice,
    closeEvaluation,
    closeWeeklyDigest,
    resetGame,
  } = useGameStore();

  const [selectedChoiceId, setSelectedChoiceId] = useState<string>("A");
  const [customText, setCustomText] = useState<string>("");
  const [isChoiceDetailExpanded, setIsChoiceDetailExpanded] = useState<boolean>(false);
  const [isBodyExpanded, setIsBodyExpanded] = useState<boolean>(false);
  const [isNoteExpanded, setIsNoteExpanded] = useState<boolean>(false);
  const [isEvaluationExpanded, setIsEvaluationExpanded] = useState<boolean>(false);
  const [isRippleExpanded, setIsRippleExpanded] = useState<boolean>(false);
  const [isInsightExpanded, setIsInsightExpanded] = useState<boolean>(false);
  
  // Evaluation modal page (1: Outcome report, 2: Metric Deltas)
  const [evalPage, setEvalPage] = useState<number>(1);
  
  // Weekly Digest modal page (1: Recap reports, 2: Stakeholders and anonymous feedback)
  const [digestPage, setDigestPage] = useState<number>(1);

  // Quit Dialog Overlay State
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // Responsive Toggles for Tablet / Mobile
  const [activePane, setActivePane] = useState<"center" | "right">("center"); // For tablet toggle (TAB)
  const [showMobileLeft, setShowMobileLeft] = useState<boolean>(false); // For mobile toggle (F1)

  // Load first scenario if none is active on mount
  useEffect(() => {
    if (!currentScenario && !isLoading && !isGameOver && !activeEvaluation && !weeklyDigest) {
      loadNextScenario();
    }
  }, [currentScenario, isLoading, isGameOver, activeEvaluation, weeklyDigest, loadNextScenario]);

  // Navigate to results screen if game is over
  useEffect(() => {
    if (isGameOver) {
      router.push("/game/results");
    }
  }, [isGameOver, router]);

  // Choices list helper (includes custom option D)
  const choicesList = currentScenario?.choices || [];
  const choicesKeys = [...choicesList.map((c) => c.id), "D"];

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in a text field
      const activeEl = document.activeElement;
      const isTyping = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";

      // 1. Quit confirmation override
      if (showQuitConfirm) {
        if (e.key === "Enter") {
          e.preventDefault();
          resetGame();
          router.push("/");
        } else if (e.key === "Escape" || e.key === "q" || e.key === "Q") {
          e.preventDefault();
          setShowQuitConfirm(false);
        }
        return;
      }

      // Quit trigger
      if (e.key === "q" || e.key === "Q") {
        if (!isTyping) {
          e.preventDefault();
          setShowQuitConfirm(true);
          return;
        }
      }

      // Responsive toggles (F1: Mobile sidebar, TAB: Tablet panel swap)
      if (e.key === "F1") {
        e.preventDefault();
        setShowMobileLeft((prev) => !prev);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        setActivePane((prev) => (prev === "center" ? "right" : "center"));
        return;
      }

      // If user is currently typing custom text, don't capture navigation keys (except Enter/Escape)
      if (isTyping) {
        if (e.key === "Escape") {
          e.preventDefault();
          if (activeEl instanceof HTMLElement) activeEl.blur();
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleExecuteDecision();
        }
        return;
      }

      // 2. Weekly Digest keyboard control
      if (weeklyDigest) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (digestPage === 1) {
            setDigestPage(2);
          } else {
            setDigestPage(1);
            closeWeeklyDigest();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (digestPage === 2) setDigestPage(1);
        } else if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          setIsBodyExpanded((prev) => !prev);
        }
        return;
      }

      // 3. Active Evaluation keyboard control
      if (activeEvaluation) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (evalPage === 1) {
            setEvalPage(2);
          } else {
            setEvalPage(1);
            closeEvaluation();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (evalPage === 2) setEvalPage(1);
        } else if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          setIsEvaluationExpanded((prev) => !prev);
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          setIsRippleExpanded((prev) => !prev);
        } else if (e.key === "i" || e.key === "I") {
          e.preventDefault();
          setIsInsightExpanded((prev) => !prev);
        }
        return;
      }

      // 4. Normal scenario keyboard control
      if (currentScenario && !isLoading) {
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          const currIdx = choicesKeys.indexOf(selectedChoiceId);
          const nextIdx = (currIdx + 1) % choicesKeys.length;
          setSelectedChoiceId(choicesKeys[nextIdx]);
        } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          const currIdx = choicesKeys.indexOf(selectedChoiceId);
          const prevIdx = (currIdx - 1 + choicesKeys.length) % choicesKeys.length;
          setSelectedChoiceId(choicesKeys[prevIdx]);
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          e.preventDefault();
          setIsChoiceDetailExpanded(true);
        } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          e.preventDefault();
          setIsChoiceDetailExpanded(false);
        } else if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          setIsBodyExpanded((prev) => !prev);
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          setIsNoteExpanded((prev) => !prev);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (selectedChoiceId === "D" && customText.trim() === "") {
            // Focus custom input by targeting it
            const inputEl = document.querySelector('input[type="text"]');
            if (inputEl instanceof HTMLElement) inputEl.focus();
          } else {
            handleExecuteDecision();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentScenario,
    isLoading,
    selectedChoiceId,
    choicesKeys,
    activeEvaluation,
    evalPage,
    weeklyDigest,
    digestPage,
    showQuitConfirm,
    customText,
    showMobileLeft,
    activePane,
  ]);

  const handleExecuteDecision = async () => {
    if (!selectedChoiceId) return;
    await submitChoice(selectedChoiceId, selectedChoiceId === "D" ? customText : "");
    setSelectedChoiceId("A");
    setCustomText("");
    setIsChoiceDetailExpanded(false);
    setIsBodyExpanded(false);
    setIsNoteExpanded(false);
  };

  // Wrap text function to support neat character wraps
  const wrapText = (text: string, limit: number): string[] => {
    const paragraphs = text.split("\n");
    const lines: string[] = [];

    paragraphs.forEach((para) => {
      const words = para.split(" ");
      let currentLine = "";
      words.forEach((word) => {
        if (currentLine.length + word.length + (currentLine ? 1 : 0) <= limit) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      // Empty line for paragraph breaks
      if (paragraphs.length > 1) lines.push("");
    });
    // Remove last trailing empty line
    if (lines[lines.length - 1] === "") lines.pop();
    return lines;
  };

  // Get industry initials/short codes
  const getIndustryCode = (ind: string) => {
    if (!ind) return "SS";
    const clean = ind.toUpperCase();
    if (clean.includes("HEALTH")) return "HC";
    if (clean.includes("GOV")) return "GT";
    if (clean.includes("SAAS")) return "SS";
    if (clean.includes("COMMERCE")) return "EC";
    if (clean.includes("FIN")) return "FT";
    if (clean.includes("ED")) return "ED";
    if (clean.includes("AI") || clean.includes("ML")) return "AI";
    if (clean.includes("CYBER")) return "CS";
    if (clean.includes("LOG")) return "LO";
    return clean.slice(0, 2);
  };

  // 12-segment progress bar helper for health items
  const renderMetricRow = (label: string, value: number, isDebt = false) => {
    let tag = "";
    if (isDebt) {
      if (value > 70) tag = " [HIGH]";
    } else {
      if (value < 40) tag = " [LOW]";
    }
    return (
      <div className="my-1 text-xs">
        <AsciiBar label={label} value={value} width={12} />
        {tag && (
          <span
            className={`font-bold ml-1 ${
              isDebt ? "text-[var(--text-alert)] cursor-blink" : "text-[var(--primary-dim)]"
            }`}
          >
            {tag}
          </span>
        )}
      </div>
    );
  };

  const companyName = companyState.company.name || "NOVACORP";
  const playerXp = playerStats.xp;
  const currentWeek = companyState.company.week;

  // Responsive Pane controls mapping
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1280;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const showLeftColumn = showMobileLeft || (!isMobile);
  const showCenterColumn = !showMobileLeft && (activePane === "center" || !isTablet);
  const showRightColumn = !showMobileLeft && (activePane === "right" || (!isTablet && !isMobile));

  return (
    <div className="bg-[var(--canvas)] h-screen w-screen flex flex-col items-center justify-center font-mono leading-none p-1 text-xs md:text-sm select-none">
      
      {/* 102ch TUI terminal size wrapper */}
      <div className="w-full max-w-[102ch] h-[95vh] md:h-[650px] flex flex-col justify-between border border-[var(--matrix-line)] relative bg-[var(--canvas)]">
        
        {/* Top Split Columns Row */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* 1. LEFT PANE — SYSTEM DASHBOARD */}
          {showLeftColumn && (
            <div className="w-[22ch] flex-shrink-0 flex flex-col h-full bg-[var(--canvas)] select-none z-10">
              <AsciiBox variant="single" title="SYS DASHBOARD" className="h-full">
                <div className="text-[10px] leading-tight flex flex-col gap-0.5 text-[var(--text-bright)]">
                  <div>CTO: {playerStats.level === "Junior CTO" ? "A. CHEN" : companyState.company.playerName?.toUpperCase().slice(0, 12)}</div>
                  <div>ORG: {companyName.slice(0, 12)}</div>
                  <div>SEC: {getIndustryCode(companyState.company.industry || "")}</div>
                  <div>STG: {companyState.company.stage?.toUpperCase().slice(0, 10)}</div>
                  <div>WK:  {String(currentWeek).padStart(2, "0")} / 12</div>
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1">[COMPANY HEALTH]</div>
                
                {renderMetricRow("BUDGET", companyState.metrics.budget)}
                {renderMetricRow("MORALE", companyState.metrics.teamMorale)}
                {renderMetricRow("T.DEBT", companyState.metrics.technicalDebt, true)}
                {renderMetricRow("VELOC", companyState.metrics.productVelocity)}
                {renderMetricRow("CEO.TR", companyState.metrics.ceoRelationship)}
                {renderMetricRow("CUST", companyState.metrics.customerSatisfaction || 60)}
                {renderMetricRow("SECUR", companyState.metrics.securityPosture || 50)}
                {renderMetricRow("TALENT", companyState.metrics.talentPipeline || 40)}

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1">[ACTIVE FLAGS]</div>
                <div className="flex flex-col gap-1 max-h-[70px] overflow-y-auto no-scrollbar font-mono text-[10px] text-[var(--text-muted)]">
                  {companyState.activeFlags.length > 0 ? (
                    companyState.activeFlags.map((flag) => (
                      <div key={flag} className="truncate">
                        &gt; {flag.toLowerCase().slice(0, 18)}
                      </div>
                    ))
                  ) : (
                    <div>&gt; no_issues_active</div>
                  )}
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1">[QUARTER TIMELINE]</div>
                <div className="flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center gap-0.5">
                    <span className="w-5 text-[var(--text-muted)]">WK:</span>
                    <span className="text-[var(--primary-dim)] font-bold">
                      {"██".repeat(Math.max(0, currentWeek - 1))}
                    </span>
                    <span className="text-[var(--primary)] cursor-blink">██</span>
                    <span className="text-[var(--text-muted)]">
                      {"░░".repeat(Math.max(0, 12 - currentWeek))}
                    </span>
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)]">
                    WK {String(currentWeek).padStart(2, "0")} OF 12 // Q3 2026
                  </div>
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-0.5">[XP / RANK]</div>
                <div className="text-[10px] text-[var(--text-bright)] leading-tight truncate">
                  {playerStats.level.toUpperCase()}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-1">
                  XP: {playerXp} / 1500
                </div>
              </AsciiBox>
            </div>
          )}

          {/* Separator 1 */}
          {showLeftColumn && showCenterColumn && (
            <div className="w-[1ch] flex justify-center items-center text-[var(--matrix-line)] select-none">
              │
            </div>
          )}

          {/* 2. CENTER PANE — MAIN WORKSPACE (Active Scenario / Modal Overlays) */}
          {showCenterColumn && (
            <div className="flex-1 min-w-[56ch] flex flex-col h-full bg-[var(--canvas)] overflow-hidden relative">
              
              {/* EXIT CONFIRMATION OVERLAY */}
              {showQuitConfirm ? (
                <div className="absolute inset-0 p-4 bg-[var(--canvas)] flex flex-col items-center justify-center z-30">
                  <div className="w-full max-w-[50ch]">
                    <AsciiBox variant="double" title="TERMINATE SIMULATION?">
                      <ScanlinePanel className="flex flex-col items-center text-center gap-4 py-6 text-xs">
                        <span className="text-[var(--text-alert)] font-bold">
                          ARE YOU SURE YOU WANT TO QUIT TO MENU?
                        </span>
                        <span>YOUR CURRENT SESSION XP WILL BE RESET.</span>
                        <div className="border-t border-[var(--matrix-line)] w-full my-2" />
                        <span className="text-[var(--primary)] font-bold">
                          &gt; PRESS [ENTER] TO CONFIRM // [ESC] TO CANCEL
                        </span>
                      </ScanlinePanel>
                    </AsciiBox>
                  </div>
                </div>
              ) : null}

              {/* WEEKLY DIGEST DIALOG OVERLAY */}
              {weeklyDigest ? (
                <div className="absolute inset-0 p-3 bg-[var(--canvas)] z-20 flex flex-col justify-between">
                  <AsciiBox variant="double" title={`WEEKLY SYSTEM DIAGNOSTIC — WEEK ${String(currentWeek - 1).padStart(2, "0")}`}>
                    <ScanlinePanel className="flex flex-col gap-2 h-[420px] justify-between text-xs py-2 leading-relaxed">
                      
                      {digestPage === 1 ? (
                        /* PAGE 1: Core reports */
                        <div className="flex flex-col gap-3">
                          <div className="font-bold text-[var(--primary-bright)] text-center">
                            PAGE 1 OF 2 — EXECUTIVES RECAP
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[var(--primary)] font-bold">HEADLINE:</span>
                            <span className="text-[var(--text-bright)] select-text">
                              "{weeklyDigest.headline.toUpperCase()}"
                            </span>
                          </div>

                          <div className="border-t border-[var(--matrix-line)] my-1" />

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[var(--primary)] font-bold">EXECUTIVE SUMMARY:</span>
                            <div className="text-[var(--text-standard)] select-text">
                              {isBodyExpanded 
                                ? weeklyDigest.summary 
                                : wrapText(weeklyDigest.summary, 50).slice(0, 4).join("\n")}
                              {!isBodyExpanded && wrapText(weeklyDigest.summary, 50).length > 4 && (
                                <span className="text-[var(--primary-dim)] block mt-1 font-bold">
                                  [ ... PRESS [E] TO EXPAND SUMMARY ]
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-[var(--matrix-line)] my-1" />

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="border border-[var(--matrix-line)] p-2">
                              <span className="text-green-400 font-bold">[WIN]</span>
                              <div className="text-[var(--text-muted)] mt-1 select-text">
                                {weeklyDigest.biggestWin}
                              </div>
                            </div>
                            <div className="border border-[var(--matrix-line)] p-2">
                              <span className="text-[var(--text-alert)] font-bold">[MISS]</span>
                              <div className="text-[var(--text-muted)] mt-1 select-text">
                                {weeklyDigest.biggestMiss}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* PAGE 2: Pulse & Pressure */
                        <div className="flex flex-col gap-3">
                          <div className="font-bold text-[var(--primary-bright)] text-center">
                            PAGE 2 OF 2 — SYSTEM PULSE
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--primary)] font-bold">ANONYMOUS TEAM FEEDBACK:</span>
                            <div className="text-[var(--text-standard)] border-l-2 border-[var(--matrix-line)] pl-2 py-1 select-text">
                              &gt;&gt; "{weeklyDigest.teamPulse}"
                            </div>
                          </div>

                          <div className="border-t border-[var(--matrix-line)] my-1" />

                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--primary)] font-bold">CEO SIGNAL:</span>
                            <div className="text-[var(--text-bright)] select-text">
                              VOSS: "{weeklyDigest.ceoThought}"
                            </div>
                          </div>

                          <div className="border-t border-[var(--matrix-line)] my-1" />

                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--text-alert)] font-bold">NEXT WEEK PRESSURE:</span>
                            <div className="text-[var(--text-alert)] font-bold select-text">
                              &gt;&gt; {weeklyDigest.upcomingPressure.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pagination Controls */}
                      <div className="border-t border-[var(--matrix-line)] pt-2 mt-auto text-center flex flex-col gap-1 select-none">
                        <span className="text-[var(--primary)] font-bold">
                          {digestPage === 1 ? "> [ENTER] NEXT PAGE <" : `> [ENTER] CONTINUE TO WEEK ${String(currentWeek).padStart(2, "0")} <`}
                        </span>
                        <span className="text-[var(--text-muted)] text-[10px]">
                          [E] EXPAND TEXT // [ESC] PREVIOUS PAGE
                        </span>
                      </div>
                    </ScanlinePanel>
                  </AsciiBox>
                </div>
              ) : null}

              {/* ACTIVE EVALUATION REPORT OVERLAY */}
              {activeEvaluation ? (
                <div className="absolute inset-0 p-3 bg-[var(--canvas)] z-20 flex flex-col justify-between">
                  <AsciiBox variant="double" title="DECISION EVALUATION REPORT">
                    <ScanlinePanel className="flex flex-col gap-2 h-[420px] justify-between text-xs py-2 leading-relaxed">
                      
                      {evalPage === 1 ? (
                        /* PAGE 1: Outcome and ripple reports */
                        <div className="flex flex-col gap-3">
                          <div className="font-bold text-[var(--primary-bright)] text-center">
                            PAGE 1 OF 2 — IMMEDIATE OUTCOME
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between">
                              <span className="text-[var(--text-bright)] font-bold">
                                CHOICE SELECTED: [{selectedChoiceId}]
                              </span>
                              <StatusBadge
                                label={activeEvaluation.newCompanyMood === "meltdown" ? "MELTDOWN" : "RESOLVED"}
                                variant={activeEvaluation.newCompanyMood === "meltdown" ? "crit" : "ok"}
                              />
                            </div>
                            <div className="text-[var(--text-standard)] select-text">
                              {isEvaluationExpanded 
                                ? activeEvaluation.immediateOutcome 
                                : wrapText(activeEvaluation.immediateOutcome, 50).slice(0, 5).join("\n")}
                              {!isEvaluationExpanded && wrapText(activeEvaluation.immediateOutcome, 50).length > 5 && (
                                <span className="text-[var(--primary-dim)] block mt-1 font-bold">
                                  [ ... PRESS [E] FOR FULL REPORT ]
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-[var(--matrix-line)] my-1" />

                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--primary)] font-bold">DOWNSTREAM EFFECTS:</span>
                            <div className="text-[var(--text-standard)] select-text">
                              {isRippleExpanded 
                                ? activeEvaluation.rippleEffects 
                                : wrapText(activeEvaluation.rippleEffects || "No imminent ripples detected.", 50).slice(0, 2).join("\n")}
                              {!isRippleExpanded && wrapText(activeEvaluation.rippleEffects || "", 50).length > 2 && (
                                <span className="text-[var(--primary-dim)] block mt-1 font-bold">
                                  [ PRESS [N] TO EXPAND EFFECTS ]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* PAGE 2: Metric Deltas and Achievements */
                        <div className="flex flex-col gap-2">
                          <div className="font-bold text-[var(--primary-bright)] text-center mb-1">
                            PAGE 2 OF 2 — METRICS
                          </div>

                          <div className="border border-[var(--matrix-line)] p-2 bg-[var(--canvas)] flex flex-col gap-1 text-[11px]">
                            <span className="text-[var(--primary)] font-bold mb-1 uppercase text-center block">
                              Metric Delta Report
                            </span>

                            {Object.entries(activeEvaluation.metricDeltas).map(([key, val]) => {
                              if (val === 0 || !val) return null;
                              const isPositive = val > 0;
                              const currentVal = companyState.metrics[key as keyof Metrics] || 0;
                              const beforeVal = Math.max(0, Math.min(100, currentVal - val));

                              // Tech debt color is inverted (increase is red, decrease is green)
                              const isAlert = key === "technicalDebt" ? isPositive : !isPositive;
                              const direction = isPositive ? "▲" : "▼";
                              const formattedDelta = `${isPositive ? "+" : ""}${val}`;

                              return (
                                <div key={key} className="flex justify-between items-center text-[10px] font-mono leading-none py-0.5">
                                  <span className="w-8 text-[var(--text-standard)] truncate">
                                    {key.toUpperCase().slice(0, 6)}
                                  </span>
                                  <span className={`w-8 font-bold ${isAlert ? "text-[var(--text-alert)]" : "text-green-400"}`}>
                                    {direction} {formattedDelta}
                                  </span>
                                  <span className="flex-1 px-2">
                                    <AsciiBar value={currentVal} width={12} />
                                  </span>
                                  <span className="text-[var(--text-muted)] text-[9px]">
                                    {beforeVal}% → {currentVal}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center text-[10px] mt-2">
                            <span>XP EARNED: +{activeEvaluation.xpEarned}</span>
                            <span className="text-[var(--primary-bright)]">TOTAL: {playerXp} XP</span>
                          </div>

                          <div className="border-t border-[var(--matrix-line)] my-1" />

                          {/* New Badge Unlock Box */}
                          {activeEvaluation.badge ? (
                            <div className="border border-[var(--primary)] p-2 flex flex-col gap-0.5">
                              <span className="text-green-400 font-bold text-center block">
                                [NEW BADGE UNLOCKED]
                              </span>
                              <div className="flex gap-2 items-center text-[10px] mt-1">
                                <span className="text-xl">🏆</span>
                                <div>
                                  <span className="text-[var(--text-bright)] font-bold">
                                    {activeEvaluation.badge.label.toUpperCase()}
                                  </span>
                                  <span className="text-[var(--text-muted)] block text-[9px]">
                                    {activeEvaluation.badge.reason.slice(0, 50)}...
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {/* CTO Insight Quote */}
                          {activeEvaluation.ctoInsight ? (
                            <div className="flex flex-col gap-0.5 mt-1 text-[10px]">
                              <span className="text-[var(--primary)] font-bold">CTO INSIGHT:</span>
                              <div className="text-[var(--text-bright)] italic select-text">
                                {isInsightExpanded 
                                  ? activeEvaluation.ctoInsight 
                                  : wrapText(activeEvaluation.ctoInsight, 50).slice(0, 2).join("\n")}
                                {!isInsightExpanded && wrapText(activeEvaluation.ctoInsight, 50).length > 2 && (
                                  <span className="text-[var(--primary-dim)] block font-bold cursor-pointer">
                                    [ PRESS [I] FOR FULL QUOTE ]
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Controls */}
                      <div className="border-t border-[var(--matrix-line)] pt-2 mt-auto text-center flex flex-col gap-1 select-none">
                        <span className="text-[var(--primary)] font-bold">
                          {evalPage === 1 ? "> [ENTER] NEXT PAGE <" : "> [ENTER] NEXT SCENARIO <"}
                        </span>
                        <span className="text-[var(--text-muted)] text-[10px]">
                          [E] EXPAND OUTCOME // [N] Downstream // [I] Insight // [ESC] Back
                        </span>
                      </div>
                    </ScanlinePanel>
                  </AsciiBox>
                </div>
              ) : null}

              {/* CORE ACTIVE SCENARIO TRANSMISSION */}
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
                  <span className="text-[var(--primary)] cursor-blink">█</span>
                  <span className="text-[var(--text-muted)] text-xs font-mono mt-3 animate-pulse">
                    RECEIVING INCOMING WORKSPACE TELEMETRY...
                  </span>
                </div>
              ) : currentScenario ? (
                <AsciiBox variant="active" title="INCOMING TRANSMISSION" className="h-full flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    
                    {/* Header badges row */}
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex gap-2">
                        <StatusBadge label={`DECISION ${String(decisionCount + 1).padStart(2, "0")}`} variant="info" />
                        <StatusBadge label={companyState.companyMood.toUpperCase()} variant="warn" />
                        <StatusBadge label={currentScenario.type.toUpperCase()} variant="crit" />
                      </div>
                      <span className="text-[var(--primary-dim)] font-bold">
                        URGENCY: {currentScenario.urgency.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[10px] text-[var(--text-muted)] border-t border-b border-[var(--matrix-line)] py-1 leading-relaxed">
                      FROM:  {currentScenario.from.toUpperCase()}<br />
                      VIA:   {currentScenario.channel.replace("_", " ").toUpperCase()}<br />
                      SUBJ:  {currentScenario.title.toUpperCase()}<br />
                      WATCH: {(currentScenario.stakeholdersWatching || []).join(" · ").toUpperCase()}
                    </div>

                    {/* Scenario Transmission Body */}
                    <div className="border border-[var(--matrix-line)] p-3 bg-[var(--canvas)] relative">
                      <span className="absolute -top-2 left-2 px-1 text-[10px] bg-[var(--canvas)] text-[var(--primary)] font-bold">
                        ┌─[ TRANSMISSION BODY ]
                      </span>
                      <div className="text-xs leading-relaxed font-mono select-text py-1 max-h-[140px] overflow-y-auto no-scrollbar">
                        {isBodyExpanded 
                          ? currentScenario.body 
                          : wrapText(currentScenario.body, 50).slice(0, 6).join("\n")}
                        {!isBodyExpanded && wrapText(currentScenario.body, 50).length > 6 && (
                          <span className="text-[var(--primary-dim)] block mt-1 font-bold">
                            [ ... {wrapText(currentScenario.body, 50).length - 6} MORE LINES — PRESS [E] TO EXPAND ]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Private CTO Note */}
                    {currentScenario.context && (
                      <div className="border border-[var(--primary-dim)] p-2 relative bg-[var(--canvas)]">
                        <span className="absolute -top-2 left-2 px-1 text-[10px] bg-[var(--canvas)] text-[var(--primary-dim)] font-bold">
                          ┌─[ CTO PRIVATE NOTE ]
                        </span>
                        <div className="text-[10px] text-[var(--primary-dim)] leading-relaxed select-text py-1">
                          {isNoteExpanded 
                            ? currentScenario.context 
                            : wrapText(currentScenario.context, 50).slice(0, 2).join("\n")}
                          {!isNoteExpanded && wrapText(currentScenario.context, 50).length > 2 && (
                            <span className="text-[var(--primary-dim)] block mt-0.5 font-bold cursor-pointer">
                              [ PRESS [N] TO EXPAND NOTE ]
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Choices Block */}
                    <div className="flex flex-col mt-1">
                      <span className="text-[10px] text-[var(--primary)] font-bold mb-1 uppercase">
                        ════════════════════ [RESPONSE OPTIONS] ════════════════════
                      </span>

                      <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                        {choicesList.map((opt) => {
                          const isActive = selectedChoiceId === opt.id;
                          return (
                            <div key={opt.id} className="flex flex-col">
                              <PromptButton
                                label={`${opt.id}: ${opt.label.toUpperCase()}`}
                                active={isActive}
                                onClick={() => setSelectedChoiceId(opt.id)}
                                className="w-fit"
                              />
                              {isActive && isChoiceDetailExpanded && (
                                <div className="text-[10px] text-[var(--text-muted)] ml-6 leading-tight italic select-text">
                                  RISK: {opt.tradeoffs.toUpperCase()}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Custom choice D option */}
                        <div className="flex flex-col">
                          <PromptButton
                            label="D: WRITE CUSTOM RESPONSE"
                            active={selectedChoiceId === "D"}
                            onClick={() => setSelectedChoiceId("D")}
                            className="w-fit"
                          />
                          {selectedChoiceId === "D" && (
                            <div className="flex flex-col gap-1 mt-1 ml-6 select-text">
                              <TerminalInput
                                value={customText}
                                onChange={(val) => setCustomText(val)}
                                prefix="CTO@NOVACORP:~#"
                                charLimit={150}
                                onSubmit={handleExecuteDecision}
                              />
                              <span className="text-[9px] text-[var(--text-muted)]">
                                [PRESS ESC TO CONFIRM TEXT BOUNDARIES // SUBMIT VIA BUTTON BELOW]
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Submission and prompt commands */}
                  <div className="border-t border-[var(--matrix-line)] pt-2 mt-auto flex justify-between items-center text-[10px] select-none">
                    <div className="text-[var(--text-muted)] flex flex-col gap-0.5">
                      <span>W/S: Navigate options // A/D: Expand tradeoff</span>
                      <span>E: Expand body // N: Note // ENTER: Execute</span>
                    </div>
                    
                    <PromptButton
                      label={isSubmitting ? "EVALUATING..." : "SUBMIT DECISION"}
                      active={true}
                      disabled={isSubmitting}
                      onClick={handleExecuteDecision}
                    />
                  </div>
                </AsciiBox>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 select-none">
                  <span className="text-[var(--text-muted)]">NO SCENARIOS LOADED. CONTACT ADMINISTRATION.</span>
                </div>
              )}

            </div>
          )}

          {/* Separator 2 */}
          {showCenterColumn && showRightColumn && (
            <div className="w-[1ch] flex justify-center items-center text-[var(--matrix-line)] select-none">
              │
            </div>
          )}

          {/* 3. RIGHT PANE — CONTEXT LOG & TELEMETRY */}
          {showRightColumn && (
            <div className="w-[22ch] flex-shrink-0 flex flex-col h-full bg-[var(--canvas)] select-none z-10">
              <AsciiBox variant="single" title="CONTEXT LOG" className="h-full">
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1">[THIS WEEK]</div>
                <div className="text-[10px] text-[var(--text-bright)] leading-tight select-text">
                  DECISION: {String(decisionCount + 1).padStart(2, "0")}<br />
                  WEEK:     {String(currentWeek).padStart(2, "0")} / 12
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1.5">[STAKEHOLDERS]</div>
                <div className="flex flex-col gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-400 font-bold">[OK]</span>
                    <span className="truncate">CEO S. VOSS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {currentScenario && currentScenario.from.toUpperCase().includes("JORDAN") ? (
                      <span className="text-[var(--primary)] cursor-blink font-bold">[!!]</span>
                    ) : (
                      <span className="text-[var(--primary-dim)] font-bold">[OK]</span>
                    )}
                    <span className="truncate">VP ENG J. KIM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--primary-dim)] font-bold">[OK]</span>
                    <span className="truncate">BOARD DIRECTORS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)] font-bold">[--]</span>
                    <span className="text-[var(--text-muted)] truncate">LEAD T. REYES</span>
                  </div>
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1.5">[RECENT DECISIONS]</div>
                <div className="flex flex-col gap-2 text-[10px] text-[var(--text-muted)] max-h-[85px] overflow-y-auto no-scrollbar font-mono select-text">
                  {companyState.recentDecisions.length > 0 ? (
                    companyState.recentDecisions.slice(0, 3).map((dec, idx) => {
                      // e.g. "Week 1: Resolved \"Inc\" with decision A."
                      // Slice to fit inside column
                      const cleanDec = dec.replace("Resolved ", "").replace("with decision ", "");
                      return (
                        <div key={idx} className="leading-snug">
                          • {cleanDec.slice(0, 18)}
                        </div>
                      );
                    })
                  ) : (
                    <div>no_recent_decisions</div>
                  )}
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1.5">[BADGES EARNED]</div>
                <div className="flex flex-col gap-1 text-[10px]">
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const badge = badges[idx];
                    if (badge) {
                      return (
                        <div key={idx} className="truncate text-green-400 font-bold">
                          [{badge.label.toUpperCase().slice(0, 14)}]
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="text-[var(--text-muted)]">
                        [???????????] LOCKED
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--matrix-line)] my-2" />
                <div className="text-[10px] text-[var(--primary)] font-bold mb-1">[SYSTEM STATUS]</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight select-text flex flex-col gap-0.5">
                  <div>API:     <span className="text-green-400 font-bold">[ONLINE]</span></div>
                  <div>ENGINE:  <span className="text-[var(--primary)] font-bold">[ACTIVE]</span></div>
                  <div>TIMER:   <span className="text-[var(--text-muted)] font-bold">[--:--]</span></div>
                </div>
              </AsciiBox>
            </div>
          )}

        </div>

        {/* 4. FIXED BOTTOM STATUS BAR (FULL WIDTH) */}
        <div className="border-t border-[var(--matrix-line)] bg-[var(--canvas)] px-2 py-1 flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)] select-none">
          <div className="truncate">
            [CTO SIM] {companyName.slice(0, 10)} // {companyState.company.stage?.toUpperCase().split(" ")[0] || "SERIES B"} // WEEK {String(currentWeek).padStart(2, "0")} // MODE: NORMAL
          </div>
          <div>
            [KEYS] TAB:PANES // F1:DASHBOARD // W/S:NAV // E:EXPAND // Q:QUIT
          </div>
        </div>

      </div>
    </div>
  );
}
