export type BookingStatus =
    | 'pending'
    | 'accepted'
    | 'in-progress'
    | 'completed'
    | 'cancelled';

export type PaymentMethod = 'cash' | 'razorpay';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type Sex = 'Male' | 'Female' | 'Other';

export type FreeComplimentaryService =
    | 'Blood Sugar'
    | 'Blood Group'
    | 'Haemoglobin'
    | 'None';

export type StaffPreference =
    | 'Any Available'
    | 'Male Staff'
    | 'Female Staff';

export type PrescriptionType = 'form' | 'image';

export type ReportType =
    | 'lab'
    | 'imaging'
    | 'general'
    | 'other';

export type RequestedItemStatus =
    | 'pending'
    | 'brought'
    | 'unavailable';

export interface Booking {
    _id?: string;
    bookingId?: string;

    // ============================================
    // Patient Information
    // ============================================
    patientName: string;
    age: number;
    sex: Sex;
    address: string;
    pincode: string;
    currentLocation: string;
    alternateMobile?: string;
    email: string;

    // ============================================
    // Selected Services
    // ============================================
    selectedServices: {
        serviceId: string;
        serviceName: string;
        price: number;
        quantity?: number;
    }[];

    // ============================================
    // Additional Information
    // ============================================
    additionalRequirements?: string;

    // ============================================
    // Prescriptions
    // ============================================
    prescriptions?: {
        type: PrescriptionType;

        // Doctor Information
        doctorName?: string;
        doctorRegistration?: string;
        hospitalName?: string;

        // Clinical Details
        patientComplaints?: string;
        diagnosis?: string;

        // Medications
        medications?: {
            name?: string;
            dosage?: string;
            frequency?: string;
            duration?: string;
        }[];

        // Additional
        labTests?: string;
        specialInstructions?: string;
        followUpDate?: Date;

        // Images
        imageUrl?: string | null;
        supportingImageUrl?: string | null;

        // Metadata
        addedBy?: string;
        addedAt?: Date;
    }[];

    // ============================================
    // Insurance
    // ============================================
    hasInsurance?: boolean;
    insurancePolicyNumber?: string;

    // ============================================
    // Pricing
    // ============================================
    subtotal: number;
    gstAmount: number;
    grandTotal: number;

    // ============================================
    // Coupon Information
    // ============================================
    appliedCoupon?: {
        couponId?: string | null;
        couponCode?: string | null;
        discountAmount?: number;
    };

    finalAmount?: number | null;

    // ============================================
    // Payment Information
    // ============================================
    paymentMethod?: PaymentMethod | null;
    paymentStatus?: PaymentStatus;

    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    razorpaySignature?: string | null;

    additionalAmount?: number;

    // ============================================
    // Preferences
    // ============================================
    freeComplimentaryService?: FreeComplimentaryService;

    preferredTimeSlot: string;

    staffPreference?: StaffPreference;

    serviceLocation?: string;

    estimatedDuration?: number;

    // ============================================
    // User / Family / Vendor References
    // ============================================
    userId: string;

    familyMemberId?: string | null;

    vendorId?: string | null;

    // ============================================
    // Booking Status
    // ============================================
    bookingStatus?: BookingStatus;

    isReviewedByCustomer?: boolean;
    isReviewedByVendor?: boolean;

    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;

    cancellationReason?: string;

    // ============================================
    // Reports
    // ============================================
    reports?: {
        reportUrl: string;

        reportType?: ReportType;

        reportName?: string;

        addedBy?: string;

        addedAt?: Date;
    }[];

    // Legacy Report Field
    reportUrl?: string | null;

    reportGeneratedAt?: Date;

    // ============================================
    // Notes
    // ============================================
    notes?: {
        text: string;
        addedBy?: string;
        addedAt?: Date;
    }[];

    // ============================================
    // Runtime Notes
    // ============================================
    runtimeNotes?: {
        text: string;
        addedBy?: 'Vendor' | 'Admin';
        addedAt?: Date;
    }[];

    // ============================================
    // Prescription Summary
    // ============================================
    prescriptionSummary?: string;

    // ============================================
    // Requested Items
    // ============================================
    requestedItems?: {
        itemName: string;

        quantity?: number;

        status?: RequestedItemStatus;

        price?: number;
    }[];

    // ============================================
    // Mongoose Timestamps
    // ============================================
    createdAt?: Date;
    updatedAt?: Date;
}