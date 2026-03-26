interface LiveFrameEntry {
  description: string;
  capturedAt: string;
}

const liveFrameStore = new Map<string, LiveFrameEntry>();

export const liveStore = {
  setFrame(sessionId: string, entry: LiveFrameEntry): void {
    liveFrameStore.set(sessionId, entry);
  },

  getFrame(sessionId: string): LiveFrameEntry | undefined {
    return liveFrameStore.get(sessionId);
  },

  clearFrame(sessionId: string): void {
    liveFrameStore.delete(sessionId);
  },
};
