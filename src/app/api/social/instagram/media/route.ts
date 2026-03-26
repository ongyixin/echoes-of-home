import { NextRequest, NextResponse } from "next/server";
import { socialStore } from "@/lib/social-store";
import { SocialMediaItem } from "@/lib/social-types";

export async function GET(_req: NextRequest) {
  const connection = socialStore.getConnection("instagram");

  if (!connection) {
    return NextResponse.json(
      { error: "Instagram account not connected" },
      { status: 401 },
    );
  }

  try {
    const fields = "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink";
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&access_token=${connection.accessToken}&limit=30`,
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("Instagram media fetch failed:", errBody);
      if (res.status === 401) {
        socialStore.removeConnection("instagram");
        return NextResponse.json(
          { error: "Instagram token expired. Please reconnect." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch Instagram media" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const items: SocialMediaItem[] = (data.data ?? []).map(
      (item: {
        id: string;
        media_type: string;
        media_url?: string;
        thumbnail_url?: string;
        caption?: string;
        timestamp: string;
        permalink?: string;
      }) => ({
        id: item.id,
        platform: "instagram" as const,
        mediaType:
          item.media_type === "VIDEO" || item.media_type === "REELS"
            ? ("video" as const)
            : ("image" as const),
        mediaUrl: item.media_url ?? item.thumbnail_url ?? "",
        thumbnailUrl: item.thumbnail_url ?? item.media_url,
        caption: item.caption,
        timestamp: item.timestamp,
        permalink: item.permalink,
      }),
    );

    return NextResponse.json({ items, username: connection.username });
  } catch (err) {
    console.error("Instagram media error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Instagram media" },
      { status: 500 },
    );
  }
}
