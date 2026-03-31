export interface IVendor {
    id?: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    alternatePhone?: string;
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
    servicesOffered: ServiceType[];
    qualifications?: Qualification[];
    experience?: number;
    specialization?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    serviceAreas?: string[];
    documents?: Documents;
    availability?: Availability;
    pricing?: Pricing;
    isVerified?: boolean;
    isActive?: boolean;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    verificationDate?: Date;
    rating?: number;
    totalReviews?: number;
    profileImage?: string | null;
    bio?: string;
    bankDetails?: BankDetails;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ServiceType =
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


export interface Qualification {
    degree?: string;
    institution?: string;
    year?: number;
}

export interface DocumentFile {
    type?: string;
    url?: string;
}

export interface Documents {
    identityProof?: DocumentFile;
    qualificationCertificate?: DocumentFile;
    businessLicense?: DocumentFile;
    insuranceCertificate?: DocumentFile;
}

export interface TimeSlot {
    from: string;
    to: string;
}

export interface Availability {
    days: Day[];
    timeSlots: TimeSlot[];
    emergencyAvailable?: boolean;
}

export type Day =
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';

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