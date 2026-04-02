import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = 'https://injection-grq4.onrender.com/api';

export const publicClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

export const privateClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

privateClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})