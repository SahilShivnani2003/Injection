import { publicClient } from "../apiClient";

export const vendorAPI = {
    registerVendor: (data: any) => publicClient.post('/vendors/register', data),
    loginVendor: (data: any) => publicClient.post('/vendors/login', data),
    fetchProfile: (id: any) => publicClient.get(`/vendors/${id}`),
    updateProfile: (data: any) => publicClient.put('/vendors/profile', data),
}