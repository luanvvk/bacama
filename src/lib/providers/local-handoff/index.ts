import { createGrabFoodHandoff } from './grabfood';
import type { LocalHandoff } from './types';

export const getLocalHandoff = (): LocalHandoff => createGrabFoodHandoff();
