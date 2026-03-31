import { CreateUserDTO } from "../../types/user";
import { publicClient } from "../apiClient";

export const userApi = {
    login: (data: {
        email: string,
        password: string
    }) => publicClient.post('/users/login', data),
    register: (data: CreateUserDTO) => publicClient.post('/users/register', data),
    getProfile: () => publicClient.get('/users/me'),
    updateProfile: (data: any) => publicClient.put('/users/profile', data),
};