import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services';
import type { ClientSearchResult } from '../../types/client.types';
import { useClientContext } from '../../context/ClientContext';

export function NameSearchView() {
    const navigate = useNavigate();
    const {
        userRole,
        effectiveAdvisorId,
        signedOnName,
        setClient,
        setLoading,
        setError,
        isLoading,
        error,
    } = useClientContext();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ClientSearchResult[]>([]);
    const [searched, setSearched] = useState(false);

    const isSupportStaff = userRole === 'support_staff';

    const handleNameSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !effectiveAdvisorId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await clientService.searchClientsForAdvisor(effectiveAdvisorId, query.trim());
            setResults(data);
            setSearched(true);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectResult = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const profile = await clientService.getClientById(id);
            if (profile) {
                setClient(profile);
                navigate('/client');
            } else {
                setError('Client not found.');
            }
        } catch {
            setError('Failed to load client. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="page-title--lg">Find a Client</h1>
            <p className="page-subtitle page-subtitle--md">
                {isSupportStaff
                    ? 'Search clients by name or email.'
                    : `Welcome, ${signedOnName}. Search your clients by name or email.`}
            </p>

            <form onSubmit={handleNameSearch}>
                <div className="form-group">
                    <label className="form-label" htmlFor="search-input">Search by Name / Email</label>
                    <div className="search-row">
                        <input
                            id="search-input"
                            className="form-input"
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setSearched(false); setResults([]); }}
                            placeholder="e.g. Alice Johnson or alice@example.com"
                            autoFocus
                            disabled={isLoading}
                        />
                        <button className="btn btn-primary flex-shrink-0" type="submit" disabled={isLoading || !query.trim()}>
                            {isLoading ? 'Searching…' : 'Search'}
                        </button>
                    </div>
                </div>
            </form>

            {error && <div className="alert alert-error alert--mt">{error}</div>}
            {isLoading && <div className="spinner" />}

            {!isLoading && searched && results.length === 0 && (
                <p className="no-results">
                    No clients found matching &quot;{query}&quot;.
                </p>
            )}

            {results.length > 0 && (
                <ul className="result-list">
                    {results.map((r) => (
                        <li key={r.id}>
                            <button
                                className="result-button"
                                onClick={() => handleSelectResult(r.id)}
                                disabled={isLoading}
                            >
                                <div className="result-button__name">{r.name}</div>
                                <div className="result-button__email">{r.email}</div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
