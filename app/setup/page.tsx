"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  Cpu,
  Users,
  Briefcase,
  User,
  ArrowRight,
  ArrowLeft,
  Wand2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Activity,
  Flame,
  Bug,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
interface Industry {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  expect: string;
}

interface Stage {
  id: string;
  name: string;
  headcount: string;
  desc: string;
  metrics: {
    budget: number;
    technicalDebt: number;
    productVelocity: number;
    teamMorale: number;
    ceoRelationship: number;
    customerSatisfaction: number;
    securityPosture: number;
    talentPipeline: number;
  };
}

const industries: Industry[] = [
  {
    id: "Enterprise SaaS",
    name: "Enterprise SaaS",
    emoji: "🏢",
    desc: "Deep core workflows, scaling SOC2 requirements, and customer retention obsession.",
    expect: "Expect heavy feature pressure from high-paying corporate contracts and strict SOC2/enterprise compliance audits."
  },
  {
    id: "FinTech / Payments",
    name: "FinTech / Payments",
    emoji: "💳",
    desc: "PCI compliance, high-availability ledger databases, and absolute zero-fault tolerance.",
    expect: "Systemic risk is off the charts. Database race-conditions or security bugs can lead to immediate financial loss and regulatory review."
  },
  {
    id: "HealthTech / MedDev",
    name: "HealthTech / MedDev",
    emoji: "🏥",
    desc: "Sensitive HIPAA compliance, complex legacy database integrations, and slow shipping cycles.",
    expect: "Development cycles are bogged down by clinical validations. High risk of security data leakages and strict governmental HIPAA audits."
  },
  {
    id: "AI & GenAI Infrastructure",
    name: "AI & GenAI Infrastructure",
    emoji: "🤖",
    desc: "Extreme GPU burn rate, model drift drift, and highly experimental python code in production.",
    expect: "Velocity is blazing fast, but code quality is a mess of hacky scripts. Budgets bleed rapidly into cloud/GPU cloud servers."
  },
  {
    id: "Web3 & Cryptography",
    name: "Web3 & Cryptography",
    emoji: "🪙",
    desc: "Consensus algorithms, smart contract audits, and decentralized remote developer teams.",
    expect: "High cyber threats. Open-source codebases require absolute mathematical security; recruiting top-tier cryptographers is notoriously expensive."
  },
  {
    id: "GovTech / Public Sector",
    name: "GovTech / Public Sector",
    emoji: "🏛️",
    desc: "Massive scale, archaic database technologies, and endless governmental contract bureaucracy.",
    expect: "Extremely sluggish speed. Product decisions must pass through multi-layered agency reviews while navigating ancient mainframe integrations."
  },
  {
    id: "EdTech / Classroom Tech",
    name: "EdTech / Classroom Tech",
    emoji: "🎓",
    desc: "Intense seasonal load spikes, child privacy laws, and low-margin operating budgets.",
    expect: "Massive scale spikes on school reopening weeks will test infrastructure limit. Tight budgets mean you must operate on server fumes."
  },
  {
    id: "AdTech & Bidding Engines",
    name: "AdTech & Bidding Engines",
    emoji: "📈",
    desc: "Ultra-low latency bidding engines, huge data ingestion logs, and cookie-death mitigation.",
    expect: "Engineering team struggles with billion-message logs, microsecond SLA constraints, and keeping raw hardware server bills from exploding."
  }
];

const stages: Stage[] = [
  {
    id: "Pre-Seed / MVP",
    name: "Pre-Seed / MVP",
    headcount: "3 - 8 engineers (mostly contractors)",
    desc: "A raw prototype, zero processes, hyper-speed, and very scarce capital runway.",
    metrics: { budget: 40, technicalDebt: 25, productVelocity: 75, teamMorale: 60, ceoRelationship: 65, customerSatisfaction: 55, securityPosture: 30, talentPipeline: 30 }
  },
  {
    id: "Seed",
    name: "Seed / Early Stage",
    headcount: "8 - 15 engineers",
    desc: "Rushing to hit product-market fit. Core architecture debt is mounting daily.",
    metrics: { budget: 50, technicalDebt: 42, productVelocity: 68, teamMorale: 56, ceoRelationship: 60, customerSatisfaction: 60, securityPosture: 38, talentPipeline: 45 }
  },
  {
    id: "Series A",
    name: "Series A",
    headcount: "15 - 40 engineers",
    desc: "The early architecture is cracking under scale. The board wants new complex features yesterday.",
    metrics: { budget: 60, technicalDebt: 55, productVelocity: 55, teamMorale: 50, ceoRelationship: 60, customerSatisfaction: 65, securityPosture: 45, talentPipeline: 55 }
  },
  {
    id: "Series B",
    name: "Series B",
    headcount: "40 - 100 engineers",
    desc: "Classic scaling wall. Team communication is breaking, and the core database is a major speed bottleneck.",
    metrics: { budget: 65, technicalDebt: 70, productVelocity: 48, teamMorale: 42, ceoRelationship: 60, customerSatisfaction: 70, securityPosture: 50, talentPipeline: 38 }
  },
  {
    id: "Series C+ / Growth",
    name: "Series C+ / Growth",
    headcount: "100 - 250+ engineers",
    desc: "Siloed engineering groups, continuous enterprise compliance audits, slow delivery cycles, and extreme board targets.",
    metrics: { budget: 75, technicalDebt: 82, productVelocity: 35, teamMorale: 38, ceoRelationship: 55, customerSatisfaction: 75, securityPosture: 65, talentPipeline: 65 }
  },
  {
    id: "Bootstrapped",
    name: "Bootstrapped",
    headcount: "5 - 20 engineers (lean, customer-funded)",
    desc: "Highly capital-efficient and profitable. Raw speed and direct customer response are rule of law.",
    metrics: { budget: 80, technicalDebt: 48, productVelocity: 62, teamMorale: 65, ceoRelationship: 70, customerSatisfaction: 80, securityPosture: 42, talentPipeline: 40 }
  }
];

export default function SetupPage() {
  const router = useRouter();
  const { initializeGame } = useGameStore();

  // Wizard Steps state
  const [step, setStep] = useState<number>(1);
  const [playerName, setPlayerName] = useState<string>("Alex Chen");
  const [companyName, setCompanyName] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage>(stages[2]); // Series A default
  const [validationError, setValidationError] = useState<string | null>(null);

  // Character limit validation
  const maxNameLength = 40;

  // Custom simulation prompt terminal overlay states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  // Placeholders
  const [currentPlaceholder] = useState<string>(() => {
    const companyPlaceholders = ["Helix AI", "LedgerFlow", "CyberShield", "Stackly", "RetainIQ", "HealthLogix"];
    return companyPlaceholders[Math.floor(Math.random() * companyPlaceholders.length)];
  });

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= maxNameLength) {
      setCompanyName(val);
      setValidationError(null);
    }
  };

  const surpriseMeIndustry = () => {
    const filtered = industries.filter((ind) => ind.id !== selectedIndustry?.id);
    const randomInd = filtered[Math.floor(Math.random() * filtered.length)];
    setSelectedIndustry(randomInd);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!companyName.trim()) {
        setValidationError("Company name is required.");
        return false;
      }
      if (companyName.trim().length < 2) {
        setValidationError("Company name must be at least 2 characters.");
        return false;
      }
      const nameRegex = /^[a-zA-Z0-9\s\-]+$/;
      if (!nameRegex.test(companyName.trim())) {
        setValidationError("Company name can only contain letters, numbers, spaces, and hyphens.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!selectedIndustry) {
        setValidationError("Please select an industry sector.");
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setStep((prev) => prev - 1);
  };

  // Launch Genesis Engine API call
  const handleLaunch = async () => {
    if (!validateStep(3)) return;
    setIsGenerating(true);
    setTerminalLines([]);
    
    // Kick off the API call immediately in background
    const apiPromise = fetch("/api/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: companyName.trim(),
        industry: selectedIndustry?.id,
        companyStage: selectedStage.id,
        playerName: playerName.trim() || "Alex Chen"
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.json().catch(() => ({ error: "Generation request failed" }));
        throw new Error(errorText.error || "Generation request failed");
      }
      return response.json();
    });

    const baseLines = [
      `> Bootstrapping Genesis Engine cluster...`,
      `> Contacting server-side model nodes (gemini-3.5-flash)...`,
      `> Registering ${companyName.trim()} Inc...`,
      `> Provisioning virtual headcount (${selectedStage.headcount})...`,
      `> Drafting historical board drama...`,
      `> Loading baseline tech debt profile (${selectedStage.metrics.technicalDebt}% density)...`,
      `> Establishing CEO relationship protocol...`,
      `> Infusing corporate politics & active flags...`
    ];

    let generatedData: any = null;
    let apiError: string | null = null;
    let apiStatus: "pending" | "resolved" | "rejected" = "pending";

    // Direct resolution observers
    apiPromise.then(
      (data) => {
        generatedData = data;
        apiStatus = "resolved";
      },
      (err) => {
        apiError = err.message || "An unexpected error occurred.";
        apiStatus = "rejected";
        console.error("Genesis failed", err);
      }
    );

    // Dynamic terminal typewriter that displays lines incrementally
    for (let i = 0; i < baseLines.length; i++) {
      setTerminalLines((prev) => [...prev, baseLines[i]]);
      // Wait for 350ms per line to allow reading and feel super high-tech
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    // Now, if the API is still pending, display a dynamic animated waiting line
    let dots = "";
    let loadingLineIndex = -1;
    
    while (apiStatus === "pending") {
      dots = dots.length >= 3 ? "" : dots + ".";
      const message = `> Synergizing strategic indices & crafting simulation parameters${dots}`;
      
      setTerminalLines((prev) => {
        const updated = [...prev];
        if (loadingLineIndex === -1) {
          loadingLineIndex = updated.length;
          updated.push(message);
        } else {
          updated[loadingLineIndex] = message;
        }
        return updated;
      });
      
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Remove the animated dots loading line
    if (loadingLineIndex !== -1) {
      setTerminalLines((prev) => {
        const updated = [...prev];
        updated.splice(loadingLineIndex, 1);
        return updated;
      });
    }

    // Output final results
    if (apiStatus === "resolved" && generatedData) {
      setTerminalLines((prev) => [
        ...prev,
        `> Compile completed successfully. Your office is ready. Good luck.`
      ]);
      
      // Brief pause for closure
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Commit stats to state + localStorage and route cleanly
      initializeGame(generatedData);
      router.push("/game");
    } else {
      const finalError = apiError || "Failed parsing company payload";
      setTerminalLines((prev) => [
        ...prev,
        `> GENESIS CRITICAL FAIL: ${finalError}`
      ]);
      
      // Wait 3.5 seconds to let the user read the exact error message
      await new Promise((resolve) => setTimeout(resolve, 3500));
      
      setIsGenerating(false);
      setValidationError(`GENESIS CRITICAL FAIL: ${finalError}`);
      setStep(3); // Go back to stage select
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[#1f1633] p-6 text-slate-100 font-sans selection:bg-[#c2ef4e]/30">
      
      {/* Starfield & Grid Texture Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#362d5930_1px,transparent_1px),linear-gradient(to_bottom,#362d5930_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#fa7faa05_1px,transparent_1.5px)] bg-[size:24px_24px] opacity-70" />
      <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6a5fc1]/10 blur-3xl" />

      {/* Main setup container */}
      <div className="z-10 w-full max-w-4xl">
        
        {/* Step tracker ribbon */}
        <div className="mb-8 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold border-b border-[#362d59] pb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#fa7faa]">SETUP_SEQUENCE</span>
            <span className="text-slate-700">{"//"}</span>
            <span className="text-[#c2ef4e]">STEP_0{step}_OF_03</span>
          </div>
          <div className="flex gap-4">
            <span className={step >= 1 ? "text-[#c2ef4e]" : "text-slate-700"}>Identity</span>
            <span>&gt;</span>
            <span className={step >= 2 ? "text-[#c2ef4e]" : "text-slate-700"}>Industry</span>
            <span>&gt;</span>
            <span className={step >= 3 ? "text-[#c2ef4e]" : "text-slate-700"}>Scale</span>
          </div>
        </div>

        {/* Dynamic Wizard Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-identity"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Headline */}
              <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                  ENTER THE <span className="inline-block px-3 py-1 bg-[#c2ef4e] text-[#150f23] rounded-sm transform rotate-[-1deg] text-2xl sm:text-4xl font-black shadow-[4px_4px_0_0_#fa7faa]">BACKSTORY IDENTITY</span>
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl">
                  Every legendary technology executive begins with a clean clipboard and a messy desk. Establish your technical persona and name your startup company.
                </p>
              </div>

              {/* Form container */}
              <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-6 sm:p-8 space-y-6">
                
                {/* CTO Player Name */}
                <div className="space-y-2">
                  <label htmlFor="playerName" className="block text-xs font-mono font-bold tracking-[0.1em] text-[#fa7faa] uppercase">
                    Your Name, Chief Technology Officer
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="playerName"
                      type="text"
                      maxLength={50}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="E.g., Alex Chen"
                      className="w-full bg-[#1f1633] border border-[#362d59] rounded-lg py-3.5 pl-11 pr-4 text-sm font-sans text-white focus:border-[#c2ef4e] outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    Your name will appear across emails, crisis threads, board slide-decks, and strategic briefs.
                  </p>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="companyName" className="block text-xs font-mono font-bold tracking-[0.1em] text-[#fa7faa] uppercase">
                      Startup Company Name
                    </label>
                    <span className="font-mono text-[10px] text-slate-500">
                      {companyName.length} / {maxNameLength}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={handleCompanyNameChange}
                      placeholder={`E.g., "${currentPlaceholder}"`}
                      className="w-full bg-[#1f1633] border border-[#362d59] rounded-lg py-3.5 pl-11 pr-4 text-sm font-sans text-white focus:border-[#c2ef4e] outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    Allowed: letters, numbers, spaces, and hyphens. Max 40 characters. Avoid special characters.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-industry"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Title Header */}
              <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                  CHOOSE YOUR <span className="inline-block px-3 py-1 bg-[#c2ef4e] text-[#150f23] rounded-sm transform rotate-[1deg] text-2xl sm:text-4xl font-black shadow-[4px_4px_0_0_#fa7faa]">SECTOR DOMAIN</span>
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl">
                  Your industry defines the nature of your engineering problems. FinTech system outages incinerate money; AI setups burn cash on servers; GovTech moves at glacial speed.
                </p>
              </div>

              {/* Grid of Industry Cards */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {industries.map((ind) => {
                  const isSelected = selectedIndustry?.id === ind.id;
                  return (
                    <div
                      key={ind.id}
                      onClick={() => {
                        setSelectedIndustry(ind);
                        setValidationError(null);
                      }}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 select-none ${
                        isSelected
                          ? "border-[#c2ef4e] bg-[#150f23] shadow-lg shadow-[#c2ef4e]/10 ring-1 ring-[#c2ef4e]/30 scale-[1.02]"
                          : "border-[#362d59] bg-[#150f23]/60 hover:border-[#6a5fc1] hover:bg-[#150f23] hover:scale-[1.01]"
                      }`}
                    >
                      <div>
                        <span className="text-2xl" role="img" aria-label={ind.name}>{ind.emoji}</span>
                        <h3 className="mt-3 font-display text-xs font-black tracking-tight text-white uppercase">
                          {ind.name}
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-400 leading-normal font-sans">
                          {ind.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Tools Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#362d59] bg-[#150f23] p-5">
                <div className="flex-1">
                  <span className="font-mono text-[9px] font-bold text-[#fa7faa] uppercase block mb-1">Sector Risk Profile</span>
                  <div className="text-xs text-slate-300 leading-relaxed font-sans block h-auto sm:h-8">
                    {selectedIndustry ? (
                      <span className="text-slate-200">
                        <span className="inline-flex h-2 w-2 rounded-full bg-[#c2ef4e] mr-2 animate-pulse" />
                        {selectedIndustry.expect}
                      </span>
                    ) : (
                      <p className="text-slate-500 italic">Select an industry card to preview sector-specific constraints.</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={surpriseMeIndustry}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded border border-[#362d59] bg-[#150f23] px-4 py-2.5 font-mono text-xs font-bold text-slate-300 hover:border-[#c2ef4e] hover:text-[#c2ef4e] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Wand2 className="h-4 w-4" />
                  SURPRISE ME
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-stage"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 md:grid-cols-12"
            >
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                {/* Title */}
                <div className="space-y-3">
                  <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                    SELECT THE <span className="inline-block px-3 py-1 bg-[#c2ef4e] text-[#150f23] rounded-sm transform rotate-[-1deg] text-2xl sm:text-4xl font-black shadow-[4px_4px_0_0_#fa7faa]">FUNDING STAGE</span>
                  </h1>
                  <p className="text-sm text-slate-400">
                    A company&apos;s funding status dictates its structural risk. Early-stage firms can pivot on a dime but have scarce budgets. Post-Series B corporations are capital-rich but slow down heavily under tech debt and coordination bureaucracy.
                  </p>
                </div>

                {/* Stage Grid list */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {stages.map((stg) => {
                    const isSelected = selectedStage.id === stg.id;
                    return (
                      <div
                        key={stg.id}
                        onClick={() => setSelectedStage(stg)}
                        className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all select-none ${
                          isSelected
                            ? "border-[#c2ef4e] bg-[#150f23] shadow-lg shadow-[#c2ef4e]/5"
                            : "border-[#362d59] bg-[#150f23]/60 hover:border-[#6a5fc1]"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-display text-xs font-black text-white uppercase">{stg.id}</h4>
                          </div>
                          <span className="font-mono text-[9px] font-bold text-[#c2ef4e] block mt-0.5">{stg.headcount}</span>
                          <p className="mt-1.5 text-[10px] text-slate-400 font-sans leading-normal">
                            {stg.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shifting Metrics Health Preview panel (Visual Sandbox) */}
              <div className="md:col-span-5 flex flex-col">
                <div className="rounded-xl border border-[#362d59] bg-[#150f23] p-5 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 border-b border-[#362d59]/50 pb-3 mb-4 font-mono text-[10px] text-[#fa7faa] font-bold">
                      <Activity className="h-4 w-4 text-[#fa7faa]" />
                      <span>STAGE BASICS PREVIEW // DYNAMIC CONSTRAINTS</span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
                      These are the relative starting variables for <span className="text-white font-bold">{selectedStage.id}</span>. They dictate runway, morale, speed, and leverage:
                    </p>

                    {/* Interactive bars */}
                    <div className="space-y-3.5">
                      {/* BAR 1: Budget */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-350">🪙 Starting Budget / Cash</span>
                          <span className="text-[#c2ef4e] font-extrabold">{selectedStage.metrics.budget}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-[#1f1633] overflow-hidden border border-[#362d59]/40">
                          <motion.div
                            animate={{ width: `${selectedStage.metrics.budget}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 12 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#c2ef4e]"
                          />
                        </div>
                      </div>

                      {/* BAR 2: Tech Debt */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-350">⚙️ Legacy Technical Debt</span>
                          <span className="text-[#fa7faa] font-extrabold">{selectedStage.metrics.technicalDebt}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-[#1f1633] overflow-hidden border border-[#362d59]/40">
                          <motion.div
                            animate={{ width: `${selectedStage.metrics.technicalDebt}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 12 }}
                            className="h-full bg-gradient-to-r from-red-500 to-[#fa7faa]"
                          />
                        </div>
                      </div>

                      {/* BAR 3: Product Velocity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-350">⚡ Shipping Speed / Velocity</span>
                          <span className="text-blue-400 font-extrabold">{selectedStage.metrics.productVelocity}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-[#1f1633] overflow-hidden border border-[#362d59]/40">
                          <motion.div
                            animate={{ width: `${selectedStage.metrics.productVelocity}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 12 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-400"
                          />
                        </div>
                      </div>

                      {/* BAR 4: Morale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-350">❤️ Initial Developer Morale</span>
                          <span className="text-pink-400 font-extrabold">{selectedStage.metrics.teamMorale}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-[#1f1633] overflow-hidden border border-[#362d59]/40">
                          <motion.div
                            animate={{ width: `${selectedStage.metrics.teamMorale}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 12 }}
                            className="h-full bg-gradient-to-r from-[#fa7faa] to-pink-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer of the Sandbox */}
                  <div className="mt-5 border-t border-[#362d59]/40 pt-4 text-[10px] font-mono text-slate-500 leading-normal">
                    <span>LAUNCH DECISION MATRIX STABLE // HIGHLY STYLED ADAPTION</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Errors banner */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 overflow-hidden"
            >
              <Alert id="validation-alert" className="border-[#fa7faa]/40 bg-[#fa7faa]/10 text-[#fa7faa] gap-x-2 [&_svg]:text-[#fa7faa]">
                <AlertCircle className="h-4 w-4 flex-shrink-0 animate-pulse" />
                <AlertDescription className="text-xs text-[#fa7faa] font-sans">
                  {validationError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Controls Footer */}
        <div className="mt-8 flex justify-between border-t border-[#362d59]/40 pt-6">
          <div className="flex">
            {step > 1 && (
              <Button
                id="btn-back"
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 border-[#362d59] bg-[#150f23] text-slate-300 hover:bg-[#362d59]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div>
            {step < 3 ? (
              <Button
                id="btn-next"
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-white text-[#150f23] hover:bg-slate-200 font-extrabold uppercase"
              >
                Next Step
                <ArrowRight className="h-4 w-4 text-[#150f23]" />
              </Button>
            ) : (
              <Button
                id="btn-generate"
                type="button"
                onClick={handleLaunch}
                className="group flex items-center gap-2 bg-[#c2ef4e] text-[#150f23] hover:bg-[#d4f964] font-extrabold uppercase"
              >
                Generate My Company
                <ArrowRight className="h-4 w-4 text-[#150f23] group-hover:translate-x-0.5 transition-transform" />
              </Button>
            )}
          </div>
        </div>

        {/* Subtle decorative quote */}
        <div className="mt-8 text-center text-[10px] font-mono text-slate-600 uppercase">
          Sentries war room onboarding cluster connection is encrypted to 0x3000
        </div>

      </div>

      {/* FULL-SCREEN BOOT SEQUENCE TERMINAL OVERLAY */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#150f23] p-6 backdrop-blur-md"
          >
            <div className="w-full max-w-2xl rounded-xl border border-[#362d59] bg-[#0c0817] p-6 font-mono text-xs text-slate-300 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fa7faa] via-[#6a5fc1] to-[#c2ef4e]" />
              
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-[#362d59]/50 pb-3 mb-5">
                <div className="flex items-center gap-2 text-slate-300 select-none">
                  <Terminal className="h-4 w-4 text-[#c2ef4e] animate-pulse" />
                  <span className="font-bold">GENESIS_BOOT_SEQUENCE // ADDR_0X3000</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#fa7faa]" />
                  <div className="h-2 w-2 rounded-full bg-[#6a5fc1]" />
                  <div className="h-2 w-2 rounded-full bg-[#c2ef4e]" />
                </div>
              </div>

              {/* Streamed/Printed Lines */}
              <div className="space-y-2.5 min-h-[220px]">
                {terminalLines.map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={
                      line.includes("completed successfully")
                        ? "text-[#c2ef4e] font-bold"
                        : line.includes("GENESIS CRITICAL FAIL")
                        ? "text-[#fa7faa] font-bold"
                        : "text-slate-300"
                    }
                  >
                    {line}
                  </motion.div>
                ))}

                {/* Blinking Prompt Cursor */}
                <span className="inline-block h-4 w-2.5 bg-[#c2ef4e] animate-ping ml-1" />
              </div>

              {/* Status footer inside terminal */}
              <div className="mt-8 pt-4 border-t border-[#362d59]/30 flex items-center justify-between text-[10px] text-slate-500 uppercase select-none">
                <span>System: AI-Powered Onboarding Engine</span>
                <span className="animate-pulse">Active Generation...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </main>
  );
}
