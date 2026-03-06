import { render, screen, fireEvent } from '@testing-library/react';
import { DataEntryPage } from './DataEntryPage';
import { useClientContext } from '../../context/ClientContext';
import { vi } from 'vitest';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

vi.mock('../../context/ClientContext', () => ({
  useClientContext: vi.fn(),
}));

vi.mock('../../components/StepIndicator', () => ({
  StepIndicator: () => <div data-testid="step-indicator" />,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  Navigate: vi.fn(() => null),
}));

const mockClient = {
  clientId: 'test',
  clientContext: '',
  clientNameDetails: {
    firstName: 'Alice',
    lastName: 'Johnson',
    middleName: '',
  },
  emails: [
    {
      emailAddress: 'old@test.com',
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
      addressLine1: '123 Fake St',
      addressLine2: '',
      addressLine3: '',
      city: 'Springfield',
      stateCode: 'IL',
      postalCode: '62701',
      countryName: 'US',
      countryCode: 'US',
      addressType: 'Primary',
    },
  ],
};

describe('DataEntryPage', () => {
  const mockNavigate = vi.fn();
  const mockSetPendingUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  it('should redirect if no client is in context', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'name',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: null,
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/', replace: true }),
      undefined,
    );
  });

  it('should render sub-field inputs for the name section', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'name',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);
    expect(screen.getByText(/Edit Name/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter first name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter last name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter middle name')).toBeTruthy();
  });

  it('should render sub-field inputs for an email section with index', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'email',
      index: '0',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);
    expect(screen.getByPlaceholderText('Enter email address')).toBeTruthy();
  });

  it('should navigate to /client on generic cancel', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'name',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/client');
  });

  it('should disable submit button when no changes made', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'name',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);
    const submitBtn = screen.getByText('Review Changes →');

    // Initially disabled — form values match old values
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);

    // Change first name
    const firstNameInput = screen.getByPlaceholderText('Enter first name');
    fireEvent.change(firstNameInput, { target: { value: 'Bob' } });

    expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('should stage update and navigate on submit', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'email',
      index: '0',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);

    const input = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(input, { target: { value: 'new@test.com' } });

    fireEvent.click(screen.getByText('Review Changes →'));

    expect(mockSetPendingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        section: 'email',
        index: 0,
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/client/verify');
  });

  it('should restore form values from pendingUpdate when navigating back', () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      section: 'name',
    });
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      pendingUpdate: {
        section: 'name',
        index: undefined,
        oldValue: { firstName: 'Alice', lastName: 'Johnson', middleName: '' },
        newValue: { firstName: 'Bob', lastName: 'Johnson', middleName: '' },
      },
      setPendingUpdate: mockSetPendingUpdate,
    });

    render(<DataEntryPage />);

    // Form should be pre-filled with the pending newValue, not the original
    const firstNameInput = screen.getByPlaceholderText(
      'Enter first name',
    ) as HTMLInputElement;
    expect(firstNameInput.value).toBe('Bob');
  });
});
