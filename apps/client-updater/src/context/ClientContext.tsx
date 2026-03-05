import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
    ClientProfile,
    ClientField,
    PendingUpdate,
    UserRole,
    AdvisorProfile,
} from '../types/client.types';

// ─── State ────────────────────────────────────────────────────────────────────
interface ClientContextState {
    /** Resolved from getSignOn() on app mount */
    userRole: UserRole | null;
    /** The logged-in user's own ID (advisorId if advisor, staffId if support_staff) */
    signedOnUserId: string | null;
    /** Display name of the signed-on user */
    signedOnName: string | null;
    /** The advisor the support staff is currently acting on behalf of (null if none) */
    activeAdvisor: AdvisorProfile | null;
    /** The effective advisorId for scoped queries:
     *  - advisor role → signedOnUserId
     *  - support_staff + activeAdvisor → activeAdvisor.id
     *  - support_staff, no advisor → null (name search not permitted) */
    effectiveAdvisorId: string | null;
    /** The loaded client profile */
    client: ClientProfile | null;
    /** Field currently being edited in the wizard */
    selectedField: ClientField | null;
    /** Staged wizard update (old + new value) */
    pendingUpdate: PendingUpdate | null;
    isLoading: boolean;
    error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
interface ClientContextActions {
    setRole: (role: UserRole, userId: string, name: string) => void;
    setAdvisor: (advisor: AdvisorProfile | null) => void;
    setClient: (client: ClientProfile | null) => void;
    selectField: (field: ClientField) => void;
    setPendingUpdate: (update: PendingUpdate | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

type ClientContextValue = ClientContextState & ClientContextActions;

const ClientContext = createContext<ClientContextValue | null>(null);

const initialState: ClientContextState = {
    userRole: null,
    signedOnUserId: null,
    signedOnName: null,
    activeAdvisor: null,
    effectiveAdvisorId: null,
    client: null,
    selectedField: null,
    pendingUpdate: null,
    isLoading: false,
    error: null,
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ClientProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ClientContextState>(initialState);

    const setRole = useCallback((role: UserRole, userId: string, name: string) => {
        setState((prev) => ({
            ...prev,
            userRole: role,
            signedOnUserId: userId,
            signedOnName: name,
            // If role is advisor, they are their own effective advisor
            effectiveAdvisorId: role === 'advisor' ? userId : null,
        }));
    }, []);

    const setAdvisor = useCallback((advisor: AdvisorProfile | null) => {
        setState((prev) => ({
            ...prev,
            activeAdvisor: advisor,
            effectiveAdvisorId:
                advisor !== null
                    ? advisor.id
                    : prev.userRole === 'advisor'
                        ? prev.signedOnUserId
                        : null,
            // Reset client search state when advisor changes
            client: null,
            selectedField: null,
            pendingUpdate: null,
            error: null,
        }));
    }, []);

    const setClient = useCallback((client: ClientProfile | null) => {
        setState((prev) => ({ ...prev, client, error: null }));
    }, []);

    const selectField = useCallback((field: ClientField) => {
        setState((prev) => ({ ...prev, selectedField: field, pendingUpdate: null }));
    }, []);

    const setPendingUpdate = useCallback((pendingUpdate: PendingUpdate | null) => {
        setState((prev) => ({ ...prev, pendingUpdate }));
    }, []);

    const setLoading = useCallback((isLoading: boolean) => {
        setState((prev) => ({ ...prev, isLoading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState((prev) => ({ ...prev, error, isLoading: false }));
    }, []);

    const reset = useCallback(() => {
        setState((prev) => ({
            ...initialState,
            // Preserve identity — don't log the user out on reset
            userRole: prev.userRole,
            signedOnUserId: prev.signedOnUserId,
            signedOnName: prev.signedOnName,
            activeAdvisor: prev.activeAdvisor,
            effectiveAdvisorId: prev.effectiveAdvisorId,
        }));
    }, []);

    return (
        <ClientContext.Provider
            value={{ ...state, setRole, setAdvisor, setClient, selectField, setPendingUpdate, setLoading, setError, reset }}
        >
            {children}
        </ClientContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useClientContext(): ClientContextValue {
    const ctx = useContext(ClientContext);
    if (!ctx) throw new Error('useClientContext must be used within a <ClientProvider>');
    return ctx;
}
