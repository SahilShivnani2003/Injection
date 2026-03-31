import { privateClient, publicClient } from "../apiClient";

export const serviceAPI = {
    createService: (data:any) => publicClient.post('/services/create', data),
    getAllServices: () => publicClient.get('/services'),
    vendorServices: () => privateClient.get(`/services/vendor/me`),
    getServiceByVendorID: (vendorId:string) => publicClient.get(`/services/vendor/${vendorId}`),
    getServiceCategoryById: (categoryId:string) => publicClient.get(`/services/category/${categoryId}`),
    getServiceById: (serviceId:string) => publicClient.get(`/services/${serviceId}`),
    updateService: (serviceId:string, data:any) => privateClient.put(`/services/${serviceId}`, data),
    deleteService: (serviceId:string) => privateClient.delete(`/services/${serviceId}`),
    toggleServiceStatus: (serviceId:string, status:boolean) => privateClient.patch(`/services/${serviceId}/toggle-status`, { status }),
}