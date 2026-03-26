"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AccessibilityFooter from "@/components/AccessibilityFooter";
import ScreenSharePanel, { FrameCapture } from "@/components/ScreenSharePanel";
import LiveTranscript, { LiveDescription } from "@/components/LiveTranscript";
import PeopleBook from "@/components/PeopleBook";
import { FollowedPerson } from "@/lib/social-types";
import { v4 as uuidv4 } from "uuid";

type CaptureInterval = 2000 | 3000 | 5000 | 8000;

const INTERVAL_LABELS: Record<CaptureInterval, string> = {
  2000: "Every 2s (fast)",
  3000: "Every 3s (default)",
  5000: "Every 5s (balanced)",
  8000: "Every 8s (slow)",
};

export default function LivePage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [descriptions, setDescriptions] = useState<LiveDescription[]>([]);
  const [captureInterval, setCaptureInterval] = useState<CaptureInterval>(3000);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [launchHint, setLaunchHint] = useState<string | null>(null);
  const lastDescriptionRef = useRef<string | undefined>(undefined);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const isSpeakingRef = useRef(false);
  // Holds at most one pending description — always the most recent one.
  // Older pending descriptions are discarded so the voice never falls behind the scroll.
  const pendingTextRef = useRef<string | null>(null);

  const playText = useCallback(async (text: string) => {
    if (!text) return;
    isSpeakingRef.current = true;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "factual" = Katie, Cartesia's recommended stable voice for accessibility
        body: JSON.stringify({ text, style: "factual" }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      currentBlobUrlRef.current = url;

      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentBlobUrlRef.current = null;
        currentAudioRef.current = null;
        isSpeakingRef.current = false;

        // Play the next pending description if one arrived while we were speaking
        const next = pendingTextRef.current;
        if (next) {
          pendingTextRef.current = null;
          playText(next);
        }
      };

      audio.onerror = () => {
        currentAudioRef.current = null;
        isSpeakingRef.current = false;
        const next = pendingTextRef.current;
        if (next) {
          pendingTextRef.current = null;
          playText(next);
        }
      };

      audio.play().catch(() => {
        isSpeakingRef.current = false;
      });
    } catch {
      isSpeakingRef.current = false;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled) return;

      if (isSpeakingRef.current) {
        // Already speaking — park this as the next-up description, replacing any older pending one
        pendingTextRef.current = text;
      } else {
        pendingTextRef.current = null;
        playText(text);
      }
    },
    [voiceEnabled, playText],
  );

  const handleFrame = useCallback(
    async (frame: FrameCapture) => {
      if (isAnalyzing) return;

      setIsAnalyzing(true);
      setError(null);

      try {
        const res = await fetch("/api/analyze-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frameBase64: frame.base64,
            mimeType: frame.mimeType,
            previousDescription: lastDescriptionRef.current,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Analysis failed");
        }

        const { description, hasSignificantChange } = await res.json();

        if (hasSignificantChange && description) {
          const newDesc: LiveDescription = {
            id: uuidv4(),
            description,
            timestamp: frame.capturedAt,
          };
          setDescriptions((prev) => [...prev.slice(-49), newDesc]);
          lastDescriptionRef.current = description;
          speak(description);
        }
      } catch (err) {
        console.error("Frame analysis error:", err);
        setError(err instanceof Error ? err.message : "Failed to analyze frame");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isAnalyzing, speak],
  );

  const handleStartCapture = useCallback(() => {
    setIsCapturing(true);
    setDescriptions([]);
    setLaunchHint(null);
    lastDescriptionRef.current = undefined;
  }, []);

  const handleStopCapture = useCallback(() => {
    setIsCapturing(false);
    pendingTextRef.current = null;
    isSpeakingRef.current = false;
    if (currentAudioRef.current) {
      currentAudioRef.current.onended = null;
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  }, []);

  const handlePersonLaunched = useCallback(
    (person: FollowedPerson, platform: "instagram" | "tiktok") => {
      setLaunchHint(
        `${person.name}'s ${platform === "instagram" ? "Instagram" : "TikTok"} opened in a new tab. Now click "Start Screen Share" and select that tab to hear their posts described live.`,
      );
    },
    [],
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-10">
        {/* Back nav */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#a07060] hover:text-[#c4684a] transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded"
            aria-label="Go back to home page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fddbb4]/60 text-[#c4684a] border border-[#fddbb4]">
            Live
          </span>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#4a3728] mb-2">
          Browse Friends &amp; Family
        </h1>
        <p className="text-[#7a5c4e] mb-8">
          Share your screen while scrolling Instagram or TikTok and we'll describe
          every post — including your friends' and family's content — in real-time.
        </p>

        {/* People quick-launch */}
        <section aria-labelledby="people-heading" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 id="people-heading" className="text-sm font-semibold text-[#4a3728]">
              Your People
            </h2>
            <span className="text-xs text-[#a07060]">Click a handle to open their profile</span>
          </div>
          <PeopleBook showLaunchButtons onPersonLaunched={handlePersonLaunched} />
        </section>

        {/* Launch hint — shown after clicking a profile link */}
        {launchHint && (
          <div
            role="status"
            className="mb-6 px-4 py-3 rounded-xl bg-[#fddbb4]/40 border border-[#fddbb4] text-sm text-[#7a5c4e] flex gap-3 items-start animate-fade-in"
          >
            <svg className="w-4 h-4 mt-0.5 text-[#e8927c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {launchHint}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8" aria-hidden="true">
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
          <span className="text-xs text-[#c4b4ae] font-medium">screen share</span>
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
        </div>

        {/* Screen share panel */}
        <section aria-labelledby="screen-share-heading" className="mb-6">
          <h2 id="screen-share-heading" className="sr-only">Screen sharing controls</h2>
          <ScreenSharePanel
            onFrame={handleFrame}
            onStop={handleStopCapture}
            captureIntervalMs={captureInterval}
            isCapturing={isCapturing}
            onStartCapture={handleStartCapture}
            onStopCapture={handleStopCapture}
          />
        </section>

        {/* Settings — shown when sharing is active */}
        {isCapturing && (
          <section
            className="mb-6 p-4 rounded-2xl bg-white/70 border border-[#f9d5d3] space-y-4"
            aria-label="Capture settings"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="capture-interval"
                  className="block text-xs font-medium text-[#7a5c4e] mb-1.5"
                >
                  Capture speed
                </label>
                <select
                  id="capture-interval"
                  value={captureInterval}
                  onChange={(e) => setCaptureInterval(Number(e.target.value) as CaptureInterval)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[#f0b8b5] bg-white text-[#4a3728] focus:outline-none focus:ring-2 focus:ring-[#e8927c]"
                >
                  {(Object.entries(INTERVAL_LABELS) as [string, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    role="switch"
                    aria-checked={voiceEnabled}
                    aria-label="Enable voice narration"
                    onClick={() => setVoiceEnabled((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                      voiceEnabled ? "bg-[#e8927c]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        voiceEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-[#4a3728]">
                    Voice {voiceEnabled ? "on" : "off"}
                  </span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Live transcript */}
        <section aria-labelledby="transcript-heading" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 id="transcript-heading" className="text-sm font-semibold text-[#4a3728]">
              Live Descriptions
            </h2>
            {descriptions.length > 0 && (
              <button
                onClick={() => {
                  setDescriptions([]);
                  lastDescriptionRef.current = undefined;
                }}
                className="text-xs text-[#a07060] hover:text-[#c4684a] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <LiveTranscript descriptions={descriptions} isLoading={isAnalyzing} />
        </section>

        {/* How it works — only before first use */}
        {!isCapturing && descriptions.length === 0 && (
          <section
            className="rounded-2xl bg-white/50 border border-[#f9d5d3] p-6"
            aria-labelledby="how-it-works-heading"
          >
            <h2 id="how-it-works-heading" className="text-sm font-semibold text-[#4a3728] mb-4">
              How to browse friends &amp; family posts
            </h2>
            <ol className="space-y-3">
              {[
                "Add your family and friends above — then click their handle to open their profile.",
                "Or go to Instagram or TikTok yourself and scroll to your home feed.",
                "Click \"Start Screen Share\" and select that browser tab or window.",
                "Scroll through the feed — every post is described aloud as it appears.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#7a5c4e]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fddbb4] text-[#c4684a] text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <AccessibilityFooter />
    </div>
  );
}
