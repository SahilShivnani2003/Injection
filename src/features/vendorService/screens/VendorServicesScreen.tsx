import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { serviceAPI } from '@/service/apis/medicalServices';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { Colors } from '@/theme/colors';
import { Service } from '@/features/vendorService/types/Service';

const VendorServicesScreen = ({ navigation }: NativeBottomTabScreenProps<VendorTabParamList, 'Services'>) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await serviceAPI.vendorServices();
            setServices(response.data?.data ?? response.data?.services ?? response.data ?? []);
        } catch (error) {
            console.warn('Unable to load vendor services', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (serviceId: string, currentStatus?: boolean) => {
        setProcessingId(serviceId);
        try {
            await serviceAPI.toggleServiceStatus(serviceId, !currentStatus);
            await fetchServices();
        } catch (error) {
            Alert.alert('Action failed', 'Unable to update service status.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Services</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {services.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No services found. Add services from the portal.</Text>
                    </View>
                ) : (
                    services.map(service => {
                        const serviceId = String(
                            (service as any)._id ||
                                (service as any).id ||
                                service.vendorId ||
                                service.serviceName,
                        );
                        return (
                            <View key={serviceId} style={styles.serviceCard}>
                                <View style={styles.serviceHeader}>
                                    <Text style={styles.serviceTitle}>{service.serviceName}</Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: service.isActive ? '#E6FFF5' : '#FFF1F0' },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: service.isActive ? '#00D4A0' : '#FF5A5F' },
                                            ]}
                                        >
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.serviceCategory}>{service.category}</Text>
                                <Text style={styles.serviceDescription}>
                                    {service.description ?? 'No description available.'}
                                </Text>
                                <View style={styles.serviceFooter}>
                                    <View>
                                        <Text style={styles.servicePrice}>
                                            ₹{service.basePrice?.toLocaleString('en-IN')}
                                        </Text>
                                        <Text style={styles.serviceSubText}>
                                            {service.duration ? `${service.duration} min` : 'Duration not set'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            service.isActive ? styles.deactivateButton : styles.activateButton,
                                        ]}
                                        onPress={() => handleToggle(serviceId, service.isActive)}
                                        disabled={processingId === serviceId}
                                    >
                                        <Text style={styles.toggleButtonText}>
                                            {service.isActive ? 'Deactivate' : 'Activate'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}

                <TouchableOpacity style={styles.actionButton} onPress={fetchServices} activeOpacity={0.85}>
                    <Ionicons name="refresh" size={18} color={Colors.gradientStart} />
                    <Text style={styles.actionButtonText}>Refresh services</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 56,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    serviceCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    serviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textDark,
        flex: 1,
        marginRight: 8,
    },
    serviceCategory: {
        fontSize: 13,
        color: Colors.gradientMid,
        fontWeight: '700',
        marginBottom: 10,
    },
    serviceDescription: {
        fontSize: 13,
        color: Colors.textMedium,
        marginBottom: 14,
        lineHeight: 20,
    },
    statusBadge: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textDark,
    },
    serviceSubText: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    toggleButton: {
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 18,
    },
    activateButton: {
        backgroundColor: '#E6FFF5',
    },
    deactivateButton: {
        backgroundColor: '#FFF1F0',
    },
    toggleButtonText: {
        color: Colors.textDark,
        fontSize: 13,
        fontWeight: '800',
    },
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    actionButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#D8E8EE',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    actionButtonText: {
        color: Colors.gradientStart,
        fontWeight: '800',
        fontSize: 13,
    },
});

export default VendorServicesScreen;
