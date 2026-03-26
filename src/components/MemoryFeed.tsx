"use client";

import { AudioStyle, MemoryCard } from "@/lib/types";

const MOCK_MEMORIES: MemoryCard[] = [
  {
    id: "1",
    title: "Sophia's Birthday Dinner",
    style: "warm",
    styleLabel: "Warm Recap",
    duration: "2:14",
    thumbnail: "🎂",
    date: "March 18, 2026",
    emotionalTone: "Joyful",
    transcript:
      "The table was set with her favorite flowers — yellow sunflowers, fresh and bright. Sophia sat at the head, her smile wide as everyone gathered around. There were seven people in the frame, all looking toward her.",
  },
  {
    id: "2",
    title: "Sunday at the Park",
    style: "podcast",
    styleLabel: "Mini Podcast",
    duration: "3:02",
    thumbnail: "🌳",
    date: "March 9, 2026",
    emotionalTone: "Peaceful",
    transcript:
      "Welcome to this week's memory segment. Today we're stepping into a golden Sunday afternoon — the kind where everything moves just a little slower. Two children race ahead on a gravel path…",
  },
  {
    id: "3",
    title: "Grandma's Garden Visit",
    style: "warm",
    styleLabel: "Warm Recap",
    duration: "1:48",
    thumbnail: "🌻",
    date: "February 28, 2026",
    emotionalTone: "Tender",
    transcript:
      "She's kneeling beside a row of lavender, her hands gentle as ever. The late afternoon light falls across her shoulders. It looks like early spring — the rosemary is just starting to bloom.",
  },
  {
    id: "4",
    title: "Cousins at the Beach",
    style: "factual",
    styleLabel: "Audio Diary",
    duration: "2:38",
    thumbnail: "🏖️",
    date: "February 14, 2026",
    emotionalTone: "Lively",
    transcript:
      "Scene: an outdoor beach setting during late afternoon, golden hour lighting. Four children are visible, ages approximately 6 to 12. Two are running toward the water. One is building something in the sand.",
  },
];

const STYLE_COLORS: Record<AudioStyle, { bg: string; text: string; dot: string }> = {
  factual: { bg: "bg-[#d4e8f0]/40",  text: "text-[#5a8fa8]", dot: "bg-[#5a8fa8]" },
  warm:    { bg: "bg-[#fddbb4]/40",  text: "text-[#c4684a]", dot: "bg-[#c4684a]" },
  podcast: { bg: "bg-[#e8dff5]/40",  text: "text-[#9370b8]", dot: "bg-[#9370b8]" },
};

const TONE_COLORS: Record<string, string> = {
  Joyful:   "text-[#c4684a]",
  Peaceful: "text-[#5a8fa8]",
  Tender:   "text-[#9370b8]",
  Lively:   "text-[#7a9a5c]",
};

interface MemoryFeedProps {
  onOpenMemory?: (memory: MemoryCard) => void;
}

export default function MemoryFeed({ onOpenMemory }: MemoryFeedProps) {
  return (
    <section className="px-6 py-16" aria-labelledby="memories-heading">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-[#e8927c] tracking-widest uppercase mb-1">
              Your Archive
            </p>
            <h2
              id="memories-heading"
              className="font-serif text-3xl md:text-4xl font-semibold text-[#4a3728]"
            >
              Recent Memories
            </h2>
          </div>
          <button
            className="text-sm text-[#a07060] hover:text-[#c4684a] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded"
            aria-label="View all memories"
          >
            View all
          </button>
        </div>

        <div className="space-y-4" role="list">
          {MOCK_MEMORIES.map((memory, i) => {
            const styleColor = STYLE_COLORS[memory.style];
            const toneColor = TONE_COLORS[memory.emotionalTone] ?? "text-[#a07060]";
            return (
              <article
                key={memory.id}
                role="listitem"
                className="card-surface p-5 flex gap-4 group cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 animate-fade-up focus-within:ring-2 focus-within:ring-[#e8927c]"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => onOpenMemory?.(memory)}
              >
                {/* Thumbnail */}
                <div
                  className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl"
                  style={{ background: "linear-gradient(135deg, #fddbb4, #f9d5d3)" }}
                  aria-hidden="true"
                >
                  {memory.thumbnail}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#4a3728] text-sm leading-tight group-hover:text-[#c4684a] transition-colors truncate">
                      {memory.title}
                    </h3>
                    <span className="text-xs text-[#c4b4ae] flex-shrink-0">{memory.duration}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styleColor.bg} ${styleColor.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styleColor.dot}`} aria-hidden="true" />
                      {memory.styleLabel}
                    </span>
                    <span className={`text-xs font-medium ${toneColor}`}>
                      {memory.emotionalTone}
                    </span>
                  </div>

                  <p className="text-xs text-[#a07060] leading-relaxed line-clamp-2">
                    {memory.transcript}
                  </p>

                  <p className="text-xs text-[#c4b4ae] mt-1.5">{memory.date}</p>
                </div>

                {/* Play button */}
                <button
                  className="self-center w-10 h-10 rounded-full bg-[#fef7e4] border border-[#f9d5d3] flex items-center justify-center flex-shrink-0 group-hover:bg-[#fddbb4] group-hover:border-[#e8927c] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#e8927c]"
                  aria-label={`Play ${memory.title}`}
                  onClick={(e) => { e.stopPropagation(); onOpenMemory?.(memory); }}
                >
                  <svg className="w-4 h-4 ml-0.5 text-[#c4684a]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </button>
              </article>
            );
          })}
        </div>

        {/* Empty state hint */}
        <p className="text-center text-xs text-[#d4b4ae] mt-8">
          Your memories are stored privately and never shared.
        </p>
      </div>
    </section>
  );
}
