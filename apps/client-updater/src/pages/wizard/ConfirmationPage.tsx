import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../../context/ClientContext';
import { FIELD_LABELS } from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';

export function ConfirmationPage() {
    const navigate = useNavigate();
    const { client, pendingUpdate, reset } = useClientContext();

    if (!client || !pendingUpdate) {
        return <Navigate to="/" replace />;
    }

    const { field, newValue } = pendingUpdate;
    const label = FIELD_LABELS[field] ?? field;

    const handleEditAnother = () => {
        // Keep client in context, clear wizard state — navigate back to detail
        navigate('/client');
    };

    const handleDone = () => {
        reset();
        navigate('/');
    };

    return (
        <div className="page-container">
            <StepIndicator currentStep={3} />

            <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.12)',
                    border: '2px solid rgba(34,197,94,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    margin: '0 auto 1.5rem',
                }}>
                    ✓
                </div>

                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Update Successful!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem', maxWidth: 380, margin: '0 auto 1.75rem' }}>
                    <strong style={{ color: 'var(--color-text)' }}>{client.name}</strong>'s{' '}
                    <strong style={{ color: 'var(--color-primary)' }}>{label}</strong> has been updated successfully.
                </p>

                <div style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    marginBottom: '2rem',
                }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: '1rem', color: '#86efac', fontWeight: 600 }}>{newValue}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={handleEditAnother}>
                        Edit Another Field
                    </button>
                    <button className="btn btn-primary" onClick={handleDone}>
                        All Done
                    </button>
                </div>
            </div>
        </div>
    );
}
