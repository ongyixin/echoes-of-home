import { NextRequest, NextResponse } from "next/server";
import { socialStore } from "@/lib/social-store";
import { SocialPlatform } from "@/lib/social-types";

export async function POST(req: NextRequest) {
  try {
    const { platform } = await req.json();

    if (platform !== "instagram" && platform !== "tiktok") {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    socialStore.removeConnection(platform as SocialPlatform);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
