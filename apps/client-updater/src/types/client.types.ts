/**
 * Domain types — single source of truth for all models used across
 * the client-updater micro-frontend.
 *
 * @module client.types
 */

// ─── User roles ──────────────────────────────────────────────────────────────

/** Authenticated user role returned by the SSO/sign-on endpoint. */
export type UserRole = 'advisor' | 'support_staff';

/** Payload returned by the sign-on service after SSO verification. */
export interface SignOnInfo {
    role: UserRole;
    /** The logged-in user's own ID (advisorId if role=advisor, staffId if support_staff) */
    userId: string;
    /** Human-readable name shown in the header / greeting. */
    displayName: string;
}

// ─── Advisor ─────────────────────────────────────────────────────────────────

/** Minimal advisor identity used for OBO (on-behalf-of) flows. */
export interface AdvisorProfile {
    id: string;
    name: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

/** Union of editable field keys on {@link ClientProfile}. */
export type ClientField = 'name' | 'dob' | 'email' | 'phone' | 'address';

/** Full client profile loaded via the client service. */
export interface ClientProfile {
    id: string;
    name: string;
    dob: string;       // ISO date string e.g. "1990-05-20"
    email: string;
    phone: string;
    address: string;
}

/** Lightweight projection returned by client name search. */
export interface ClientSearchResult {
    id: string;
    name: string;
    email: string;
}

/** Staged field change held in context between wizard steps. */
export interface PendingUpdate {
    field: ClientField;
    oldValue: string;
    newValue: string;
}

// ─── Context resolution (deeplink) ───────────────────────────────────────────

/** Result of resolving an opaque deeplink contextId into concrete IDs. */
export interface ContextResolution {
    /** Present when context carries a pre-selected client */
    clientId?: string;
    /** Present when context carries an advisor (staff acting on behalf of) */
    advisorId?: string;
}

// ─── Federated callback ───────────────────────────────────────────────────────

/** Discriminator for the action the user took to exit the wizard. */
export type FederatedAction = 'done' | 'edit-another' | 'cancel';

/** Event payload emitted to the host app via `onComplete` when the wizard finishes. */
export interface FederatedCompleteEvent {
    action: FederatedAction;
    client: ClientProfile;
    /** The field that was changed (absent on `cancel`). */
    updatedField?: ClientField;
    /** New value that was saved (absent on `cancel`). */
    newValue?: string;
}

// ─── Field metadata registry ──────────────────────────────────────────────────

/** UI metadata for a single editable client field. */
export interface FieldMeta {
    label: string;
    inputType: string;
    placeholder: string;
}

/** Registry mapping each {@link ClientField} to its display and input metadata. */
export const FIELD_CONFIG: Record<ClientField, FieldMeta> = {
    name:    { label: 'Full Name',       inputType: 'text',  placeholder: 'Enter full name' },
    dob:     { label: 'Date of Birth',   inputType: 'date',  placeholder: '' },
    email:   { label: 'Email Address',   inputType: 'email', placeholder: 'Enter email address' },
    phone:   { label: 'Phone Number',    inputType: 'tel',   placeholder: '+1 (555) 000-0000' },
    address: { label: 'Address',         inputType: 'text',  placeholder: 'Enter full address' },
};

/** Ordered list of fields shown on the client detail page. */
export const EDITABLE_FIELDS: ClientField[] = ['name', 'dob', 'email', 'phone', 'address'];

/** Derived label-only map for display purposes (backward-compatible convenience). */
export const FIELD_LABELS: Record<ClientField, string> = Object.fromEntries(
    Object.entries(FIELD_CONFIG).map(([k, v]) => [k, v.label]),
) as Record<ClientField, string>;
