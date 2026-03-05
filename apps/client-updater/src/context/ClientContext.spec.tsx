import { renderHook, act } from '@testing-library/react';
import { ClientProvider, useClientContext } from './ClientContext';
import type { ReactNode } from 'react';
import type { ClientProfile, AdvisorProfile } from '../types/client.types';

describe('ClientContext', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <ClientProvider>{children}</ClientProvider>
    );

    it('should throw error if used outside provider', () => {
        // Suppress console.error for testing the thrown error boundary
        const originalError = console.error;
        console.error = vi.fn();
        expect(() => renderHook(() => useClientContext())).toThrow('useClientContext must be used within a <ClientProvider>');
        console.error = originalError;
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        expect(result.current.userRole).toBeNull();
        expect(result.current.signedOnUserId).toBeNull();
        expect(result.current.activeAdvisor).toBeNull();
        expect(result.current.effectiveAdvisorId).toBeNull();
        expect(result.current.client).toBeNull();
        expect(result.current.selectedField).toBeNull();
        expect(result.current.pendingUpdate).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should set role for advisor and set effective advisor ID', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        act(() => {
            result.current.setRole('advisor', 'adv-1', 'Sarah');
        });
        expect(result.current.userRole).toBe('advisor');
        expect(result.current.effectiveAdvisorId).toBe('adv-1');
    });

    it('should set role for support_staff and NOT set effective advisor ID initially', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        act(() => {
            result.current.setRole('support_staff', 'staff-1', 'Admin');
        });
        expect(result.current.userRole).toBe('support_staff');
        expect(result.current.effectiveAdvisorId).toBeNull();
    });

    it('should set active advisor for support staff and update effective advisor ID', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        act(() => {
            result.current.setRole('support_staff', 'staff-1', 'Admin');
        });

        const advisor: AdvisorProfile = { id: 'adv-2', name: 'James' };
        act(() => {
            result.current.setAdvisor(advisor);
        });

        expect(result.current.activeAdvisor).toEqual(advisor);
        expect(result.current.effectiveAdvisorId).toBe('adv-2');
    });

    it('should clear active advisor and reset effective ID for support staff', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        act(() => {
            result.current.setRole('support_staff', 'staff-1', 'Admin');
            result.current.setAdvisor({ id: 'adv-2', name: 'James' });
        });

        act(() => {
            result.current.setAdvisor(null);
        });
        expect(result.current.activeAdvisor).toBeNull();
        expect(result.current.effectiveAdvisorId).toBeNull();
    });

    it('should clear active advisor and fallback to own ID if role is advisor', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        act(() => {
            result.current.setRole('advisor', 'adv-1', 'Sarah');
            result.current.setAdvisor(null);
        });
        expect(result.current.activeAdvisor).toBeNull();
        expect(result.current.effectiveAdvisorId).toBe('adv-1');
    });

    it('should set and reset client state correctly', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        const mockClient: ClientProfile = { id: '1', name: 'Test', dob: '', email: '', phone: '', address: '' };

        act(() => {
            result.current.setClient(mockClient);
        });
        expect(result.current.client).toEqual(mockClient);

        // Advisor change should reset client
        act(() => {
            result.current.setAdvisor({ id: 'a', name: 'a' });
        });
        expect(result.current.client).toBeNull();
    });

    it('should handle wizard flow state (selectField, pendingUpdate, reset)', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });

        // Setup initial identity
        act(() => {
            result.current.setRole('advisor', 'adv-1', 'Sarah');
            result.current.setClient({ id: '1', name: 'Test', dob: '', email: '', phone: '', address: '' });
        });

        act(() => {
            result.current.selectField('name');
        });
        expect(result.current.selectedField).toBe('name');

        act(() => {
            result.current.setPendingUpdate({ field: 'name', oldValue: 'Test', newValue: 'New Test' });
        });
        expect(result.current.pendingUpdate).toBeDefined();

        act(() => {
            result.current.reset();
        });

        // Wizard state should be cleared
        expect(result.current.client).toBeNull();
        expect(result.current.selectedField).toBeNull();
        expect(result.current.pendingUpdate).toBeNull();

        // Identity state should be preserved!
        expect(result.current.userRole).toBe('advisor');
        expect(result.current.effectiveAdvisorId).toBe('adv-1');
    });

    it('should handle loading and error states', () => {
        const { result } = renderHook(() => useClientContext(), { wrapper });
        act(() => {
            result.current.setLoading(true);
        });
        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.setError('failed');
        });
        expect(result.current.error).toBe('failed');
        expect(result.current.isLoading).toBe(false); // setError clears loading
    });
});
