import type { LocalHandoff } from './types';

const ENV_VAR = 'GRABFOOD_LISTING_URL';

const readListingUrl = (): string => {
  const raw = process.env[ENV_VAR];
  if (!raw) throw new Error(`${ENV_VAR} is not set`);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${ENV_VAR} is not a valid URL`);
  }
  if (url.protocol !== 'https:') throw new Error(`${ENV_VAR} must be an https: URL`);
  return url.toString();
};

// Deep link only: GrabFood is a listing the customer orders on; nothing syncs back.
export const createGrabFoodHandoff = (): LocalHandoff => {
  const listingUrl = readListingUrl();
  return {
    buildHandoffLink(bakeryItemId, siteId) {
      if (!bakeryItemId) throw new Error('bakeryItemId is required');
      if (!siteId) throw new Error('siteId is required');
      return listingUrl;
    },
  };
};
