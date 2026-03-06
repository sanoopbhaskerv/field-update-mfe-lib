import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../../context/ClientContext';
import {
  SECTION_LABELS,
  SECTION_CONFIG,
  applySectionUpdate,
} from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';
import { Spinner } from '../../components/Spinner';
import { clientService } from '../../services/clientService';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';

export function VerifyPage() {
  const navigate = useNavigate();
  const {
    client,
    pendingUpdate,
    setClient,
    setLoading,
    setError,
    isLoading,
    error,
  } = useClientContext();

  useUnsavedChangesWarning(!!pendingUpdate);

  if (!client || !pendingUpdate) {
    return <Navigate to="/" replace />;
  }

  const { section, index, oldValue, newValue } = pendingUpdate;
  const label = SECTION_LABELS[section] ?? section;
  const fields = SECTION_CONFIG[section]?.fields ?? [];

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clientService.updateClientSection(
        client.clientId,
        section,
        newValue,
        index,
      );
      if (result.success) {
        setClient(applySectionUpdate(client, section, newValue, index));
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

      <div className="card card--mt" style={{ position: 'relative' }}>
        {isLoading && <Spinner variant="overlay" message="Saving changes…" />}
        <h2 className="page-title">Confirm Your Changes</h2>
        <p className="page-subtitle">
          Please review the changes to <strong>{label}</strong> before
          submitting.
        </p>

        <div className="diff-summary">
          <div className="diff-summary__label">{label}</div>

          {fields.map((f) => {
            const oldVal =
              (oldValue as unknown as Record<string, string>)[f.key] ?? '';
            const newVal =
              (newValue as unknown as Record<string, string>)[f.key] ?? '';
            const changed = oldVal !== newVal;
            return (
              <div
                key={f.key}
                className="diff-grid"
                style={{ opacity: changed ? 1 : 0.5 }}
              >
                <div className="diff-field-label">{f.label}</div>
                <div>
                  <div className="diff-column__label">Current</div>
                  <div className="diff-old">{oldVal || '(not set)'}</div>
                </div>
                <div>
                  <div className="diff-column__label">New</div>
                  <div className={changed ? 'diff-new' : 'diff-old'}>
                    {newVal || '(not set)'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <hr className="divider" />

        <div className="button-bar">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
