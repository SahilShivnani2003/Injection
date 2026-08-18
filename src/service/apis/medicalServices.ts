import { privateClient, publicClient } from "../apiClient";

export const serviceAPI = {
    createService: (data:any) => privateClient.post('/services/create', data),
    getAllServices: () => publicClient.get('/services'),
    vendorServices: () => privateClient.get(`/services/vendor/me`),
    getServiceByVendorID: (vendorId:string) => publicClient.get(`/services/vendor/${vendorId}`),
    getServiceCategoryById: (categoryId:string) => publicClient.get(`/services/category/${categoryId}`),
    getServiceById: (serviceId:string) => publicClient.get(`/services/${serviceId}`),
    updateService: (serviceId:string, data:any) => privateClient.put(`/services/${serviceId}`, data),
    deleteService: (serviceId:string) => privateClient.delete(`/services/${serviceId}`),
    toggleServiceStatus: (serviceId:string) => privateClient.put(`/services/${serviceId}/toggle-status`),
    getCategories: () => publicClient.get('/categories'),
    vendorServiceRequest: (services: string[]) => privateClient.post('/vendor-service-requests/create', {services}),
    myRequests: () => privateClient.get('/vendor-service-requests/my-requests'),
}