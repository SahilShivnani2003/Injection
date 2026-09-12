import { User } from "@/features/profile/types/User";
import { Vendor } from "@/features/profile/types/Vendor";
import requestNotificationPermission from "@/utils/requestNotificationPermission";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import messaging from '@react-native-firebase/messaging';
import { IRegisterDevice, registerDevice } from "@/features/notification/service/notification.service";
import { DeviceConfig } from "@/config/deviceConfig";
import { getApp } from '@react-native-firebase/app';
import {
    getMessaging,
    getToken,
} from '@react-native-firebase/messaging';

type AuthState = {
    isAuthenticated: boolean;
    token: string | null;
    loggedInRole: 'patient' | 'Vendor' | null;
    user: User | Vendor | null;
    setAuth: (user: User | Vendor, role: 'patient' | 'Vendor', token: string) => void;
    removeAuth: () => void;
    loadAuth: () => void;
};

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    token: null,
    user: null,
    loggedInRole: null,
    setAuth: async (user: User | Vendor, role: 'patient' | 'Vendor', token: string) => {

        try {
            if (!user || !token) {
                console.error('AUTH DATA MISSING ');
                return;
            }

            const data = JSON.stringify({ user, token, role });

            await AsyncStorage.setItem(STORAGE_KEY, data);

            set({
                isAuthenticated: true,
                user: user,
                token: token,
                loggedInRole: role
            })

            try {
                console.log('1. Requesting notification permission...');

                const hasPermission = await requestNotificationPermission();

                console.log('2. Permission result:', hasPermission);

                if (hasPermission) {
                    console.log('3. Getting FCM token...');

                    const fcmToken = await messaging().getToken();

                    console.log('4. FCM token:', fcmToken);

                    const registerDeviceData: IRegisterDevice = {
                        token: fcmToken,
                        deviceType: 'android',
                        platform: 'app',
                        appVersion: DeviceConfig.version,
                    };

                    console.log('5. Registering device...');

                    await registerDevice(registerDeviceData);

                    console.log('6. Device registered successfully');
                }
            } catch (fcmError) {
                console.error('FCM/DEVICE ERROR:', fcmError);
            }

        } catch (error: any) {
            console.error('ERROR WHILE SAVING AUTH : ', error);
        }
    },
    removeAuth: async () => {
        try {

            await AsyncStorage.removeItem(STORAGE_KEY);

            set({
                isAuthenticated: false,
                user: null,
                token: null
            })
        } catch (error: any) {
            console.error('ERROW WHILE REMOVING AUTH : ', error);
        }
    },
    loadAuth: async () => {
        try {

            const data = await AsyncStorage.getItem(STORAGE_KEY);

            if (data) {
                const auth = JSON.parse(data);

                set({
                    isAuthenticated: true,
                    user: auth?.user,
                    token: auth?.token,
                    loggedInRole: auth?.role
                })
            } else {
                console.warn('NO USER DATA FOUND.')
            }
        } catch (error: any) {
            console.error('ERROR WHILE LOADING AUTH : ', error);
        }
    },
}))