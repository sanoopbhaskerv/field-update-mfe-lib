/**
 * ClientIdLookupView — direct client lookup by ID for support staff.
 *
 * Shown when support staff has not yet selected an advisor.
 * Allows looking up a client by their ID, or navigating to the
 * advisor selection page to enable name-based search.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services';
import { useClientContext } from '../../context/ClientContext';

export function ClientIdLookupView() {
    const navigate = useNavigate();
    const { setClient, setLoading, setError, isLoading, error } = useClientContext();

    const [query, setQuery] = useState('');

    const handleClientIdLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const profile = await clientService.getClientById(query.trim());
            if (profile) {
                setClient(profile);
                navigate('/client');
            } else {
                setError(`No client found with ID "${query.trim()}".`);
            }
        } catch {
            setError('Lookup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="page-title--lg">Client Lookup</h1>
            <p className="page-subtitle page-subtitle--md">
                Enter the client&apos;s ID to access their profile, or work on behalf of an advisor to search by name.
            </p>

            <form onSubmit={handleClientIdLookup}>
                <div className="form-group">
                    <label className="form-label" htmlFor="client-id-input">Client ID</label>
                    <div className="search-row">
                        <input
                            id="client-id-input"
                            className="form-input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. c-1"
                            autoFocus
                            disabled={isLoading}
                        />
                        <button className="btn btn-primary flex-shrink-0" type="submit" disabled={isLoading || !query.trim()}>
                            {isLoading ? 'Loading…' : 'Find'}
                        </button>
                    </div>
                </div>
            </form>

            {error && <div className="alert alert-error alert--mt">{error}</div>}
            {isLoading && <div className="spinner" />}

            <hr className="divider" />

            <div className="card--center">
                <p className="page-subtitle page-subtitle--md">
                    To search clients by name, select an advisor first.
                </p>
                <button
                    className="btn btn-secondary w-full"
                    onClick={() => navigate('/select-advisor')}
                >
                    Work on Behalf of Advisor →
                </button>
            </div>
        </>
    );
}
