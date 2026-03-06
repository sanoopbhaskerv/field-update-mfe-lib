/**
 * ClientDetailsComponent — federated entry point that displays the
 * client detail page and wizard routes for a given `clientId`.
 *
 * Automatically navigates to `/client` once the profile is loaded.
 */
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { wizardRoutes } from '../routes/WizardRoutes';
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
            {wizardRoutes()}
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
