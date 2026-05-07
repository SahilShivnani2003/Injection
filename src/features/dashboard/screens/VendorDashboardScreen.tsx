import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { bookingAPI } from '@/service/apis/bookingService';
import { serviceAPI } from '@/service/apis/medicalServices';
import { useAuthStore } from '@/store/useAuthStore';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { Colors } from '@/theme/colors';
import { Booking } from '@/features/booking/types/Booking';
import { Service } from '@/features/vendorService/types/Service';

type VendorDashboardProps = NativeBottomTabScreenProps<VendorTabParamList, 'Dashboard'>;

type SummaryCard = {
    label: string;
    value: string;
    icon: string;
    color: string;
};

const VendorDashboardScreen = ({ navigation }: VendorDashboardProps) => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const [bookingResponse, serviceResponse] = await Promise.all([
                bookingAPI.vendorBookings(),
                serviceAPI.vendorServices(),
            ]);

            setBookings(
                bookingResponse.data?.data ?? bookingResponse.data?.bookings ?? bookingResponse.data ?? [],
            );
            setServices(
                serviceResponse.data?.data ?? serviceResponse.data?.services ?? serviceResponse.data ?? [],
            );
        } catch (error) {
            console.warn('Unable to load vendor dashboard metrics', error);
        } finally {
            setLoading(false);
        }
    };

    const totals = useMemo(() => {
        const pending = bookings.filter(b => b.bookingStatus === 'pending').length;
        const accepted = bookings.filter(b => b.bookingStatus === 'accepted').length;
        const inProgress = bookings.filter(b => b.bookingStatus === 'in-progress').length;
        const completed = bookings.filter(b => b.bookingStatus === 'completed').length;
        const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;
        return { pending, accepted, inProgress, completed, cancelled };
    }, [bookings]);

    const cardData: SummaryCard[] = [
        { label: 'Total Bookings', value: String(bookings.length), icon: 'list', color: '#0E8DFF' },
        { label: 'Active Services', value: String(services.filter(s => s.isActive).length), icon: 'medkit', color: '#00D4A0' },
        { label: 'Pending Jobs', value: String(totals.pending), icon: 'time', color: '#FFB800' },
        { label: 'Completed', value: String(totals.completed), icon: 'checkmark-done', color: '#7ED321' },
    ];

    const recentBookings = bookings.slice(0, 4);

    const getListingTitle = (booking: Booking) => {
        if (!booking.selectedServices?.length) return 'Service request';
        const first = booking.selectedServices[0].serviceName;
        const extra = booking.selectedServices.length - 1;
        return extra > 0 ? `${first} +${extra} more` : first;
    };

    const statusColor = (status?: string) => {
        switch (status) {
            case 'accepted':
                return '#00D4A0';
            case 'in-progress':
                return '#0E8DFF';
            case 'completed':
                return '#7ED321';
            case 'cancelled':
                return '#FF5A5F';
            case 'pending':
            default:
                return '#FFB800';
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
                start={{ x: 0.05, y: 0 }}
                end={{ x: 0.95, y: 1 }}
                style={styles.header}
            >
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.vendorName}>{user?.name ?? 'Vendor'}</Text>
                </View>
                <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle" size={36} color={Colors.white} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Performance Summary</Text>
                <View style={styles.cardRow}>
                    {cardData.map(card => (
                        <View key={card.label} style={styles.metricCard}>
                            <View style={[styles.metricIcon, { backgroundColor: `${card.color}22` }]}>
                                <Ionicons name={card.icon} size={20} color={card.color} />
                            </View>
                            <Text style={styles.metricValue}>{card.value}</Text>
                            <Text style={styles.metricLabel}>{card.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.quickNavRow}>
                    <TouchableOpacity style={styles.quickNavItem} onPress={() => navigation.navigate('Bookings')}>
                        <Ionicons name="calendar" size={20} color={Colors.gradientStart} />
                        <Text style={styles.quickNavLabel}>Bookings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickNavItem} onPress={() => navigation.navigate('Services')}>
                        <Ionicons name="medkit" size={20} color={Colors.gradientStart} />
                        <Text style={styles.quickNavLabel}>Services</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickNavItem} onPress={fetchMetrics}>
                        <Ionicons name="refresh" size={20} color={Colors.gradientStart} />
                        <Text style={styles.quickNavLabel}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>Recent Bookings</Text>
                    {recentBookings.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No bookings yet. Start taking service requests.</Text>
                        </View>
                    ) : (
                        recentBookings.map(booking => (
                            <View key={booking._id ?? booking.patientName + booking.preferredTimeSlot} style={styles.listingCard}>
                                <View style={styles.listingHeader}>
                                    <Text style={styles.listingTitle}>{getListingTitle(booking)}</Text>
                                    <View style={[styles.statusPill, { backgroundColor: statusColor(booking.bookingStatus) + '22' }]}> 
                                        <Text style={[styles.statusText, { color: statusColor(booking.bookingStatus) }]}>
                                            {booking.bookingStatus?.replace('-', ' ')?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.listingMeta}>{booking.patientName} · ₹{booking.grandTotal?.toLocaleString('en-IN') ?? booking.subtotal?.toLocaleString('en-IN')}</Text>
                                <Text style={styles.listingSub}>{booking.preferredTimeSlot}</Text>
                            </View>
                        ))
                    )}
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Bookings')}>
                    <Text style={styles.actionButtonText}>View all bookings</Text>
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
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    vendorName: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: '800',
    },
    headerAction: {
        position: 'absolute',
        right: 20,
        top: 58,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 14,
    },
    cardRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 14,
    },
    metricCard: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    metricIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textDark,
        marginBottom: 6,
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: Colors.textMuted,
    },
    quickNavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 18,
    },
    quickNavItem: {
        backgroundColor: Colors.white,
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    quickNavLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textDark,
    },
    sectionBlock: {
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 12,
    },
    listingCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    listingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    listingTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.textDark,
        flex: 1,
        marginRight: 8,
    },
    statusPill: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    listingMeta: {
        color: Colors.textMedium,
        fontSize: 13,
        marginBottom: 4,
    },
    listingSub: {
        color: Colors.textMuted,
        fontSize: 12,
    },
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 18,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
    },
    actionButton: {
        marginTop: 10,
        backgroundColor: Colors.gradientStart,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },
});

export default VendorDashboardScreen;
