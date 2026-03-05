import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { DataEntryPage } from '../pages/wizard/DataEntryPage';
import { FederatedWrapper, FederatedWrapperProps } from './FederatedWrapper';
import type { ClientField } from '../types/client.types';
import { Routes, Route } from 'react-router-dom';

export interface ClientUpdateProps extends Omit<FederatedWrapperProps, 'children'> {
    fieldToEdit: ClientField;
}

function ClientUpdateInner({ fieldToEdit }: { fieldToEdit: ClientField }) {
    const navigate = useNavigate();
    const { client, selectField } = useClientContext();

    useEffect(() => {
        if (client && fieldToEdit) {
            selectField(fieldToEdit);
            navigate(`/client/edit/${fieldToEdit}`, { replace: true });
        }
    }, [client, fieldToEdit, selectField, navigate]);

    return (
        <Routes>
            <Route path="/client/edit/:field" element={<DataEntryPage />} />
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
