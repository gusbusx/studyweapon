# theacademicweapon.com

A free, serverless Swiss Army knife for high school and college students.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (dark mode, custom design tokens)
- **TypeScript**
- **Anthropic API** (claude-haiku — for AI writing tools only)
- **100% client-side** for all study/calculator tools

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root layout, nav, footer
│   ├── page.tsx                ← Home dashboard
│   ├── api/ai/route.ts         ← Serverless API for AI tools
│   └── tools/
│       ├── humanizer/page.tsx          ← AI Writing Humanizer
│       ├── flashcard-parser/page.tsx   ← Anki Flashcard Parser
│       ├── paraphraser/                ← (scaffold ready)
│       ├── defluffer/                  ← (scaffold ready)
│       ├── elongator/                  ← (scaffold ready)
│       ├── voice-converter/            ← (scaffold ready)
│       ├── thesis-generator/           ← (scaffold ready)
│       ├── latex-formatter/            ← (scaffold ready)
│       ├── cornell-notes/              ← (scaffold ready)
│       ├── code-formatter/             ← (scaffold ready)
│       ├── gpa-predictor/              ← (scaffold ready)
│       ├── grade-curve/                ← (scaffold ready)
│       ├── citation-builder/           ← (scaffold ready)
│       └── file-converter/             ← (scaffold ready)
├── styles/
│   └── globals.css             ← Design tokens, Tailwind base
```

## Setup

```bash
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```

## Deploying (Vercel — $0)

```bash
npx vercel deploy
```

Set `ANTHROPIC_API_KEY` in Vercel environment variables.

## Architecture Notes

### AI Tools (Modules in `/api/ai/route.ts`)
All AI features route through a single API endpoint with per-tool system prompts.
Uses `claude-haiku-4-5` for speed and low cost. Each tool is a named key in `SYSTEM_PROMPTS`.

To add a new AI tool:
1. Add a key to `SYSTEM_PROMPTS` in `route.ts`
2. Call `POST /api/ai` with `{ tool: "your-key", text: "..." }`

### Client-Side Tools
All study/calculator tools use zero backend. Parsers use vanilla JS string manipulation.
Downloads use `URL.createObjectURL(new Blob(...))`.

### Monetization
Every page contains `<div className="ad-slot">` placeholders ready for Google AdSense.
Replace with actual AdSense script tags when site is approved.

### Design Tokens (tailwind.config.js)
| Token | Value | Usage |
|---|---|---|
| `canvas` | `#0b0f1a` | Page background |
| `surface` | `#111827` | Card backgrounds |
| `elevated` | `#1a2235` | Raised elements |
| `border` | `#1e2d45` | All borders |
| `neon.blue` | `#38bdf8` | Primary accent |
| `neon.emerald` | `#34d399` | Study tools accent |
| `neon.violet` | `#a78bfa` | Calculator accent |

### Fonts
- **Syne** — Display/headings (Google Fonts)
- **DM Sans** — Body copy (Google Fonts)
- **JetBrains Mono** — Code/mono labels (Google Fonts)
