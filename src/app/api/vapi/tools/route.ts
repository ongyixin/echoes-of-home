import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { store } from "@/lib/store";
import { liveStore } from "@/lib/live-store";
import { buildContextSummary } from "@/lib/media-analysis";
import { AudioStyle } from "@/lib/types";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Vapi sends tool-calls in the message object
    const toolCallList: ToolCall[] =
      body?.message?.toolCallList ?? body?.toolCallList ?? [];

    if (toolCallList.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = await Promise.all(
      toolCallList.map(async (toolCall) => {
        const { id, function: fn } = toolCall;
        let args: Record<string, string> = {};
        try {
          args = JSON.parse(fn.arguments);
        } catch {
          // ignore parse error
        }

        const result = await handleTool(fn.name, args);
        return { toolCallId: id, result };
      }),
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Tool handler error:", err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}

async function handleTool(
  name: string,
  args: Record<string, string>,
): Promise<string> {
  switch (name) {
    case "get_media_summary":
      return handleGetSummary(args.media_id, args.style as AudioStyle, args.length);

    case "answer_media_question":
      return handleAnswerQuestion(args.media_id, args.question);

    case "list_audio_styles":
      return JSON.stringify({
        styles: [
          {
            id: "factual",
            name: "Audio Diary",
            description: "Clear, structured narration focused on factual accuracy.",
          },
          {
            id: "warm",
            name: "Warm Recap",
            description: "A gentle, personal retelling like a story shared by someone who loves you.",
          },
          {
            id: "podcast",
            name: "Mini Podcast",
            description: "An engaging audio segment with commentary and narrative flow.",
          },
        ],
      });

    case "describe_screen_frame":
      return handleDescribeScreenFrame(args.session_id);

    default:
      return `Unknown tool: ${name}`;
  }
}

async function handleGetSummary(
  mediaId: string,
  style: AudioStyle,
  length = "medium",
): Promise<string> {
  if (mediaId === "demo") {
    return getDemoSummary(style);
  }

  const context = store.getMedia(mediaId);
  if (!context) {
    return "The media could not be found. Please try uploading again.";
  }

  const contextStr = buildContextSummary(context);

  const lengthInstructions: Record<string, string> = {
    short: "2-3 sentences",
    medium: "4-6 sentences",
    long: "a full paragraph of 8-10 sentences",
  };
  const lengthGuide = lengthInstructions[length] ?? lengthInstructions.medium;

  const styleInstructions: Record<string, string> = {
    factual: "Write a clear, structured, objective narration of the scene.",
    warm: "Write a warm, personal, emotionally aware narration as if retelling a cherished memory.",
    podcast: "Write an engaging audio segment with a narrative hook and commentary.",
  };

  const prompt = `${styleInstructions[style] ?? styleInstructions.warm} Keep it to ${lengthGuide}. No markdown. Speak naturally for audio. Use this media analysis:\n\n${contextStr}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content ?? "Summary unavailable.";
  } catch {
    return "Unable to generate summary at this time.";
  }
}

async function handleAnswerQuestion(
  mediaId: string,
  question: string,
): Promise<string> {
  if (mediaId === "demo") {
    return getDemoAnswer(question);
  }

  const context = store.getMedia(mediaId);
  if (!context) {
    return "I couldn't find the media context. Please try uploading again.";
  }

  const contextStr = buildContextSummary(context);

  const prompt = `You are answering a question about a photo or video for a visually impaired user. Answer only based on the media analysis below. Be concise (2-4 sentences). Mark anything uncertain with "it appears" or "I'm not certain, but". No markdown.\n\nMedia context:\n${contextStr}\n\nQuestion: ${question}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
      temperature: 0.6,
    });
    return response.choices[0]?.message?.content ?? "I'm unable to answer that right now.";
  } catch {
    return "Unable to answer that question at this time.";
  }
}

function handleDescribeScreenFrame(sessionId: string): string {
  if (!sessionId) {
    return "No session ID provided. The screen description feature requires a live session.";
  }
  const frame = liveStore.getFrame(sessionId);
  if (!frame) {
    return "No screen frame has been captured yet. Please make sure screen sharing is active.";
  }
  const capturedAt = new Date(frame.capturedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `At ${capturedAt}: ${frame.description}`;
}

function getDemoSummary(style: AudioStyle): string {
  const summaries: Record<AudioStyle, string> = {
    factual:
      "Scene: outdoor residential garden, mid-afternoon, soft golden light. Subject: one adult woman, approximate age 65-75, kneeling beside a garden bed in a light blue apron. She is tending lavender plants with focused, deliberate movements. Rosemary and potted basil visible nearby. Mood: calm, peaceful.",
    warm:
      "There she is — kneeling among the lavender as if the rest of the world has simply paused to let her be here. The golden light falls across her shoulders like a warm hand. It's the kind of quiet afternoon you remember long after it's over, because the person in it was completely, beautifully at home.",
    podcast:
      "Welcome to today's memory. We're stepping into a garden — lavender in bloom, rosemary spreading wide, and at the center of it all, one woman in a light blue apron, tending to her small corner of the world. There's something about watching someone do what they love that makes you want to slow down too.",
  };
  return summaries[style];
}

function getDemoAnswer(question: string): string {
  const answers: Record<string, string> = {
    "Who's in the photo?":
      "It appears to be an older woman, likely in her late 60s or early 70s, wearing a light blue apron. She looks calm and completely at home in her garden.",
    "What's happening here?":
      "She is kneeling beside a raised garden bed, carefully tending to lavender plants. Her movements are deliberate and practiced — this is clearly something she does regularly.",
    "What time of day was this?":
      "Based on the angle and quality of the light, this appears to be mid-afternoon — roughly 2 to 3 PM. The shadows are soft and the light has a golden, late-day warmth.",
    "Describe the mood of this moment.":
      "Peaceful and deeply personal. There's a quiet contentment in the scene — someone fully absorbed in a beloved ritual, unhurried and completely at ease.",
    "Turn this into a short podcast intro.":
      "Welcome. Today we're stepping into a garden — lavender in bloom, rosemary spreading wide, and someone who clearly loves this small corner of the world. This is a memory worth sitting with.",
  };
  return (
    answers[question] ??
    "That's a thoughtful question. Based on this memory, I can say it's a quiet, personal moment captured in a well-loved garden. The details suggest a deep connection to this place."
  );
}
