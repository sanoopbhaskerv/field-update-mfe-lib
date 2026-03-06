/**
 * Application entry point.
 *
 * Mounts the standalone React app with StrictMode and BrowserRouter.
 * In federated mode, the host uses {@link FederatedWrapper} instead.
 */
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
