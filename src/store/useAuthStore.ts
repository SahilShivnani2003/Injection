import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AuthState = {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    setAuth: (user: User, token: string) => void;
    removeAuth: () => void;
    loadAuth: () => void;
};

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    token: null,
    user: null,
    setAuth: async (user: User, token: string) => {

        try {
            if (!user || !token) {
                console.error('AUTH DATA MISSING ');
                return;
            }

            const data = JSON.stringify({ user, token });

            await AsyncStorage.setItem(STORAGE_KEY, data);

            set({
                isAuthenticated: true,
                user: user,
                token: token
            })

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
                    token: auth?.token
                })
            } else {
                console.warn('NO USER DATA FOUND.')
            }
        } catch (error: any) {
            console.error('ERROR WHILE LOADING AUTH : ', error);
        }
    },
}))