/**
 * ClientUpdateComponent — federated entry point that jumps directly
 * into the edit wizard for a specific `fieldToEdit` on a given `clientId`.
 *
 * Automatically selects the field and navigates to the data entry step
 * once the client profile is loaded.
 */
import { useEffect, useRef } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { wizardRoutes } from '../routes/WizardRoutes';
import { FederatedWrapper, FederatedWrapperProps } from './FederatedWrapper';
import type { OnCompleteCallback } from './FederatedWrapper';
import type { ClientSection } from '../types/client.types';

export interface ClientUpdateProps
  extends Omit<FederatedWrapperProps, 'children'> {
  sectionToEdit: ClientSection;
  indexToEdit?: number;
  onComplete?: OnCompleteCallback;
}

function ClientUpdateInner({
  sectionToEdit,
  indexToEdit,
}: {
  sectionToEdit: ClientSection;
  indexToEdit?: number;
}) {
  const navigate = useNavigate();
  const { client, selectSection } = useClientContext();
  const hasClient = !!client;
  const initialNav = useRef(false);

  useEffect(() => {
    if (hasClient && sectionToEdit && !initialNav.current) {
      initialNav.current = true;
      selectSection(sectionToEdit, indexToEdit);
      const path =
        indexToEdit !== undefined
          ? `/client/edit/${sectionToEdit}/${indexToEdit}`
          : `/client/edit/${sectionToEdit}`;
      navigate(path, { replace: true });
    }
  }, [hasClient, sectionToEdit, indexToEdit, selectSection, navigate]);

  return (
    <Routes>
      <Route path="/" element={null} />
      {wizardRoutes()}
    </Routes>
  );
}

export function ClientUpdateComponent({
  sectionToEdit,
  indexToEdit,
  ...rest
}: ClientUpdateProps) {
  return (
    <FederatedWrapper {...rest}>
      <ClientUpdateInner
        sectionToEdit={sectionToEdit}
        indexToEdit={indexToEdit}
      />
    </FederatedWrapper>
  );
}

export default ClientUpdateComponent;
