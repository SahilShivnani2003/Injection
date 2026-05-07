export interface Vendor {
    _id?:string;
    // Basic Information
    name: string;
    email: string;
    password: string;
    phone: string;
    alternatePhone?: string;

    // Business Information
    businessName: string;
    businessType: 'Individual' | 'Clinic' | 'Hospital' | 'Laboratory' | 'Pharmacy' | 'Other';
    registrationNumber?: string;
    gstNumber?: string;

    // Services Offered
    servicesOffered?: (
        | 'Home Injections'
        | 'IV Drip Services'
        | 'Wound Dressing'
        | 'Day Care at Home'
        | 'Patient Monitoring'
        | 'Old Age Patient Care'
        | '24 HR Patient Care'
        | 'Field Survey Service'
        | 'Data Collection Service'
        | 'Field Sample Collection'
        | 'Community Survey'
        | 'Awareness Activities'
        | 'Lab-based Training'
        | 'BSC/MSC Training'
        | 'DMLT Training'
        | 'Nursing Training'
        | 'Dissertation Program'
        | 'Placement Services'
    )[];

    // Professional Details
    qualifications?: {
        degree?: string;
        institution?: string;
        year?: number;
    }[];
    experience?: number;
    specialization?: string;

    // Location Details
    address: string;
    city: string;
    state: string;
    pincode: string;
    serviceAreas?: string[];

    // Documents
    documents?: {
        identityProof?: {
            type?: string;
            url?: string;
        };
        qualificationCertificate?: {
            type?: string;
            url?: string;
        };
        businessLicense?: {
            type?: string;
            url?: string;
        };
        insuranceCertificate?: {
            type?: string;
            url?: string;
        };
    };

    // Availability
    availability?: {
        days?: (
            | 'Monday'
            | 'Tuesday'
            | 'Wednesday'
            | 'Thursday'
            | 'Friday'
            | 'Saturday'
            | 'Sunday'
        )[];
        timeSlots?: {
            from?: string;
            to?: string;
        }[];
        emergencyAvailable?: boolean;
    };

    // Pricing
    pricing?: {
        consultationFee?: number;
        homeVisitFee?: number;
        emergencyFee?: number;
    };

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
    bankDetails?: {
        accountHolderName?: string;
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
        branch?: string;
    };

    createdAt?: Date;
    updatedAt?: Date;
}