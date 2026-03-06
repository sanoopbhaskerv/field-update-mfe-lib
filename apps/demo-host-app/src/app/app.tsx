import React, { Suspense } from 'react';

// Using Vite Module Federation to load the remote components
const ClientDetailsFederated = React.lazy(() => import('client_updater/ClientDetails'));
const ClientUpdateFederated = React.lazy(() => import('client_updater/ClientUpdate'));

export function App() {
  const handleComplete = (event: { action: string; client: { name: string }; updatedField: string; newValue: string }) => {
    console.log('[Host] Federated component completed:', event);
    alert(`Action: ${event.action}\nClient: ${event.client.name}\nField: ${event.updatedField}\nNew Value: ${event.newValue}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '2rem' }}>
      <h1>Demo Host App (Module Federation)</h1>
      <p>This is a separate application that pulls in remote components from `client-updater`.</p>

      <Suspense fallback={<div style={{ padding: '2rem' }}>Loading remote components from client_updater...</div>}>
        <div style={{ border: '2px dashed #007bff', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Remote: Client Details</h2>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>Props: <code>clientId="c-1"</code>, <code>oboAdvisorId="adv-1"</code></p>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <ClientDetailsFederated clientId="c-1" oboAdvisorId="adv-1" onComplete={handleComplete} />
          </div>
        </div>

        <div style={{ border: '2px dashed #28a745', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Remote: Client Update (Email)</h2>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>Props: <code>clientId="c-1"</code>, <code>oboAdvisorId="adv-1"</code>, <code>fieldToEdit="email"</code></p>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <ClientUpdateFederated clientId="c-1" oboAdvisorId="adv-1" fieldToEdit="email" onComplete={handleComplete} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default App;
