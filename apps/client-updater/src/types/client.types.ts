// Domain types — single source of truth for all models

// ─── User roles ──────────────────────────────────────────────────────────────
export type UserRole = 'advisor' | 'support_staff';

export interface SignOnInfo {
    role: UserRole;
    /** The logged-in user's own ID (advisorId if role=advisor, staffId if support_staff) */
    userId: string;
    displayName: string;
}

// ─── Advisor ─────────────────────────────────────────────────────────────────
export interface AdvisorProfile {
    id: string;
    name: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────
export type ClientField = 'name' | 'dob' | 'email' | 'phone' | 'address';

export interface ClientProfile {
    id: string;
    name: string;
    dob: string;       // ISO date string e.g. "1990-05-20"
    email: string;
    phone: string;
    address: string;
}

export interface ClientSearchResult {
    id: string;
    name: string;
    email: string;
}

export interface PendingUpdate {
    field: ClientField;
    oldValue: string;
    newValue: string;
}

// ─── Context resolution (deeplink) ───────────────────────────────────────────
export interface ContextResolution {
    /** Present when context carries a pre-selected client */
    clientId?: string;
    /** Present when context carries an advisor (staff acting on behalf of) */
    advisorId?: string;
}

// ─── Federated callback ───────────────────────────────────────────────────────
export type FederatedAction = 'done' | 'edit-another' | 'cancel';

export interface FederatedCompleteEvent {
    action: FederatedAction;
    client: ClientProfile;
    updatedField?: ClientField;
    newValue?: string;
}

// ─── Field labels ─────────────────────────────────────────────────────────────
export const FIELD_LABELS: Record<ClientField, string> = {
    name: 'Full Name',
    dob: 'Date of Birth',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
};
