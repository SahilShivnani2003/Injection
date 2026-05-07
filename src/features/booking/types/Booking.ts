export type BookingStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
export interface Booking {
    _id?: string;
    // Patient Information
    patientName: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    address: string;
    pincode: string;
    currentLocation: string;
    alternateMobile?: string;
    email: string;

    // Selected Services
    selectedServices: {
        serviceId: string;
        serviceName: string;
        price: number;
        quantity?: number;
    }[];

    // Additional Information
    additionalRequirements?: string;

    // Prescriptions
    prescriptions?: {
        type: 'form' | 'image';

        doctorName?: string;
        doctorRegistration?: string;
        hospitalName?: string;

        patientComplaints?: string;
        diagnosis?: string;

        medications?: {
            name?: string;
            dosage?: string;
            frequency?: string;
            duration?: string;
        }[];

        labTests?: string;
        specialInstructions?: string;
        followUpDate?: Date;

        imageUrl?: string | null;
        supportingImageUrl?: string | null;

        addedBy?: string;
        addedAt?: Date;
    }[];

    hasInsurance?: boolean;
    insurancePolicyNumber?: string;

    // Pricing
    subtotal: number;
    gstAmount: number;
    grandTotal: number;

    // Coupon Information
    appliedCoupon?: {
        couponId?: string | null;
        couponCode?: string | null;
        discountAmount?: number;
    };
    finalAmount?: number | null;

    // Preferences
    freeComplimentaryService?: 'Blood Sugar' | 'Blood Group' | 'Haemoglobin' | 'None';
    preferredTimeSlot: string;
    staffPreference?: 'Any Available' | 'Male Staff' | 'Female Staff';
    serviceLocation?: string;
    estimatedDuration?: number;

    // References
    userId: string;
    vendorId?: string | null;

    // Booking Status
    bookingStatus?: BookingStatus;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;

    // Reports
    reports?: {
        reportUrl: string;
        reportType?: 'lab' | 'imaging' | 'general' | 'other';
        reportName?: string;
        addedBy?: string;
        addedAt?: Date;
    }[];

    // Legacy
    reportUrl?: string | null;
    reportGeneratedAt?: Date;

    // Notes
    notes?: {
        text: string;
        addedBy?: string;
        addedAt?: Date;
    }[];

    createdAt?: Date;
    updatedAt?: Date;
}