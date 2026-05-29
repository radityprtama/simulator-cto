import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { companyName, industry, companyStage, playerName } = await req.json();

    // Input Validation
    if (!companyName || typeof companyName !== "string" || companyName.trim().length < 2 || companyName.length > 40) {
      return NextResponse.json({ error: "Company name must be between 2 and 40 characters." }, { status: 400 });
    }

    const nameRegex = /^[a-zA-Z0-9\s\-]+$/;
    if (!nameRegex.test(companyName.trim())) {
      return NextResponse.json({ error: "Company name can only contain letters, numbers, spaces, and hyphens." }, { status: 400 });
    }

    if (!industry || typeof industry !== "string") {
      return NextResponse.json({ error: "Industry must be selected." }, { status: 400 });
    }

    const validStages = ["Pre-Seed / MVP", "Seed", "Series A", "Series B", "Series C+ / Growth", "Bootstrapped"];
    const stage = validStages.includes(companyStage) ? companyStage : "Series A";

    const ai = getGeminiClient();

    const systemInstruction = `You are the Company Genesis Engine for "CTO Simulator" — a strategic text-based management game. Your job is to take a user-defined company name, industry, stage, and player name, then generate a rich, believable, tension-packed company profile.

Follow these rules for generating the profile:
- Squeeze realistic conflict into the profile. It must feel grounded, technical, and full of passive-aggressive corporate politics.
- Ensure the structural metrics align with the stage chosen, randomized slightly (+/- 3 to 7 points) to stay unique.
- The three paragraphs of the openingNarrative are critical:
  * Paragraph 1: Background of the company, and the juicy backstory of why the previous CTO left (vesting cliff, breakdown in board alignment, unpreventable P0 outage, toxic code ownership).
  * Paragraph 2: High-context technical map naming specific frameworks, deployment setups (AWS, Docker, K8s, legacy databases), and 2-3 specific technical friction areas.
  * Paragraph 3: The survival mandate for the next 12 weeks.
`;

    const prompt = `Generate a rich, cohesive company profile JSON using these specs:
- Name: "${companyName}"
- Industry: "${industry}"
- Stage: "${stage}"
- CTO: "${playerName || "Alex Chen"}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            company: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                industry: { type: Type.STRING },
                stage: { type: Type.STRING },
                tagline: { type: Type.STRING, description: "A punchy 1-line Crunchbase-style tagline" },
                founded: { type: Type.STRING, description: "E.g. '2021'" },
                headquarters: { type: Type.STRING, description: "E.g. 'Austin, TX' or 'Berlin, Germany'" },
                headcount: { type: Type.INTEGER, description: "Realistic headcount based on stage (Pre-Seed: 3-8, Seed: 8-15, Series A: 15-40, Series B: 40-100, Series C+: 100-250+, Bootstrapped: 5-20)" },
                businessModel: { type: Type.STRING, description: "2-3 sentence explanation of pricing, monetization, and core model." },
                marketSize: { type: Type.STRING, description: "E.g., '$12B TAM' or '$4.5B SAM'" },
                investors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 2-3 fictional venture capital funds or high-profile angel investors (e.g., 'Syndicate Capital', 'Apex Ventures')"
                },
                openingNarrative: { type: Type.STRING, description: "A highly immersive, detailed, 3-paragraph onboarding description following the Paragraph 1, 2, and 3 content guidelines exactly." }
              },
              required: [
                "name",
                "industry",
                "stage",
                "tagline",
                "founded",
                "headquarters",
                "headcount",
                "businessModel",
                "marketSize",
                "investors",
                "openingNarrative"
              ]
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                budget: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                teamMorale: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                technicalDebt: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                productVelocity: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                ceoRelationship: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                customerSatisfaction: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                securityPosture: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" },
                talentPipeline: { type: Type.INTEGER, description: "0-100 gauge matching stage guideline" }
              },
              required: [
                "budget",
                "teamMorale",
                "technicalDebt",
                "productVelocity",
                "ceoRelationship",
                "customerSatisfaction",
                "securityPosture",
                "talentPipeline"
              ]
            },
            activeFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 custom active game-state flags in snake_case corresponding to the company profile."
            },
            companyMood: { 
              type: Type.STRING,
              enum: ["thriving", "stable", "tense", "crisis", "meltdown"],
              description: "Must default to 'tense' or 'stable' to fit game-start tensions."
            }
          },
          required: ["company", "metrics", "activeFlags", "companyMood"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in create-company route:", error);
    return NextResponse.json({ error: error.message || "Failed to create company." }, { status: 500 });
  }
}
