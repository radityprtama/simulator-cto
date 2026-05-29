"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  Cpu,
  Users,
  BarChart3,
  ShieldAlert,
  Award,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Flame,
  AlertOctagon,
  FileText,
  Volume2,
  VolumeX,
  RefreshCw,
  Mail,
  MessageSquare,
  Network,
  Phone,
  FilePieChart,
  Code2,
  Lock,
  Compass,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Web Audio API custom synthesizer for retro notifications
const playSynthSound = (type: "click" | "success" | "warning" | "levelUp", enabled: boolean) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "warning") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "levelUp") {
      osc.type = "square";
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
      osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    console.warn("Audio Context blocked or unsupported:", e);
  }
};

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
  const [showBriefing, setShowBriefing] = useState<boolean>(true);
  const [previousMetrics, setPreviousMetrics] = useState<typeof companyState.metrics>(() => ({ ...companyState.metrics }));

  // Trigger sound cues on game interaction events
  useEffect(() => {
    if (activeEvaluation) {
      const positiveDeltasCount = Object.values(activeEvaluation.metricDeltas).filter(v => v && v > 0).length;
      if (positiveDeltasCount > 2) {
        playSynthSound("success", isVolumeOn);
      } else {
        playSynthSound("warning", isVolumeOn);
      }
    }
  }, [activeEvaluation, isVolumeOn]);

  useEffect(() => {
    if (isGameOver) {
      playSynthSound("warning", isVolumeOn);
      router.push("/game/results");
    }
  }, [isGameOver, router, isVolumeOn]);

  useEffect(() => {
    if (currentScenario && !isLoading) {
      playSynthSound("click", isVolumeOn);
    }
  }, [currentScenario, isLoading, isVolumeOn]);

  // Load first scenario on mount if none is active
  useEffect(() => {
    if (!currentScenario && !isLoading && !isGameOver && !activeEvaluation && !weeklyDigest) {
      loadNextScenario();
    }
  }, [currentScenario, isLoading, isGameOver, activeEvaluation, weeklyDigest, loadNextScenario]);

  const handleSelectChoice = (id: string) => {
    setSelectedChoiceId(id);
    playSynthSound("click", isVolumeOn);
  };

  const handleExecuteDecision = async () => {
    if (!selectedChoiceId) return;
    setPreviousMetrics({ ...companyState.metrics });
    await submitChoice(selectedChoiceId, selectedChoiceId === "D" ? customText : "");
    setSelectedChoiceId(null);
    setCustomText("");
  };

  const handleNextTurnAfterEvaluation = async () => {
    await closeEvaluation();
  };

  const handleNextTurnAfterDigest = () => {
    closeWeeklyDigest();
  };

  // Metric color maps helper
  const getProgressColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value > 75) return "bg-[#fa7faa] shadow-[#fa7faa]/20";
      if (value > 50) return "bg-amber-500 shadow-amber-500/20";
      return "bg-[#c2ef4e] shadow-[#c2ef4e]/20";
    } else {
      if (value < 30) return "bg-[#fa7faa] shadow-[#fa7faa]/20 animate-pulse";
      if (value < 55) return "bg-amber-400 shadow-amber-500/20";
      return "bg-[#c2ef4e] shadow-[#c2ef4e]/20";
    }
  };

  const getMetricTextColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value > 75) return "text-[#fa7faa] font-bold";
      if (value > 50) return "text-amber-400";
      return "text-[#c2ef4e]";
    } else {
      if (value < 30) return "text-[#fa7faa] font-bold animate-pulse";
      if (value < 55) return "text-amber-400";
      return "text-[#c2ef4e]";
    }
  };

  // Scenario template channel indicators
  const getChannelStyles = (channel: string) => {
    switch (channel) {
      case "slack":
        return {
          headerBg: "bg-[#4A154B]",
          borderColor: "border-fuchsia-850",
          accentColor: "text-fuchsia-300",
          icon: MessageSquare,
          name: "Slack Secure Channel",
        };
      case "email":
        return {
          headerBg: "bg-[#150f23] border-b border-[#362d59]",
          borderColor: "border-[#362d59]",
          accentColor: "text-blue-400",
          icon: Mail,
          name: `${companyState.company.name} Exchange Mail`,
        };
      case "meeting":
        return {
          headerBg: "bg-blue-950",
          borderColor: "border-[#362d59]",
          accentColor: "text-blue-200",
          icon: Network,
          name: "Briefing Room Meeting",
        };
      case "phone_call":
        return {
          headerBg: "bg-emerald-950",
          borderColor: "border-emerald-800",
          accentColor: "text-emerald-400",
          icon: Phone,
          name: "Direct Operational Line",
        };
      default:
        return {
          headerBg: "bg-neutral-900",
          borderColor: "border-slate-800",
          accentColor: "text-slate-400",
          icon: FilePieChart,
          name: "Weekly Executive Audit",
        };
    }
  };

  const activeChannel = currentScenario ? getChannelStyles(currentScenario.channel) : null;

  return (
    <div className="relative min-h-screen bg-[#1f1633] text-slate-100 font-sans selection:bg-[#c2ef4e]/30">
      {/* Background ambient grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#362d5930_1px,transparent_1px),linear-gradient(to_bottom,#362d5930_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#fa7faa05_1px,transparent_1.5px)] bg-[size:24px_24px] opacity-70" />

      {/* Main Container Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#362d59] bg-[#150f23]/95 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-[#c2ef4e] text-[#150f23] px-3 py-1 font-display font-extrabold text-[10px] tracking-widest uppercase">
            {companyState.company.name.toUpperCase()} CTO SECURE CONSOLE
          </div>
          <p className="hidden font-mono text-[10px] text-slate-500 sm:block tracking-wide">
            STATION_ID // C_RUN-X9 // ADDR: 0x3000
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          <Button
            id="volume-btn"
            variant="outline"
            onClick={() => setVolumeOn(!isVolumeOn)}
            className="h-8 w-8 p-0 border-[#362d59] bg-[#150f23]/60 text-slate-400 hover:border-[#c2ef4e] hover:text-[#c2ef4e]"
          >
            {isVolumeOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button
            id="reset-btn"
            variant="outline"
            onClick={() => {
              if (confirm("Reset current simulation progress? This clears everything.")) {
                resetGame();
                router.push("/");
              }
            }}
            className="flex items-center gap-1.5 border-[#362d59] bg-[#150f23]/30 h-8 px-3 font-mono text-[10px] text-slate-400 hover:border-[#fa7faa] hover:text-[#fa7faa]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            RESET
          </Button>
        </div>
      </header>

      {/* Primary Dashboard Layout Grid */}
      <div className="grid min-h-[calc(screen-16)] grid-cols-1 lg:grid-cols-12 gap-5 p-5">
        
        {/* Left Sidebar (Col 1-3): Live Metrics Dashboard */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-5 backdrop-blur-md">
            
            {/* Business Card Headline */}
            <div className="border-b border-[#362d59]/50 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-white tracking-tight uppercase">{companyState.company.name}</h2>
                <span className="rounded bg-[#c2ef4e]/10 px-2 py-0.5 font-mono text-[9px] font-black text-[#c2ef4e] tracking-wider uppercase border border-[#c2ef4e]/20">
                  {companyState.companyMood}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-400">{companyState.company.stage}</p>
              
              {/* Turn indicator */}
              <div className="mt-4 flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Timeline Progress:</span>
                <span className="text-[#c2ef4e] font-extrabold tracking-wider">Week {companyState.company.week} of 12</span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-4 pt-4">
              <h3 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase">Core Indicators</h3>
              
              {/* METRIC: Budget */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    🪙 Budgets / Runway
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.budget)}>
                    {companyState.metrics.budget}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.budget}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.budget)}`}
                  />
                </div>
                {companyState.metrics.budget < 30 && (
                  <p className="font-mono text-[9px] text-[#fa7faa] flex items-center gap-1 font-bold">
                    <AlertOctagon className="h-3 w-3 animate-bounce" /> Low runway. Expense audit triggered.
                  </p>
                )}
              </div>

              {/* METRIC: CEO Relationship */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    👔 Board & CEO Trust
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.ceoRelationship)}>
                    {companyState.metrics.ceoRelationship}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.ceoRelationship}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.ceoRelationship)}`}
                  />
                </div>
                {companyState.metrics.ceoRelationship < 30 && (
                  <p className="font-mono text-[9px] text-[#fa7faa] flex items-center gap-1 font-bold">
                    <AlertOctagon className="h-3 w-3" /> Incipient vote of no confidence looming.
                  </p>
                )}
              </div>

              {/* METRIC: Team Morale */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    ❤️ Engineer Morale
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.teamMorale)}>
                    {companyState.metrics.teamMorale}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.teamMorale}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.teamMorale)}`}
                  />
                </div>
                {companyState.metrics.teamMorale < 30 && (
                  <p className="font-mono text-[9px] text-[#fa7faa] flex items-center gap-1 font-bold">
                    <Flame className="h-3 w-3 animate-pulse" /> Engineering burn-out spike / Glassdoor threat.
                  </p>
                )}
              </div>

              {/* METRIC: Technical Debt */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    ⚙️ Technical Legacy Debt
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.technicalDebt, true)}>
                    {companyState.metrics.technicalDebt}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.technicalDebt}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.technicalDebt, true)}`}
                  />
                </div>
                {companyState.metrics.technicalDebt > 80 && (
                  <p className="font-mono text-[9px] text-[#fa7faa] flex items-center gap-1 font-bold">
                    <AlertOctagon className="h-3 w-3" /> Fragile monolith. Outage probability high.
                  </p>
                )}
              </div>

              {/* METRIC: Product Velocity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    ⚡ Delivery Velocity
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.productVelocity)}>
                    {companyState.metrics.productVelocity}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.productVelocity}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.productVelocity)}`}
                  />
                </div>
              </div>

              {/* METRIC: Security Posture */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    🔒 Security Compliance
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.securityPosture)}>
                    {companyState.metrics.securityPosture}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.securityPosture}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.securityPosture)}`}
                  />
                </div>
              </div>

              {/* METRIC: Talent Pipeline */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    📞 Talent Recruitment
                  </span>
                  <span className={getMetricTextColor(companyState.metrics.talentPipeline)}>
                    {companyState.metrics.talentPipeline}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#1a112c]/80 border border-[#362d59]/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${companyState.metrics.talentPipeline}%` }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className={`h-full rounded-sm ${getProgressColor(companyState.metrics.talentPipeline)}`}
                  />
                </div>
              </div>

              {/* METRIC: Customer Satisfaction */}
              <div className="space-y-1.5 border-t border-[#362d59]/40 pt-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">⭐ Client Satisfaction</span>
                  <span className="text-white font-extrabold text-[#c2ef4e]">{companyState.metrics.customerSatisfaction}%</span>
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* Center Work Station (Col 4-9): Main Scenario Feed */}
        <section className="col-span-1 lg:col-span-6 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            
            {/* Trigger loading skeleton */}
            {isLoading ? (
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col items-center justify-center rounded-xl border border-slate-900 bg-slate-950/40 p-12 text-center"
              >
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
                <h4 className="mt-6 font-display text-lg font-bold text-white">GENERATE NEXT FIRE-FIGHT</h4>
                <p className="mt-2 font-mono text-xs text-slate-500 max-w-sm">
                  Consulting server-side logs and compiling operational state variables using gemini-3.5-flash...
                </p>
                
                <div className="mt-8 space-y-2.5 w-full max-w-md">
                  <div className="h-4 rounded bg-slate-900/80 animate-pulse w-3/4 mx-auto" />
                  <div className="h-3 rounded bg-slate-900/80 animate-pulse w-5/6 mx-auto" />
                  <div className="h-3 rounded bg-slate-900/80 animate-pulse w-2/3 mx-auto" />
                </div>
              </motion.div>
            ) : currentScenario ? (
              <motion.div
                key={currentScenario.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className={`flex flex-col rounded-xl border-[#362d59] bg-[#150f23]/95 overflow-hidden backdrop-blur shadow-2xl shadow-black/40 border`}
              >
                {/* Scenario Header based on channel */}
                <div className={`p-4 flex items-center justify-between ${activeChannel?.headerBg} border-b border-[#362d59]`}>
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-[#1a112c] p-1.5 border border-[#362d59]">
                      {activeChannel && React.createElement(activeChannel.icon, { className: "h-5 w-5 text-[#c2ef4e]" })}
                    </div>
                    <div>
                      <span className="font-mono text-[9px] tracking-widest text-[#fa7faa] uppercase font-bold">INCOMING DESK TELEMETRY</span>
                      <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-tight">{activeChannel?.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#1a112c] border border-[#362d59] px-2.5 py-0.5 font-mono text-[9px] text-slate-300 font-bold uppercase">
                      From: {currentScenario.from}
                    </span>
                    <span className={`rounded px-2.5 py-0.5 font-mono text-[9px] font-black uppercase ${
                      currentScenario.urgency === "critical" ? "bg-[#fa7faa] text-[#150f23] animate-pulse" :
                      currentScenario.urgency === "high" ? "bg-amber-500/20 text-amber-350 border border-amber-500/30" : "bg-[#1a112c] text-slate-400"
                    }`}>
                      {currentScenario.urgency}
                    </span>
                  </div>
                </div>

                {/* Scenario Body Section */}
                <div className="p-6 space-y-4">
                  <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug uppercase">
                    {currentScenario.title}
                  </h1>

                  {/* Serif Font Style for the actual workplace scenario message to make it feel extremely authentic */}
                  <div className="font-serif text-[15px] leading-relaxed text-slate-200 space-y-3.5 border-l-2 border-[#fa7faa] pl-4 py-1 italic">
                    {(currentScenario.body || "").split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Private Confidential Note */}
                  {currentScenario.context && (
                    <div className="rounded bg-[#6a5fc1]/5 border border-[#362d59] p-3.5">
                      <div className="flex items-start gap-2.5">
                        <Lightbulb className="h-4.5 w-4.5 text-[#c2ef4e] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[10px] uppercase text-[#c2ef4e] font-bold block mb-0.5 tracking-wider"> Confidential CTO Insider Note</span>
                          <p className="font-sans text-xs text-slate-300 leading-relaxed">{currentScenario.context}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optional Attachments lists */}
                  {currentScenario.attachments && currentScenario.attachments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#362d59]/50">
                      <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-2 font-bold select-none">STATION_FILES_ATTACHED ({currentScenario.attachments.length})</span>
                      <div className="flex flex-wrap gap-2">
                        {currentScenario.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 rounded bg-[#1a112c] border border-[#362d59] px-3 py-1.5 text-xs text-slate-300 tracking-wide font-mono hover:text-white transition-colors">
                            <FileText className="h-3.5 w-3.5 text-[#6a5fc1] flex-shrink-0" />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Choices Interface Selection Grid */}
                <div className="bg-[#150f23]/98 border-t border-[#362d59] p-5 space-y-4">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-[#fa7faa] uppercase font-bold">CHOOSE INTERVENTION DIRECTIVE:</span>
                  
                  <div className="grid gap-3.5">
                    {(currentScenario as any).choices?.map((opt: any) => {
                      const isSelected = selectedChoiceId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectChoice(opt.id)}
                          className={`relative flex flex-col items-start rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "border-[#c2ef4e] bg-[#1a112c] shadow shadow-[#c2ef4e]/10 ring-1 ring-[#c2ef4e]/30"
                              : "border-[#362d59] bg-[#150f23]/60 hover:border-[#6a5fc1] hover:bg-[#150f23]"
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-bold ${
                                isSelected ? "bg-[#c2ef4e] text-[#150f23]" : "bg-[#1a112c] text-indigo-200 border border-[#362d59]"
                              }`}>
                                {opt.id}
                              </span>
                              <h5 className="font-display font-bold text-sm text-white leading-tight">{opt.label}</h5>
                            </div>
                            <div className={`h-2.5 w-2.5 rounded-full border border-[#362d59] ${isSelected ? "bg-[#c2ef4e] border-[#c2ef4e]" : "bg-[#1f1633]"}`} />
                          </div>

                          <div className="mt-2.5 pl-9">
                            <p className="text-xs text-slate-350 leading-relaxed">{opt.description}</p>
                            <p className="mt-1.5 text-[10px] font-mono text-[#fa7faa] flex items-start gap-1 font-bold">
                              <span>Delta Risks:</span> {opt.tradeoffs}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form input details if choice id is D */}
                  <AnimatePresence>
                    {selectedChoiceId === "D" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-[#362d59] pt-4"
                      >
                        <span className="font-mono text-[9px] font-bold text-[#c2ef4e] block mb-1.5 uppercase tracking-wider">Draft Custom Contingency Solution:</span>
                        <textarea
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Compose a smart, multi-variable engineering response. E.g. 'Let's initiate a phased microservices fallback with the dev lead while providing food budgets, migrating in off-peak cycles.'"
                          className="w-full h-24 rounded bg-[#1a112c] border border-[#362d59] p-3 text-xs text-slate-200 outline-none focus:border-[#c2ef4e] placeholder:text-slate-500 transition-colors font-sans resize-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Action Button trigger */}
                  <Button
                    id="execute-decision-btn"
                    disabled={!selectedChoiceId || isSubmitting}
                    onClick={handleExecuteDecision}
                    className="w-full flex items-center justify-center gap-2 bg-[#c2ef4e] text-[#150f23] hover:bg-white font-extrabold text-xs tracking-wider uppercase h-12"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-[#c2ef4e] border-2 border-[#150f23]/20 border-t-[#150f23]" />
                        <span>PROCESSING CONSTRAINTS...</span>
                      </>
                    ) : (
                      <>
                        <span>EXECUTE SELECTED STRATEGIC PLAN</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#362d59] bg-[#150f23]/40 p-12 text-center h-[350px]">
                <Cpu className="h-10 w-10 text-[#362d59] animate-pulse" />
                <h5 className="mt-4 font-display font-medium text-slate-400 text-xs uppercase tracking-wider">War room standby. Generating incoming telemetry logs...</h5>
                <Button
                  id="force-poll-btn"
                  variant="outline"
                  onClick={loadNextScenario}
                  className="mt-4 border-[#362d59] bg-[#150f23] text-indigo-200 hover:text-white hover:border-[#c2ef4e] font-mono text-[10px] font-bold uppercase tracking-wider"
                >
                  Force Poll System
                </Button>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Sidebar (Col 10-12): Progress, active flags, Earned Badges */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Timeline Node Progress */}
          <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-5">
            <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase select-none mb-3">CONSEQUENTIAL TIMELINE</h4>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 11 }).map((_, idx) => {
                const weekNum = idx + 1;
                const isActive = companyState.company.week === weekNum;
                const isPassed = companyState.company.week > weekNum;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center rounded-lg py-2.5 border text-center transition-all ${
                      isActive
                        ? "bg-[#c2ef4e]/10 border-[#c2ef4e] text-[#c2ef4e] shadow shadow-[#c2ef4e]/10 animate-pulse"
                        : isPassed
                        ? "bg-[#1a112c] border-[#362d59]/50 text-indigo-300"
                        : "bg-[#150f23] border-[#362d59]/30 text-slate-600"
                    }`}
                  >
                    <span className="font-mono text-[9px] font-bold block">W{weekNum}</span>
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-[#c2ef4e]" : isPassed ? "bg-[#c2ef4e] opacity-80" : "bg-slate-800"
                    }`} />
                  </div>
                );
              })}
              {/* Target final week node */}
              <div
                className={`flex flex-col items-center justify-center rounded-lg py-2.5 border text-center ${
                  companyState.company.week === 12
                    ? "bg-[#c2ef4e]/15 border-[#c2ef4e] text-[#c2ef4e] animate-bounce"
                    : "bg-[#150f23] border-[#362d59]/30 text-slate-600"
                }`}
              >
                <span className="font-mono text-[8px] font-bold block">FIN</span>
                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                  companyState.company.week === 12 ? "bg-[#c2ef4e] font-bold" : "bg-slate-800"
                }`} />
              </div>
            </div>
          </div>

          {/* Active Flags indicators representing issues */}
          <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-5">
            <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase select-none mb-3">STATE SYSTEM FLAGS ({companyState.activeFlags.length})</h4>
            {companyState.activeFlags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {companyState.activeFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded border border-[#362d59] bg-[#1a112c] px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-slate-300 uppercase shadow-sm"
                  >
                    ⚠️ {flag.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-mono text-[10px] text-[#c2ef4e] leading-relaxed font-bold uppercase">
                🟢 SYSTEM STATE NOMINAL // STABLE CONSTRAINTS
              </p>
            )}
          </div>

          {/* Stakeholders Watch list */}
          {currentScenario && (
            <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-5">
              <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase select-none mb-3">STAKEHOLDERS WATCHING</h4>
              <div className="space-y-2">
                {/* Always include standard ones + prompt values */}
                {["CFO (Sarah Jenkins)", "Chief Product Officer"].map((sh) => (
                  <div key={sh} className="flex items-center gap-2 rounded bg-[#1a112c] border border-[#362d59]/80 p-2 text-xs text-slate-300 font-medium font-sans">
                    <div className="h-2 w-2 rounded-full bg-slate-600" />
                    <span>{sh}</span>
                  </div>
                ))}
                {["CEO", "Director of Core Arch"].map((sh) => (
                  <div key={sh} className="flex items-center gap-2 rounded bg-[#1a112c] border border-[#362d59]/80 p-2 text-xs text-slate-300 font-medium font-sans">
                    <div className="h-2 w-2 rounded-full bg-[#6a5fc1]" />
                    <span>{sh}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earned Badges Drawer */}
          <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-5 flex-1 select-none">
            <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#fa7faa] uppercase mb-3">CAREER ACHIEVEMENT BADGES ({badges.length})</h4>
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {badges.map((badge) => (
                  <div key={badge.id} className="group relative flex items-center gap-3 rounded-xl border border-[#362d59] bg-[#1a112c]/65 p-3 hover:bg-[#1a112c] hover:border-[#6a5fc1] transition-colors">
                    <span className="text-xl flex-shrink-0">{(badge.label || "").split(" ")[0]}</span>
                    <div>
                      <h5 className="font-display font-bold text-xs text-white tracking-wide uppercase leading-tight">{(badge.label || "").split(" ").slice(1).join(" ")}</h5>
                      <p className="font-sans text-[10px] text-slate-400 leading-normal mt-0.5">{badge.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-[10px] text-[#79628c] leading-relaxed italic">
                No special career badges unlocked yet. Survive P0 incidents or implement brilliant direct feedback to unlock.
              </p>
            )}
          </div>

        </aside>
      </div>

      {/* Bottom Hub Panel: XP Progress bar and capability stats */}
      <footer className="mt-5 border-t border-slate-900 bg-[#0A0E1A]/80 p-5 backdrop-blur-md select-none">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* XP Profile Indicator */}
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex items-baseline justify-between select-none">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-400 block uppercase tracking-wider">YOUR CAREER PROFILE</span>
                  <h4 className="font-display text-lg font-black text-white tracking-tight">{playerStats.level}</h4>
                </div>
                <span className="font-mono text-xs text-slate-400 font-bold">{playerStats.xp} XP</span>
              </div>
              
              {/* Level progress bar */}
              <div className="h-2 w-full overflow-hidden rounded bg-slate-950">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (playerStats.xp % 1000) / 10)}%` }}
                  transition={{ type: "tween", duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                />
              </div>
            </div>

            {/* Competency Track Bars */}
            <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              
              {/* Competency: Strategic */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>🧠 Strategic</span>
                  <span className="text-white font-bold">{playerStats.scores.strategic}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded">
                  <div className="h-full bg-blue-500 rounded" style={{ width: `${playerStats.scores.strategic}%` }} />
                </div>
              </div>

              {/* Competency: People */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>❤️ People</span>
                  <span className="text-white font-bold">{playerStats.scores.people}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${playerStats.scores.people}%` }} />
                </div>
              </div>

              {/* Competency: Technical */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>⚙️ Tech</span>
                  <span className="text-white font-bold">{playerStats.scores.technical}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded">
                  <div className="h-full bg-indigo-500 rounded" style={{ width: `${playerStats.scores.technical}%` }} />
                </div>
              </div>

              {/* Competency: Business */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>💰 Business</span>
                  <span className="text-white font-bold">{playerStats.scores.business}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded">
                  <div className="h-full bg-amber-500 rounded" style={{ width: `${playerStats.scores.business}%` }} />
                </div>
              </div>

              {/* Competency: Risk */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>🛡️ Risk</span>
                  <span className="text-white font-bold">{playerStats.scores.risk}</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded">
                  <div className="h-full bg-rose-500 rounded" style={{ width: `${playerStats.scores.risk}%` }} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </footer>

      {/* OVERLAY: DECISION FALLOUT EVALUATION DIALOG */}
      <AnimatePresence>
        {activeEvaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-[#0C101F]/95 p-6 shadow-2xl space-y-5 my-8"
            >
              
              {/* Badge celebration burst if unlocked */}
              <AnimatePresence>
                {activeEvaluation.badge && (
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full py-1.5 px-4 shadow-lg border border-amber-400 flex items-center gap-1.5 select-none"
                  >
                    <span className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                      👑 CARER BADGE UNLOCKED: {activeEvaluation.badge.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Evaluation header */}
              <div className="border-b border-slate-900 pb-3 flex items-center justify-between mt-4">
                <div>
                  <span className="font-mono text-[9px] text-blue-400 tracking-widest uppercase font-bold">FALLOUT METRIC REPORT</span>
                  <h3 className="font-display text-xl font-bold text-white tracking-tight">Post-Action Evaluation</h3>
                </div>
                <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded font-mono text-xs font-bold text-blue-400 select-none shadow">
                  +{activeEvaluation.xpEarned} XP
                </div>
              </div>

              {/* Immediate Fallout text */}
              <div className="space-y-3">
                <span className="font-mono text-[10px] uppercase text-slate-500 font-bold block select-none">Immediate Narrative Fallout:</span>
                <p className="font-serif text-[15px] italic text-slate-200 leading-relaxed pl-3 border-l-[3px] border-blue-500/40">
                  {activeEvaluation.immediateOutcome}
                </p>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  {activeEvaluation.rippleEffects}
                </p>
              </div>

              {/* Dynamic Delta Metric Animation visualizer */}
              <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-4">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-3 font-bold select-none">Company Indicator Variations</span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(activeEvaluation.metricDeltas).map(([key, val]) => {
                    if (val === 0 || !val) return null;
                    const isPositive = val > 0;
                    return (
                      <div key={key} className="bg-[#0A0D18] border border-slate-900/60 p-2.5 rounded-lg text-center flex flex-col justify-center items-center">
                        <span className="font-sans text-[10px] text-slate-400 uppercase tracking-tight block">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        
                        <div className="mt-1.5 flex items-center gap-1 select-none">
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-rose-400" />
                          )}
                          <span className={`font-mono text-[13px] font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPositive ? `+${val}` : `${val}`}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTO Insight Quote Card */}
              {activeEvaluation.ctoInsight && (
                <div className="rounded-lg bg-slate-900/30 border border-slate-800/80 p-4">
                  <div className="flex items-start gap-2.5">
                    <Award className="h-4.5 w-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] uppercase text-blue-400 font-bold block mb-0.5">CTO STRATEGIC WISDOM INSIGHT</span>
                      <p className="font-sans text-xs text-slate-300 leading-relaxed italic">
                        &ldquo;{activeEvaluation.ctoInsight}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue button */}
              <Button
                id="commence-despatch-btn"
                onClick={handleNextTurnAfterEvaluation}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide h-12"
              >
                <span>COMMENCE INCOMING DESPATCH</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: WEEKLY DIGEST NEWS BRIEFING */}
      <AnimatePresence>
        {weeklyDigest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, rotate: -1 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: -1 }}
              transition={{ type: "spring", stiffness: 90 }}
              className="relative w-full max-w-2xl bg-[#0F1426] border-2 border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 my-10 select-none"
            >
              {/* Newspaper header */}
              <div className="text-center border-b-4 border-slate-700/80 pb-5 space-y-1.5">
                <span className="font-mono text-[9px] tracking-[0.25em] text-blue-400 font-bold uppercase block">CONFIDENTIAL {companyState.company.name.toUpperCase()} WEEKLY DIGEST</span>
                <h2 className="font-display text-3xl font-black text-white tracking-tight uppercase">THE ENGINEERING WEEKLY</h2>
                <div className="flex items-center justify-between border-t border-b border-slate-800 py-1 font-mono text-[10px] text-slate-400 mt-2">
                  <span>Q3 2025 COFFEE BULLETIN</span>
                  <span>ISSUE NO. {Math.ceil(decisionCount / 5)}</span>
                  <span>STRICTLY INSIDER AUDIT</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-black text-rose-400 tracking-tight leading-snug border-b border-slate-900 pb-3 uppercase italic">
                  &ldquo;{weeklyDigest.headline}&rdquo;
                </h1>
                
                <p className="font-sans text-[14px] leading-relaxed text-slate-300">
                  {weeklyDigest.summary}
                </p>
              </div>

              {/* Splits Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-slate-900 py-4.5 select-none">
                
                {/* Biggest Win */}
                <div className="space-y-1 border-r border-slate-900 pr-4">
                  <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">⭐ CHIEF ACCOMPLISHMENT</span>
                  <p className="font-sans text-xs leading-normal text-slate-400">
                    {weeklyDigest.biggestWin}
                  </p>
                </div>

                {/* Biggest Miss */}
                <div className="space-y-1 pl-0 md:pl-2">
                  <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest block">⚠️ MAJOR EXPOSURE / DEBT</span>
                  <p className="font-sans text-xs leading-normal text-slate-400">
                    {weeklyDigest.biggestMiss}
                  </p>
                </div>

              </div>

              {/* Team pulse and CEO thought */}
              <div className="grid gap-3.5 pt-1">
                
                {/* Pulse quote */}
                <div className="rounded-xl bg-[#090C16] border border-slate-900 p-4 relative">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">TEAM PULSE (ANONYMOUS GRASSROOTS DEVELOPER)</span>
                  <blockquote className="font-serif text-[13px] leading-relaxed text-slate-300 italic pl-3 border-l-2 border-indigo-400">
                    &ldquo;{weeklyDigest.teamPulse}&rdquo;
                  </blockquote>
                </div>

                {/* CEO thought */}
                <div className="rounded-xl bg-[#090C16] border border-slate-900 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  <div>
                    <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-wider block">BOARD & CEO OUTLOOK STATUS</span>
                    <p className="font-sans text-xs text-slate-400 leading-normal">
                      {weeklyDigest.ceoThought}
                    </p>
                  </div>
                </div>

              </div>

              {/* Looming challenge */}
              <div className="border-t border-slate-900 pt-4 flex justify-between items-center bg-blue-500/5 -mx-8 -mb-8 px-8 py-5 rounded-b-xl border-t border-blue-500/10">
                <div className="pr-4">
                  <span className="font-mono text-[9px] font-bold text-amber-500 uppercase block mb-0.5">🚨 EXPECTED WORKPLACE DEVIANCE</span>
                  <p className="font-sans text-[11px] text-slate-300">
                    {weeklyDigest.upcomingPressure}
                  </p>
                </div>
                
                <Button
                  id="next-week-btn"
                  onClick={handleNextTurnAfterDigest}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-5 whitespace-nowrap"
                >
                  Enter Next Week
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive briefing dossier overlay */}
      <AnimatePresence>
        {companyState.company.openingNarrative && decisionCount === 0 && showBriefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.94, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 10 }}
              className="relative w-full max-w-3xl bg-[#150f23] border border-[#362d59] rounded-xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c2ef4e]" />
              
              <div className="space-y-6">
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#362d59]/50 pb-5 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#fa7faa] uppercase">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#fa7faa] animate-pulse" />
                      SECURE BRIDGING CLUSTER // DECRYPTED_DOSSIER
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      MANDATE BRIEFING: {companyState.company.name.toUpperCase()}
                    </h1>
                  </div>
                  <div className="text-right sm:text-right text-[10px] font-mono text-slate-500 py-1 px-2 border border-[#362d59] rounded bg-[#1f1633] uppercase">
                    STAGE: {companyState.company.stage}
                  </div>
                </div>

                {/* Narrative split by paragraph */}
                <div className="space-y-4">
                  {(companyState.company.openingNarrative || "").split("\n\n").map((para, pIdx) => {
                    const borderColors = ["border-[#fa7faa]", "border-indigo-400", "border-[#c2ef4e]"];
                    const labelList = ["THE SCANDAL & FALLOUT // BACKSTORY", "TECHNOLOGY STACK MAP // FRAGILITY ENGINE", "YOUR INCOMING SURVIVAL MANDATE"];
                    const labelColors = ["text-[#fa7faa]", "text-indigo-400", "text-[#c2ef4e]"];
                    return (
                      <div
                        key={pIdx}
                        className={`rounded-lg bg-[#1f1633]/65 p-4 border-l-3 ${borderColors[pIdx] || 'border-[#362d59]'} space-y-1.5`}
                      >
                        <span className={`font-mono text-[9px] font-bold ${labelColors[pIdx] || 'text-[#fa7faa]'} tracking-wider block uppercase`}>
                          {labelList[pIdx] || "ADDITIONAL INTEL"}
                        </span>
                        <p className={`font-sans leading-relaxed text-slate-350 ${pIdx === 1 ? 'text-xs font-mono' : 'text-xs sm:text-sm'}`}>
                          {para}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dossier action footer */}
              <div className="mt-8 pt-5 border-t border-[#362d59]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wide">
                  COGNITIVE OUTCOMES VERIFIED // SYSTEM STABLE
                </span>
                
                <Button
                  id="enter-war-room-btn"
                  onClick={() => {
                    setShowBriefing(false);
                    playSynthSound("success", isVolumeOn);
                  }}
                  className="w-full sm:w-auto font-display text-xs font-extrabold uppercase tracking-widest text-[#150f23] bg-white hover:bg-[#c2ef4e] text-center h-12 px-8"
                >
                  ENTER THE WAR ROOM &rarr;
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
