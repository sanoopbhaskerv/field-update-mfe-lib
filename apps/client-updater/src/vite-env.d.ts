/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL (defaults to `/api`). */
  readonly VITE_API_BASE_URL: string;
  /** Consumer ID sent in `X-Consumer-Id` header on every API call. */
  readonly VITE_CONSUMER_ID: string;
  /** Set to `'false'` to disable mock data and hit the real backend. */
  readonly VITE_USE_MOCKS: string;
  /** Mock user role for local development: `'advisor'` | `'support_staff'`. */
  readonly VITE_MOCK_ROLE: string;
  /** Set to `'true'` to skip artificial delays in mock services. */
  readonly VITE_SKIP_DELAYS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
