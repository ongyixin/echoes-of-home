import { NextRequest, NextResponse } from "next/server";
import { socialStore } from "@/lib/social-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/connect?error=instagram_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/connect?error=instagram_no_code`);
  }

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = `${appUrl}/api/auth/instagram/callback`;

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${appUrl}/connect?error=instagram_misconfigured`);
  }

  try {
    // Exchange code for short-lived token
    const tokenBody = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Instagram token exchange failed:", err);
      return NextResponse.redirect(`${appUrl}/connect?error=instagram_token_failed`);
    }

    const { access_token: shortToken, user_id: userId } = await tokenRes.json();

    // Exchange for long-lived token
    const longTokenParams = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: appSecret,
      access_token: shortToken,
    });

    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?${longTokenParams.toString()}`,
    );

    const longTokenData = await longTokenRes.json();
    const accessToken = longTokenData.access_token ?? shortToken;

    // Fetch username
    let username: string | undefined;
    try {
      const meRes = await fetch(
        `https://graph.instagram.com/me?fields=username&access_token=${accessToken}`,
      );
      const me = await meRes.json();
      username = me.username;
    } catch {
      // Username is optional
    }

    socialStore.setConnection({
      platform: "instagram",
      accessToken,
      userId: String(userId),
      username,
      connectedAt: new Date().toISOString(),
    });

    return NextResponse.redirect(`${appUrl}/connect?instagram=success`);
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    return NextResponse.redirect(`${appUrl}/connect?error=instagram_error`);
  }
}
