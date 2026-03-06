/**
 * Spinner — reusable loading indicator with optional message.
 *
 * Variants:
 * - `inline`  — spinner sits in document flow (default)
 * - `overlay` — full-parent translucent backdrop that blocks interaction
 */

export interface SpinnerProps {
    /** Optional loading message displayed below the spinner. */
    message?: string;
    /** `inline` (default) renders in flow; `overlay` fills the nearest positioned parent. */
    variant?: 'inline' | 'overlay';
    /** Additional CSS class names. */
    className?: string;
}

export function Spinner({ message, variant = 'inline', className }: SpinnerProps) {
    if (variant === 'overlay') {
        return (
            <div className={`spinner-overlay ${className ?? ''}`} role="status" aria-live="polite">
                <div className="spinner" />
                {message && <p className="spinner-message">{message}</p>}
            </div>
        );
    }

    return (
        <div className={`spinner-container ${className ?? ''}`} role="status" aria-live="polite">
            <div className="spinner" />
            {message && <p className="spinner-message">{message}</p>}
        </div>
    );
}
