import { privateClient, publicClient } from "../apiClient";

export const bookingAPI = {
  // Booking CRUD operations
  createBooking: (data: any) => privateClient.post('/bookings/create', data),
  userBookings: () => privateClient.get('/bookings/user/me'),
  getAllAvailableBooking: () => publicClient.get('/bookings/available'),
  vendorBookings: () => privateClient.get('/bookings/vendor/me'),
  getBookingDetails: (bookingId: string) => privateClient.get(`/bookings/${bookingId}`),
  updateBooking: (bookingId: string, data: any) => privateClient.put(`/bookings/${bookingId}`, data),

  // Booking status operations
  vendorAcceptBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/accept`, data),
  vendorStartBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/start`, data),
  vendorCompleteBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/complete`, data),
  vendorCancelBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/cancel`, data),
  userCancelBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/user-cancel`, data),

  // Booking flow APIs
  verifyInsurance: (data: any): Promise<{ data: any }> =>
    privateClient.post('/insurance/verify', data),

  checkServiceAvailability: (data: any): Promise<{ data: any }> =>
    publicClient.post('/services/availability', data),

  calculateCharges: (data: any): Promise<{ data: any }> =>
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
