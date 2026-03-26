export type SocialPlatform = "instagram" | "tiktok";

export interface SocialConnection {
  platform: SocialPlatform;
  accessToken: string;
  userId: string;
  username?: string;
  connectedAt: string;
}

export interface SocialMediaItem {
  id: string;
  platform: SocialPlatform;
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: string;
  permalink?: string;
}

export interface FollowedPerson {
  id: string;
  name: string;
  instagram?: string;
  tiktok?: string;
  addedAt: string;
}
