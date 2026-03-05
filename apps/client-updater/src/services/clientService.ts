import type {
    ClientProfile,
    ClientSearchResult,
    AdvisorProfile,
    SignOnInfo,
    ContextResolution,
} from '../types/client.types';

// 12-factor: all config from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CLIENTS: ClientProfile[] = [
    { id: 'c-1', name: 'Alice Johnson', dob: '1988-04-12', email: 'alice.johnson@example.com', phone: '+1 (555) 010-2345', address: '123 Maple Street, Springfield, IL 62701' },
    { id: 'c-2', name: 'Bob Williams', dob: '1975-09-30', email: 'bob.w@example.com', phone: '+1 (555) 987-6543', address: '456 Oak Avenue, Portland, OR 97201' },
    { id: 'c-3', name: 'Carol Martinez', dob: '1993-01-07', email: 'carol.m@example.com', phone: '+1 (555) 321-7890', address: '789 Pine Road, Austin, TX 78701' },
    { id: 'c-4', name: 'David Lee', dob: '1980-11-22', email: 'david.lee@example.com', phone: '+1 (555) 456-7890', address: '101 Birch Blvd, Seattle, WA 98101' },
];

const MOCK_ADVISORS: AdvisorProfile[] = [
    { id: 'adv-1', name: 'Sarah Thompson' },
    { id: 'adv-2', name: 'James Carter' },
];

// Advisor → client mapping
const ADVISOR_CLIENTS: Record<string, string[]> = {
    'adv-1': ['c-1', 'c-2'],
    'adv-2': ['c-3', 'c-4'],
};

// Context → resolution mapping (deeplink scenarios)
const MOCK_CONTEXT_MAP: Record<string, ContextResolution> = {
    'ctx-abc123': { clientId: 'c-1', advisorId: 'adv-1' },  // both
    'ctx-def456': { clientId: 'c-2', advisorId: 'adv-1' },  // both
    'ctx-advisor-only': { advisorId: 'adv-2' },              // advisor only → show search
    'ctx-client-only': { clientId: 'c-3' },                 // client only (support staff)
};

const getMockSignOn = (): SignOnInfo => {
    // Check localStorage first for dynamic E2E testing
    const localRole = typeof window !== 'undefined' ? localStorage.getItem('MOCK_ROLE') : null;
    const role = (localRole || import.meta.env.VITE_MOCK_ROLE || 'advisor') as 'advisor' | 'support_staff';

    return role === 'support_staff'
        ? { role: 'support_staff', userId: 'staff-1', displayName: 'Support User' }
        : { role: 'advisor', userId: 'adv-1', displayName: 'Sarah Thompson' };
};

// ─── signOnService ────────────────────────────────────────────────────────────

export const signOnService = {
    /**
     * Determines the logged-in user's role and identity.
     * Replace with: fetch(`${API_BASE_URL}/signon`)
     */
    async getSignOn(): Promise<SignOnInfo> {
        await delay(200);
        return getMockSignOn();
    },
};

// ─── advisorService ───────────────────────────────────────────────────────────

export const advisorService = {
    /** Look up an advisor by ID (support staff "on behalf of" flow). */
    async getAdvisorById(id: string): Promise<AdvisorProfile | null> {
        // Replace with: fetch(`${API_BASE_URL}/advisors/${id}`)
        await delay(300);
        return MOCK_ADVISORS.find((a) => a.id === id) ?? null;
    },
};

// ─── clientService ────────────────────────────────────────────────────────────

export const clientService = {
    /**
     * Search clients by name, scoped to an advisor.
     * Required for advisor login and support-staff-acting-on-behalf-of-advisor flows.
     * Without advisorId the API returns 404 — do NOT call without one.
     */
    async searchClientsForAdvisor(
        advisorId: string,
        query: string
    ): Promise<ClientSearchResult[]> {
        // Replace with: fetch(`${API_BASE_URL}/advisors/${advisorId}/clients/search?q=${encodeURIComponent(query)}`)
        await delay(400);
        const ids = ADVISOR_CLIENTS[advisorId] ?? [];
        const q = query.toLowerCase();
        return MOCK_CLIENTS.filter(
            (c) => ids.includes(c.id) && (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
        ).map(({ id, name, email }) => ({ id, name, email }));
    },

    /** Fetch full client profile by internal ID (never exposed in URL). */
    async getClientById(id: string): Promise<ClientProfile | null> {
        // Replace with: fetch(`${API_BASE_URL}/clients/${id}`)
        await delay(300);
        return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
    },

    /** Update a single field on a client. */
    async updateClientField(id: string, field: string, value: string): Promise<{ success: boolean }> {
        // Replace with: fetch(`${API_BASE_URL}/clients/${id}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) })
        await delay(600);
        const client = MOCK_CLIENTS.find((c) => c.id === id);
        if (client) {
            (client as Record<string, string>)[field] = value;
            return { success: true };
        }
        return { success: false };
    },
};

// ─── contextService ───────────────────────────────────────────────────────────

export const contextService = {
    /**
     * Resolves a deeplink contextId → ContextResolution.
     * Can return advisorId, clientId, or both.
     * Replace with: fetch(`${API_BASE_URL}/context/${contextId}`)
     */
    async resolveContext(contextId: string): Promise<ContextResolution | null> {
        await delay(300);
        return MOCK_CONTEXT_MAP[contextId] ?? null;
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
    // In Playwright tests we don't need artificial delays, they just cause timeouts
    if (typeof window !== 'undefined' && localStorage.getItem('MOCK_ROLE')) {
        return Promise.resolve();
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
}

if (import.meta.env.DEV) {
    console.debug('[services] API_BASE_URL =', API_BASE_URL);
}
