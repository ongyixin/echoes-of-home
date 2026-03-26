import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!appId) {
    return NextResponse.json(
      { error: "INSTAGRAM_APP_ID is not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${appUrl}/api/auth/instagram/callback`;
  const scope = "instagram_business_basic,instagram_business_manage_messages";

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope,
    response_type: "code",
  });

  const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
