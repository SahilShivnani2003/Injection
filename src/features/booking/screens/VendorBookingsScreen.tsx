import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { bookingAPI } from '@/service/apis/bookingService';
import { Booking } from '@/features/booking/types/Booking';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { Colors } from '@/theme/colors';

// ─── types ────────────────────────────────────────────────────────────────────

type BookingAction = 'accept' | 'start' | 'complete' | 'cancel';

type FilterTab = {
    key: string; // matches bookingStatus value, or 'all'
    label: string;
};

// ─── constants ────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
    accepted: '#00D4A0',
    'in-progress': '#0E8DFF',
    completed: '#7ED321',
    cancelled: '#FF5A5F',
    pending: '#FFB800',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusColor = (status?: string): string => STATUS_COLORS[status ?? 'pending'] ?? '#FFB800';

const formatINR = (amount?: number): string =>
    amount != null ? `₹${amount.toLocaleString('en-IN')}` : '—';

// ─── component ────────────────────────────────────────────────────────────────

const VendorBookingsScreen = ({
    navigation,
}: NativeBottomTabScreenProps<VendorTabParamList, 'Bookings'>) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // ── fetch ──────────────────────────────────────────────────────────────

    const fetchBookings = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await bookingAPI.vendorBookings();
            setBookings(response.data?.data ?? response.data?.bookings ?? response.data ?? []);
        } catch (error) {
            console.warn('Unable to load bookings', error);
            Alert.alert('Error', 'Unable to load bookings. Pull down to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBookings(true);
    }, [fetchBookings]);

    // ── filter ─────────────────────────────────────────────────────────────

    const filteredBookings = useMemo(
        () =>
            activeFilter === 'all'
                ? bookings
                : bookings.filter(b => b.bookingStatus === activeFilter),
        [bookings, activeFilter],
    );

    const countFor = useCallback(
        (key: string) =>
            key === 'all' ? bookings.length : bookings.filter(b => b.bookingStatus === key).length,
        [bookings],
    );

    // ── actions ────────────────────────────────────────────────────────────

    const handleBookingAction = useCallback(
        async (bookingId: string, action: BookingAction) => {
            if (action === 'cancel') {
                Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
                    { text: 'No', style: 'cancel' },
                    {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: () => executeAction(bookingId, 'cancel'),
                    },
                ]);
                return;
            }
            await executeAction(bookingId, action);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const executeAction = async (bookingId: string, action: BookingAction) => {
        setProcessingId(bookingId);
        try {
            switch (action) {
                case 'accept':
                    await bookingAPI.vendorAcceptBooking({ bookingId });
                    break;
                case 'start':
                    await bookingAPI.vendorStartBooking({ bookingId });
                    break;
                case 'complete':
                    await bookingAPI.vendorCompleteBooking({ bookingId });
                    break;
                case 'cancel':
                    // Use your actual cancel endpoint — adjust if the method name differs
                    await bookingAPI.CancelBooking?.({ bookingId });
                    break;
            }
            await fetchBookings(true);
        } catch {
            Alert.alert('Action failed', 'Unable to update booking status. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // ── action buttons ─────────────────────────────────────────────────────

    const renderActions = (booking: Booking) => {
        const id = booking._id ?? '';
        const busy = processingId === id;

        const ActionBtn = ({
            label,
            action,
            danger = false,
        }: {
            label: string;
            action: BookingAction;
            danger?: boolean;
        }) => (
            <TouchableOpacity
                style={[
                    styles.actionButton,
                    danger ? styles.dangerAction : styles.primaryAction,
                    busy && styles.actionDisabled,
                ]}
                onPress={() => handleBookingAction(id, action)}
                disabled={busy}
                activeOpacity={0.85}
            >
                {busy ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.actionText}>{label}</Text>
                )}
            </TouchableOpacity>
        );

        switch (booking.bookingStatus) {
            case 'pending':
                return (
                    <View style={styles.actionRow}>
                        <ActionBtn label="Accept" action="accept" />
                        <ActionBtn label="Cancel" action="cancel" danger />
                    </View>
                );
            case 'accepted':
                return (
                    <View style={styles.actionRow}>
                        <ActionBtn label="Start Service" action="start" />
                    </View>
                );
            case 'in-progress':
                return (
                    <View style={styles.actionRow}>
                        <ActionBtn label="Mark Complete" action="complete" />
                    </View>
                );
            default:
                return null;
        }
    };

    // ── loading ────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.loadingText}>Loading bookings…</Text>
            </View>
        );
    }

    // ── render ─────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>Bookings</Text>
                        <Text style={styles.headerSub}>{bookings.length} total requests</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.refreshIconBtn}
                        onPress={onRefresh}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                </View>

                {/* Filter tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsRow}
                >
                    {FILTER_TABS.map(tab => {
                        const count = countFor(tab.key);
                        const active = activeFilter === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.tab, active && styles.tabActive]}
                                onPress={() => setActiveFilter(tab.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                                    {tab.label}
                                </Text>
                                {count > 0 && (
                                    <View
                                        style={[styles.tabBadge, active && styles.tabBadgeActive]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabBadgeText,
                                                active && styles.tabBadgeTextActive,
                                            ]}
                                        >
                                            {count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </LinearGradient>

            {/* List */}
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
                {filteredBookings.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={{ fontSize: 44, marginBottom: 12 }}>📋</Text>
                        <Text style={styles.emptyTitle}>
                            {activeFilter === 'all'
                                ? 'No Bookings Yet'
                                : `No ${
                                      FILTER_TABS.find(t => t.key === activeFilter)?.label
                                  } Bookings`}
                        </Text>
                        <Text style={styles.emptyText}>
                            {activeFilter === 'all'
                                ? 'New booking requests will appear here.'
                                : 'Try switching to a different filter.'}
                        </Text>
                    </View>
                ) : (
                    filteredBookings.map(booking => {
                        const key =
                            booking._id ?? `${booking.patientName}-${booking.preferredTimeSlot}`;
                        const color = statusColor(booking.bookingStatus);
                        const amount = booking.grandTotal ?? booking.subtotal;

                        return (
                            <View key={key} style={styles.bookingCard}>
                                {/* Card header */}
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.bookingTitle} numberOfLines={1}>
                                        {booking.patientName}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: color + '22' },
                                        ]}
                                    >
                                        <View
                                            style={[styles.statusDot, { backgroundColor: color }]}
                                        />
                                        <Text style={[styles.statusText, { color }]}>
                                            {booking.bookingStatus
                                                ?.replace('-', ' ')
                                                ?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                {/* Address */}
                                {!!booking.address && (
                                    <View style={styles.metaRow}>
                                        <Ionicons
                                            name="location-outline"
                                            size={13}
                                            color={Colors.textMuted}
                                        />
                                        <Text style={styles.bookingMeta} numberOfLines={2}>
                                            {booking.address}
                                        </Text>
                                    </View>
                                )}

                                {/* Time slot */}
                                {!!booking.preferredTimeSlot && (
                                    <View style={styles.metaRow}>
                                        <Ionicons
                                            name="time-outline"
                                            size={13}
                                            color={Colors.textMuted}
                                        />
                                        <Text style={styles.bookingMeta}>
                                            {booking.preferredTimeSlot}
                                        </Text>
                                    </View>
                                )}

                                {/* Price */}
                                <Text style={styles.bookingPrice}>{formatINR(amount)}</Text>

                                {/* Service chips */}
                                {(booking.selectedServices?.length ?? 0) > 0 && (
                                    <View style={styles.serviceChipsRow}>
                                        {booking.selectedServices!.map(service => (
                                            <View
                                                key={service.serviceId ?? service.serviceName}
                                                style={styles.serviceChip}
                                            >
                                                <Text style={styles.serviceChipText}>
                                                    {service.serviceName}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Action buttons */}
                                {renderActions(booking)}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: Colors.textMuted },

    // Header
    header: {
        paddingTop: 56,
        paddingBottom: 0,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
    refreshIconBtn: {
        marginTop: 4,
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 10,
    },

    // Filter tabs
    tabsRow: { flexDirection: 'row', paddingBottom: 16, paddingRight: 4 },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    tabActive: { backgroundColor: Colors.white },
    tabLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
    tabLabelActive: { color: Colors.gradientStart },
    tabBadge: {
        marginLeft: 5,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 999,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    tabBadgeActive: { backgroundColor: Colors.gradientStart + '22' },
    tabBadgeText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
    tabBadgeTextActive: { color: Colors.gradientStart },

    // Content
    content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 100 },

    // Booking card
    bookingCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.textDark,
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    statusText: { fontSize: 10, fontWeight: '800' },

    // Meta
    metaRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    bookingMeta: {
        color: Colors.textMedium,
        fontSize: 13,
        marginLeft: 5,
        flex: 1,
        lineHeight: 18,
    },
    bookingPrice: {
        color: Colors.textDark,
        fontSize: 17,
        fontWeight: '800',
        marginTop: 6,
        marginBottom: 10,
    },

    // Service chips — gap replaced with margin
    serviceChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        marginTop: -2,
    },
    serviceChip: {
        backgroundColor: '#F0F6FA',
        borderRadius: 12,
        paddingHorizontal: 11,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 6,
    },
    serviceChipText: { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },

    // Action row — gap replaced with margin
    actionRow: { flexDirection: 'row', marginTop: 2 },
    actionButton: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 13,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        minHeight: 44,
    },
    primaryAction: { backgroundColor: Colors.gradientStart, marginRight: 8 },
    dangerAction: { backgroundColor: '#FF5A5F', marginRight: 0 },
    actionDisabled: { opacity: 0.65 },
    actionText: { color: Colors.white, fontSize: 13, fontWeight: '800' },

    // Empty state
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginTop: 8,
    },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
    emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default VendorBookingsScreen;
