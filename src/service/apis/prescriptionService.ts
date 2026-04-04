import { privateClient } from "../apiClient";

export const prescriptionService = {
    upload: (data: any) => privateClient.post('/prescriptions/upload-image', data),
    uploadWithBooking: (bookingId: string, data: any) =>
        privateClient.post(`/prescriptions/upload/${bookingId}`, data),
}