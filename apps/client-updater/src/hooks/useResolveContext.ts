import { useCallback } from 'react';
import { useClientContext } from '../context/ClientContext';
import { signOnService, advisorService, clientService } from '../services';
import type { UserRole } from '../types/client.types';

/**
 * Shared hook to resolve the authentication session and target client/advisor context.
 * Used by both Deeplinks and Module Federation entry points.
 *
 * Returns a boolean indicating success.
 * Callers are responsible for their own cleanup (e.g. `active` flag) on unmount.
 */
export function useResolveContext() {
    const { setRole, setAdvisor, setClient, setLoading, setError } = useClientContext();

    const resolveContext = useCallback(
        async (clientId?: string, oboAdvisorId?: string): Promise<boolean> => {
            setLoading(true);
            try {
                // 1. Resolve Auth Session
                const signOn = await signOnService.getSignOn();
                setRole(signOn.role as UserRole, signOn.userId, signOn.displayName);

                // 2. Resolve target OBO Advisor if present
                if (oboAdvisorId) {
                    const advisor = await advisorService.getAdvisorById(oboAdvisorId);
                    if (advisor) {
                        setAdvisor(advisor);
                    }
                }

                // 3. Resolve target Client if present
                if (clientId) {
                    const profile = await clientService.getClientById(clientId);
                    if (profile) {
                        setClient(profile);
                        return true;
                    } else {
                        setError('Client not found.');
                        return false;
                    }
                }

                return true;
            } catch (err) {
                setError('Failed to initialize context.');
                console.error(err);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setRole, setAdvisor, setClient, setLoading, setError],
    );

    return { resolveContext };
}
