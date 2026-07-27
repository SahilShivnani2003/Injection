import { Booking } from "@/features/booking/types/Booking";

export interface Notification {
    vendorId: string;
    bookingId: string | Booking;
    message: string;
    type?: 'new_booking' | 'booking_update' | 'general';
    isRead?: boolean;
    isAccepted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}