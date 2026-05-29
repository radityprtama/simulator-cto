# CTO Simulator // CRT Terminal Edition (Retro TUI)

A Chief Technology Officer Crisis Management TUI built in Next.js 14+ (App Router). Every visual decision follows a monochromatic amber and white CRT terminal design system. All modern frameworks like Shadcn have been replaced with raw ASCII/Unicode character rendering.

## 💾 Monochromatic CRT Design System

- **Vacuum Black Canvas:** Solid `#0a0a0a` background.
- **Filament Amber Accents:** High-discipline Filament Amber (`#ff6a00`) for active outlines, inputs, cursor blinks, and warnings.
- **Overvolt Blinking Alerts:** Critical/Pulse elements blink in `#ff9100` at a 500ms keyframe.
- **Pixel-Sharp Textures:** Scanline overlay patterns applied globally to the viewport with a subtle HTML-level phosphor screen flicker.
- **Monospace Grid Alignment:** Every character cell occupies identical spacing using `JetBrains Mono` exclusively.

---

## 🎹 Keyboard Navigation Map

Interact with the console workspace using tactile key bindings:

| Context | Action / Key | Function |
|---|---|---|
| **Global Console** | `Q` | Trigger Simulation Termination confirmation |
| | `Tab` | Swap viewport panels (Center scenario ↔ Right telemetry log) on tablet screen sizes |
| | `F1` | Toggle Left dashboard pane overlay on mobile screen sizes |
| **Title Menu** | `W` / `S` or `↑` / `↓` | Cycle menu target button selections |
| | `Enter` | Select and trigger options |
| **Setup Config** | `Arrow Keys` or `W/A/S/D` | Navigate 2-column industry matrix (Step 2) and stage select list (Step 3) |
| | `Enter` | Confirm section config / Launch simulation workspace |
| | `Escape` | Cancel / Retreat to previous setup page |
| | `Any Key` | Clear operational boot sequence logs and launch into game room |
| **Gameplay Console** | `W` / `S` or `↑` / `↓` | Move active caret select pointer across choices |
| | `A` / `D` or `←` / `→` | Expand or collapse risk tradeoffs and choice detail panels |
| | `E` | Expand / collapse incoming transmission scenario body text |
| | `N` | Expand / collapse private CTO workspace notes |
| | `Enter` | Submit choice (if option `D` is active and you are typing, it submits the custom response) |
| **Overlay Diagnostics** | `Enter` | Cycle report pages (Page 1 ↔ Page 2) / Advance to next scenario turn |
| | `E` | Expand / collapse diagnostic evaluation summaries |
| | `N` | Expand / collapse evaluation downstream ripple effects |
| | `I` | Expand / collapse CTO insight quotes |

---

## 🛠️ Local Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **Bun** (optional, recommended package runner)

### Step-by-Step Launch
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd simulator-cto
   ```
2. **Install workspace dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```
3. **Configure API parameters:**
   Copy `.env.example` into a local environment file:
   ```bash
   cp .env.example .env.local
   ```
   Provide either Gemini or OpenRouter parameters:
   - **Gemini API Key:** `GEMINI_API_KEY="AIzaSy..."`
   - **OpenRouter Parameters:**
     ```dotenv
     OPENROUTER_API_KEY="YOUR_KEY"
     OPENROUTER_MODEL="google/gemini-2.5-flash"
     OPENROUTER_TIMEOUT_MS="20000"
     OPENROUTER_MAX_TOKENS="2500"
     OPENROUTER_TITLE="CTO Simulator"
     ```
4. **Boot local server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   Open `http://localhost:3000` to boot the console.

---

## ⚙️ Core Terminal Components

Created inside [retro-tui.tsx](file:///home/pratama/projects/simulator-cto/components/retro-tui.tsx):
- `<AsciiBox>`: Centered title brackets inside box-drawing characters (`┌─[TITLE]─┐`).
- `<AsciiBar>`: Progress segments rendering (`████░░░░ 50%`) with automatic threshold styling.
- `<PromptButton>`: Interactive carets targets (`> OPTION <`) featuring cursor hover transformations.
- `<TerminalInput>`: Overlaid hidden native input supporting authentic terminal prompt typing (`CTO@NOVACORP:~# _`).
- `<BlinkCursor>`: 500ms interval keyframe blocks (`█`).
- `<TypewriterText>`: Timed letter-by-letter diagnostics checks.
- `<StatusBadge>`: Structured inline labels (`[LABEL]`).
- `<ScanlinePanel>`: Inset nested panels applying console surface coloring.
- `<AsciiTitle>`: Pre-rendered multi-line FIGlet fonts for critical game states.
