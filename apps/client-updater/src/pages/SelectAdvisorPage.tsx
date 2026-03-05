import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { advisorService } from '../services/clientService';
import { useClientContext } from '../context/ClientContext';

/**
 * SelectAdvisorPage — support staff only.
 * Support staff enters an advisor ID to act on their behalf.
 * After selecting, they are redirected to the search page where
 * client name search becomes available (scoped to that advisor).
 */
export function SelectAdvisorPage() {
    const navigate = useNavigate();
    const { setAdvisor } = useClientContext();
    const [advisorId, setAdvisorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!advisorId.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const advisor = await advisorService.getAdvisorById(advisorId.trim());
            if (advisor) {
                setAdvisor(advisor);
                navigate('/', { replace: true });
            } else {
                setError(`No advisor found with ID "${advisorId.trim()}". Please check and try again.`);
            }
        } catch {
            setError('Failed to look up advisor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <button
                className="btn btn-ghost"
                onClick={() => navigate('/')}
                style={{ marginBottom: '1rem', paddingLeft: 0 }}
            >
                ← Back to Search
            </button>

            <div className="card">
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Work on Behalf of Advisor</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
                    Enter the advisor's ID to search and update clients within their book of business.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="advisor-id-input">Advisor ID</label>
                        <input
                            id="advisor-id-input"
                            className="form-input"
                            type="text"
                            value={advisorId}
                            onChange={(e) => { setAdvisorId(e.target.value); setError(null); }}
                            placeholder="e.g. adv-1"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !advisorId.trim()}
                        >
                            {loading ? 'Looking up…' : 'Select Advisor'}
                        </button>
                    </div>
                </form>

                <hr className="divider" />

                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
                        💡 Demo advisor IDs
                    </strong>
                    <code style={{ background: 'var(--color-surface-2)', padding: '0.15rem 0.4rem', borderRadius: 4, marginRight: 8 }}>adv-1</code> Sarah Thompson
                    <br />
                    <code style={{ background: 'var(--color-surface-2)', padding: '0.15rem 0.4rem', borderRadius: 4, marginRight: 8, marginTop: '0.3rem', display: 'inline-block' }}>adv-2</code> James Carter
                </div>
            </div>
        </div>
    );
}
