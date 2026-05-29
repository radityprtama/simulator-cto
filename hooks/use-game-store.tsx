"use client";

// Fallback safety patch for environments/extensions attempting to redefine window.fetch
if (typeof window !== "undefined") {
  (function() {
    try {
      var origFetch = window.fetch;
      if (origFetch) {
        var currentFetch = origFetch;
        try {
          Object.defineProperty(window, 'fetch', {
            get: function() { return currentFetch; },
            set: function(val) { currentFetch = val; },
            configurable: true,
            enumerable: true
          });
        } catch (e1) {
          try {
            Object.defineProperty(Window.prototype, 'fetch', {
              get: function() { return currentFetch; },
              set: function(val) { currentFetch = val; },
              configurable: true,
              enumerable: true
            });
          } catch (e2) {
            try {
              Object.defineProperty((window as any).__proto__ || {}, 'fetch', {
                get: function() { return currentFetch; },
                set: function(val) { currentFetch = val; },
                configurable: true,
                enumerable: true
              });
            } catch (e3) {
              console.warn("Could not patch window.fetch for write safety:", e3);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Fetch safety patch exception:", err);
    }
  })();
}

import React, { createContext, useContext, useState, useEffect } from "react";
import { CompanyState, PlayerStats, Badge, Scenario, Evaluation, WeeklyDigestData, Metrics, CompanyMood } from "@/lib/game.types";

interface GameContextType {
  companyState: CompanyState;
  playerStats: PlayerStats;
  badges: Badge[];
  currentScenario: Scenario | null;
  scenarioHistory: Scenario[];
  decisionCount: number;
  isGameOver: boolean;
  gameOverReason: string | null;
  gameOverType: "win" | "lose" | "fired" | "bankruptcy" | null;
  weeklyDigest: WeeklyDigestData | null;
  activeEvaluation: Evaluation | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isVolumeOn: boolean;
  
  // Actions
  startGame: () => void;
  loadNextScenario: () => Promise<void>;
  submitChoice: (choiceId: string, customText?: string) => Promise<void>;
  closeEvaluation: () => Promise<void>;
  closeWeeklyDigest: () => void;
  resetGame: () => void;
  initializeGame: (customState: CompanyState) => void;
  setVolumeOn: (on: boolean) => void;
}

const defaultInitialCompanyState: CompanyState = {
  company: {
    name: "NovaCorp",
    stage: "Series B Startup | 3 years old",
    headcount: 78,
    quarter: "Q3 2025",
    week: 1,
  },
  metrics: {
    budget: 65,
    teamMorale: 42,
    technicalDebt: 70,
    productVelocity: 55,
    ceoRelationship: 60,
    customerSatisfaction: 71,
    securityPosture: 50,
    talentPipeline: 38,
  },
  activeFlags: ["legacy_system_friction", "impending_board_review"],
  recentDecisions: [],
  companyMood: "tense",
};

const defaultInitialPlayerStats: PlayerStats = {
  xp: 0,
  level: "Junior CTO",
  scores: {
    strategic: 40,
    people: 40,
    technical: 40,
    business: 40,
    risk: 40,
  },
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [companyState, setCompanyState] = useState<CompanyState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cto_sim_state");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            const mergedCompany = { ...defaultInitialCompanyState.company, ...(parsed.company || {}) };
            const mergedMetrics = { ...defaultInitialCompanyState.metrics, ...(parsed.metrics || {}) };
            return {
              ...defaultInitialCompanyState,
              ...parsed,
              company: mergedCompany,
              metrics: mergedMetrics,
            };
          }
        } catch (e) {
          console.error("Failed parsing stored company state", e);
        }
      }
    }
    return defaultInitialCompanyState;
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cto_sim_stats");
      if (stored) {
        try { return { ...defaultInitialPlayerStats, ...JSON.parse(stored) }; } catch (e) {}
      }
    }
    return defaultInitialPlayerStats;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cto_sim_badges");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [];
  });

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cto_sim_current_scenario");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return null;
  });

  const [scenarioHistory, setScenarioHistory] = useState<Scenario[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cto_sim_history");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [];
  });

  const [decisionCount, setDecisionCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cto_sim_decision_count");
      if (stored) {
        return Number(stored) || 0;
      }
    }
    return 0;
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cto_sim_game_over") === "true";
    }
    return false;
  });

  const [gameOverReason, setGameOverReason] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cto_sim_game_over_reason") || null;
    }
    return null;
  });

  const [gameOverType, setGameOverType] = useState<"win" | "lose" | "fired" | "bankruptcy" | null>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("cto_sim_game_over_type") as any) || null;
    }
    return null;
  });

  const [isVolumeOn, setVolumeOn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cto_sim_volume") !== "false";
    }
    return true;
  });

  const [weeklyDigest, setWeeklyDigest] = useState<WeeklyDigestData | null>(null);
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Save changes to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("cto_sim_state", JSON.stringify(companyState));
      localStorage.setItem("cto_sim_stats", JSON.stringify(playerStats));
      localStorage.setItem("cto_sim_badges", JSON.stringify(badges));
      localStorage.setItem("cto_sim_history", JSON.stringify(scenarioHistory));
      localStorage.setItem("cto_sim_current_scenario", JSON.stringify(currentScenario));
      localStorage.setItem("cto_sim_decision_count", String(decisionCount));
      localStorage.setItem("cto_sim_game_over", String(isGameOver));
      localStorage.setItem("cto_sim_game_over_reason", gameOverReason || "");
      localStorage.setItem("cto_sim_game_over_type", gameOverType || "");
      localStorage.setItem("cto_sim_volume", String(isVolumeOn));
    } catch (e) {
      console.error("Failed to persist states to localStorage", e);
    }
  }, [
    companyState,
    playerStats,
    badges,
    currentScenario,
    scenarioHistory,
    decisionCount,
    isGameOver,
    gameOverReason,
    gameOverType,
    isVolumeOn,
  ]);

  const startGame = () => {
    resetGame();
    loadNextScenario();
  };

  const getLevelTitle = (xp: number): string => {
    if (xp <= 500) return "Junior CTO";
    if (xp <= 1500) return "Associate CTO";
    if (xp <= 3500) return "CTO";
    if (xp <= 6000) return "VP of Engineering";
    return "Legendary CTO";
  };

  const loadNextScenario = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyState),
      });
      if (!response.ok) {
        throw new Error("Scenario generation failed.");
      }
      const data = await response.json();
      setCurrentScenario({
        ...data.scenario,
        choices: data.choices,
        stakeholdersWatching: data.stakeholdersWatching,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Failed loading scenario", error);
      setIsLoading(false);
    }
  };

  const submitChoice = async (choiceId: string, customText?: string) => {
    if (!currentScenario) return;
    setIsSubmitting(true);

    const chosenOption = currentScenario.id === "D" || choiceId === "D"
      ? { id: "D", label: "Write a custom response", description: customText || "Typed in custom resolution", tradeoffs: "Outcome depends on quality" }
      : (currentScenario as any).choices?.find((c: any) => c.id === choiceId) || { id: choiceId, label: "Unknown Action", description: "", tradeoffs: "" };

    try {
      const response = await fetch("/api/evaluate-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: currentScenario,
          choice: chosenOption,
          customResponse: customText || null,
          companyState,
          playerStats,
        }),
      });

      if (!response.ok) {
        throw new Error("Evaluation request failed.");
      }

      const { evaluation } = await response.json() as { evaluation: Evaluation };

      // Apply changes onto State
      setCompanyState((prev) => {
        const nextMetrics = { ...prev.metrics };
        Object.entries(evaluation.metricDeltas).forEach(([key, val]) => {
          const metricKey = key as keyof Metrics;
          if (typeof val === "number") {
            const newVal = nextMetrics[metricKey] + val;
            nextMetrics[metricKey] = Math.max(0, Math.min(100, newVal));
          }
        });

        // Filter and update flags
        let nextFlags = [...prev.activeFlags];
        evaluation.newFlags.forEach((f) => {
          if (!nextFlags.includes(f)) nextFlags.push(f);
        });
        nextFlags = nextFlags.filter((f) => !evaluation.removedFlags.includes(f));

        const nextWeek = prev.company.week + 1;

        // Keep 4 recent decisions for history tracking
        const decisionText = `Week ${prev.company.week}: Resolved "${currentScenario.title}" with decision ${choiceId}.`;
        const nextRecentDecisions = [decisionText, ...prev.recentDecisions].slice(0, 5);

        return {
          ...prev,
          company: {
            ...prev.company,
            week: nextWeek,
          },
          metrics: nextMetrics,
          activeFlags: nextFlags,
          recentDecisions: nextRecentDecisions,
          companyMood: evaluation.newCompanyMood,
        };
      });

      // Update Player Stats
      setPlayerStats((prev) => {
        const nextXP = prev.xp + evaluation.xpEarned;
        const nextLevel = getLevelTitle(nextXP);

        // Update competency categories strategically
        const nextScores = { ...prev.scores };
        const scType = currentScenario.type;
        if (scType === "talent" || scType === "political") {
          nextScores.people = Math.min(100, nextScores.people + 8);
        } else if (scType === "technical") {
          nextScores.technical = Math.min(100, nextScores.technical + 8);
        } else if (scType === "crisis") {
          nextScores.risk = Math.min(100, nextScores.risk + 8);
        } else if (scType === "opportunity") {
          nextScores.strategic = Math.min(100, nextScores.strategic + 10);
        } else {
          nextScores.business = Math.min(100, nextScores.business + 8);
        }

        // Apply visual balance modifiers to matching domains based on action
        if (choiceId === "D") {
          nextScores.strategic = Math.min(100, nextScores.strategic + 5);
        }

        return {
          ...prev,
          xp: nextXP,
          level: nextLevel,
          scores: nextScores,
        };
      });

      // Update badges
      if (evaluation.badge) {
        setBadges((prev) => {
          if (!prev.some((b) => b.id === evaluation.badge!.id)) {
            return [...prev, evaluation.badge!];
          }
          return prev;
        });
      }

      setScenarioHistory((prev) => [currentScenario, ...prev]);
      setDecisionCount((prev) => prev + 1);
      setActiveEvaluation(evaluation);
      setIsSubmitting(false);

      // Check for structural GAME END conditions
      const nextWeek = companyState.company.week + 1;
      const metrics = companyState.metrics;
      
      // Compute delta-applied values for instant calculation
      const budgetAfterDiff = Math.max(0, Math.min(100, metrics.budget + (evaluation.metricDeltas.budget || 0)));
      const moraleAfterDiff = Math.max(0, Math.min(100, metrics.teamMorale + (evaluation.metricDeltas.teamMorale || 0)));
      const ceoAfterDiff = Math.max(0, Math.min(100, metrics.ceoRelationship + (evaluation.metricDeltas.ceoRelationship || 0)));
      const velocityAfterDiff = Math.max(0, Math.min(100, metrics.productVelocity + (evaluation.metricDeltas.productVelocity || 0)));

      let zeroCount = 0;
      if (budgetAfterDiff <= 0) zeroCount++;
      if (moraleAfterDiff <= 0) zeroCount++;
      if (ceoAfterDiff <= 0) zeroCount++;
      if (velocityAfterDiff <= 0) zeroCount++;

      const companyName = companyState.company.name || "your startup";

      if (ceoAfterDiff <= 0) {
        setIsGameOver(true);
        setGameOverType("fired");
        setGameOverReason(`You've been let go. The board has lost full trust in your roadmap, appointing an interim technical consultant to salvage ${companyName}'s deliverables.`);
      } else if (budgetAfterDiff <= 0) {
        setIsGameOver(true);
        setGameOverType("bankruptcy");
        setGameOverReason(`${companyName} enters solvent emergency freeze. Cash reserves have hit 0. You have 48 hours to orchestrate a pivot or file for wind-up.`);
      } else if (zeroCount >= 3) {
        setIsGameOver(true);
        setGameOverType("lose");
        setGameOverReason(`Total systemic collapse. Three of your primary operational indicators have hit absolute zero. ${companyName}'s engineering division is effectively locked.`);
      } else if (nextWeek > 12) {
        // Evaluate Win
        if (ceoAfterDiff > 40 && evaluation.newCompanyMood !== "meltdown") {
          setIsGameOver(true);
          setGameOverType("win");
          setGameOverReason(`Incredible survival! You successfully steered ${companyName} through a volatile 12-week operational corridor. Your technical choices resolved deep debt, keeping leadership's absolute trust.`);
        } else {
          setIsGameOver(true);
          setGameOverType("lose");
          setGameOverReason("The quarter ended, but you failed to keep key metrics afloat. Your standing with the CEO was too compromised, leading to an structured technical transition.");
        }
      }
    } catch (error) {
      console.error("Failed submitting choice", error);
      setIsSubmitting(false);
    }
  };

  const closeEvaluation = async () => {
    setActiveEvaluation(null);

    // If decision count is divisible by 5, load Weekly Digest before proceeding to the next scenario!
    const isDigestTurn = (decisionCount + 1) % 5 === 0;

    if (isGameOver) {
      // Game is over, don't generate next scenario
      return;
    }

    if (isDigestTurn) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/weekly-digest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recentDecisions: companyState.recentDecisions,
            companyState,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setWeeklyDigest(data.weeklyDigest);
        }
      } catch (err) {
        console.error("Failed generating weekly digest", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      await loadNextScenario();
    }
  };

  const closeWeeklyDigest = () => {
    setWeeklyDigest(null);
    if (!isGameOver) {
      loadNextScenario();
    }
  };

  const resetGame = () => {
    setCompanyState(defaultInitialCompanyState);
    setPlayerStats(defaultInitialPlayerStats);
    setBadges([]);
    setCurrentScenario(null);
    setScenarioHistory([]);
    setDecisionCount(0);
    setIsGameOver(false);
    setGameOverReason(null);
    setGameOverType(null);
    setWeeklyDigest(null);
    setActiveEvaluation(null);
    localStorage.removeItem("cto_sim_state");
    localStorage.removeItem("cto_sim_stats");
    localStorage.removeItem("cto_sim_badges");
    localStorage.removeItem("cto_sim_history");
    localStorage.removeItem("cto_sim_current_scenario");
    localStorage.removeItem("cto_sim_decision_count");
    localStorage.removeItem("cto_sim_game_over");
    localStorage.removeItem("cto_sim_game_over_reason");
    localStorage.removeItem("cto_sim_game_over_type");
  };

  const initializeGame = (customState: CompanyState) => {
    const mergedCompany = { ...defaultInitialCompanyState.company, ...(customState?.company || {}) };
    const mergedMetrics = { ...defaultInitialCompanyState.metrics, ...(customState?.metrics || {}) };
    const safeCustomState = {
      ...defaultInitialCompanyState,
      ...customState,
      company: mergedCompany,
      metrics: mergedMetrics,
    };
    setCompanyState(safeCustomState);
    setPlayerStats(defaultInitialPlayerStats);
    setBadges([]);
    setCurrentScenario(null);
    setScenarioHistory([]);
    setDecisionCount(0);
    setIsGameOver(false);
    setGameOverReason(null);
    setGameOverType(null);
    setWeeklyDigest(null);
    setActiveEvaluation(null);
    
    // Clear old storage items
    localStorage.removeItem("cto_sim_state");
    localStorage.removeItem("cto_sim_stats");
    localStorage.removeItem("cto_sim_badges");
    localStorage.removeItem("cto_sim_history");
    localStorage.removeItem("cto_sim_current_scenario");
    localStorage.removeItem("cto_sim_decision_count");
    localStorage.removeItem("cto_sim_game_over");
    localStorage.removeItem("cto_sim_game_over_reason");
    localStorage.removeItem("cto_sim_game_over_type");
    
    // Write new state
    localStorage.setItem("cto_sim_state", JSON.stringify(safeCustomState));
  };

  return (
    <GameContext.Provider
      value={{
        companyState,
        playerStats,
        badges,
        currentScenario,
        scenarioHistory,
        decisionCount,
        isGameOver,
        gameOverReason,
        gameOverType,
        weeklyDigest,
        activeEvaluation,
        isLoading,
        isSubmitting,
        isVolumeOn,
        startGame,
        loadNextScenario,
        submitChoice,
        closeEvaluation,
        closeWeeklyDigest,
        resetGame,
        initializeGame,
        setVolumeOn,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameStore() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameStore must be used within a GameProvider");
  }
  return context;
}
