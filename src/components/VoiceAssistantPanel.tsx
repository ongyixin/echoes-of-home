"use client";

import { useState, useEffect, useRef } from "react";
import { TranscriptMessage } from "@/lib/types";

interface VoiceAssistantPanelProps {
  isCallActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: TranscriptMessage[];
  onStartCall: () => void;
  onEndCall: () => void;
  onSendPrompt: (prompt: string) => void;
  isLoading?: boolean;
}

const SAMPLE_PROMPTS = [
  "Who's in the photo?",
  "What's happening here?",
  "What time of day was this?",
  "Describe the mood of this moment.",
  "Turn this into a short podcast intro.",
];

export default function VoiceAssistantPanel({
  isCallActive,
  isListening,
  isSpeaking,
  transcript,
  onStartCall,
  onEndCall,
  onSendPrompt,
  isLoading,
}: VoiceAssistantPanelProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <section
      className="px-6 py-10"
      aria-labelledby="assistant-heading"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[#e8927c] tracking-widest uppercase mb-2">
            Step 3
          </p>
          <h2
            id="assistant-heading"
            className="font-serif text-3xl md:text-4xl font-semibold text-[#4a3728] mb-3"
          >
            Ask About Your Memory
          </h2>
          <p className="text-[#7a5c4e] text-lg">
            Talk with the assistant. Ask anything about the moment.
          </p>
        </div>

        <div className="card-surface overflow-hidden">
          {/* Transcript area */}
          <div
            className="h-64 overflow-y-auto p-6 space-y-4"
            style={{ background: "linear-gradient(to bottom, #fef9f5, #ffffff)" }}
            role="log"
            aria-live="polite"
            aria-label="Conversation transcript"
          >
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#fef7e4] flex items-center justify-center text-3xl" aria-hidden="true">
                  🎙️
                </div>
                <p className="text-[#c4b4ae] text-sm">
                  Start a conversation to ask about your memory.
                </p>
              </div>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 animate-fade-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
                      msg.role === "assistant"
                        ? "bg-[#fddbb4] text-[#c4684a]"
                        : "bg-[#e8dff5] text-[#9370b8]"
                    }`}
                    aria-hidden="true"
                  >
                    {msg.role === "assistant" ? "✨" : "👤"}
                  </div>
                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-white border border-[#f9d5d3] text-[#4a3728] rounded-tl-sm"
                        : "bg-[#e8dff5] text-[#4a3728] rounded-tr-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-[#fddbb4] flex items-center justify-center text-sm" aria-hidden="true">
                  ✨
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#f9d5d3]">
                  {[0, 0.15, 0.3].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-[#e8927c] animate-breathe"
                      style={{ animationDelay: `${delay}s` }}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="sr-only">Assistant is speaking</span>
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Mic + controls */}
          <div className="p-6 border-t border-[#f9d5d3]/60">
            {!isCallActive ? (
              <div className="text-center">
                <button
                  onClick={onStartCall}
                  disabled={isLoading}
                  className="group relative mx-auto flex flex-col items-center gap-3 focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-4 rounded-full"
                  aria-label="Start voice conversation"
                >
                  <div className="relative w-20 h-20">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-[#fddbb4]/50 scale-110 group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />
                    {/* Button */}
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#e8927c] to-[#c4684a] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                      {isLoading ? (
                        <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#7a5c4e]">
                    {isLoading ? "Connecting…" : "Tap to speak"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Active listening indicator */}
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                      ${isListening
                        ? "bg-gradient-to-br from-[#e8927c] to-[#c4684a] animate-glow-pulse shadow-lg"
                        : "bg-[#fddbb4]/50"
                      }
                    `}
                    aria-hidden="true"
                  >
                    <svg className={`w-6 h-6 ${isListening ? "text-white" : "text-[#e8927c]"}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#4a3728]" aria-live="polite">
                      {isListening ? "Listening…" : isSpeaking ? "Speaking…" : "Ready"}
                    </p>
                    <p className="text-xs text-[#c4b4ae]">Voice session active</p>
                  </div>
                  <button
                    onClick={onEndCall}
                    className="ml-auto px-4 py-2 rounded-full text-sm font-medium text-[#a07060] bg-[#f9d5d3]/40 hover:bg-[#f9d5d3] border border-[#f0b8b5] transition-all focus-visible:ring-2 focus-visible:ring-[#e8927c]"
                    aria-label="End voice session"
                  >
                    End
                  </button>
                </div>
              </div>
            )}

            {/* Sample prompts */}
            <div className="mt-5">
              <p className="text-xs text-center text-[#c4b4ae] mb-3 uppercase tracking-wide font-medium">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSendPrompt(prompt)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#f9d5d3] text-[#7a5c4e] hover:border-[#e8927c] hover:text-[#c4684a] hover:bg-[#fddbb4]/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#e8927c]"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
