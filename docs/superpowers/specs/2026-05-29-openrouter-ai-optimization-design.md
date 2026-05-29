# OpenRouter AI Optimization Design

Date: 2026-05-29

## Context

CTO Simulator is a Next.js app with four server-side AI routes:

- `app/api/create-company/route.ts`
- `app/api/generate-scenario/route.ts`
- `app/api/evaluate-choice/route.ts`
- `app/api/weekly-digest/route.ts`

All four routes call `getGeminiClient()` and expect a Gemini-like `ai.models.generateContent(...)` interface. When `OPENROUTER_API_KEY` is present, `lib/gemini.ts` swaps in an OpenRouter wrapper.

The current OpenRouter wrapper is reliability-heavy:

- It builds a candidate model list from `OPENROUTER_MODEL` plus several defaults.
- It tries each model with JSON mode.
- If that fails, it tries the same model again without JSON mode.
- It only fails after exhausting every candidate.

That behavior can turn a single gameplay action into many sequential network calls, making the app feel slow when OpenRouter has a provider/model issue.

Context7 documentation consulted:

- OpenRouter `/llmstxt/openrouter_ai_llms-full_txt`: chat completions, provider routing, model fallback behavior, and structured JSON schema response formats.
- Next.js `/vercel/next.js`: server-side `fetch` behavior, `cache: "no-store"`, and `AbortController` signals.

## Goal

Optimize the AI system for fast, smooth gameplay when OpenRouter is enabled.

The selected product tradeoff is **fast gameplay**:

- Prefer one fast model request over broad app-side model fallback.
- Bound latency with a timeout.
- Preserve strict JSON output because every AI route parses JSON.
- Keep route code stable by improving the adapter boundary first.

## Non-Goals

- Do not replace the app's AI route architecture.
- Do not redesign prompts or game mechanics.
- Do not add streaming responses in this pass.
- Do not make broad UI wording changes beyond direct OpenRouter clarity.
- Do not remove Gemini fallback support when `OPENROUTER_API_KEY` is absent.

## Selected Approach

Implement a **Fast Single-Path OpenRouter Adapter** inside `lib/gemini.ts`.

The adapter will keep the existing public shape:

```ts
ai.models.generateContent({
  model,
  contents,
  config: {
    systemInstruction,
    temperature,
    responseMimeType,
    responseSchema,
  },
})
```

Internally, the OpenRouter branch will:

1. Resolve one model from `OPENROUTER_MODEL` or a fast default.
2. Build one OpenRouter chat completion request.
3. Use OpenRouter structured output when a JSON schema is provided.
4. Send the request with `cache: "no-store"` and an `AbortController` timeout.
5. Retry only once for transient failures.
6. Return `{ text }` for compatibility with existing routes.

This keeps the blast radius small while removing the main latency problem.

## Configuration

Add or document these OpenRouter-focused environment values:

- `OPENROUTER_API_KEY`: enables OpenRouter.
- `OPENROUTER_MODEL`: single primary model. Default remains a fast Gemini Flash model unless overridden.
- `OPENROUTER_TIMEOUT_MS`: request timeout. Default is `12000`.
- `OPENROUTER_REFERER`: explicit referer. If unset, use `APP_URL`; if `APP_URL` is unset, use `http://localhost:3000`.
- `OPENROUTER_TITLE`: site title. If unset, use `CTO Simulator`.

Provider routing preferences are not part of the first implementation. The first pass uses one model and lets OpenRouter choose the provider for that model.

## OpenRouter Request Shape

For JSON routes, use structured outputs:

```json
{
  "model": "google/gemini-2.5-flash",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 1,
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "cto_simulator_response",
      "strict": true,
      "schema": {}
    }
  },
  "stream": false
}
```

The adapter will translate the Gemini-style schema objects currently built with `@google/genai` `Type` constants into plain JSON Schema compatible with OpenRouter.

## Data Flow

1. A client action calls an existing route, for example `/api/generate-scenario`.
2. The route builds its prompt and response schema.
3. The route calls `ai.models.generateContent(...)`.
4. `getGeminiClient()` returns:
   - the OpenRouter adapter if `OPENROUTER_API_KEY` exists;
   - the real Gemini client otherwise.
5. The OpenRouter adapter sends one bounded chat completion request.
6. The adapter returns `{ text }`.
7. The route parses JSON and returns the expected API response.

## Error Handling

The OpenRouter adapter should fail quickly and clearly.

- Timeout default: `12000ms`.
- Retry once for likely transient statuses: `429`, `502`, `503`, `504`.
- Do not retry schema or prompt errors such as `400`, `401`, `403`, or `404`.
- Log model, status, duration, retry count, and whether structured output was used.
- Preserve safe route-level errors with existing `NextResponse.json({ error }, { status: 500 })` behavior.

If OpenRouter returns successful text that is not directly parseable as JSON, the adapter will run local JSON extraction once. This fallback does not make another network call and does not call a second model.

## Testing

There is no test runner configured in `package.json`, so implementation validation will use TypeScript/build, lint, and targeted helper self-checks unless a test runner is added explicitly.

Test coverage should target:

- Request body generation for normal text and JSON routes.
- Gemini schema to JSON Schema conversion.
- Timeout behavior through `AbortController`.
- Retry decision for transient and non-transient statuses.
- JSON extraction fallback for markdown-wrapped JSON.

Manual validation should include:

- `npm run lint`
- `npm run build`
- A local gameplay pass with `OPENROUTER_API_KEY` and a fast `OPENROUTER_MODEL`.

## Success Criteria

- Each AI route makes one OpenRouter model request under normal conditions.
- Transient OpenRouter failures cause at most one retry.
- Requests stop after the configured timeout.
- JSON parsing remains stable for all four routes.
- No route needs broad rewrites.
- Gemini still works when OpenRouter is not configured.

## Implementation Boundaries

Primary file:

- `lib/gemini.ts`

Possible documentation/config updates:

- `.env.example`
- `README.md`

Only touch route files if a small compatibility adjustment is required. The preferred implementation keeps route prompts and schemas unchanged.
