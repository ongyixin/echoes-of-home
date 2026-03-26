import { NextRequest } from "next/server";
import { VOICE_PRESETS } from "@/lib/voice-presets";
import { AudioStyle } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { text, style = "factual" } = await req.json();

  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    return new Response("CARTESIA_API_KEY not configured", { status: 500 });
  }

  if (!text?.trim()) {
    return new Response("text is required", { status: 400 });
  }

  const preset = VOICE_PRESETS[style as AudioStyle] ?? VOICE_PRESETS.factual;

  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Cartesia-Version": "2026-03-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: preset.model,
      transcript: text,
      voice: { mode: "id", id: preset.cartesiaVoiceId },
      output_format: {
        container: "mp3",
        sample_rate: 44100,
        bit_rate: 128000,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Cartesia TTS error:", response.status, err);
    return new Response(`Cartesia error: ${err}`, { status: response.status });
  }

  const audioBuffer = await response.arrayBuffer();

  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
