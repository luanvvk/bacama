export interface VideoToken {
  embedUrl: string;
  expiresAt: Date;
}

export interface VideoProvider {
  getSignedPlayback(videoId: string, userId: string): Promise<VideoToken>;
  isPreview(videoId: string): boolean;
}
