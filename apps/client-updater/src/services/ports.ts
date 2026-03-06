/**
 * Service port interfaces (Dependency Inversion).
 *
 * Each port defines the contract for a backend capability.
 * Concrete implementations live in sibling files and can be swapped
 * for real HTTP clients when the backend is available.
 *
 * @module ports
 */

import type {
    ClientProfile,
    ClientSearchResult,
    AdvisorProfile,
    SignOnInfo,
    ContextResolution,
} from '../types/client.types';

/** Authenticates the current session and returns the user's role + identity. */
export interface SignOnServicePort {
    /** Resolve SSO session and return the authenticated user's info. */
    getSignOn(): Promise<SignOnInfo>;
}

/** Retrieves advisor profiles for OBO (on-behalf-of) flows. */
export interface AdvisorServicePort {
    /** Look up an advisor by their unique ID. Returns `null` if not found. */
    getAdvisorById(id: string): Promise<AdvisorProfile | null>;
}

/** CRUD operations on client profiles. */
export interface ClientServicePort {
    /** Search clients scoped to a specific advisor by name or email. */
    searchClientsForAdvisor(advisorId: string, query: string): Promise<ClientSearchResult[]>;
    /** Fetch a full client profile by ID. Returns `null` if not found. */
    getClientById(id: string): Promise<ClientProfile | null>;
    /** Patch a single field on a client record. */
    updateClientField(id: string, field: string, value: string): Promise<{ success: boolean }>;
}

/** Resolves opaque deeplink context tokens into concrete IDs. */
export interface ContextServicePort {
    /** Map a contextId to an optional clientId and/or advisorId. Returns `null` if unknown. */
    resolveContext(contextId: string): Promise<ContextResolution | null>;
}
