"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/hooks/use-game-store";
import { motion } from "motion/react";
import { 
  Terminal, 
  Cpu, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  Award, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Play,
  Flame,
  Bug,
  HelpCircle,
  Quote,
  Zap,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TitlePage() {
  const router = useRouter();
  const { resetGame, companyState, isVolumeOn, setVolumeOn } = useGameStore();
  const [hasSave] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("cto_sim_decision_count");
      return !!(savedCount && Number(savedCount) > 0);
    }
    return false;
  });
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("architect");

  const handleLaunchNew = () => {
    resetGame();
    localStorage.setItem("cto_sim_specialty", selectedSpecialty);
    router.push("/setup");
  };

  const handleResume = () => {
    router.push("/game");
  };

  const specialties = [
    {
      id: "architect",
      name: "PRAGMATIC ARCHITECT",
      icon: Cpu,
      desc: "Deep core infrastructure background. Focuses on tech debt mitigation, core code scalability, and absolute platform stability.",
      bonus: "Starts with subtle technical debt immunity",
      borderClass: "border-[#c2ef4e] hover:shadow-[#c2ef4e]/10",
      accent: "text-[#c2ef4e]"
    },
    {
      id: "champion",
      name: "PEOPLE'S CHAMPION",
      icon: Users,
      desc: "Fosters highly motivated, cross-functional agile teams. Extreme focus on developer velocity, alignment, and grassroots morale.",
      bonus: "Starts with elevated team morale resilience",
      borderClass: "border-[#fa7faa] hover:shadow-[#fa7faa]/10",
      accent: "text-[#fa7faa]"
    },
    {
      id: "tactician",
      name: "BUSINESS TACTICIAN",
      icon: BarChart3,
      desc: "Aligns engineering deliverables directly with market demand, executive board targets, and intense cost-tuning.",
      bonus: "Starts with bonus boardroom trust",
      borderClass: "border-[#6a5fc1] hover:shadow-[#6a5fc1]/10",
      accent: "text-[#6a5fc1]"
    },
  ];

  const coreMetrics = [
    { name: "👑 CEO Relationship", desc: "Keep boardroom trust high. A zero trust level triggers an immediate board dismissal.", icon: Zap },
    { name: "🪙 Run Rate Budget", desc: "Running out of capital forces emergency downrounds or corporate liquidation.", icon: BarChart3 },
    { name: "⚙️ Technical Debt", desc: "Hacky code increases fragility, slowing down shipping and sparking global outages.", icon: Bug },
    { name: "⚡ Product Velocity", desc: "Fail to ship major features on time and your competitors will eat your market share.", icon: Flame },
    { name: "❤️ Developer Morale", desc: "Low morale triggers core talent attrition, engineering strikes, and mass resignations.", icon: Users },
    { name: "🛡️ Security Posture", desc: "Archaic libraries leave servers open to cyber breaches, ransomware, and compliance fines.", icon: ShieldAlert }
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-[#1f1633] text-slate-100 font-sans selection:bg-[#c2ef4e]/30">
      
      {/* Decorative Starfield Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#362d5930_1px,transparent_1px),linear-gradient(to_bottom,#362d5930_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#fa7faa08_1px,transparent_1.5px)] bg-[size:24px_24px] opacity-70" />
      <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6a5fc1]/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 h-80 w-80 rounded-full bg-[#fa7faa]/5 blur-3xl" />

      {/* Floating Laptop Stickers for Immersive Vibe */}
      <div className="absolute hidden lg:flex top-28 left-8 z-20 pointer-events-none flex-col gap-4">
        <div id="sticker-incident" className="rotate-[-8deg] bg-[#fa7faa] text-[#150f23] text-[10px] font-mono tracking-wider font-extrabold px-3 py-1.5 rounded-sm border-2 border-[#150f23] shadow-[4px_4px_0_0_#150f23] uppercase">
          🚨 INCIDENT CONTROLLER
        </div>
        <div id="sticker-morale" className="rotate-[5deg] bg-[#c2ef4e] text-[#150f23] text-[9px] font-mono tracking-widest font-black px-2 py-1 rounded-sm border-2 border-[#150f23] shadow-[3px_3px_0_0_#150f23] ml-4">
          DEV MORALE: 100%
        </div>
      </div>

      <div className="absolute hidden lg:flex bottom-48 right-8 z-20 pointer-events-none flex-col gap-4 items-end">
        <div id="sticker-stack" className="rotate-[12deg] bg-[#150f23] text-white text-[10px] font-mono tracking-widest font-black px-3.5 py-2 rounded-sm border-2 border-[#362d59] shadow-[4px_4px_0_0_#fa7faa] uppercase">
          👾 STACK: EXPENSIVE
        </div>
        <div id="sticker-corridor" className="rotate-[-6deg] bg-[#c2ef4e] text-[#150f23] text-[9px] font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-sm border border-[#150f23] mr-6">
          ⚠️ 12W CORRIDOR
        </div>
      </div>

      {/* Top Header Controls Bar */}
      <header className="z-10 w-full max-w-7xl px-6 py-6 flex items-center justify-between border-b border-[#362d59]/40 bg-[#150f23]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6 text-[#c2ef4e]" />
          <div>
            <span className="font-display font-black text-sm tracking-widest text-white uppercase block">SENTINEL</span>
            <span className="font-mono text-[9px] text-[#fa7faa] tracking-wider block">CTO WAR ROOM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            id="volume-toggle"
            variant="outline"
            size="icon"
            onClick={() => setVolumeOn(!isVolumeOn)}
            className="border-[#362d59] bg-[#150f23] text-slate-400 hover:border-[#c2ef4e] hover:text-[#c2ef4e]"
            title="Toggle SFX"
          >
            {isVolumeOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {hasSave && (
            <Button
              id="header-resume-btn"
              onClick={handleResume}
              className="hidden sm:inline-flex bg-[#fa7faa] hover:bg-[#fa7faa]/95 text-[#150f23] font-bold text-xs uppercase"
            >
              Resume Career
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section Container */}
      <section className="z-10 w-full max-w-4xl text-center px-6 pt-16 pb-12 select-none">
        
        {/* Header Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#362d59] bg-[#150f23]/90 px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-[#fa7faa] uppercase font-bold">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#c2ef4e]" />
          DECISION MATRIX V2.1 ACTIVE // SIMULATOR READY
        </div>

        {/* Title Group */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl uppercase leading-none"
          >
            SENTINEL CTO
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rotate-[-2deg] inline-block bg-[#c2ef4e] text-[#150f23] font-display text-3xl sm:text-6xl font-black px-6 py-2 rounded-sm border-2 border-white shadow-[6px_6px_0_0_#fa7faa]"
          >
            SIMULATOR
          </motion.div>
        </div>

        {/* Dynamic Story Header */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mx-auto mt-10 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-sans"
        >
          {hasSave && companyState?.company?.name ? (
            <>
              Your startup, <strong className="text-white">{companyState.company.name}</strong>, is burning capital fast. As its CTO, you must steer {companyState.company.headcount || 78} highly opinionated developers, dismantle core monolith technical debt, and maintain board trust. Return to the terminal to survive your 12 critical weeks in the technical war room.
            </>
          ) : (
            <>
              Ambitious high-growth startups burn venture capital fast. As the newly installed Chief Technology Officer, you inherit 78 opinionated developers, a fragile cloud stack, compounding backlog debt, and high-intensity roadmap targets. Survive 12 weeks of organizational firefighting.
            </>
          )}
        </motion.p>
      </section>

      {/* Active Game Action Callouts */}
      <div className="z-10 w-full max-w-4xl px-6 mb-16 flex flex-col items-center">
        <Card id="cta-card" className="w-full border-[#362d59] bg-[#150f23]/75 backdrop-blur-md text-slate-100 p-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display font-extrabold text-white text-base tracking-tight uppercase">Ready to enter the gauntlet?</h4>
            <p className="font-sans text-xs text-slate-400">Choose your executive specialty profile below before launching the simulation.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {hasSave && (
              <Button
                id="cta-resume-btn"
                onClick={handleResume}
                variant="outline"
                className="w-full sm:w-auto border-[#fa7faa]/45 bg-[#150f23] text-[#fa7faa] hover:bg-[#fa7faa]/10 uppercase font-black tracking-wider text-xs h-11 px-6 px-8"
              >
                Resume Saved Career
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button
              id="cta-launch-btn"
              onClick={handleLaunchNew}
              className="w-full sm:w-auto bg-white hover:bg-slate-200 text-[#150f23] uppercase font-black tracking-wider text-xs h-11 px-8 shadow-md"
            >
              <Play className="h-3 w-3 fill-current mr-2" />
              Launch New Career
            </Button>
          </div>
        </Card>
      </div>

      {/* Specialty Selector Block */}
      <section className="z-10 w-full max-w-4xl px-6 mb-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase">SELECT YOUR CTO SPECIALIZATION</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">Different archetypes secure unique bonus perks and starting immunities designed for varied hazard parameters.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {specialties.map((spec) => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty === spec.id;
            return (
              <Card
                id={`specialty-${spec.id}`}
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`relative flex flex-col justify-between cursor-pointer border p-5 transition-all duration-300 text-slate-100 ${
                  isSelected
                    ? "border-[#c2ef4e] bg-[#150f23] shadow-lg shadow-[#c2ef4e]/10 ring-1 ring-[#c2ef4e]/30 scale-[1.02]"
                    : "border-[#362d59] bg-[#150f23]/40 hover:border-slate-500 hover:bg-[#150f23]"
                }`}
              >
                <CardHeader className="p-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-2.5 ${isSelected ? "bg-[#c2ef4e]/10 text-[#c2ef4e]" : "bg-[#1f1633] text-slate-400"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isSelected && (
                      <span className="rounded bg-[#c2ef4e] px-2 py-0.5 font-mono text-[9px] font-black text-[#150f23] uppercase tracking-wider">
                        Active Selection
                      </span>
                    )}
                  </div>
                  <CardTitle className="font-display text-sm font-extrabold text-white tracking-tight uppercase">
                    {spec.name}
                  </CardTitle>
                  <CardDescription className="font-sans text-xs text-slate-400 leading-relaxed">
                    {spec.desc}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-0 pt-4 mt-4 border-t border-[#362d59]/50 bg-transparent">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c2ef4e] uppercase font-bold tracking-wider">
                    <Award className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{spec.bonus}</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Feature Grid: Bento Details */}
      <section className="z-10 w-full max-w-4xl px-6 mb-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase">THE FRAGILE ENGINE OF OPERATIONS</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto font-sans">Every single decision updates a complex web of corporate metrics. Balance the variables carefully to avoid immediate liquidation.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {coreMetrics.map((met, idx) => {
            const Icon = met.icon;
            return (
              <Card id={`metric-card-${idx}`} key={idx} className="border-[#362d59] bg-[#150f23]/40 p-5 text-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded p-1.5 bg-[#362d59]/30 text-white">
                    <Icon className="h-4 w-4 text-[#fa7faa]" />
                  </div>
                  <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">{met.name}</h4>
                </div>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">{met.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Lore Tabs Explanations Container */}
      <section className="z-10 w-full max-w-4xl px-6 mb-16">
        <Card id="lore-card" className="border-[#362d59] bg-[#150f23]/60 text-slate-100 overflow-hidden">
          <CardHeader className="border-b border-[#362d59]/50 bg-[#150f23]/40 p-6">
            <h3 className="font-display font-extrabold text-[#c2ef4e] text-lg tracking-tight uppercase">TACTICAL WARFARE // CORE MECHANICS</h3>
            <p className="text-xs text-slate-400">Discover what makes the Sentinel CTO simulation an unforgiving and deeply analytical management game.</p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="gemini">
              <TabsList className="mb-6 bg-[#1f1633] p-1 border border-[#362d59] rounded-lg">
                <TabsTrigger value="gemini" className="text-xs uppercase font-extrabold tracking-wider text-slate-400 data-active:text-[#c2ef4e] cursor-pointer">
                  Real-time Gemini Engine
                </TabsTrigger>
                <TabsTrigger value="incident" className="text-xs uppercase font-extrabold tracking-wider text-slate-400 data-active:text-[#c2ef4e] cursor-pointer">
                  Survival Decisions
                </TabsTrigger>
                <TabsTrigger value="escalation" className="text-xs uppercase font-extrabold tracking-wider text-slate-400 data-active:text-[#c2ef4e] cursor-pointer">
                  The Weekly Digest
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="gemini" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[#c2ef4e]" />
                  <h4 className="font-display font-bold text-sm text-white uppercase">Generative Scenario Architecture</h4>
                </div>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Unlike traditional hardcoded tree-choices, your incidents are generated dynamically in real-time by the server-side <strong className="text-[#c2ef4e]">Gemini Integration Engine</strong>. The AI analyzes your startup stage, industry sector type, and historical performance records to craft perfectly tailored technical tradeoffs.
                </p>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Every run is complete unique. An AdTech scale-up facing memory leaks will face different dilemmas than a high-risk FinTech payments gateway negotiating an audit framework failure.
                </p>
              </TabsContent>

              <TabsContent value="incident" className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#fa7faa]" />
                  <h4 className="font-display font-bold text-sm text-white uppercase">High-Stakes Technical Crisis Operations</h4>
                </div>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Each week present a critical conflict scenario requiring the CTO&apos;s direct operational order. Choose to secure the stack, satisfy the business pressures of the CEO, or placate developer frustration.
                </p>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Safeguarding developer culture boosts morale, but might stall critical roadmap deliverability. Meanwhile, quick-fixing bugs with hacky solutions cuts production delays but loads code debt to fragile levels.
                </p>
              </TabsContent>

              <TabsContent value="escalation" className="space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <h4 className="font-display font-bold text-sm text-white uppercase">Dynamic End of Week Financials & Audits</h4>
                </div>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Upon resolving the week&apos;s incident, receive a comprehensive **Weekly Digest Audit Report**. This reviews performance ratings, cash depletion speeds, developer burn indexes, and board observations.
                </p>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Navigate the regulatory hurdles successfully and complete Week 12 to earn high-rank legendary executive badges and global high scores.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* Venture Capital Backers / Micro Reviews */}
      <section className="z-10 w-full max-w-4xl px-6 mb-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase">BOARDROOM FEEDBACK & CRITIQUES</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">Read what top-tier partners and mock board chairs have to say about this challenging simulator.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card id="review-1" className="border-[#362d59] bg-[#150f23]/40 p-5 text-slate-100">
            <CardContent className="p-0 space-y-3">
              <Quote className="h-6 w-6 text-[#fa7faa] opacity-30" />
              <p className="font-sans text-xs italic text-slate-300 leading-relaxed">
                &quot;We hired four consecutive executive recruiters trying to find a CTO who understands that refactoring our billing framework is secondary to hitting Series C targets. This simulator showed exactly why shipping fast while tech-debt is 90% is basically playing developer roulette.&quot;
              </p>
              <div className="border-t border-[#362d59]/40 pt-3 flex items-center justify-between">
                <span className="font-display font-extrabold text-[10px] tracking-wider text-white uppercase">VANCE BENCHMARK</span>
                <span className="font-mono text-[9px] text-[#fa7faa]">General Partner, Benchmark Capital</span>
              </div>
            </CardContent>
          </Card>

          <Card id="review-2" className="border-[#362d59] bg-[#150f23]/40 p-5 text-slate-100">
            <CardContent className="p-0 space-y-3">
              <Quote className="h-6 w-6 text-[#fa7faa] opacity-30" />
              <p className="font-sans text-xs italic text-slate-300 leading-relaxed">
                &quot;The incident prompt loops here are scary accurate. It perfectly captures how the CEO asks you to migrate the core platform to Kubernetes over the weekend for &apos;scalability&apos;, while the engineering lead threatens to quit if they configure one more YAML file.&quot;
              </p>
              <div className="border-t border-[#362d59]/40 pt-3 flex items-center justify-between">
                <span className="font-display font-extrabold text-[10px] tracking-wider text-white uppercase">MARLIN SEQUOIA</span>
                <span className="font-mono text-[9px] text-[#fa7faa]">Managing Director, Sequoia Partners</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) with Accordion */}
      <section className="z-10 w-full max-w-4xl px-6 mb-20">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase">FREQUENTLY ASKED SYSTEM FAQS</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">Get insights on game design, model parameters, and survivability index equations.</p>
        </div>

        <Card id="faq-card" className="border-[#362d59] bg-[#150f23]/60 p-6 text-slate-100">
          <Accordion defaultValue={[]} className="space-y-2">
            <AccordionItem id="faq-item-1" value="faq-1" className="bg-[#1f1633]/60 rounded-lg border border-[#362d59]/60 px-4 py-1">
              <AccordionTrigger className="font-display font-bold text-xs text-white uppercase hover:no-underline hover:text-[#c2ef4e] transition-colors py-4">
                What is the ultimate goal in the Sentinel CTO Simulator?
              </AccordionTrigger>
              <AccordionContent className="font-sans text-xs text-slate-400 leading-relaxed pb-4">
                You must survive 12 consecutive fiscal weeks without any of your 6 critical organizational metrics dropping to 0% (or Technical Debt hitting 100%). Successful completion awards game evaluation metrics, badges, and high scores.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem id="faq-item-2" value="faq-2" className="bg-[#1f1633]/60 rounded-lg border border-[#362d59]/60 px-4 py-1">
              <AccordionTrigger className="font-display font-bold text-xs text-white uppercase hover:no-underline hover:text-[#c2ef4e] transition-colors py-4">
                How does the AI dynamic generator influence my page scenario incidents?
              </AccordionTrigger>
              <AccordionContent className="font-sans text-xs text-slate-400 leading-relaxed pb-4">
                The generator reads your customized profile parameters (Company name, funding stage, industry, and specialties) and uses server-side models to output custom technical alerts with distinct, humorous corporate flavor context.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem id="faq-item-3" value="faq-3" className="bg-[#1f1633]/60 rounded-lg border border-[#362d59]/60 px-4 py-1">
              <AccordionTrigger className="font-display font-bold text-xs text-white uppercase hover:no-underline hover:text-[#c2ef4e] transition-colors py-4">
                Can I run out of cash/budget?
              </AccordionTrigger>
              <AccordionContent className="font-sans text-xs text-slate-400 leading-relaxed pb-4">
                Yes. Running key budget metrics below 15% triggers emergency board meetings, forcing massive staffing layoffs or immediate corporate failure. Spend wisely to support high shipping velocity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem id="faq-item-4" value="faq-4" className="bg-[#1f1633]/60 rounded-lg border border-[#362d59]/60 px-4 py-1">
              <AccordionTrigger className="font-display font-bold text-xs text-white uppercase hover:no-underline hover:text-[#c2ef4e] transition-colors py-4">
                How do the Specialty immunities work?
              </AccordionTrigger>
              <AccordionContent className="font-sans text-xs text-slate-400 leading-relaxed pb-4">
                Choosing a specialty applies a hidden modifier to metric changes during decisions: Pragmatic Architects reduce the intensity of tech debt accumulation, People&apos;s Champions buffer team morale attrition, and Business Tacticians stabilize executive board alignment under friction.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </section>

      {/* Call to Action (CTA) block */}
      <section className="z-10 w-full max-w-4xl px-6 mb-20 text-center">
        <Card id="bottom-cta-card" className="border-2 border-[#c2ef4e]/30 bg-[radial-gradient(circle_at_top,#42208260,transparent_75%)] bg-[#150f23] p-10 flex flex-col items-center">
          <Terminal className="h-10 w-10 text-[#c2ef4e] mb-4 animate-bounce" />
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">SURVIVE THE TECH WAR ROOM</h3>
          <p className="font-sans text-xs sm:text-sm text-slate-405 mt-2 max-w-md mx-auto leading-relaxed">
            Configure your technical company and step into the shoes of a venture-backed tech leader facing dynamic, real-time crisis scenarios of legendary complexity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
            {hasSave && (
              <Button
                id="bottom-resume-btn"
                onClick={handleResume}
                variant="outline"
                className="w-full sm:w-auto border-[#fa7faa]/45 bg-[#1f1633] text-[#fa7faa] hover:bg-[#fa7faa]/15 uppercase font-bold text-xs tracking-wider h-12 px-8"
              >
                Resume Active Career
              </Button>
            )}
            <Button
              id="bottom-launch-btn"
              onClick={handleLaunchNew}
              className="w-full sm:w-auto bg-[#c2ef4e] hover:bg-[#c2ef4e]/90 text-[#150f23] uppercase font-black text-xs tracking-wider h-12 px-10 shadow-lg shadow-[#c2ef4e]/10 group"
            >
              Start Game Simulation
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer information section */}
      <footer className="z-10 w-full mt-auto border-t border-[#362d59]/40 bg-[#150f23]/90 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-slate-500" />
            <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">
              SECTOR SECURITY LEVEL: CONFIDENTIAL CTO PROTOCOLS
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[10px] uppercase text-slate-500 font-bold">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#c2ef4e]" />
              <span>12 Simulation Weeks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-[#fa7faa]" />
              <span>Gemini Intelligent Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#6a5fc1]" />
              <span>Port 3000 Active</span>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
