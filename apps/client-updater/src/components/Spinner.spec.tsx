import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
    it('renders inline variant by default', () => {
        const { container } = render(<Spinner />);
        expect(container.querySelector('.spinner-container')).toBeTruthy();
        expect(container.querySelector('.spinner')).toBeTruthy();
    });

    it('renders a message when provided', () => {
        render(<Spinner message="Loading…" />);
        expect(screen.getByText('Loading…')).toBeTruthy();
    });

    it('does not render a message when omitted', () => {
        const { container } = render(<Spinner />);
        expect(container.querySelector('.spinner-message')).toBeNull();
    });

    it('renders overlay variant', () => {
        const { container } = render(<Spinner variant="overlay" message="Saving…" />);
        expect(container.querySelector('.spinner-overlay')).toBeTruthy();
        expect(container.querySelector('.spinner-container')).toBeNull();
        expect(screen.getByText('Saving…')).toBeTruthy();
    });

    it('has role="status" and aria-live for accessibility', () => {
        render(<Spinner message="Loading…" />);
        const status = screen.getByRole('status');
        expect(status).toBeTruthy();
        expect(status.getAttribute('aria-live')).toBe('polite');
    });

    it('applies additional className', () => {
        const { container } = render(<Spinner className="custom" />);
        expect(container.querySelector('.spinner-container.custom')).toBeTruthy();
    });

    it('applies additional className on overlay variant', () => {
        const { container } = render(<Spinner variant="overlay" className="custom-overlay" />);
        expect(container.querySelector('.spinner-overlay.custom-overlay')).toBeTruthy();
    });
});
