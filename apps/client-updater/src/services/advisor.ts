/**
 * Advisor service — retrieves advisor profiles for OBO flows.
 *
 * Uses mock data in development; replace the body with a real
 * fetch call when the backend is available.
 */
import type { AdvisorServicePort } from './ports';
import type { AdvisorProfile } from '../types/client.types';
import { MOCK_ADVISORS, delay } from './mockData';

export const advisorService: AdvisorServicePort = {
    async getAdvisorById(id: string): Promise<AdvisorProfile | null> {
        // Replace with: fetch(`${API_BASE_URL}/advisors/${id}`)
        await delay(300);
        return MOCK_ADVISORS.find((a) => a.id === id) ?? null;
    },
};
