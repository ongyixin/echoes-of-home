"use client";

import { AudioStyle } from "@/lib/types";

const MODES: Array<{
  id: AudioStyle;
  label: string;
  emoji: string;
  description: string;
  tone: string;
  toneColor: string;
  bgColor: string;
  borderColor: string;
  selectedBg: string;
}> = [
  {
    id: "factual",
    label: "Audio Diary",
    emoji: "📖",
    description: "Clear, structured narration. Every detail described with care.",
    tone: "Calm & Clear",
    toneColor: "text-[#5a8fa8]",
    bgColor: "bg-[#d4e8f0]/30",
    borderColor: "border-[#d4e8f0]",
    selectedBg: "bg-[#d4e8f0]/60",
  },
  {
    id: "warm",
    label: "Warm Recap",
    emoji: "🌿",
    description: "A gentle retelling, like a story shared by someone who loves you.",
    tone: "Gentle & Warm",
    toneColor: "text-[#c4684a]",
    bgColor: "bg-[#fddbb4]/30",
    borderColor: "border-[#fddbb4]",
    selectedBg: "bg-[#fddbb4]/60",
  },
  {
    id: "podcast",
    label: "Mini Podcast",
    emoji: "🎙️",
    description: "An engaging audio segment with commentary and natural flow.",
    tone: "Lively & Rich",
    toneColor: "text-[#9370b8]",
    bgColor: "bg-[#e8dff5]/30",
    borderColor: "border-[#e8dff5]",
    selectedBg: "bg-[#e8dff5]/60",
  },
];

interface ModeSelectorProps {
  selected: AudioStyle;
  onChange: (style: AudioStyle) => void;
}

export default function ModeSelector({ selected, onChange }: ModeSelectorProps) {
  return (
    <section className="px-6 py-10" aria-labelledby="mode-heading">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[#e8927c] tracking-widest uppercase mb-2">
            Step 2
          </p>
          <h2
            id="mode-heading"
            className="font-serif text-3xl md:text-4xl font-semibold text-[#4a3728] mb-3"
          >
            Choose Your Style
          </h2>
          <p className="text-[#7a5c4e] text-lg">
            How would you like your memory told?
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Audio style selection"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {MODES.map((mode) => {
            const isSelected = selected === mode.id;
            return (
              <button
                key={mode.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(mode.id)}
                className={`
                  relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                  hover:-translate-y-1 hover:shadow-md
                  focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2
                  ${isSelected
                    ? `${mode.selectedBg} ${mode.borderColor} shadow-md -translate-y-0.5`
                    : `${mode.bgColor} ${mode.borderColor} hover:${mode.selectedBg}`
                  }
                `}
                style={isSelected ? { boxShadow: "0 4px 20px rgba(122,92,78,0.12)" } : {}}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#c4684a] flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}

                <span className="text-3xl mb-3 block" aria-hidden="true">{mode.emoji}</span>
                <h3 className="font-semibold text-[#4a3728] text-base mb-1">{mode.label}</h3>
                <p className="text-[#7a5c4e] text-sm leading-relaxed mb-3">{mode.description}</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${mode.toneColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                  {mode.tone}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
