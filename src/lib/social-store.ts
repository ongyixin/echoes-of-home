import { SocialConnection, SocialPlatform } from "./social-types";

const connectionStore = new Map<SocialPlatform, SocialConnection>();

export const socialStore = {
  setConnection(connection: SocialConnection): void {
    connectionStore.set(connection.platform, connection);
  },

  getConnection(platform: SocialPlatform): SocialConnection | undefined {
    return connectionStore.get(platform);
  },

  hasConnection(platform: SocialPlatform): boolean {
    return connectionStore.has(platform);
  },

  removeConnection(platform: SocialPlatform): void {
    connectionStore.delete(platform);
  },

  getAllConnections(): SocialConnection[] {
    return Array.from(connectionStore.values());
  },
};
