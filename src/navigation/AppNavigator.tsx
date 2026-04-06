import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import EmailLoginScreen from '../screens/auth/EmailLoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BasicDetailsScreen from '../screens/user/booking/BasicDetailsScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import LabPartnerScreen from '../screens/vendor/LabPartnerScreen';
import StaffPanelScreen from '../screens/staff/StaffPanelScreen';
import TabNavigator, { TabParamList } from './TabNavigator';
import { useColorScheme } from 'react-native';
import { AlertProvider } from '../context/AlertContext';
import BookingScreen from '../screens/user/BookingScreen';
import BookingDetailScreen from '@/screens/user/BookingDetailScreen';

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
    MainTab: NavigatorScreenParams<TabParamList>;
    Booking: undefined;
    BookingDetail: {
        bookingId: string;
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const isDarkMode = useColorScheme() === 'dark';
    return (
        <AlertProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Splash"
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        statusBarStyle: isDarkMode ? 'light' : 'dark',
                    }}
                >
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="BasicDetails" component={BasicDetailsScreen} />
                    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                    <Stack.Screen name="LabPartner" component={LabPartnerScreen} />
                    <Stack.Screen name="StaffPanel" component={StaffPanelScreen} />
                    <Stack.Screen name="MainTab" component={TabNavigator} />
                    <Stack.Screen name="Booking" component={BookingScreen} />
                    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </AlertProvider>
    );
}
