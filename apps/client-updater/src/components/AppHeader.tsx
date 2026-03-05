import { useState } from 'react';
import { useClientContext } from '../context/ClientContext';
import { advisorService } from '../services/clientService';

/**
 * AdvisorContextBar — inline advisor selector, only rendered for support_staff.
 *
 * • No advisor selected → inline advisor ID input + "Go" button
 * • Advisor selected    → shows advisor name + "Clear" button
 */
function AdvisorContextBar() {
    const { userRole, activeAdvisor, setAdvisor } = useClientContext();
    const [advisorId, setAdvisorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    if (userRole !== 'support_staff') return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!advisorId.trim()) return;
        setLoading(true);
        setLookupError(null);
        try {
            const advisor = await advisorService.getAdvisorById(advisorId.trim());
            if (advisor) {
                setAdvisor(advisor);
                setAdvisorId('');
            } else {
                setLookupError(`No advisor found with ID "${advisorId.trim()}"`);
            }
        } catch {
            setLookupError('Lookup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setAdvisor(null);
        setAdvisorId('');
        setLookupError(null);
    };

    return (
        <div style={{
            background: activeAdvisor ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.06)',
            borderBottom: activeAdvisor
                ? '1px solid rgba(99,102,241,0.25)'
                : '1px solid rgba(245,158,11,0.2)',
            padding: '0.45rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            minHeight: '2.5rem',
        }}>
            <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                Acting on behalf of:
            </span>

            {activeAdvisor ? (
                <>
                    <strong style={{ color: 'var(--color-primary)' }}>{activeAdvisor.name}</strong>
                    <span style={{ color: 'var(--color-border)' }}>|</span>
                    <button
                        type="button"
                        onClick={handleClear}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-text-muted)', fontSize: '0.78rem',
                            padding: '0.15rem 0.4rem', borderRadius: 4,
                            textDecoration: 'underline',
                        }}
                    >
                        Clear
                    </button>
                </>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                    <input
                        id="header-advisor-id"
                        type="text"
                        value={advisorId}
                        onChange={(e) => { setAdvisorId(e.target.value); setLookupError(null); }}
                        placeholder="Enter advisor ID (e.g. adv-1)"
                        disabled={loading}
                        style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: lookupError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '0.3rem 0.75rem',
                            color: 'var(--color-text)',
                            fontSize: '0.8rem',
                            width: '220px',
                            outline: 'none',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !advisorId.trim()}
                        style={{
                            background: 'var(--color-primary)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '0.78rem',
                            padding: '0.3rem 0.85rem',
                            cursor: advisorId.trim() && !loading ? 'pointer' : 'not-allowed',
                            opacity: advisorId.trim() && !loading ? 1 : 0.5,
                            flexShrink: 0,
                        }}
                    >
                        {loading ? '…' : 'Go'}
                    </button>
                    {lookupError && (
                        <span style={{ color: 'var(--color-error)', fontSize: '0.76rem' }}>
                            {lookupError}
                        </span>
                    )}
                </form>
            )}
        </div>
    );
}

/**
 * AppHeader — persistent top bar rendered on every page.
 *
 * Contains:
 *   1. Logo bar (always shown)
 *   2. AdvisorContextBar (support_staff only) — inline advisor ID lookup
 */
export function AppHeader() {
    return (
        <header>
            <div className="app-header">
                <span style={{ fontSize: '1.3rem' }}>🔷</span>
                <div>
                    <div className="app-header__logo">Client Updater</div>
                    <div className="app-header__subtitle">Secure Client Profile Management</div>
                </div>
            </div>
            <AdvisorContextBar />
        </header>
    );
}
