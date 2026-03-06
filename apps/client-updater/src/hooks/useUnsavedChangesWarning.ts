import { useEffect } from 'react';

/**
 * Shows a native browser "Leave site?" confirmation dialog when the
 * user tries to close the tab, refresh, or navigate away via browser
 * controls while there are unsaved changes.
 *
 * @param hasUnsavedChanges - Whether the prompt should be active.
 *
 * Notes:
 * - Modern browsers ignore custom messages and show their own generic prompt.
 * - This only covers browser-level navigation (close, refresh, back).
 *   In-app React Router navigation is not blocked (the wizard has its
 *   own Cancel / Back buttons for that).
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);
}
