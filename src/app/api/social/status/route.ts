import { NextRequest, NextResponse } from "next/server";
import { socialStore } from "@/lib/social-store";

export async function GET(_req: NextRequest) {
  const instagram = socialStore.getConnection("instagram");
  const tiktok = socialStore.getConnection("tiktok");

  return NextResponse.json({
    instagram: instagram
      ? {
          connected: true,
          username: instagram.username,
          connectedAt: instagram.connectedAt,
        }
      : { connected: false },
    tiktok: tiktok
      ? {
          connected: true,
          username: tiktok.username,
          connectedAt: tiktok.connectedAt,
        }
      : { connected: false },
  });
}
