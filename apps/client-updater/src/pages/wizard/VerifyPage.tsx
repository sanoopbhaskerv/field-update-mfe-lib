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

            <div className="card card--mt">
                <h2 className="page-title">Confirm Your Changes</h2>
                <p className="page-subtitle">
                    Please review the change before submitting.
                </p>

                {/* Diff summary */}
                <div className="diff-summary">
                    <div className="diff-summary__label">
                        {label}
                    </div>

                    <div className="diff-grid">
                        <div>
                            <div className="diff-column__label">
                                Current
                            </div>
                            <div className="diff-old">
                                {oldValue || '(not set)'}
                            </div>
                        </div>
                        <div>
                            <div className="diff-column__label">
                                New
                            </div>
                            <div className="diff-new">
                                {newValue}
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <hr className="divider" />

                <div className="button-bar">
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
