/**
 * Context service — resolves opaque deeplink tokens into concrete IDs.
 *
 * Uses the shared {@link httpClient} axios instance.
 * Set `VITE_USE_MOCKS=true` to fall back to mock data during development.
 */
import type { ContextServicePort } from './ports';
import type { ContextResolution } from '../types/client.types';
import { MOCK_CONTEXT_MAP, delay } from './mockData';
import httpClient from './httpClient';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const contextService: ContextServicePort = {
    async resolveContext(contextId: string): Promise<ContextResolution | null> {
        if (USE_MOCKS) {
            await delay(300);
            return MOCK_CONTEXT_MAP[contextId] ?? null;
        }
        const { data } = await httpClient.get<ContextResolution>(`/context/${contextId}`);
        return data;
    },
};
