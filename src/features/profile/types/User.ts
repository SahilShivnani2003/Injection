export interface User {
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
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
    allergies?: string[];
    chronicDiseases?: string[];
    currentMedications?: string[];

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
    permissions?: {
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
    };
    isActive?: boolean;
    profileImage?: string | null;
    lastLoginAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}