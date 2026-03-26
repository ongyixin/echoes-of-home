import { NextRequest, NextResponse } from "next/server";
import { socialStore } from "@/lib/social-store";
import { SocialMediaItem } from "@/lib/social-types";

export async function GET(_req: NextRequest) {
  const connection = socialStore.getConnection("tiktok");

  if (!connection) {
    return NextResponse.json(
      { error: "TikTok account not connected" },
      { status: 401 },
    );
  }

  try {
    const fields = "id,title,cover_image_url,video_description,create_time,share_url";
    const res = await fetch(
      `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max_count: 20 }),
      },
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("TikTok video list failed:", errBody);
      if (res.status === 401) {
        socialStore.removeConnection("tiktok");
        return NextResponse.json(
          { error: "TikTok token expired. Please reconnect." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch TikTok videos" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const videos: Array<{
      id: string;
      cover_image_url?: string;
      title?: string;
      video_description?: string;
      create_time?: number;
      share_url?: string;
    }> = data?.data?.videos ?? [];

    const items: SocialMediaItem[] = videos.map((video) => ({
      id: video.id,
      platform: "tiktok" as const,
      mediaType: "video" as const,
      mediaUrl: video.share_url ?? "",
      thumbnailUrl: video.cover_image_url,
      caption: video.title ?? video.video_description,
      timestamp: video.create_time
        ? new Date(video.create_time * 1000).toISOString()
        : new Date().toISOString(),
      permalink: video.share_url,
    }));

    return NextResponse.json({ items, username: connection.username });
  } catch (err) {
    console.error("TikTok media error:", err);
    return NextResponse.json(
      { error: "Failed to fetch TikTok videos" },
      { status: 500 },
    );
  }
}
