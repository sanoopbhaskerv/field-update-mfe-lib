import { useEffect, useState } from 'react';
import { AppRouter } from './AppRouter';
import { AppHeader } from '../components/AppHeader';
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (initialising) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Verifying session…</p>
      </div>
    );
  }

  if (bootError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
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
    <ClientProvider>
      <div className="app-shell">
        <AppHeader />
        <main>
          <AppBootstrap />
        </main>
      </div>
    </ClientProvider>
  );
}

export default App;
