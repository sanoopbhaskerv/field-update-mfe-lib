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
  clientService: { updateClientSection: vi.fn() },
}));

vi.mock('../../components/StepIndicator', () => ({
  StepIndicator: () => <div data-testid="step-indicator" />,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  Navigate: vi.fn(() => null),
}));

const mockClient = {
  clientId: 'c-1',
  clientContext: '',
  clientNameDetails: { firstName: 'John', lastName: 'Doe', middleName: '' },
  emails: [
    {
      emailAddress: 'john@test.com',
      emailType: 'Personal',
      emailStatusCode: 'ACTIVE',
    },
  ],
  telephone: [
    {
      countryCode: '+1',
      areaCode: '555',
      nonNANNumber: '1234',
      phoneType: 'Personal',
    },
  ],
  postalAddress: [
    {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      stateCode: '',
      postalCode: '',
      countryName: '',
      countryCode: '',
      addressType: 'Primary',
    },
  ],
};

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
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/', replace: true }),
      undefined,
    );
  });

  it('should render old vs new sub-field values', () => {
    const oldValue = { firstName: 'John', lastName: 'Doe', middleName: '' };
    const newValue = {
      firstName: 'Johnathan',
      lastName: 'Doe',
      middleName: '',
    };

    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: { section: 'name', oldValue, newValue },
      setClient: mockSetClient,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    });

    render(<VerifyPage />);

    expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('John')).toBeTruthy();
    expect(screen.getByText('Johnathan')).toBeTruthy();
  });

  it('should handle "(not set)" for empty previous sub-field value', () => {
    const oldValue = {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      stateCode: '',
      postalCode: '',
      countryName: '',
      countryCode: '',
      addressType: 'Primary',
    };
    const newValue = {
      ...oldValue,
      addressLine1: '123 Fake St',
      city: 'Springfield',
    };

    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: { section: 'address', index: 0, oldValue, newValue },
      setClient: mockSetClient,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    });

    render(<VerifyPage />);

    expect(screen.getAllByText('(not set)').length).toBeGreaterThan(0);
    expect(screen.getByText('123 Fake St')).toBeTruthy();
  });

  it('should navigate back on back button click', () => {
    const oldValue = { firstName: 'John', lastName: 'Doe', middleName: '' };
    const newValue = {
      firstName: 'Johnathan',
      lastName: 'Doe',
      middleName: '',
    };

    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: { section: 'name', oldValue, newValue },
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
    const oldValue = { firstName: 'John', lastName: 'Doe', middleName: '' };
    const newValue = {
      firstName: 'Johnathan',
      lastName: 'Doe',
      middleName: '',
    };

    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: { section: 'name', oldValue, newValue },
      setClient: mockSetClient,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    });

    (
      clientService.updateClientSection as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ success: true });

    render(<VerifyPage />);

    fireEvent.click(screen.getByText('Confirm & Save'));

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(clientService.updateClientSection).toHaveBeenCalledWith(
      'c-1',
      'name',
      newValue,
      undefined,
    );

    await waitFor(() => {
      expect(mockSetClient).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/client/confirmation');
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should display error if success is false', async () => {
    const oldValue = { firstName: 'John', lastName: 'Doe', middleName: '' };
    const newValue = {
      firstName: 'Johnathan',
      lastName: 'Doe',
      middleName: '',
    };

    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: { section: 'name', oldValue, newValue },
      setClient: mockSetClient,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    });

    (
      clientService.updateClientSection as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ success: false });

    render(<VerifyPage />);
    fireEvent.click(screen.getByText('Confirm & Save'));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(
        'Update failed. Please try again.',
      );
    });
  });

  it('should display error if API call rejects', async () => {
    const oldValue = { firstName: 'John', lastName: 'Doe', middleName: '' };
    const newValue = {
      firstName: 'Johnathan',
      lastName: 'Doe',
      middleName: '',
    };

    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: { section: 'name', oldValue, newValue },
      setClient: mockSetClient,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    });

    (
      clientService.updateClientSection as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('crash'));

    render(<VerifyPage />);
    fireEvent.click(screen.getByText('Confirm & Save'));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
      );
    });
  });
});
