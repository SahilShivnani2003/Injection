export interface Service {
    // Service Information
    serviceName: string;
    description: string;
    category:
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
    | 'Placement Services'
    | 'Blood Collection'
    | 'BP/Sugar Monitoring'
    | 'ECG at Home'
    | 'Catheter Care'
    | 'Physiotherapy Session'
    | 'Other';

    // Pricing
    basePrice: number;

    // Service Details
    duration?: number;
    serviceType?: 'At Home' | 'At Clinic' | 'Both';

    // Vendor Reference
    vendorId: string;

    // Service Status
    isActive?: boolean;

    // Additional Info
    icon?: string | null;
    image?: string | null;
    tags?: string[];
    requirements?: string;

    createdAt?: Date;
    updatedAt?: Date;
}