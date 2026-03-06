import { useEffect, useState } from 'react';
import { AppRouter } from './AppRouter';
import { AppHeader } from '../components/header/AppHeader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ClientProvider, useClientContext } from '../context/ClientContext';
import { signOnService } from '../services/clientService';

/**
 * AppBootstrap — calls getSignOn() once on mount to resolve the user role.
 * Must be inside ClientProvider so it can write to context.
 */
function AppBootstrap() {
  const { setRole } = useClientContext();
  const [initialising, setInitialising] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    signOnService
      .getSignOn()
      .then((info) => setRole(info.role, info.userId, info.displayName))
      .catch(() => setBootError('Unable to verify your session. Please refresh or contact support.'))
      .finally(() => setInitialising(false));
  }, [setRole]);

  if (initialising) {
    return (
      <div className="centered-state centered-state--page">
        <div className="spinner" />
        <p className="page-subtitle">Verifying session…</p>
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="centered-state centered-state--page">
        <div className="card card--narrow">
          <div className="alert alert-error">{bootError}</div>
        </div>
      </div>
    );
  }

  return <AppRouter />;
}

/**
 * App shell — wraps everything in ClientProvider so the header and
 * all routes share the same context.
 *
 * SSO protection is enforced at the infrastructure/URL level.
 */
export function App() {
  return (
    <ErrorBoundary>
      <ClientProvider>
        <div className="app-shell">
          <AppHeader />
          <main>
            <AppBootstrap />
          </main>
        </div>
      </ClientProvider>
    </ErrorBoundary>
  );
}

export default App;
