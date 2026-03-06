/**
 * Context service — resolves opaque deeplink tokens into concrete IDs.
 *
 * Uses mock data in development; replace the body with a real
 * fetch call when the backend is available.
 */
import type { ContextServicePort } from './ports';
import type { ContextResolution } from '../types/client.types';
import { MOCK_CONTEXT_MAP, delay } from './mockData';

export const contextService: ContextServicePort = {
    async resolveContext(contextId: string): Promise<ContextResolution | null> {
        // Replace with: fetch(`${API_BASE_URL}/context/${contextId}`)
        await delay(300);
        return MOCK_CONTEXT_MAP[contextId] ?? null;
    },
};
