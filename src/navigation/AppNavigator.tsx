import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import EmailLoginScreen from '../features/auth/screens/EmailLoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import BasicDetailsScreen from '../features/booking/components/BasicDetailsScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import VendorRegisterScreen from '../features/auth/screens/VendorRegistrationScreen';
import VendorTabNavigation from './VendorTabNavigation';
import TabNavigator from './TabNavigator';
import { useColorScheme } from 'react-native';
import { AlertProvider } from '../context/AlertContext';
import BookingScreen from '../features/booking/screens/BookingScreen';
import BookingDetailScreen from '@/features/booking/screens/BookingDetailScreen';
import { RootStackParamList } from '@/types/RootStackParamList';
import { NotificationScreen } from '@/features/notification/screen/NotificationScreen';
import { UserProfileEditScreen } from '@/features/profile/screens/UserProfileEditScreen';

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
                    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                    <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
                    <Stack.Screen name="VendorTab" component={VendorTabNavigation} />
                    <Stack.Screen name="UserTab" component={TabNavigator} />
                    <Stack.Screen name="Booking" component={BookingScreen} />
                    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
                    <Stack.Screen name="Notification" component={NotificationScreen} />
                    <Stack.Screen name="EditProfile" component={UserProfileEditScreen}/>
                </Stack.Navigator>
            </NavigationContainer>
        </AlertProvider>
    );
}
