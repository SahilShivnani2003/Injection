import { privateClient, publicClient } from "../apiClient";

export const bookingAPI = {
  // Booking CRUD operations
  createBooking: (data: any) => privateClient.post('/bookings/create', data),
  userBookings: () => privateClient.get('/bookings/user/me'),
  vendorBookings: () => privateClient.get('/bookings/vendor/me'),
  getBookingDetails: (bookingId: string) => privateClient.get(`/bookings/${bookingId}`),
  CancelBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/cancel`, data),

  // Booking status operations
  vendorAcceptBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/accept`, data),
  vendorStartBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/start`, data),
  vendorCompleteBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/complete`, data),

  rescheduleBooking: (id: string, data: {
    newDate: any;
    newTime: any;
    reason: any;
  }) => privateClient.put(`/bookings/${id}/reschedule`, data),
};
