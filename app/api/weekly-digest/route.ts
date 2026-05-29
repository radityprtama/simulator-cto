import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { recentDecisions, companyState } = await req.json();
    const ai = getGeminiClient();

    const companyName = companyState?.company?.name || "your startup";
    const systemInstruction = `You are a corporate editorial analyst for ${companyName}. Every week (which corresponds to 5 completed decisions), you generate a "Weekly Digest" report reviewing the performance of the CTO (the player).

Based on these recent decisions made by the CTO:
${JSON.stringify(recentDecisions)}

And the current resulting company state:
${JSON.stringify(companyState)}

Produce a punchy, highly educational corporate newsletter briefing containing:
1. "headline": An editorialized, witty or dramatic headline summarizing the week's events.
2. "summary": A 3-4 sentence narrative summarizing the major accomplishments, engineering struggles, or corporate politics of the past week.
3. "biggestWin": A brief line highlighting their best decision or outcome from this week.
4. "biggestMiss": A brief line highlighting their biggest failure, source of technical debt, or morale drain.
5. "teamPulse": An anonymous, authentic-sounding and highly revealing quote from one of ${companyName}'s engineering or product team members (e.g. "The new database migration has us drinking double shots of espresso at midnight, but hey, at least our Slack alerts are quiet now").
6. "ceoThought": A 1-sentence critical indicator of how the CEO/board evaluates the CTO's performance, summarizing trust, concern, or warning.
7. "upcomingPressure": A hint at what massive challenge or operational demand is looming on the horizon for the upcoming week.

Respond in the exact JSON format matching the schema below.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate the weekly digest report.",
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyDigest: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                biggestWin: { type: Type.STRING },
                biggestMiss: { type: Type.STRING },
                teamPulse: { type: Type.STRING },
                ceoThought: { type: Type.STRING },
                upcomingPressure: { type: Type.STRING }
              },
              required: ["headline", "summary", "biggestWin", "biggestMiss", "teamPulse", "ceoThought", "upcomingPressure"]
            }
          },
          required: ["weeklyDigest"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in weekly-digest route:", error);
    return NextResponse.json({ error: error.message || "Failed to generate weekly digest." }, { status: 500 });
  }
}
