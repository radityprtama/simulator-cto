# OpenRouter AI Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the latency-heavy OpenRouter fallback loop with a fast single-path adapter that uses structured JSON output, bounded timeouts, and at most one transient retry.

**Architecture:** Keep the existing `getGeminiClient()` and `ai.models.generateContent(...)` contract so the four API routes stay stable. Refactor the OpenRouter branch inside `lib/gemini.ts` into typed helpers for prompt normalization, Gemini-schema conversion, request construction, timeout handling, transient retry, and response normalization. Update env/docs so OpenRouter users know the fast-path configuration knobs.

**Tech Stack:** Next.js 15 App Router, TypeScript strict mode, `@google/genai`, OpenRouter chat completions over `fetch`, npm validation scripts.

---

## Scope Check

This plan implements one subsystem: the OpenRouter AI adapter and its usage documentation. It does not alter game mechanics, prompts, streaming behavior, UI design, or the Gemini fallback path.

## File Structure

- Modify `lib/gemini.ts`: owns the Gemini/OpenRouter client selection and the OpenRouter-compatible `generateContent` adapter.
- Modify `.env.example`: documents OpenRouter fast-path environment variables.
- Modify `README.md`: documents Gemini and OpenRouter setup.
- Do not modify `app/api/*/route.ts`: route prompts and schemas remain compatible with the existing `generateContent` shape.
- Do not touch the untracked `bun.lock` file unless the user separately asks for lockfile cleanup.

## Validation Baseline

- `npm run lint` passes before implementation.
- `npm run build` passes when network access is available for `next/font` to fetch Google Fonts.
- In the default restricted sandbox, `npm run build` can fail with `getaddrinfo EAI_AGAIN fonts.googleapis.com`; that is an environment/network failure, not an app build regression.

---

### Task 1: Replace OpenRouter Adapter With Fast Single-Path Implementation

**Files:**
- Modify: `lib/gemini.ts`

- [ ] **Step 1: Confirm lint baseline**

Run:

```bash
npm run lint
```

Expected: exits `0` and prints the `eslint .` command with no lint errors.

- [ ] **Step 2: Replace `lib/gemini.ts` with the fast OpenRouter adapter**

Use this full file content:

```ts
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

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash";
const DEFAULT_OPENROUTER_TIMEOUT_MS = 12000;
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
    super(`OpenRouter request failed with status ${status}: ${body}`);
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
      const response = await fetchWithTimeout(
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
        const errorBody = await response.text();
        throw new OpenRouterHttpError(response.status, errorBody);
      }

      const result = (await response.json()) as OpenRouterResponse;
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

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
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
    throw new Error(`Could not extract valid JSON from OpenRouter response: ${text}`);
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
```

- [ ] **Step 3: Run lint after adapter replacement**

Run:

```bash
npm run lint
```

Expected: exits `0` with no lint errors.

- [ ] **Step 4: Run production build after adapter replacement**

Run:

```bash
npm run build
```

Expected: exits `0` and lists the static and dynamic routes. If the command fails with `getaddrinfo EAI_AGAIN fonts.googleapis.com`, rerun it with approved network access; do not change app code for that font-fetch failure.

- [ ] **Step 5: Commit the adapter change**

Run:

```bash
git add lib/gemini.ts
git commit -m "feat: optimize OpenRouter adapter"
```

Expected: commit succeeds and includes only `lib/gemini.ts`.

---

### Task 2: Document OpenRouter Fast-Path Configuration

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Replace `.env.example` with explicit OpenRouter settings**

Use this full file content:

```dotenv
# GEMINI_API_KEY: Required if not using OpenRouter.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# OPENROUTER_API_KEY: Optional. If set, replaces Gemini as the primary AI engine.
# Configure this via the Secrets panel in the AI Studio UI.
OPENROUTER_API_KEY=""

# OPENROUTER_MODEL: Optional. Single fast model used for all OpenRouter calls.
# The app defaults to google/gemini-2.5-flash when this is empty.
OPENROUTER_MODEL="google/gemini-2.5-flash"

# OPENROUTER_TIMEOUT_MS: Optional. Per-request timeout for OpenRouter calls.
OPENROUTER_TIMEOUT_MS="12000"

# OPENROUTER_REFERER: Optional. Site URL sent to OpenRouter for app attribution.
# Defaults to APP_URL, then http://localhost:3000.
OPENROUTER_REFERER=""

# OPENROUTER_TITLE: Optional. Site title sent to OpenRouter for app attribution.
OPENROUTER_TITLE="CTO Simulator"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, API attribution, and route URLs.
APP_URL="MY_APP_URL"
```

- [ ] **Step 2: Replace `README.md` with setup instructions that include OpenRouter**

Use this full file content:

```md
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7f28e788-8ec6-4cd5-9045-10bd8b75e8a8

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Configure one AI provider in `.env.local`:
   - Gemini: set `GEMINI_API_KEY`
   - OpenRouter: set `OPENROUTER_API_KEY`
3. Run the app:
   `npm run dev`

## OpenRouter

When `OPENROUTER_API_KEY` is set, the app uses OpenRouter instead of Gemini for server-side AI calls.

Recommended fast-path settings:

```dotenv
OPENROUTER_API_KEY="YOUR_OPENROUTER_KEY"
OPENROUTER_MODEL="google/gemini-2.5-flash"
OPENROUTER_TIMEOUT_MS="12000"
OPENROUTER_TITLE="CTO Simulator"
```

The OpenRouter adapter uses one configured model per request, structured JSON output for game API responses, and a bounded timeout so gameplay does not stall behind broad model fallback loops.
```

- [ ] **Step 3: Run lint after docs/config updates**

Run:

```bash
npm run lint
```

Expected: exits `0` with no lint errors.

- [ ] **Step 4: Run production build after docs/config updates**

Run:

```bash
npm run build
```

Expected: exits `0` and lists the static and dynamic routes. If the command fails with `getaddrinfo EAI_AGAIN fonts.googleapis.com`, rerun it with approved network access; do not change app code for that font-fetch failure.

- [ ] **Step 5: Commit docs/config updates**

Run:

```bash
git add .env.example README.md
git commit -m "docs: document OpenRouter configuration"
```

Expected: commit succeeds and includes only `.env.example` and `README.md`.

---

### Task 3: Smoke-Test OpenRouter Route Behavior

**Files:**
- No source file changes.

- [ ] **Step 1: Confirm OpenRouter credentials are configured without printing secrets**

Run:

```bash
node -e "const fs=require('fs'); const files=['.env.local','.env']; const text=files.filter(fs.existsSync).map((file)=>fs.readFileSync(file,'utf8')).join('\n'); process.exit(/OPENROUTER_API_KEY\\s*=\\s*['\"]?[^'\"\\n]+/.test(text)?0:1)"
```

Expected: exits `0`. If it exits `1`, add `OPENROUTER_API_KEY` to `.env.local` before continuing.

- [ ] **Step 2: Start the Next.js dev server**

Run:

```bash
npm run dev
```

Expected: the server starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 3: Smoke-test company generation in a second terminal**

Run:

```bash
curl -sS http://localhost:3000/api/create-company \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Latency Labs","industry":"AI Infrastructure","companyStage":"Series A","playerName":"Alex Chen"}'
```

Expected: response is valid JSON with `company`, `metrics`, `activeFlags`, and `companyMood` keys. The server log should show one OpenRouter request unless a transient `429`, `502`, `503`, or `504` caused exactly one retry.

- [ ] **Step 4: Smoke-test scenario generation in the second terminal**

Run:

```bash
curl -sS http://localhost:3000/api/generate-scenario \
  -H "Content-Type: application/json" \
  -d '{"company":{"name":"Latency Labs","industry":"AI Infrastructure","stage":"Series A","headcount":28},"metrics":{"budget":62,"teamMorale":55,"technicalDebt":68,"productVelocity":58,"ceoRelationship":60,"customerSatisfaction":57,"securityPosture":52,"talentPipeline":48},"activeFlags":["legacy_monolith_pressure"],"companyMood":"tense","recentDecisions":[]}'
```

Expected: response is valid JSON with `scenario`, `choices`, and `stakeholdersWatching` keys. `choices` includes an item with `"id":"D"`.

- [ ] **Step 5: Stop the dev server**

Run in the dev-server terminal:

```bash
Ctrl-C
```

Expected: the dev server exits cleanly.

---

### Task 4: Final Verification And Handoff

**Files:**
- No source file changes unless previous tasks exposed a defect.

- [ ] **Step 1: Run final lint**

Run:

```bash
npm run lint
```

Expected: exits `0` with no lint errors.

- [ ] **Step 2: Run final production build**

Run:

```bash
npm run build
```

Expected: exits `0` and lists the static and dynamic routes. If the command fails with `getaddrinfo EAI_AGAIN fonts.googleapis.com`, rerun it with approved network access; do not change app code for that font-fetch failure.

- [ ] **Step 3: Verify git status**

Run:

```bash
git status --short
```

Expected: no tracked source/doc changes remain unstaged or uncommitted. The pre-existing untracked `bun.lock` may still appear and should be left alone.

- [ ] **Step 4: Summarize completion**

Report:

```md
Implemented the fast OpenRouter path in `lib/gemini.ts`, documented the OpenRouter env vars, and validated with `npm run lint`, `npm run build`, and OpenRouter route smoke tests. The existing untracked `bun.lock` was left untouched.
```

Expected: user receives a concise summary with any validation command that could not be run.

## Self-Review

- Spec coverage: the plan implements one model request by default, structured JSON schema output, `cache: "no-store"`, timeout handling, one transient retry for `429`, `502`, `503`, and `504`, route compatibility, env docs, lint/build validation, and OpenRouter smoke tests.
- Placeholder scan: no placeholder markers, incomplete code steps, or vague implementation instructions are present.
- Type consistency: the plan uses `GenerateContentParams`, `GenerateContentConfig`, `GeminiSchema`, `OpenRouterResponseFormat`, and `JsonSchema` consistently inside `lib/gemini.ts`.
