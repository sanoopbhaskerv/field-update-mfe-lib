import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationPage } from './ConfirmationPage';
import { useClientContext } from '../../context/ClientContext';
import { vi } from 'vitest';
import { useNavigate, Navigate } from 'react-router-dom';

vi.mock('../../context/ClientContext', () => ({
    useClientContext: vi.fn(),
}));

vi.mock('../../components/StepIndicator', () => ({
    StepIndicator: () => <div data-testid="step-indicator" />
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    Navigate: vi.fn(() => null),
}));

describe('ConfirmationPage', () => {
    const mockNavigate = vi.fn();
    const mockReset = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    });

    it('should redirect if context missing', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: null,
            pendingUpdate: null,
        });
        render(<ConfirmationPage />);
        expect(Navigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/', replace: true }), undefined);
    });

    it('should render success message and new value', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'Test User' },
            pendingUpdate: { field: 'phone', oldValue: '123', newValue: '+123456789' },
            reset: mockReset,
        });

        render(<ConfirmationPage />);

        expect(screen.getByText('Update Successful!')).toBeTruthy();
        expect(screen.getByText('+123456789')).toBeTruthy(); // verify new value is shown
        expect(screen.getByText('Test User')).toBeTruthy();
        expect(screen.getAllByText('Phone Number', { exact: false })[0]).toBeTruthy();
    });

    it('should clear wizard state and keep client identity when picking Edit Another', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'Test User' },
            pendingUpdate: { field: 'phone', oldValue: '123', newValue: '+123456789' },
            reset: mockReset,
        });

        render(<ConfirmationPage />);
        fireEvent.click(screen.getByText('Edit Another Field'));

        expect(mockNavigate).toHaveBeenCalledWith('/client');
        // It does not call reset, keeping context alive
        expect(mockReset).not.toHaveBeenCalled();
    });

    it('should reset totally and navigate to home when All Done', () => {
        (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            client: { id: '1', name: 'Test User' },
            pendingUpdate: { field: 'phone', oldValue: '123', newValue: '+123456789' },
            reset: mockReset,
        });

        render(<ConfirmationPage />);
        fireEvent.click(screen.getByText('All Done'));

        expect(mockReset).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
