"use client";

import { useRef } from "react";

interface HeroProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

export default function Hero({ onUploadClick, onDemoClick }: HeroProps) {
  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
      aria-label="Welcome to Echoes of Home"
    >
      {/* Background gradient orbs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fddbb4]/60 to-[#f9d5d3]/40 blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#e8dff5]/60 to-[#d4e8f0]/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#f9d5d3]/40 to-[#fddbb4]/30 blur-3xl" />
      </div>

      {/* Floating waveform decorations */}
      <div aria-hidden="true" className="absolute top-16 right-16 opacity-20 animate-float hidden md:flex items-end gap-[3px] h-10">
        {[14, 22, 32, 18, 28, 36, 20, 30, 16, 24].map((h, i) => (
          <div
            key={i}
            className="waveform-bar w-[3px] rounded-full bg-[#e8927c]"
            style={{ height: h, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="absolute bottom-24 left-12 opacity-15 animate-float hidden md:flex items-end gap-[3px] h-8" style={{ animationDelay: "1.5s" }}>
        {[10, 18, 26, 14, 22, 16, 28, 12, 20].map((h, i) => (
          <div
            key={i}
            className="waveform-bar w-[3px] rounded-full bg-[#d4a5a5]"
            style={{ height: h, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#f9d5d3] text-[#7a5c4e] text-sm font-medium mb-8 shadow-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#e8927c] animate-breathe" />
          Voice-First Memory Assistant
        </div>

        {/* Heading */}
        <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-[1.1] text-[#4a3728] mb-6 animate-fade-up text-balance">
          Echoes of{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-[#c4684a]">Home</span>
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 right-0 h-3 bg-[#fddbb4]/70 rounded-full -z-0"
            />
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-xl md:text-2xl text-[#7a5c4e] leading-relaxed max-w-2xl mx-auto mb-4 animate-fade-up text-balance"
          style={{ animationDelay: "0.1s" }}
        >
          Turn cherished moments into stories you can hear.
        </p>
        <p
          className="text-base md:text-lg text-[#a07060] max-w-xl mx-auto mb-12 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Upload a photo, connect your Instagram or TikTok, or share your screen
          while scrolling — and hear your world described in real-time.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={onUploadClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c4684a] text-white text-base font-semibold shadow-lg hover:bg-[#b05a3e] hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#c4684a] focus-visible:ring-offset-2"
            aria-label="Upload a photo or video to get started"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload a Memory
          </button>

          <button
            onClick={onDemoClick}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#7a5c4e] text-base font-semibold border border-[#f9d5d3] shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#d4a5a5] focus-visible:ring-offset-2"
            aria-label="Try the demo with a sample memory"
          >
            <svg className="w-5 h-5 text-[#e8927c]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            Try a Demo
          </button>
        </div>

        {/* Social proof / features */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-[#a07060] animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { icon: "🎙️", label: "Voice-first interaction" },
            { icon: "♿", label: "Accessibility-first design" },
            { icon: "📱", label: "Live social media description" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#c4b4ae] text-xs animate-float"
        style={{ animationDelay: "2s" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
