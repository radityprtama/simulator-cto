import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { scenario, choice, customResponse, companyState } = await req.json();
    const ai = getGeminiClient();

    const systemInstruction = `You are the AI Game Master for "CTO Simulator" — a strategic text-based management game where you evaluate real-world engineering decisions.

Analyze the user's decision context:
- Scenario: "${scenario.title}" presented by ${scenario.from}
- Channel: ${scenario.channel}
- Problem description: "${scenario.body}"
- Option chosen: ${choice.id} (${choice.label})
- Choice detail: "${choice.description}"
- Trades discussed: "${choice.tradeoffs}"
- Current Company State: ${JSON.stringify(companyState)}

If Choice is "D" (Custom Response), the player typed:
"${customResponse || 'No input provided'}"

Your evaluation duties:
1. IMAGINE & EVALUATE the narrative consequences with ruthless, startup-world realism.
2. If choice is D (Custom Response):
   - Judge the quality of their typed text.
   - If they gave a creative, collaborative, technically sound, or highly strategic solution, reward them with positive/balanced metrics, a high experience payout (200-300 XP), and warm praise!
   - If their response is empty, highly authoritarian ("Just do it because I said so"), lazy ("I don't care, let them figure it out"), or physically/technically impossible, give them a harsh penalty in morale/CEO relationship, a low experience payout (50-75 XP), and a realistic critique.
3. Keep perfect continuous feedback. Ensure the metric deltas (+ or - integers) make logical sense based on current metrics.
4. Calculate new narrative flags or remove old ones (e.g. add "engineer_resentment" if morale crushed, remove "legacy_system_failure" if they migrated).
5. Generate a CTO Insight: A sharp professional reflection. (e.g. quoting Conway's Law, Brooks' Law, or referring to real-world CTO concepts like Refactoring debt, Bus factor, cognitive load, etc.).
6. Select a matching Badge occasionally (10-25% of cases) — return null if not deserved. E.g., id: "diplomat", label: "🤝 Diplomat", reason: "Diffused intense CEO-engineering friction with grace."

Respond in the exact JSON format matching the schema below. Ensure all fields are included.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Evaluate the scenario choice.",
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: {
              type: Type.OBJECT,
              properties: {
                choiceId: { type: Type.STRING },
                customResponse: { type: Type.STRING, nullable: true },
                immediateOutcome: { type: Type.STRING, description: "A realistic 2-3 sentence narrative describing the fallout or immediate reaction of the team and stakeholders." },
                rippleEffects: { type: Type.STRING, description: "1-2 sentences of strategic after-effects or warning signals for the coming weeks." },
                metricDeltas: {
                  type: Type.OBJECT,
                  properties: {
                    budget: { type: Type.INTEGER, description: "Delta relative to budget (e.g. -10, +5)" },
                    teamMorale: { type: Type.INTEGER, description: "Delta relative to team morale" },
                    technicalDebt: { type: Type.INTEGER, description: "Delta to technical debt" },
                    productVelocity: { type: Type.INTEGER, description: "Delta to product velocity" },
                    ceoRelationship: { type: Type.INTEGER, description: "Delta to CEO relationship" },
                    customerSatisfaction: { type: Type.INTEGER, description: "Delta to customer satisfaction" },
                    securityPosture: { type: Type.INTEGER, description: "Delta to security posture" },
                    talentPipeline: { type: Type.INTEGER, description: "Delta to talent pipeline" }
                  }
                },
                newFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "New active state flags to apply (e.g. 'frugal_mode', 'tech_debt_repayment', 'high_churn_threat')"
                },
                removedFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Existing state flags to clear based on the player decision"
                },
                xpEarned: { type: Type.INTEGER, description: "Experience points earned (50 to 300)" },
                badge: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING, description: "Emoji and short title, e.g. '🔥 Firefighter'" },
                    reason: { type: Type.STRING, description: "Reason why earned, e.g. 'Successfully contained a high-severity production outage.'" }
                  },
                  required: ["id", "label", "reason"],
                  nullable: true
                },
                ctoInsight: { type: Type.STRING, description: "Professional wisdom or quote from an engineering management classic. e.g. 'Adding manpower to a late software project makes it later (Brooks' Law).'" },
                newCompanyMood: {
                  type: Type.STRING,
                  enum: ["thriving", "stable", "tense", "crisis", "meltdown"]
                }
              },
              required: [
                "choiceId",
                "immediateOutcome",
                "rippleEffects",
                "metricDeltas",
                "newFlags",
                "removedFlags",
                "xpEarned",
                "ctoInsight",
                "newCompanyMood"
              ]
            }
          },
          required: ["evaluation"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in evaluate-choice route:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate choice." }, { status: 500 });
  }
}
