// ─── Shared types & constants for Vendor Registration ────────────────────────

export type UploadedFile = {
    uri: string;
    name: string;
    type: string;
};

export type DocumentField =
    | 'identityProof'
    | 'qualificationCertificate'
    | 'businessLicense'
    | 'insuranceCertificate'
    | 'policeVerification';

export type VendorForm = {
    // Step 1
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    alternatePhone: string;
    businessName: string;
    businessType: string;
    registrationNumber: string;
    gstNumber: string;
    // Step 2
    address: string;
    city: string;
    state: string;
    pincode: string;
    serviceAreas: string[];
        services: string[];
    // Step 3
    specialization: string;
    experience: string;
    bio: string;
    // Step 4
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
};

export const INITIAL_FORM: VendorForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    alternatePhone: '',
    businessName: '',
    businessType: 'Individual',
    registrationNumber: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    serviceAreas: [],
    services: [],
    specialization: '',
    experience: '',
    bio: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
};

export const INITIAL_DOCUMENTS: Record<DocumentField, string | null> = {
    identityProof: null,
    qualificationCertificate: null,
    businessLicense: null,
    insuranceCertificate: null,
    policeVerification: null,
};

export const BUSINESS_TYPES = [
    'Individual',
    'Clinic',
    'Hospital',
    'Laboratory',
    'Pharmacy',
    'Other',
] as const;

export const SERVICE_OPTIONS = [
    'Home Injections',
    'IV Drip Services',
    'Wound Dressing',
    'Day Care at Home',
    'Patient Monitoring',
    'Old Age Patient Care',
    '24 HR Patient Care',
    'Field Survey Service',
    'Data Collection Service',
    'Field Sample Collection',
    'Community Survey',
    'Awareness Activities',
    'Lab-based Training',
    'BSC/MSC Training',
    'DMLT Training',
    'Nursing Training',
    'Dissertation Program',
    'Placement Services',
] as const;

export const STEPS = [
    { label: 'Contact', icon: 'person' },
    { label: 'Location', icon: 'location-on' },
    { label: 'Professional', icon: 'work' },
    { label: 'Bank & Docs', icon: 'account-balance' },
];