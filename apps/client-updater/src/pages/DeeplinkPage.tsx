import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService, contextService, advisorService } from '../services/clientService';
import { useClientContext } from '../context/ClientContext';

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
    const { client, setClient, setAdvisor, setLoading, setError, isLoading, error } = useClientContext();

    useEffect(() => {
        if (!contextId) {
            navigate('/', { replace: true });
            return;
        }

        // If we already resolved this context (back navigation), skip
        if (client) return;

        let cancelled = false;
        setLoading(true);

        contextService
            .resolveContext(contextId)
            .then(async (resolution) => {
                if (cancelled) return;
                if (!resolution) {
                    setError('Invalid or expired context. Please use a fresh link.');
                    return;
                }

                const { advisorId, clientId } = resolution;

                // Resolve advisor if present
                if (advisorId) {
                    const advisor = await advisorService.getAdvisorById(advisorId);
                    if (!cancelled && advisor) setAdvisor(advisor);
                }

                if (clientId) {
                    // We have a client → load and go straight to detail
                    const profile = await clientService.getClientById(clientId);
                    if (cancelled) return;
                    if (profile) {
                        setClient(profile);
                        navigate('/client', { replace: true });
                    } else {
                        setError(`Client not found in context. Please contact support.`);
                    }
                } else if (advisorId) {
                    // Advisor only → go to search (now scoped to that advisor)
                    navigate('/', { replace: true });
                } else {
                    setError('Context contained no usable client or advisor reference.');
                }
            })
            .catch(() => {
                if (!cancelled) setError('Failed to resolve context. Please try again.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [contextId]); // eslint-disable-line react-hooks/exhaustive-deps

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
