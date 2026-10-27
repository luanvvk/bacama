import { request } from '@playwright/test';

// Vercel previews sit behind Deployment Protection. Trade the bypass token for the
// bypass cookie once, so the header is not sent to third-party origins (Clerk's CDN
// rejects the resulting CORS preflight).
export default async function globalSetup() {
  const baseURL = process.env.PW_BASE_URL;
  const bypass = process.env.VERCEL_BYPASS_TOKEN;
  if (!baseURL || !bypass) return;

  const context = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': bypass,
      'x-vercel-set-bypass-cookie': 'true',
    },
  });
  await context.get('/');
  await context.storageState({ path: 'test-results/remote-auth.json' });
  await context.dispose();
}
