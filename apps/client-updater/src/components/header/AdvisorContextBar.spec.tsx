import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvisorContextBar } from './AdvisorContextBar';
import { useClientContext } from '../../context/ClientContext';
import { advisorService } from '../../services/clientService';
import { vi } from 'vitest';

// Mock the context hook
vi.mock('../../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

// Mock the API service
vi.mock('../../services/clientService', () => ({
    advisorService: {
        getAdvisorById: vi.fn(),
    },
}));

describe('AdvisorContextBar', () => {
    const mockSetAdvisor = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render nothing if userRole is not support_staff', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'advisor',
            activeAdvisor: null,
            setAdvisor: mockSetAdvisor,
        });

        const { container } = render(<AdvisorContextBar />);
        expect(container.firstChild).toBeNull();
    });

    it('should render input form when support_staff has no active advisor', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'support_staff',
            activeAdvisor: null,
            setAdvisor: mockSetAdvisor,
        });

        render(<AdvisorContextBar />);
        expect(screen.getByPlaceholderText('Enter advisor ID (e.g. adv-1)')).toBeTruthy();
        expect(screen.getByText('Go')).toBeTruthy();
        expect(screen.getByText('Acting on behalf of:')).toBeTruthy();
    });

    it('should render active advisor and clear button when advisor is set', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'support_staff',
            activeAdvisor: { id: 'adv-1', name: 'Sarah Thompson' },
            setAdvisor: mockSetAdvisor,
        });

        render(<AdvisorContextBar />);
        expect(screen.getByText('Sarah Thompson')).toBeTruthy();
        expect(screen.getByText('Clear')).toBeTruthy();
        expect(screen.queryByPlaceholderText('Enter advisor ID (e.g. adv-1)')).toBeNull();
    });

    it('should call setAdvisor with null when clear button is clicked', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'support_staff',
            activeAdvisor: { id: 'adv-1', name: 'Sarah Thompson' },
            setAdvisor: mockSetAdvisor,
        });

        render(<AdvisorContextBar />);
        fireEvent.click(screen.getByText('Clear'));
        expect(mockSetAdvisor).toHaveBeenCalledWith(null);
    });

    it('should submit form and set advisor on success', async () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'support_staff',
            activeAdvisor: null,
            setAdvisor: mockSetAdvisor,
        });

        (advisorService.getAdvisorById as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'adv-99', name: 'Test Advisor'
        });

        render(<AdvisorContextBar />);

        const input = screen.getByPlaceholderText('Enter advisor ID (e.g. adv-1)');
        fireEvent.change(input, { target: { value: 'adv-99' } });

        const button = screen.getByText('Go');
        fireEvent.click(button);

        expect(button.textContent).toBe('…'); // Loading state

        await waitFor(() => {
            expect(advisorService.getAdvisorById).toHaveBeenCalledWith('adv-99');
            expect(mockSetAdvisor).toHaveBeenCalledWith({ id: 'adv-99', name: 'Test Advisor' });
        });
    });

    it('should show error message if advisor not found', async () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'support_staff',
            activeAdvisor: null,
            setAdvisor: mockSetAdvisor,
        });

        (advisorService.getAdvisorById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        render(<AdvisorContextBar />);

        const input = screen.getByPlaceholderText('Enter advisor ID (e.g. adv-1)');
        fireEvent.change(input, { target: { value: 'invalid-id' } });
        fireEvent.click(screen.getByText('Go'));

        await waitFor(() => {
            expect(screen.getByText('No advisor found with ID "invalid-id"')).toBeTruthy();
        });
        expect(mockSetAdvisor).not.toHaveBeenCalled();
    });

    it('should clear error message when typing again', async () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            userRole: 'support_staff',
            activeAdvisor: null,
            setAdvisor: mockSetAdvisor,
        });

        (advisorService.getAdvisorById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        render(<AdvisorContextBar />);

        const input = screen.getByPlaceholderText('Enter advisor ID (e.g. adv-1)');

        // Trigger error
        fireEvent.change(input, { target: { value: 'invalid-id' } });
        fireEvent.click(screen.getByText('Go'));
        await waitFor(() => {
            expect(screen.getByText('No advisor found with ID "invalid-id"')).toBeTruthy();
        });

        // Type again to clear
        fireEvent.change(input, { target: { value: 'invalid' } });
        expect(screen.queryByText('No advisor found with ID "invalid-id"')).toBeNull();
    });
});
