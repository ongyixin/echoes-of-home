"use client";

import { SocialPlatform } from "@/lib/social-types";

interface SocialConnectCardProps {
  platform: SocialPlatform;
  isConnected: boolean;
  username?: string;
  connectedAt?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading?: boolean;
}

const PLATFORM_CONFIG = {
  instagram: {
    name: "Instagram",
    tagline: "Access your photos and reels",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    gradient: "from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    iconBg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  },
  tiktok: {
    name: "TikTok",
    tagline: "Browse your posted videos",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
      </svg>
    ),
    gradient: "from-[#010101] to-[#69C9D0]",
    iconBg: "bg-[#010101]",
  },
};

export default function SocialConnectCard({
  platform,
  isConnected,
  username,
  connectedAt,
  onConnect,
  onDisconnect,
  isLoading,
}: SocialConnectCardProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <div className="rounded-2xl bg-white/80 border border-[#f9d5d3] p-5 flex items-center gap-4">
      {/* Platform icon */}
      <div
        className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-sm ${config.iconBg}`}
      >
        {config.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-[#4a3728] text-sm">{config.name}</h3>
          {isConnected && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              Connected
            </span>
          )}
        </div>
        {isConnected && username ? (
          <p className="text-xs text-[#a07060] truncate">
            @{username}
            {connectedAt && (
              <span className="ml-1.5">
                · since {new Date(connectedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        ) : (
          <p className="text-xs text-[#a07060]">{config.tagline}</p>
        )}
      </div>

      {/* Action button */}
      {isConnected ? (
        <button
          onClick={onDisconnect}
          disabled={isLoading}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
          aria-label={`Disconnect ${config.name}`}
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={isLoading}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #e8927c, #c4684a)" }}
          aria-label={`Connect ${config.name}`}
        >
          {isLoading ? "Connecting…" : "Connect"}
        </button>
      )}
    </div>
  );
}
