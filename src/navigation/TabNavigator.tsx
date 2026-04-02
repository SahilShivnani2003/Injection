import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import DashboardScreen from '../screens/user/tabs/DashboardScreen';
import ProfileScreen from '../screens/user/tabs/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';
import BookingsScreen from '../screens/user/tabs/BookingsScreen';
import { ITabItem } from '../types/ITabItems';

export type TabParamList = {
    Dashboard: undefined;
    Bookings: undefined;
    Profile: undefined;
};

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
    }
]
const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
