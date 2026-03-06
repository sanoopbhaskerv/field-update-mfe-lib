import React, { Suspense } from 'react';

// Using Vite Module Federation to load the remote components
const ClientDetailsFederated = React.lazy(
  () => import('client_updater/ClientDetails'),
);
const ClientUpdateFederated = React.lazy(
  () => import('client_updater/ClientUpdate'),
);

export function App() {
  const handleComplete = (event: {
    action: string;
    client: Record<string, unknown>;
    updatedSection?: string;
    updatedIndex?: number;
    newValue?: Record<string, string>;
  }) => {
    console.log('[Host] Federated component completed:', event);
    const name = (
      event.client as {
        clientNameDetails?: { firstName?: string; lastName?: string };
      }
    ).clientNameDetails
      ? `${(event.client as { clientNameDetails: { firstName: string; lastName: string } }).clientNameDetails.firstName} ${(event.client as { clientNameDetails: { firstName: string; lastName: string } }).clientNameDetails.lastName}`
      : 'Unknown';
    alert(
      `Action: ${event.action}\nClient: ${name}\nSection: ${event.updatedSection ?? '—'}\nNew Value: ${JSON.stringify(event.newValue) ?? '—'}`,
    );
  };

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '2rem' }}>
      <h1>Demo Host App (Module Federation)</h1>
      <p>
        This is a separate application that pulls in remote components from
        `client-updater`.
      </p>

      <Suspense
        fallback={
          <div style={{ padding: '2rem' }}>
            Loading remote components from client_updater...
          </div>
        }
      >
        <div
          style={{
            border: '2px dashed #007bff',
            padding: '1rem',
            margin: '1rem 0',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Remote: Client Details</h2>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            Props: <code>clientId="c-1"</code>,{' '}
            <code>oboAdvisorId="adv-1"</code>
          </p>
          <div
            style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <ClientDetailsFederated
              clientId="c-1"
              oboAdvisorId="adv-1"
              onComplete={handleComplete}
            />
          </div>
        </div>

        <div
          style={{
            border: '2px dashed #28a745',
            padding: '1rem',
            margin: '1rem 0',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Remote: Client Update (Email #0)</h2>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            Props: <code>clientId="c-1"</code>,{' '}
            <code>oboAdvisorId="adv-1"</code>,{' '}
            <code>sectionToEdit="email"</code>, <code>indexToEdit=0</code>
          </p>
          <div
            style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <ClientUpdateFederated
              clientId="c-1"
              oboAdvisorId="adv-1"
              sectionToEdit="email"
              indexToEdit={0}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default App;
