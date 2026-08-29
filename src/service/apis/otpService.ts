import { publicClient } from "../apiClient";

export interface ISendOtp {
    phone: string;
    type: 'user' | 'vendor' | 'ambassador';
    isForgotPassword: boolean;
}

export interface IResetPassword {
    phone: string;
    type: 'user' | 'vendor' | 'ambassador';
    newPassword: string;
}
export const OtpService = {
    sendOtp: (data: ISendOtp) => publicClient.post('/otp/send', data),
    verifyOtp: (data: { phone: string, otp: string }) => publicClient.post('/otp/verify', data),
    resetPassword: (data: IResetPassword) => publicClient.post('/otp/reset-password', data),
}