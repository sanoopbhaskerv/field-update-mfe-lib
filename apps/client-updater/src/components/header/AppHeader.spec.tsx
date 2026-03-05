import { render } from '@testing-library/react';
import { AppHeader } from './AppHeader';
import { ClientProvider } from '../../context/ClientContext';
import { vi } from 'vitest';

// We just need to mock the child component to ensure AppHeader renders its shell
vi.mock('./AdvisorContextBar', () => ({
    AdvisorContextBar: () => <div data-testid="advisor-bar-mock" />,
}));

describe('AppHeader', () => {
    it('should render the app title and logo', () => {
        const { getByText } = render(
            <ClientProvider>
                <AppHeader />
            </ClientProvider>
        );

        expect(getByText('Client Updater')).toBeTruthy();
        expect(getByText('Secure Client Profile Management')).toBeTruthy();
    });

    it('should render the AdvisorContextBar', () => {
        const { getByTestId } = render(
            <ClientProvider>
                <AppHeader />
            </ClientProvider>
        );

        expect(getByTestId('advisor-bar-mock')).toBeTruthy();
    });
});
