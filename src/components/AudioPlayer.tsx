"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AudioStyle } from "@/lib/types";

interface AudioPlayerProps {
  title: string;
  subtitle?: string;
  style: AudioStyle;
  onStyleChange?: (style: AudioStyle) => void;
  isLoading?: boolean;
  transcript?: string;
  thumbnailEmoji?: string;
}

const STYLE_META: Record<AudioStyle, { label: string; tone: string; color: string; bgColor: string }> = {
  factual: { label: "Audio Diary",   tone: "Calm & Clear",  color: "#5a8fa8", bgColor: "#d4e8f0" },
  warm:    { label: "Warm Recap",    tone: "Gentle",        color: "#c4684a", bgColor: "#fddbb4" },
  podcast: { label: "Mini Podcast",  tone: "Lively",        color: "#9370b8", bgColor: "#e8dff5" },
};

const WAVEFORM_HEIGHTS = [18, 32, 48, 38, 56, 44, 62, 50, 40, 54, 36, 46, 60, 42, 52, 34, 58, 44, 28, 50, 38, 64, 46, 36, 54, 42, 30, 56, 48, 38];

export default function AudioPlayer({
  title,
  subtitle,
  style,
  onStyleChange,
  isLoading,
  transcript,
  thumbnailEmoji = "🌿",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const lastStyleRef = useRef<AudioStyle>(style);
  const meta = STYLE_META[style];

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const clearBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Discard cached audio when style changes
  useEffect(() => {
    if (style !== lastStyleRef.current) {
      stopAudio();
      clearBlob();
      setProgress(0);
      lastStyleRef.current = style;
    }
  }, [style, stopAudio, clearBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      clearBlob();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playBlobUrl = useCallback((url: string, startFraction = 0) => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(1);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    if (startFraction > 0 && !isNaN(audio.duration)) {
      audio.currentTime = startFraction * audio.duration;
    }

    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      audioRef.current = null;
    });
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!transcript) return;

    // Pause currently playing audio
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Resume paused audio
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      return;
    }

    // Use cached blob if available
    if (blobUrlRef.current) {
      playBlobUrl(blobUrlRef.current, progress < 1 ? progress : 0);
      return;
    }

    // Fetch from Cartesia
    setIsFetching(true);
    setProgress(0);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript, style }),
      });

      if (!res.ok) throw new Error("TTS fetch failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      playBlobUrl(url);
    } catch {
      setIsPlaying(false);
    } finally {
      setIsFetching(false);
    }
  }, [transcript, isPlaying, progress, style, playBlobUrl]);

  const handleRewind = useCallback(() => {
    if (audioRef.current && audioRef.current.duration > 0) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - audioRef.current.duration * 0.1);
    } else {
      setProgress((p) => Math.max(0, p - 0.1));
    }
  }, []);

  const handleForward = useCallback(() => {
    if (audioRef.current && audioRef.current.duration > 0) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + audioRef.current.duration * 0.1,
      );
    } else {
      setProgress((p) => Math.min(1, p + 0.1));
    }
  }, []);

  const formatTime = (frac: number) => {
    if (!audioRef.current?.duration) return "0:00";
    const s = Math.floor(frac * audioRef.current.duration);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const formatTotal = () => {
    if (!audioRef.current?.duration) return "--:--";
    const s = Math.round(audioRef.current.duration);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newProgress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration > 0) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration;
    }
  }, []);

  return (
    <section
      className="px-6 py-10"
      aria-labelledby="player-heading"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[#e8927c] tracking-widest uppercase mb-2">
            Your Memory
          </p>
          <h2
            id="player-heading"
            className="font-serif text-3xl md:text-4xl font-semibold text-[#4a3728]"
          >
            Listen
          </h2>
        </div>

        {/* Player card */}
        <div
          className="card-surface p-8"
          style={{ background: "linear-gradient(145deg, #ffffff 0%, #fef9f5 100%)" }}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl"
              style={{ background: `linear-gradient(135deg, ${meta.bgColor}80, ${meta.bgColor}40)` }}
              aria-hidden="true"
            >
              {thumbnailEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-xl font-semibold text-[#4a3728] truncate">{title}</h3>
              {subtitle && <p className="text-[#a07060] text-sm mt-0.5">{subtitle}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Style badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${meta.bgColor}60`, color: meta.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                  {meta.label}
                </span>
                {/* Tone badge */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#fef7e4] text-[#a07060] border border-[#f9d5d3]">
                  {meta.tone}
                </span>
              </div>
            </div>
          </div>

          {/* Waveform visualization */}
          <div
            className="relative h-20 flex items-center gap-[3px] mb-2 cursor-pointer rounded-xl overflow-hidden"
            style={{ background: "linear-gradient(to right, #fef7e4, #fddbb4/20, #fef7e4)" }}
            onClick={handleScrub}
            role="slider"
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setProgress((p) => Math.min(1, p + 0.05));
              if (e.key === "ArrowLeft") setProgress((p) => Math.max(0, p - 0.05));
            }}
          >
            {WAVEFORM_HEIGHTS.map((h, i) => {
              const pos = i / WAVEFORM_HEIGHTS.length;
              const isPast = pos < progress;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${isPlaying ? "waveform-bar" : ""}`}
                  style={{
                    height: h,
                    minWidth: 4,
                    background: isPast
                      ? meta.color
                      : `${meta.color}30`,
                    animationDelay: isPlaying ? `${i * 0.04}s` : "0s",
                  }}
                  aria-hidden="true"
                />
              );
            })}
            {/* Progress cursor */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow-md pointer-events-none transition-all"
              style={{ left: `calc(${progress * 100}% - 6px)`, borderColor: meta.color }}
              aria-hidden="true"
            />
          </div>

          {/* Time */}
          <div className="flex justify-between text-xs text-[#c4b4ae] mb-6 select-none">
            <span aria-label={`Current time: ${formatTime(progress)}`}>{formatTime(progress)}</span>
            <span aria-label={`Total duration: ${formatTotal()}`}>{formatTotal()}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Rewind */}
            <button
              onClick={handleRewind}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#a07060] hover:text-[#c4684a] hover:bg-[#fddbb4]/40 transition-all focus-visible:ring-2 focus-visible:ring-[#e8927c]"
              aria-label="Rewind"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={!transcript || isFetching}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200
                hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2
                ${isPlaying ? "animate-glow-pulse" : "hover:shadow-lg"}
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
              style={{
                background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                boxShadow: isPlaying ? `0 0 24px ${meta.color}50` : `0 4px 16px ${meta.color}40`,
              }}
              aria-label={isPlaying ? "Pause narration" : "Play narration"}
            >
              {(isLoading || isFetching) ? (
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </button>

            {/* Forward */}
            <button
              onClick={handleForward}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#a07060] hover:text-[#c4684a] hover:bg-[#fddbb4]/40 transition-all focus-visible:ring-2 focus-visible:ring-[#e8927c]"
              aria-label="Forward"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6z" />
              </svg>
            </button>
          </div>

          {/* Style switcher */}
          {onStyleChange && (
            <div className="border-t border-[#f9d5d3]/60 pt-4">
              <p className="text-xs text-center text-[#c4b4ae] mb-3 uppercase tracking-wide font-medium">
                Switch style
              </p>
              <div className="flex gap-2 justify-center" role="group" aria-label="Change audio style">
                {(["factual", "warm", "podcast"] as AudioStyle[]).map((s) => {
                  const m = STYLE_META[s];
                  return (
                    <button
                      key={s}
                      onClick={() => onStyleChange(s)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border focus-visible:ring-2 focus-visible:ring-[#e8927c]
                        ${style === s
                          ? "text-white border-transparent shadow-sm"
                          : "border-[#f0b8b5] text-[#a07060] hover:border-[#e8927c] bg-white"
                        }
                      `}
                      style={style === s ? { background: m.color, borderColor: m.color } : {}}
                      aria-pressed={style === s}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transcript toggle */}
          {transcript && (
            <div className="border-t border-[#f9d5d3]/60 mt-4 pt-4">
              <button
                onClick={() => setShowTranscript((s) => !s)}
                className="flex items-center gap-2 text-sm text-[#a07060] hover:text-[#c4684a] transition-colors mx-auto focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded"
                aria-expanded={showTranscript}
                aria-controls="transcript-content"
              >
                <svg className={`w-4 h-4 transition-transform ${showTranscript ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showTranscript ? "Hide transcript" : "Show transcript"}
              </button>
              {showTranscript && (
                <div
                  id="transcript-content"
                  className="mt-4 p-4 rounded-xl bg-[#fef7e4] text-sm text-[#7a5c4e] leading-relaxed animate-fade-in"
                >
                  {transcript}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
