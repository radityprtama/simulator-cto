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
OPENROUTER_TIMEOUT_MS="20000"
OPENROUTER_MAX_TOKENS="2500"
OPENROUTER_TITLE="CTO Simulator"
```

The OpenRouter adapter uses one configured model per request, structured JSON output for game API responses, and a bounded timeout so gameplay does not stall behind broad model fallback loops.
It also caps generated tokens by default to avoid slow or unexpectedly expensive completions.
