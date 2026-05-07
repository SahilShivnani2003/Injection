export interface SelectedService {
    serviceId: string;
    serviceName: string;
    price: number;
    quantity?: number;
}

export type StaffPreference = 'Any Available' | 'Male Staff' | 'Female Staff';

export type ComplimentaryService = 'Blood Sugar' | 'Blood Group' | 'Haemoglobin' | 'None';

export type Gender = 'Male' | 'Female' | 'Other';