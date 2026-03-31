import { IBooking, SelectedService } from './booking';

// Patient Details DTO
export interface PatientDetailsDTO {
  patientName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  pinCode: string;
  currentLocation: string;
  alternateMobile?: string;
  email: string;
}

// Prescription Upload DTO
export interface PrescriptionUploadDTO {
  prescriptionFile?: File | Blob;
  prescriptionUri?: string;
  prescriptionType?: string;
  prescriptionName?: string;
}

// Service Selection DTO
export interface ServiceSelectionDTO {
  selectedServices: number[];
  additionalRequirements?: string;
}

// Complimentary Tests DTO
export interface ComplimentaryTestsDTO {
  complimentaryTests: ('sugar' | 'group' | 'hb')[];
}

// Insurance Details DTO
export interface InsuranceDetailsDTO {
  hasInsurance: boolean;
  policyNumber?: string;
  insuranceDetails?: {
    policyHolder: string;
    provider: string;
    coverage: string;
    validTill: string;
    maxLimit: number;
    usedAmount: number;
    remainingAmount: number;
  };
}

// Slot Booking DTO
export interface SlotBookingDTO {
  selectedDate: string;
  selectedTime: string;
  selectedStaff?: 'any' | 'male' | 'female';
  preferredTimeSlot: string;
}

// Complete Booking Request DTO
export interface CreateBookingRequestDTO {
  // Patient Details
  patientName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  pinCode: string;
  currentLocation: string;
  alternateMobile?: string;
  email: string;

  // Services
  selectedServices: SelectedService[];
  complimentaryTests?: ('sugar' | 'group' | 'hb')[];

  // Insurance
  hasInsurance?: boolean;
  policyNumber?: string;

  // Booking Details
  preferredDate: string;
  preferredTime: string;
  preferredStaff?: 'Any Available' | 'Male Staff' | 'Female Staff';

  // Additional
  additionalRequirements?: string;
  prescriptionDocument?: string | null;
  serviceLocation?: string;
}

// Booking Response DTO
export interface BookingResponseDTO extends IBooking {
  vendorName?: string;
  vendorContact?: string;
  staffName?: string;
  staffContact?: string;
  insuranceCoverage?: number;
  finalAmount: number;
}

// Insurance Verification DTO
export interface InsuranceVerificationDTO {
  policyNumber: string;
}

export interface InsuranceVerificationResponseDTO {
  valid: boolean;
  policyHolder: string;
  provider: string;
  coverage: string;
  validTill: string;
  maxLimit: number;
  usedAmount: number;
  remainingAmount: number;
}

// Service Availability DTO
export interface ServiceAvailabilityDTO {
  serviceId: number;
  date: string;
  time: string;
}

export interface ServiceAvailabilityResponseDTO {
  available: boolean;
  availableSlots: string[];
  staffAvailable: ('any' | 'male' | 'female')[];
}

// Booking Charges DTO
export interface BookingChargesDTO {
  selectedServices: number[];
  complimentaryTests?: ('sugar' | 'group' | 'hb')[];
  insuranceCoverage?: number;
}

export interface BookingChargesResponseDTO {
  subtotal: number;
  gst: number;
  total: number;
  insuranceCoverage: number;
  finalAmount: number;
  breakdown: {
    services: { id: number; name: string; price: number }[];
    complimentary: { id: string; name: string; price: number }[];
  };
}

// Legacy DTOs for backward compatibility
export interface CreateBookingDTO {
  patientName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  pincode: string;
  currentLocation: string;
  alternateMobile?: string;
  email: string;
  selectedServices: SelectedService[];
  additionalRequirements?: string;
  prescriptionDocument?: string | null;
  hasInsurance?: boolean;
  insurancePolicyNumber?: string;
  freeComplimentaryService?: 'Blood Sugar' | 'Blood Group' | 'Haemoglobin' | 'None';
  preferredTimeSlot: string;
  staffPreference?: 'Any Available' | 'Male Staff' | 'Female Staff';
  serviceLocation?: string;
}

export interface UpdateBookingDTO {
  patientName?: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  address?: string;
  pincode?: string;
  currentLocation?: string;
  alternateMobile?: string;
  email?: string;
  selectedServices?: SelectedService[];
  additionalRequirements?: string;
  prescriptionDocument?: string | null;
  hasInsurance?: boolean;
  insurancePolicyNumber?: string;
  freeComplimentaryService?: 'Blood Sugar' | 'Blood Group' | 'Haemoglobin' | 'None';
  preferredTimeSlot?: string;
  staffPreference?: 'Any Available' | 'Male Staff' | 'Female Staff';
  serviceLocation?: string;
}

// Booking Query/Filter DTO
export interface BookingQueryDTO {
  page?: number;
  limit?: number;
  status?: IBooking['bookingStatus'];
  userId?: string;
  vendorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  serviceType?: string;
}

// Booking List Response DTO
export interface BookingListResponseDTO {
  bookings: BookingResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Booking Status Update DTOs
export interface AcceptBookingDTO {
  bookingId: string;
  estimatedDuration?: number;
}

export interface StartBookingDTO {
  bookingId: string;
}

export interface CompleteBookingDTO {
  bookingId: string;
  notes?: string;
}

export interface CancelBookingDTO {
  bookingId: string;
  reason: string;
  notes?: string;
}

// Validation functions
export const validatePatientDetailsDTO = (data: PatientDetailsDTO): string[] => {
  const errors: string[] = [];

  if (!data.patientName?.trim()) errors.push('Patient name is required');
  if (!data.age || data.age < 1 || data.age > 120) errors.push('Valid age is required (1-120)');
  if (!data.sex) errors.push('Gender is required');
  if (!data.address?.trim()) errors.push('Address is required');
  if (!data.pinCode?.trim()) errors.push('Pincode is required');
  if (data.pinCode?.length !== 6) errors.push('Pincode must be 6 digits');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.email?.includes('@')) errors.push('Invalid email format');

  return errors;
};

export const validateCreateBookingRequestDTO = (data: CreateBookingRequestDTO): string[] => {
  const errors: string[] = [];

  // Patient details validation
  if (!data.patientName?.trim()) errors.push('Patient name is required');
  if (!data.age || data.age < 1 || data.age > 120) errors.push('Valid age is required (1-120)');
  if (!data.sex) errors.push('Gender is required');
  if (!data.address?.trim()) errors.push('Address is required');
  if (!data.pinCode?.trim()) errors.push('Pincode is required');
  if (data.pinCode?.length !== 6) errors.push('Pincode must be 6 digits');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.email?.includes('@')) errors.push('Invalid email format');

  // Services validation
  if (!data.selectedServices || data.selectedServices.length === 0) errors.push('At least one service must be selected');

  // Booking details validation
  if (!data.preferredDate?.trim()) errors.push('Preferred date is required');
  if (!data.preferredTime?.trim()) errors.push('Preferred time is required');

  return errors;
};

export const validateInsuranceVerificationDTO = (data: InsuranceVerificationDTO): string[] => {
  const errors: string[] = [];

  if (!data.policyNumber?.trim()) errors.push('Policy number is required');

  return errors;
};

export const validateCancelBookingDTO = (data: CancelBookingDTO): string[] => {
  const errors: string[] = [];

  if (!data.bookingId?.trim()) errors.push('Booking ID is required');
  if (!data.reason?.trim()) errors.push('Cancellation reason is required');

  return errors;
};