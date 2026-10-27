export const MENU_SECTIONS = [
  'phin',
  'espresso',
  'hand_brew',
  'cold_brew',
  'tea',
  'matcha',
  'chocolate',
  'juice',
] as const;

export type MenuSection = (typeof MENU_SECTIONS)[number];

/** Must match `images.remotePatterns` in next.config.ts — next/image rejects other hosts. */
export const MENU_IMAGE_HOSTS = ['images.unsplash.com', 'huawei-food-cms.grab.com'] as const;

export const isAllowedMenuImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' && (MENU_IMAGE_HOSTS as readonly string[]).includes(url.hostname)
    );
  } catch {
    return false;
  }
};
