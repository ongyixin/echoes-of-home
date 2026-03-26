"use client";

import { useEffect, useRef } from "react";

export interface LiveDescription {
  id: string;
  description: string;
  timestamp: string;
}

interface LiveTranscriptProps {
  descriptions: LiveDescription[];
  isLoading?: boolean;
}

export default function LiveTranscript({ descriptions, isLoading }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [descriptions]);

  if (descriptions.length === 0 && !isLoading) {
    return (
      <div className="rounded-2xl bg-white/60 border border-[#f9d5d3] p-8 text-center">
        <div
          className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(253, 219, 180, 0.3)" }}
        >
          <svg
            className="w-6 h-6 text-[#c4684a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </div>
        <p className="text-sm text-[#a07060]">
          Start screen sharing to hear live descriptions here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white/60 border border-[#f9d5d3] overflow-hidden"
      aria-live="polite"
      aria-label="Live screen descriptions"
    >
      <div className="px-4 py-3 border-b border-[#f9d5d3] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#4a3728]">Live Descriptions</h3>
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-[#a07060]">
            <svg className="w-3.5 h-3.5 animate-spin text-[#e8927c]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing…
          </div>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
        {descriptions.map((item, index) => (
          <div
            key={item.id}
            className={`flex gap-3 animate-fade-in ${
              index === descriptions.length - 1 ? "opacity-100" : "opacity-60"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#e8927c]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#4a3728] leading-relaxed">{item.description}</p>
              <time
                dateTime={item.timestamp}
                className="text-xs text-[#c4b4ae] mt-1 block"
              >
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </time>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
