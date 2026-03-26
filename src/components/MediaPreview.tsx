"use client";

interface MediaPreviewProps {
  file?: File;
  imageUrl?: string;
  isDemo?: boolean;
  demoEmoji?: string;
  demoTitle?: string;
  analysisStatus?: "idle" | "analyzing" | "done" | "error";
}

export default function MediaPreview({
  file,
  imageUrl,
  isDemo,
  demoEmoji = "🌻",
  demoTitle = "Grandma's Garden Visit",
  analysisStatus = "idle",
}: MediaPreviewProps) {
  const src = file ? URL.createObjectURL(file) : (imageUrl ?? null);
  const isVideo = file?.type.startsWith("video/");

  return (
    <div className="card-surface overflow-hidden">
      {/* Media display */}
      <div
        className="relative w-full h-48 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #fddbb4, #f9d5d3, #e8dff5)" }}
      >
        {src && !isVideo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Uploaded memory"
            className="w-full h-full object-cover"
          />
        )}
        {src && isVideo && (
          <video
            src={src}
            className="w-full h-full object-cover"
            muted
            aria-label="Uploaded video memory"
          />
        )}
        {(isDemo || !src) && (
          <div className="text-center">
            <div className="text-6xl mb-2" aria-hidden="true">{demoEmoji}</div>
            <p className="text-[#7a5c4e] text-sm font-medium">{demoTitle}</p>
          </div>
        )}

        {/* Analysis overlay */}
        {analysisStatus === "analyzing" && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <svg className="w-8 h-8 text-[#e8927c] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-[#7a5c4e] font-medium">Analyzing your memory…</p>
          </div>
        )}
        {analysisStatus === "done" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[#5a8a5e] border border-green-100 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Analysis complete
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-[#4a3728] text-sm">
            {file?.name ?? demoTitle}
          </p>
          <p className="text-xs text-[#c4b4ae] mt-0.5">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ${isVideo ? "Video" : "Photo"}`
              : "Demo · Photo · 2.4 MB"
            }
          </p>
        </div>
        {analysisStatus === "done" && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#fddbb4]/60 text-[#c4684a] border border-[#fddbb4]">
            Ready
          </span>
        )}
      </div>
    </div>
  );
}
