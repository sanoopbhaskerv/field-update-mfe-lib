/**
 * DataEntryPage — wizard step 1.
 *
 * Displays the current values of the selected section's sub-fields
 * and form inputs for the new values. Validates that at least one field
 * has changed before allowing the user to proceed.
 */
import { useState } from 'react';
import { useClientContext } from '../../context/ClientContext';
import type { ClientSection, SectionValue } from '../../types/client.types';
import {
  SECTION_CONFIG,
  getSectionValue,
  getDisplayName,
} from '../../types/client.types';
import { StepIndicator } from '../../components/StepIndicator';
import {
  useOnComplete,
  useIsFederated,
} from '../../federated/FederatedWrapper';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

export function DataEntryPage() {
  const { section, index: indexParam } = useParams<{
    section: ClientSection;
    index?: string;
  }>();
  const navigate = useNavigate();
  const { client, pendingUpdate, setPendingUpdate } = useClientContext();
  const onComplete = useOnComplete();
  const isFederated = useIsFederated();

  const activeSection = section as ClientSection;
  const activeIndex = indexParam !== undefined ? Number(indexParam) : undefined;
  const meta = SECTION_CONFIG[activeSection];
  const label = meta?.label ?? activeSection;

  const oldValue = client
    ? getSectionValue(client, activeSection, activeIndex)
    : undefined;

  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    // Restore previously-entered values when navigating back from VerifyPage
    if (
      pendingUpdate?.section === activeSection &&
      pendingUpdate.index === activeIndex
    ) {
      return {
        ...(pendingUpdate.newValue as unknown as Record<string, string>),
      };
    }
    if (!oldValue) return {};
    return { ...(oldValue as unknown as Record<string, string>) };
  });
  const [touched, setTouched] = useState(false);

  const hasChanges = oldValue
    ? meta?.fields.some(
        (f) =>
          (formValues[f.key] ?? '').trim() !==
          ((oldValue as unknown as Record<string, string>)[f.key] ?? '').trim(),
      )
    : false;

  useUnsavedChangesWarning(hasChanges);

  if (!client || !oldValue) {
    return <Navigate to="/" replace />;
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!hasChanges) return;
    const newValue = { ...formValues } as unknown as SectionValue;
    setPendingUpdate({
      section: activeSection,
      index: activeIndex,
      oldValue,
      newValue,
    });
    navigate('/client/verify');
  };

  return (
    <div className="page-container">
      <StepIndicator currentStep={1} />

      <div className="card card--mt">
        <h2 className="page-title">Edit {label}</h2>
        <p className="page-subtitle">
          Update the values for <strong>{getDisplayName(client)}</strong>.
        </p>

        {meta?.fields.map((field) => {
          const currentVal =
            (oldValue as unknown as Record<string, string>)[field.key] ?? '';
          return (
            <div className="form-group" key={field.key}>
              <label className="form-label" htmlFor={`field-${field.key}`}>
                {field.label}
              </label>
              <div className="current-value-hint">
                Current: {currentVal || '(not set)'}
              </div>
              <input
                id={`field-${field.key}`}
                className="form-input"
                type={field.inputType}
                value={formValues[field.key] ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={field.placeholder}
              />
            </div>
          );
        })}

        {touched && !hasChanges && (
          <div className="form-validation">
            <span className="form-error form-error--block">
              No changes detected. Modify at least one field.
            </span>
          </div>
        )}

        <hr className="divider" />

        <div className="button-bar">
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (isFederated) {
                onComplete?.({ action: 'cancel', client });
              } else {
                navigate('/client');
              }
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!hasChanges}
          >
            Review Changes →
          </button>
        </div>
      </div>
    </div>
  );
}
