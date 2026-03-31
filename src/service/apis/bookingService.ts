import { privateClient, publicClient } from "../apiClient";
import {
  CreateBookingRequestDTO,
  InsuranceVerificationDTO,
  InsuranceVerificationResponseDTO,
  ServiceAvailabilityDTO,
  ServiceAvailabilityResponseDTO,
  BookingChargesDTO,
  BookingChargesResponseDTO,
  AcceptBookingDTO,
  StartBookingDTO,
  CompleteBookingDTO,
  CancelBookingDTO,
} from "../../types/bookingDTO";

export const bookingAPI = {
  // Booking CRUD operations
  createBooking: (data: CreateBookingRequestDTO) => privateClient.post('/bookings/create', data),
  userBookings: () => privateClient.get('/bookings/user/me'),
  getAllAvailableBooking: () => publicClient.get('/bookings/available'),
  vendorBookings: () => privateClient.get('/bookings/vendor/me'),
  getBookingDetails: (bookingId: string) => privateClient.get(`/bookings/${bookingId}`),
  updateBooking: (bookingId: string, data: any) => privateClient.put(`/bookings/${bookingId}`, data),

  // Booking status operations
  vendorAcceptBooking: (data: AcceptBookingDTO) => privateClient.post(`/bookings/${data.bookingId}/accept`, data),
  vendorStartBooking: (data: StartBookingDTO) => privateClient.post(`/bookings/${data.bookingId}/start`, data),
  vendorCompleteBooking: (data: CompleteBookingDTO) => privateClient.post(`/bookings/${data.bookingId}/complete`, data),
  vendorCancelBooking: (data: CancelBookingDTO) => privateClient.post(`/bookings/${data.bookingId}/cancel`, data),
  userCancelBooking: (data: CancelBookingDTO) => privateClient.post(`/bookings/${data.bookingId}/user-cancel`, data),

  // Booking flow APIs
  verifyInsurance: (data: InsuranceVerificationDTO): Promise<{ data: InsuranceVerificationResponseDTO }> =>
    privateClient.post('/insurance/verify', data),

  checkServiceAvailability: (data: ServiceAvailabilityDTO): Promise<{ data: ServiceAvailabilityResponseDTO }> =>
    publicClient.post('/services/availability', data),

  calculateCharges: (data: BookingChargesDTO): Promise<{ data: BookingChargesResponseDTO }> =>
    publicClient.post('/bookings/calculate-charges', data),

  // Prescription upload
  uploadPrescription: (file: FormData) => privateClient.post('/uploads/prescription', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Get available services
  getAvailableServices: () => publicClient.get('/services/available'),

  // Get complimentary tests
  getComplimentaryTests: () => publicClient.get('/services/complimentary'),

  // Get available time slots
  getAvailableSlots: (date: string) => publicClient.get(`/slots/available?date=${date}`),
};
