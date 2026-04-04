export type BusinessType =
    | 'Individual'
    | 'Clinic'
    | 'Hospital'
    | 'Laboratory'
    | 'Pharmacy'
    | 'Other';

export type ServiceOffered =
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
    | 'Placement Services';

export type WeekDay =
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Vendor {
    // Basic
    name: string;
    email: string;
    password: string;
    phone: string;
    alternatePhone?: string;

    // Business
    businessName: string;
    businessType: BusinessType;
    registrationNumber?: string;
    gstNumber?: string;

    // Services
    servicesOffered?: ServiceOffered[];

    // Professional
    qualifications?: {
        degree?: string;
        institution?: string;
        year?: number;
    }[];

    experience?: number;
    specialization?: string;

    // Location
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
        days?: WeekDay[];
        timeSlots?: {
            from?: string;
            to?: string;
        }[];
        emergencyAvailable: boolean;
    };

    // Pricing
    pricing?: {
        consultationFee?: number;
        homeVisitFee?: number;
        emergencyFee?: number;
    };

    // Status
    isVerified: boolean;
    isActive: boolean;
    verificationStatus: VerificationStatus;
    verificationDate?: string;

    // Ratings
    rating: number;
    totalReviews: number;

    // Profile
    profileImage: string | null;
    bio?: string;

    // Bank
    bankDetails?: {
        accountHolderName?: string;
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
        branch?: string;
    };

    createdAt: string;
    updatedAt: string;
}