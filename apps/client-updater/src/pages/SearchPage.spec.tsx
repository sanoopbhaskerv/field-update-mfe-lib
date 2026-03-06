import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchPage } from './SearchPage';
import { useClientContext } from '../context/ClientContext';
import { clientService } from '../services';
import { vi } from 'vitest';
import { useNavigate } from 'react-router-dom';

vi.mock('../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

vi.mock('../services', () => ({
    clientService: {
        searchClientsForAdvisor: vi.fn(),
        getClientById: vi.fn(),
    }
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('SearchPage', () => {
    const mockNavigate = vi.fn();
    const mockSetClient = vi.fn();
    const mockSetLoading = vi.fn();
    const mockSetError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    });

    describe('Advisor handling', () => {
        it('should render name search for advisor role', () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'advisor',
                effectiveAdvisorId: 'adv-1',
                signedOnName: 'Sarah',
            });

            render(<SearchPage />);
            expect(screen.getByText(/Welcome, Sarah/)).toBeTruthy();
            expect(screen.getByPlaceholderText(/e.g. Alice Johnson/)).toBeTruthy();
        });

        it('should perform name search and display results', async () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'advisor',
                effectiveAdvisorId: 'adv-1',
                signedOnName: 'Sarah',
                setLoading: mockSetLoading,
                setError: mockSetError,
            });

            (clientService.searchClientsForAdvisor as ReturnType<typeof vi.fn>).mockResolvedValue([
                { id: '1', name: 'John Doe', email: 'john@example.com' }
            ]);

            render(<SearchPage />);
            const input = screen.getByPlaceholderText(/e.g. Alice/);
            fireEvent.change(input, { target: { value: 'John' } });
            fireEvent.click(screen.getByText('Search'));

            expect(mockSetLoading).toHaveBeenCalledWith(true);
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeTruthy();
            });
        });

        it('should handle search errors gracefully', async () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'advisor',
                effectiveAdvisorId: 'adv-1',
                setLoading: mockSetLoading,
                setError: mockSetError,
            });

            (clientService.searchClientsForAdvisor as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

            render(<SearchPage />);
            const input = screen.getByPlaceholderText(/e.g. Alice/);
            fireEvent.change(input, { target: { value: 'John' } });
            fireEvent.click(screen.getByText('Search'));

            await waitFor(() => {
                expect(mockSetError).toHaveBeenCalledWith('Search failed. Please try again.');
            });
        });

        it('should handle empty search results', async () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'advisor',
                effectiveAdvisorId: 'adv-1',
                setLoading: mockSetLoading,
                setError: mockSetError,
            });

            (clientService.searchClientsForAdvisor as ReturnType<typeof vi.fn>).mockResolvedValue([]);

            render(<SearchPage />);
            const input = screen.getByPlaceholderText(/e.g. Alice/);
            fireEvent.change(input, { target: { value: 'Nobody' } });
            fireEvent.click(screen.getByText('Search'));

            await waitFor(() => {
                expect(screen.getByText(/No clients found matching "Nobody"/)).toBeTruthy();
            });
        });

        it('should load client details when clicking a result', async () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'advisor',
                effectiveAdvisorId: 'adv-1',
                setLoading: mockSetLoading,
                setError: mockSetError,
                setClient: mockSetClient,
            });

            (clientService.searchClientsForAdvisor as ReturnType<typeof vi.fn>).mockResolvedValue([
                { id: '1', name: 'John Doe', email: 'john@example.com' }
            ]);

            (clientService.getClientById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: '1', name: 'John Doe', email: '', dob: '', phone: '', address: '' });

            render(<SearchPage />);

            // Perform search
            fireEvent.change(screen.getByPlaceholderText(/e.g. Alice/), { target: { value: 'John' } });
            fireEvent.click(screen.getByText('Search'));

            // Click result
            await waitFor(() => {
                const btn = screen.getByText('John Doe');
                fireEvent.click(btn);
            });

            await waitFor(() => {
                expect(mockSetClient).toHaveBeenCalledWith(expect.objectContaining({ name: 'John Doe' }));
                expect(mockNavigate).toHaveBeenCalledWith('/client');
            });
        });
    });

    describe('Support Staff handling', () => {
        it('should render client ID lookup for support staff without active advisor', () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'support_staff',
                effectiveAdvisorId: null,
            });

            render(<SearchPage />);
            expect(screen.getByText('Client Lookup')).toBeTruthy();
            expect(screen.getByPlaceholderText('e.g. c-1')).toBeTruthy();
            expect(screen.getByText('Work on Behalf of Advisor →')).toBeTruthy();
        });

        it('should perform client ID lookup successfully', async () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'support_staff',
                effectiveAdvisorId: null,
                setLoading: mockSetLoading,
                setError: mockSetError,
                setClient: mockSetClient,
            });

            (clientService.getClientById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'c-1', name: 'Test' });

            render(<SearchPage />);
            fireEvent.change(screen.getByPlaceholderText('e.g. c-1'), { target: { value: 'c-1' } });
            fireEvent.click(screen.getByText('Find'));

            await waitFor(() => {
                expect(mockSetClient).toHaveBeenCalledWith(expect.objectContaining({ id: 'c-1' }));
                expect(mockNavigate).toHaveBeenCalledWith('/client');
            });
        });

        it('should show error if client ID lookup fails', async () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'support_staff',
                effectiveAdvisorId: null,
                setLoading: mockSetLoading,
                setError: mockSetError,
                setClient: mockSetClient,
            });

            (clientService.getClientById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            render(<SearchPage />);
            fireEvent.change(screen.getByPlaceholderText('e.g. c-1'), { target: { value: 'unknown' } });
            fireEvent.click(screen.getByText('Find'));

            await waitFor(() => {
                expect(mockSetError).toHaveBeenCalledWith('No client found with ID "unknown".');
            });
        });

        it('should navigate to select-advisor on button click', () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'support_staff',
                effectiveAdvisorId: null,
            });

            render(<SearchPage />);
            fireEvent.click(screen.getByText('Work on Behalf of Advisor →'));
            expect(mockNavigate).toHaveBeenCalledWith('/select-advisor');
        });

        it('should render name search for support staff WITH active advisor', () => {
            (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                userRole: 'support_staff',
                effectiveAdvisorId: 'adv-2',
            });

            render(<SearchPage />);
            expect(screen.getByText('Find a Client')).toBeTruthy();
            expect(screen.getByPlaceholderText(/e.g. Alice Johnson/)).toBeTruthy();
        });
    });
});
