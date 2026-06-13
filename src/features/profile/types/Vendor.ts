export interface Vendor {
    _id?: string;
    // Basic Information
    name: string;
    email: string;
    password: string;
    phone: string;
    alternatePhone?: string;
    gender?: 'Male' | 'Female' | 'Other';

    // Business Information
    businessName: string;
    businessType: 'Individual' | 'Clinic' | 'Hospital' | 'Laboratory' | 'Pharmacy' | 'Other';
    registrationNumber?: string;
    gstNumber?: string;

    services?: {
        _id: string;
        serviceName: string;
        category: string;
        basePrice: number;
        duration: number;
    }[];

    // Professional Details
    qualifications?: Qualification[];
    experience?: number;
    specialization?: string;

    // Location Details
    address: string;
    city: string;
    state: string;
    pincode: string;
    serviceAreas?: string[];

    // Documents
    documents?: Documents;

    // Availability
    availability?: Availability;

    // Pricing
    pricing?: Pricing;

    // Status and Verification
    isVerified?: boolean;
    isActive?: boolean;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    verificationDate?: Date;

    // Ratings and Reviews
    rating?: number;
    totalReviews?: number;

    // Profile
    profileImage?: string | null;
    bio?: string;

    // Bank Details
    bankDetails?: BankDetails;

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// Sub-interfaces

export interface Qualification {
    degree?: string;
    institution?: string;
    year?: number;
}

export interface Documents {
    identityProof?: DocumentFile;
    qualificationCertificate?: DocumentFile;
    businessLicense?: DocumentFile;
    insuranceCertificate?: DocumentFile;
}

export interface DocumentFile {
    type?: string;
    url?: string;
}

export interface Availability {
    days?: (
        | 'Monday'
        | 'Tuesday'
        | 'Wednesday'
        | 'Thursday'
        | 'Friday'
        | 'Saturday'
        | 'Sunday'
    )[];
    timeSlots?: TimeSlot[];
    emergencyAvailable?: boolean;
}

export interface TimeSlot {
    from?: string;
    to?: string;
}

export interface Pricing {
    consultationFee?: number;
    homeVisitFee?: number;
    emergencyFee?: number;
}

export interface BankDetails {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
}