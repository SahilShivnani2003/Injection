export interface LabPartner {
    // Lab Information
    labName: string;
    labAddress: string;
    labContact: string;
    labEmail?: string;
    partnerType?: 'Laboratory' | 'Hospital' | 'Diagnostic Center' | 'Clinic' | 'Other';

    // Patient Information
    patientName: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    patientContact: string;

    // Sample/Test Information
    testType: string;
    sampleType: string;
    sampleCollectionDate: Date;
    sampleSentDate: Date;

    // Status and Results
    status?: 'Sent to Lab' | 'In Progress' | 'Completed' | 'Cancelled';
    expectedResultDate?: Date;
    actualResultDate?: Date;
    resultReceived?: boolean;
    resultUrl?: string | null;

    // Additional Information
    remarks?: string;
    urgency?: 'Normal' | 'Urgent' | 'Critical';
    cost?: number;

    // Tracking
    createdBy?: string;

    createdAt?: Date;
    updatedAt?: Date;
}