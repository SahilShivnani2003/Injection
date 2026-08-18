import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Loader from '@/components/Loader';
import { useAlert } from '@/context/AlertContext';
import { bookingAPI } from '@/service/apis/bookingService';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { UserTabParamList } from '@/types/UserTabParamList';
import { Booking, BookingStatus, PaymentStatus } from '../types/Booking';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PaymentMethodModal } from '../components/PaymentScreen';
import { useAuthStore } from '@/store/useAuthStore';

type BookingsProps = NativeBottomTabScreenProps<UserTabParamList, 'Bookings'>;

// ─── Status config (booking) ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#FFB800' },
    accepted: { label: 'Accepted', color: '#00D4A0' },
    'in-progress': { label: 'In Progress', color: '#0E8DFF' },
    completed: { label: 'Completed', color: '#7ED321' },
    cancelled: { label: 'Cancelled', color: '#FF5A5F' },
};

// ─── Status config (payment) ───────────────────────────────────────────────────
const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
    pending: { label: 'Payment Pending', color: '#E6A817' },
    paid: { label: 'Paid', color: Colors.gradientStart },
    failed: { label: 'Payment Failed', color: '#FF4757' },
};

// ─── Filter tabs ────────────────────────────────────────────────────────────────
type FilterTab = { key: string; label: string };

const FILTER_TABS: FilterTab[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const BookingsScreen = ({ navigation }: BookingsProps) => {
    const alert = useAlert();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.userBookings();
            console.log('loading user booking : ', response);
            setBookings(response.data?.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            alert.error('Error', 'Failed to load bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status?: BookingStatus) =>
        (status && STATUS_CONFIG[status]?.color) || Colors.textMedium;

    const getStatusText = (status?: BookingStatus) =>
        (status && STATUS_CONFIG[status]?.label) || 'Unknown';

    const formatDate = (date?: string | Date) => {
        if (!date) return 'Date not set';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timeSlot?: string) => {
        if (!timeSlot) return '';
        return timeSlot.split('-')[0] || timeSlot;
    };

    const getServiceNames = (services: any[]) => {
        if (!services || services.length === 0) return 'No services';
        return services.map(service => service.serviceName).join(', ');
    };

    // Amount actually due — prefer finalAmount, fall back to grandTotal, add any
    // additionalAmount charged after the fact.
    const getDueAmount = (booking: Booking) =>
        (booking.finalAmount ?? booking.grandTotal ?? 0) + (booking.additionalAmount ?? 0);

    // Show "Pay" only when there's genuinely something to collect: booking has
    // moved past pending, and payment hasn't succeeded yet.
    const needsPayment = (booking: Booking) =>
        (booking.bookingStatus === 'accepted' || booking.bookingStatus === 'in-progress') &&
        booking.paymentStatus !== 'paid';

    // ── filtering ──────────────────────────────────────────────────────────
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

    const handleNavigation = (item: Booking) => {
        if (item._id) {
            navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                .navigate('BookingDetail', { bookingId: item._id });
        }
    };

    const handlePay = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const markBookingPaid = (payMethod: string, payId?: string) => {
        if (payMethod === 'cash' || payMethod === 'Cash') {
            setShowModal(false);
        }
    };
    const onSuccessPay = () => {
        alert.success(
            'Payment Confirmed!  ',
            `Your amount ${selectedBooking?.grandTotal} for this booking has been paid successfully.`,
        );
        navigation.goBack();
    };
    const onFail = () => {
        alert.error('Failed', 'Payment method failed.Please try again latter');
    };

    const renderItem = ({ item }: { item: Booking }) => {
        const paymentCfg = item.paymentStatus ? PAYMENT_STATUS_CONFIG[item.paymentStatus] : null;
        const hasReports = (item.reports?.length ?? 0) > 0 || !!item.reportUrl;
        const displayId = item.bookingId ? `#${item.bookingId}` : undefined;
        const statusColor = getStatusColor(item.bookingStatus);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleNavigation(item)}
                activeOpacity={0.75}
            >
                <View style={styles.cardRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {getServiceNames(item.selectedServices)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.status, { color: statusColor }]}>
                            {getStatusText(item.bookingStatus)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.datetime}>
                    {displayId ? `${displayId} • ` : ''}
                    {`${formatDate(item.createdAt)} • ${formatTime(item.preferredTimeSlot)}`}
                </Text>

                <View style={styles.detailsRow}>
                    <View style={styles.detailChip}>
                        <Icon name="currency-rupee" size={13} color={Colors.textMuted} />
                        <Text style={styles.detailText}>{getDueAmount(item).toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailChip}>
                        <Icon name="location-on" size={13} color={Colors.textMuted} />
                        <Text style={styles.detailText} numberOfLines={1}>
                            {item.serviceLocation || 'Location not set'}
                        </Text>
                    </View>
                    {item.estimatedDuration != null && (
                        <View style={styles.detailChip}>
                            <Icon name="schedule" size={13} color={Colors.textMuted} />
                            <Text style={styles.detailText}>{item.estimatedDuration} min</Text>
                        </View>
                    )}
                </View>

                {/* Secondary status row: payment + reports, only rendered when relevant */}
                {(paymentCfg || hasReports) && (
                    <View style={styles.metaRow}>
                        {paymentCfg && (
                            <View
                                style={[
                                    styles.metaChip,
                                    { backgroundColor: paymentCfg.color + '1A' },
                                ]}
                            >
                                <Icon name="payments" size={12} color={paymentCfg.color} />
                                <Text style={[styles.metaChipText, { color: paymentCfg.color }]}>
                                    {paymentCfg.label}
                                </Text>
                            </View>
                        )}
                        {hasReports && (
                            <View
                                style={[
                                    styles.metaChip,
                                    { backgroundColor: Colors.gradientMid + '1A' },
                                ]}
                            >
                                <Icon name="description" size={12} color={Colors.gradientMid} />
                                <Text style={[styles.metaChipText, { color: Colors.gradientMid }]}>
                                    Report available
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.viewBtn}
                        activeOpacity={0.85}
                        onPress={() => handleNavigation(item)}
                    >
                        <Text style={styles.viewBtnText}>View Detail</Text>
                        <Icon name="arrow-forward" size={16} color={Colors.white} />
                    </TouchableOpacity>
                    {needsPayment(item) ? (
                        <TouchableOpacity
                            style={styles.payBtn}
                            activeOpacity={0.85}
                            onPress={() => handlePay(item)}
                        >
                            <Icon name="payments" size={15} color={Colors.white} />
                            <Text style={styles.payBtnText}>Pay</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={22} color={Colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleWrap}>
                        <Text style={styles.headerTitle}>My Bookings</Text>
                        <Text style={styles.headerSub}>
                            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
                        </Text>
                    </View>

                    {/* Spacer keeps title centered */}
                    <View style={styles.headerIconBtn} />
                </View>

                {/* Filter tabs */}
                {!loading && bookings.length > 0 && (
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
                                    <Text
                                        style={[styles.tabLabel, active && styles.tabLabelActive]}
                                    >
                                        {tab.label}
                                    </Text>
                                    {count > 0 && (
                                        <View
                                            style={[
                                                styles.tabBadge,
                                                active && styles.tabBadgeActive,
                                            ]}
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
                )}
            </LinearGradient>

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Loader type="dots" size="large" text="Loading your bookings..." />
                    </View>
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="event-note" size={56} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>No bookings yet</Text>
                        <Text style={styles.emptySubtext}>
                            Your booking history will appear here
                        </Text>
                    </View>
                ) : filteredBookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={{ fontSize: 44, marginBottom: 12 }}>📋</Text>
                        <Text style={styles.emptyText}>
                            No {FILTER_TABS.find(t => t.key === activeFilter)?.label} bookings
                        </Text>
                        <Text style={styles.emptySubtext}>Try switching to a different filter</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredBookings}
                        // Use _id for reliable unique keys
                        keyExtractor={item => item._id ?? Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={fetchBookings}
                    />
                )}
                <View style={{ height: 42, marginBottom: 24 }}></View>
            </View>
            <PaymentMethodModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                bookingId={selectedBooking?._id || ''}
                amount={selectedBooking ? getDueAmount(selectedBooking) : 0.0}
                onCashPayment={() => markBookingPaid('cash')}
                onRazorpaySuccess={onSuccessPay}
                onRazorpayFailure={onFail}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F8FCFF',
    },

    /* ── Header ─────────────────────────────────────────── */
    header: {
        paddingTop: 32,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleWrap: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.textLight,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },

    /* ── Filter tabs ───────────────────────────────────────*/
    tabsRow: {
        flexDirection: 'row',
        paddingTop: 6,
        paddingRight: 4,
    },
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

    /* ── Content ─────────────────────────────────────────── */
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        marginBottom: 28,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textMedium,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 4,
    },
    list: {
        paddingBottom: 20,
    },

    /* ── Card ────────────────────────────────────────────── */
    card: {
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
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    title: {
        fontSize: 15,
        color: Colors.textDark,
        fontWeight: '700',
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    status: {
        fontSize: 11,
        fontWeight: '800',
    },
    datetime: {
        fontSize: 13,
        color: Colors.textMedium,
        marginBottom: 10,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    detailChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    detailText: {
        fontSize: 12,
        color: Colors.textMuted,
    },

    /* ── Secondary meta row (payment / reports) ───────────── */
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 10,
    },
    metaChipText: {
        fontSize: 11,
        fontWeight: '700',
    },

    /* ── Actions ───────────────────────────────────────────*/
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    viewBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.gradientMid,
        borderRadius: 14,
        paddingVertical: 12,
        minHeight: 44,
    },
    viewBtnText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
    payBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#00D4A0',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minHeight: 44,
    },
    payBtnText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
});

export default BookingsScreen;
