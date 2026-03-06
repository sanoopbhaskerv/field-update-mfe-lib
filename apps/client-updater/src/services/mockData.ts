import type {
  ClientProfile,
  AdvisorProfile,
  ContextResolution,
} from '../types/client.types';

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_CLIENTS: ClientProfile[] = [
  {
    clientId: 'c-1',
    clientContext: 'ctx-abc123',
    clientNameDetails: {
      firstName: 'Alice',
      lastName: 'Johnson',
      middleName: 'Marie',
    },
    emails: [
      {
        emailAddress: 'alice.johnson@example.com',
        emailType: 'Personal',
        emailStatusCode: 'ACTIVE',
      },
      {
        emailAddress: 'alice.j@work.com',
        emailType: 'Business',
        emailStatusCode: 'ACTIVE',
      },
    ],
    telephone: [
      {
        countryCode: '+1',
        areaCode: '555',
        nonNANNumber: '010-2345',
        phoneType: 'Personal',
      },
    ],
    postalAddress: [
      {
        addressLine1: '123 Maple Street',
        addressLine2: '',
        addressLine3: '',
        city: 'Springfield',
        stateCode: 'IL',
        postalCode: '62701',
        countryName: 'United States',
        countryCode: 'US',
        addressType: 'Primary',
      },
    ],
  },
  {
    clientId: 'c-2',
    clientContext: 'ctx-def456',
    clientNameDetails: {
      firstName: 'Bob',
      lastName: 'Williams',
      middleName: '',
    },
    emails: [
      {
        emailAddress: 'bob.w@example.com',
        emailType: 'Personal',
        emailStatusCode: 'ACTIVE',
      },
    ],
    telephone: [
      {
        countryCode: '+1',
        areaCode: '555',
        nonNANNumber: '987-6543',
        phoneType: 'Business',
      },
    ],
    postalAddress: [
      {
        addressLine1: '456 Oak Avenue',
        addressLine2: '',
        addressLine3: '',
        city: 'Portland',
        stateCode: 'OR',
        postalCode: '97201',
        countryName: 'United States',
        countryCode: 'US',
        addressType: 'Primary',
      },
    ],
  },
  {
    clientId: 'c-3',
    clientContext: '',
    clientNameDetails: {
      firstName: 'Carol',
      lastName: 'Martinez',
      middleName: 'Ann',
    },
    emails: [
      {
        emailAddress: 'carol.m@example.com',
        emailType: 'Personal',
        emailStatusCode: 'ACTIVE',
      },
    ],
    telephone: [
      {
        countryCode: '+1',
        areaCode: '555',
        nonNANNumber: '321-7890',
        phoneType: 'Personal',
      },
    ],
    postalAddress: [
      {
        addressLine1: '789 Pine Road',
        addressLine2: '',
        addressLine3: '',
        city: 'Austin',
        stateCode: 'TX',
        postalCode: '78701',
        countryName: 'United States',
        countryCode: 'US',
        addressType: 'Primary',
      },
    ],
  },
  {
    clientId: 'c-4',
    clientContext: '',
    clientNameDetails: { firstName: 'David', lastName: 'Lee', middleName: '' },
    emails: [
      {
        emailAddress: 'david.lee@example.com',
        emailType: 'Business',
        emailStatusCode: 'ACTIVE',
      },
    ],
    telephone: [
      {
        countryCode: '+1',
        areaCode: '555',
        nonNANNumber: '456-7890',
        phoneType: 'Business',
      },
    ],
    postalAddress: [
      {
        addressLine1: '101 Birch Blvd',
        addressLine2: '',
        addressLine3: '',
        city: 'Seattle',
        stateCode: 'WA',
        postalCode: '98101',
        countryName: 'United States',
        countryCode: 'US',
        addressType: 'Primary',
      },
    ],
  },
];

export const MOCK_ADVISORS: AdvisorProfile[] = [
  { id: 'adv-1', name: 'Sarah Thompson' },
  { id: 'adv-2', name: 'James Carter' },
];

export const ADVISOR_CLIENTS: Record<string, string[]> = {
  'adv-1': ['c-1', 'c-2'],
  'adv-2': ['c-3', 'c-4'],
};

export const MOCK_CONTEXT_MAP: Record<string, ContextResolution> = {
  'ctx-abc123': { clientId: 'c-1', advisorId: 'adv-1' },
  'ctx-def456': { clientId: 'c-2', advisorId: 'adv-1' },
  'ctx-advisor-only': { advisorId: 'adv-2' },
  'ctx-client-only': { clientId: 'c-3' },
};

// ─── Mock config ──────────────────────────────────────────────────────────────

/**
 * Determines the mock user role.
 *
 * Primary config: `VITE_MOCK_ROLE` env var (compile-time).
 * Runtime override: `localStorage.setItem('MOCK_ROLE', role)` — used by
 * Playwright E2E tests to switch roles between scenarios (see client-updater-e2e steps).
 */
export function getMockRole(): 'advisor' | 'support_staff' {
  try {
    const runtimeOverride = globalThis.localStorage?.getItem('MOCK_ROLE');
    if (runtimeOverride) return runtimeOverride as 'advisor' | 'support_staff';
  } catch {
    /* localStorage unavailable */
  }
  return (import.meta.env.VITE_MOCK_ROLE || 'advisor') as
    | 'advisor'
    | 'support_staff';
}

/**
 * Artificial delay for mock services.
 *
 * Skipped when:
 *  - `VITE_SKIP_DELAYS` env var is `'true'` (compile-time).
 *  - `MOCK_ROLE` is present in localStorage (runtime — set by Playwright E2E tests
 *    to avoid artificial timeouts).
 */
export function delay(ms: number): Promise<void> {
  if (import.meta.env.VITE_SKIP_DELAYS === 'true') {
    return Promise.resolve();
  }
  try {
    if (globalThis.localStorage?.getItem('MOCK_ROLE')) {
      return Promise.resolve();
    }
  } catch {
    /* localStorage unavailable */
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}
