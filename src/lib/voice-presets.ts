import { AudioStyle, VoicePreset } from "./types";

// Cartesia sonic-3 voice presets
// Uses Cartesia's own named voices from their Sonic 3 docs.
// Stable voices (Katie, Kiefer) are recommended for voice agents.
// Tessa is Cartesia's recommended expressive voice for emotional warmth.
// IDs sourced directly from https://docs.cartesia.ai/build-with-cartesia/tts-models
export const VOICE_PRESETS: Record<AudioStyle, VoicePreset> = {
  factual: {
    id: "neutral-clarity",
    name: "Katie",
    cartesiaVoiceId: "f786b574-daa5-4673-aa0c-cbe3e8534c02",
    model: "sonic-3",
    description: "Clear, measured narration for accessibility-first listening",
    label: "Calm & Clear",
  },
  warm: {
    id: "warm-narrator",
    name: "Tessa",
    cartesiaVoiceId: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
    model: "sonic-3",
    description: "Warm, intimate narration like a memory shared by someone who loves you",
    label: "Gentle & Warm",
  },
  podcast: {
    id: "podcast-host",
    name: "Kiefer",
    cartesiaVoiceId: "228fca29-3a0a-435c-8728-5cb483251068",
    model: "sonic-3",
    description: "Engaging, lively audio segment delivery with commentary",
    label: "Lively & Rich",
  },
};

export function getVoicePreset(style: AudioStyle): VoicePreset {
  return VOICE_PRESETS[style];
}
