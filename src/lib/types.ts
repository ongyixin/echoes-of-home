export type AudioStyle = "factual" | "warm" | "podcast";

export type VoicePresetId = "neutral-clarity" | "warm-narrator" | "podcast-host";

export type CartesiaEmotion =
  | "anger:lowest" | "anger:low" | "anger:high" | "anger:highest"
  | "positivity:lowest" | "positivity:low" | "positivity:high" | "positivity:highest"
  | "surprise:lowest" | "surprise:low" | "surprise:high" | "surprise:highest"
  | "sadness:lowest" | "sadness:low" | "sadness:high" | "sadness:highest"
  | "curiosity:lowest" | "curiosity:low" | "curiosity:high" | "curiosity:highest";

export interface VoicePreset {
  id: VoicePresetId;
  name: string;
  cartesiaVoiceId: string;
  model: string;
  emotion?: CartesiaEmotion;
  description: string;
  label: string;
}

export interface MediaContext {
  mediaId: string;
  fileName: string;
  fileType: "image" | "video";
  scene: string;
  people: string;
  actions: string;
  mood: string;
  notableDetails: string;
  uncertainties: string;
  rawAnalysis: string;
  uploadedAt: string;
}

export interface SessionData {
  mediaId: string;
  style: AudioStyle;
  context: MediaContext;
  createdAt: string;
}

export interface VapiToolCallPayload {
  message: {
    type: "tool-calls";
    toolCallList: Array<{
      id: string;
      type: "function";
      function: {
        name: string;
        arguments: string;
      };
    }>;
  };
}

export interface ToolResult {
  results: Array<{
    toolCallId: string;
    result: string;
  }>;
}

export interface MemoryCard {
  id: string;
  title: string;
  style: AudioStyle;
  styleLabel: string;
  duration: string;
  thumbnail: string;
  date: string;
  emotionalTone: string;
  transcript: string;
}

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
