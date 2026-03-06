import { Route } from 'react-router-dom';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { DataEntryPage } from '../pages/wizard/DataEntryPage';
import { VerifyPage } from '../pages/wizard/VerifyPage';
import { ConfirmationPage } from '../pages/wizard/ConfirmationPage';

/**
 * Shared wizard route definitions used by both standalone AppRouter
 * and federated entry points (ClientDetailsComponent, ClientUpdateComponent).
 *
 * Single source of truth — avoids duplicating route paths and page imports.
 */
export function wizardRoutes() {
    return [
        <Route key="detail" path="/client" element={<ClientDetailPage />} />,
        <Route key="edit" path="/client/edit/:field" element={<DataEntryPage />} />,
        <Route key="verify" path="/client/verify" element={<VerifyPage />} />,
        <Route key="confirm" path="/client/confirmation" element={<ConfirmationPage />} />,
    ];
}
