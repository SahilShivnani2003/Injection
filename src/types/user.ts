export type Gender = 'Male' | 'Female' | 'Other';

export type InsuranceType = 'Primary' | 'Secondary';

export type BloodGroup =
    | 'A+'
    | 'A-'
    | 'B+'
    | 'B-'
    | 'AB+'
    | 'AB-'
    | 'O+'
    | 'O-'
    | 'Unknown';

export type PreferredLanguage =
    | 'English'
    | 'Hindi'
    | 'Bengali'
    | 'Telugu'
    | 'Marathi'
    | 'Tamil'
    | 'Gujarati'
    | 'Kannada'
    | 'Other';

export type UserRole = 'user' | 'admin' | 'staff';

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;

    phone: string;

    gender: Gender;
    age: number;

    address: string;
    pincode: string;

    alternateMobile?: string;
    currentLocation?: string;

    // Insurance
    hasInsurance: boolean;
    insuranceType: InsuranceType;
    insurancePolicyNumber?: string;
    insuranceProvider?: string;
    insuranceExpiryDate?: string;

    // Medical
    bloodGroup: BloodGroup;
    allergies?: string[];
    chronicDiseases?: string[];
    currentMedications?: string[];

    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;

    // Additional
    additionalNotes?: string;
    preferredLanguage: PreferredLanguage;

    // Account
    role: UserRole;
    isStaff: boolean;

    permissions: {
        dashboard: boolean;
        users: boolean;
        vendors: boolean;
        services: boolean;
        bookings: boolean;
        prescriptions: boolean;
        reports: boolean;
        labPartners: boolean;
        insuranceClaims: boolean;
        faqs: boolean;
        coupons: boolean;
        supportTickets: boolean;
        contactInquiries: boolean;
        advertisements: boolean;
        staff: boolean;
    };

    isActive: boolean;
    profileImage: string | null;
    lastLoginAt?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateUser {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone: string;
    gender: Gender;
    age: number;
    address: string;
    pincode: string;
    role: UserRole
}