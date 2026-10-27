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
