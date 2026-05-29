"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { MetricBar } from "@/components/metric-bar";
import { ScenarioBadge } from "@/components/scenario-badge";
import { WeekGrid } from "@/components/week-grid";
import { ExpandableText } from "@/components/expandable-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
    isVolumeOn,
    setVolumeOn,
    loadNextScenario,
    submitChoice,
    closeEvaluation,
    closeWeeklyDigest,
    resetGame,
  } = useGameStore();

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>("");
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Load first scenario on mount if none is active
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

  const handleSelectChoice = (id: string) => {
    setSelectedChoiceId(id);
  };

  const handleExecuteDecision = async () => {
    if (!selectedChoiceId) return;
    await submitChoice(selectedChoiceId, selectedChoiceId === "D" ? customText : "");
    setSelectedChoiceId(null);
    setCustomText("");
  };

  // Helper for initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "AC";
  };

  // Determine stakeholder state colors based on metrics
  const getDotColor = (val: number) => {
    if (val > 60) return "bg-green-500";
    if (val >= 40) return "bg-amber-400";
    return "bg-red-400";
  };

  const companyName = companyState.company.name || "NovaCorp";
  const initials = getInitials(companyState.company.playerName || "Alex Chen");
  const currentXp = playerStats.xp % 1000;
  const xpPercent = Math.min(100, (playerStats.xp % 1000) / 10);

  // Channel emojis
  const channelEmojis = {
    slack: "💬",
    email: "📧",
    meeting: "📞",
    phone_call: "📞",
    board_report: "🗓️",
  };

  // Render Sidebar content (reusable on desktop + mobile drawer)
  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Company Block */}
      <div className="select-text">
        <div className="text-sm font-semibold text-[--ink] truncate">{companyName}</div>
        <div className="rounded-full bg-[--surface] border border-[--hairline] text-xs px-2 py-0.5 text-[--slate] mt-1 inline-block">
          {companyState.company.industry || "SaaS / B2B"}
        </div>
        <div className="text-xs text-[--steel] mt-1 block">
          {companyState.company.stage}
        </div>
      </div>
      
      <div className="my-4 h-px bg-[--hairline]" />

      {/* CTO Profile */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[--blue] text-white text-xs font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div>
            <div className="text-sm font-medium text-[--ink]">{companyState.company.playerName || "Alex Chen"}</div>
            <div className="text-xs text-[--steel]">{playerStats.level}</div>
          </div>
        </div>
        <Progress value={xpPercent} className="h-1 mt-2" />
        <div className="text-xs text-[--steel] mt-1 text-right">{currentXp} / 1000 XP</div>
      </div>

      <div className="my-4 h-px bg-[--hairline]" />

      {/* Company Health — 8 metrics */}
      <div className="space-y-3">
        <MetricBar label="Budget" value={companyState.metrics.budget} icon="💰" />
        <MetricBar label="Morale" value={companyState.metrics.teamMorale} icon="🎭" />
        <MetricBar label="Tech Debt" value={companyState.metrics.technicalDebt} icon="⚙️" invertColorLogic={true} />
        <MetricBar label="Velocity" value={companyState.metrics.productVelocity} icon="🚀" />
        <MetricBar label="CEO Trust" value={companyState.metrics.ceoRelationship} icon="🤝" />
        <MetricBar label="Customers" value={companyState.metrics.customerSatisfaction} icon="😊" />
        <MetricBar label="Security" value={companyState.metrics.securityPosture} icon="🔐" />
        <MetricBar label="Talent" value={companyState.metrics.talentPipeline} icon="🌱" />
      </div>

      <div className="my-4 h-px bg-[--hairline]" />

      {/* Active Flags */}
      <div>
        <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-2">
          Active Issues
        </div>
        {companyState.activeFlags.length > 0 ? (
          <div className="space-y-1">
            {companyState.activeFlags.map((flag, idx) => (
              <div
                key={idx}
                className="block truncate text-xs rounded-full bg-[--coral]/10 text-[--coral] px-2.5 py-1 text-center font-medium font-mono"
              >
                ⚠️ {flag.replaceAll("_", " ")}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[--stone] italic select-text">None — enjoy it while it lasts.</div>
        )}
      </div>

      <div className="my-4 h-px bg-[--hairline]" />

      {/* Week Timeline */}
      <div>
        <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-3">
          Quarter Progress
        </div>
        <WeekGrid week={companyState.company.week} />
      </div>
    </div>
  );

  return (
    <div className="bg-[--canvas] h-screen overflow-hidden flex flex-col font-sans select-none text-[--ink] relative">
      
      {/* MOBILE HEADER BAR */}
      <header className="md:hidden h-14 border-b border-[--hairline] bg-[--canvas]/90 backdrop-blur-md px-4 flex items-center justify-between z-30">
        <span className="font-semibold text-sm">CTO Simulator</span>
        <div className="flex gap-2">
          <Button variant="outline" size="xs" onClick={() => setShowMobileSidebar(!showMobileSidebar)}>
            {showMobileSidebar ? "Close Stats" : "View Stats"}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => {
            if (confirm("Reset current simulation?")) {
              resetGame();
              router.push("/");
            }
          }} className="w-8 h-8 rounded-full border border-[--hairline] text-xs">
            ✕
          </Button>
        </div>
      </header>

      {/* MOBILE SIDEBAR BOTTOM SHEET DRAWER */}
      {showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[--canvas] rounded-t-[32px] max-h-[85vh] overflow-y-auto p-6 border-t border-[--hairline]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-base">Dashboard Summary</span>
              <Button variant="ghost" size="xs" className="w-8 h-8 rounded-full bg-[--surface]" onClick={() => setShowMobileSidebar(false)}>
                ✕
              </Button>
            </div>
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* PRIMARY GAME SCREEN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_200px] h-full overflow-hidden">
        
        {/* LEFT SIDEBAR (DESKTOP) */}
        <aside className="hidden md:block h-full overflow-y-auto sticky top-0 border-r border-[--hairline] px-4 py-5 select-none bg-[--canvas]">
          {renderSidebar()}
        </aside>

        {/* CENTER PANEL */}
        <main className="overflow-y-auto px-4 md:px-8 py-6 w-full flex flex-col items-center">
          <div className="max-w-[680px] w-full">
            
            {/* Top Status Bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs text-[--steel]">
                Decision {decisionCount + 1}
              </div>

              <div className="flex items-center gap-2">
                {/* Mood badge */}
                <span className={`rounded-full text-xs font-semibold px-3 py-1 ${
                  companyState.companyMood === "thriving" ? "bg-green-100 text-green-700" :
                  companyState.companyMood === "stable" ? "bg-[--blue-200] text-[--blue-700]" :
                  companyState.companyMood === "tense" ? "bg-amber-100 text-amber-700" :
                  companyState.companyMood === "crisis" ? "bg-[--coral]/15 text-[--coral]" :
                  "bg-red-100 text-red-700 animate-pulse"
                }`}>
                  {companyState.companyMood.toUpperCase()}
                </span>

                <Button variant="outline" size="xs" onClick={() => setVolumeOn(!isVolumeOn)} className="px-3 py-1 text-xs">
                  {isVolumeOn ? "🔊 Volume" : "🔇 Muted"}
                </Button>
              </div>
            </div>

            {/* SCENARIO CARD */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 border border-[--hairline] rounded-[32px] h-[300px]">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-[--hairline] border-t-[--blue-deep]" />
                <p className="text-sm text-[--steel] mt-4 font-mono">Syncing technical alert logs...</p>
              </div>
            ) : currentScenario ? (
              <div className="bg-[--canvas] rounded-[32px] border border-[--hairline] overflow-hidden shadow-[0_0_22px_rgba(0,0,0,0.08)] relative animate-in slide-in-from-right-4 duration-300 ease-out">
                {/* Accent bar left */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[--blue]" style={{ backgroundColor: `var(--scene-${currentScenario.type})` }} />

                {/* CARD HEADER */}
                <div className="px-7 pt-6 pb-4 select-text">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScenarioBadge type={currentScenario.type} urgency={currentScenario.urgency} />
                    <div className="flex-1" />
                    
                    {/* Stakeholders watching list */}
                    {(currentScenario.stakeholdersWatching || ["CFO", "Director of Core Arch"]).map((sh, idx) => (
                      <span key={idx} className="text-xs text-[--steel] bg-[--surface] rounded-full px-2 py-0.5 border border-[--hairline]">
                        👁 {sh}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-[24px] font-semibold text-[--ink] leading-[1.3] mt-3">
                    {currentScenario.title}
                  </h2>

                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[--slate]">
                    <span>{channelEmojis[currentScenario.channel] || "💬"}</span>
                    <span>Via {currentScenario.channel.replaceAll("_", " ")} · {currentScenario.from}</span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="bg-[--surface-soft] px-7 py-5 select-text">
                  <div className="font-serif italic text-[15px] leading-[1.65] text-[--charcoal]">
                    <ExpandableText clamp={4} maxExpandedHeight="112px" text={currentScenario.body} />
                  </div>

                  {/* Attachment chips */}
                  {currentScenario.attachments && currentScenario.attachments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentScenario.attachments.map((file, idx) => (
                        <div key={idx} className="bg-[--surface] border border-[--hairline] rounded-[8px] text-xs px-3 py-1.5 flex items-center gap-1.5 font-mono">
                          📎 <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTO NOTE */}
                {currentScenario.context && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 px-7 py-4 select-text">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>🧠</span>
                      <span className="text-xs font-semibold text-amber-700 uppercase">CTO Note</span>
                    </div>
                    <div className="text-sm text-amber-900 leading-relaxed">
                      <ExpandableText clamp={2} text={currentScenario.context} />
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* CHOICES OPTIONS */}
            {currentScenario && !isLoading && (
              <div className="mt-6">
                <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-3">
                  Your Response
                </div>

                {/* Grid */}
                <div className="space-y-2">
                  {currentScenario.choices?.map((opt) => {
                    const isSelected = selectedChoiceId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectChoice(opt.id)}
                        className={`bg-[--canvas] border rounded-[16px] p-4 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-2 border-[--primary] bg-[--surface]"
                            : "border-[--hairline]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                            isSelected ? "bg-[--primary] text-white border border-[--primary]" : "bg-[--surface] border border-[--hairline] text-[--steel]"
                          }`}>
                            {opt.id}
                          </div>
                          <div className="flex-1 select-text">
                            <div className="text-sm font-semibold text-[--ink]">{opt.label}</div>
                            <div className="text-sm text-[--slate] mt-1 leading-relaxed">
                              <ExpandableText clamp={2} text={opt.description} />
                            </div>
                          </div>
                        </div>

                        {/* Tradeoffs */}
                        <div className="mt-2 pl-10 select-text">
                          <div className="text-xs text-[--stone] italic">
                            ⚖️ <ExpandableText clamp={1} text={opt.tradeoffs} />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Choice D - Custom Response */}
                  <div
                    onClick={() => handleSelectChoice("D")}
                    className={`bg-[--surface] border border-dashed rounded-[16px] p-4 cursor-pointer ${
                      selectedChoiceId === "D"
                        ? "border-[--primary] border-dashed"
                        : "border-[--hairline]"
                    }`}
                  >
                    {selectedChoiceId !== "D" ? (
                      <div className="flex items-center gap-2 text-sm text-[--slate]">
                        <span>✏️</span>
                        <span>Write your own response</span>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-200">
                        <div className="text-sm font-semibold text-[--ink]">Draft Custom Resolution</div>
                        <Textarea
                          placeholder="As CTO, I would..."
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          rows={4}
                          className="mt-2 w-full"
                        />
                        <div className="text-xs text-right text-[--steel] mt-1">
                          {customText.length} characters
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Decision Button */}
                <Button
                  variant="default"
                  className="w-full py-3 text-base h-auto mt-4"
                  disabled={!selectedChoiceId || isSubmitting}
                  onClick={handleExecuteDecision}
                >
                  {isSubmitting ? "Evaluating..." : "Submit Decision →"}
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT RAIL (DESKTOP) */}
        <aside className="hidden lg:block h-full overflow-y-auto sticky top-0 border-l border-[--hairline] px-4 py-5 select-none bg-[--canvas]">
          
          {/* This Week */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-2">
              Current Turn
            </div>
            <div className="rounded-full bg-[--surface] border border-[--hairline] text-xs px-2.5 py-1 text-[--slate] inline-block font-mono">
              Decision {decisionCount + 1}
            </div>
          </div>

          {/* Stakeholders */}
          <div className="mb-6 select-text">
            <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-3">
              Stakeholders
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getDotColor(companyState.metrics.ceoRelationship)}`} />
                <span className="text-xs text-[--charcoal] truncate">CEO (Sarah Jenkins)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getDotColor(companyState.metrics.budget)}`} />
                <span className="text-xs text-[--charcoal] truncate">CFO (Sarah Jenkins)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getDotColor(companyState.metrics.productVelocity)}`} />
                <span className="text-xs text-[--charcoal] truncate">CPO (Chief Product Officer)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getDotColor(100 - companyState.metrics.technicalDebt)}`} />
                <span className="text-xs text-[--charcoal] truncate">Director of Architecture</span>
              </div>
            </div>
          </div>

          {/* Recent Decisions */}
          {companyState.recentDecisions && companyState.recentDecisions.length > 0 && (
            <div className="mb-6 select-text">
              <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-3">
                Recent Decisions
              </div>
              <div className="space-y-3">
                {companyState.recentDecisions.slice(0, 3).map((dec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[--blue] mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-[--charcoal] line-clamp-1 leading-snug">
                        {dec}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Earned */}
          <div>
            <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-3">
              Achievements
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, idx) => {
                const badge = badges[idx];
                if (badge) {
                  const emoji = (badge.label || "🏆").split(" ")[0];
                  const label = (badge.label || "Award").split(" ").slice(1).join(" ");
                  return (
                    <div
                      key={idx}
                      className="bg-[--surface] rounded-[12px] p-2 text-center text-xl cursor-pointer hover:border border-[--hairline]"
                      title={`${label}: ${badge.reason.substring(0, 60)}`}
                    >
                      {emoji}
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="bg-[--hairline] rounded-[12px] p-2 text-[--stone] text-xl opacity-30 grayscale cursor-not-allowed"
                  >
                    🔒
                  </div>
                );
              })}
            </div>
          </div>

        </aside>
      </div>

      {/* EVALUATION MODAL */}
      <Dialog open={!!activeEvaluation} onOpenChange={() => {}}>
        {activeEvaluation && (
          <DialogContent className="max-w-lg rounded-[32px] p-8 gap-0 bg-[--canvas]">
            <DialogHeader className="mb-0">
              <div className="flex gap-2 mb-3 items-center">
                {/* Outcome badge */}
                <span className={`rounded-full text-xs font-semibold px-3 py-1 ${
                  activeEvaluation.newCompanyMood === "meltdown" || activeEvaluation.newCompanyMood === "crisis"
                    ? "bg-[--coral]/15 text-[--coral]"
                    : activeEvaluation.newCompanyMood === "tense"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[--success-bg] text-[--success-text]"
                }`}>
                  {activeEvaluation.newCompanyMood === "meltdown" || activeEvaluation.newCompanyMood === "crisis" ? "Costly Move" :
                   activeEvaluation.newCompanyMood === "tense" ? "Trade-off" : "Good Call"}
                </span>

                <span className="ml-auto text-sm font-semibold text-[--ink] font-mono">
                  ⚡ +{activeEvaluation.xpEarned} XP
                </span>
              </div>

              <DialogTitle className="text-[20px] font-semibold text-[--ink] leading-[1.4] line-clamp-2">
                {activeEvaluation.immediateOutcome.split(".")[0]}.
              </DialogTitle>
            </DialogHeader>

            {/* SCROLLABLE BODY */}
            <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
              <div className="text-sm text-[--charcoal] leading-relaxed max-h-[72px] overflow-y-auto">
                {activeEvaluation.immediateOutcome}
              </div>

              {activeEvaluation.rippleEffects && (
                <div className="text-xs text-[--slate] italic leading-relaxed max-h-[48px] overflow-y-auto">
                  ⟳ Down the line: {activeEvaluation.rippleEffects}
                </div>
              )}

              {/* METRIC DELTAS */}
              <div className="bg-[--surface] rounded-[16px] p-4">
                <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-3">
                  Impact on {companyName}
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeEvaluation.metricDeltas).map(([key, val]) => {
                    if (val === 0 || !val) return null;
                    const isPositive = val > 0;
                    // For Tech Debt: Positive change means debt increased (which is negative for company state).
                    // Invert label arrow sign mapping for tech debt to make it read logically to the player.
                    const isIncrease = val > 0;
                    const labelStr = key.replace(/([A-Z])/g, " $1");
                    
                    if (key === "technicalDebt") {
                      return (
                        <span
                          key={key}
                          className={`rounded-full text-xs font-semibold px-3 py-1 ${
                            isIncrease ? "bg-[--coral]/10 text-[--coral]" : "bg-[--success-bg] text-[--success-text]"
                          }`}
                        >
                          {isIncrease ? `↑ ${labelStr} +${val}` : `↓ ${labelStr} ${val}`}
                        </span>
                      );
                    }

                    return (
                      <span
                        key={key}
                        className={`rounded-full text-xs font-semibold px-3 py-1 ${
                          isPositive ? "bg-[--success-bg] text-[--success-text]" : "bg-[--coral]/10 text-[--coral]"
                        }`}
                      >
                        {isPositive ? `↑ ${labelStr} +${val}` : `↓ ${labelStr} ${val}`}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* XP LEVEL UP */}
              {xpPercent < 20 && playerStats.xp > 0 && (
                <div className="flex items-center gap-3">
                  <span className="bg-[--blue-200] text-[--blue-700] rounded-full text-xs font-semibold px-3 py-1">
                    Level Up! →
                  </span>
                  <Progress value={xpPercent} className="flex-1 h-1.5" />
                  <span className="text-xs text-[--steel]">{playerStats.level}</span>
                </div>
              )}

              {/* BADGE EARNED BLOCK */}
              {activeEvaluation.badge && (
                <div className="bg-[--primary] rounded-[16px] p-4 flex items-center gap-3 text-white">
                  <div className="text-3xl">
                    {(activeEvaluation.badge.label || "🏆").split(" ")[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/60">New Badge!</div>
                    <div className="text-sm font-semibold text-white line-clamp-1">
                      {(activeEvaluation.badge.label || "Award").split(" ").slice(1).join(" ")}
                    </div>
                    <div className="text-xs text-white/70 mt-0.5 line-clamp-1">
                      {activeEvaluation.badge.reason}
                    </div>
                  </div>
                </div>
              )}

              {/* CTO INSIGHT */}
              {activeEvaluation.ctoInsight && (
                <div className="border-l-4 border-[--blue] pl-4">
                  <span className="text-xs font-semibold text-[--steel] block">💡 CTO Insight</span>
                  <div className="max-h-[60px] overflow-y-auto mt-1 font-serif italic text-sm text-[--charcoal] leading-relaxed">
                    {activeEvaluation.ctoInsight}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6 pt-0">
              <Button variant="default" className="w-full py-3 text-base h-auto" onClick={closeEvaluation}>
                Next Scenario →
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* WEEKLY DIGEST MODAL */}
      <Dialog open={!!weeklyDigest}>
        {weeklyDigest && (
          <DialogContent className="max-w-lg rounded-[32px] p-8 gap-0 bg-[--canvas]">
            <DialogHeader>
              <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-2">
                📰 Week {companyState.company.week - 1} Wrap-Up
              </div>
              <DialogTitle className="text-[20px] font-semibold text-[--ink] leading-[1.4] line-clamp-1">
                {weeklyDigest.headline}
              </DialogTitle>
            </DialogHeader>

            {/* SCROLLABLE CONTENT */}
            <div className="mt-5 max-h-[380px] overflow-y-auto pr-1 space-y-4">
              <div className="text-sm text-[--charcoal] leading-relaxed max-h-[72px] overflow-y-auto select-text">
                {weeklyDigest.summary}
              </div>

              {/* Win/Miss Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[--success-bg] rounded-[12px] p-3">
                  <div className="text-xs font-semibold text-[--success-text] mb-1">
                    ✅ Biggest Win
                  </div>
                  <div className="text-xs text-[--charcoal] leading-relaxed line-clamp-2 select-text">
                    {weeklyDigest.biggestWin}
                  </div>
                </div>

                <div className="bg-[--coral]/8 rounded-[12px] p-3">
                  <div className="text-xs font-semibold text-[--coral] mb-1">
                    ⚠️ Missed
                  </div>
                  <div className="text-xs text-[--charcoal] leading-relaxed line-clamp-2 select-text">
                    {weeklyDigest.biggestMiss}
                  </div>
                </div>
              </div>

              {/* Team Pulse */}
              <div className="bg-[--surface] rounded-[12px] p-3 select-text">
                <div className="text-xs text-[--steel] mb-1">
                  Anonymous Slack
                </div>
                <div className="font-serif italic text-sm text-[--charcoal] leading-relaxed line-clamp-2">
                  "{weeklyDigest.teamPulse}"
                </div>
              </div>

              {/* CEO Outlook */}
              <div className="flex items-start gap-2 select-text">
                <div className="w-6 h-6 rounded-full bg-[--coral] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-xs text-[--steel]">Your CEO:</div>
                  <div className="text-xs text-[--charcoal] leading-relaxed line-clamp-1">
                    {weeklyDigest.ceoThought}
                  </div>
                </div>
              </div>

              {/* Looming Challenge */}
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-[12px] px-3 py-2 select-text">
                <div className="text-xs font-semibold text-amber-700">
                  Next week:
                </div>
                <div className="text-xs text-amber-900 mt-0.5 line-clamp-2">
                  {weeklyDigest.upcomingPressure}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="default" className="w-full py-3 text-base h-auto" onClick={closeWeeklyDigest}>
                Continue to Week {companyState.company.week} →
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

    </div>
  );
}
