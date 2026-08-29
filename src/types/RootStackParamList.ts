import { NavigatorScreenParams } from "@react-navigation/native";
import { UserTabParamList } from "./UserTabParamList";
import { VendorTabParamList } from "./VendorTabParamList";
import { Booking } from "@/features/booking/types/Booking";

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    EmailLogin: undefined;
    Register: undefined;
    forgotPassword: undefined;
    BasicDetails: undefined;
    UploadPrescription: undefined;
    Requirements: undefined;
    Insurance: undefined;
    SlotBooking: undefined;
    Charges: { selectedServices: number[] };
    Complimentary: undefined;
    OrderTracking: undefined;
    LabPartner: undefined;
    StaffPanel: undefined;
    VendorRegister: undefined;
    VendorTab: NavigatorScreenParams<VendorTabParamList>;
    UserTab: NavigatorScreenParams<UserTabParamList>;
    Booking: undefined;
    BookingDetail: {
        bookingId: string;
    };
    Notification: undefined;
    VendorBookingDetail:{
        booking: Booking;
        notificationId: string
    }
    EditProfile:{
        userData: any
    },
    BookingMap: {
        bookingId: string;
    }
};