import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ClientProvider, useClientContext, useResolveContext } from '../context/ClientContext';

export interface FederatedWrapperProps {
    clientId: string;
    oboAdvisorId?: string;
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

    // Wrap children in a MemoryRouter to keep routes isolated from the Host app
    return <MemoryRouter>{children}</MemoryRouter>;
}

export function FederatedWrapper(props: FederatedWrapperProps) {
    return (
        <ClientProvider>
            <div className="app-shell" style={{ minHeight: 'auto', background: 'transparent' }}>
                <FederatedBootstrap {...props} />
            </div>
        </ClientProvider>
    );
}
