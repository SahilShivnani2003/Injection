import { NavigatorScreenParams } from "@react-navigation/native";
import { UserTabParamList } from "./UserTabParamList";

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    EmailLogin: undefined;
    Register: undefined;
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
    UserTab: NavigatorScreenParams<UserTabParamList>;
    Booking: undefined;
    BookingDetail: {
        bookingId: string;
    };
};