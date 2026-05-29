import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const companyState = await req.json();
    const ai = getGeminiClient();

    const companyName = companyState?.company?.name || "your startup";
    const systemInstruction = `You are the AI Game Master for "CTO Simulator" — a strategic text-based management game where the player acts as a newly appointed Chief Technology Officer at "${companyName}."
Your role is to:
1. Generate dynamic, highly realistic workplace scenarios based on the company's current state.
2. Present hard decisions for the player to solve. Make sure there is no obvious "correct" answer, and everything has interesting tradeoffs.
3. Keep perfect narrative continuity.

Follow these scenario generation guidelines:
- SEVERITY MAPPING:
  * "thriving" -> Mostly opportunities, occasional routine friction.
  * "stable" -> Mix of routine and medium challenges, rare cracks.
  * "tense" -> Mostly problems, political friction, talent issues, technical debt.
  * "crisis" -> High-urgency back-to-back crises, compounding issues.
  * "meltdown" -> Severe P0 incidents, mass resignation, catastrophic budget crises.

- METRIC TRIGGERS (if a metric is dangerously low or high, prioritize a scenario related to it):
  * budget < 30 -> budget emergency, forced layoff, cost-cutting pressure.
  * teamMorale < 30 -> talent emergency, mass resignations, high-profile departure threat.
  * technicalDebt > 80 -> severe P0 outage, security vulnerability, complete delivery freeze.
  * productVelocity < 30 -> executive frustration, CEO micro-management pressure, major delivery delay threat.
  * ceoRelationship < 30 -> survival threat, board intervention, public micromanagement.
  * securityPosture < 35 -> active security breach, compliance audit failure, ransomware/vulnerability.
  * talentPipeline < 25 -> crucial hire blocked, key leader poaching.

- WRITING STYLE:
  * Do NOT write like a textbook. Write as REAL raw workplace communications: a tense Slack from an engineer, a polite but frosty email from the CFO, a frantic calendar invite from the CEO, or a technical logs attachment.
  * Use actual technical jargon (Docker, Kubernetes microservices, Kafka lag, DB pool exhaustion, SQL injections, SOC2, sprint velocity, burn rates, SLA, AWS bill, legacy PHP monolith, etc.).
  * Include clear emotional undertones (passive-aggressive requests, real anxiety, startup hyper-growth excitement).
  * Give choice D as exactly the custom answer option:
    ID: "D"
    label: "Write a custom response"
    description: "Type your own strategic solution."
    tradeoffs: "Outcome depends entirely on the feasibility and quality of your proposed resolution."

Now, craft the next story-rich scenario for the current state: ${JSON.stringify(companyState)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate the next game scenario.",
      config: {
        systemInstruction,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique snake_case identifier" },
                type: { 
                  type: Type.STRING, 
                  description: "Genre of scenario",
                  enum: ["crisis", "opportunity", "routine", "political", "technical", "talent"]
                },
                urgency: {
                  type: Type.STRING,
                  enum: ["low", "medium", "high", "critical"]
                },
                title: { type: Type.STRING, description: "Punchy dramatic headline" },
                from: { type: Type.STRING, description: "Name and title of message sender, e.g. 'Sarah Jenkins (VP Finance)' or 'Logan Wright (Principal Systems Architect)'" },
                channel: {
                  type: Type.STRING,
                  enum: ["slack", "email", "meeting", "phone_call", "board_report"]
                },
                body: { type: Type.STRING, description: "Flesh out a full realistic communication in 2-4 authentic, story-rich paragraphs. First-person voice of the sender." },
                context: { type: Type.STRING, description: "A behind-the-scenes confidential CTO note (1-2 sentences) about are they bluffing, is there a hidden leverage, etc." },
                attachments: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Optional list of supplementary materials, e.g. ['Core Monolith Architecture Diagram', 'Q3 Burn Spreadsheet']"
                }
              },
              required: ["id", "type", "urgency", "title", "from", "channel", "body", "context"]
            },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Choice ID: A, B, C, or D" },
                  label: { type: Type.STRING, description: "Button label, visual summary of the action" },
                  description: { type: Type.STRING, description: "2-3 sentences explaining exactly what this decision means practically." },
                  tradeoffs: { type: Type.STRING, description: "Honest and brutal warning of what we risk, lose, or spend." }
                },
                required: ["id", "label", "description", "tradeoffs"]
              }
            },
            timeLimit: { type: Type.INTEGER, description: "Time limit in seconds if timed scenario, otherwise null or empty", nullable: true },
            stakeholdersWatching: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["scenario", "choices", "stakeholdersWatching"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    // Double check that choice D is added properly
    if (data.choices && !data.choices.some((c: any) => c.id === "D")) {
      data.choices.push({
        id: "D",
        label: "Write a custom response",
        description: "Type your own strategic solution.",
        tradeoffs: "Outcome depends entirely on the feasibility and quality of your proposed resolution."
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in generate-scenario route:", error);
    return NextResponse.json({ error: error.message || "Failed to generate scenario." }, { status: 500 });
  }
}
