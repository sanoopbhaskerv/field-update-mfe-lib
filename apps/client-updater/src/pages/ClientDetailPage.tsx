import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import type { ClientField } from '../types/client.types';
import { FIELD_LABELS } from '../types/client.types';

const FIELDS: ClientField[] = ['name', 'dob', 'email', 'phone', 'address'];

function formatValue(field: ClientField, value: string): string {
    if (!value) return '—';
    if (field === 'dob') {
        try {
            return new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'long', year: 'numeric',
            });
        } catch { return value; }
    }
    return value;
}

export function ClientDetailPage() {
    const navigate = useNavigate();
    const { client, selectField } = useClientContext();

    // If client was lost (e.g. page refresh), send back to search
    if (!client) {
        return <Navigate to="/" replace />;
    }

    const handleEdit = (field: ClientField) => {
        selectField(field);
        // No client ID in the URL — identity stays in context
        navigate(`/client/edit/${field}`);
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
                <div style={{ marginBottom: '1.75rem' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                        {client.name}
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Review profile and select a field to update
                    </p>
                </div>

                <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    fontWeight: 600,
                    marginBottom: '1rem'
                }}>
                    Select a field to update
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {FIELDS.map((field) => (
                        <div
                            key={field}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--color-surface-2)',
                                border: '1.5px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1rem 1.25rem',
                                gap: '1rem',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '0.2rem'
                                }}>
                                    {FIELD_LABELS[field]}
                                </div>
                                <div style={{
                                    fontSize: '0.97rem',
                                    color: 'var(--color-text)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {formatValue(field, client[field])}
                                </div>
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleEdit(field)}
                                style={{ flexShrink: 0, fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
