import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import MapView, {
    MapStyleElement,
    Marker,
    Polyline,
    PROVIDER_GOOGLE,
    Region,
} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@/theme/colors';
import { Booking } from '../types/Booking';
import { addressToCoordinates, Coordinates } from '@/utils/geocoding';
import { getCurrentCoordinates, LocationPermissionDeniedError } from '@/utils/deviceLocation';
import { getRoute, RouteInfo } from '@/utils/directions';
import mapThemeStyleRaw from '@/theme/mapStyle.json';
import { bookingAPI } from '@/service/apis/bookingService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

const mapThemeStyle = mapThemeStyleRaw as MapStyleElement[];

type BookingMapScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingMap'>;
type LoadState = 'loading' | 'ready' | 'error';

export const BookingMapScreen = ({ navigation, route:routeData }: BookingMapScreenProps) => {   
    const mapRef = useRef<MapView | null>(null);
    const bookingId = routeData.params.bookingId;
    const [state, setState] = useState<LoadState>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [booking, setBooking] = useState<Booking | null>(null);
    const [origin, setOrigin] = useState<Coordinates | null>(null);
    const [destination, setDestination] = useState<Coordinates | null>(null);
    const [route, setRoute] = useState<RouteInfo | null>(null);

    const load = useCallback(async () => {
        setState('loading');
        setErrorMessage(null);

        try {
            // 1. Fetch booking details
            const response = await bookingAPI.getBookingDetails(bookingId);
            debugger
            const bookingData = response.data?.data;
            setBooking(response.data?.data);

            // 2. Get staff/vendor's current position
            let currentCoords: Coordinates;
            try {
                currentCoords = await getCurrentCoordinates();
            } catch (err) {
                if (err instanceof LocationPermissionDeniedError) {
                    throw new Error('Location permission denied. Enable it to see the route.');
                }
                throw new Error('Could not determine your current location.');
            }
            setOrigin(currentCoords);

            // 3. Geocode the booking address into coordinates
            const fullAddress = [bookingData.address, bookingData.pincode]
                .filter(Boolean)
                .join(', ');
            const geocoded = await addressToCoordinates(fullAddress);
            if (!geocoded) {
                throw new Error('Could not locate this address on the map.');
            }
            const destCoords = geocoded.coordinates;
            setDestination(destCoords);

            // 4. Fetch the driving route between the two points
            const routeInfo = await getRoute(currentCoords, destCoords);
            setRoute(routeInfo);

            // 5. Fit the map to show both points + route
            requestAnimationFrame(() => {
                const coordsToFit = routeInfo?.coordinates?.length
                    ? routeInfo.coordinates
                    : [currentCoords, destCoords];
                mapRef.current?.fitToCoordinates(coordsToFit, {
                    edgePadding: { top: 80, bottom: 220, left: 60, right: 60 },
                    animated: true,
                });
            });

            setState('ready');
        } catch (err: any) {
            setErrorMessage(err?.message || 'Something went wrong loading the map.');
            setState('error');
        }
    }, [bookingId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleRecenter = useCallback(() => {
        if (!origin || !destination) return;
        const coordsToFit = route?.coordinates?.length ? route.coordinates : [origin, destination];
        mapRef.current?.fitToCoordinates(coordsToFit, {
            edgePadding: { top: 80, bottom: 220, left: 60, right: 60 },
            animated: true,
        });
    }, [origin, destination, route]);

    const handleStartNavigation = useCallback(() => {
        if (!destination) return;
        const { latitude, longitude } = destination;
        const label = encodeURIComponent(booking?.patientName || 'Booking Location');

        const url = Platform.select({
            ios: `maps://app?daddr=${latitude},${longitude}&q=${label}`,
            android: `google.navigation:q=${latitude},${longitude}`,
        });

        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

        Linking.canOpenURL(url ?? fallbackUrl)
            .then(supported => {
                Linking.openURL(supported && url ? url : fallbackUrl);
            })
            .catch(() => Linking.openURL(fallbackUrl));
    }, [destination, booking]);

    /* ─────────────────────── Loading / error states ─────────────────────── */

    if (state === 'loading') {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.centerStateText}>Loading booking location...</Text>
            </View>
        );
    }

    if (state === 'error') {
        return (
            <View style={styles.centerState}>
                <Icon name="error-outline" size={32} color="#E53935" />
                <Text style={[styles.centerStateText, { color: '#E53935' }]}>{errorMessage}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.85}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!origin || !destination) return null;

    const initialRegion: Region = {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    /* ─────────────────────── Map ─────────────────────── */

    return (
        <View style={styles.root}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                initialRegion={initialRegion}
                customMapStyle={mapThemeStyle}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
            >
                <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={styles.originDot}>
                        <View style={styles.originDotInner} />
                    </View>
                </Marker>

                <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }}>
                    <View style={styles.destPin}>
                        <Icon name="location-on" size={30} color={Colors.gradientStart} />
                    </View>
                </Marker>

                {!!route?.coordinates?.length && (
                    <Polyline
                        coordinates={route.coordinates}
                        strokeWidth={4}
                        strokeColor={Colors.gradientStart}
                    />
                )}
            </MapView>

            {/* ── Recenter button ── */}
            <TouchableOpacity
                style={styles.recenterBtn}
                onPress={handleRecenter}
                activeOpacity={0.85}
            >
                <Icon name="my-location" size={20} color={Colors.gradientStart} />
            </TouchableOpacity>

            {/* ── Bottom info card ── */}
            <View style={styles.bottomCard}>
                <View style={styles.bookingInfoRow}>
                    <View style={styles.bookingInfoIcon}>
                        <Icon name="person" size={18} color={Colors.gradientStart} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.patientName} numberOfLines={1}>
                            {booking?.patientName}
                        </Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                            {booking?.address}
                            {booking?.pincode ? ` - ${booking.pincode}` : ''}
                        </Text>
                    </View>
                </View>

                {!!route && (
                    <View style={styles.etaRow}>
                        <View style={styles.etaChip}>
                            <Icon name="schedule" size={14} color={Colors.textMuted} />
                            <Text style={styles.etaText}>{route.durationText}</Text>
                        </View>
                        <View style={styles.etaChip}>
                            <Icon name="route" size={14} color={Colors.textMuted} />
                            <Text style={styles.etaText}>{route.distanceText}</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.navigateBtn}
                    onPress={handleStartNavigation}
                    activeOpacity={0.85}
                >
                    <Icon name="navigation" size={18} color={Colors.white} />
                    <Text style={styles.navigateText}>Start Navigation</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },

    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 32,
        backgroundColor: Colors.white,
    },
    centerStateText: { fontSize: 14, color: Colors.textMedium, textAlign: 'center' },
    retryBtn: {
        marginTop: 8,
        backgroundColor: Colors.gradientStart,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    retryText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

    originDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0,166,126,0.2)', // adjust to Colors.gradientStart w/ opacity
        alignItems: 'center',
        justifyContent: 'center',
    },
    originDotInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.gradientStart,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    destPin: { alignItems: 'center', justifyContent: 'center' },

    recenterBtn: {
        position: 'absolute',
        right: 16,
        bottom: 190,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0B2E3A',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },

    bottomCard: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 24,
        shadowColor: '#0B2E3A',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
    },
    bookingInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    bookingInfoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E6FAF5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    patientName: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 2 },
    addressText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },

    etaRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    etaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#F8FBFC',
        borderWidth: 1,
        borderColor: '#E8F0F4',
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    etaText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },

    navigateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.gradientStart,
        borderRadius: 14,
        height: 50,
        marginTop: 16,
    },
    navigateText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});