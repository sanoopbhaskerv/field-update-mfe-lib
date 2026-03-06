/**
 * Shared Axios instance for all service calls.
 *
 * Reads configuration from environment (12-factor):
 *  - `VITE_API_BASE_URL` — backend base URL (defaults to `/api`)
 *  - `VITE_CONSUMER_ID` — identifies this application to downstream services
 *
 * Includes response-error interceptor for consistent error handling and
 * dev-mode request logging.
 */
import axios from 'axios';
import type { AxiosError } from 'axios';
import { createLogger } from '../utils/logger';

const log = createLogger('http');

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'X-Consumer-Id': import.meta.env.VITE_CONSUMER_ID ?? 'client-updater',
  },
  timeout: 30_000,
});

// ── Request interceptor (dev logging) ─────────────────────────────────────────
httpClient.interceptors.request.use((config) => {
  log.debug(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// ── Response-error interceptor ────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (axios.isCancel(error)) {
      log.debug('Request cancelled', error.message);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? 'unknown';

    if (status === 401) {
      log.warn(`Unauthorized (401) – ${url}`);
    } else if (status === 403) {
      log.warn(`Forbidden (403) – ${url}`);
    } else if (status && status >= 500) {
      log.error(`Server error (${status}) – ${url}`);
    } else {
      log.error(`Request failed – ${url}`, error.message);
    }

    return Promise.reject(error);
  },
);

export default httpClient;
