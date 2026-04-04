export type Gender = 'Male' | 'Female' | 'Other';

export type ComplimentaryService =
    | 'Blood Sugar'
    | 'Blood Group'
    | 'Haemoglobin'
    | 'None';

export type StaffPreference = 'Any Available' | 'Male Staff' | 'Female Staff';

export type BookingStatus =
    | 'pending'
    | 'accepted'
    | 'in-progress'
    | 'completed'
    | 'cancelled';

export type ReportType = 'lab' | 'imaging' | 'general' | 'other';

export interface SelectedService {
    serviceId: string;
    serviceName: string;
    price: number;
    quantity: number;
}

export interface Prescription {
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

    followUpDate?: string;

    imageUrl: string | null;
    supportingImageUrl: string | null;

    addedBy: string;
    addedAt: string;
}

export interface Report {
    reportUrl: string;
    reportType: ReportType;
    reportName?: string;
    addedBy: string;
    addedAt: string;
}

export interface Note {
    text: string;
    addedBy: string;
    addedAt: string;
}

export interface Booking {
    patientName: string;
    age: number;
    sex: Gender;

    address: string;
    pincode: string;
    currentLocation: string;
    alternateMobile?: string;
    email: string;

    selectedServices: SelectedService[];

    additionalRequirements?: string;

    prescriptions?: Prescription[];

    hasInsurance: boolean;
    insurancePolicyNumber?: string;

    subtotal: number;
    gstAmount: number;
    grandTotal: number;

    freeComplimentaryService: ComplimentaryService;
    preferredTimeSlot: string;
    staffPreference: StaffPreference;
    serviceLocation: string;
    estimatedDuration: number;

    userId: string;
    vendorId?: string | null;

    bookingStatus: BookingStatus;

    acceptedAt?: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;

    reports?: Report[];

    reportUrl: string | null;
    reportGeneratedAt?: string;

    notes?: Note[];

    createdAt: string;
    updatedAt: string;
}