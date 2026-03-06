import type { ClientProfile, AdvisorProfile, ContextResolution } from '../types/client.types';

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_CLIENTS: ClientProfile[] = [
    { id: 'c-1', name: 'Alice Johnson', dob: '1988-04-12', email: 'alice.johnson@example.com', phone: '+1 (555) 010-2345', address: '123 Maple Street, Springfield, IL 62701' },
    { id: 'c-2', name: 'Bob Williams', dob: '1975-09-30', email: 'bob.w@example.com', phone: '+1 (555) 987-6543', address: '456 Oak Avenue, Portland, OR 97201' },
    { id: 'c-3', name: 'Carol Martinez', dob: '1993-01-07', email: 'carol.m@example.com', phone: '+1 (555) 321-7890', address: '789 Pine Road, Austin, TX 78701' },
    { id: 'c-4', name: 'David Lee', dob: '1980-11-22', email: 'david.lee@example.com', phone: '+1 (555) 456-7890', address: '101 Birch Blvd, Seattle, WA 98101' },
];

export const MOCK_ADVISORS: AdvisorProfile[] = [
    { id: 'adv-1', name: 'Sarah Thompson' },
    { id: 'adv-2', name: 'James Carter' },
];

export const ADVISOR_CLIENTS: Record<string, string[]> = {
    'adv-1': ['c-1', 'c-2'],
    'adv-2': ['c-3', 'c-4'],
};

export const MOCK_CONTEXT_MAP: Record<string, ContextResolution> = {
    'ctx-abc123': { clientId: 'c-1', advisorId: 'adv-1' },
    'ctx-def456': { clientId: 'c-2', advisorId: 'adv-1' },
    'ctx-advisor-only': { advisorId: 'adv-2' },
    'ctx-client-only': { clientId: 'c-3' },
};

// ─── Mock config ──────────────────────────────────────────────────────────────

/**
 * Determines the mock user role.
 *
 * Primary config: `VITE_MOCK_ROLE` env var (compile-time).
 * Runtime override: `localStorage.setItem('MOCK_ROLE', role)` — used by
 * Playwright E2E tests to switch roles between scenarios (see client-updater-e2e steps).
 */
export function getMockRole(): 'advisor' | 'support_staff' {
    try {
        const runtimeOverride = globalThis.localStorage?.getItem('MOCK_ROLE');
        if (runtimeOverride) return runtimeOverride as 'advisor' | 'support_staff';
    } catch { /* localStorage unavailable */ }
    return (import.meta.env.VITE_MOCK_ROLE || 'advisor') as 'advisor' | 'support_staff';
}

/**
 * Artificial delay for mock services.
 *
 * Skipped when:
 *  - `VITE_SKIP_DELAYS` env var is `'true'` (compile-time).
 *  - `MOCK_ROLE` is present in localStorage (runtime — set by Playwright E2E tests
 *    to avoid artificial timeouts).
 */
export function delay(ms: number): Promise<void> {
    if (import.meta.env.VITE_SKIP_DELAYS === 'true') {
        return Promise.resolve();
    }
    try {
        if (globalThis.localStorage?.getItem('MOCK_ROLE')) {
            return Promise.resolve();
        }
    } catch { /* localStorage unavailable */ }
    return new Promise((resolve) => setTimeout(resolve, ms));
}
