"use client";

import { useState, useEffect, useRef, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import AudioPlayer from "@/components/AudioPlayer";
import VoiceAssistantPanel from "@/components/VoiceAssistantPanel";
import MediaPreview from "@/components/MediaPreview";
import Navbar from "@/components/Navbar";
import AccessibilityFooter from "@/components/AccessibilityFooter";
import { AudioStyle, MediaContext, TranscriptMessage } from "@/lib/types";

const DEMO_TRANSCRIPTS: Record<string, string> = {
  warm: "The light is soft and golden — early afternoon, maybe around two or three. She's kneeling beside a row of lavender and rosemary, her hands gentle as ever. The garden looks lovingly tended. You can almost smell the herbs from here. There's a quiet joy in how she moves — unhurried, completely at home in this small patch of earth.",
  factual: "Scene: outdoor residential garden setting, daylight conditions, estimated mid-afternoon. Primary subject: one adult female, age approximately 65-75, kneeling position. Plants visible: lavender, rosemary, and what appears to be basil. Soil appears recently watered. No other people visible in frame. Mood: calm and focused.",
  podcast: "Welcome to today's memory segment. We're stepping into a garden that's clearly been tended with love — this is someone's sanctuary. Our subject today is kneeling among herbs in what looks like a sunny afternoon. The lavender is blooming. The rosemary has spread into a small bush. And in the center of it all, she tends to her garden as if nothing else matters in the world.",
};

const DEMO_TITLES: Record<string, string> = {
  warm: "Grandma's Garden Visit",
  factual: "Garden Afternoon",
  podcast: "A Gardener's Afternoon",
};

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionPage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);

  const rawStyle = searchParams.get("style") as AudioStyle | null;
  const rawTitle = searchParams.get("title");
  const isDemo = id === "demo";

  const [style, setStyle] = useState<AudioStyle>(rawStyle ?? "warm");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [mediaContext, setMediaContext] = useState<MediaContext | null>(null);

  // Fetch stored analysis context for real (non-demo) sessions
  useEffect(() => {
    if (isDemo) return;
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: id }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.context) setMediaContext(data.context); })
      .catch(() => {});
  }, [id, isDemo]);

  const title = rawTitle
    ? decodeURIComponent(rawTitle)
    : isDemo
    ? DEMO_TITLES[style] ?? "Your Memory"
    : "Your Memory";

  // Build a style-specific narration from the analyzed media context
  const buildContextTranscript = (ctx: MediaContext, s: AudioStyle): string => {
    const hasPeople = ctx.people && ctx.people !== "No people visible" && ctx.people !== "No people information available.";
    switch (s) {
      case "warm":
        return [
          ctx.scene,
          hasPeople ? ctx.people : null,
          ctx.mood,
          ctx.notableDetails,
        ].filter(Boolean).join(" ");
      case "factual":
        return [
          ctx.scene,
          hasPeople ? `People: ${ctx.people}` : null,
          `Actions: ${ctx.actions}`,
          `Mood: ${ctx.mood}`,
          `Notable details: ${ctx.notableDetails}`,
        ].filter(Boolean).join(" ");
      case "podcast":
        return [
          `Welcome to this memory.`,
          ctx.scene,
          hasPeople ? ctx.people : null,
          ctx.actions,
          ctx.mood,
          ctx.notableDetails,
        ].filter(Boolean).join(" ");
    }
  };

  const currentTranscript = isDemo
    ? DEMO_TRANSCRIPTS[style]
    : mediaContext
    ? buildContextTranscript(mediaContext, style)
    : undefined;

  // Build the public URL for the uploaded image stored under /uploads/
  const uploadedImageUrl = !isDemo && mediaContext?.fileName
    ? `/uploads/${mediaContext.fileName}`
    : undefined;

  // Initialize Vapi
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.warn("NEXT_PUBLIC_VAPI_PUBLIC_KEY not set — voice features disabled.");
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setCallStatus("active");
      setIsListening(false);
    });

    vapi.on("call-end", () => {
      setCallStatus("ended");
      setIsListening(false);
      setIsSpeaking(false);
    });

    vapi.on("speech-start", () => setIsListening(true));
    vapi.on("speech-end", () => setIsListening(false));

    vapi.on("message", (msg: Record<string, unknown>) => {
      if (msg.type === "transcript") {
        const role = msg.role as "user" | "assistant";
        const text = msg.transcript as string;
        if (msg.transcriptType === "final") {
          setTranscript((prev) => [...prev, { role, content: text, timestamp: new Date() }]);
          setIsSpeaking(role === "assistant");
        }
      }
      if (msg.type === "speech-update") {
        setIsSpeaking(msg.status === "started");
      }
    });

    vapi.on("error", (err: Error) => {
      console.error("Vapi error:", err);
      setCallStatus("error");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const handleStartCall = async () => {
    const vapi = vapiRef.current;
    if (!vapi) {
      // No Vapi key — simulate demo conversation
      simulateDemoConversation();
      return;
    }

    setCallStatus("connecting");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: id, style }),
      });

      if (!res.ok) throw new Error("Session creation failed");
      const { assistantConfig } = await res.json();
      await vapi.start(assistantConfig);
    } catch (err) {
      console.error(err);
      // Fall back to demo simulation
      simulateDemoConversation();
    }
  };

  const handleEndCall = () => {
    vapiRef.current?.stop();
    setCallStatus("ended");
    setIsListening(false);
    setIsSpeaking(false);
  };

  const handleSendPrompt = (prompt: string) => {
    if (!vapiRef.current) {
      // Simulate for demo
      simulateResponse(prompt);
      return;
    }
    vapiRef.current.send({
      type: "add-message",
      message: { role: "user", content: prompt },
    });
  };

  const simulateDemoConversation = () => {
    setCallStatus("active");
    setTimeout(() => {
      setIsSpeaking(true);
      setTranscript([{
        role: "assistant",
        content: `Hello! I'm ready to talk about ${title}. What would you like to know?`,
        timestamp: new Date(),
      }]);
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 800);
  };

  const simulateResponse = (prompt: string) => {
    setTranscript((prev) => [...prev, { role: "user", content: prompt, timestamp: new Date() }]);
    setIsSpeaking(true);
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Who's in the photo?": "It appears to be an older woman, likely in her late 60s or early 70s, tending to a garden. She looks relaxed and at home.",
        "What's happening here?": "She's kneeling in a garden, carefully tending to herbs — lavender, rosemary, and possibly basil. The light suggests mid-afternoon.",
        "What time of day was this?": "Based on the light angle and quality, I'd estimate this was taken around 2 to 3 in the afternoon. The shadows are soft and the light has that warm golden quality.",
        "Describe the mood of this moment.": "Peaceful and deeply personal. There's a quiet contentment here — someone completely at home in their own small world.",
        "Turn this into a short podcast intro.": "Welcome to today's episode. We're stepping into a garden story — lavender, rosemary, and one woman's quiet ritual with the earth. This is the kind of afternoon that stays with you.",
      };
      const response = responses[prompt] ?? "That's a great question. Based on the memory, I can see this is a warm, personal moment captured with care and love.";
      setTranscript((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
      setIsSpeaking(false);
    }, 1500);
  };

  const handleStyleChange = (newStyle: AudioStyle) => {
    setStyle(newStyle);
    if (callStatus === "active") {
      handleEndCall();
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Session header */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-[#a07060] hover:text-[#c4684a] transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded"
            aria-label="Go back to home page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {isDemo && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fddbb4]/60 text-[#c4684a] border border-[#fddbb4]">
              Demo
            </span>
          )}
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#4a3728]">
          {title}
        </h1>

        {callStatus === "error" && (
          <div className="mt-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800" role="alert">
            Voice connection unavailable — running in demo mode. Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_VAPI_PUBLIC_KEY</code> to enable live voice.
          </div>
        )}
      </div>

      {/* Media preview */}
      <div className="max-w-2xl mx-auto px-6 py-4">
        <MediaPreview
          isDemo={isDemo}
          imageUrl={uploadedImageUrl}
          demoEmoji="🌻"
          demoTitle={title}
          analysisStatus="done"
        />
      </div>

      {/* Audio player */}
      <AudioPlayer
        title={title}
        subtitle={isDemo ? "Demo memory · Warm narration" : undefined}
        style={style}
        onStyleChange={handleStyleChange}
        transcript={currentTranscript}
        thumbnailEmoji={isDemo ? "🌻" : mediaContext?.fileType === "video" ? "🎬" : "📷"}
      />

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#f9d5d3] to-transparent" aria-hidden="true" />
      </div>

      {/* Voice assistant */}
      <VoiceAssistantPanel
        isCallActive={callStatus === "active"}
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={transcript}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
        onSendPrompt={handleSendPrompt}
        isLoading={callStatus === "connecting"}
      />

      <AccessibilityFooter />
    </div>
  );
}
