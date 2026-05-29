"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { VibrantCard } from "@/components/vibrant-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const handleRestart = () => {
    resetGame();
    router.push("/");
  };

  const win = gameOverType === "win";
  
  // Calculate average score
  const finalScore = Math.round(
    (playerStats.scores.strategic +
      playerStats.scores.people +
      playerStats.scores.technical +
      playerStats.scores.business +
      playerStats.scores.risk) /
      5
  );

  // Outcome details based on gameOverType
  const getOutcomeDetails = () => {
    if (gameOverType === "win") {
      return {
        badgeText: "Quarter Complete",
        badgeClass: "bg-green-500 text-white border-0",
        headline: (
          <h1 className="text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] text-white">
            You survived.
          </h1>
        ),
      };
    } else if (gameOverType === "fired" || gameOverType === "lose") {
      return {
        badgeText: "Terminated",
        badgeClass: "bg-[--coral] text-white border-0",
        headline: (
          <h1 className="text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] text-white">
            You've been <br />
            <span className="text-[--coral]">replaced.</span>
          </h1>
        ),
      };
    } else {
      return {
        badgeText: "Emergency Mode",
        badgeClass: "bg-[--blue] text-white border-0",
        headline: (
          <h1 className="text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] text-white">
            Emergency <br />
            <span className="text-[--blue]">Protocol.</span>
          </h1>
        ),
      };
    }
  };

  const outcome = getOutcomeDetails();

  // Helper for metrics color in the ending grid
  const getMetricCellColor = (key: string, val: number) => {
    if (key === "technicalDebt") {
      // For Tech Debt: low is good, high is bad
      if (val < 40) return "text-white";
      if (val <= 60) return "text-amber-400";
      return "text-[--coral]";
    }
    if (val > 60) return "text-white";
    if (val >= 40) return "text-amber-400";
    return "text-[--coral]";
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const shareText = `I scored ${finalScore} XP as ${playerStats.level} in the CTO Simulator! Can you survive one quarter in the hot seat?`;
      navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard!");
    }
  };

  return (
    <main className="bg-[--primary] min-h-screen font-sans text-white select-none relative">
      
      {/* Container */}
      <div className="max-w-[720px] mx-auto px-6 py-16 flex flex-col justify-center h-full min-h-screen">
        
        {/* OUTCOME HEADER */}
        <div>
          <Badge className={`rounded-full text-xs font-semibold px-4 py-1.5 mb-6 uppercase ${outcome.badgeClass}`}>
            {outcome.badgeText}
          </Badge>
          
          {outcome.headline}

          <p className="mt-4 text-[18px] text-white/60 leading-relaxed max-w-[480px] max-h-[80px] overflow-y-auto select-text">
            {gameOverReason || "Your simulation session has ended. Review your scores and options."}
          </p>
        </div>

        {/* SCORE CARD — VibrantCard */}
        <div className="mt-8">
          <VibrantCard color={win ? "blue" : "coral"}>
            <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">Final Score</div>
            <div className="text-[56px] font-semibold leading-[1.1] text-white mt-1">{finalScore}</div>
            
            <div className="border-t border-white/20 my-5" />

            <div className="grid grid-cols-1 gap-3">
              {/* Strategic */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-32 flex-shrink-0">Strategic</span>
                <Progress value={playerStats.scores.strategic} className="flex-1 h-1.5 bg-white/20" />
                <span className="text-sm font-semibold text-white w-8 text-right">{playerStats.scores.strategic}</span>
              </div>

              {/* People */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-32 flex-shrink-0">People</span>
                <Progress value={playerStats.scores.people} className="flex-1 h-1.5 bg-white/20" />
                <span className="text-sm font-semibold text-white w-8 text-right">{playerStats.scores.people}</span>
              </div>

              {/* Technical */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-32 flex-shrink-0">Technical</span>
                <Progress value={playerStats.scores.technical} className="flex-1 h-1.5 bg-white/20" />
                <span className="text-sm font-semibold text-white w-8 text-right">{playerStats.scores.technical}</span>
              </div>

              {/* Business */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-32 flex-shrink-0">Business</span>
                <Progress value={playerStats.scores.business} className="flex-1 h-1.5 bg-white/20" />
                <span className="text-sm font-semibold text-white w-8 text-right">{playerStats.scores.business}</span>
              </div>

              {/* Risk */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-32 flex-shrink-0">Risk</span>
                <Progress value={playerStats.scores.risk} className="flex-1 h-1.5 bg-white/20" />
                <span className="text-sm font-semibold text-white w-8 text-right">{playerStats.scores.risk}</span>
              </div>
            </div>
          </VibrantCard>
        </div>

        {/* SUMMARY TILES */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {/* Decisions */}
          <div className="bg-white/8 border border-white/10 rounded-[20px] p-4 text-center">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-[20px] font-semibold text-white leading-tight">{scenarioHistory.length} Decisions</div>
            <div className="text-xs text-white/50 mt-1 line-clamp-1">Interventions Made</div>
          </div>

          {/* Weeks */}
          <div className="bg-white/8 border border-white/10 rounded-[20px] p-4 text-center">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-[20px] font-semibold text-white leading-tight">Week {companyState.company.week - 1}</div>
            <div className="text-xs text-white/50 mt-1 line-clamp-1">Quarter Completed</div>
          </div>

          {/* Badges */}
          <div className="bg-white/8 border border-white/10 rounded-[20px] p-4 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-[20px] font-semibold text-white leading-tight">{badges.length} Badges</div>
            <div className="text-xs text-white/50 mt-1 line-clamp-1">Achievements Unlocked</div>
          </div>
        </div>

        {/* FINAL METRICS */}
        <div className="bg-white/5 rounded-[20px] p-5 mt-4 select-text">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
            Final Company State
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Metric Cell 1 */}
            <div className="text-center">
              <div className={`text-[18px] font-semibold leading-tight ${getMetricCellColor("budget", companyState.metrics.budget)}`}>
                {companyState.metrics.budget}%
              </div>
              <div className="text-xs text-white/40 mt-0.5 line-clamp-1">Budget</div>
            </div>

            {/* Metric Cell 2 */}
            <div className="text-center">
              <div className={`text-[18px] font-semibold leading-tight ${getMetricCellColor("teamMorale", companyState.metrics.teamMorale)}`}>
                {companyState.metrics.teamMorale}%
              </div>
              <div className="text-xs text-white/40 mt-0.5 line-clamp-1">Morale</div>
            </div>

            {/* Metric Cell 3 */}
            <div className="text-center">
              <div className={`text-[18px] font-semibold leading-tight ${getMetricCellColor("technicalDebt", companyState.metrics.technicalDebt)}`}>
                {companyState.metrics.technicalDebt}%
              </div>
              <div className="text-xs text-white/40 mt-0.5 line-clamp-1">Tech Debt</div>
            </div>

            {/* Metric Cell 4 */}
            <div className="text-center">
              <div className={`text-[18px] font-semibold leading-tight ${getMetricCellColor("productVelocity", companyState.metrics.productVelocity)}`}>
                {companyState.metrics.productVelocity}%
              </div>
              <div className="text-xs text-white/40 mt-0.5 line-clamp-1">Velocity</div>
            </div>
          </div>
        </div>

        {/* CTA ROW */}
        <div className="mt-10 flex gap-3">
          <Button
            className="flex-1 bg-white text-[--primary] rounded-full py-3 text-base font-semibold hover:bg-white/90 cursor-pointer h-auto"
            onClick={handleRestart}
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            className="flex-1 border-white/30 text-white rounded-full py-3 text-base hover:bg-white/10 cursor-pointer h-auto"
            onClick={handleShare}
          >
            Share Results
          </Button>
        </div>

      </div>
    </main>
  );
}
