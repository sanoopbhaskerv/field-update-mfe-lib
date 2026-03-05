import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerifyPage } from './VerifyPage';
import { useClientContext } from '../../context/ClientContext';
import { clientService } from '../../services/clientService';
import { vi } from 'vitest';
import { useNavigate, Navigate } from 'react-router-dom';

vi.mock('../../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

vi.mock('../../services/clientService', () => ({
    clientService: { updateClientField: vi.fn() }
}));

vi.mock('../../components/StepIndicator', () => ({
    StepIndicator: () => <div data-testid="step-indicator" />
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    Navigate: vi.fn(() => null),
}));

describe('VerifyPage', () => {
    const mockNavigate = vi.fn();
    const mockSetClient = vi.fn();
    const mockSetLoading = vi.fn();
    const mockSetError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    });

    it('should redirect if context missing', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: null,
            pendingUpdate: null,
        });
        render(<VerifyPage />);
        expect(Navigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/', replace: true }), undefined);
    });

    it('should render old vs new values', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'John' },
            pendingUpdate: { field: 'name', oldValue: 'John', newValue: 'Johnathan' },
            setClient: mockSetClient,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });

        render(<VerifyPage />);

        expect(screen.getByText('Full Name')).toBeTruthy();
        expect(screen.getByText('John')).toBeTruthy(); // Old value
        expect(screen.getByText('Johnathan')).toBeTruthy(); // New value
    });

    it('should handle "(not set)" for empty previous value', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'John', address: '' },
            pendingUpdate: { field: 'address', oldValue: '', newValue: '123 Fake St' },
            setClient: mockSetClient,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });

        render(<VerifyPage />);

        expect(screen.getByText('(not set)')).toBeTruthy();
        expect(screen.getByText('123 Fake St')).toBeTruthy();
    });

    it('should navigate back on back button click', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'John' },
            pendingUpdate: { field: 'name', oldValue: 'John', newValue: 'Johnathan' },
            setClient: mockSetClient,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });

        render(<VerifyPage />);
        fireEvent.click(screen.getByText('← Back'));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should perform api call and succeed', async () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: 'c-1', name: 'John' },
            pendingUpdate: { field: 'name', oldValue: 'John', newValue: 'Johnathan' },
            setClient: mockSetClient,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });

        (clientService.updateClientField as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

        render(<VerifyPage />);

        fireEvent.click(screen.getByText('Confirm & Save'));

        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(clientService.updateClientField).toHaveBeenCalledWith('c-1', 'name', 'Johnathan');

        await waitFor(() => {
            // Check optimistic update
            expect(mockSetClient).toHaveBeenCalledWith({ id: 'c-1', name: 'Johnathan' });
            expect(mockNavigate).toHaveBeenCalledWith('/client/confirmation');
            expect(mockSetLoading).toHaveBeenCalledWith(false);
        });
    });

    it('should display error if success is false', async () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'John' },
            pendingUpdate: { field: 'name', oldValue: 'John', newValue: 'Johnathan' },
            setClient: mockSetClient,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });

        (clientService.updateClientField as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });

        render(<VerifyPage />);
        fireEvent.click(screen.getByText('Confirm & Save'));

        await waitFor(() => {
            expect(mockSetError).toHaveBeenCalledWith('Update failed. Please try again.');
        });
    });

    it('should display error if API call rejects', async () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'John' },
            pendingUpdate: { field: 'name', oldValue: 'John', newValue: 'Johnathan' },
            setClient: mockSetClient,
            setLoading: mockSetLoading,
            setError: mockSetError,
            isLoading: false,
            error: null,
        });

        (clientService.updateClientField as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('crash'));

        render(<VerifyPage />);
        fireEvent.click(screen.getByText('Confirm & Save'));

        await waitFor(() => {
            expect(mockSetError).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
        });
    });
});
