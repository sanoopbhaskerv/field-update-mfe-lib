/**
 * DataEntryPage — wizard step 1.
 *
 * Displays the current value of the selected field and a form input
 * for the new value. Validates that the new value is non-empty and
 * differs from the current one before allowing the user to proceed.
 * In federated mode, "Cancel" fires the `onComplete` callback instead
 * of navigating back.
 */
import { useState } from 'react';
import { useClientContext } from '../../context/ClientContext';
import type { ClientField } from '../../types/client.types';
import { FIELD_CONFIG } from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';
import { useOnComplete, useIsFederated } from '../../federated/FederatedWrapper';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

export function DataEntryPage() {
    const { field } = useParams<{ field: ClientField }>();
    const navigate = useNavigate();
    const { client, setPendingUpdate } = useClientContext();
    const onComplete = useOnComplete();
    const isFederated = useIsFederated();

    const activeField = field as ClientField;
    const [newValue, setNewValue] = useState('');
    const [touched, setTouched] = useState(false);

    if (!client) {
        return <Navigate to="/" replace />;
    }

    const meta = FIELD_CONFIG[activeField];
    const oldValue = client[activeField] ?? '';
    const label = meta?.label ?? activeField;
    const isValid = newValue.trim().length > 0 && newValue.trim() !== oldValue;
    const showError = touched && !newValue.trim();

    const handleNext = () => {
        if (!isValid) return;
        setPendingUpdate({ field: activeField, oldValue, newValue: newValue.trim() });
        // No client ID in the URL
        navigate('/client/verify');
    };

    const isMultiline = activeField === 'address';

    return (
        <div className="page-container">
            <StepIndicator currentStep={1} />

            <div className="card card--mt">
                <h2 className="page-title">Edit {label}</h2>
                <p className="page-subtitle">
                    Enter the new value for <strong>{client.name}</strong>.
                </p>

                <div className="form-group">
                    <label className="form-label" htmlFor="current-val">Current Value</label>
                    <div className="current-value">
                        {oldValue || '(not set)'}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="new-val">New Value</label>
                    {isMultiline ? (
                        <textarea
                            id="new-val"
                            className="form-input form-input--multiline"
                            rows={3}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder={meta?.placeholder}
                            autoFocus
                        />
                    ) : (
                        <input
                            id="new-val"
                            className="form-input"
                            type={meta?.inputType ?? 'text'}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder={meta?.placeholder}
                            autoFocus
                        />
                    )}
                    <div className="form-validation">
                        {showError && <span className="form-error form-error--block">Please enter a value.</span>}
                        {touched && newValue.trim() === oldValue && newValue.trim().length > 0 && (
                            <span className="form-error form-error--block">New value is the same as the current value.</span>
                        )}
                    </div>
                </div>

                <hr className="divider" />

                <div className="button-bar">
                    <button className="btn btn-secondary" onClick={() => {
                        if (isFederated) {
                            onComplete?.({ action: 'cancel', client });
                        } else {
                            navigate('/client');
                        }
                    }}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleNext} disabled={!isValid}>
                        Review Changes →
                    </button>
                </div>
            </div>
        </div>
    );
}
