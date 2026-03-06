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
import type { ClientField } from '../types/client.types';

export interface ClientUpdateProps extends Omit<FederatedWrapperProps, 'children'> {
    fieldToEdit: ClientField;
    onComplete?: OnCompleteCallback;
}

function ClientUpdateInner({ fieldToEdit }: { fieldToEdit: ClientField }) {
    const navigate = useNavigate();
    const { client, selectField } = useClientContext();
    const hasClient = !!client;
    const initialNav = useRef(false);

    useEffect(() => {
        if (hasClient && fieldToEdit && !initialNav.current) {
            initialNav.current = true;
            selectField(fieldToEdit);
            navigate(`/client/edit/${fieldToEdit}`, { replace: true });
        }
    }, [hasClient, fieldToEdit, selectField, navigate]);

    return (
        <Routes>
            <Route path="/" element={null} />
            {wizardRoutes()}
        </Routes>
    );
}

export function ClientUpdateComponent({ fieldToEdit, ...rest }: ClientUpdateProps) {
    return (
        <FederatedWrapper {...rest}>
            <ClientUpdateInner fieldToEdit={fieldToEdit} />
        </FederatedWrapper>
    );
}

export default ClientUpdateComponent;
