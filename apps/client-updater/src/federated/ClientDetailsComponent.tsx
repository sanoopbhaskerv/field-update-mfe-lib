import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { FederatedWrapper, FederatedWrapperProps } from './FederatedWrapper';

function ClientDetailsInner() {
    const navigate = useNavigate();
    const { client } = useClientContext();

    useEffect(() => {
        if (client) {
            navigate('/client', { replace: true });
        }
    }, [client, navigate]);

    return <ClientDetailPage />;
}

export function ClientDetailsComponent(props: Omit<FederatedWrapperProps, 'children'>) {
    return (
        <FederatedWrapper {...props}>
            <ClientDetailsInner />
        </FederatedWrapper>
    );
}

export default ClientDetailsComponent;
