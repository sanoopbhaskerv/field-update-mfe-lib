import { createContext, useContext, useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ClientProvider, useClientContext, useResolveContext } from '../context/ClientContext';
import type { FederatedCompleteEvent } from '../types/client.types';
import '../styles.css';

export type OnCompleteCallback = (event: FederatedCompleteEvent) => void;

const OnCompleteContext = createContext<OnCompleteCallback | undefined>(undefined);

export function useOnComplete(): OnCompleteCallback | undefined {
    return useContext(OnCompleteContext);
}

const FederatedContext = createContext(false);

export function useIsFederated(): boolean {
    return useContext(FederatedContext);
}

export interface FederatedWrapperProps {
    clientId: string;
    oboAdvisorId?: string;
    onComplete?: OnCompleteCallback;
    children: React.ReactNode;
}

function FederatedBootstrap({ clientId, oboAdvisorId, children }: FederatedWrapperProps) {
    const { resolveContext } = useResolveContext();
    const { isLoading, error } = useClientContext();

    useEffect(() => {
        let active = true;
        resolveContext(clientId, oboAdvisorId).then((result) => {
            if (!active && result && typeof result !== 'boolean' && result.cancel) {
                result.cancel();
            }
        });
        return () => { active = false; };
    }, [clientId, oboAdvisorId, resolveContext]);


    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading client details…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
                <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function FederatedWrapper({ onComplete, ...props }: FederatedWrapperProps) {
    return (
        <ClientProvider>
            <FederatedContext.Provider value={true}>
                <OnCompleteContext.Provider value={onComplete}>
                    <div className="app-shell" style={{ minHeight: 'auto' }}>
                        <MemoryRouter>
                            <FederatedBootstrap {...props} />
                        </MemoryRouter>
                    </div>
                </OnCompleteContext.Provider>
            </FederatedContext.Provider>
        </ClientProvider>
    );
}
