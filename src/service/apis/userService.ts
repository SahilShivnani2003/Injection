import { publicClient } from "../apiClient";

export const userApi = {
    login: (data: any) => publicClient.post('/users/login', data),
    register: (data: any) => publicClient.post('/users/register', data),
    getProfile: () => publicClient.get('/users/me'),
    updateProfile: (data: any) => publicClient.put('/users/profile', data),
};