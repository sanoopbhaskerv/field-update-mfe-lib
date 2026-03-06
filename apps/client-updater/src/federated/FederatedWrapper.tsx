/**
 * Federated wrapper infrastructure for embedding client-updater
 * inside a host application via Module Federation.
 *
 * Provides:
 * - {@link FederatedWrapper} — shell that sets up MemoryRouter, contexts, and error boundary
 * - {@link FederatedBootstrap} — resolves clientId/advisorId on mount
 * - {@link useOnComplete} — access the host's `onComplete` callback
 * - {@link useIsFederated} — detect whether the app is running in federated mode
 *
 * @module FederatedWrapper
 */
import { createContext, useContext, useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ClientProvider, useClientContext } from '../context/ClientContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Spinner } from '../components/Spinner';
import { useResolveContext } from '../hooks/useResolveContext';
import type { FederatedCompleteEvent } from '../types/client.types';
import '../styles.css';

/** Callback type for the host's completion handler. */
export type OnCompleteCallback = (event: FederatedCompleteEvent) => void;

const OnCompleteContext = createContext<OnCompleteCallback | undefined>(undefined);

/** Access the host-provided `onComplete` callback (undefined in standalone mode). */
export function useOnComplete(): OnCompleteCallback | undefined {
    return useContext(OnCompleteContext);
}

const FederatedContext = createContext(false);

/** Returns `true` when running inside a federated host (MemoryRouter isolation). */
export function useIsFederated(): boolean {
    return useContext(FederatedContext);
}

/** Props accepted by {@link FederatedWrapper}. */
export interface FederatedWrapperProps {
    clientId: string;
    oboAdvisorId?: string;
    onComplete?: OnCompleteCallback;
    children: React.ReactNode;
}

/**
 * Internal bootstrap component that resolves context (client + advisor)
 * when the federated wrapper mounts.
 */
function FederatedBootstrap({ clientId, oboAdvisorId, children }: FederatedWrapperProps) {
    const { resolveContext } = useResolveContext();
    const { isLoading, error } = useClientContext();

    useEffect(() => {
        resolveContext(clientId, oboAdvisorId);
    }, [clientId, oboAdvisorId, resolveContext]);


    if (isLoading) {
        return (
            <div className="centered-state centered-state--panel">
                <Spinner message="Loading client details…" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="centered-state centered-state--panel">
                <div className="card card--narrow">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    return children;
}

/**
 * Top-level wrapper for federated (embedded) usage.
 *
 * Sets up ErrorBoundary, ClientProvider, MemoryRouter, and context
 * providers for `onComplete` and `isFederated`.
 */
export function FederatedWrapper({ onComplete, ...props }: FederatedWrapperProps) {
    return (
        <ErrorBoundary
            fallback={
                <div className="centered-state centered-state--panel">
                    <div className="card card--narrow">
                        <div className="alert alert-error">
                            Something went wrong. Please try again or contact support.
                        </div>
                    </div>
                </div>
            }
        >
            <ClientProvider>
                <FederatedContext.Provider value={true}>
                    <OnCompleteContext.Provider value={onComplete}>
                        <div className="app-shell app-shell--embedded">
                            <MemoryRouter>
                                <FederatedBootstrap {...props} />
                            </MemoryRouter>
                        </div>
                    </OnCompleteContext.Provider>
                </FederatedContext.Provider>
            </ClientProvider>
        </ErrorBoundary>
    );
}
