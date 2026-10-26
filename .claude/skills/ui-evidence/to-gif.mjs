// Convert a Playwright .webm recording to a small GIF with ffmpeg.
// Usage: node to-gif.mjs <in.webm> <out.gif> [fps=8] [width=720]
import { execFileSync } from 'node:child_process';

const [input, output, fps = '8', width = '720'] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node to-gif.mjs <in.webm> <out.gif> [fps] [width]');
  process.exit(1);
}

const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`;
try {
  execFileSync('ffmpeg', ['-y', '-i', input, '-vf', filter, '-loop', '0', output], {
    stdio: 'inherit',
  });
} catch {
  console.error('ffmpeg failed or is not installed (Windows: winget install Gyan.FFmpeg).');
  process.exit(1);
}
