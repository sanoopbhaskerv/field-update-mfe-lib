/**
 * ClientDetailPage — displays a client's profile sections with inline
 * "Edit" buttons that launch the three-step update wizard.
 *
 * In standalone mode a "Back to Search" link is shown; in federated
 * mode the back button is hidden because navigation is owned by the host.
 */
import { useNavigate, Navigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import type { ClientSection } from '../types/client.types';
import {
  EDITABLE_SECTIONS,
  SECTION_CONFIG,
  getDisplayName,
  formatSectionValue,
  getSectionValue,
} from '../types/client.types';
import { useIsFederated } from '../federated/FederatedWrapper';

export function ClientDetailPage() {
  const navigate = useNavigate();
  const { client, selectSection } = useClientContext();
  const isFederated = useIsFederated();

  if (!client) {
    return <Navigate to="/" replace />;
  }

  const handleEdit = (section: ClientSection, index?: number) => {
    selectSection(section, index);
    const path =
      index !== undefined
        ? `/client/edit/${section}/${index}`
        : `/client/edit/${section}`;
    navigate(path);
  };

  const displayName = getDisplayName(client);

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
          <h1 className="page-title">{displayName}</h1>
          <p className="page-subtitle">
            Review profile and select a section to update
          </p>
        </div>

        <p className="section-label">Select a section to update</p>

        <div className="field-list">
          {EDITABLE_SECTIONS.map((section) => {
            const meta = SECTION_CONFIG[section];

            if (!meta.isArray) {
              const value = getSectionValue(client, section);
              return (
                <div key={section} className="field-row">
                  <div className="field-row__content">
                    <div className="field-row__label">{meta.label}</div>
                    <div className="field-row__value">
                      {formatSectionValue(section, value)}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn--sm"
                    onClick={() => handleEdit(section)}
                  >
                    Edit
                  </button>
                </div>
              );
            }

            // Array sections (emails, telephone, postalAddress)
            const items =
              section === 'email'
                ? client.emails
                : section === 'phone'
                  ? client.telephone
                  : client.postalAddress;

            return items.map((item, idx) => (
              <div key={`${section}-${idx}`} className="field-row">
                <div className="field-row__content">
                  <div className="field-row__label">
                    {meta.label}
                    {items.length > 1 ? ` ${idx + 1}` : ''}
                  </div>
                  <div className="field-row__value">
                    {formatSectionValue(section, item)}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn--sm"
                  onClick={() => handleEdit(section, idx)}
                >
                  Edit
                </button>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
