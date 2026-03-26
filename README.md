# Echoes of Home

> *Turn cherished moments into stories you can hear.*

A voice-first assistant that turns personal photos, videos, and social media into conversational audio experiences — built for accessibility. Powered by Vapi, Gemini Vision, and Cartesia sonic-3.

---

## Pictures

<img width="3024" height="1722" alt="CleanShot 2026-03-25 at 23 35 21@2x" src="https://github.com/user-attachments/assets/cd2fe0c7-6b2c-48ba-93f8-20262958a161" />

<img width="3024" height="1722" alt="CleanShot 2026-03-25 at 23 36 05@2x" src="https://github.com/user-attachments/assets/a5ea5875-a442-4401-bac4-6f76c73b83ba" />

<img width="3022" height="1722" alt="CleanShot 2026-03-25 at 23 36 24@2x" src="https://github.com/user-attachments/assets/9a94d37c-76f1-4f0f-ba13-beb091859fe0" />

<img width="3024" height="1722" alt="CleanShot 2026-03-25 at 23 37 38@2x" src="https://github.com/user-attachments/assets/223521c2-d6fe-47e8-920f-0ddb99e51b5a" />

### Live

<img width="3024" height="1722" alt="CleanShot 2026-03-25 at 23 37 55@2x" src="https://github.com/user-attachments/assets/262e7173-f025-4aa9-b4d7-ea1458b2e807" />

<img width="3018" height="1718" alt="CleanShot 2026-03-25 at 23 38 15@2x" src="https://github.com/user-attachments/assets/a8080b1e-8d58-4418-aa3f-75f04184c4d4" />

### Connect

<img width="3018" height="1718" alt="CleanShot 2026-03-25 at 23 38 15@2x" src="https://github.com/user-attachments/assets/b207b3ea-38a6-4692-8ba4-98d903b8739f" />

<img width="1330" height="1234" alt="CleanShot 2026-03-25 at 23 38 56@2x" src="https://github.com/user-attachments/assets/4b402246-91c1-4cbb-bcb5-8d50f35a1f7f" />


---

## Features

- **Upload a photo or short video** — drag and drop, or browse files
- **3 audio styles** — Factual, Warm Recap, or Mini Podcast
- **Live voice conversation** — ask follow-up questions like "Who's in the photo?" or "What's happening here?"
- **Grounded answers** — all responses are based on Gemini Vision analysis of your media
- **Expressive speech** — Cartesia sonic-3 with emotion-matched voice presets
- **Live screen narration** — share your screen and get real-time audio descriptions
- **Social media browsing** — connect Instagram and TikTok to analyze and listen to your posts
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

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Yes | [Vapi Dashboard](https://dashboard.vapi.ai) → Settings → API Keys |
| `VAPI_PRIVATE_KEY` | Yes | Vapi Dashboard → Settings → API Keys |
| `GEMINI_API_KEY` | Yes | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `CARTESIA_API_KEY` | Optional | [Cartesia](https://play.cartesia.ai) → API Keys (Vapi handles TTS internally if omitted) |
| `INSTAGRAM_APP_ID` | Optional | [Facebook Developers](https://developers.facebook.com) → My Apps → Instagram |
| `INSTAGRAM_APP_SECRET` | Optional | Same as above |
| `TIKTOK_CLIENT_KEY` | Optional | [TikTok Developers](https://developers.tiktok.com) → Manage Apps |
| `TIKTOK_CLIENT_SECRET` | Optional | Same as above |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` for local dev; your production URL when deploying |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, upload, style picker, memory feed |
| `/session/[id]` | Voice session for an uploaded media file; `id=demo` for the demo experience |
| `/live` | Real-time screen narration — share your screen to get live audio descriptions |
| `/connect` | Connect Instagram and TikTok accounts to browse and analyze your social posts |

---

## Architecture

```
Browser                     Next.js API Routes           External
────────────────────────    ─────────────────────────    ────────────────────
UploadCard           POST → /api/upload                  (file system)
                     POST → /api/analyze           →     Gemini Vision

StylePicker
  ↓
SessionPage          POST → /api/session           →     builds Vapi config

Vapi Web SDK  ←──────────────────────────────────────── Vapi Cloud
                     POST → /api/vapi/tools        →     Gemini (Q&A)
                             ↑
                     Vapi calls this webhook for tool calls

ScreenSharePanel     POST → /api/analyze-frame     →     Gemini (frames)
                     POST → /api/tts               →     Cartesia (direct)

ConnectPage          GET  → /api/auth/instagram    →     Instagram OAuth
                     GET  → /api/auth/tiktok       →     TikTok OAuth
                     POST → /api/social/analyze    →     Gemini Vision
```

### Key architectural decisions

- **Gemini via OpenAI-compatible client**: Image analysis uses Gemini (`gemini-3-flash-preview`) through Google's OpenAI-compatible endpoint, via the `openai` SDK pointed at `generativelanguage.googleapis.com`.
- **Cartesia via Vapi built-in**: Cartesia is Vapi's default TTS provider. Configured directly in the assistant config — no custom TTS endpoint needed for the main voice flow. `/api/tts` provides a direct Cartesia endpoint for the live narration feature.
- **Inline assistant config**: The backend builds a per-session assistant config (system prompt with media context baked in, voice preset, tools) returned to the frontend, which calls `vapi.start(config)`.
- **Server-side tools**: All Vapi tools are webhook-backed. Vapi calls `POST /api/vapi/tools` with tool-call payloads.
- **In-memory store**: Media analysis results, live frame descriptions, and social OAuth tokens are stored in server-side `Map`s. Sufficient for hackathon MVP; not durable across server restarts.

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/upload` | POST | Accept file upload, save to `public/uploads`, return `mediaId` |
| `/api/analyze` | POST | Analyze media by `mediaId` using Gemini Vision |
| `/api/session` | POST | Build Vapi `assistantConfig` for a given `mediaId` + `style` |
| `/api/vapi/tools` | POST | Webhook for Vapi tool calls (summaries, Q&A, style list, live frame descriptions) |
| `/api/recall` | POST | Vapi recall hook (MVP: returns empty history) |
| `/api/tts` | POST | Direct Cartesia TTS — returns MP3 bytes for a given text and style |
| `/api/analyze-frame` | POST | Analyze a live screen capture frame using Gemini |
| `/api/social/status` | GET | Returns Instagram/TikTok connection status |
| `/api/social/analyze` | POST | Fetch and analyze a social media image URL |
| `/api/social/instagram/media` | GET | List connected Instagram media |
| `/api/social/tiktok/media` | GET | List connected TikTok media |
| `/api/auth/instagram` | GET | Initiate Instagram OAuth flow |
| `/api/auth/instagram/callback` | GET | Instagram OAuth callback |
| `/api/auth/tiktok` | GET | Initiate TikTok OAuth flow |
| `/api/auth/tiktok/callback` | GET | TikTok OAuth callback |
| `/api/auth/disconnect` | POST | Disconnect a social platform |

---

## Voice Agent Tools

The Vapi assistant can call these tools during a session:

| Tool | Description |
|---|---|
| `get_media_summary` | Returns a styled summary of the analyzed media |
| `answer_media_question` | Answers a specific question grounded in the visual analysis |
| `list_audio_styles` | Lists the available audio styles |
| `describe_screen_frame` | Returns the latest live screen frame description (used on `/live`) |

---

## Audio Styles & Voice Presets

| Style | Name | Cartesia Voice | Emotion | Speed |
|---|---|---|---|---|
| Factual | Kira | `57dcab65…` | neutral | 1.0× |
| Warm Recap | Maya | `a0e99841…` | content, grateful | 0.95× |
| Mini Podcast | Jace | `ae7ec6a5…` | excited, enthusiastic | 1.05× |

---

## Demo Mode

The app works without any uploaded media:

- Navigate to `/session/demo` to see the full voice session UI
- Mock transcripts and demo prompts are pre-wired
- Upload and analysis flows fall back gracefully when keys are missing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Voice agent | Vapi Web SDK (`@vapi-ai/web` ^2.5) + Vapi Cloud |
| TTS | Cartesia sonic-3 (via Vapi built-in + direct `/api/tts`) |
| Vision / media analysis | Gemini Vision (`gemini-3-flash-preview`) via OpenAI-compatible client |
| Fonts | Playfair Display + Inter (`@fontsource`) |

---

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard. Update `NEXT_PUBLIC_APP_URL` to your production URL — this is used for Vapi tool webhook URLs and OAuth redirect URIs for Instagram and TikTok.
