import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { SearchPage } from '../pages/SearchPage';

const SelectAdvisorPage = lazy(() =>
  import('../pages/SelectAdvisorPage').then((m) => ({
    default: m.SelectAdvisorPage,
  })),
);
const DeeplinkPage = lazy(() =>
  import('../pages/DeeplinkPage').then((m) => ({ default: m.DeeplinkPage })),
);
const ClientDetailPage = lazy(() =>
  import('../pages/ClientDetailPage').then((m) => ({
    default: m.ClientDetailPage,
  })),
);
const DataEntryPage = lazy(() =>
  import('../pages/wizard/DataEntryPage').then((m) => ({
    default: m.DataEntryPage,
  })),
);
const VerifyPage = lazy(() =>
  import('../pages/wizard/VerifyPage').then((m) => ({ default: m.VerifyPage })),
);
const ConfirmationPage = lazy(() =>
  import('../pages/wizard/ConfirmationPage').then((m) => ({
    default: m.ConfirmationPage,
  })),
);

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
    <Suspense
      fallback={
        <div className="centered-state centered-state--page">
          <Spinner message="Loading…" />
        </div>
      }
    >
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
    </Suspense>
  );
}
