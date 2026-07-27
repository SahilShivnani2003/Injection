export interface Service {
    _id?: string;
    // Service Information
    serviceName: string;
    description: string;
    category: {
        createdAt: string;
        name: string;
        updatedAt: string;
        __v: number;
        _id: string;
    };

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