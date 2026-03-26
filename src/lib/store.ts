import { MediaContext, SessionData } from "./types";

// In-memory store — acceptable for hackathon MVP
const mediaStore = new Map<string, MediaContext>();
const sessionStore = new Map<string, SessionData>();

export const store = {
  // Media context
  setMedia(context: MediaContext): void {
    mediaStore.set(context.mediaId, context);
  },
  getMedia(mediaId: string): MediaContext | undefined {
    return mediaStore.get(mediaId);
  },
  hasMedia(mediaId: string): boolean {
    return mediaStore.has(mediaId);
  },

  // Session data
  setSession(session: SessionData): void {
    sessionStore.set(session.mediaId, session);
  },
  getSession(mediaId: string): SessionData | undefined {
    return sessionStore.get(mediaId);
  },
};
