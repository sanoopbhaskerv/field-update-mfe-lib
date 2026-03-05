import { Routes, Route, Navigate } from 'react-router-dom';
import { SearchPage } from '../pages/SearchPage';
import { SelectAdvisorPage } from '../pages/SelectAdvisorPage';
import { DeeplinkPage } from '../pages/DeeplinkPage';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { DataEntryPage } from '../pages/wizard/DataEntryPage';
import { VerifyPage } from '../pages/wizard/VerifyPage';
import { ConfirmationPage } from '../pages/wizard/ConfirmationPage';

/**
 * Route structure — no client IDs in any URL (P1 privacy requirement).
 *
 *   /                    → SearchPage (role-aware: advisor=name search, staff=client ID or select advisor)
 *   /select-advisor      → SelectAdvisorPage (support_staff only — pick advisor to act on behalf of)
 *   /update/:contextId   → DeeplinkPage (contextId resolves to advisorId and/or clientId)
 *   /client              → ClientDetailPage + field picker
 *   /client/edit/:field  → Step 1: Data Entry
 *   /client/verify       → Step 2: Verify
 *   /client/confirmation → Step 3: Confirmation
 */
export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/select-advisor" element={<SelectAdvisorPage />} />
            <Route path="/update/:contextId" element={<DeeplinkPage />} />
            <Route path="/client" element={<ClientDetailPage />} />
            <Route path="/client/edit/:field" element={<DataEntryPage />} />
            <Route path="/client/verify" element={<VerifyPage />} />
            <Route path="/client/confirmation" element={<ConfirmationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
