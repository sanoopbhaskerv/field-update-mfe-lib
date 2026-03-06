/**
 * Domain types — single source of truth for all models used across
 * the client-updater micro-frontend.
 *
 * @module client.types
 */

// ─── User roles ──────────────────────────────────────────────────────────────

/** Authenticated user role returned by the SSO/sign-on endpoint. */
export type UserRole = 'advisor' | 'support_staff';

/** Payload returned by the sign-on service after SSO verification. */
export interface SignOnInfo {
  role: UserRole;
  /** The logged-in user's own ID (advisorId if role=advisor, staffId if support_staff) */
  userId: string;
  /** Human-readable name shown in the header / greeting. */
  displayName: string;
}

// ─── Advisor ─────────────────────────────────────────────────────────────────

/** Minimal advisor identity used for OBO (on-behalf-of) flows. */
export interface AdvisorProfile {
  id: string;
  name: string;
}

// ─── Client sub-types ────────────────────────────────────────────────────────

export interface ClientNameDetails {
  firstName: string;
  lastName: string;
  middleName: string;
}

export interface Email {
  emailAddress: string;
  emailType: string;
  emailStatusCode: string;
}

export interface Phone {
  countryCode: string;
  areaCode: string;
  nonNANNumber: string;
  phoneType: string;
}

export interface PostalAddress {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  stateCode: string;
  postalCode: string;
  countryName: string;
  countryCode: string;
  addressType: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

/** Editable section identifiers on {@link ClientProfile}. */
export type ClientSection = 'name' | 'email' | 'phone' | 'address';

/** Union type for any section value. */
export type SectionValue = ClientNameDetails | Email | Phone | PostalAddress;

/** Full client profile loaded via the client service. */
export interface ClientProfile {
  clientId: string;
  clientContext: string;
  clientNameDetails: ClientNameDetails;
  emails: Email[];
  telephone: Phone[];
  postalAddress: PostalAddress[];
}

/** Lightweight projection returned by client name search. */
export interface ClientSearchResult {
  id: string;
  name: string;
  email: string;
}

/** Staged section change held in context between wizard steps. */
export interface PendingUpdate {
  section: ClientSection;
  index?: number;
  oldValue: SectionValue;
  newValue: SectionValue;
}

// ─── Context resolution (deeplink) ───────────────────────────────────────────

/** Result of resolving an opaque deeplink contextId into concrete IDs. */
export interface ContextResolution {
  /** Present when context carries a pre-selected client */
  clientId?: string;
  /** Present when context carries an advisor (staff acting on behalf of) */
  advisorId?: string;
}

// ─── Federated callback ───────────────────────────────────────────────────────

/** Discriminator for the action the user took to exit the wizard. */
export type FederatedAction = 'done' | 'edit-another' | 'cancel';

/** Event payload emitted to the host app via `onComplete` when the wizard finishes. */
export interface FederatedCompleteEvent {
  action: FederatedAction;
  client: ClientProfile;
  /** The section that was changed (absent on `cancel`). */
  updatedSection?: ClientSection;
  /** Index of the updated item for array sections (absent on `cancel`). */
  updatedIndex?: number;
  /** New value that was saved (absent on `cancel`). */
  newValue?: SectionValue;
}

// ─── Section metadata registry ────────────────────────────────────────────────

/** UI metadata for a single sub-field within a section. */
export interface SubFieldMeta {
  key: string;
  label: string;
  inputType: string;
  placeholder: string;
}

/** UI metadata for an editable client section. */
export interface SectionMeta {
  label: string;
  isArray: boolean;
  fields: SubFieldMeta[];
}

const NAME_FIELDS: SubFieldMeta[] = [
  {
    key: 'firstName',
    label: 'First Name',
    inputType: 'text',
    placeholder: 'Enter first name',
  },
  {
    key: 'lastName',
    label: 'Last Name',
    inputType: 'text',
    placeholder: 'Enter last name',
  },
  {
    key: 'middleName',
    label: 'Middle Name',
    inputType: 'text',
    placeholder: 'Enter middle name',
  },
];

const EMAIL_FIELDS: SubFieldMeta[] = [
  {
    key: 'emailAddress',
    label: 'Email Address',
    inputType: 'email',
    placeholder: 'Enter email address',
  },
  {
    key: 'emailType',
    label: 'Email Type',
    inputType: 'text',
    placeholder: 'e.g. Personal, Business',
  },
  {
    key: 'emailStatusCode',
    label: 'Status',
    inputType: 'text',
    placeholder: 'e.g. ACTIVE',
  },
];

const PHONE_FIELDS: SubFieldMeta[] = [
  {
    key: 'countryCode',
    label: 'Country Code',
    inputType: 'text',
    placeholder: 'e.g. +1',
  },
  {
    key: 'areaCode',
    label: 'Area Code',
    inputType: 'text',
    placeholder: 'e.g. 555',
  },
  {
    key: 'nonNANNumber',
    label: 'Phone Number',
    inputType: 'tel',
    placeholder: 'e.g. 010-2345',
  },
  {
    key: 'phoneType',
    label: 'Phone Type',
    inputType: 'text',
    placeholder: 'e.g. Business, Personal',
  },
];

const ADDRESS_FIELDS: SubFieldMeta[] = [
  {
    key: 'addressLine1',
    label: 'Address Line 1',
    inputType: 'text',
    placeholder: 'Enter address line 1',
  },
  {
    key: 'addressLine2',
    label: 'Address Line 2',
    inputType: 'text',
    placeholder: 'Enter address line 2',
  },
  {
    key: 'addressLine3',
    label: 'Address Line 3',
    inputType: 'text',
    placeholder: 'Enter address line 3',
  },
  { key: 'city', label: 'City', inputType: 'text', placeholder: 'Enter city' },
  {
    key: 'stateCode',
    label: 'State Code',
    inputType: 'text',
    placeholder: 'e.g. MN',
  },
  {
    key: 'postalCode',
    label: 'Postal Code',
    inputType: 'text',
    placeholder: 'Enter postal code',
  },
  {
    key: 'countryName',
    label: 'Country',
    inputType: 'text',
    placeholder: 'Enter country name',
  },
  {
    key: 'countryCode',
    label: 'Country Code',
    inputType: 'text',
    placeholder: 'e.g. US',
  },
  {
    key: 'addressType',
    label: 'Address Type',
    inputType: 'text',
    placeholder: 'e.g. Primary, Mailing, Business',
  },
];

/** Registry mapping each {@link ClientSection} to its display and field metadata. */
export const SECTION_CONFIG: Record<ClientSection, SectionMeta> = {
  name: { label: 'Name', isArray: false, fields: NAME_FIELDS },
  email: { label: 'Email', isArray: true, fields: EMAIL_FIELDS },
  phone: { label: 'Phone', isArray: true, fields: PHONE_FIELDS },
  address: { label: 'Address', isArray: true, fields: ADDRESS_FIELDS },
};

/** Ordered list of sections shown on the client detail page. */
export const EDITABLE_SECTIONS: ClientSection[] = [
  'name',
  'email',
  'phone',
  'address',
];

/** Derived label-only map for display purposes. */
export const SECTION_LABELS: Record<ClientSection, string> = Object.fromEntries(
  Object.entries(SECTION_CONFIG).map(([k, v]) => [k, v.label]),
) as Record<ClientSection, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a display name from structured name details. */
export function getDisplayName(client: ClientProfile): string {
  const { firstName, middleName, lastName } = client.clientNameDetails;
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
}

/** Format a section value as a single display string. */
export function formatSectionValue(
  section: ClientSection,
  value: SectionValue,
): string {
  switch (section) {
    case 'name': {
      const v = value as ClientNameDetails;
      return (
        [v.firstName, v.middleName, v.lastName].filter(Boolean).join(' ') || '—'
      );
    }
    case 'email': {
      const v = value as Email;
      return v.emailAddress || '—';
    }
    case 'phone': {
      const v = value as Phone;
      return (
        [v.countryCode, v.areaCode, v.nonNANNumber].filter(Boolean).join(' ') ||
        '—'
      );
    }
    case 'address': {
      const v = value as PostalAddress;
      return (
        [v.addressLine1, v.city, v.stateCode, v.postalCode]
          .filter(Boolean)
          .join(', ') || '—'
      );
    }
  }
}

/** Get the current section value from a client profile. */
export function getSectionValue(
  client: ClientProfile,
  section: ClientSection,
  index?: number,
): SectionValue {
  switch (section) {
    case 'name':
      return client.clientNameDetails;
    case 'email':
      return client.emails[index ?? 0];
    case 'phone':
      return client.telephone[index ?? 0];
    case 'address':
      return client.postalAddress[index ?? 0];
  }
}

/** Apply an updated section value to a client profile (immutable). */
export function applySectionUpdate(
  client: ClientProfile,
  section: ClientSection,
  value: SectionValue,
  index?: number,
): ClientProfile {
  switch (section) {
    case 'name':
      return { ...client, clientNameDetails: value as ClientNameDetails };
    case 'email':
      return {
        ...client,
        emails: client.emails.map((e, i) =>
          i === (index ?? 0) ? (value as Email) : e,
        ),
      };
    case 'phone':
      return {
        ...client,
        telephone: client.telephone.map((p, i) =>
          i === (index ?? 0) ? (value as Phone) : p,
        ),
      };
    case 'address':
      return {
        ...client,
        postalAddress: client.postalAddress.map((a, i) =>
          i === (index ?? 0) ? (value as PostalAddress) : a,
        ),
      };
  }
}
