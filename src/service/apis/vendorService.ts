import { privateClient, publicClient } from "../apiClient";

export const vendorAPI = {
    registerVendor: (data: any) =>
        publicClient.post('/vendors/register', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    loginVendor: (data: any) => publicClient.post('/vendors/login', data),
    fetchProfile: (id: any) => privateClient.get(`/vendors/${id}`),
    updateProfile: (data: any) => privateClient.put('/vendors/profile', { data }),
    uploadImage: (data: any) => publicClient.post('/vendors/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    vendorIdCard: (_id: string) => privateClient.get(`/vendors/${_id}/id-card`)
}