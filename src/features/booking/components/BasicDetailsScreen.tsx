import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../theme/colors';
import { FieldInput } from '../../../components/FieldInput';
import { DropdownSelect } from '../../../components/DropdownSelect'; // adjust path if different
import { BookingFormData } from '../screens/BookingScreen';
import { getStates, getCitiesByState } from '@/utils/location';
import { getCurrentCoordinates, LocationPermissionDeniedError } from '@/utils/deviceLocation'; // adjust path
import { coordinatesToAddress, addressToCoordinates } from '../../../utils/geocoding'; // adjust path
import { useAlert } from '@/context/AlertContext';

const SEX_OPTIONS = ['Male', 'Female', 'Other'];

/* ─────────────────────── Types ─────────────────────── */

/** Subset of BookingFormData that lives in Step 1 */
export interface BasicDetails {
    patientName: string;
    age: string;
    sex: string;
    address: string;
    pincode: string;
    state: string; // NEW
    city: string; // NEW
    currentLocation: string;
    phoneNumber: string;
    email: string;
}

interface BasicDetailsScreenProps {
    basicDetails: BasicDetails;
    /**
     * FIX: Accepts a (field, value) pair instead of a functional updater.
     * This prevents the field-clearing bug caused by passing a function into
     * BookingScreen's setFormData spread.
     */
    onChange: (field: keyof BookingFormData, value: string) => void;
}

const ADDRESS_GEOCODE_DEBOUNCE_MS = 900;
const MIN_ADDRESS_LENGTH_FOR_GEOCODE = 8; // avoid firing on "12 M" etc.

/* ─────────────────────── Sex selector ─────────────────────── */

const SexSelector: React.FC<{ value: string; onChange: (v: string) => void }> = ({
    value,
    onChange,
}) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>
            Sex<Text style={styles.required}> *</Text>
        </Text>
        <View style={styles.pillRow}>
            {SEX_OPTIONS.map(opt => {
                const active = value === opt;
                return (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => onChange(opt)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                            {opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);

/* ─────────────────────── Section divider ─────────────────────── */

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionRow}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

/* ─────────────────────── Main Screen ─────────────────────── */

const BasicDetailsScreen: React.FC<BasicDetailsScreenProps> = ({ basicDetails, onChange }) => {
    const alert = useAlert();
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Manual-address → coordinates geocoding state
    const [addressGeocoding, setAddressGeocoding] = useState(false);
    const [addressGeocodeError, setAddressGeocodeError] = useState<string | null>(null);
    const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastGeocodedAddress = useRef<string>('');

    const handlePatientName = useCallback((v: string) => onChange('patientName', v), [onChange]);
    const handleAge = useCallback(
        (v: string) => onChange('age', v.replace(/[^0-9]/g, '')),
        [onChange],
    );
    const handleSex = useCallback((v: string) => onChange('sex', v), [onChange]);

    const handlePincode = useCallback(
        (v: string) => onChange('pincode', v.replace(/[^0-9]/g, '')),
        [onChange],
    );
    const handlePhone = useCallback(
        (v: string) => onChange('phoneNumber', v.replace(/[^0-9]/g, '')),
        [onChange],
    );
    const handleEmail = useCallback((v: string) => onChange('email', v), [onChange]);

    // ── State / City cascading dropdowns ──
    const handleStateChange = useCallback(
        (v: string) => {
            onChange('state', v);
            onChange('city', '');
        },
        [onChange],
    );

    const handleCityChange = useCallback((v: string) => onChange('city', v), [onChange]);

    const searchStates = useCallback(async (query: string) => {
        const states = await getStates(query || 'a');
        return states.map(s => ({ label: s.name, value: s.name }));
    }, []);

    const searchCities = useCallback(
        async (query: string) => {
            if (!basicDetails.state) return [];
            const cities = await getCitiesByState(query || basicDetails.state, basicDetails.state);
            return cities.map(c => ({ label: c.name, value: c.name }));
        },
        [basicDetails.state],
    );

    // ── Manual address entry → forward geocode → fill state/city/pincode/coords ──
    const runAddressGeocode = useCallback(
        async (address: string) => {
            if (address.trim().length < MIN_ADDRESS_LENGTH_FOR_GEOCODE) return;

            setAddressGeocoding(true);
            setAddressGeocodeError(null);
            try {
                const geocoded = await addressToCoordinates(address);
                if (geocoded) {
                    // Don't clobber what the user typed in the free-text field;
                    // just fill in the structured fields we derived from it.
                    onChange('pincode', geocoded.pincode || '');
                    onChange('state', geocoded.state || '');
                    onChange('city', geocoded.city || '');
                    onChange(
                        'currentLocation',
                        `${geocoded.coordinates.latitude},${geocoded.coordinates.longitude}`,
                    );
                    lastGeocodedAddress.current = address;                    
                } else {
                    setAddressGeocodeError(
                        'Could not locate that address. Please check state/city/pin code manually.',
                    );
                }
            } catch (err) {
                setAddressGeocodeError(
                    'Could not verify that address right now. Please check state/city/pin code manually.',
                );

                if (err instanceof LocationPermissionDeniedError) {
                    alert.error(
                        'Permission Denied',
                        'Location access is needed to auto-fill your address. You can still enter it manually.',
                    );
                } else {
                    console.error('Error getting current location:', err);
                    alert.error('Location Error', 'Unable to fetch your current location.');
                }
            } finally {
                setAddressGeocoding(false);
            }
        },
        [onChange],
    );

    const handleAddress = useCallback(
        (v: string) => {
            onChange('address', v);
            setAddressGeocodeError(null);

            if (geocodeTimer.current) {
                clearTimeout(geocodeTimer.current);
                geocodeTimer.current = null;
            }

            if (v.trim().length < MIN_ADDRESS_LENGTH_FOR_GEOCODE) return;

            // FieldInput doesn't forward onBlur, so debounced onChangeText
            // is the only trigger point available here.
            geocodeTimer.current = setTimeout(() => {
                runAddressGeocode(v);
            }, ADDRESS_GEOCODE_DEBOUNCE_MS);
        },
        [onChange, runAddressGeocode],
    );

    useEffect(() => {
        return () => {
            if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        };
    }, []);

    // ── Use current location ──
    const handleUseCurrentLocation = useCallback(async () => {
        setLocating(true);
        setLocationError(null);
        try {
            const coords = await getCurrentCoordinates();
            debugger;
            const geocoded = await coordinatesToAddress(coords);
            if (geocoded) {
                onChange('address', geocoded.addressLine || geocoded.formattedAddress);
                onChange('pincode', geocoded.pincode);
                onChange('state', geocoded.state);
                onChange('city', geocoded.city);
                onChange(
                    'currentLocation',
                    `${geocoded.coordinates.latitude},${geocoded.coordinates.longitude}`,
                );
                lastGeocodedAddress.current = geocoded.addressLine || geocoded.formattedAddress;
            } else {
                setLocationError('Could not detect your address. Please enter it manually.');
            }
        } catch (err) {
            if (err instanceof LocationPermissionDeniedError) {
                setLocationError('Location permission denied. Please enter address manually.');
            } else {
                setLocationError('Unable to fetch your location. Please try again.');
            }
        } finally {
            setLocating(false);
        }
    }, [onChange]);

    return (
        <View style={styles.root}>
            {/* ── Personal Info ── */}
            <SectionLabel title="Personal Info" />

            <FieldInput
                label="Patient Name"
                required
                value={basicDetails.patientName}
                onChangeText={handlePatientName}
                placeholder="Full name of patient"
            />

            <View style={styles.rowTwo}>
                <View style={styles.rowHalf}>
                    <FieldInput
                        label="Age"
                        required
                        value={basicDetails.age}
                        onChangeText={handleAge}
                        keyboardType="number-pad"
                        maxLength={3}
                        placeholder="Years"
                    />
                </View>
                <View style={styles.rowHalf}>
                    <SexSelector value={basicDetails.sex} onChange={handleSex} />
                </View>
            </View>

            {/* ── Location ── */}
            <SectionLabel title="Location" />

            <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleUseCurrentLocation}
                activeOpacity={0.8}
                disabled={locating}
            >
                {locating ? (
                    <ActivityIndicator size="small" color={Colors.gradientStart} />
                ) : (
                    <Icon name="my-location" size={18} color={Colors.gradientStart} />
                )}
                <Text style={styles.locationBtnText}>
                    {locating ? 'Detecting your location...' : 'Use Current Location'}
                </Text>
            </TouchableOpacity>
            {!!locationError && <Text style={styles.errorText}>{locationError}</Text>}

            <FieldInput
                label="Address"
                required
                value={basicDetails.address}
                onChangeText={handleAddress}
                multiline
                placeholder="House no., street, locality"
            />
            {addressGeocoding && (
                <View style={styles.inlineStatusRow}>
                    <ActivityIndicator size="small" color={Colors.gradientStart} />
                    <Text style={styles.inlineStatusText}>Locating address...</Text>
                </View>
            )}
            {!!addressGeocodeError && <Text style={styles.errorText}>{addressGeocodeError}</Text>}

            <DropdownSelect
                label="State"
                required
                placeholder="Select state"
                searchable
                value={basicDetails.state}
                onChange={handleStateChange}
                onSearch={searchStates}
                emptyText="No states found."
            />

            <DropdownSelect
                label="City"
                required
                placeholder="Select city"
                searchable
                disabled={!basicDetails.state}
                disabledHint="Select a state first"
                value={basicDetails.city}
                onChange={handleCityChange}
                onSearch={searchCities}
                emptyText="No cities found."
            />

            <FieldInput
                label="Pin Code"
                required
                value={basicDetails.pincode}
                onChangeText={handlePincode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="6-digit"
            />

            {/* ── Contact ── */}
            <SectionLabel title="Contact" />

            <FieldInput
                label="Phone Number"
                required
                value={basicDetails.phoneNumber}
                onChangeText={handlePhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="10-digit mobile number"
            />

            <FieldInput
                label="Email Address"
                required
                value={basicDetails.email}
                onChangeText={handleEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
            />
        </View>
    );
};

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },

    fieldWrap: { marginBottom: 16 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    required: { color: Colors.gradientStart },

    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 8,
        gap: 10,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: '#E8F0F4' },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },

    rowTwo: { flexDirection: 'row', gap: 12, marginBottom: 0 },
    rowHalf: { flex: 1 },

    pillRow: { flexDirection: 'row', gap: 8 },
    pill: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        backgroundColor: '#F8FBFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
    },
    pillText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
    pillTextActive: { color: Colors.gradientStart, fontWeight: '800' },

    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 46,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
        marginBottom: 16,
    },
    locationBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gradientStart },
    errorText: {
        fontSize: 11,
        color: '#E53935',
        fontWeight: '500',
        marginBottom: 12,
        marginTop: -8,
    },
    inlineStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginTop: -8,
    },
    inlineStatusText: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '500',
    },
});

export default BasicDetailsScreen;
