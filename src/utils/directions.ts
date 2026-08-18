import { envConfig } from '@/config/env';
import { Coordinates } from './geocoding';

const apiKey = envConfig.GOOGLEAPI;

export type RouteInfo = {
    coordinates: Coordinates[];
    distanceText: string;
    durationText: string;
    distanceMeters: number;
    durationSeconds: number;
};

// Decodes Google's encoded polyline format into an array of lat/lng points.
function decodePolyline(encoded: string): Coordinates[] {
    const points: Coordinates[] = [];
    let index = 0,
        lat = 0,
        lng = 0;

    while (index < encoded.length) {
        let b,
            shift = 0,
            result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
}

export async function getRoute(
    origin: Coordinates,
    destination: Coordinates,
): Promise<RouteInfo | null> {
    const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `&mode=driving&key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'OK' || !data.routes?.length) {
            throw new Error(data.error_message || `Directions request failed: ${data.status}`);
        }

        const route = data.routes[0];
        const leg = route.legs?.[0];

        return {
            coordinates: decodePolyline(route.overview_polyline.points),
            distanceText: leg?.distance?.text ?? '',
            durationText: leg?.duration?.text ?? '',
            distanceMeters: leg?.distance?.value ?? 0,
            durationSeconds: leg?.duration?.value ?? 0,
        };
    } catch (error) {
        console.error('Error fetching directions:', error);
        return null;
    }
}