export interface User {
    _id?: string;
    patientId?: string;

    name: string;
    email: string;
    password: string;
    phone: string;

    gender: 'Male' | 'Female' | 'Other';
    age: number;
    address: string;
    pincode: string;

    alternateMobile?: string;
    currentLocation?: string;

    // Insurance Information
    hasInsurance?: boolean;
    insuranceType?: 'Primary' | 'Secondary';
    insurancePolicyNumber?: string;
    insuranceProvider?: string;
    insuranceExpiryDate?: Date;

    // Medical Information
    bloodGroup?:
    | 'A+'
    | 'A-'
    | 'B+'
    | 'B-'
    | 'AB+'
    | 'AB-'
    | 'O+'
    | 'O-'
    | 'Unknown';

    allergies?: MedicalCondition[];
    chronicDiseases?: MedicalCondition[];
    currentMedications?: MedicalCondition[];

    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;

    // Additional Information
    additionalNotes?: string;

    preferredLanguage?:
    | 'English'
    | 'Hindi'
    | 'Bengali'
    | 'Telugu'
    | 'Marathi'
    | 'Tamil'
    | 'Gujarati'
    | 'Kannada'
    | 'Other';

    // Account Status
    role?: 'user' | 'admin' | 'staff';

    isStaff?: boolean;

    permissions?: UserPermissions;

    isActive?: boolean;
    isPhoneVerified?: boolean;

    // Documents / Profile
    profileImage?: string | null;
    medicalReport?: string | null;
    bloodReport?: string | null;
    historyDocument?: string | null;
    otherDocument?: string | null;

    // Login / Activity
    lastLoginAt?: Date;

    // Rating
    rating?: number;
    totalReviews?: number;

    // Family Members
    familyMembers?: FamilyMember[];

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MedicalCondition {
    name: string;
    since: string;
}

export interface FamilyMember {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone?: string;
    email?: string;
    relationship: string;
    address?: string;
    pincode?: string;
}

export interface UserPermissions {
    dashboard?: boolean;
    users?: boolean;
    vendors?: boolean;
    services?: boolean;
    bookings?: boolean;
    prescriptions?: boolean;
    reports?: boolean;
    labPartners?: boolean;
    insuranceClaims?: boolean;
    faqs?: boolean;
    coupons?: boolean;
    supportTickets?: boolean;
    contactInquiries?: boolean;
    advertisements?: boolean;
    staff?: boolean;
}