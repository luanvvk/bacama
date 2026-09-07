import type { AuthProvider } from './types';
import { getClerkAuthProvider } from './clerk';

export const getAuthProvider = (): AuthProvider => getClerkAuthProvider();
