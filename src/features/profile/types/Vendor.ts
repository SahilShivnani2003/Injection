export interface Vendor {
    _id?: string;
    vendorId?: string;

    // Basic Information
    name: string;
    email: string;
    password: string;
    phone: string;
    alternatePhone?: string;

    gender?: 'Male' | 'Female' | 'Other';

    role?: 'vendor';

    // Business Information
    businessName: string;

    businessType:
    | 'Individual'
    | 'Clinic'
    | 'Hospital'
    | 'Laboratory'
    | 'Pharmacy'
    | 'Other';

    registrationNumber?: string;
    gstNumber?: string;

    /**
     * Mongoose stores ObjectId references.
     * When populated, this can contain service details.
     */
    services?: string[] | VendorService[];

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
    documents?: VendorDocuments;

    // Availability
    availability?: Availability;

    // Pricing
    pricing?: Pricing;

    // Status and Verification
    isVerified?: boolean;
    isActive?: boolean;
    isPhoneVerified?: boolean;

    verificationStatus?:
    | 'pending'
    | 'verified'
    | 'rejected';

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


// ============================================
// Service
// ============================================

export interface VendorService {
    _id: string;
    serviceName: string;
    category: string;
    basePrice: number;
    duration: number;
}


// ============================================
// Qualification
// ============================================

export interface Qualification {
    degree?: string;
    institution?: string;
    year?: number;
}


// ============================================
// Documents
// ============================================

export interface VendorDocuments {
    identityProof?: DocumentFile;
    qualificationCertificate?: DocumentFile;
    businessLicense?: DocumentFile;
    insuranceCertificate?: DocumentFile;
    policeVerification?: DocumentFile;
}


export interface DocumentFile {
    type?: string;
    url?: string;

    status?:
    | 'pending'
    | 'approved'
    | 'rejected';

    rejectionReason?: string;
}


// ============================================
// Availability
// ============================================

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


// ============================================
// Pricing
// ============================================

export interface Pricing {
    consultationFee?: number;
    homeVisitFee?: number;
    emergencyFee?: number;
}


// ============================================
// Bank Details
// ============================================

export interface BankDetails {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
}