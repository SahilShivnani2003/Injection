import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";

export const DeviceConfig = {
    version: DeviceInfo.getVersion(),
    deviceId: DeviceInfo.getDeviceId(),
    platform: Platform.OS, 
};