import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FieldInput } from '../../../components/FieldInput';
import { Colors } from '../../../theme/colors';
import { VendorForm } from '../types/VendorRegistration';
import { Service } from '@/features/vendorService/types/Service';
import { serviceAPI } from '@/service/apis/medicalServices';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
    form: VendorForm;
    updateField: (key: keyof VendorForm, value: string | string[]) => void;
};

const StepLocationServices = ({ form, updateField }: Props) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Bug fix: compare by _id consistently ──────────────────────────────────
    const toggleService = (serviceId: string) => {
        const current = form.services;
        const next = current.includes(serviceId)
            ? current.filter(id => id !== serviceId)
            : [...current, serviceId];
        updateField('services', next);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching services..');
            const response = await serviceAPI.getAllServices();
            if (response.data?.success) {
                console.log('Fetched services : ', response.data);
                setServices(response.data?.data ?? []);
            } else {
                setError('Failed to load services.');
            }
        } catch (err) {
            console.error('Error while fetching services:', err);
            setError('Unable to load services. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            {/* ── Business Address ── */}
            <Text style={styles.sectionTitle}>Business Address</Text>

            <FieldInput
                label="Address"
                value={form.address}
                onChangeText={v => updateField('address', v)}
                placeholder="Street address"
                multiline
            />
            <FieldInput
                label="City"
                value={form.city}
                onChangeText={v => updateField('city', v)}
                placeholder="City"
            />
            <FieldInput
                label="State"
                value={form.state}
                onChangeText={v => updateField('state', v)}
                placeholder="State"
            />
            <FieldInput
                label="Pincode"
                value={form.pincode}
                onChangeText={v => updateField('pincode', v.replace(/[^0-9]/g, ''))}
                placeholder="6-digit pin code"
                keyboardType="number-pad"
                maxLength={6}
            />
            <FieldInput
                label="Service Areas"
                value={form.serviceAreas}
                onChangeText={v => updateField('serviceAreas', v)}
                placeholder="Cities or neighborhoods served"
            />

            {/* ── Services Offered ── */}
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <Text style={styles.hint}>Select all services your business provides.</Text>

            {/* Loading state */}
            {loading && (
                <View style={styles.stateBox}>
                    <ActivityIndicator size="small" color={Colors.gradientStart} />
                    <Text style={styles.stateText}>Loading services...</Text>
                </View>
            )}

            {/* Error state with retry */}
            {!loading && error && (
                <View style={styles.errorBox}>
                    <Icon name="error-outline" size={18} color="#E53935" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchServices} style={styles.retryBtn}>
                        <Icon name="refresh" size={14} color={Colors.gradientStart} />
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Empty state */}
            {!loading && !error && services.length === 0 && (
                <View style={styles.stateBox}>
                    <Icon name="inbox" size={24} color={Colors.textMedium} />
                    <Text style={styles.stateText}>No services available.</Text>
                </View>
            )}

            {/* Service chips */}
            {!loading && !error && services.length > 0 && (
                <View style={styles.serviceGrid}>
                    {services.map(service => {
                        const serviceId = service._id ?? '';
                        const active = form.services.includes(serviceId);
                        return (
                            <TouchableOpacity
                                key={serviceId}
                                style={[styles.serviceChip, active && styles.serviceChipActive]}
                                onPress={() => toggleService(serviceId)}
                                activeOpacity={0.75}
                            >
                                {active && (
                                    <Icon
                                        name="check"
                                        size={12}
                                        color={Colors.white}
                                        style={styles.chipCheckIcon}
                                    />
                                )}
                                <Text
                                    style={[styles.serviceText, active && styles.serviceTextActive]}
                                >
                                    {service.serviceName}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Selected count badge */}
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
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
        marginTop: 8,
        marginBottom: 14,
    },
    hint: {
        fontSize: 12,
        color: Colors.textMedium,
        marginBottom: 12,
    },

    // Loading / empty / error shared box
    stateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 18,
        justifyContent: 'center',
    },
    stateText: {
        fontSize: 13,
        color: Colors.textMedium,
    },

    // Error box
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
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        color: '#E53935',
        fontWeight: '500',
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#EDF6FB',
        borderRadius: 8,
    },
    retryText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gradientStart,
    },

    // Service chips
    serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    serviceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#F3F7FA',
        borderWidth: 1,
        borderColor: '#E2ECF2',
        marginBottom: 4,
    },
    serviceChipActive: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },
    chipCheckIcon: {
        marginRight: 4,
    },
    serviceText: {
        color: Colors.textMedium,
        fontSize: 12,
        fontWeight: '600',
    },
    serviceTextActive: {
        color: Colors.white,
    },

    // Selected count
    selectedCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    selectedCount: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gradientStart,
    },
});

export default StepLocationServices;
