import type { VideoProvider } from './types';

const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

// Unlisted YouTube links are not signed, so the token never really expires;
// the expiry only keeps the VideoProvider contract uniform with signed vendors.
const EMBED_LIFETIME_MS = 60 * 60 * 1000;

export const youtubeProvider: VideoProvider = {
  isPreview: (lesson) => lesson.isFreePreview,

  getSignedPlayback: async (videoId, _userId, startSeconds = 0) => {
    if (!VIDEO_ID_PATTERN.test(videoId)) throw new Error('Invalid YouTube video id');

    // enablejsapi lets the lesson player report progress through the iframe API.
    const start = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : '';

    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&enablejsapi=1${start}`,
      expiresAt: new Date(Date.now() + EMBED_LIFETIME_MS),
    };
  },
};
