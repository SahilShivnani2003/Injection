export type ServiceCategory =
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

export type ServiceType = 'At Home' | 'At Clinic' | 'Both';

export interface Service {
    serviceName: string;
    description: string;

    category: ServiceCategory;

    basePrice: number;

    duration: number;

    serviceType: ServiceType;

    vendorId: string;

    isActive: boolean;

    icon: string | null;
    image: string | null;

    tags?: string[];

    requirements?: string;

    createdAt: string;
    updatedAt: string;
}