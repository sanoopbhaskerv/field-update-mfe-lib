import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { DataEntryPage } from '../pages/wizard/DataEntryPage';
import { VerifyPage } from '../pages/wizard/VerifyPage';
import { ConfirmationPage } from '../pages/wizard/ConfirmationPage';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { FederatedWrapper, FederatedWrapperProps } from './FederatedWrapper';
import type { OnCompleteCallback } from './FederatedWrapper';
import type { ClientField } from '../types/client.types';
import { Routes, Route, Navigate } from 'react-router-dom';

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
            <Route path="/client" element={<ClientDetailPage />} />
            <Route path="/client/edit/:field" element={<DataEntryPage />} />
            <Route path="/client/verify" element={<VerifyPage />} />
            <Route path="/client/confirmation" element={<ConfirmationPage />} />
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
