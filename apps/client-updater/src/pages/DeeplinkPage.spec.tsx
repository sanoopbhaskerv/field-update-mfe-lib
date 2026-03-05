import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DeeplinkPage } from './DeeplinkPage';
import { useClientContext } from '../context/ClientContext';
import { contextService, advisorService, clientService } from '../services/clientService';
import { vi } from 'vitest';
import { useNavigate, useParams } from 'react-router-dom';

vi.mock('../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

vi.mock('../services/clientService', () => ({
    contextService: { resolveContext: vi.fn() },
    advisorService: { getAdvisorById: vi.fn() },
    clientService: { getClientById: vi.fn() },
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useParams: vi.fn(),
}));

describe('DeeplinkPage', () => {
    const mockNavigate = vi.fn();
    const mockSetClient = vi.fn();
    const mockSetAdvisor = vi.fn();
    const mockSetLoading = vi.fn();
    const mockSetError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);

        // Base context mock
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: null,
            setClient: mockSetClient,
            setAdvisor: mockSetAdvisor,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });
    });

    it('should redirect back home if no contextId param', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});
        render(<DeeplinkPage />);
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should stay null if client is ALREADY loaded (back nav)', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'ctx' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1' }
        });
        const { container } = render(<DeeplinkPage />);
        expect(container.firstChild).toBeNull();
    });

    it('should handle context missing', async () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'unknown' });
        (contextService.resolveContext as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        render(<DeeplinkPage />);

        await waitFor(() => {
            expect(mockSetError).toHaveBeenCalledWith('Invalid or expired context. Please use a fresh link.');
        });
    });

    it('should handle context error', async () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'unknown' });
        (contextService.resolveContext as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

        render(<DeeplinkPage />);

        await waitFor(() => {
            expect(mockSetError).toHaveBeenCalledWith('Failed to resolve context. Please try again.');
        });
    });

    it('should resolve clientId + advisorId and navigate to /client', async () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'both' });
        (contextService.resolveContext as ReturnType<typeof vi.fn>).mockResolvedValue({
            clientId: 'c-1', advisorId: 'adv-1'
        });
        (advisorService.getAdvisorById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'adv-1' });
        (clientService.getClientById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'c-1' });

        render(<DeeplinkPage />);

        await waitFor(() => {
            expect(mockSetAdvisor).toHaveBeenCalledWith({ id: 'adv-1' });
            expect(mockSetClient).toHaveBeenCalledWith({ id: 'c-1' });
            expect(mockNavigate).toHaveBeenCalledWith('/client', { replace: true });
        });
    });

    it('should error if client lookup fails', async () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'missing-client' });
        (contextService.resolveContext as ReturnType<typeof vi.fn>).mockResolvedValue({
            clientId: 'unknown'
        });
        (clientService.getClientById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        render(<DeeplinkPage />);

        await waitFor(() => {
            expect(mockSetError).toHaveBeenCalledWith('Client not found in context. Please contact support.');
        });
    });

    it('should resolve advisorId only and navigate to / (search page)', async () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'adv-only' });
        (contextService.resolveContext as ReturnType<typeof vi.fn>).mockResolvedValue({
            advisorId: 'adv-1'
        });
        (advisorService.getAdvisorById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'adv-1' });

        render(<DeeplinkPage />);

        await waitFor(() => {
            expect(mockSetAdvisor).toHaveBeenCalledWith({ id: 'adv-1' });
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    it('should display loading state', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'ctx' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isLoading: true,
            error: null,
            setLoading: mockSetLoading,
            setError: mockSetError,
            setClient: mockSetClient,
            setAdvisor: mockSetAdvisor,
        });

        render(<DeeplinkPage />);
        expect(screen.getByText('Loading your context…')).toBeTruthy();
    });

    it('should display error state and back button', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ contextId: 'ctx' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            isLoading: false,
            error: 'Some specific error message',
            setLoading: mockSetLoading,
            setError: mockSetError,
            setClient: mockSetClient,
            setAdvisor: mockSetAdvisor,
        });

        render(<DeeplinkPage />);
        expect(screen.getByText('Some specific error message')).toBeTruthy();

        fireEvent.click(screen.getByText('← Back to Search'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
