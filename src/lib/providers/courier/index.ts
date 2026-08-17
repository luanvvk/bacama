import type { CourierProvider, Lane } from './types';

export const getCourierProvider = (_lane: Lane): CourierProvider => {
  throw new Error('CourierProvider not implemented until Phase 3');
};
