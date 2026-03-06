import { useClientContext } from '../context/ClientContext';
import { NameSearchView } from './search/NameSearchView';
import { ClientIdLookupView } from './search/ClientIdLookupView';

/**
 * Role-aware SearchPage:
 *
 * ADVISOR role (effectiveAdvisorId = their own userId):
 *   → Name search scoped to their clients (NameSearchView)
 *
 * SUPPORT STAFF — no advisor selected (effectiveAdvisorId = null):
 *   → Client ID lookup only + "Work on behalf of Advisor" CTA (ClientIdLookupView)
 *
 * SUPPORT STAFF — advisor selected (effectiveAdvisorId = advisor.id):
 *   → Name search scoped to that advisor (NameSearchView)
 */
export function SearchPage() {
    const { effectiveAdvisorId } = useClientContext();

    return (
        <div className="page-container">
            <div className="card">
                {effectiveAdvisorId ? <NameSearchView /> : <ClientIdLookupView />}
            </div>
        </div>
    );
}
