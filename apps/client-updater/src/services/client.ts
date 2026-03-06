/**
 * Client service — search, fetch, and update client profiles.
 *
 * Uses the shared {@link httpClient} axios instance (12-factor config).
 * Set `VITE_USE_MOCKS=true` to fall back to mock data during development.
 */
import type { ClientServicePort } from './ports';
import type { ClientProfile, ClientSearchResult } from '../types/client.types';
import { MOCK_CLIENTS, ADVISOR_CLIENTS, delay } from './mockData';
import httpClient from './httpClient';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const clientService: ClientServicePort = {
    async searchClientsForAdvisor(
        advisorId: string,
        query: string,
    ): Promise<ClientSearchResult[]> {
        if (USE_MOCKS) {
            await delay(400);
            const ids = ADVISOR_CLIENTS[advisorId] ?? [];
            const q = query.toLowerCase();
            return MOCK_CLIENTS.filter(
                (c) => ids.includes(c.id) && (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)),
            ).map(({ id, name, email }) => ({ id, name, email }));
        }
        const { data } = await httpClient.get<ClientSearchResult[]>(
            `/advisors/${advisorId}/clients/search`,
            { params: { q: query } },
        );
        return data;
    },

    async getClientById(id: string): Promise<ClientProfile | null> {
        if (USE_MOCKS) {
            await delay(300);
            return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
        }
        const { data } = await httpClient.get<ClientProfile>(`/clients/${id}`);
        return data;
    },

    async updateClientField(id: string, field: string, value: string): Promise<{ success: boolean }> {
        if (USE_MOCKS) {
            await delay(600);
            const client = MOCK_CLIENTS.find((c) => c.id === id);
            if (client) {
                (client as unknown as Record<string, string>)[field] = value;
                return { success: true };
            }
            return { success: false };
        }
        const { data } = await httpClient.patch<{ success: boolean }>(
            `/clients/${id}`,
            { [field]: value },
        );
        return data;
    },
};
