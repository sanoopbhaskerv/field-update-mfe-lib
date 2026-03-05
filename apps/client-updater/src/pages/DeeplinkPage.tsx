import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contextService } from '../services/clientService';
import { useClientContext, useResolveContext } from '../context/ClientContext';

/**
 * DeeplinkPage — resolves an opaque contextId to a ContextResolution.
 *
 * Handles all 3 context combinations:
 *   advisorId + clientId → set advisor + load client → /client
 *   advisorId only       → set advisor in context → / (advisor-scoped search)
 *   clientId only        → load client directly → /client
 */
export function DeeplinkPage() {
    const { contextId } = useParams<{ contextId: string }>();
    const navigate = useNavigate();
    const { client, isLoading, error, setError, setLoading } = useClientContext();
    const { resolveContext } = useResolveContext();

    useEffect(() => {
        if (!contextId) {
            navigate('/', { replace: true });
            return;
        }

        if (client) return;

        let active = true;

        setLoading(true);

        contextService.resolveContext(contextId).then(async (resolution) => {
            if (!active) return;

            if (!resolution) {
                setError('Invalid or expired context. Please use a fresh link.');
                setLoading(false);
                return;
            }

            const { advisorId, clientId } = resolution;

            // Use the shared hook to load auth, advisor, and client profiles
            const result = await resolveContext(clientId, advisorId);

            if (!active) {
                if (result && typeof result !== 'boolean' && result.cancel) result.cancel();
                return;
            }

            if (result && typeof result !== 'boolean' && result.isSuccess) {
                if (clientId) {
                    navigate('/client', { replace: true });
                } else if (advisorId) {
                    navigate('/', { replace: true });
                }
            }
        }).catch(() => {
            if (active) {
                setError('Failed to resolve context. Please try again.');
                setLoading(false);
            }
        });

        return () => { active = false; };
    }, [contextId, resolveContext]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return (
            <div className="page-container" style={{ textAlign: 'center' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--color-text-muted)' }}>Loading your context…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="card">
                    <div className="alert alert-error">{error}</div>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        ← Back to Search
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
