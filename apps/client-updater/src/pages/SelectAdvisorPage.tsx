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
                className="btn btn-ghost btn-back"
                onClick={() => navigate('/')}
            >
                ← Back to Search
            </button>

            <div className="card">
                <h1 className="page-title">Work on Behalf of Advisor</h1>
                <p className="page-subtitle page-subtitle--md">
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

                    <div className="button-bar" style={{ marginTop: '0.5rem' }}>
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

                <div className="demo-hint">
                    <strong className="demo-hint__title">
                        💡 Demo advisor IDs
                    </strong>
                    <code className="demo-hint__code">adv-1</code> Sarah Thompson
                    <br />
                    <code className="demo-hint__code demo-hint__code--block">adv-2</code> James Carter
                </div>
            </div>
        </div>
    );
}
