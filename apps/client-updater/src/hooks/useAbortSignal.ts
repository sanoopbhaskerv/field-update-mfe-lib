import { useEffect, useRef, useCallback } from 'react';

/**
 * Returns an `AbortController` that is automatically aborted when the
 * component unmounts.
 *
 * Call `getSignal()` before each request to get a fresh signal. The
 * previous signal is cancelled automatically.
 *
 * ```tsx
 * const { getSignal } = useAbortController();
 * useEffect(() => {
 *     const signal = getSignal();
 *     httpClient.get(`/clients/${clientId}`, { signal });
 * }, [clientId, getSignal]);
 * ```
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback((): AbortSignal => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { getSignal };
}
