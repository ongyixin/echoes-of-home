import OpenAI from "openai";
import { MediaContext } from "./types";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

const ANALYSIS_PROMPT = `You are an expert visual analyst creating rich, grounded descriptions for visually impaired users.

Analyze this image carefully and return a JSON object with EXACTLY these fields:
{
  "scene": "Brief scene overview — setting, environment, time of day, lighting",
  "people": "Description of each person — approximate age, position, expression, relationship hints. Say 'No people visible' if none.",
  "actions": "What is happening — activities, movements, interactions",
  "mood": "Emotional tone and atmosphere of the moment",
  "notableDetails": "Meaningful details — objects, colors, text, background elements, clothing, food, animals, etc.",
  "uncertainties": "Things you cannot determine with confidence — mark clearly with 'unclear:' prefix"
}

Rules:
- Be specific and factual. Avoid guessing sensitive personal traits (ethnicity, religion, etc.)
- Mark uncertain observations clearly in the uncertainties field
- Focus on what is visible, not interpretations
- Keep each field to 1-3 sentences
- Return ONLY valid JSON, no markdown fences`;

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  mediaId: string,
  fileName: string,
): Promise<MediaContext> {
  const response = await getOpenAI().chat.completions.create({
    model: "gemini-3-flash-preview",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          },
          { type: "text", text: ANALYSIS_PROMPT },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<MediaContext> = {};
  try {
    // Strip any accidental markdown fences
    const clean = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.error("Failed to parse GPT-4o JSON response:", raw);
  }

  return {
    mediaId,
    fileName,
    fileType: "image",
    scene: parsed.scene ?? "Unable to determine scene.",
    people: parsed.people ?? "No people information available.",
    actions: parsed.actions ?? "No actions detected.",
    mood: parsed.mood ?? "Mood unclear.",
    notableDetails: parsed.notableDetails ?? "No notable details.",
    uncertainties: parsed.uncertainties ?? "None noted.",
    rawAnalysis: raw,
    uploadedAt: new Date().toISOString(),
  };
}

export function buildContextSummary(context: MediaContext): string {
  return `
MEDIA CONTEXT FOR ${context.fileName}
Type: ${context.fileType}
Uploaded: ${context.uploadedAt}

Scene: ${context.scene}
People: ${context.people}
Actions: ${context.actions}
Mood: ${context.mood}
Notable Details: ${context.notableDetails}
Uncertainties: ${context.uncertainties}
`.trim();
}
