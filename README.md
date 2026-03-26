# Echoes of Home

> *Turn cherished moments into stories you can hear.*

A voice-first assistant that turns family photos and videos into conversational audio experiences for visually impaired users. Built with Vapi, Cartesia sonic-3, and GPT-4o Vision.

---

## Features

- **Upload a photo or short video** — drag and drop, or browse files
- **3 audio styles** — Warm Recap, Mini Podcast, or Audio Diary
- **Live voice conversation** — ask follow-up questions like "Who's in the photo?" or "What's happening here?"
- **Grounded answers** — all responses are based on GPT-4o Vision analysis of your media
- **Expressive speech** — Cartesia sonic-3 with emotion-matched voice presets
- **Accessible by design** — WCAG 2.1 AA, screen reader friendly, keyboard navigable

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd voice-agent-hackathon
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | [Vapi Dashboard](https://dashboard.vapi.ai) → Settings → API Keys |
| `VAPI_PRIVATE_KEY` | Vapi Dashboard → Settings → API Keys |
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `CARTESIA_API_KEY` | [Cartesia](https://play.cartesia.ai) → API Keys (optional) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
Browser                     Next.js API Routes           External
────────────────────────    ─────────────────────────    ────────────────────
UploadCard           POST → /api/upload                  (file system)
                     POST → /api/analyze           →     GPT-4o Vision

StylePicker
  ↓
SessionPage          POST → /api/session           →     builds Vapi config

Vapi Web SDK  ←──────────────────────────────────────── Vapi Cloud
                     POST → /api/vapi/tools        →     GPT-4o (Q&A)
                             ↑
                     Vapi calls this webhook for tool calls
```

### Key architectural decisions

- **Cartesia via Vapi built-in**: Cartesia is Vapi's default TTS provider. We configure it directly in the assistant config — no custom TTS endpoint needed.
- **Inline assistant config**: The backend builds a per-session assistant config (system prompt with media context baked in, voice preset, tools) returned to the frontend, which calls `vapi.start(config)`.
- **Server-side tools**: All tools are webhook-backed. Vapi calls `POST /api/vapi/tools` with tool-call payloads.
- **In-memory store**: Media analysis results are stored in a `Map<string, MediaContext>`. Sufficient for hackathon MVP.

---

## Voice Agent Tools

The Vapi assistant can call these tools:

| Tool | Description |
|---|---|
| `get_media_summary` | Returns a styled summary of the analyzed media |
| `answer_media_question` | Answers a specific question grounded in the visual analysis |
| `list_audio_styles` | Lists available audio styles |

---

## Audio Styles & Voice Presets

| Style | Name | Cartesia Voice | Emotion | Speed |
|---|---|---|---|---|
| Audio Diary | Kira | `57dcab65…` | neutral | 1.0× |
| Warm Recap | Maya | `a0e99841…` | content, grateful | 0.95× |
| Mini Podcast | Jace | `ae7ec6a5…` | excited, enthusiastic | 1.05× |

---

## Demo Mode

The app works without API keys in demo mode:

- Navigate to `/session/demo?style=warm` to see the full conversation UI
- Sample prompts are pre-wired with mock responses
- Upload and analysis flows fall back gracefully

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Voice agent | Vapi Web SDK + Vapi Cloud |
| TTS | Cartesia sonic-3 (via Vapi built-in provider) |
| Media analysis | GPT-4o Vision (OpenAI) |
| Fonts | Playfair Display + Inter |

---

## Hackathon Demo Script

1. Open the app — hero page loads with warm, pastel aesthetic
2. Click "Try a Demo" — navigates to `/session/demo?style=warm`
3. The audio player shows with a simulated transcript
4. Click "Tap to speak" — voice session starts
5. Ask: *"Who's in the photo?"* → assistant answers from visual analysis
6. Ask: *"Turn this into a short podcast intro"* → style-matched response
7. Switch to "Mini Podcast" style — voice and tone change
8. Return to homepage → Memory Feed shows sample memories

---

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Set all environment variables in Vercel dashboard. Update `NEXT_PUBLIC_APP_URL` to your production URL so Vapi can reach the tool webhook endpoints.
