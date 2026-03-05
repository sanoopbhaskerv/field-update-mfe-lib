import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../services/clientService';
import type { ClientSearchResult } from '../types/client.types';
import { useClientContext } from '../context/ClientContext';

/**
 * Role-aware SearchPage:
 *
 * ADVISOR role (effectiveAdvisorId = their own userId):
 *   → Name search scoped to their clients (via searchClientsForAdvisor)
 *
 * SUPPORT STAFF — no advisor selected (effectiveAdvisorId = null):
 *   → Client ID lookup only + "Work on behalf of Advisor" CTA
 *   (The header AdvisorContextBar prompts them to select an advisor)
 *
 * SUPPORT STAFF — advisor selected (effectiveAdvisorId = advisor.id):
 *   → Name search scoped to that advisor
 *   (Advisor identity shown in header, not repeated here)
 */
export function SearchPage() {
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

    const canSearchByName = effectiveAdvisorId !== null;
    const isSupportStaff = userRole === 'support_staff';

    // ── Name search (advisor-scoped) ──────────────────────────────────────────
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

    // ── Client ID lookup (support staff only, no advisor) ─────────────────────
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

    // ── Select from results ───────────────────────────────────────────────────
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
        <div className="page-container">
            <div className="card">
                {/* ── Header ── */}
                {canSearchByName ? (
                    <>
                        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Find a Client</h1>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
                            {isSupportStaff
                                ? 'Search clients by name or email.'
                                : `Welcome, ${signedOnName}. Search your clients by name or email.`}
                        </p>

                        <form onSubmit={handleNameSearch}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="search-input">Search by Name / Email</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                                    <button className="btn btn-primary" type="submit" disabled={isLoading || !query.trim()} style={{ flexShrink: 0 }}>
                                        {isLoading ? 'Searching…' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Client Lookup</h1>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
                            Enter the client's ID to access their profile, or work on behalf of an advisor to search by name.
                        </p>

                        <form onSubmit={handleClientIdLookup}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="client-id-input">Client ID</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                                    <button className="btn btn-primary" type="submit" disabled={isLoading || !query.trim()} style={{ flexShrink: 0 }}>
                                        {isLoading ? 'Loading…' : 'Find'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <hr className="divider" />

                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                                To search clients by name, select an advisor first.
                            </p>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/select-advisor')}
                                style={{ width: '100%' }}
                            >
                                Work on Behalf of Advisor →
                            </button>
                        </div>
                    </>
                )}

                {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
                {isLoading && <div className="spinner" />}

                {/* Name search results */}
                {canSearchByName && !isLoading && searched && results.length === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                        No clients found matching "{query}".
                    </p>
                )}

                {canSearchByName && results.length > 0 && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {results.map((r) => (
                            <li key={r.id}>
                                <button
                                    onClick={() => handleSelectResult(r.id)}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%', textAlign: 'left',
                                        background: 'var(--color-surface-2)',
                                        border: '1.5px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem 1.25rem', cursor: 'pointer',
                                        transition: 'border-color 0.2s, transform 0.15s',
                                        color: 'var(--color-text)', fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{r.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{r.email}</div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
