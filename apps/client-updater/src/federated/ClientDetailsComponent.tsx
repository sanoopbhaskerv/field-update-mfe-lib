import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { DataEntryPage } from '../pages/wizard/DataEntryPage';
import { VerifyPage } from '../pages/wizard/VerifyPage';
import { ConfirmationPage } from '../pages/wizard/ConfirmationPage';
import { FederatedWrapper, FederatedWrapperProps } from './FederatedWrapper';
import type { OnCompleteCallback } from './FederatedWrapper';

function ClientDetailsInner() {
    const navigate = useNavigate();
    const location = useLocation();
    const { client } = useClientContext();
    const hasClient = !!client;
    const initialNav = useRef(false);

    useEffect(() => {
        if (hasClient && !initialNav.current) {
            initialNav.current = true;
            if (location.pathname === '/') {
                navigate('/client', { replace: true });
            }
        }
    }, [hasClient, navigate, location.pathname]);

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

export function ClientDetailsComponent(props: Omit<FederatedWrapperProps, 'children'> & { onComplete?: OnCompleteCallback }) {
    return (
        <FederatedWrapper {...props}>
            <ClientDetailsInner />
        </FederatedWrapper>
    );
}

export default ClientDetailsComponent;
