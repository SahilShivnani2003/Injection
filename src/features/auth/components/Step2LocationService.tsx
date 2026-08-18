import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { DropdownSelect } from '../../../components/DropdownSelect';
import { FieldInput } from '../../../components/FieldInput';
import { Colors } from '../../../theme/colors';
import { VendorForm } from '../types/VendorRegistration';
import { Service } from '@/features/vendorService/types/Service';
import { serviceAPI } from '@/service/apis/medicalServices';
import { getStates, getCitiesByState, getCities } from '@/utils/location';
import { coordinatesToAddress } from '@/utils/geocoding';
import { getCurrentCoordinates, LocationPermissionDeniedError } from '@/utils/deviceLocation';
import { useAlert } from '@/context/AlertContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
    form: VendorForm;
    updateField: (key: keyof VendorForm, value: string | string[]) => void;
};

const StepLocationServices = ({ form, updateField }: Props) => {
    const alert = useAlert();

    const [services, setServices] = useState<Service[]>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [servicesError, setServicesError] = useState<string | null>(null);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setServicesLoading(true);
        setServicesError(null);
        try {
            const response = await serviceAPI.getAllServices();
            if (response.data?.success) {
                setServices(response.data?.data ?? []);
            } else {
                setServicesError('Failed to load services.');
            }
        } catch (err) {
            console.error('Error while fetching services:', err);
            setServicesError('Unable to load services. Please try again.');
        } finally {
            setServicesLoading(false);
        }
    };

    // ── Use current location ──────────────────────────────────────────────────
    const handleUseCurrentLocation = async () => {
        setLocating(true);
        try {
            const coords = await getCurrentCoordinates();
            debugger
            const geocoded = await coordinatesToAddress(coords);

            if (!geocoded) {
                alert.error(
                    'Location Error',
                    'Could not determine your address from your location. Please enter it manually.',
                );
                return;
            }

            if (geocoded.addressLine) updateField('address', geocoded.addressLine);
            if (geocoded.state) updateField('state', geocoded.state);
            if (geocoded.city) updateField('city', geocoded.city);
            if (geocoded.pincode) updateField('pincode', geocoded.pincode);

            alert.success('Location Found', 'Address fields have been auto-filled.');
        } catch (error) {
            if (error instanceof LocationPermissionDeniedError) {
                alert.error(
                    'Permission Denied',
                    'Location access is needed to auto-fill your address. You can still enter it manually.',
                );
            } else {
                console.error('Error getting current location:', error);
                alert.error('Location Error', 'Unable to fetch your current location.');
            }
        } finally {
            setLocating(false);
        }
    };

    // ── State search ──────────────────────────────────────────────────────────
    const searchStates = useCallback(async (query: string) => {
        const states = await getStates(query || 'a');
        return states.map(s => ({ label: s.name, value: s.name }));
    }, []);

    // ── City search — depends on selected state ─────────────────────────────
    const searchCities = useCallback(
        async (query: string) => {
            if (!form.state) return [];
            const cities = await getCitiesByState(query || form.state, form.state);
            return cities.map(c => ({ label: c.name, value: c.name }));
        },
        [form.state],
    );

    // ── Service area search — plain city autocomplete, not state-scoped ─────
    const searchServiceAreas = useCallback(async (query: string) => {
        if (!query.trim()) return [];
        const cities = await getCities(query);
        return cities.map(c => ({ label: c.name, value: c.name }));
    }, []);

    const handleStateChange = (stateName: string) => {
        updateField('state', stateName);
        if (form.city) updateField('city', ''); // reset dependent city
    };

    const serviceOptions = services
        .filter(s => !!s._id)
        .map(s => ({ label: s.serviceName, value: s._id as string }));

    return (
        <View>
            {/* ── Business Address ── */}
            <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Business Address</Text>
                <TouchableOpacity
                    style={[styles.locationBtn, locating && styles.locationBtnDisabled]}
                    onPress={handleUseCurrentLocation}
                    activeOpacity={0.75}
                    disabled={locating}
                >
                    {locating ? (
                        <ActivityIndicator size="small" color={Colors.gradientStart} />
                    ) : (
                        <Icon name="my-location" size={15} color={Colors.gradientStart} />
                    )}
                    <Text style={styles.locationBtnText}>
                        {locating ? 'Locating...' : 'Use current location'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FieldInput
                label="Address"
                value={form.address}
                onChangeText={v => updateField('address', v)}
                placeholder="Street address"
                multiline
            />

            <DropdownSelect
                label="State"
                placeholder="Select state"
                value={form.state}
                onChange={handleStateChange}
                onSearch={searchStates}
                searchable
                required
                emptyText="No matching states."
            />

            <DropdownSelect
                label="City"
                placeholder="Select city"
                value={form.city}
                onChange={v => updateField('city', v)}
                onSearch={searchCities}
                searchable
                required
                disabled={!form.state}
                disabledHint="Select a state first"
                emptyText="No matching cities."
            />

            <FieldInput
                label="Pincode"
                value={form.pincode}
                onChangeText={v => updateField('pincode', v.replace(/[^0-9]/g, ''))}
                placeholder="6-digit pin code"
                keyboardType="number-pad"
                maxLength={6}
                required
            />

            <DropdownSelect
                label="Service Areas"
                placeholder="Select areas you serve"
                value={form.serviceAreas}
                onChange={v => updateField('serviceAreas', v)}
                onSearch={searchServiceAreas}
                searchable
                multiple
                emptyText="Type to search cities."
            />

            {/* ── Services Offered ── */}
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <Text style={styles.hint}>Select all services your business provides.</Text>

            <DropdownSelect
                label="Services"
                placeholder="Select services"
                value={form.services}
                onChange={v => updateField('services', v)}
                options={serviceOptions}
                multiple
                required
                emptyText={servicesError ?? 'No services available.'}
            />

            {servicesError && (
                <View style={styles.errorBox}>
                    <Icon name="error-outline" size={18} color="#E53935" />
                    <Text style={styles.errorText}>{servicesError}</Text>
                    <TouchableOpacity onPress={fetchServices} style={styles.retryBtn}>
                        <Icon name="refresh" size={14} color={Colors.gradientStart} />
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {form.services.length > 0 && (
                <View style={styles.serviceGrid}>
                    {form.services.map(id => {
                        const svc = services.find(s => s._id === id);
                        if (!svc) return null;
                        return (
                            <View key={id} style={styles.serviceChip}>
                                <Icon
                                    name="check"
                                    size={12}
                                    color={Colors.white}
                                    style={styles.chipCheckIcon}
                                />
                                <Text style={styles.serviceText}>{svc.serviceName}</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {form.services.length > 0 && (
                <View style={styles.selectedCountRow}>
                    <Icon name="check-circle" size={14} color={Colors.gradientStart} />
                    <Text style={styles.selectedCount}>
                        {form.services.length} service
                        {form.services.length > 1 ? 's' : ''} selected
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
    },
    hint: { fontSize: 12, color: Colors.textMedium, marginBottom: 12 },

    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#EDF6FB',
        borderWidth: 1,
        borderColor: '#D8E8EE',
    },
    locationBtnDisabled: { opacity: 0.7 },
    locationBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gradientStart,
    },

    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF3F3',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        padding: 12,
        marginBottom: 12,
        marginTop: -6,
    },
    errorText: { flex: 1, fontSize: 12, color: '#E53935', fontWeight: '500' },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#EDF6FB',
        borderRadius: 8,
    },
    retryText: { fontSize: 12, fontWeight: '700', color: Colors.gradientStart },

    serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    serviceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: Colors.gradientStart,
    },
    chipCheckIcon: { marginRight: 4 },
    serviceText: { color: Colors.white, fontSize: 12, fontWeight: '600' },

    selectedCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    selectedCount: { fontSize: 12, fontWeight: '700', color: Colors.gradientStart },
});

export default StepLocationServices;
