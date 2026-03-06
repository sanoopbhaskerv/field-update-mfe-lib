/**
 * Sign-on service — resolves the current user's SSO session.
 *
 * Uses mock data in development; replace the body of `getSignOn()`
 * with a real fetch call when the backend is available.
 */
import type { SignOnServicePort } from './ports';
import type { SignOnInfo } from '../types/client.types';
import { getMockRole, delay } from './mockData';

export const signOnService: SignOnServicePort = {
    async getSignOn(): Promise<SignOnInfo> {
        // Replace with: fetch(`${API_BASE_URL}/signon`)
        await delay(200);
        const role = getMockRole();
        return role === 'support_staff'
            ? { role: 'support_staff', userId: 'staff-1', displayName: 'Support User' }
            : { role: 'advisor', userId: 'adv-1', displayName: 'Sarah Thompson' };
    },
};
