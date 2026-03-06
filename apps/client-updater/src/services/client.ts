/**
 * Client service — search, fetch, and update client profiles.
 *
 * Uses the shared {@link httpClient} axios instance (12-factor config).
 * Set `VITE_USE_MOCKS=true` to fall back to mock data during development.
 */
import type { ClientServicePort } from './ports';
import type {
  ClientProfile,
  ClientSearchResult,
  SectionValue,
} from '../types/client.types';
import { getDisplayName, applySectionUpdate } from '../types/client.types';
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
        (c) =>
          ids.includes(c.clientId) &&
          (getDisplayName(c).toLowerCase().includes(q) ||
            c.emails.some((e) => e.emailAddress.toLowerCase().includes(q))),
      ).map((c) => ({
        id: c.clientId,
        name: getDisplayName(c),
        email: c.emails[0]?.emailAddress ?? '',
      }));
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
      return MOCK_CLIENTS.find((c) => c.clientId === id) ?? null;
    }
    const { data } = await httpClient.get<ClientProfile>(`/clients/${id}`);
    return data;
  },

  async updateClientSection(
    id: string,
    section: string,
    value: SectionValue,
    index?: number,
  ): Promise<{ success: boolean }> {
    if (USE_MOCKS) {
      await delay(600);
      const clientIdx = MOCK_CLIENTS.findIndex((c) => c.clientId === id);
      if (clientIdx !== -1) {
        MOCK_CLIENTS[clientIdx] = applySectionUpdate(
          MOCK_CLIENTS[clientIdx],
          section as 'name' | 'email' | 'phone' | 'address',
          value,
          index,
        );
        return { success: true };
      }
      return { success: false };
    }
    const { data } = await httpClient.patch<{ success: boolean }>(
      `/clients/${id}/${section}`,
      { value, index },
    );
    return data;
  },
};
