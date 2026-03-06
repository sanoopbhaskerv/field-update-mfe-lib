/**
 * ClientDetailPage — displays a client's profile fields with inline
 * "Edit" buttons that launch the three-step update wizard.
 *
 * In standalone mode a "Back to Search" link is shown; in federated
 * mode the back button is hidden because navigation is owned by the host.
 */
import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import type { ClientField } from '../types/client.types';
import { FIELD_LABELS, EDITABLE_FIELDS } from '../types/client.types';
import { useIsFederated } from '../federated/FederatedWrapper';

/** Format a client field value for display (e.g. ISO date → human-readable). */
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
    const isFederated = useIsFederated();

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
            {!isFederated && (
                <button
                    className="btn btn-ghost btn-back"
                    onClick={() => navigate('/')}
                >
                    ← Back to Search
                </button>
            )}

            <div className="card">
                <div className="card__heading">
                    <h1 className="page-title">
                        {client.name}
                    </h1>
                    <p className="page-subtitle">
                        Review profile and select a field to update
                    </p>
                </div>

                <p className="section-label">
                    Select a field to update
                </p>

                <div className="field-list">
                    {EDITABLE_FIELDS.map((field) => (
                        <div key={field} className="field-row">
                            <div className="field-row__content">
                                <div className="field-row__label">
                                    {FIELD_LABELS[field]}
                                </div>
                                <div className="field-row__value">
                                    {formatValue(field, client[field])}
                                </div>
                            </div>
                            <button
                                className="btn btn-secondary btn--sm"
                                onClick={() => handleEdit(field)}
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
