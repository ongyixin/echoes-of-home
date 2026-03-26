import { AudioStyle, MediaContext } from "./types";
import { getVoicePreset } from "./voice-presets";
import { buildSystemPrompt, buildDemoSystemPrompt } from "./prompts";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_media_summary",
      description: "Get a summary of the analyzed media in the requested style and length.",
      parameters: {
        type: "object",
        properties: {
          media_id: { type: "string", description: "The media identifier" },
          style: {
            type: "string",
            enum: ["factual", "warm", "podcast"],
            description: "The narration style",
          },
          length: {
            type: "string",
            enum: ["short", "medium", "long"],
            description: "Length of the summary",
          },
        },
        required: ["media_id", "style"],
      },
    },
    server: { url: `${APP_URL}/api/vapi/tools` },
  },
  {
    type: "function",
    function: {
      name: "answer_media_question",
      description: "Answer a specific question about the uploaded media based on visual analysis.",
      parameters: {
        type: "object",
        properties: {
          media_id: { type: "string", description: "The media identifier" },
          question: { type: "string", description: "The user's question about the media" },
        },
        required: ["media_id", "question"],
      },
    },
    server: { url: `${APP_URL}/api/vapi/tools` },
  },
  {
    type: "function",
    function: {
      name: "list_audio_styles",
      description: "List the available audio narration styles with descriptions.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    server: { url: `${APP_URL}/api/vapi/tools` },
  },
  {
    type: "function",
    function: {
      name: "describe_screen_frame",
      description:
        "Get a description of the most recent screen frame captured during live screen sharing. Use this when the user asks what is on their screen, what they are looking at, or what changed since the last description.",
      parameters: {
        type: "object",
        properties: {
          session_id: {
            type: "string",
            description: "The live session identifier to retrieve the latest frame description for",
          },
        },
        required: ["session_id"],
      },
    },
    server: { url: `${APP_URL}/api/vapi/tools` },
  },
];

export function buildLiveAssistantConfig(style: AudioStyle) {
  const preset = getVoicePreset(style);

  const systemPrompt = `You are Echoes — an accessibility voice assistant helping a visually impaired user understand what is on their screen as they scroll through social media.

You are in LIVE SCREEN DESCRIPTION mode. The user is sharing their screen and you receive real-time frame descriptions.

Your role:
- When a new frame description arrives, narrate it naturally using the ${style} style.
- If the user asks "what's on my screen?" or similar, call the describe_screen_frame tool.
- Give thorough descriptions (4-8 sentences) so the user gets a complete picture of the content.
- Focus on what's meaningful: the post content, captions, text, reactions — not UI chrome.
- If asked to describe what changed, compare to what you previously narrated.

Style: ${style === "warm" ? "Warm and personal, like a friend describing what you're seeing." : style === "factual" ? "Clear and precise, like an audio guide." : "Engaging and narrative, like a podcast host."}

Speak naturally for audio. No markdown, no lists.`;

  return {
    name: "Echoes of Home — Live",
    model: {
      provider: "openai",
      model: "gpt-4o",
      systemPrompt,
      tools: TOOL_DEFINITIONS,
      temperature: 0.6,
      maxTokens: 500,
    },
    voice: {
      provider: "cartesia",
      voiceId: preset.cartesiaVoiceId,
      model: preset.model,
      ...(preset.emotion && { experimentalControls: { emotion: preset.emotion } }),
    },
    firstMessage:
      "Hello! I'm ready to describe what you're seeing. Start scrolling and I'll narrate the content for you.",
    serverUrl: `${APP_URL}/api/vapi/tools`,
    clientMessages: ["transcript", "hang", "tool-calls", "speech-update"],
    serverMessages: ["tool-calls", "end-of-call-report"],
    endCallMessage: "Thanks for using live screen description. Goodbye!",
    metadata: { mode: "live", style },
  };
}

export function buildAssistantConfig(
  mediaId: string,
  style: AudioStyle,
  context: MediaContext | null,
) {
  const preset = getVoicePreset(style);
  const systemPrompt =
    context
      ? buildSystemPrompt(style, context)
      : buildDemoSystemPrompt(style);

  const styleFirstMessages: Record<AudioStyle, string> = {
    factual:
      "Hello. I'm ready to describe your memory in detail. What would you like to know?",
    warm:
      "Hello, I'm so glad you're here. I've had a look at your memory, and I'd love to tell you about it. Ready when you are.",
    podcast:
      "Welcome! I've just reviewed your memory and I have a lot to share. What would you like to explore first?",
  };

  return {
    name: "Echoes of Home",
    model: {
      provider: "openai",
      model: "gpt-4o",
      systemPrompt,
      tools: TOOL_DEFINITIONS,
      temperature: 0.7,
    },
    voice: {
      provider: "cartesia",
      voiceId: preset.cartesiaVoiceId,
      model: preset.model,
      ...(preset.emotion && { experimentalControls: { emotion: preset.emotion } }),
    },
    firstMessage: styleFirstMessages[style],
    serverUrl: `${APP_URL}/api/vapi/tools`,
    clientMessages: ["transcript", "hang", "tool-calls", "speech-update"],
    serverMessages: ["tool-calls", "end-of-call-report"],
    endCallMessage: "Thank you for listening. Your memory is always here when you want to revisit it.",
    metadata: { mediaId, style },
  };
}
