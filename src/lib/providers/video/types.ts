export interface VideoToken {
  embedUrl: string;
  expiresAt: Date;
}

export interface VideoProvider {
  /** `userId` is null for a guest watching a free-preview lesson. */
  getSignedPlayback(videoId: string, userId: string | null): Promise<VideoToken>;
  isPreview(lesson: { isFreePreview: boolean }): boolean;
}
