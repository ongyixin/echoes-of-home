"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import ModeSelector from "@/components/ModeSelector";
import MemoryFeed from "@/components/MemoryFeed";
import Navbar from "@/components/Navbar";
import AccessibilityFooter from "@/components/AccessibilityFooter";
import { AudioStyle, MemoryCard } from "@/lib/types";

type UploadState = "idle" | "uploading" | "analyzing" | "ready" | "error";

export default function HomePage() {
  const router = useRouter();
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedStyle, setSelectedStyle] = useState<AudioStyle>("warm");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const beginListeningRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (uploadState === "ready") {
      beginListeningRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [uploadState]);

  const handleFileSelected = async (file: File) => {
    setUploadedFile(file);
    setErrorMsg(null);
    setUploadState("uploading");

    try {
      // Upload the file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { mediaId: id } = await uploadRes.json();

      setUploadState("analyzing");

      // Trigger analysis
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: id }),
      });
      if (!analyzeRes.ok) {
        const errBody = await analyzeRes.json().catch(() => ({}));
        throw new Error(errBody.error ?? "Analysis failed");
      }

      setMediaId(id);
      setUploadState("ready");
    } catch (err) {
      console.error(err);
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleDemoSelected = () => {
    // Navigate to demo session
    router.push("/session/demo?style=warm");
  };

  const handleOpenMemory = (memory: MemoryCard) => {
    router.push(`/session/demo?style=${memory.style}&title=${encodeURIComponent(memory.title)}`);
  };

  const handleStartSession = () => {
    if (!mediaId) return;
    router.push(`/session/${mediaId}?style=${selectedStyle}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <Hero onUploadClick={scrollToUpload} onDemoClick={handleDemoSelected} />

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#f9d5d3] to-transparent" aria-hidden="true" />
      </div>

      {/* Upload section */}
      <div ref={uploadSectionRef} id="upload-section">
        <UploadCard
          onFileSelected={handleFileSelected}
          onDemoSelected={handleDemoSelected}
          isUploading={uploadState === "uploading" || uploadState === "analyzing"}
          isReady={uploadState === "ready"}
          uploadedFile={uploadedFile}
        />
      </div>

      {/* Analysis status feedback */}
      {uploadState === "analyzing" && (
        <div className="max-w-2xl mx-auto px-6 -mt-4 mb-2">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#fddbb4]/40 border border-[#fddbb4] text-sm text-[#7a5c4e] animate-fade-in">
            <svg className="w-5 h-5 text-[#e8927c] animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Analyzing your memory with Gemini… This may take a moment.</span>
          </div>
        </div>
      )}

      {uploadState === "error" && errorMsg && (
        <div className="max-w-2xl mx-auto px-6 -mt-4 mb-2">
          <div className="px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in" role="alert">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Mode selector — shown once file is ready */}
      {(uploadState === "ready" || uploadState === "idle") && (
        <>
          <ModeSelector selected={selectedStyle} onChange={setSelectedStyle} />

          {uploadState === "ready" && (
            <div ref={beginListeningRef} className="max-w-2xl mx-auto px-6 pb-6">
              <button
                onClick={handleStartSession}
                className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2"
                style={{ background: "linear-gradient(135deg, #e8927c, #c4684a)" }}
                aria-label="Begin listening to your memory"
              >
                Begin Listening →
              </button>
            </div>
          )}
        </>
      )}

      {/* Mode selector always shown in idle for demo purposes */}
      {uploadState === "idle" && (
        <div className="max-w-2xl mx-auto px-6 pb-6">
          <button
            onClick={handleDemoSelected}
            className="w-full py-4 rounded-2xl font-semibold text-[#7a5c4e] text-base border-2 border-[#f9d5d3] hover:border-[#e8927c] hover:text-[#c4684a] hover:bg-[#fddbb4]/10 transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2"
            aria-label="Try a demo session with sample content"
          >
            Try with Demo Content →
          </button>
        </div>
      )}

      {/* New input modes */}
      <div className="max-w-2xl mx-auto px-6 pb-8">
        <div className="flex items-center gap-4 mb-5" aria-hidden="true">
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
          <span className="text-sm text-[#c4b4ae] font-medium">or try</span>
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Screen Share card */}
          <a
            href="/live"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/70 border border-[#f9d5d3] hover:border-[#e8927c] hover:bg-[#fddbb4]/10 transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-[#e8927c]"
            aria-label="Browse friends and family posts with live voice descriptions"
          >
            <div className="w-14 h-14 rounded-xl bg-[#fef7e4] border border-[#f9d5d3] flex-shrink-0 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#c4684a]"
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
            <div className="text-left flex-1">
              <p className="font-semibold text-[#4a3728] text-sm group-hover:text-[#c4684a] transition-colors">
                Browse Friends &amp; Family
              </p>
              <p className="text-xs text-[#a07060] mt-0.5">
                Scroll their feed — every post described live
              </p>
            </div>
            <svg
              className="w-5 h-5 text-[#d4a5a5] group-hover:text-[#e8927c] group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Social connect card */}
          <a
            href="/connect"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/70 border border-[#f9d5d3] hover:border-[#e8927c] hover:bg-[#fddbb4]/10 transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-[#e8927c]"
            aria-label="Connect Instagram or TikTok to browse your own posts"
          >
            <div className="w-14 h-14 rounded-xl bg-[#fef7e4] border border-[#f9d5d3] flex-shrink-0 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#c4684a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-[#4a3728] text-sm group-hover:text-[#c4684a] transition-colors">
                Social Media
              </p>
              <p className="text-xs text-[#a07060] mt-0.5">
                Your posts + browse friends &amp; family
              </p>
            </div>
            <svg
              className="w-5 h-5 text-[#d4a5a5] group-hover:text-[#e8927c] group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#f9d5d3] to-transparent" aria-hidden="true" />
      </div>

      {/* Memory feed */}
      <div id="memories">
        <MemoryFeed onOpenMemory={handleOpenMemory} />
      </div>

      <AccessibilityFooter />
    </div>
  );
}
