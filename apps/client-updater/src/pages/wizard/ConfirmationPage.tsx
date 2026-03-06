/**
 * ConfirmationPage — wizard step 3.
 *
 * Displays a success message with the updated value.
 * Offers two actions: "Edit Another Field" (returns to the detail page)
 * or "All Done" (fires `onComplete` in federated mode, or resets
 * context and returns to search in standalone mode).
 */
import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../../context/ClientContext';
import { FIELD_LABELS } from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';
import { useOnComplete } from '../../federated/FederatedWrapper';

export function ConfirmationPage() {
    const navigate = useNavigate();
    const { client, pendingUpdate, reset } = useClientContext();
    const onComplete = useOnComplete();

    if (!client || !pendingUpdate) {
        return <Navigate to="/" replace />;
    }

    const { field, newValue } = pendingUpdate;
    const label = FIELD_LABELS[field] ?? field;

    const handleEditAnother = () => {
        onComplete?.({ action: 'edit-another', client, updatedField: field, newValue });
        // Keep client in context, clear wizard state — navigate back to detail
        navigate('/client');
    };

    const handleDone = () => {
        onComplete?.({ action: 'done', client, updatedField: field, newValue });
        // In federated mode, let the host handle post-completion.
        // In standalone mode, reset state and go to search.
        if (!onComplete) {
            reset();
            navigate('/');
        }
    };

    return (
        <div className="page-container">
            <StepIndicator currentStep={3} />

            <div className="card card--mt card--center">
                <div className="success-icon">
                    ✓
                </div>

                <h2 className="page-title">Update Successful!</h2>
                <p className="confirmation-subtitle">
                    <strong className="text-body">{client.name}</strong>'s{' '}
                    <strong className="text-primary">{label}</strong> has been updated successfully.
                </p>

                <div className="summary-box">
                    <div className="summary-box__label">
                        {label}
                    </div>
                    <div className="summary-box__value">{newValue}</div>
                </div>

                <div className="button-bar button-bar--center">
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
