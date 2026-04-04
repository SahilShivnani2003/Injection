import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const BASE_URL = 'https://injection-hkgt.onrender.com/api'

//Public client for public routes
export const publicClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

//Error handling for the public client
publicClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || 'Something went wrong';

        return Promise.reject({
            status,
            message,
            data: error?.response?.data
        })
    }
);

//Private Client for protected routes
export const privateClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

//Adding token dynamicaly in private client
privateClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    (error) => Promise.reject(error)
);

//Error handling for private client 
privateClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || 'Something went wrong';

        return Promise.reject({
            status,
            message,
            data: error?.response?.data
        })
    }
)