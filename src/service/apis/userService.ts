import { RegisterForm } from "@/features/auth/types/RegisterForm";
import { privateClient, publicClient } from "../apiClient";

export const userApi = {
    login: (data: {
        email: string,
        password: string
    }) => publicClient.post('/users/login', data),
    register: (data: RegisterForm) => publicClient.post('/users/register', data),
    getProfile: () => privateClient.get('/users/me'),
    updateProfile: (data: any) => privateClient.put('/users/profile', data),
};