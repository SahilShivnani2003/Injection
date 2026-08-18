import { publicClient } from "../apiClient";

export const OtpService = {
    sendOtp: (phone: string) => publicClient.post('/otp/send', { phone }),
    verifyOtp: (data: { phone: string, otp: string }) => publicClient.post('/otp/verify', data),
}