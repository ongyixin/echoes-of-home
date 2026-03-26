import { NextRequest, NextResponse } from "next/server";

// Vapi calls this endpoint at the start of each call to retrieve stored
// conversation history. We return an empty messages array since this MVP
// uses in-memory-only storage with no persistent conversation history.
export async function POST(_req: NextRequest) {
  return NextResponse.json({ messages: [] });
}
