/**
 * Sign-on service — resolves the current user's SSO session.
 *
 * Uses the shared {@link httpClient} axios instance.
 * Set `VITE_USE_MOCKS=true` to fall back to mock data during development.
 */
import type { SignOnServicePort } from './ports';
import type { SignOnInfo } from '../types/client.types';
import { getMockRole, delay } from './mockData';
import httpClient from './httpClient';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const signOnService: SignOnServicePort = {
    async getSignOn(): Promise<SignOnInfo> {
        if (USE_MOCKS) {
            await delay(200);
            const role = getMockRole();
            return role === 'support_staff'
                ? { role: 'support_staff', userId: 'staff-1', displayName: 'Support User' }
                : { role: 'advisor', userId: 'adv-1', displayName: 'Sarah Thompson' };
        }
        const { data } = await httpClient.get<SignOnInfo>('/signon');
        return data;
    },
};
