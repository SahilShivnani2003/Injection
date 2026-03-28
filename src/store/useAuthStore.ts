import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface authState {
    isAuthenticated: boolean;
    token: string | null;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    loadAuthState: () => Promise<void>;
}

export const useAuthStore = create<authState>((set) => ({
    isAuthenticated: false,
    token: null,
    user: null,
    login: (token, user) => {
        set({ token, user, isAuthenticated: true });
        AsyncStorage.setItem('auth', JSON.stringify({ token, user }));
    }   ,
    logout: () => {
        set({ token: null, user: null, isAuthenticated: false });           
        AsyncStorage.removeItem('auth');
    },
    loadAuthState: async () => {
        const auth = await AsyncStorage.getItem('auth');
        if (auth) {
            const { token, user } = JSON.parse(auth);
            set({ token, user, isAuthenticated: true });
        }
    }
}));
