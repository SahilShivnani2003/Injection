import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

type VendorDashboardProps = NativeBottomTabScreenProps<VendorTabParamList, 'Dashboard'>;

type SummaryCard = {
    label: string;
    value: string;
    icon: string;
    color: string;
};

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    accepted: '#00D4A0',
    'in-progress': '#0E8DFF',
    completed: '#7ED321',
    cancelled: '#FF5A5F',
    pending: '#FFB800',
};

const statusColor = (status?: string): string => STATUS_COLORS[status ?? 'pending'] ?? '#FFB800';

const getListingTitle = (booking: Booking): string => {
    const services = booking.selectedServices;
    if (!services?.length) return 'Service request';
    const first = services[0]?.serviceName ?? 'Service';
    const extra = services.length - 1;
    return extra > 0 ? `${first} +${extra} more` : first;
};

const formatINR = (amount?: number): string =>
    amount != null ? `₹${amount.toLocaleString('en-IN')}` : '—';

// ─── component ──────────────────────────────────────────────────────────────

const VendorDashboardScreen = ({ navigation }: VendorDashboardProps) => {
    const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMetrics = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [bookingResponse, serviceResponse] = await Promise.all([
                bookingAPI.vendorBookings(),
                serviceAPI.vendorServices(),
            ]);
            setBookings(
                bookingResponse.data?.data ??
                    bookingResponse.data?.bookings ??
                    bookingResponse.data ??
                    [],
            );
            setServices(
                serviceResponse.data?.data ??
                    serviceResponse.data?.services ??
                    serviceResponse.data ??
                    [],
            );
        } catch (error) {
            console.warn('Unable to load vendor dashboard metrics', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMetrics(true);
    }, [fetchMetrics]);

    // ── derived data ──────────────────────────────────────────────────────

    const totals = useMemo(() => {
        const count = (status: string) => bookings.filter(b => b.bookingStatus === status).length;

        const totalEarnings = bookings
            .filter(b => b.bookingStatus === 'completed')
            .reduce((sum, b) => sum + (b.grandTotal ?? b.subtotal ?? 0), 0);

        return {
            pending: count('pending'),
            accepted: count('accepted'),
            inProgress: count('in-progress'),
            completed: count('completed'),
            cancelled: count('cancelled'),
            totalEarnings,
        };
    }, [bookings]);

    const activeServiceCount = useMemo(() => services.filter(s => s.isActive).length, [services]);

    const cardData: SummaryCard[] = [
        { label: 'Total Bookings', value: String(bookings.length), icon: 'list', color: '#0E8DFF' },
        {
            label: 'Active Services',
            value: String(activeServiceCount),
            icon: 'medkit',
            color: '#00D4A0',
        },
        { label: 'Pending Jobs', value: String(totals.pending), icon: 'time', color: '#FFB800' },
        {
            label: 'Completed',
            value: String(totals.completed),
            icon: 'checkmark-done',
            color: '#7ED321',
        },
    ];

    const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);

    // ── loading state ─────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
            </View>
        );
    }

    // ── render ────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            {/* Header */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.05, y: 0 }}
                end={{ x: 0.95, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.vendorName}>{user?.name ?? 'Vendor'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.headerAction}
                            onPress={() => navigation.navigate('Profile')}
                            hitSlop={{ top: 8, bottom: 8 }}
                        >
                            <Ionicons name="person-circle" size={40} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerAction}
                            onPress={() => rootNav.navigate('Notification')}
                            hitSlop={{ top: 8, bottom: 8 }}
                        >
                            <Ionicons name="notifications" size={40} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Earnings strip inside header */}
                <View style={styles.earningsStrip}>
                    <Text style={styles.earningsLabel}>Total Earnings</Text>
                    <Text style={styles.earningsValue}>{formatINR(totals.totalEarnings)}</Text>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.gradientStart}
                        colors={[Colors.gradientStart]}
                    />
                }
            >
                {/* Summary cards */}
                <Text style={styles.sectionHeading}>Performance Summary</Text>
                <View style={styles.cardGrid}>
                    {cardData.map(card => (
                        <View key={card.label} style={styles.metricCard}>
                            <View style={styles.metricInner}>
                                <View
                                    style={[
                                        styles.metricIcon,
                                        { backgroundColor: card.color + '22' },
                                    ]}
                                >
                                    <Ionicons
                                        name={card.icon as any}
                                        size={20}
                                        color={card.color}
                                    />
                                </View>
                                <Text style={styles.metricValue}>{card.value}</Text>
                                <Text style={styles.metricLabel}>{card.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Status breakdown */}
                <View style={styles.breakdownRow}>
                    {[
                        { label: 'Accepted', count: totals.accepted, status: 'accepted' },
                        { label: 'In Progress', count: totals.inProgress, status: 'in-progress' },
                        { label: 'Cancelled', count: totals.cancelled, status: 'cancelled' },
                    ].map(item => (
                        <View key={item.status} style={styles.breakdownItem}>
                            <Text
                                style={[styles.breakdownCount, { color: statusColor(item.status) }]}
                            >
                                {item.count}
                            </Text>
                            <Text style={styles.breakdownLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick navigation */}
                <View style={styles.quickNavRow}>
                    <TouchableOpacity
                        style={styles.quickNavItem}
                        onPress={() => navigation.navigate('Bookings')}
                    >
                        <Ionicons name="calendar" size={20} color={Colors.gradientStart} />
                        <Text style={styles.quickNavLabel}>Bookings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickNavItem}
                        onPress={() => navigation.navigate('Services')}
                    >
                        <Ionicons name="medkit" size={20} color={Colors.gradientStart} />
                        <Text style={styles.quickNavLabel}>Services</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickNavItem} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color={Colors.gradientStart} />
                        <Text style={styles.quickNavLabel}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent bookings */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>Recent Bookings</Text>

                    {recentBookings.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons
                                name="calendar-outline"
                                size={32}
                                color={Colors.textMuted}
                                style={{ marginBottom: 8 }}
                            />
                            <Text style={styles.emptyText}>No bookings yet.</Text>
                            <Text style={styles.emptySubText}>
                                Start taking service requests to see them here.
                            </Text>
                        </View>
                    ) : (
                        recentBookings.map(booking => {
                            const bookingKey =
                                booking._id ??
                                `${booking.patientName}-${
                                    booking.preferredTimeSlot
                                }-${Math.random()}`;
                            const color = statusColor(booking.bookingStatus);
                            const amount = booking.grandTotal ?? booking.subtotal;

                            return (
                                <View key={bookingKey} style={styles.listingCard}>
                                    <View style={styles.listingHeader}>
                                        <Text style={styles.listingTitle} numberOfLines={1}>
                                            {getListingTitle(booking)}
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusPill,
                                                { backgroundColor: color + '22' },
                                            ]}
                                        >
                                            <Text style={[styles.statusText, { color }]}>
                                                {booking.bookingStatus
                                                    ?.replace('-', ' ')
                                                    ?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.listingMeta}>
                                        {booking.patientName}
                                        {amount != null ? ` · ${formatINR(amount)}` : ''}
                                    </Text>
                                    {!!booking.preferredTimeSlot && (
                                        <Text style={styles.listingSub}>
                                            {booking.preferredTimeSlot}
                                        </Text>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Bookings')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.actionButtonText}>View all bookings</Text>
                    <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={Colors.white}
                        style={{ marginLeft: 6 }}
                    />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        paddingTop: 24,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6
    },
    greeting: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.85,
        marginBottom: 4,
    },
    vendorName: { color: Colors.white, fontSize: 22, fontWeight: '800' },
    headerAction: { marginTop: 2 },

    // Earnings strip
    earningsStrip: {
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    earningsLabel: { color: Colors.white, fontSize: 13, fontWeight: '600', opacity: 0.9 },
    earningsValue: { color: Colors.white, fontSize: 18, fontWeight: '800' },

    // Content
    content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 100 },

    // Section heading
    sectionHeading: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 14,
    },

    // Metric cards — 2-column grid without relying on `gap`
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: 4,
    },
    metricCard: {
        width: '50%',
        paddingHorizontal: 6,
        marginBottom: 14,
    },

    // Quick nav
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
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    quickNavLabel: { marginTop: 6, fontSize: 12, fontWeight: '700', color: Colors.textDark },

    // Breakdown
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: Colors.white,
        borderRadius: 18,
        paddingVertical: 16,
        marginBottom: 4,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    breakdownItem: { alignItems: 'center' },
    breakdownCount: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    breakdownLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'uppercase',
    },

    // Recent bookings
    sectionBlock: { marginBottom: 20 },
    listingCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    listingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    listingTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textDark,
        flex: 1,
        marginRight: 8,
    },
    statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 10, fontWeight: '800' },
    listingMeta: { color: Colors.textMedium, fontSize: 13, marginBottom: 3 },
    listingSub: { color: Colors.textMuted, fontSize: 12 },

    // Empty state
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 28,
        alignItems: 'center',
    },
    emptyText: { color: Colors.textDark, fontSize: 14, fontWeight: '700', textAlign: 'center' },
    emptySubText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },

    // Action button
    actionButton: {
        marginTop: 6,
        backgroundColor: Colors.gradientStart,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: { color: Colors.white, fontSize: 15, fontWeight: '800' },

    // Metric card inner surface (needed to avoid duplicate key)
    metricInner: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 16,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    metricIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricValue: { fontSize: 22, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
    metricLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: Colors.textMuted,
    },
});

export default VendorDashboardScreen;
