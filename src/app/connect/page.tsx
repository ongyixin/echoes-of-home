"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AccessibilityFooter from "@/components/AccessibilityFooter";
import SocialConnectCard from "@/components/SocialConnectCard";
import SocialMediaGallery from "@/components/SocialMediaGallery";
import PeopleBook from "@/components/PeopleBook";
import { SocialMediaItem, SocialPlatform } from "@/lib/social-types";

interface PlatformStatus {
  connected: boolean;
  username?: string;
  connectedAt?: string;
}

interface ConnectionStatus {
  instagram: PlatformStatus;
  tiktok: PlatformStatus;
}

type ActiveTab = "instagram" | "tiktok" | null;

export default function ConnectPage() {
  return (
    <Suspense fallback={<ConnectPageSkeleton />}>
      <ConnectPageInner />
    </Suspense>
  );
}

function ConnectPageSkeleton() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
        <div className="h-8 w-48 bg-[#f0b8b5]/40 rounded-xl animate-pulse mb-4" />
        <div className="h-4 w-72 bg-[#f0b8b5]/30 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function ConnectPageInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus>({
    instagram: { connected: false },
    tiktok: { connected: false },
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [mediaItems, setMediaItems] = useState<SocialMediaItem[]>([]);
  const [mediaUsername, setMediaUsername] = useState<string | undefined>();
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/social/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Non-critical
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    const ig = searchParams.get("instagram");
    const tk = searchParams.get("tiktok");
    const error = searchParams.get("error");

    if (ig === "success") {
      setNotification({ type: "success", message: "Instagram connected successfully!" });
      setActiveTab("instagram");
    } else if (tk === "success") {
      setNotification({ type: "success", message: "TikTok connected successfully!" });
      setActiveTab("tiktok");
    } else if (error) {
      const messages: Record<string, string> = {
        instagram_denied: "Instagram connection was cancelled.",
        tiktok_denied: "TikTok connection was cancelled.",
        instagram_misconfigured:
          "Instagram is not configured. Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET.",
        tiktok_misconfigured:
          "TikTok is not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.",
        instagram_token_failed: "Instagram authentication failed. Please try again.",
        tiktok_token_failed: "TikTok authentication failed. Please try again.",
      };
      setNotification({
        type: "error",
        message: messages[error] ?? "Connection failed. Please try again.",
      });
    }

    const t = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(t);
  }, [searchParams]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!activeTab) return;
    if (!status[activeTab].connected) return;

    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      setMediaError(null);
      setMediaItems([]);
      setMediaUsername(undefined);

      try {
        const res = await fetch(`/api/social/${activeTab}/media`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load media");
        setMediaItems(data.items ?? []);
        setMediaUsername(data.username);
      } catch (err) {
        setMediaError(err instanceof Error ? err.message : "Failed to load media");
      } finally {
        setIsLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [activeTab, status]);

  const handleConnect = (platform: SocialPlatform) => {
    window.location.href = `/api/auth/${platform}`;
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    try {
      await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      setStatus((prev) => ({ ...prev, [platform]: { connected: false } }));
      if (activeTab === platform) {
        setActiveTab(null);
        setMediaItems([]);
      }
    } catch {
      // Non-critical
    }
  };

  const anyConnected = status.instagram.connected || status.tiktok.connected;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
        {/* Back */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#a07060] hover:text-[#c4684a] transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded"
            aria-label="Go back to home page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#4a3728] mb-2">
          Social Media
        </h1>
        <p className="text-[#7a5c4e] mb-8">
          Two ways to experience social content with voice descriptions.
        </p>

        {/* Notification */}
        {notification && (
          <div
            role="alert"
            className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {notification.message}
          </div>
        )}

        {/* ── Section 1: Friends & Family feed ─────────────────────────── */}
        <section aria-labelledby="friends-heading" className="mb-10">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fddbb4] to-[#f9d5d3] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#c4684a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 id="friends-heading" className="text-base font-semibold text-[#4a3728]">
                Browse friends &amp; family
              </h2>
              <p className="text-sm text-[#7a5c4e] mt-0.5">
                Save their handles here, then use{" "}
                <Link href="/live" className="text-[#c4684a] underline underline-offset-2 hover:text-[#a05030]">
                  Live Screen Description
                </Link>{" "}
                to hear their posts described as you scroll.
              </p>
            </div>
          </div>

          <PeopleBook showLaunchButtons />

          {/* Callout — explain why feed API isn't used */}
          <div className="mt-4 px-4 py-3 rounded-xl bg-[#fef7e4] border border-[#fddbb4] text-xs text-[#7a5c4e]">
            <strong className="text-[#4a3728]">Why screen share instead of a direct feed?</strong>{" "}
            Instagram and TikTok's APIs only expose your own posts, not the posts
            from people you follow. Screen sharing lets you browse your real feed —
            including friends' and family's content — with live descriptions.
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10" aria-hidden="true">
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
          <span className="text-xs text-[#c4b4ae] font-medium">or</span>
          <div className="flex-1 h-px bg-[#f0b8b5]/60" />
        </div>

        {/* ── Section 2: Your own posts ─────────────────────────────────── */}
        <section aria-labelledby="own-posts-heading" className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fddbb4] to-[#f9d5d3] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#c4684a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 id="own-posts-heading" className="text-base font-semibold text-[#4a3728]">
                Your own posts
              </h2>
              <p className="text-sm text-[#7a5c4e] mt-0.5">
                Connect your account to browse your own photos and videos with voice descriptions.
              </p>
            </div>
          </div>

          {isLoadingStatus ? (
            <div className="space-y-3">
              {["instagram", "tiktok"].map((p) => (
                <div key={p} className="h-20 rounded-2xl bg-white/60 border border-[#f9d5d3] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(["instagram", "tiktok"] as SocialPlatform[]).map((platform) => (
                <div key={platform}>
                  <SocialConnectCard
                    platform={platform}
                    isConnected={status[platform].connected}
                    username={status[platform].username}
                    connectedAt={status[platform].connectedAt}
                    onConnect={() => handleConnect(platform)}
                    onDisconnect={() => handleDisconnect(platform)}
                  />
                  {status[platform].connected && (
                    <button
                      onClick={() =>
                        setActiveTab((prev) => (prev === platform ? null : platform))
                      }
                      className="mt-2 w-full py-2 text-xs font-medium text-[#c4684a] hover:text-[#a05030] transition-colors"
                      aria-expanded={activeTab === platform}
                    >
                      {activeTab === platform ? "Hide posts ↑" : "Browse your posts →"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Media gallery */}
          {activeTab && status[activeTab].connected && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#4a3728] mb-1">
                {activeTab === "instagram" ? "Instagram" : "TikTok"} Posts
              </h3>
              <p className="text-xs text-[#a07060] mb-4">Click any post to hear an audio description.</p>
              <SocialMediaGallery
                items={mediaItems}
                platform={activeTab}
                username={mediaUsername}
                isLoading={isLoadingMedia}
                error={mediaError}
              />
            </div>
          )}

          {/* Empty state */}
          {!anyConnected && !isLoadingStatus && (
            <div className="mt-4 rounded-2xl bg-white/50 border border-[#f9d5d3] p-5">
              <ol className="space-y-3">
                {[
                  'Click "Connect" next to Instagram or TikTok.',
                  "Authorize the app — we only read your own posts.",
                  "Browse your grid and tap any photo or video.",
                  "Choose a narration style and start listening.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#7a5c4e]">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fddbb4] text-[#c4684a] text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <p className="text-xs text-[#c4b4ae] text-center">
          We only read your posts — we never publish, modify, or store your content
          beyond the current session.
        </p>
      </div>

      <AccessibilityFooter />
    </div>
  );
}
