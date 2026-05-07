import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import DashboardScreen from '../features/dashboard/screens/UserDashboardScreen';
import ProfileScreen from '../features/profile/screens/UserProfileScreen';
import CustomTabBar from '../components/CustomTabBar';
import BookingsScreen from '../features/booking/screens/UserBookingsScreen';
import { ITabItem } from '../types/TabItem';
import { View } from 'react-native';
import { UserTabParamList } from '@/types/UserTabParamList';

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
        name: 'Profile',
        label: 'Profile',
        icon: 'person',
        iconOff: 'person-outline',
    },
];
const Tab = createBottomTabNavigator<UserTabParamList>();

export default function TabNavigator() {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                tabBar={props => <CustomTabBar {...props} tabs={TabItems} />}
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' },
                }}
            >
                <Tab.Screen name="Dashboard" component={DashboardScreen} />
                <Tab.Screen name="Bookings" component={BookingsScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </View>
    );
}
