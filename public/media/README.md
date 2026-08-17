# Entrance overlay video

Place a file named `entrance.mp4` in this directory to play a short looping
video behind the Bacama entrance overlay on `/`.

## Recommended free clips

All clips below are free for commercial use, no attribution required.

### Pexels License (free for commercial use)

- **Coffee beans roasting** — https://www.pexels.com/search/videos/coffee%20roasting/
- **Coffee being poured** — https://www.pexels.com/search/videos/coffee%20pour/
- **Coffee shop / bakery ambiance** — https://www.pexels.com/search/videos/coffee%20shop/

Search for clips that are:

- 8–15 seconds long
- Horizontal orientation
- Subtle motion (not too busy behind text)
- Darker or moody tones work best with the overlay text

## Encoding the clip

If the downloaded file is larger than needed, re-encode it to keep the file small:

```bash
ffmpeg -i downloaded.mp4 \
  -vf "scale=1280:-2" \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -movflags +faststart \
  -an \
  entrance.mp4
```

Aim for a file under 2 MB. The video is muted, so no audio track is needed.

## How it works

The entrance overlay (`src/app/(storefront)/_components/EntranceOverlay`) uses
a `<video>` element with `autoPlay muted loop playsInline`. If the file is
missing, the poster image (an Unsplash photo) shows instead — the overlay works
identically with or without the video.
