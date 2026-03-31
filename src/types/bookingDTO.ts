import { IBooking, SelectedService } from './booking';

// Booking Creation DTO
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

// Booking Update DTO
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

// Booking Response DTO
export interface BookingResponseDTO extends IBooking {
  // Additional computed fields that might come from API
  vendorName?: string;
  vendorContact?: string;
  staffName?: string;
  staffContact?: string;
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
export const validateCreateBookingDTO = (data: CreateBookingDTO): string[] => {
  const errors: string[] = [];

  if (!data.patientName?.trim()) errors.push('Patient name is required');
  if (!data.age || data.age < 1 || data.age > 120) errors.push('Valid age is required (1-120)');
  if (!data.sex) errors.push('Gender is required');
  if (!data.address?.trim()) errors.push('Address is required');
  if (!data.pincode?.trim()) errors.push('Pincode is required');
  if (data.pincode?.length !== 6) errors.push('Pincode must be 6 digits');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.email?.includes('@')) errors.push('Invalid email format');
  if (!data.selectedServices || data.selectedServices.length === 0) errors.push('At least one service must be selected');
  if (!data.preferredTimeSlot?.trim()) errors.push('Preferred time slot is required');

  return errors;
};

export const validateCancelBookingDTO = (data: CancelBookingDTO): string[] => {
  const errors: string[] = [];

  if (!data.bookingId?.trim()) errors.push('Booking ID is required');
  if (!data.reason?.trim()) errors.push('Cancellation reason is required');

  return errors;
};