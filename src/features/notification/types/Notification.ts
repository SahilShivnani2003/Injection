import { Booking } from "@/features/booking/types/Booking";

export interface Notification {
    _id: string;
    vendorId: string;
    bookingId: Booking;
    message: string;
    type?: 'new_booking' | 'booking_update' | 'general';
    isRead?: boolean;
    isAccepted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}