import { render, screen, fireEvent } from '@testing-library/react';
import { ClientDetailPage } from './ClientDetailPage';
import { useClientContext } from '../context/ClientContext';
import { vi } from 'vitest';
import { useNavigate, Navigate } from 'react-router-dom';

vi.mock('../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    Navigate: vi.fn(() => null),
}));

describe('ClientDetailPage', () => {
    const mockNavigate = vi.fn();
    const mockSelectField = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    });

    it('should redirect to home if no client in context', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: null,
            selectField: mockSelectField,
        });

        render(<ClientDetailPage />);
        expect(Navigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/', replace: true }), undefined);
    });

    it('should render client details based on context', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: {
                id: '1',
                name: 'Alice Johnson',
                dob: '1988-04-12',
                email: 'alice@example.com',
                phone: '+1 555-1234',
                address: '123 Fake St'
            },
            selectField: mockSelectField,
        });

        render(<ClientDetailPage />);

        expect(screen.getAllByText('Alice Johnson')[0]).toBeTruthy();
        expect(screen.getByText('alice@example.com')).toBeTruthy();
        expect(screen.getByText('+1 555-1234')).toBeTruthy();
        expect(screen.getByText('123 Fake St')).toBeTruthy();
        expect(screen.getByText('12 April 1988')).toBeTruthy(); // Checks date formatting
    });

    it('should handle missing or invalid dates gracefully', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: {
                id: '1',
                name: 'Alice Johnson',
                dob: 'invalid date', // Will fail formatting and fall back
                email: 'alice@example.com',
                phone: '', // Will fall back to '—'
                address: ''
            },
            selectField: mockSelectField,
        });

        render(<ClientDetailPage />);

        expect(screen.getByText(/invalid date/i)).toBeTruthy();
        const dashes = screen.getAllByText('—');
        expect(dashes.length).toBe(2); // Phone and Address
    });

    it('should navigate back to search on back button click', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'Test' },
            selectField: mockSelectField,
        });

        render(<ClientDetailPage />);

        fireEvent.click(screen.getByText('← Back to Search'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should select field and navigate to edit route on edit button click', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'Test', email: 'test@test.com' },
            selectField: mockSelectField,
        });

        render(<ClientDetailPage />);

        // Find all "Edit" buttons
        const editButtons = screen.getAllByText('Edit');
        expect(editButtons.length).toBe(5); // 5 fields

        // Click the third one (Email)
        fireEvent.click(editButtons[2]);

        expect(mockSelectField).toHaveBeenCalledWith('email');
        expect(mockNavigate).toHaveBeenCalledWith('/client/edit/email');
    });
});
