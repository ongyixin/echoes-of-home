import { AudioStyle } from "./types";
import { MediaContext } from "./types";

const BASE_RULES = `
CORE RULES:
- You are a voice assistant helping a visually impaired user understand a photo or video.
- Only answer questions based on what is in the analyzed media context provided below.
- If uncertain, say so clearly: use phrases like "it appears", "I'm not certain, but" or "the image suggests".
- Never guess sensitive personal traits (ethnicity, religion, health status, income, political beliefs).
- Keep responses concise — 2 to 4 sentences unless the user asks for more detail.
- Speak naturally for audio. Avoid lists, markdown, bullet points, or symbols.
- If asked something that cannot be determined from the image, say so honestly.
`.trim();

const STYLE_INSTRUCTIONS: Record<AudioStyle, string> = {
  factual: `
STYLE: Audio Diary — Clear and Structured
Describe the scene accurately and systematically. Use objective, descriptive language.
Structure your responses: first the scene, then people, then actions, then details.
Tone: calm, measured, informative. Like a thoughtful museum audio guide.
`.trim(),

  warm: `
STYLE: Warm Recap — Gentle and Personal
Speak as a warm, caring narrator retelling a family memory.
Use language that feels personal and emotionally aware.
Acknowledge the emotional weight of the moment when appropriate.
Tone: gentle, intimate, comforting. Like a voice note from someone who loves you.
`.trim(),

  podcast: `
STYLE: Mini Podcast — Engaging and Narrative
Present this memory as an engaging audio segment.
Add context, commentary, and natural transitions.
Begin responses with a light narrative hook when appropriate.
Tone: warm but lively, curious, storytelling-focused. Like a family memory podcast.
`.trim(),
};

export function buildSystemPrompt(
  style: AudioStyle,
  context: MediaContext,
): string {
  const contextSummary = `
MEDIA ANALYSIS FOR: ${context.fileName}
Uploaded: ${context.uploadedAt}
File type: ${context.fileType}

Scene: ${context.scene}
People: ${context.people}
Actions: ${context.actions}
Mood: ${context.mood}
Notable details: ${context.notableDetails}
Uncertainties (items that cannot be determined with confidence): ${context.uncertainties}
`.trim();

  return `You are Echoes — a warm, thoughtful voice assistant that helps visually impaired users experience family photos and videos through conversation.

${STYLE_INSTRUCTIONS[style]}

${BASE_RULES}

${contextSummary}

Start the conversation by offering a brief, warm introduction to the memory using the style above. Then invite follow-up questions.`;
}

export function buildDemoSystemPrompt(style: AudioStyle): string {
  const demoContext: MediaContext = {
    mediaId: "demo",
    fileName: "Grandmas-Garden-Visit.jpg",
    fileType: "image",
    scene: "An outdoor residential garden setting during mid-afternoon, with soft golden light filtering through a wooden fence. The garden is well-tended, with raised beds and container plants arranged along the perimeter.",
    people: "One adult woman, estimated age 65-75. She is kneeling beside a garden bed, wearing a light blue apron. Her expression is calm and focused. She appears comfortable and at home in this space.",
    actions: "She is carefully pruning or tending to lavender plants with both hands. Her movements appear deliberate and practiced.",
    mood: "Peaceful, quiet, and deeply personal. The atmosphere is one of gentle contentment — someone fully absorbed in a beloved ritual.",
    notableDetails: "Lavender plants in bloom (purple flowers), rosemary bush to the right, what appears to be basil in a terracotta pot nearby. A pair of gardening gloves rests on the edge of the raised bed. Late afternoon shadows suggest the sun is at a low angle.",
    uncertainties: "unclear: exact relationship of this person to the photo's owner. unclear: whether this is a private home or community garden.",
    rawAnalysis: "",
    uploadedAt: new Date().toISOString(),
  };

  return buildSystemPrompt(style, demoContext);
}
