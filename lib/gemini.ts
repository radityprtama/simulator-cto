import { GoogleGenAI } from "@google/genai";

class OpenRouterModels {
  async generateContent(params: {
    model: string;
    contents: any;
    config?: {
      systemInstruction?: string;
      temperature?: number;
      responseMimeType?: string;
      responseSchema?: any;
    };
  }) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined");
    }

    // Comprehensive fallback candidate models list
    const candidates: string[] = [];
    if (process.env.OPENROUTER_MODEL) {
      candidates.push(process.env.OPENROUTER_MODEL);
    }
    const defaultModels = [
      "google/gemini-2.5-flash",
      "google/gemini-flash-1.5",
      "google/gemini-flash-1.5:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-chat"
    ];
    for (const m of defaultModels) {
      if (!candidates.includes(m)) {
        candidates.push(m);
      }
    }

    let lastError: Error | null = null;

    // Try each model candidate. If JSON mode is requested, we try first with JSON mode enabled,
    // and if that fails, we try without JSON mode constraint (and do custom extraction).
    for (const candidateModel of candidates) {
      // 1. Try with JSON mode (if requested)
      try {
        console.log(`[OpenRouter] Trying model: ${candidateModel} with JSON mode`);
        const result = await this.executeCall(candidateModel, params, apiKey, true);
        return result;
      } catch (err: any) {
        console.warn(`[OpenRouter] Failed model ${candidateModel} with JSON mode:`, err.message || err);
        lastError = err;
      }

      // 2. Try without JSON mode (robust conversational fallback with custom extraction)
      try {
        console.log(`[OpenRouter] Trying model: ${candidateModel} without JSON mode`);
        const result = await this.executeCall(candidateModel, params, apiKey, false);
        return result;
      } catch (err: any) {
        console.warn(`[OpenRouter] Failed model ${candidateModel} without JSON mode:`, err.message || err);
        lastError = err;
      }
    }

    throw new Error(`All OpenRouter fallback models failed. Last error: ${lastError?.message}`);
  }

  private async executeCall(
    model: string,
    params: {
      contents: any;
      config?: {
        systemInstruction?: string;
        temperature?: number;
        responseMimeType?: string;
        responseSchema?: any;
      };
    },
    apiKey: string,
    useJsonMode: boolean
  ) {
    const messages: any[] = [];
    if (params.config?.systemInstruction) {
      messages.push({
        role: "system",
        content: params.config.systemInstruction
      });
    }

    let promptContent = "";
    if (typeof params.contents === "string") {
      promptContent = params.contents;
    } else if (Array.isArray(params.contents)) {
      promptContent = params.contents
        .map((part) => (typeof part === "string" ? part : part.text || ""))
        .join("\n");
    } else if (params.contents && typeof params.contents === "object") {
      if (params.contents.parts && Array.isArray(params.contents.parts)) {
        promptContent = params.contents.parts
          .map((part: any) => part.text || "")
          .join("\n");
      } else {
        promptContent = JSON.stringify(params.contents);
      }
    }

    // Force strict JSON format guidelines if JSON mode is requested but inactive
    if (params.config?.responseMimeType === "application/json" && !useJsonMode) {
      promptContent += "\n\nCRITICAL: You MUST respond with a valid raw JSON object matching the requested schema. Return ONLY valid raw JSON wrapped inside a markdown JSON block or as raw string, without any other conversation, introductions, or preamble.";
    }

    messages.push({
      role: "user",
      content: promptContent
    });

    const headers: any = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "CTO Simulator"
    };

    const body: any = {
      model: model,
      messages: messages,
      temperature: params.config?.temperature ?? 1.0,
    };

    if (useJsonMode && params.config?.responseMimeType === "application/json") {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Status ${response.status} - ${errText}`);
    }

    const result = await response.json();
    let text = result.choices?.[0]?.message?.content || "";

    if (!text || text.trim() === "") {
      throw new Error("OpenRouter model returned an empty response.");
    }

    // If json mode was requested but not natively supported, let's extract the clean json string.
    if (params.config?.responseMimeType === "application/json" && !useJsonMode) {
      try {
        text = this.cleanAndExtractJson(text);
      } catch (err) {
        throw new Error("Could not extract valid JSON from non-JSON mode response: " + text);
      }
    }

    return {
      text
    };
  }

  private cleanAndExtractJson(text: string): string {
    const trimmed = text.trim();
    // If it's already a valid direct JSON, return it
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch (_) {}

    // Try extracting content between ```json and ```
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      const inner = match[1].trim();
      try {
        JSON.parse(inner);
        return inner;
      } catch (_) {}
    }

    // Try finding the first '{' and last '}'
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const parsedPart = trimmed.substring(firstBrace, lastBrace + 1);
      try {
        JSON.parse(parsedPart);
        return parsedPart;
      } catch (_) {}
    }

    return trimmed;
  }
}

class OpenRouterClientWrapper {
  models = new OpenRouterModels();
}

let aiInstance: any = null;

export function getGeminiClient(): any {
  if (!aiInstance) {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      aiInstance = new OpenRouterClientWrapper();
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Either GEMINI_API_KEY or OPENROUTER_API_KEY environment variable is required.");
      }
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiInstance;
}
