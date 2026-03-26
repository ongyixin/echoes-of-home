"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface FrameCapture {
  base64: string;
  mimeType: string;
  capturedAt: string;
}

interface ScreenSharePanelProps {
  onFrame: (frame: FrameCapture) => void;
  onStop?: () => void;
  captureIntervalMs?: number;
  isCapturing: boolean;
  onStartCapture: () => void;
  onStopCapture: () => void;
}

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;
const JPEG_QUALITY = 0.7;

export default function ScreenSharePanel({
  onFrame,
  onStop,
  captureIntervalMs = 3000,
  isCapturing,
  onStartCapture,
  onStopCapture,
}: ScreenSharePanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    // Scale down to max dimensions while preserving aspect ratio
    const scale = Math.min(1, MAX_WIDTH / vw, MAX_HEIGHT / vh);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = dataUrl.split(",")[1];

    setFrameCount((n) => n + 1);
    onFrame({ base64, mimeType: "image/jpeg", capturedAt: new Date().toISOString() });
  }, [onFrame]);

  const startScreenShare = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 5, max: 10 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Listen for the user stopping sharing via browser UI
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenShare();
      });

      setIsSharing(true);
      onStartCapture();
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Screen sharing permission denied. Please allow screen access and try again.");
      } else {
        setError("Could not start screen sharing. Please try again.");
      }
    }
  };

  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSharing(false);
    setFrameCount(0);
    onStopCapture();
    onStop?.();
  }, [onStop, onStopCapture]);

  // Start/stop frame capture interval when isCapturing changes
  useEffect(() => {
    if (isCapturing && isSharing) {
      intervalRef.current = setInterval(captureFrame, captureIntervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCapturing, isSharing, captureIntervalMs, captureFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Hidden capture elements */}
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {!isSharing ? (
        <div className="rounded-3xl border-2 border-dashed border-[#f0b8b5] bg-white/60 p-10 text-center hover:border-[#e8927c] hover:bg-[#fddbb4]/10 transition-all duration-300">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#fef7e4] flex items-center justify-center">
            <svg
              className="w-9 h-9 text-[#c4684a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
              />
            </svg>
          </div>

          <h3 className="text-[#4a3728] font-semibold text-xl mb-2">
            Share your screen
          </h3>
          <p className="text-[#a07060] text-sm mb-6 max-w-sm mx-auto">
            Open Instagram, TikTok, or any social app and share your screen.
            We'll describe what you're seeing as you scroll.
          </p>

          <button
            onClick={startScreenShare}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2"
            style={{ background: "linear-gradient(135deg, #e8927c, #c4684a)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
            Start Screen Share
          </button>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600 font-medium">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 border border-[#f9d5d3] p-5 space-y-4">
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isCapturing ? "bg-[#e8927c] animate-pulse" : "bg-gray-300"}`}
              />
              <span className="text-sm font-medium text-[#4a3728]">
                {isCapturing ? "Capturing frames…" : "Screen shared — paused"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#a07060]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {frameCount} frame{frameCount !== 1 ? "s" : ""} captured
            </div>
          </div>

          {/* Preview thumbnail */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video max-h-40">
            <video
              className="w-full h-full object-contain"
              muted
              playsInline
              ref={(el) => {
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs">
              LIVE
            </div>
          </div>

          <button
            onClick={stopScreenShare}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Stop Screen Share
          </button>
        </div>
      )}
    </div>
  );
}
