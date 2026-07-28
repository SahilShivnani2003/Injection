import { privateClient } from "@/service/apiClient";

export interface IRegisterDevice {
    token: string;
    deviceType: 'android' | 'ios' | 'web';
    platform: 'app';
    appVersion: string;
}

export const registerDevice = async(data: IRegisterDevice) => {
    try{
        const response = await privateClient.post('/notifications/devices/register', data);
        console.log('Device registered successfully:', response.data);
        return response.data;
    }catch(error){
        console.error('failed to register device : ', error);
        throw error;
    }
}