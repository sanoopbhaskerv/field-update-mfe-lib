import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * Generic error boundary that catches render-time exceptions.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Custom message</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    override state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }
    override componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    override render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="centered-state centered-state--page">
                        <div className="card card--narrow">
                            <div className="alert alert-error">
                                Something went wrong. Please refresh the page or contact support.
                            </div>
                        </div>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
