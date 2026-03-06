import { useState } from 'react';
import { useClientContext } from '../../context/ClientContext';
import { advisorService } from '../../services/clientService';

/**
 * AdvisorContextBar — inline advisor selector rendered inside the app header.
 *
 * Single responsibility: allow support staff to select / clear an advisor context.
 *
 * • No advisor selected → inline advisor ID input + "Go" button
 * • Advisor selected    → advisor name + "Clear" button
 * • Not support_staff   → renders nothing
 */
export function AdvisorContextBar() {
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
        <div className={`advisor-bar${activeAdvisor ? ' advisor-bar--active' : ''}`}>
            <span className="advisor-bar__label">
                Acting on behalf of:
            </span>

            {activeAdvisor ? (
                <>
                    <strong className="advisor-bar__name">{activeAdvisor.name}</strong>
                    <span className="advisor-bar__separator">|</span>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="advisor-bar__clear"
                    >
                        Clear
                    </button>
                </>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="advisor-bar__form"
                >
                    <input
                        id="header-advisor-id"
                        type="text"
                        value={advisorId}
                        onChange={(e) => { setAdvisorId(e.target.value); setLookupError(null); }}
                        placeholder="Enter advisor ID (e.g. adv-1)"
                        disabled={loading}
                        className={`advisor-bar__input${lookupError ? ' advisor-bar__input--error' : ''}`}
                    />
                    <button
                        type="submit"
                        disabled={loading || !advisorId.trim()}
                        className="advisor-bar__submit"
                    >
                        {loading ? '…' : 'Go'}
                    </button>
                    {lookupError && (
                        <span className="advisor-bar__error">
                            {lookupError}
                        </span>
                    )}
                </form>
            )}
        </div>
    );
}
