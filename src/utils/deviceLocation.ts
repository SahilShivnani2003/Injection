import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Coordinates } from './geocoding';
// Android-only helper that shows the native "Turn on Location" system dialog
// (the same one Google Maps/Uber use) instead of sending the vendor to Settings.
//   npm install react-native-android-location-enabler
import {
    promptForEnableLocationIfNeeded,
    isLocationEnabled as isAndroidLocationEnabled,
} from 'react-native-android-location-enabler';

export class LocationPermissionDeniedError extends Error {
    constructor() {
        super('Location permission was denied.');
        this.name = 'LocationPermissionDeniedError';
    }
}

export class LocationServicesDisabledError extends Error {
    constructor() {
        super('Location services (GPS) are turned off.');
        this.name = 'LocationServicesDisabledError';
    }
}

// ── Permission: check WITHOUT prompting ──────────────────────────────────────
export async function hasLocationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        // iOS has no cheap synchronous check without react-native-permissions;
        // we rely on requestLocationPermission()/Geolocation itself to surface it.
        return true;
    }
    return PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
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
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        );
    });
}

// ── Location services (GPS): check ───────────────────────────────────────────
async function isLocationServicesEnabled(): Promise<boolean> {
    if (Platform.OS === 'android') {
        try {
            return await isAndroidLocationEnabled();
        } catch {
            return false;
        }
    }

    // iOS: no public API to check this without extra native modules. We probe
    // with a short timeout — POSITION_UNAVAILABLE (code 2) almost always means
    // Location Services are off at the OS level.
    return new Promise(resolve => {
        Geolocation.getCurrentPosition(
            () => resolve(true),
            (error: any) => resolve(error?.code !== 2),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 },
        );
    });
}

// ── Location services (GPS): prompt to enable ────────────────────────────────
async function promptEnableLocationServices(): Promise<boolean> {
    if (Platform.OS === 'android') {
        try {
            // Shows the in-app system dialog; resolves once the user turns GPS on.
            await promptForEnableLocationIfNeeded();
            return true;
        } catch {
            // User dismissed/declined the dialog.
            return false;
        }
    }

    // iOS: Apple doesn't allow apps to toggle Location Services directly,
    // so the best we can do is deep-link to Settings.
    return new Promise(resolve => {
        Alert.alert(
            'Turn On Location',
            'Please enable Location Services for this app in Settings to keep receiving nearby bookings.',
            [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        Linking.openURL('app-settings:');
                        // We resolve false here — the caller re-checks when the app
                        // comes back to the foreground (see useVendorLocationTracking).
                        resolve(false);
                    },
                },
            ],
        );
    });
}

// ── Orchestrator: run at login / app open ────────────────────────────────────
/**
 * 1. Permission not granted  -> request it. Still denied -> throw.
 * 2. Permission OK (already, or just granted) -> check GPS is on.
 *    If off -> prompt to enable. Still off -> throw.
 * 3. Both OK -> resolve with the vendor's current coordinates.
 */
export async function ensureLocationReady(): Promise<Coordinates> {
    const alreadyGranted = await hasLocationPermission();
    const permissionGranted =
        alreadyGranted || (await requestLocationPermission());
    if (!permissionGranted) {
        throw new LocationPermissionDeniedError();
    }

    const alreadyEnabled = await isLocationServicesEnabled();
    const servicesEnabled =
        alreadyEnabled || (await promptEnableLocationServices());
    if (!servicesEnabled) {
        throw new LocationServicesDisabledError();
    }

    return getCurrentCoordinates();
}

// ── Continuous tracking ───────────────────────────────────────────────────────
export function startTrackingVendorLocation(
    onUpdate: (coords: Coordinates) => void,
    onError?: (error: any) => void,
): number {
    return Geolocation.watchPosition(
        position => {
            onUpdate({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        },
        error => onError?.(error),
        {
            enableHighAccuracy: true,
            distanceFilter: 50, // only fire again after moving ~50m
            interval: 20000, // Android: how often to poll
            fastestInterval: 10000, // Android
        },
    );
}

export function stopTrackingVendorLocation(watchId: number): void {
    Geolocation.clearWatch(watchId);
}