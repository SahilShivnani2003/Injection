export interface IBooking {
    id?: string;

    // Patient Info
    patientName: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    address: string;
    pincode: string;
    currentLocation: string;
    alternateMobile?: string;
    email: string;

    // Services
    selectedServices: SelectedService[];

    // Additional Info
    additionalRequirements?: string;
    prescriptionDocument?: string | null;
    hasInsurance?: boolean;
    insurancePolicyNumber?: string;

    // Pricing
    subtotal: number;
    gstAmount: number;
    grandTotal: number;

    // Preferences
    freeComplimentaryService?:
    | 'Blood Sugar'
    | 'Blood Group'
    | 'Haemoglobin'
    | 'None';

    preferredTimeSlot: string;

    staffPreference?:
    | 'Any Available'
    | 'Male Staff'
    | 'Female Staff';

    serviceLocation?: string;
    estimatedDuration?: number;

    // Relations
    userId: string;
    vendorId?: string | null;

    // Status
    bookingStatus?:
    | 'pending'
    | 'accepted'
    | 'in-progress'
    | 'completed'
    | 'cancelled';

    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface SelectedService {
    serviceId: string;
    serviceName: string;
    price: number;
    quantity?: number;
}