"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricBar } from "@/components/metric-bar";
import { ExpandableText } from "@/components/expandable-text";
import { Check } from "lucide-react";

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
  badgeColor: string;
  metrics: {
    budget: number;
    teamMorale: number;
    technicalDebt: number;
    productVelocity: number;
    securityPosture: number;
    talentPipeline: number;
  };
}

const industries: Industry[] = [
  { id: "Healthcare", name: "Healthcare", emoji: "🏥", desc: "HIPAA, EMRs, life-critical code", expect: "Expect heavy feature pressure from clinical safety protocols and sensitive HIPAA patient data privacy audits." },
  { id: "GovTech", name: "GovTech", emoji: "🏛️", desc: "Procurement hell, legacy systems", expect: "Sluggish speed. Product decisions must pass through multi-layered agency reviews while navigating ancient mainframe integrations." },
  { id: "SaaS / B2B", name: "SaaS / B2B", emoji: "☁️", desc: "SLAs, enterprise deals, velocity", expect: "High contract pressure. Enterprise client deals require custom APIs, zero downtime, and strict SLA compliance." },
  { id: "E-Commerce", name: "E-Commerce", emoji: "🛒", desc: "Traffic spikes, payments, scale", expect: "Scalability test. Traffic surges during sales events will stress checkout databases and payment processor handshakes." },
  { id: "Fintech", name: "Fintech", emoji: "💳", desc: "PCI-DSS, fraud, regulators", expect: "PCI compliance, high-availability ledger databases, and absolute zero-fault tolerance for security bugs." },
  { id: "EdTech", name: "EdTech", emoji: "🎓", desc: "School districts, seasonal load", expect: "Classroom load spikes. Massive seasonal surges when schools reopen will push low-margin servers to their limits." },
  { id: "AI / ML", name: "AI / ML", emoji: "🤖", desc: "GPU costs, model drift, hype", expect: "Blazing fast velocity, but a massive pile of hacky Python code. GPU cloud bills will burn runway rapidly." },
  { id: "Cybersecurity", name: "Cybersecurity", emoji: "🔐", desc: "SOC2, zero-days, trust at stake", expect: "SOC2 compliance, zero-day threat responses, and retaining client data trust are critical operational hazards." },
  { id: "Logistics", name: "Logistics", emoji: "🚚", desc: "3PL APIs, real-time, breakage", expect: "API integration hell. Managing third-party carrier syncs, warehouse endpoints, and physical package breakage events." },
  { id: "PropTech", name: "PropTech", emoji: "🏗️", desc: "MLS data, licensing disputes", expect: "Data quality concerns. Legacy MLS data pipelines are brittle; agent licensing dynamics introduce legal constraints." },
  { id: "BioTech", name: "BioTech", emoji: "🧬", desc: "FDA audits, research pipelines", expect: "Validation bottlenecks. Scientific trials and regulatory approvals stall production velocity; hardware security is key." },
  { id: "Gaming", name: "Gaming", emoji: "🎮", desc: "Live ops, angry players, patches", expect: "High emotional volatility. Discontented players on social channels and live-ops outages require rapid deployment loops." },
  { id: "InsurTech", name: "InsurTech", emoji: "🏦", desc: "Actuarial data, carrier APIs", expect: "Legacy carrier interfaces. Underwriting engines rely on complex actuarial models that resist agile iteration." },
  { id: "CleanTech", name: "CleanTech", emoji: "🌱", desc: "IoT, hardware, slow capital", expect: "Capital-intensive. Slow hardware development loop combined with IoT fleet connection drops and physical sensor lag." },
  { id: "Consumer App", name: "Consumer App", emoji: "📱", desc: "App Store risk, viral scale", expect: "App Store compliance risk. A single review rejection or a sudden viral spike can bring down platform databases." },
  { id: "Mental Health", name: "Mental Health", emoji: "💆", desc: "Privacy, clinical safety, care", expect: "Zero-error clinical safety rules. Critical data protection mechanisms required for high confidentiality care channels." },
  { id: "LegalTech", name: "LegalTech", emoji: "🛡️", desc: "Unauthorized practice risk", expect: "Regulatory compliance risks. Generative AI lawyers require tight guardrails to avoid unauthorized legal practice claims." },
  { id: "Manufacturing", name: "Manufacturing", emoji: "🏭", desc: "OT/IT integration, safety", expect: "Industrial network bridging. Vulnerabilities in legacy operational technology can halt physical factory floor logistics." },
  { id: "SpaceTech", name: "SpaceTech", emoji: "🚀", desc: "Life-critical, hardware loops", expect: "Astronomical stakes. Hardware software integration requires absolute math verification; zero tolerance for run-time crashes." },
  { id: "Data Analytics", name: "Data Analytics", emoji: "📊", desc: "Quality debt, GDPR, governance", expect: "Data swamp. Cleaning massive amounts of customer data debt while satisfying GDPR governance reviews." },
  { id: "Media", name: "Media", emoji: "🎵", desc: "CDN costs, DRM, streaming", expect: "Bandwidth bills. Keeping content streaming costs low while preventing pirate downloads through complex DRM controls." },
  { id: "Web3 / Crypto", name: "Web3 / Crypto", emoji: "🌐", desc: "Smart contracts, protocol risk", expect: "Mathematical auditing. Auditing smart contracts is key; any bug is permanently exploited on decentralized nodes." },
  { id: "Surprise Me", name: "Surprise Me", emoji: "🎲", desc: "Random industry. Embrace chaos.", expect: "Prepare for pure randomness. The simulation will assign a completely randomized sector with unpredictable trade-offs." }
];

const stages: Stage[] = [
  { id: "Pre-Seed", name: "Pre-Seed", headcount: "1-10", desc: "Pure chaos. No process. Ship or die.", badgeColor: "bg-[--surface] text-[--steel]", metrics: { budget: 40, teamMorale: 60, technicalDebt: 25, productVelocity: 75, securityPosture: 30, talentPipeline: 30 } },
  { id: "Seed", name: "Seed", headcount: "10-30", desc: "Finding PMF. Running on fumes and hope.", badgeColor: "bg-[--blue-200] text-[--blue-700]", metrics: { budget: 50, teamMorale: 56, technicalDebt: 42, productVelocity: 68, securityPosture: 38, talentPipeline: 45 } },
  { id: "Series A", name: "Series A", headcount: "30-80", desc: "First real team. First real problems.", badgeColor: "bg-green-100 text-green-700", metrics: { budget: 60, teamMorale: 50, technicalDebt: 55, productVelocity: 55, securityPosture: 45, talentPipeline: 55 } },
  { id: "Series B", name: "Series B", headcount: "80-200", desc: "Scale or die. Complexity creeping in.", badgeColor: "bg-[--coral]/10 text-[--coral]", metrics: { budget: 65, teamMorale: 42, technicalDebt: 70, productVelocity: 48, securityPosture: 50, talentPipeline: 38 } },
  { id: "Series C+", name: "Series C+", headcount: "200+", desc: "Politics, process, slowing velocity.", badgeColor: "bg-[--purple]/10 text-[--purple]", metrics: { budget: 75, teamMorale: 38, technicalDebt: 82, productVelocity: 35, securityPosture: 65, talentPipeline: 65 } },
  { id: "Bootstrap", name: "Bootstrap", headcount: "10-50", desc: "Profitable but lean. Every dollar counts.", badgeColor: "bg-amber-100 text-amber-700", metrics: { budget: 80, teamMorale: 65, technicalDebt: 48, productVelocity: 62, securityPosture: 42, talentPipeline: 40 } },
];

export default function SetupPage() {
  const router = useRouter();
  const { initializeGame } = useGameStore();

  const [step, setStep] = useState<number>(1);
  const [playerName, setPlayerName] = useState<string>("Alex Chen");
  const [companyName, setCompanyName] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage>(stages[3]); // Default Series B
  const [errorText, setErrorText] = useState<string | null>(null);

  // Loading Screen Terminal States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const nameChips = ["NovaCorp", "Helix AI", "Stackly", "Prism", "Foundry", "Axon"];

  const handleSurpriseMe = () => {
    // Exclude Surprise Me card itself
    const options = industries.filter((ind) => ind.id !== "Surprise Me");
    const randomIdx = Math.floor(Math.random() * options.length);
    setSelectedIndustry(options[randomIdx]);
    setErrorText(null);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!companyName.trim()) {
        setErrorText("Company name is required.");
        return;
      }
      setErrorText(null);
      setStep(2);
    } else if (step === 2) {
      if (!selectedIndustry) {
        setErrorText("Please select your company's industry.");
        return;
      }
      setErrorText(null);
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorText(null);
    setStep((prev) => prev - 1);
  };

  const handleLaunch = async () => {
    setIsGenerating(true);
    setTerminalLines([]);

    const payload = {
      companyName: companyName.trim(),
      industry: selectedIndustry?.id === "Surprise Me" ? industries[Math.floor(Math.random() * (industries.length - 1))].id : selectedIndustry?.id,
      companyStage: selectedStage.id,
      playerName: playerName.trim() || "Alex Chen",
    };

    // Call API in background
    const apiPromise = fetch("/api/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to configure simulation workspace.");
      }
      return res.json();
    });

    const lines = [
      `> Incorporating ${companyName}...`,
      `> Assembling engineering team...`,
      `> Loading technical debt...`,
      `> Briefing your CEO...`,
      `> Scheduling a crisis for week 2...`,
      `> Your calendar is now full.`,
      `——`,
      `> Welcome, ${playerName.trim() || "Alex Chen"}. Try not to get fired.`,
    ];

    // Show typewriter lines with 400ms delay
    for (let i = 0; i < lines.length; i++) {
      setTerminalLines((prev) => [...prev, lines[i]]);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    // 600ms pause and route
    try {
      const generatedData = await apiPromise;
      await new Promise((resolve) => setTimeout(resolve, 600));
      initializeGame(generatedData);
      router.push("/game");
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setErrorText("Connection error occurred. Please try launching again.");
    }
  };

  // Determine brand color for loading badge based on industry
  const getBrandColor = () => {
    if (!selectedIndustry) return "bg-[--primary]";
    const id = selectedIndustry.id.toLowerCase();
    if (id.includes("ai") || id.includes("cyber")) return "bg-[--purple]";
    if (id.includes("fintech") || id.includes("saas")) return "bg-[--blue]";
    if (id.includes("health") || id.includes("bio")) return "bg-[--magenta]";
    return "bg-[--coral]";
  };

  return (
    <main className="bg-[--canvas] min-h-screen font-sans flex flex-col justify-start relative select-none">
      
      {/* LOADING SCREEN */}
      {isGenerating && (
        <div className="bg-[--primary] fixed inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="text-[40px] font-semibold text-white leading-[1.1] tracking-[-1px] text-center max-w-[500px]">
            {companyName}
          </div>
          <Badge className={`mt-4 rounded-full text-sm font-semibold px-4 py-1.5 border-0 text-white ${getBrandColor()}/80`}>
            {selectedIndustry?.name}
          </Badge>

          <div className="mt-10 bg-white/5 border border-white/10 rounded-[20px] p-6 w-full max-w-[400px] font-mono text-sm text-white/70">
            {terminalLines.map((line, idx) => (
              <div key={idx} className="min-h-[20px] leading-relaxed">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETUP WIZARD VIEW */}
      <div className="max-w-[680px] mx-auto px-6 py-12 w-full flex flex-col justify-between h-full flex-grow">
        
        {/* STEP INDICATOR */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-semibold ${
                step === 1
                  ? "bg-[--primary] text-white"
                  : step > 1
                  ? "bg-[--primary] text-white"
                  : "bg-[--surface] border border-[--hairline] text-[--steel]"
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
              </div>
              <span className={`text-xs mt-1.5 text-center ${step === 1 ? "text-[--ink] font-medium" : "text-[--steel]"}`}>
                Identity
              </span>
            </div>

            {/* Connector 1 */}
            <div className={`h-px w-16 mx-1 ${step >= 2 ? "bg-[--primary]" : "bg-[--hairline]"}`} />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-semibold ${
                step === 2
                  ? "bg-[--primary] text-white"
                  : step > 2
                  ? "bg-[--primary] text-white"
                  : "bg-[--surface] border border-[--hairline] text-[--steel]"
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
              </div>
              <span className={`text-xs mt-1.5 text-center ${step === 2 ? "text-[--ink] font-medium" : "text-[--steel]"}`}>
                Industry
              </span>
            </div>

            {/* Connector 2 */}
            <div className={`h-px w-16 mx-1 ${step >= 3 ? "bg-[--primary]" : "bg-[--hairline]"}`} />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-semibold ${
                step === 3
                  ? "bg-[--primary] text-white"
                  : "bg-[--surface] border border-[--hairline] text-[--steel]"
              }`}>
                "3"
              </div>
              <span className={`text-xs mt-1.5 text-center ${step === 3 ? "text-[--ink] font-medium" : "text-[--steel]"}`}>
                Stage
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.5px] text-[--ink]">
              Let's build your company.
            </h1>
            <p className="text-[--slate] text-base mt-2 leading-relaxed">
              You're stepping in as the new CTO. First, tell us who you are.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium text-[--ink] mb-1.5 block">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Alex Chen"
                />
                <div className="text-xs text-[--steel] mt-1.5">Optional — defaults to Alex Chen</div>
              </div>

              <div>
                <div className="w-full">
                  <span className="text-xs text-[--steel] float-right mt-1">
                    {companyName.length}/40
                  </span>
                  <label className="text-sm font-medium text-[--ink] mb-1.5 block">Company Name</label>
                </div>
                <Input
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setErrorText(null);
                  }}
                  placeholder="e.g. NovaCorp, Helix AI, Foundry..."
                  maxLength={40}
                  className={errorText ? "border-[--error] focus:border-[--error]" : ""}
                />
                {errorText && <div className="text-xs text-[--error] mt-1">{errorText}</div>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {nameChips.map((chip) => (
                    <div
                      key={chip}
                      onClick={() => {
                        setCompanyName(chip);
                        setErrorText(null);
                      }}
                      className="rounded-full bg-[--surface] border border-[--hairline] text-xs text-[--slate] px-3 py-1 cursor-pointer hover:border-[--ink] transition-colors"
                    >
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="default" className="w-full mt-8 py-3 text-base" onClick={handleNext}>
              Continue →
            </Button>
          </div>
        )}

        {/* STEP 2: INDUSTRY */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.5px] text-[--ink]">
              What does your company do?
            </h1>
            <p className="text-[--slate] text-base mt-2 leading-relaxed">
              This shapes every scenario you'll face as CTO.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
              {industries.map((ind) => {
                const isSelected = selectedIndustry?.id === ind.id;
                return (
                  <div
                    key={ind.id}
                    onClick={() => {
                      if (ind.id === "Surprise Me") {
                        handleSurpriseMe();
                      } else {
                        setSelectedIndustry(ind);
                        setErrorText(null);
                      }
                    }}
                    className={`bg-[--canvas] border rounded-[16px] p-3.5 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? "border-2 border-[--primary] bg-[--surface]"
                        : "border-[--hairline]"
                    }`}
                  >
                    <div>
                      <div className="text-xl">{ind.emoji}</div>
                      <div className="text-sm font-semibold text-[--ink] mt-1 leading-tight">{ind.name}</div>
                      <div className="text-xs text-[--steel] mt-0.5 leading-snug">{ind.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint Bar */}
            {selectedIndustry && (
              <div className="mt-4 bg-[--surface] rounded-[12px] p-4 border-l-4 border-[--blue] text-sm text-[--charcoal] leading-relaxed">
                <ExpandableText clamp={2} text={selectedIndustry.expect} />
              </div>
            )}

            {errorText && <div className="text-xs text-[--error] mt-2">{errorText}</div>}

            <div className="mt-8 flex gap-3">
              <Button variant="outline" className="px-6" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="default" className="flex-1" onClick={handleNext}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: STAGE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.5px] text-[--ink]">
              Where is your company right now?
            </h1>
            <p className="text-[--slate] text-base mt-2 leading-relaxed">
              Stage sets your budget, team size, and starting pressure.
            </p>

            <div className="mt-6 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {stages.map((stg) => {
                const isSelected = selectedStage.id === stg.id;
                return (
                  <div
                    key={stg.id}
                    onClick={() => setSelectedStage(stg)}
                    className={`bg-[--canvas] border rounded-[16px] p-4 cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? "border-2 border-[--primary]"
                        : "border-[--hairline]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Badge className={`rounded-full text-xs font-semibold px-3 py-1 border-0 ${stg.badgeColor}`}>
                        {stg.id === "Series B" ? "Series B★" : stg.name}
                      </Badge>
                      <div>
                        <div className="text-sm font-semibold text-[--ink]">{stg.id}</div>
                        <div className="text-xs text-[--slate] mt-0.5 leading-relaxed">{stg.desc}</div>
                      </div>
                    </div>
                    <div className="bg-[--surface] rounded-full text-xs text-[--steel] px-2 py-0.5 flex-shrink-0">
                      {stg.headcount}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metric Preview Panel */}
            <div className="mt-6 bg-[--surface] rounded-[16px] p-4 animate-in fade-in duration-300">
              <div className="text-xs font-semibold text-[--steel] uppercase tracking-wider mb-4">
                Starting Conditions Preview
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <MetricBar label="Budget" value={selectedStage.metrics.budget} />
                <MetricBar label="Team Morale" value={selectedStage.metrics.teamMorale} />
                <MetricBar label="Tech Debt" value={selectedStage.metrics.technicalDebt} invertColorLogic={true} />
                <MetricBar label="Velocity" value={selectedStage.metrics.productVelocity} />
                <MetricBar label="Security" value={selectedStage.metrics.securityPosture} />
                <MetricBar label="Talent" value={selectedStage.metrics.talentPipeline} />
              </div>
            </div>

            {errorText && <div className="text-xs text-[--error] mt-2">{errorText}</div>}

            <div className="mt-8 flex gap-3">
              <Button variant="outline" className="px-6" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="default" className="flex-1 text-base py-3 h-auto" onClick={handleLaunch}>
                Generate My Company →
              </Button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
