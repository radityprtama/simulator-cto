import { GoogleGenAI } from "@google/genai";

type GenerateContentParams = {
  model: string;
  contents: unknown;
  config?: GenerateContentConfig;
};

type GenerateContentConfig = {
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: GeminiSchema;
};

type GeminiSchema = {
  anyOf?: GeminiSchema[];
  default?: unknown;
  description?: string;
  enum?: string[];
  example?: unknown;
  format?: string;
  items?: GeminiSchema;
  maxItems?: string;
  maxLength?: string;
  maxProperties?: string;
  maximum?: number;
  minItems?: string;
  minLength?: string;
  minProperties?: string;
  minimum?: number;
  nullable?: boolean;
  pattern?: string;
  properties?: Record<string, GeminiSchema>;
  propertyOrdering?: string[];
  required?: string[];
  title?: string;
  type?: string;
};

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type OpenRouterResponseFormat =
  | { type: "json_object" }
  | {
      type: "json_schema";
      json_schema: {
        name: string;
        strict: true;
        schema: JsonSchema;
      };
    };

type JsonSchema = Record<string, unknown>;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

type OpenRouterRawResponse = {
  ok: boolean;
  status: number;
  bodyText: string;
};

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash";
const DEFAULT_OPENROUTER_TIMEOUT_MS = 12000;
const MAX_LOG_TEXT_LENGTH = 1000;
const OPENROUTER_RETRY_DELAY_MS = 300;
const TRANSIENT_OPENROUTER_STATUSES = new Set([429, 502, 503, 504]);

const GEMINI_TYPE_TO_JSON_SCHEMA_TYPE: Record<string, string> = {
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  BOOLEAN: "boolean",
  ARRAY: "array",
  OBJECT: "object",
  NULL: "null",
};

class OpenRouterHttpError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`OpenRouter request failed with status ${status}: ${truncateForLog(body)}`);
    this.name = "OpenRouterHttpError";
    this.status = status;
    this.body = body;
  }
}

class OpenRouterModels {
  async generateContent(params: GenerateContentParams) {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined");
    }

    return executeOpenRouterCall(params, apiKey);
  }
}

async function executeOpenRouterCall(params: GenerateContentParams, apiKey: string) {
  const model = resolveOpenRouterModel();
  const timeoutMs = readOpenRouterTimeoutMs();
  const responseFormat = buildOpenRouterResponseFormat(params.config);
  const body: Record<string, unknown> = {
    model,
    messages: buildMessages(params),
    temperature: params.config?.temperature ?? 1.0,
    stream: false,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const startedAt = Date.now();

    try {
      const response = await fetchOpenRouterResponse(
        OPENROUTER_CHAT_COMPLETIONS_URL,
        {
          method: "POST",
          headers: buildOpenRouterHeaders(apiKey),
          body: JSON.stringify(body),
          cache: "no-store",
        },
        timeoutMs
      );

      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        throw new OpenRouterHttpError(response.status, response.bodyText);
      }

      const result = parseOpenRouterResponse(response.bodyText);
      let text = extractAssistantText(result);

      if (!text.trim()) {
        throw new Error("OpenRouter model returned an empty response.");
      }

      if (params.config?.responseMimeType === "application/json") {
        text = ensureJsonText(text);
      }

      console.info(
        `[OpenRouter] status=200 model=${model} durationMs=${durationMs} attempt=${attempt} structured=${Boolean(responseFormat)}`
      );

      return { text };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const shouldRetry =
        error instanceof OpenRouterHttpError &&
        TRANSIENT_OPENROUTER_STATUSES.has(error.status) &&
        attempt === 1;

      if (!shouldRetry) {
        console.warn(
          `[OpenRouter] model=${model} durationMs=${durationMs} attempt=${attempt} structured=${Boolean(responseFormat)} failed=${getErrorMessage(error)}`
        );
        throw error;
      }

      console.warn(
        `[OpenRouter] transientStatus=${error.status} model=${model} durationMs=${durationMs} attempt=${attempt} retrying=true`
      );
      await delay(OPENROUTER_RETRY_DELAY_MS);
    }
  }

  throw new Error("OpenRouter request failed.");
}

function resolveOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
}

function readOpenRouterTimeoutMs(): number {
  const rawTimeout = process.env.OPENROUTER_TIMEOUT_MS;
  const parsedTimeout = rawTimeout ? Number(rawTimeout) : NaN;

  if (Number.isFinite(parsedTimeout) && parsedTimeout > 0) {
    return parsedTimeout;
  }

  return DEFAULT_OPENROUTER_TIMEOUT_MS;
}

function buildOpenRouterHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.OPENROUTER_REFERER || process.env.APP_URL || "http://localhost:3000",
    "X-OpenRouter-Title": process.env.OPENROUTER_TITLE || "CTO Simulator",
  };
}

function buildMessages(params: GenerateContentParams): ChatMessage[] {
  const messages: ChatMessage[] = [];

  if (params.config?.systemInstruction?.trim()) {
    messages.push({
      role: "system",
      content: params.config.systemInstruction,
    });
  }

  messages.push({
    role: "user",
    content: contentsToText(params.contents),
  });

  return messages;
}

function contentsToText(contents: unknown): string {
  if (typeof contents === "string") {
    return contents;
  }

  if (Array.isArray(contents)) {
    return contents.map(partToText).filter(Boolean).join("\n");
  }

  if (contents && typeof contents === "object") {
    const parts = (contents as { parts?: unknown }).parts;
    if (Array.isArray(parts)) {
      return parts.map(partToText).filter(Boolean).join("\n");
    }

    return JSON.stringify(contents);
  }

  return "";
}

function partToText(part: unknown): string {
  if (typeof part === "string") {
    return part;
  }

  if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
    return (part as { text: string }).text;
  }

  return "";
}

function buildOpenRouterResponseFormat(config?: GenerateContentConfig): OpenRouterResponseFormat | undefined {
  if (config?.responseMimeType !== "application/json") {
    return undefined;
  }

  if (!config.responseSchema) {
    return { type: "json_object" };
  }

  return {
    type: "json_schema",
    json_schema: {
      name: "cto_simulator_response",
      strict: true,
      schema: convertGeminiSchemaToJsonSchema(config.responseSchema),
    },
  };
}

function convertGeminiSchemaToJsonSchema(schema: GeminiSchema): JsonSchema {
  const converted: JsonSchema = {};
  const mappedType = schema.type ? GEMINI_TYPE_TO_JSON_SCHEMA_TYPE[schema.type] ?? schema.type.toLowerCase() : undefined;

  if (mappedType && mappedType !== "type_unspecified") {
    converted.type = mappedType;
  }

  copySchemaValue(converted, "description", schema.description);
  copySchemaValue(converted, "enum", schema.enum);
  copySchemaValue(converted, "format", schema.format);
  copySchemaValue(converted, "default", schema.default);
  copySchemaValue(converted, "example", schema.example);
  copySchemaValue(converted, "minimum", schema.minimum);
  copySchemaValue(converted, "maximum", schema.maximum);
  copySchemaValue(converted, "pattern", schema.pattern);

  const minLength = parseNumericSchemaValue(schema.minLength);
  const maxLength = parseNumericSchemaValue(schema.maxLength);
  const minItems = parseNumericSchemaValue(schema.minItems);
  const maxItems = parseNumericSchemaValue(schema.maxItems);
  const minProperties = parseNumericSchemaValue(schema.minProperties);
  const maxProperties = parseNumericSchemaValue(schema.maxProperties);

  copySchemaValue(converted, "minLength", minLength);
  copySchemaValue(converted, "maxLength", maxLength);
  copySchemaValue(converted, "minItems", minItems);
  copySchemaValue(converted, "maxItems", maxItems);
  copySchemaValue(converted, "minProperties", minProperties);
  copySchemaValue(converted, "maxProperties", maxProperties);

  if (schema.items) {
    converted.items = convertGeminiSchemaToJsonSchema(schema.items);
  }

  if (schema.anyOf?.length) {
    converted.anyOf = schema.anyOf.map(convertGeminiSchemaToJsonSchema);
  }

  if (schema.properties) {
    converted.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, convertGeminiSchemaToJsonSchema(value)])
    );
  }

  if (schema.required?.length) {
    converted.required = schema.required;
  }

  if (converted.type === "object" && !("additionalProperties" in converted)) {
    converted.additionalProperties = false;
  }

  if (schema.nullable && typeof converted.type === "string") {
    converted.type = [converted.type, "null"];
  }

  return converted;
}

function copySchemaValue(target: JsonSchema, key: string, value: unknown): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

function parseNumericSchemaValue(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function fetchOpenRouterResponse(url: string, init: RequestInit, timeoutMs: number): Promise<OpenRouterRawResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      status: response.status,
      bodyText: await response.text(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseOpenRouterResponse(text: string): OpenRouterResponse {
  try {
    return JSON.parse(text) as OpenRouterResponse;
  } catch {
    throw new Error(`OpenRouter returned invalid JSON: ${truncateForLog(text)}`);
  }
}

function extractAssistantText(result: OpenRouterResponse): string {
  const content = result.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((part) => (typeof part.text === "string" ? part.text : "")).join("");
  }

  return "";
}

function ensureJsonText(text: string): string {
  const cleaned = cleanAndExtractJson(text);

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    throw new Error(`Could not extract valid JSON from OpenRouter response: ${truncateForLog(text)}`);
  }
}

function cleanAndExtractJson(text: string): string {
  const trimmed = text.trim();

  if (isValidJson(trimmed)) {
    return trimmed;
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1] && isValidJson(fenceMatch[1].trim())) {
    return fenceMatch[1].trim();
  }

  const objectCandidate = extractBetween(trimmed, "{", "}");
  if (objectCandidate && isValidJson(objectCandidate)) {
    return objectCandidate;
  }

  const arrayCandidate = extractBetween(trimmed, "[", "]");
  if (arrayCandidate && isValidJson(arrayCandidate)) {
    return arrayCandidate;
  }

  return trimmed;
}

function extractBetween(text: string, startToken: string, endToken: string): string | null {
  const start = text.indexOf(startToken);
  const end = text.lastIndexOf(endToken);

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.substring(start, end + 1);
}

function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function truncateForLog(text: string): string {
  if (text.length <= MAX_LOG_TEXT_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_LOG_TEXT_LENGTH)}... [truncated ${text.length - MAX_LOG_TEXT_LENGTH} chars]`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
        apiKey,
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
