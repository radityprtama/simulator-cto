export interface Company {
  name: string;
  stage: string;
  headcount: number;
  quarter: string;
  week: number;
  industry?: string;
  tagline?: string;
  founded?: string | number;
  headquarters?: string;
  businessModel?: string;
  marketSize?: string;
  investors?: string[];
  openingNarrative?: string;
  playerName?: string;
}

export interface Metrics {
  budget: number;              // 0-100
  teamMorale: number;          // 0-100
  technicalDebt: number;       // 0-100
  productVelocity: number;     // 0-100
  ceoRelationship: number;     // 0-100
  customerSatisfaction: number;// 0-100
  securityPosture: number;     // 0-100
  talentPipeline: number;      // 0-100
}

export type CompanyMood = "thriving" | "stable" | "tense" | "crisis" | "meltdown";

export interface CompanyState {
  company: Company;
  metrics: Metrics;
  activeFlags: string[];
  recentDecisions: string[];
  companyMood: CompanyMood;
}

export interface Choice {
  id: string; // "A", "B", "C", "D"
  label: string;
  description: string;
  tradeoffs: string;
}

export interface Scenario {
  id: string;
  type: "crisis" | "opportunity" | "routine" | "political" | "technical" | "talent";
  urgency: "low" | "medium" | "high" | "critical";
  title: string;
  from: string;
  channel: "slack" | "email" | "meeting" | "phone_call" | "board_report";
  body: string;
  context: string;
  attachments?: string[];
  choices?: Choice[];
  stakeholdersWatching?: string[];
}

export interface Badge {
  id: string;
  label: string;
  reason: string;
}

export interface Evaluation {
  choiceId: string;
  customResponse: string | null;
  immediateOutcome: string;
  rippleEffects: string;
  metricDeltas: Partial<Metrics>;
  newFlags: string[];
  removedFlags: string[];
  xpEarned: number;
  badge: Badge | null;
  ctoInsight: string;
  newCompanyMood: CompanyMood;
}

export interface WeeklyDigestData {
  headline: string;
  summary: string;
  biggestWin: string;
  biggestMiss: string;
  teamPulse: string;
  ceoThought: string;
  upcomingPressure: string;
}

export interface PlayerStats {
  xp: number;
  level: string;
  scores: {
    strategic: number;
    people: number;
    technical: number;
    business: number;
    risk: number;
  };
}
