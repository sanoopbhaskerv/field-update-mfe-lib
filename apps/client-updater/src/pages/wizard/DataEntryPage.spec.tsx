import { render, screen, fireEvent } from '@testing-library/react';
import { DataEntryPage } from './DataEntryPage';
import { useClientContext } from '../../context/ClientContext';
import { vi } from 'vitest';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

vi.mock('../../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

vi.mock('../../components/StepIndicator', () => ({
    StepIndicator: () => <div data-testid="step-indicator" />
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useParams: vi.fn(),
    Navigate: vi.fn(() => null),
}));

describe('DataEntryPage', () => {
    const mockNavigate = vi.fn();
    const mockSetPendingUpdate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    });

    it('should redirect if no client is in context', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ field: 'name' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: null,
            setPendingUpdate: mockSetPendingUpdate,
        });

        render(<DataEntryPage />);
        expect(Navigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/', replace: true }), undefined);
    });

    it('should render standard input for single-line fields', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ field: 'name' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: 'test', name: 'Old Name' },
            setPendingUpdate: mockSetPendingUpdate,
        });

        render(<DataEntryPage />);
        expect(screen.getByText(/Edit Full Name/i)).toBeTruthy();
        expect(screen.getAllByText('Old Name')[0]).toBeTruthy(); // current value display
        expect(screen.getByPlaceholderText('Enter full name')).toBeTruthy(); // input placeholder
        // ensure it's a normal input type text
        expect(screen.getByPlaceholderText('Enter full name').tagName).toBe('INPUT');
    });

    it('should render textarea for address', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ field: 'address' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: 'test', name: 'Bob', address: 'Old Addr' },
            setPendingUpdate: mockSetPendingUpdate,
        });

        render(<DataEntryPage />);
        expect(screen.getByPlaceholderText('Enter full address').tagName).toBe('TEXTAREA');
    });

    it('should navigate to /client on generic cancel', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ field: 'name' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: 'test', name: 'Old Name' },
            setPendingUpdate: mockSetPendingUpdate,
        });

        render(<DataEntryPage />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockNavigate).toHaveBeenCalledWith('/client');
    });

    it('should disable submit button if empty or unchanged', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ field: 'name' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: 'test', name: 'Old Name' },
            setPendingUpdate: mockSetPendingUpdate,
        });

        render(<DataEntryPage />);
        const submitBtn = screen.getByText('Review Changes →');

        // Initially disabled because it's empty
        expect((submitBtn as HTMLButtonElement).disabled).toBe(true);

        // Type the SAME value
        const input = screen.getByPlaceholderText('Enter full name');
        fireEvent.change(input, { target: { value: 'Old Name' } });
        fireEvent.blur(input); // trigger touch check

        expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
        expect(screen.getByText('New value is the same as the current value.')).toBeTruthy();

        // Empty value check
        fireEvent.change(input, { target: { value: '  ' } });
        fireEvent.blur(input);

        expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
        expect(screen.getByText('Please enter a value.')).toBeTruthy();

        // Valid new value
        fireEvent.change(input, { target: { value: 'New Name' } });
        expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
        expect(screen.queryByText('Please enter a value.')).toBeNull();
    });

    it('should stage update and navigate on submit', () => {
        (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ field: 'email' });
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: 'test', name: 'Bob', email: 'old@test.com' },
            setPendingUpdate: mockSetPendingUpdate,
        });

        render(<DataEntryPage />);

        const input = screen.getByPlaceholderText('Enter email address');
        fireEvent.change(input, { target: { value: ' new@test.com ' } }); // Tests trim

        fireEvent.click(screen.getByText('Review Changes →'));

        expect(mockSetPendingUpdate).toHaveBeenCalledWith({
            field: 'email',
            oldValue: 'old@test.com',
            newValue: 'new@test.com'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/client/verify');
    });
});
