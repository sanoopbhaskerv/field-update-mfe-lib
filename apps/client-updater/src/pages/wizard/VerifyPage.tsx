import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../../context/ClientContext';
import { FIELD_LABELS } from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';
import { clientService } from '../../services/clientService';

export function VerifyPage() {
    const navigate = useNavigate();
    const { client, pendingUpdate, setClient, setLoading, setError, isLoading, error } =
        useClientContext();

    if (!client || !pendingUpdate) {
        return <Navigate to="/" replace />;
    }

    const { field, oldValue, newValue } = pendingUpdate;
    const label = FIELD_LABELS[field] ?? field;

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await clientService.updateClientField(client.id, field, newValue);
            if (result.success) {
                // Optimistically update context — client.id never goes into URL
                setClient({ ...client, [field]: newValue });
                navigate('/client/confirmation');
            } else {
                setError('Update failed. Please try again.');
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <StepIndicator currentStep={2} />

            <div className="card" style={{ marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Confirm Your Changes</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                    Please review the change before submitting.
                </p>

                {/* Diff summary */}
                <div style={{
                    background: 'var(--color-surface-2)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                }}>
                    <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        marginBottom: '1rem',
                    }}>
                        {label}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                                Current
                            </div>
                            <div style={{
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.6rem 0.85rem',
                                fontSize: '0.95rem',
                                textDecoration: 'line-through',
                                color: '#fca5a5',
                            }}>
                                {oldValue || '(not set)'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                                New
                            </div>
                            <div style={{
                                background: 'rgba(34,197,94,0.08)',
                                border: '1px solid rgba(34,197,94,0.2)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.6rem 0.85rem',
                                fontSize: '0.95rem',
                                color: '#86efac',
                                fontWeight: 600,
                            }}>
                                {newValue}
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <hr className="divider" />

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)} disabled={isLoading}>
                        ← Back
                    </button>
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Saving…' : 'Confirm & Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
