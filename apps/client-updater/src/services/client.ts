/**
 * Client service — search, fetch, and update client profiles.
 *
 * Reads `VITE_API_BASE_URL` from environment (12-factor config).
 * Uses mock data in development; replace each method body with
 * real fetch calls when the backend is available.
 */
import type { ClientServicePort } from './ports';
import type { ClientProfile, ClientSearchResult } from '../types/client.types';
import { MOCK_CLIENTS, ADVISOR_CLIENTS, delay } from './mockData';

/** Base URL for all client API calls, sourced from environment. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const clientService: ClientServicePort = {
    async searchClientsForAdvisor(
        advisorId: string,
        query: string,
    ): Promise<ClientSearchResult[]> {
        // Replace with: fetch(`${API_BASE_URL}/advisors/${advisorId}/clients/search?q=${encodeURIComponent(query)}`)
        await delay(400);
        const ids = ADVISOR_CLIENTS[advisorId] ?? [];
        const q = query.toLowerCase();
        return MOCK_CLIENTS.filter(
            (c) => ids.includes(c.id) && (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)),
        ).map(({ id, name, email }) => ({ id, name, email }));
    },

    async getClientById(id: string): Promise<ClientProfile | null> {
        // Replace with: fetch(`${API_BASE_URL}/clients/${id}`)
        await delay(300);
        return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
    },

    async updateClientField(id: string, field: string, value: string): Promise<{ success: boolean }> {
        // Replace with: fetch(`${API_BASE_URL}/clients/${id}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) })
        await delay(600);
        const client = MOCK_CLIENTS.find((c) => c.id === id);
        if (client) {
            (client as unknown as Record<string, string>)[field] = value;
            return { success: true };
        }
        return { success: false };
    },
};

if (import.meta.env.DEV) {
    console.debug('[services] API_BASE_URL =', API_BASE_URL);
}
