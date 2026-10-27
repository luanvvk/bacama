import { getVideoProvider } from '../index';

describe('youtube video provider', () => {
  const provider = getVideoProvider();

  it('returns a privacy-enhanced embed url for a video id', async () => {
    const token = await provider.getSignedPlayback('jNQXAC9IVRw', null);

    expect(token.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw?rel=0&enablejsapi=1',
    );
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('starts at the saved position when one is given', async () => {
    const token = await provider.getSignedPlayback('jNQXAC9IVRw', 'user-1', 75.6);

    expect(token.embedUrl).toContain('&start=75');
  });

  it('rejects an id that could break out of the embed path', async () => {
    await expect(provider.getSignedPlayback('abc/../../x?y=1', 'user-1')).rejects.toThrow(
      'Invalid YouTube video id',
    );
  });

  it('treats a lesson as a preview only when flagged free', () => {
    expect(provider.isPreview({ isFreePreview: true })).toBe(true);
    expect(provider.isPreview({ isFreePreview: false })).toBe(false);
  });
});
