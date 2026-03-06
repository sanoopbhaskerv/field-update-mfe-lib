import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useClientContext } from '../../context/ClientContext';
import type { ClientField } from '../../types/client.types';
import { FIELD_LABELS } from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';
import { useOnComplete, useIsFederated } from '../../federated/FederatedWrapper';

function inputType(field: ClientField): string {
    if (field === 'email') return 'email';
    if (field === 'dob') return 'date';
    if (field === 'phone') return 'tel';
    return 'text';
}

function placeholder(field: ClientField): string {
    const map: Record<ClientField, string> = {
        name: 'Enter full name',
        dob: '',
        email: 'Enter email address',
        phone: '+1 (555) 000-0000',
        address: 'Enter full address',
    };
    return map[field];
}

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

    const oldValue = client[activeField] ?? '';
    const label = FIELD_LABELS[activeField] ?? activeField;
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

            <div className="card" style={{ marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Edit {label}</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                    Enter the new value for <strong style={{ color: 'var(--color-text)' }}>{client.name}</strong>.
                </p>

                <div className="form-group">
                    <label className="form-label" htmlFor="current-val">Current Value</label>
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.95rem',
                    }}>
                        {oldValue || '(not set)'}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="new-val">New Value</label>
                    {isMultiline ? (
                        <textarea
                            id="new-val"
                            className="form-input"
                            rows={3}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder={placeholder(activeField)}
                            autoFocus
                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    ) : (
                        <input
                            id="new-val"
                            className="form-input"
                            type={inputType(activeField)}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder={placeholder(activeField)}
                            autoFocus
                        />
                    )}
                    <div style={{ minHeight: '1.25rem', marginTop: '0.25rem' }}>
                        {showError && <span className="form-error" style={{ display: 'block' }}>Please enter a value.</span>}
                        {touched && newValue.trim() === oldValue && newValue.trim().length > 0 && (
                            <span className="form-error" style={{ display: 'block' }}>New value is the same as the current value.</span>
                        )}
                    </div>
                </div>

                <hr className="divider" />

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
