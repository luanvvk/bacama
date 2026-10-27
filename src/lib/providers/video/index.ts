import type { VideoProvider } from './types';
import { youtubeProvider } from './youtube';

export const getVideoProvider = (): VideoProvider => youtubeProvider;
