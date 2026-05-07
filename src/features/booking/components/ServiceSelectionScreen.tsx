import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    Easing,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { SelectedService } from '@/types/booking';
import { serviceAPI } from '@/service/apis/medicalServices';
import { Service } from '@/features/vendorService/types/Service';

const { width } = Dimensions.get('window');

/* ─────────────────────── Props ─────────────────────── */

interface ServiceSelectionScreenProps {
    selectedServices: SelectedService[];
    setSelectedServices: (v: SelectedService[]) => void;
}

/* ─────────────────────── Service Card ─────────────────────── */

const ServiceCard: React.FC<{ service: Service; selected: boolean; onPress: () => void }> = ({
    service,
    selected,
    onPress,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(bgAnim, {
            toValue: selected ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [selected]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    // Get icon based on category or use default
    const getServiceIcon = () => {
        if (service.icon) return service.icon;

        // Default icons based on category
        const categoryIcons: Record<string, string> = {
            'Home Injections': '💉',
            'IV Drip Services': '💧',
            'Wound Dressing': '🩹',
            'Blood Collection': '🩸',
            'BP/Sugar Monitoring': '🩺',
            'ECG at Home': '📊',
            'Physiotherapy Session': '🏃',
            'Awareness Activities': '📢',
            'Lab-based Training': '🔬',
            'Field Survey Service': '📋',
            Other: '⚕️',
        };

        return categoryIcons[service.category] || '⚕️';
    };

    return (
        <Animated.View style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={1}>
                <Animated.View
                    style={[
                        styles.serviceCard,
                        {
                            borderColor: bgAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#D8E8EE', Colors.gradientStart],
                            }),
                            backgroundColor: bgAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#F8FBFC', '#E6FAF5'],
                            }),
                        },
                    ]}
                >
                    {selected && (
                        <View style={styles.selectedBadge}>
                            <Text style={styles.selectedTick}>✓</Text>
                        </View>
                    )}
                    <Text style={styles.serviceIcon}>{getServiceIcon()}</Text>
                    <Text
                        style={[styles.serviceName, selected && styles.serviceNameSel]}
                        numberOfLines={2}
                    >
                        {service.serviceName}
                    </Text>
                    <Text style={[styles.servicePrice, selected && styles.servicePriceSel]}>
                        ₹{service.basePrice}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionRow}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

/* ─────────────────────── Main Screen ─────────────────────── */

const ServiceSelectionScreen: React.FC<ServiceSelectionScreenProps> = ({
    selectedServices,
    setSelectedServices,
}) => {
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await serviceAPI.getAllServices();
            if (res.data?.success && res.data?.data) {
                // Filter only active services
                const activeServices = res.data.data.filter((s: Service) => s.isActive);
                setAvailableServices(activeServices);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            Alert.alert('Error', 'Failed to load services. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (svc: Service) => {
        const exists = selectedServices.find(s => s.serviceId === svc._id);
        if (exists) {
            setSelectedServices(selectedServices.filter(s => s.serviceId !== svc._id));
        } else {
            setSelectedServices([
                ...selectedServices,
                {
                    serviceId: svc._id!,
                    serviceName: svc.serviceName,
                    price: svc.basePrice,
                    quantity: 1,
                },
            ]);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.loadingText}>Loading services...</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <SectionLabel title="Available Services" />
            {selectedServices.length > 0 && (
                <Text style={styles.selectedCount}>
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}{' '}
                    selected
                </Text>
            )}

            {availableServices.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyText}>No services available at the moment</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {availableServices.map(s => (
                        <ServiceCard
                            key={s._id}
                            service={s}
                            selected={selectedServices.some(sel => sel.serviceId === s._id)}
                            onPress={() => toggleService(s)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const CARD_W = (width - 48 - 30) / 4;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
    selectedCount: {
        fontSize: 12,
        color: Colors.gradientStart,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    cardWrap: { width: CARD_W },
    serviceCard: {
        width: '100%',
        aspectRatio: 0.85,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        position: 'relative',
    },
    selectedBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTick: { color: Colors.white, fontSize: 10, fontWeight: '900' },
    serviceIcon: { fontSize: 20, marginBottom: 4 },
    serviceName: {
        fontSize: 9,
        color: Colors.textMuted,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 13,
    },
    serviceNameSel: { color: Colors.gradientStart },
    servicePrice: { fontSize: 9, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
    servicePriceSel: { color: Colors.gradientStart, fontWeight: '700' },
});

export default ServiceSelectionScreen;