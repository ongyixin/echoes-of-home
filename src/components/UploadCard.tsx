"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UploadCardProps {
  onFileSelected: (file: File) => void;
  onDemoSelected: () => void;
  isUploading?: boolean;
  isReady?: boolean;
  uploadedFile?: File | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE_MB = 20;

export default function UploadCard({ onFileSelected, onDemoSelected, isUploading, isReady, uploadedFile }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uploadedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const validateAndSelect = (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, WebP, GIF, or MP4/MOV/WebM video.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <section id="upload" className="px-6 py-16" aria-labelledby="upload-heading">
      <div className="max-w-2xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[#e8927c] tracking-widest uppercase mb-2">
            Step 1
          </p>
          <h2
            id="upload-heading"
            className="font-serif text-3xl md:text-4xl font-semibold text-[#4a3728] mb-3"
          >
            Share a Memory
          </h2>
          <p className="text-[#7a5c4e] text-lg">
            Upload a photo or short video and we'll turn it into a listening experience.
          </p>
        </div>

        {/* Drop zone — success state */}
        {isReady && previewUrl ? (
          <div
            className="relative rounded-3xl border-2 border-[#86c98a] bg-[#f0faf0] p-6 text-center animate-fade-in"
            style={{ boxShadow: "0 2px 16px rgba(134, 201, 138, 0.18)" }}
            aria-live="polite"
          >
            <div className="flex items-center gap-5">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-[#c3e6c5] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Uploaded memory" className="w-full h-full object-cover" />
              </div>
              {/* Success text */}
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-[#3a9e3f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <p className="font-semibold text-[#2d6e31] text-base">Memory captured!</p>
                </div>
                <p className="text-sm text-[#4a7c4e] truncate">{uploadedFile?.name}</p>
                <p className="text-xs text-[#7aaa7e] mt-2">Choose your listening style below, then tap Begin Listening.</p>
              </div>
              {/* Re-upload button */}
              <button
                onClick={() => inputRef.current?.click()}
                className="flex-shrink-0 text-xs text-[#7aaa7e] hover:text-[#3a9e3f] underline underline-offset-2 transition-colors"
                aria-label="Choose a different file"
              >
                Change
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={handleInputChange}
              aria-label="Choose a photo or video file"
            />
          </div>
        ) : (
          /* Drop zone — default / uploading */
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload photo or video. Click or drag and drop."
            className={`
              relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300
              p-10 md:p-14 text-center
              ${isDragging
                ? "border-[#e8927c] bg-[#fddbb4]/30 scale-[1.01]"
                : "border-[#f0b8b5] bg-white/60 hover:border-[#e8927c] hover:bg-[#fddbb4]/10"
              }
              ${isUploading ? "pointer-events-none opacity-70" : ""}
            `}
            style={{ boxShadow: isDragging ? "0 0 24px rgba(232, 146, 124, 0.25)" : "0 2px 16px rgba(122, 92, 78, 0.08)" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={handleInputChange}
              aria-label="Choose a photo or video file"
            />

            {/* Icon */}
            <div className={`
              w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragging ? "bg-[#fddbb4] scale-110" : "bg-[#fef7e4] group-hover:bg-[#fddbb4]/60"}
            `}>
              {isUploading ? (
                <svg className="w-9 h-9 text-[#e8927c] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-9 h-9 text-[#c4684a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              )}
            </div>

            <p className="text-[#4a3728] font-semibold text-xl mb-2">
              {isUploading ? "Uploading…" : isDragging ? "Drop it here" : "Drop your photo or video here"}
            </p>
            <p className="text-[#a07060] text-sm mb-6">
              or <span className="text-[#c4684a] font-medium underline underline-offset-2">browse your files</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#c4b4ae]">
              {["JPG", "PNG", "WebP", "GIF", "MP4", "MOV"].map((fmt) => (
                <span key={fmt} className="px-2 py-1 rounded-full bg-[#fef7e4] border border-[#f0b8b5]">
                  {fmt}
                </span>
              ))}
              <span className="text-[#d4a5a5]">· Max {MAX_SIZE_MB}MB</span>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-6" aria-hidden="true">
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
          <span className="text-sm text-[#c4b4ae] font-medium">or</span>
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
        </div>

        {/* Demo option */}
        <button
          onClick={onDemoSelected}
          className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/70 border border-[#f9d5d3] hover:border-[#e8927c] hover:bg-[#fddbb4]/10 transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-[#e8927c]"
          aria-label="Try a demo with a sample family memory"
        >
          <div className="w-14 h-14 rounded-xl bg-[#fef7e4] border border-[#f9d5d3] flex-shrink-0 overflow-hidden flex items-center justify-center">
            <span className="text-2xl" aria-hidden="true">🌻</span>
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-[#4a3728] text-sm group-hover:text-[#c4684a] transition-colors">
              Try with a sample memory
            </p>
            <p className="text-xs text-[#a07060] mt-0.5">
              "Grandma's Garden Visit" · Photo · Warm Recap
            </p>
          </div>
          <svg className="w-5 h-5 text-[#d4a5a5] group-hover:text-[#e8927c] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
