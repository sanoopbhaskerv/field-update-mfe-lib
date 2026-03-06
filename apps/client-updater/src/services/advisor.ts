/**
 * Advisor service — retrieves advisor profiles for OBO flows.
 *
 * Uses the shared {@link httpClient} axios instance.
 * Set `VITE_USE_MOCKS=true` to fall back to mock data during development.
 */
import type { AdvisorServicePort } from './ports';
import type { AdvisorProfile } from '../types/client.types';
import { MOCK_ADVISORS, delay } from './mockData';
import httpClient from './httpClient';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const advisorService: AdvisorServicePort = {
    async getAdvisorById(id: string): Promise<AdvisorProfile | null> {
        if (USE_MOCKS) {
            await delay(300);
            return MOCK_ADVISORS.find((a) => a.id === id) ?? null;
        }
        const { data } = await httpClient.get<AdvisorProfile>(`/advisors/${id}`);
        return data;
    },
};
