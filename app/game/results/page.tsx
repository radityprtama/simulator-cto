"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { motion } from "motion/react";
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const getEndingVisuals = () => {
    const companyName = companyState?.company?.name || "Your Startup";
    switch (gameOverType) {
      case "win":
        return {
          title: "Simulation Passed",
          accentColor: "border-[#c2ef4e]",
          glowColor: "bg-[#c2ef4e]/5",
          tag: "🟢 EXCELLENT TECHNICAL OUTCOME",
          message: `${companyName}'s engineering pipeline has successfully survived Q3 on an updated scalable architecture. The board has formally recommended you for option vesting.`,
        };
      case "fired":
        return {
          title: "Contract Terminated",
          accentColor: "border-[#fa7faa]",
          glowColor: "bg-[#fa7faa]/5",
          tag: "🔴 BOARD INTERVENTION TRIGGERED",
          message: "You have been let go. Corporate leadership has authorized an interim engineering consult group to replace you and salvage the roadmap deliverables.",
        };
      case "bankruptcy":
        return {
          title: "Sovereign Restructuring",
          accentColor: "border-amber-500",
          glowColor: "bg-amber-500/5",
          tag: "🟡 FINANCIAL WIND-UP SEQUENCE",
          message: `Runway dissolution. Cash runway hit 0%. ${companyName} has filed for capital reorganization, freezing and cutting headcount by 100%.`,
        };
      default:
        return {
          title: "Systemic Collapse",
          accentColor: "border-[#fa7faa]",
          glowColor: "bg-[#fa7faa]/5",
          tag: "🔴 THREE CRITICAL FAILURES",
          message: `Your tenure came to a screeching halt. With three critical variables hit 0 simultaneously, ${companyName}'s engineering division completely collapsed.`,
        };
    }
  };

  const ending = getEndingVisuals();
  const companyNameUpper = (companyState?.company?.name || "Your Startup").toUpperCase();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[#100a1c] p-6 text-slate-100 font-sans selection:bg-[#c2ef4e]/30">
      
      {/* Background neon grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#362d590a_1px,transparent_1px),linear-gradient(to_bottom,#362d590a_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className={`absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full ${ending.glowColor} blur-[120px] pointer-events-none`} />

      <div className="z-10 w-full max-w-4xl space-y-8 my-10 select-none">
        
        {/* Cinematic Title Banner */}
        <div className="text-center space-y-2">
          <span className="rounded bg-[#c2ef4e]/10 px-2.5 py-1 font-mono text-[9px] font-black text-[#c2ef4e] tracking-[0.2em] border border-[#c2ef4e]/20 uppercase inline-block">
            {companyNameUpper} EXECUTIVE CORRIDOR DEBRIEFING
          </span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-4xl sm:text-6xl font-extrabold text-white uppercase tracking-tight pt-2"
          >
            CTO <span className="bg-[#c2ef4e] text-[#150f23] px-3 py-1 pb-2 rounded inline-block text-3xl sm:text-5xl font-black ml-2 animate-pulse tracking-wide">DEBRIEF</span>
          </motion.h1>
        </div>

        {/* Ending Outcome Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card id="results-outcome-card" className="border-[#362d59] bg-[#150f23]/95 p-6 md:p-8 relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] block mb-1">
                  {ending.tag}
                </span>
                <h2 className="font-display text-3xl font-extrabold text-white uppercase tracking-tight">
                  {ending.title}
                </h2>
                <p className="mt-4 font-sans text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {gameOverReason || ending.message}
                </p>
              </div>

              <Button
                id="reset-core-registry-btn"
                onClick={handleRestart}
                className="group flex items-center justify-center gap-2 bg-[#c2ef4e] hover:bg-white text-[#150f23] font-black tracking-wider uppercase text-xs h-12 px-6"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Core Registry
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Career Competencies Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Dashboard Left Column: Score distribution */}
          <Card className="border-[#362d59] bg-[#150f23] p-6 space-y-4 text-slate-100">
            <h3 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase select-none block-title border-b border-[#362d59]/40 pb-2">Competence Profile</h3>
            
            <div className="space-y-4 pt-2">
              {/* Score Category detail */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">🧠 Strategic Planning</span>
                  <span className="text-white font-bold">{playerStats.scores.strategic}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <div className="h-full rounded-sm bg-[#fa7faa]" style={{ width: `${playerStats.scores.strategic}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">❤️ Engineering Morale</span>
                  <span className="text-white font-bold">{playerStats.scores.people}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <div className="h-full rounded-sm bg-[#c2ef4e]" style={{ width: `${playerStats.scores.people}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">⚙️ System Architecture</span>
                  <span className="text-white font-bold">{playerStats.scores.technical}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <div className="h-full rounded-sm bg-[#fa7faa]" style={{ width: `${playerStats.scores.technical}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">💰 Financial Acumen</span>
                  <span className="text-white font-bold">{playerStats.scores.business}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <div className="h-full rounded-sm bg-[#c2ef4e]" style={{ width: `${playerStats.scores.business}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">🛡️ Vulnerability Guard</span>
                  <span className="text-white font-bold">{playerStats.scores.risk}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <div className="h-full rounded-sm bg-[#fa7faa]" style={{ width: `${playerStats.scores.risk}%` }} />
                </div>
              </div>
            </div>

            {/* Profile Level */}
            <div className="border-t border-[#362d59] pt-4 flex justify-between items-center bg-[#1a112c] -mx-6 -mb-6 p-6 rounded-b-xl">
              <div>
                <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block mb-0.5 tracking-wider">CAREER STANDING LEVEL</span>
                <span className="font-display text-lg font-black text-[#c2ef4e] uppercase tracking-tight">{playerStats.level}</span>
              </div>
              <div className="rounded bg-[#150f23] border border-[#362d59] px-3.5 py-1.5 font-mono text-xs font-bold text-slate-300 uppercase tracking-wide">
                {playerStats.xp} XP ACCUMULATED
              </div>
            </div>

          </Card>

          {/* Dashboard Right Column: Earned Badges summaries */}
          <Card className="border-[#362d59] bg-[#150f23] p-6 flex flex-col justify-between text-slate-100">
            <div>
              <h3 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase select-none block-title border-b border-[#362d59]/40 pb-2">Unlocked Achievements</h3>
              
              {badges.length > 0 ? (
                <div className="grid gap-3 pt-4 max-h-[220px] overflow-y-auto">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex items-start gap-3 rounded-xl border border-[#362d59] bg-[#1a112c]/65 p-3 hover:bg-[#1a112c] hover:border-[#6a5fc1] transition-all">
                      <span className="text-xl flex-shrink-0 mt-0.5">{(badge.label || "").split(" ")[0]}</span>
                      <div>
                        <h4 className="font-display font-bold text-xs text-white uppercase leading-snug tracking-wide">{(badge.label || "").split(" ").slice(1).join(" ")}</h4>
                        <p className="font-sans text-[10px] text-slate-400 leading-normal mt-0.5">{badge.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[10px] text-[#79628c] leading-relaxed italic pt-4">
                  No professional corporate badges were unlocked over this strategic tenure. Maintain higher morale bounds and mitigate outages in your next run.
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#362d59]/40 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[9px] text-[#fa7faa] font-bold uppercase tracking-wider">HEADCOUNT END: {companyState.company.headcount} EMP</span>
              <span className="font-mono text-[9px] text-[#fa7faa] font-bold uppercase tracking-wider">QUARTER FIN: Week {companyState.company.week - 1}</span>
            </div>
          </Card>

        </div>

        {/* Timeline historical decisions log tracker */}
        {scenarioHistory.length > 0 && (
          <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-6 space-y-4">
            <h3 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase select-none border-b border-[#362d59]/40 pb-2">Tenure Historical Journal</h3>
            
            <div className="space-y-4 pt-2">
              {scenarioHistory.map((historyItem, idx) => (
                <div
                  key={historyItem.id}
                  className="flex items-start gap-4.5 border-l-2 border-[#362d59] pl-4 py-1"
                >
                  <div className="rounded bg-[#1a112c] border border-[#362d59] px-2.5 py-1.5 font-mono text-[9px] font-bold text-slate-300 text-center flex-shrink-0 min-w-16">
                    Turn {scenarioHistory.length - idx}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-indigo-150 uppercase tracking-wide">{historyItem.title}</h4>
                    <span className="text-[9px] font-mono font-bold text-[#fa7faa] uppercase select-none tracking-wider">Presented By: {historyItem.from}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
