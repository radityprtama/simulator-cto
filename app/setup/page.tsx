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
} from "@/components/retro-tui";

interface Industry {
  id: string;
  name: string;
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
    teamMorale: number;
    technicalDebt: number;
    productVelocity: number;
    ceoRelationship: number;
    talentPipeline: number;
  };
}

const industries: Industry[] = [
  { id: "Healthcare", name: "HEALTHCARE / MEDTECH", desc: "HIPAA COMPLIANCE", expect: "[HEALTHCARE] HIPAA COMPLIANCE MANDATORY. EXPECT EMR INTEGRATIONS, PATIENT DATA AUDITS, AND REGULATORY REVIEW CYCLES EVERY QUARTER." },
  { id: "GovTech", name: "GOVTECH / PUBLIC SECTOR", desc: "PROCUREMENT & MAINFRM", expect: "[GOVTECH] SLUGGISH VELOCITY EXPECTED. PRODUCT DECISIONS MUST PASS THROUGH MULTI-LAYERED AGENCY REVIEWS." },
  { id: "SaaS", name: "SAAS / B2B SOFTWARE", desc: "SLAS & ENTERPRISE DEALS", expect: "[SAAS] HIGH CONTRACT PRESSURE. ENTERPRISE CLIENT DEALS REQUIRE CUSTOM APIS AND STRICT SLA COMPLIANCE." },
  { id: "E-Commerce", name: "E-COMMERCE / MARKETPLACE", desc: "TRAFFIC SPIKES & SCAL", expect: "[E-COMMERCE] SCALABILITY TEST. TRAFFIC SURGES DURING SALES WILL STRESS CHECKOUT DATABASES." },
  { id: "Fintech", name: "FINTECH / PAYMENTS", desc: "PCI-DSS & FRAUD REGUL", expect: "[FINTECH] PCI COMPLIANCE REQUIRED. LEDGER TRANSACTIONS DEMAND ABSOLUTE ZERO-FAULT TOLERANCE." },
  { id: "Edtech", name: "EDTECH", desc: "SCHOOL DISTRICT LOADS", expect: "[EDTECH] CLASSROOM LOAD SPIKES. SEASONAL SURGES WHEN SCHOOLS REOPEN PUSH SERVERS TO LIMITS." },
  { id: "AI / ML", name: "AI / ML PLATFORM", desc: "GPU BILLS & MODEL DEBT", expect: "[AI/ML] BLAZING VELOCITY BUT MASSIVE TECHNICAL DEBT. RUNWAY BURNS QUICKLY ON GPU INSTANCES." },
  { id: "Cybersecurity", name: "CYBERSECURITY", desc: "SOC2 & ZERO-DAY THREAT", expect: "[CYBERSECURITY] SOC2 COMPLIANCE MANDATORY. INCIDENT RESOLUTION AND ZERO-DAY EVENTS ARE CRITICAL." },
  { id: "Logistics", name: "LOGISTICS / SUPPLY CHAIN", desc: "3PL APIS & HARDR SYNC", expect: "[LOGISTICS] API INTEGRATION VOLATILITY. CARRIER SYNCS AND WAREHOUSE ENDPOINTS POSE RISKS." },
  { id: "Proptech", name: "PROPTECH / REAL ESTATE", desc: "MLS DATA & CONTRACTS", expect: "[PROPTECH] PIPELINE INSTABILITY. MLS DATA IS BRITTLE; TRANSACTIONS REQUIRE RIGID COMPLIANCE." },
  { id: "Biotech", name: "BIOTECH / LIFE SCIENCES", desc: "FDA & RESEARCH PIPES", expect: "[BIOTECH] RESEARCH STALLS AND SLOW ITERATION CYCLES; SYSTEM DATA ENCRYPTION SECURITY IS KEY." },
  { id: "Gaming", name: "GAMING", desc: "LIVE OPS & PATCH LOOPS", expect: "[GAMING] HIGH VOLATILITY. SYSTEM OUTAGES SPARK DISGRUNTLED PLAYER REACTIONS ACROSS CHANNELS." },
  { id: "Insurtech", name: "INSURTECH", desc: "ACTUARIAL DATA INTEGR", expect: "[INSURTECH] COMPLICATED ACTUARIAL CALCULATIONS AND LEGACY UNDERWRITING CODE BACKLOGS." },
  { id: "Cleantech", name: "CLEANTECH / CLIMATE", desc: "IOT SENSORS & METRICS", expect: "[CLEANTECH] PHYSICAL SENSOR HARDWARE LAGS AND BRITTLE OUTDOOR CORE TELEMETRY PACKETS." },
  { id: "Consumer App", name: "CONSUMER APP / SOCIAL", desc: "VIRAL SCALE & APP STO", expect: "[CONSUMER] VIRAL SCALABILITY INCIDENTS AND APP STORE REVIEW REJECTIONS THREATEN RETENTION." },
  { id: "Mental Health", name: "MENTAL HEALTH / WELLNESS", desc: "PATIENT SECURITY & CAR", expect: "[MENTAL HEALTH] EXTENSIVE ENCRYPTION BOUNDARIES REQUIRED. ZERO-ERROR CLINICAL SAFETY COMPLIANCE." },
  { id: "Legaltech", name: "LEGALTECH", desc: "REGULATORY COMPLIANCE", expect: "[LEGALTECH] DATA SEGREGATION AUDITS AND HIGH SECURITY COMPLIANCE REQUIREMENTS." },
  { id: "Manufacturing", name: "MANUFACTURING / IIOT", desc: "OT NETWORK THREATS", expect: "[MANUFACTURING] VULNERABILITIES IN OPERATIONAL MAINFRM NETWORKS CAN HALT ASSEMBLY LINES." },
  { id: "Spacetech", name: "SPACETECH / AEROSPACE", desc: "LIFE-CRITICAL CODE", expect: "[SPACETECH] LIFE-CRITICAL FLIGHT SIMULATION STAKES. ABSOLUTE SYSTEM CALCULATIONS AND VERIFICATION." },
  { id: "Data & Analytics", name: "DATA & ANALYTICS", desc: "GDPR & QUALITY DEBT", expect: "[DATA] CLEANING DATA LAKES WHILE SATISFYING SCRUTINIZING REGULATORY AUDITS." },
  { id: "Media & Entertainment", name: "MEDIA & ENTERTAINMENT", desc: "CDN COSTS & DRM PIPES", expect: "[MEDIA] INTENTIONAL CONTROLS FOR BANDWIDTH COST DEVIATION AND STREAM RETRIES." },
  { id: "Surprise Me", name: "??? SURPRISE ME", desc: "RANDOM SECTOR CHAOS", expect: "[SURPRISE ME] EMBRACE OPERATIONAL CHAOS. SECTOR ASSIGNED WILL FEATURE COMPLETELY RANDOM RISK MODIFIERS." }
];

const stages: Stage[] = [
  { id: "Pre-Seed", name: "PRE-SEED / MVP", headcount: "1–10", desc: '"PURE CHAOS. NO PROCESS. SHIP OR DIE."', metrics: { budget: 40, teamMorale: 60, technicalDebt: 25, productVelocity: 75, ceoRelationship: 50, talentPipeline: 30 } },
  { id: "Seed", name: "SEED", headcount: "10–30", desc: '"FINDING PMF. RUNNING ON FUMES AND HOPE."', metrics: { budget: 50, teamMorale: 56, technicalDebt: 42, productVelocity: 68, ceoRelationship: 55, talentPipeline: 45 } },
  { id: "Series A", name: "SERIES A", headcount: "30–80", desc: '"FIRST REAL TEAM. FIRST REAL PROBLEMS."', metrics: { budget: 60, teamMorale: 50, technicalDebt: 55, productVelocity: 55, ceoRelationship: 58, talentPipeline: 55 } },
  { id: "Series B", name: "SERIES B (DEFAULT)", headcount: "80–200", desc: '"SCALE OR DIE. COMPLEXITY CREEPING IN."', metrics: { budget: 65, teamMorale: 42, technicalDebt: 70, productVelocity: 48, ceoRelationship: 60, talentPipeline: 38 } },
  { id: "Series C+", name: "SERIES C+ / GROWTH", headcount: "200+", desc: '"POLITICS, PROCESS, SLOWING VELOCITY."', metrics: { budget: 75, teamMorale: 38, technicalDebt: 82, productVelocity: 35, ceoRelationship: 62, talentPipeline: 65 } },
  { id: "Bootstrap", name: "BOOTSTRAPPED", headcount: "10–50", desc: '"PROFITABLE BUT LEAN. EVERY DOLLAR COUNTS."', metrics: { budget: 80, teamMorale: 65, technicalDebt: 48, productVelocity: 62, ceoRelationship: 55, talentPipeline: 40 } }
];

export default function SetupPage() {
  const router = useRouter();
  const { initializeGame } = useGameStore();

  const [step, setStep] = useState(1);
  const [operatorName, setOperatorName] = useState("Alex Chen");
  const [companyName, setCompanyName] = useState("");
  const [industryIndex, setIndustryIndex] = useState(0); // For grid navigation in Step 2
  const [stageIndex, setStageIndex] = useState(3); // Default Series B index 3
  const [errorText, setErrorText] = useState<string | null>(null);

  // Loading TUI state
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [bootFinished, setBootFinished] = useState(false);
  const [flashing, setFlashing] = useState(false);

  // Preset companies
  const presetCompanies = ["NOVACORP", "HELIX AI", "STACKLY", "PRISM", "FOUNDRY"];

  useEffect(() => {
    // Keyboard navigation based on active step
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoadingAnimation) {
        if (bootFinished) {
          // Any key triggers flash and router push
          e.preventDefault();
          handleFlashAndRoute();
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (step > 1) {
          setErrorText(null);
          setStep((prev) => prev - 1);
        } else {
          router.push("/");
        }
        return;
      }

      // Step 2 Industry selection keyboard control
      if (step === 2) {
        const rows = 11;
        const cols = 2;
        const totalItems = industries.length;

        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          setIndustryIndex((prev) => (prev + cols) % totalItems);
        } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          setIndustryIndex((prev) => (prev - cols + totalItems) % totalItems);
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          e.preventDefault();
          setIndustryIndex((prev) => (prev % cols === 0 ? prev + 1 : prev - 1));
        } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          e.preventDefault();
          setIndustryIndex((prev) => (prev % cols === 1 ? prev - 1 : prev + 1));
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleConfirmIndustry();
        }
      }

      // Step 3 Stage selection keyboard control
      if (step === 3) {
        const totalStages = stages.length;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          setStageIndex((prev) => (prev + 1) % totalStages);
        } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          setStageIndex((prev) => (prev - 1 + totalStages) % totalStages);
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleLaunchSimulation();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, industryIndex, stageIndex, isLoadingAnimation, bootFinished, companyName, operatorName]);

  const handleConfirmIdentity = () => {
    if (!companyName.trim()) {
      setErrorText("COMPANY NAME REQUIRED.");
      return;
    }
    if (companyName.trim().length < 2) {
      setErrorText("COMPANY NAME MUST BE AT LEAST 2 CHARACTERS.");
      return;
    }
    setErrorText(null);
    setStep(2);
  };

  const handleConfirmIndustry = () => {
    setErrorText(null);
    setStep(3);
  };

  const handleLaunchSimulation = () => {
    setIsLoadingAnimation(true);
    setErrorText(null);

    // Call API background config builder
    const finalIndustry = industries[industryIndex].id === "Surprise Me" 
      ? industries[Math.floor(Math.random() * (industries.length - 1))].id 
      : industries[industryIndex].id;

    const payload = {
      companyName: companyName.trim().toUpperCase(),
      industry: finalIndustry,
      companyStage: stages[stageIndex].id,
      playerName: operatorName.trim() || "Operator",
    };

    const apiPromise = fetch("/api/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Simulation workspace build failed.");
      return res.json();
    });

    const logs = [
      `INITIALIZING ${companyName.trim().toUpperCase()} ENTERPRISE SYSTEMS...`,
      "",
      "REGISTERING COMPANY................. [OK]",
      "BUILDING ENGINEERING TEAM........... [OK]",
      "DEPLOYING TECHNICAL DEBT............ [OK]",
      "CALIBRATING CEO PARANOIA............ [OK]",
      "GENERATING CRISIS QUEUE............. [OK]",
      "PLANTING DISGRUNTLED ENGINEERS...... [OK]",
      "SCHEDULING OUTAGE FOR WEEK 3........ [OK]",
      "",
      "════════════════════════════════════════════",
      `${companyName.trim().toUpperCase()} OPERATIONAL. GOOD LUCK, ${operatorName.trim().toUpperCase()}.`,
      "════════════════════════════════════════════",
      "",
      "PRESS ANY KEY TO CONTINUE_",
    ];

    // Reveal boot logs
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setBootLogs((prev) => [...prev, logs[index]]);
        index++;
      } else {
        clearInterval(interval);
        setBootFinished(true);

        // Preload layout data in store
        apiPromise.then((data) => {
          (window as any)._preloadedData = data;
        }).catch((err) => {
          console.error("API preloading error:", err);
        });
      }
    }, 200);
  };

  const handleFlashAndRoute = () => {
    setFlashing(true);
    setTimeout(() => {
      const data = (window as any)._preloadedData;
      if (data) {
        initializeGame(data);
      } else {
        // Fallback if promise not completed
        initializeGame({
          company: {
            name: companyName.trim().toUpperCase(),
            stage: stages[stageIndex].id + " Stage",
            headcount: parseInt(stages[stageIndex].headcount.split("–")[0]) || 50,
            quarter: "Q3 2026",
            week: 1,
            playerName: operatorName,
            industry: industries[industryIndex].id
          },
          metrics: {
            budget: stages[stageIndex].metrics.budget,
            teamMorale: stages[stageIndex].metrics.teamMorale,
            technicalDebt: stages[stageIndex].metrics.technicalDebt,
            productVelocity: stages[stageIndex].metrics.productVelocity,
            ceoRelationship: stages[stageIndex].metrics.ceoRelationship,
            customerSatisfaction: 60,
            securityPosture: 50,
            talentPipeline: stages[stageIndex].metrics.talentPipeline
          },
          activeFlags: ["legacy_system_friction"],
          recentDecisions: [],
          companyMood: "stable"
        });
      }
      router.push("/game");
    }, 150);
  };

  const selectedStage = stages[stageIndex];
  const progressRatio = step === 1 ? 8 : step === 2 ? 16 : 30;
  const progressPercentText = step === 1 ? "1 OF 3" : step === 2 ? "2 OF 3" : "3 OF 3";

  // Render setup screens
  return (
    <main className={`bg-[var(--canvas)] min-h-screen flex flex-col items-center justify-center p-4 relative select-none ${flashing ? "white-flash" : ""}`}>
      
      {isLoadingAnimation ? (
        /* LOADING / BOOT SCREEN */
        <div className="w-full max-w-[120ch] min-h-[30ch] flex flex-col justify-start">
          <pre className="font-mono text-left whitespace-pre-wrap leading-tight text-[var(--text-standard)]">
            {bootLogs.map((line, idx) => (
              <div key={idx} className="min-h-[1.2em]">
                {line === "PRESS ANY KEY TO CONTINUE_" && bootFinished ? (
                  <span>
                    PRESS ANY KEY TO CONTINUE<span className="text-[var(--primary)] cursor-blink">_</span>
                  </span>
                ) : (
                  line
                )}
              </div>
            ))}
          </pre>
        </div>
      ) : (
        /* WIZARD CONTAINER */
        <div className="w-full max-w-[90ch] flex flex-col gap-6">
          
          {/* Header Banners */}
          <div className="text-center font-mono text-[var(--primary)] leading-[1.1] mb-2">
            {step === 1 && (
              <pre className="whitespace-pre">
                ╔══════════════════════════════════════════════════════════╗<br />
                ║        ENTERPRISE PROFILE CONFIGURATION // STEP 1/3      ║<br />
                ╚══════════════════════════════════════════════════════════╝
              </pre>
            )}
            {step === 2 && (
              <pre className="whitespace-pre">
                ╔══════════════════════════════════════════════════════════╗<br />
                ║         SECTOR CLASSIFICATION MODULE // STEP 2/3         ║<br />
                ╚══════════════════════════════════════════════════════════╝
              </pre>
            )}
            {step === 3 && (
              <pre className="whitespace-pre">
                ╔══════════════════════════════════════════════════════════╗<br />
                ║         OPERATIONAL STAGE CLASSIFICATION // STEP 3/3     ║<br />
                ╚══════════════════════════════════════════════════════════╝
              </pre>
            )}
          </div>

          {/* Wizard Progress Bar */}
          <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-standard)]">
            <span>[</span>
            <span className="text-[var(--primary)] font-bold">
              {"█".repeat(progressRatio)}{"░".repeat(30 - progressRatio)}
            </span>
            <span>]</span>
            <span>STEP {progressPercentText}</span>
          </div>

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-[var(--primary)] tracking-wide font-bold">
                === OPERATOR IDENTIFICATION ===
              </span>
              
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-[var(--text-standard)]">
                  ENTER YOUR DESIGNATION (OPTIONAL):
                </span>
                <TerminalInput
                  value={operatorName}
                  onChange={(val) => setOperatorName(val)}
                  prefix="CTO@SYS:~# "
                  charLimit={30}
                />
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className="font-mono text-xs text-[var(--text-bright)]">
                  ENTER COMPANY NAME (REQUIRED):
                </span>
                <TerminalInput
                  value={companyName}
                  onChange={(val) => {
                    setCompanyName(val);
                    setErrorText(null);
                  }}
                  prefix="CORP@SYS:~# "
                  charLimit={40}
                  onSubmit={handleConfirmIdentity}
                />
                <span className="font-mono text-[10px] text-[var(--text-muted)] mt-1">
                  CHAR LIMIT: 40 // MIN: 2 CHARS
                </span>
              </div>

              {errorText && (
                <span className="font-mono text-xs text-[var(--text-alert)] font-bold">
                  ❗ {errorText}
                </span>
              )}

              {/* Presets */}
              <div className="border border-[var(--matrix-line)] p-4 flex flex-col gap-2">
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  QUICK-LOAD PRESETS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetCompanies.map((preset) => (
                    <PromptButton
                      key={preset}
                      label={preset}
                      onClick={() => {
                        setCompanyName(preset);
                        setErrorText(null);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Confirmation actions */}
              <div className="flex justify-between items-center mt-4 border-t border-[var(--matrix-line)] pt-3">
                <PromptButton
                  label="CONFIRM AND CONTINUE"
                  active={true}
                  onClick={handleConfirmIdentity}
                />
                <PromptButton
                  label="BACK TO MENU"
                  onClick={() => router.push("/")}
                />
              </div>
            </div>
          )}

          {/* STEP 2: INDUSTRY SELECTION */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-[var(--primary)] tracking-wide font-bold">
                === SELECT OPERATING SECTOR ===
              </span>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                USE ARROW KEYS OR CLICK TO NAVIGATE. ENTER TO CONFIRM.
              </span>

              {/* Grid 11 rows x 2 cols */}
              <div className="border border-[var(--matrix-line)] p-1 text-xs">
                <table className="w-full font-mono border-collapse select-none">
                  <tbody>
                    {Array.from({ length: 11 }).map((_, rowIdx) => {
                      const col1Idx = rowIdx * 2;
                      const col2Idx = rowIdx * 2 + 1;
                      const ind1 = industries[col1Idx];
                      const ind2 = industries[col2Idx];

                      return (
                        <tr key={rowIdx} className="border-b border-[var(--matrix-line)] last:border-b-0">
                          <td className="w-1/2 p-1 border-r border-[var(--matrix-line)]">
                            {ind1 && (
                              <PromptButton
                                label={ind1.name}
                                active={industryIndex === col1Idx}
                                onClick={() => setIndustryIndex(col1Idx)}
                                className="w-full text-left"
                              />
                            )}
                          </td>
                          <td className="w-1/2 p-1">
                            {ind2 && (
                              <PromptButton
                                label={ind2.name}
                                active={industryIndex === col2Idx}
                                onClick={() => setIndustryIndex(col2Idx)}
                                className="w-full text-left"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sector Briefing panel */}
              <div className="border border-[var(--primary)] p-4 flex flex-col gap-1 bg-[var(--canvas)]">
                <span className="font-mono text-xs text-[var(--primary)] font-bold">
                  ┌─[ SECTOR BRIEFING ]─────────────────────────────────────┐
                </span>
                <div className="font-mono text-xs leading-relaxed text-[var(--text-standard)] px-2 py-1">
                  {industries[industryIndex].expect}
                </div>
                <span className="font-mono text-xs text-[var(--primary)] font-bold">
                  └──────────────────────────────────────────────────────────┘
                </span>
              </div>

              {/* Confirm Actions */}
              <div className="flex justify-between items-center mt-2 border-t border-[var(--matrix-line)] pt-3">
                <PromptButton
                  label="CONFIRM SECTOR"
                  active={true}
                  onClick={handleConfirmIndustry}
                />
                <PromptButton
                  label="BACK"
                  onClick={() => setStep(1)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: STAGE SELECTION */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-[var(--primary)] tracking-wide font-bold">
                === SELECT CURRENT OPERATIONAL STAGE ===
              </span>

              {/* Left stages list + Right preview splits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Stages List */}
                <div className="border border-[var(--matrix-line)] p-2 flex flex-col gap-2 h-[350px] overflow-y-auto no-scrollbar">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] border-b border-[var(--matrix-line)] pb-1 mb-1">
                    [ STAGE SELECT ]
                  </span>
                  
                  {stages.map((stg, idx) => {
                    const isActive = stageIndex === idx;
                    return (
                      <div
                        key={stg.id}
                        onClick={() => setStageIndex(idx)}
                        className={`p-2 border cursor-default select-none font-mono ${
                          isActive 
                            ? "border-[var(--primary)] text-[var(--primary)]" 
                            : "border-[var(--matrix-line)] text-[var(--text-standard)]"
                        }`}
                      >
                        <div className="flex justify-between font-bold text-xs">
                          <span>{isActive ? `> ${stg.name}` : `  ${stg.name}`}</span>
                          <span className="text-[var(--text-muted)]">{stg.headcount} HEADCOUNT</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-standard)] mt-1 ml-4 italic">
                          {stg.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Metrics Preview */}
                <div className="border border-[var(--primary)] p-4 flex flex-col gap-3 bg-[var(--canvas)] h-[350px]">
                  <span className="font-mono text-xs text-[var(--primary)] font-bold">
                    ┌─[ STARTING CONDITIONS PREVIEW ]─────────────────────────┐
                  </span>
                  <div className="flex flex-col gap-3 px-1 py-2 justify-center flex-1">
                    <AsciiBar label="BUDGET" value={selectedStage.metrics.budget} width={16} />
                    <AsciiBar label="MORALE" value={selectedStage.metrics.teamMorale} width={16} />
                    <AsciiBar label="T.DEBT" value={selectedStage.metrics.technicalDebt} width={16} />
                    <AsciiBar label="VELOC" value={selectedStage.metrics.productVelocity} width={16} />
                    <AsciiBar label="CEO.TR" value={selectedStage.metrics.ceoRelationship} width={16} />
                    <AsciiBar label="TALENT" value={selectedStage.metrics.talentPipeline} width={16} />
                  </div>
                  <span className="font-mono text-xs text-[var(--primary)] font-bold">
                    └──────────────────────────────────────────────────────────┘
                  </span>
                </div>

              </div>

              {/* Initialize Actions */}
              <div className="flex justify-between items-center mt-2 border-t border-[var(--matrix-line)] pt-3">
                <PromptButton
                  label="INITIALIZE SIMULATION"
                  active={true}
                  onClick={handleLaunchSimulation}
                />
                <PromptButton
                  label="BACK"
                  onClick={() => setStep(2)}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </main>
  );
}
