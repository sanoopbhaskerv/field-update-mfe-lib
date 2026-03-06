import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services';
import type { ClientSearchResult } from '../../types/client.types';
import { useClientContext } from '../../context/ClientContext';
import { Spinner } from '../../components/Spinner';

const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

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
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isSupportStaff = userRole === 'support_staff';

    const performSearch = useCallback(async (term: string) => {
        if (!effectiveAdvisorId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await clientService.searchClientsForAdvisor(effectiveAdvisorId, term);
            setResults(data);
            setSearched(true);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [effectiveAdvisorId, setLoading, setError]);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < MIN_CHARS) {
            setResults([]);
            setSearched(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            performSearch(trimmed);
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, performSearch]);

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

            <div className="form-group">
                <label className="form-label" htmlFor="search-input">Search by Name / Email</label>
                <input
                    id="search-input"
                    className="form-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Alice Johnson or alice@example.com"
                    autoFocus
                    disabled={isLoading}
                    aria-describedby="search-hint"
                />
                {query.trim().length > 0 && query.trim().length < MIN_CHARS && (
                    <p id="search-hint" className="typeahead-hint">
                        Type at least {MIN_CHARS} characters to search
                    </p>
                )}
            </div>

            {error && <div className="alert alert-error alert--mt">{error}</div>}
            {isLoading && <Spinner />}

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
