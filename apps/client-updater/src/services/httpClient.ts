/**
 * Shared Axios instance for all service calls.
 *
 * Reads configuration from environment (12-factor):
 *  - `VITE_API_BASE_URL` — backend base URL (defaults to `/api`)
 *  - `VITE_CONSUMER_ID` — identifies this application to downstream services
 */
import axios from 'axios';

const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    headers: {
        'X-Consumer-Id': import.meta.env.VITE_CONSUMER_ID ?? 'client-updater',
    },
});

export default httpClient;
