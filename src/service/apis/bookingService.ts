import { privateClient, publicClient } from "../apiClient";

export const bookingAPI = {
  // Booking CRUD operations
  createBooking: (data: any) => privateClient.post('/bookings/create', data),
  userCreateBooking: (data: any) => privateClient.post('user-bookings/create', data),
  userBookings: () => privateClient.get('/bookings/user/me'),
  vendorBookings: () => privateClient.get('/bookings/vendor/me'),
  availableBookings: () => privateClient.get('/bookings/available'),
  getBookingDetails: (bookingId: string) => privateClient.get(`/bookings/${bookingId}`),
  // CancelBooking: (bookingId: string) => privateClient.put(`/bookings/${bookingId}/cancel`, bookingId),

  // Booking status operations
  vendorAcceptBooking: (data: any) => privateClient.post(`/bookings/${data.bookingId}/accept`, data),
  vendorStartBooking: (data: any) => privateClient.put(`/bookings/${data.bookingId}/start`, data),
  vendorCompleteBooking: (data: any) => privateClient.put(`/bookings/${data.bookingId}/complete`, data),

  rescheduleBooking: (id: string, data: {
    newDate: any;
    newTime: any;
    reason: any;
  }) => privateClient.put(`/bookings/${id}/reschedule`, data),


  // User booking endpoints 
  getNotifications: () => privateClient.get('/user-bookings/notifications'),
  acceptUserBooking: (bookingId: string) => privateClient.put(`/user-bookings/accept/${bookingId}`),
  readNotification: (notificatonId: string) => privateClient.put(`/user-bookings/notifications/${notificatonId}/read`),
};

export const cancelBooking = async (bookingId: string) => {
  try {
    debugger
    const response = await privateClient.put(`/bookings/${bookingId}/cancel`, { bookingId });
    console.log('canceled:', response);
    return response.data;
  } catch (error) {
    console.error('Error canceling booking...:', error);
    throw error;
  }
}
