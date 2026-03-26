import { NextRequest, NextResponse } from "next/server";
import { socialStore } from "@/lib/social-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/connect?error=tiktok_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/connect?error=tiktok_no_code`);
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/tiktok/callback`;

  if (!clientKey || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/connect?error=tiktok_misconfigured`);
  }

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("TikTok token exchange failed:", err);
      return NextResponse.redirect(`${appUrl}/connect?error=tiktok_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const { access_token: accessToken, open_id: userId } = tokenData;

    // Fetch user info
    let username: string | undefined;
    try {
      const userRes = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=display_name,username",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const userData = await userRes.json();
      username =
        userData?.data?.user?.username ??
        userData?.data?.user?.display_name;
    } catch {
      // Username is optional
    }

    socialStore.setConnection({
      platform: "tiktok",
      accessToken,
      userId: String(userId),
      username,
      connectedAt: new Date().toISOString(),
    });

    return NextResponse.redirect(`${appUrl}/connect?tiktok=success`);
  } catch (err) {
    console.error("TikTok OAuth error:", err);
    return NextResponse.redirect(`${appUrl}/connect?error=tiktok_error`);
  }
}
