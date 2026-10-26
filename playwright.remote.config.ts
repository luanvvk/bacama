import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

// Runs the specs in tests/e2e against an already-deployed URL (no local server).
//   PW_BASE_URL=https://<deployment> pnpm exec playwright test -c playwright.remote.config.ts
// Vercel previews sit behind Deployment Protection; set VERCEL_BYPASS_TOKEN
// (Project > Settings > Deployment Protection > Protection Bypass for Automation).
const baseURL = process.env.PW_BASE_URL;
if (!baseURL) throw new Error('Set PW_BASE_URL to the deployment URL to test.');

const bypass = process.env.VERCEL_BYPASS_TOKEN;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/remote-results.json' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: bypass
      ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' }
      : undefined,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
