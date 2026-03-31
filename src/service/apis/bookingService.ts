import { publicClient } from "../apiClient";

export const bookingAPI = {
    createBooking: (data: any) => publicClient.post('/bookings/create', data),
    userBookings: () => publicClient.get('/bookings/user/me'),
    getAllAvailableBooking: () => publicClient.get('/bookings/available'),
    vendorBookings: () => publicClient.get('/bookings/vendor/me'),
    getBookingDetails: (bookingId: string) => publicClient.get(`/bookings/${bookingId}`),
    vendorAcceptBooking: (bookingId: string) => publicClient.post(`/bookings/${bookingId}/accept`),
    vendorStartBooking: (bookingId: string) => publicClient.post(`/bookings/${bookingId}/start`),
    vendorcompleteBooking: (bookingId: string) => publicClient.post(`/bookings/${bookingId}/complete`),
    vendorCancelBooking: (bookingId: string) => publicClient.post(`/bookings/${bookingId}/cancel`),
}
