import { NavigationContainer,  NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import BasicDetailsScreen from '../screens/BasicDetailsScreen';
import UploadPrescriptionScreen from '../screens/UploadPrescriptionScreen';
import RequirementsScreen from '../screens/RequirementsScreen';
import InsuranceScreen from '../screens/InsuranceScreen';
import SlotBookingScreen from '../screens/SlotBookingScreen';
import ChargesScreen from '../screens/ChargesScreen';
import ComplimentaryScreen from '../screens/ComplimentaryScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import TabNavigator, { TabParamList } from './TabNavigator';
import { useColorScheme } from 'react-native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  BasicDetails: undefined;
  UploadPrescription: undefined;
  Requirements: undefined;
  Insurance: undefined;
  SlotBooking: undefined;
  Charges: { selectedServices: number[] };
  Complimentary: undefined;
  OrderTracking: undefined;
  MainTab: NavigatorScreenParams<TabParamList>;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
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
        <Stack.Screen name="BasicDetails" component={BasicDetailsScreen} />
        <Stack.Screen name="UploadPrescription" component={UploadPrescriptionScreen} />
        <Stack.Screen name="Requirements" component={RequirementsScreen} />
        <Stack.Screen name="Insurance" component={InsuranceScreen} />
        <Stack.Screen name="SlotBooking" component={SlotBookingScreen} />
        <Stack.Screen name="Charges" component={ChargesScreen} />
        <Stack.Screen name="Complimentary" component={ComplimentaryScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="MainTab" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
