import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(_req: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientKey) {
    return NextResponse.json(
      { error: "TIKTOK_CLIENT_KEY is not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${appUrl}/api/auth/tiktok/callback`;
  const csrfState = uuidv4();

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: "user.info.basic,video.list",
    response_type: "code",
    redirect_uri: redirectUri,
    state: csrfState,
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
