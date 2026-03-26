import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

const LIVE_FRAME_PROMPT = `You are an accessibility assistant describing a mobile or desktop screen to a visually impaired user who is scrolling through social media.

Describe the visual content in 3-5 complete, natural sentences suitable for audio narration:
- What type of content is visible (photo post, video/reel, story, text post, carousel, advertisement, profile page, etc.)
- Who or what is in it (people, animals, scenery, objects, any text or captions visible on screen)
- Any readable text, captions, or overlays in the post
- The general mood or theme

If content appears similar to the previous description, focus only on what is meaningfully new or different.
If the screen shows UI chrome (navigation bar, like buttons, etc.) rather than content, describe the content area only.

Always write complete sentences — never cut off mid-sentence. No markdown. No lists. Speak naturally as if narrating to someone beside you.`;

export interface FrameAnalysisResult {
  description: string;
  timestamp: string;
  hasSignificantChange: boolean;
}

export async function analyzeFrame(
  frameBase64: string,
  mimeType: string,
  previousDescription?: string,
): Promise<FrameAnalysisResult> {
  const contextNote = previousDescription
    ? `\n\nPrevious screen description: "${previousDescription}"\nFocus on what is NEW or different.`
    : "";

  const prompt = LIVE_FRAME_PROMPT + contextNote;

  const response = await getOpenAI().chat.completions.create({
    model: "gemini-3-flash-preview",
    max_tokens: 400,
    temperature: 0.5,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${frameBase64}`,
              detail: "low",
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const description =
    response.choices[0]?.message?.content?.trim() ??
    "Unable to describe this frame.";

  // Consider it a significant change if description differs meaningfully from previous
  const hasSignificantChange =
    !previousDescription ||
    description.toLowerCase() !== previousDescription.toLowerCase();

  return {
    description,
    timestamp: new Date().toISOString(),
    hasSignificantChange,
  };
}
