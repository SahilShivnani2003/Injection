export interface InsuranceClaim {
    claimNumber: string;
    userId: string;

    patientName: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    contactNumber: string;
    email: string;

    insuranceProvider: string;
    policyNumber: string;

    claimType:
    | 'Hospitalization'
    | 'Diagnostic Tests'
    | 'Pharmacy'
    | 'Consultation'
    | 'Other';

    claimAmount: number;
    treatmentDate: Date;
    diagnosis: string;
    description: string;

    documents?: {
        name?: string;
        url?: string;
        uploadedAt?: Date;
    }[];

    status?: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'More Info Required';
    adminNotes?: string;
    rejectionReason?: string;
    approvedAmount?: number;

    createdBy?: 'User' | 'Admin';
    processedBy?: string;
    processedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}