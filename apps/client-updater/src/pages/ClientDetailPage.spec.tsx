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

const mockClient = {
  clientId: '1',
  clientContext: '',
  clientNameDetails: {
    firstName: 'Alice',
    lastName: 'Johnson',
    middleName: 'Marie',
  },
  emails: [
    {
      emailAddress: 'alice@example.com',
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

describe('ClientDetailPage', () => {
  const mockNavigate = vi.fn();
  const mockSelectSection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  it('should redirect to home if no client in context', () => {
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: null,
      selectSection: mockSelectSection,
    });

    render(<ClientDetailPage />);
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/', replace: true }),
      undefined,
    );
  });

  it('should render client details based on context', () => {
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      selectSection: mockSelectSection,
    });

    render(<ClientDetailPage />);

    expect(screen.getAllByText('Alice Marie Johnson')[0]).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('+1 555 1234')).toBeTruthy();
    expect(
      screen.getByText('123 Fake St, Springfield, IL, 62701'),
    ).toBeTruthy();
  });

  it('should navigate back to search on back button click', () => {
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      selectSection: mockSelectSection,
    });

    render(<ClientDetailPage />);

    fireEvent.click(screen.getByText('← Back to Search'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should select section and navigate to edit route on edit button click', () => {
    (useClientContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      client: mockClient,
      selectSection: mockSelectSection,
    });

    render(<ClientDetailPage />);

    // 4 edit buttons: name, email[0], phone[0], address[0]
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(4);

    // Click the second one (Email at index 0)
    fireEvent.click(editButtons[1]);

    expect(mockSelectSection).toHaveBeenCalledWith('email', 0);
    expect(mockNavigate).toHaveBeenCalledWith('/client/edit/email/0');
  });
});
