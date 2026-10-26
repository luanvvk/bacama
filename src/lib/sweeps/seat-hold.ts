import { releaseExpiredHolds } from '@/services/enrollments/release-expired-holds';

export const releaseSeatHolds = (now = new Date()): Promise<{ released: number }> =>
  releaseExpiredHolds({ now });
