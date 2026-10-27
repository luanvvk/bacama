'use client';

import { useEffect, useRef } from 'react';

const SAVE_INTERVAL_MS = 15_000;
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;

interface YouTubePlayer {
  getCurrentTime(): number;
}

interface YouTubeApi {
  Player: new (
    element: HTMLIFrameElement,
    options: { events: { onStateChange: (event: { data: number }) => void } },
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

const loadYouTubeApi = () => {
  apiPromise ??= new Promise<YouTubeApi>((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT as YouTubeApi);
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return apiPromise;
};

const saveProgress = (lessonId: string, secondsWatched: number, completed: boolean) =>
  fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, secondsWatched: Math.floor(secondsWatched), completed }),
    keepalive: true,
  }).catch(() => undefined);

export interface LessonVideoProps {
  embedUrl: string;
  title: string;
  lessonId: string;
  /** Only an enrolled learner's progress is saved; guests just watch. */
  trackProgress: boolean;
}

export const LessonVideo = ({ embedUrl, title, lessonId, trackProgress }: LessonVideoProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!trackProgress || !iframe) return;

    let player: YouTubePlayer | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const save = (completed = false) => {
      if (player) void saveProgress(lessonId, player.getCurrentTime(), completed);
    };

    void loadYouTubeApi().then((api) => {
      if (cancelled) return;
      player = new api.Player(iframe, {
        events: {
          onStateChange: ({ data }) => {
            clearInterval(timer);
            if (data === YT_PLAYING) timer = setInterval(save, SAVE_INTERVAL_MS);
            if (data === YT_PAUSED) save();
            if (data === YT_ENDED) save(true);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [lessonId, trackProgress]);

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title={title}
      className="size-full"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
};
