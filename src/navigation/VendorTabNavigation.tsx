import VendorDashboardScreen from '@/features/dashboard/screens/VendorDashboardScreen';
import VendorBookingsScreen from '@/features/booking/screens/VendorBookingsScreen';
import VendorServicesScreen from '@/features/vendorService/screens/VendorServicesScreen';
import VendorProfileScreen from '@/features/profile/screens/VendorProfileScreen';
import CustomTabBar from '@/components/CustomTabBar';
import { ITabItem } from '@/types/TabItem';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<VendorTabParamList>();

const TabItems: ITabItem[] = [
    {
        name: 'Dashboard',
        label: 'Dashboard',
        icon: 'home',
        iconOff: 'home-outline',
    },
    {
        name: 'Bookings',
        label: 'Bookings',
        icon: 'calendar',
        iconOff: 'calendar-outline',
    },
    {
        name: 'Services',
        label: 'Services',
        icon: 'medkit',
        iconOff: 'medkit-outline',
    },
    {
        name: 'Profile',
        label: 'Profile',
        icon: 'person',
        iconOff: 'person-outline',
    },
];

export default function VendorTabNavigation() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} tabs={TabItems} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Dashboard" component={VendorDashboardScreen} />
            <Tab.Screen name="Bookings" component={VendorBookingsScreen} />
            <Tab.Screen name="Services" component={VendorServicesScreen} />
            <Tab.Screen name="Profile" component={VendorProfileScreen} />
        </Tab.Navigator>
    );
}