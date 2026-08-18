import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Coordinates } from './geocoding';

export class LocationPermissionDeniedError extends Error {
    constructor() {
        super('Location permission was denied.');
        this.name = 'LocationPermissionDeniedError';
    }
}

// ── Permission request ────────────────────────────────────────────────────────
async function requestLocationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true; 

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: 'Location Permission',
            message: 'We need your location to auto-fill your business address.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
        },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
}

// ── Current position ───────────────────────────────────────────────────────────
export async function getCurrentCoordinates(): Promise<Coordinates> {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) throw new LocationPermissionDeniedError();

    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            error => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    });
}