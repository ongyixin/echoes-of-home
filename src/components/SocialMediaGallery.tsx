"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SocialMediaItem, SocialPlatform } from "@/lib/social-types";
import { AudioStyle } from "@/lib/types";

interface SocialMediaGalleryProps {
  items: SocialMediaItem[];
  platform: SocialPlatform;
  username?: string;
  isLoading?: boolean;
  error?: string | null;
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
};

export default function SocialMediaGallery({
  items,
  platform,
  username,
  isLoading,
  error,
}: SocialMediaGalleryProps) {
  const router = useRouter();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const handleItemClick = async (item: SocialMediaItem) => {
    if (analyzingId) return;

    // For videos (TikTok), we analyze the thumbnail/cover image
    const urlToAnalyze = item.thumbnailUrl ?? item.mediaUrl;
    if (!urlToAnalyze) return;

    setAnalyzingId(item.id);
    setAnalyzeError(null);

    try {
      const res = await fetch("/api/social/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: urlToAnalyze,
          platform: item.platform,
          caption: item.caption,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Analysis failed");
      }

      const { mediaId } = await res.json();
      router.push(`/session/${mediaId}?style=warm`);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Failed to analyze this post");
    } finally {
      setAnalyzingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#a07060]">
          <svg className="w-5 h-5 animate-spin text-[#e8927c]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading your {PLATFORM_LABELS[platform]} posts…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="px-4 py-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700"
      >
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-[#a07060]">
          No posts found in your {PLATFORM_LABELS[platform]} account.
        </p>
      </div>
    );
  }

  return (
    <div>
      {username && (
        <p className="text-sm text-[#a07060] mb-4">
          {items.length} post{items.length !== 1 ? "s" : ""} from{" "}
          <span className="font-medium text-[#4a3728]">@{username}</span>
        </p>
      )}

      {analyzeError && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
        >
          {analyzeError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2" role="list" aria-label={`${PLATFORM_LABELS[platform]} posts`}>
        {items.map((item) => (
          <button
            key={item.id}
            role="listitem"
            onClick={() => handleItemClick(item)}
            disabled={!!analyzingId}
            aria-label={`${item.mediaType === "video" ? "Video" : "Photo"}: ${item.caption ?? "no caption"}. Click to analyze and listen.`}
            className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-[#f9d5d3] hover:border-[#e8927c] transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#e8927c] disabled:opacity-60 disabled:cursor-wait"
          >
            {/* Thumbnail */}
            {item.thumbnailUrl || (item.mediaType === "image" && item.mediaUrl) ? (
              <img
                src={item.thumbnailUrl ?? item.mediaUrl}
                alt={item.caption ?? ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#fef7e4]">
                <svg
                  className="w-8 h-8 text-[#c4684a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
            )}

            {/* Video badge */}
            {item.mediaType === "video" && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
            )}

            {/* Loading overlay for this item */}
            {analyzingId === item.id && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#e8927c] animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#4a3728]/0 group-hover:bg-[#4a3728]/20 transition-all duration-200 flex items-end">
              {item.caption && (
                <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-xs line-clamp-2 leading-snug">{item.caption}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
