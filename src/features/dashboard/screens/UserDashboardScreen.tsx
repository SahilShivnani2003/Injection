import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { dashboardService } from '@/service/apis/dashboardService';
import { useAuthStore } from '@/store/useAuthStore';
import { UserTabParamList } from '@/types/UserTabParamList';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { Booking } from '@/features/booking/types/Booking';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type DashboardProps = NativeBottomTabScreenProps<UserTabParamList, 'Dashboard'>;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Summary {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    upcomingBookingsCount: number;
    totalSpent: number;
}

interface MostUsedService {
    _id: string;
    count: number;
    totalSpent: number;
}

interface MonthlyBooking {
    month: string;
    count: number;
    spent: number;
}

interface BookingByStatus {
    _id: string;
    count: number;
}

interface DashboardData {
    summary: Summary;
    bookingsByStatus: BookingByStatus[];
    recentBookings: Booking[];
    upcomingBookings: Booking[];
    mostUsedServices: MostUsedService[];
    monthlyBookings: MonthlyBooking[];
}

interface MetricCardConfig {
    label: string;
    value: string;
    bg: string;
    accent: string;
    iconName: string;
    iconLib: 'MaterialCommunityIcons' | 'Ionicons' | 'FontAwesome5';
}

interface ActivityItem {
    iconName: string;
    iconLib: 'MaterialCommunityIcons' | 'Ionicons' | 'FontAwesome5';
    text: string;
    time: string;
    color: string;
    dot: string;
}

// ── Animated metric card ─────────────────────────────────────────────────────

const MetricCard = ({ card, delay }: { card: MetricCardConfig; delay: number }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, {
            toValue: 1,
            delay,
            useNativeDriver: true,
            tension: 60,
            friction: 8,
        }).start();
    }, []);

    const IconComponent =
        card.iconLib === 'MaterialCommunityIcons'
            ? MaterialCommunityIcons
            : card.iconLib === 'FontAwesome5'
            ? FontAwesome5
            : Ionicons;

    return (
        <Animated.View
            style={[
                styles.metricCard,
                { backgroundColor: card.bg },
                {
                    opacity: anim,
                    transform: [
                        {
                            translateY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [24, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={[styles.metricIconBubble, { backgroundColor: card.accent + '22' }]}>
                <IconComponent name={card.iconName} size={24} color={card.accent} />
            </View>
            <Text style={[styles.metricValue, { color: card.accent }]}>{card.value}</Text>
            <Text style={styles.metricLabel}>{card.label}</Text>
            <View style={[styles.metricAccentBar, { backgroundColor: card.accent }]} />
        </Animated.View>
    );
};

// ── Screen ───────────────────────────────────────────────────────────────────

const DashboardScreen = ({ navigation }: DashboardProps) => {
    const { user } = useAuthStore();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const headerAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(0)).current;

    const rootNav = useCallback(
        () => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>(),
        [navigation],
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(contentAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchDashboardData = useCallback(async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            const response = await dashboardService.dashboardStats();
            if (response?.data?.success) {
                setDashboardData(response.data.data as DashboardData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getUserInitials = (): string => {
        if (!user?.name) return 'U';
        const parts = user.name.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return user.name.substring(0, 2).toUpperCase();
    };

    const getPrimaryServiceName = (booking: Booking): string => {
        if (!booking.selectedServices?.length) return 'Service';
        const first = booking.selectedServices[0].serviceName;
        const extra = booking.selectedServices.length - 1;
        return extra > 0 ? `${first} +${extra} more` : first;
    };

    const getTimeAgo = (date: Date): string => {
        const diffMs = Date.now() - date.getTime();
        if (diffMs < 0) return 'just now';
        const diffMins = Math.floor(diffMs / 60_000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMs / 3_600_000);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffMs / 86_400_000);
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    // Booking.createdAt is Date | undefined per the interface
    const formatDate = (date?: Date): string => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

    // ── Derived flags ─────────────────────────────────────────────────────────

    const isAdminOrStaff = Boolean(user?.isStaff || user?.role === 'admin');

    // ── Status meta ───────────────────────────────────────────────────────────

    const statusMeta: Record<
        string,
        {
            iconName: string;
            iconLib: 'MaterialCommunityIcons' | 'Ionicons';
            bg: string;
            dot: string;
        }
    > = {
        completed: {
            iconName: 'checkmark-circle',
            iconLib: 'Ionicons',
            bg: '#E6FFF5',
            dot: '#00D4A0',
        },
        accepted: {
            iconName: 'clipboard-text',
            iconLib: 'MaterialCommunityIcons',
            bg: '#E8F9FF',
            dot: '#00B4E8',
        },
        'in-progress': { iconName: 'sync', iconLib: 'Ionicons', bg: '#F0EEFF', dot: '#7C4DFF' },
        cancelled: { iconName: 'close-circle', iconLib: 'Ionicons', bg: '#FFE8E8', dot: '#E53935' },
        pending: { iconName: 'time', iconLib: 'Ionicons', bg: '#FFF8E6', dot: '#F5A623' },
    };

    // bookingStatus is optional on Booking, so always provide a fallback
    const getStatusMeta = (status?: Booking['bookingStatus']) =>
        statusMeta[status ?? 'pending'] ?? statusMeta.pending;

    // ── Metric cards ─────────────────────────────────────────────────────────

    const getMetricCards = (): MetricCardConfig[] => {
        if (!dashboardData) return [];
        const { summary } = dashboardData;

        if (!isAdminOrStaff) {
            return [
                {
                    label: 'Upcoming',
                    value: String(summary.upcomingBookingsCount),
                    bg: '#E8F9FF',
                    accent: '#00B4E8',
                    iconName: 'calendar-outline',
                    iconLib: 'Ionicons',
                },
                {
                    label: 'Total Bookings',
                    value: String(summary.totalBookings),
                    bg: '#E6FFF5',
                    accent: '#00D4A0',
                    iconName: 'clipboard-text-outline',
                    iconLib: 'MaterialCommunityIcons',
                },
                {
                    label: 'Completed',
                    value: String(summary.completedBookings),
                    bg: '#FFF8E6',
                    accent: '#F5A623',
                    iconName: 'checkmark-done-circle-outline',
                    iconLib: 'Ionicons',
                },
                {
                    label: 'Cancelled',
                    value: String(summary.cancelledBookings),
                    bg: '#FFE8F5',
                    accent: '#E91E63',
                    iconName: 'close-circle-outline',
                    iconLib: 'Ionicons',
                },
            ];
        }

        return [
            {
                label: 'Total Bookings',
                value: String(summary.totalBookings),
                bg: '#E8F9FF',
                accent: '#00B4E8',
                iconName: 'calendar-outline',
                iconLib: 'Ionicons',
            },
            {
                label: 'Upcoming',
                value: String(summary.upcomingBookingsCount),
                bg: '#E6FFF5',
                accent: '#00D4A0',
                iconName: 'calendar-month-outline',
                iconLib: 'MaterialCommunityIcons',
            },
            {
                label: 'Completed',
                value: String(summary.completedBookings),
                bg: '#FFF8E6',
                accent: '#F5A623',
                iconName: 'checkmark-done-outline',
                iconLib: 'Ionicons',
            },
            {
                label: 'Cancelled',
                value: String(summary.cancelledBookings),
                bg: '#FFE8F5',
                accent: '#E91E63',
                iconName: 'close-circle-outline',
                iconLib: 'Ionicons',
            },
        ];
    };

    // ── Activity feed ─────────────────────────────────────────────────────────

    const getActivityFeed = (): ActivityItem[] => {
        if (!dashboardData?.recentBookings?.length) return [];

        return dashboardData.recentBookings.slice(0, 3).map(booking => {
            const meta = getStatusMeta(booking.bookingStatus);
            return {
                iconName: meta.iconName,
                iconLib: meta.iconLib,
                text: `${getPrimaryServiceName(booking)} — ${booking.bookingStatus ?? 'pending'}`,
                // createdAt is Date | undefined on Booking
                time: booking.createdAt ? getTimeAgo(new Date(booking.createdAt)) : '—',
                color: meta.bg,
                dot: meta.dot,
            };
        });
    };

    // ── Next appointment ──────────────────────────────────────────────────────

    const getNextAppointment = (): Booking | null => dashboardData?.upcomingBookings?.[0] ?? null;

    // Booking has no _id in the public interface; the backend always returns one.
    // We cast to access it rather than adding an extra interface.
    const handleViewBooking = (booking: Booking) => {
        rootNav().navigate('BookingDetail', {
            bookingId: (booking as Booking & { _id: string })._id,
        });
    };

    // ── Revenue total for admin banner ────────────────────────────────────────

    const getTotalRevenue = (): number =>
        dashboardData?.monthlyBookings?.reduce((sum, m) => sum + (m.spent ?? 0), 0) ?? 0;

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading && !dashboardData) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={[styles.menuLabel, { marginTop: 12 }]}>Loading dashboard…</Text>
            </View>
        );
    }

    const metricCards = getMetricCards();
    const activityFeed = getActivityFeed();
    const nextAppointment = getNextAppointment();
    const summary = dashboardData?.summary;

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.0, y: 0 }}
                end={{ x: 1.0, y: 1 }}
                style={styles.header}
            >
                <View style={styles.blobTopRight} />
                <View style={styles.blobBottomLeft} />

                <Animated.View
                    style={[
                        styles.headerInner,
                        {
                            opacity: headerAnim,
                            transform: [
                                {
                                    translateY: headerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-12, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.greetingRow}>
                                <Text style={styles.greeting}>{getGreeting()} </Text>
                                <Ionicons
                                    name="hand-right"
                                    size={16}
                                    color="rgba(255,255,255,0.85)"
                                />
                            </View>
                            <Text style={styles.name}>{user?.name ?? 'User'}</Text>
                            <View style={styles.statusPill}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>
                                    {user?.isActive ? 'Active account' : 'Inactive'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatarRing} />
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getUserInitials()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Patient summary banner */}
                    {!isAdminOrStaff && summary && (
                        <View style={styles.healthBanner}>
                            <View style={styles.healthScoreBlock}>
                                <Text style={styles.healthScoreNum}>{summary.totalBookings}</Text>
                                <Text style={styles.healthScoreLabel}>Total{'\n'}Bookings</Text>
                            </View>
                            <View style={styles.healthDivider} />
                            <View style={styles.healthStatsRow}>
                                <View style={styles.healthStat}>
                                    <Text style={styles.healthStatVal}>
                                        {summary.upcomingBookingsCount}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Upcoming</Text>
                                </View>
                                <View style={styles.healthStat}>
                                    <Text style={styles.healthStatVal}>
                                        {summary.completedBookings}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Done</Text>
                                </View>
                                <View style={styles.healthStat}>
                                    <Text style={styles.healthStatVal}>
                                        {formatCurrency(summary.totalSpent)}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Spent</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Admin / staff revenue banner */}
                    {isAdminOrStaff && summary && (
                        <View style={styles.healthBanner}>
                            <View style={styles.healthScoreBlock}>
                                <Text style={styles.healthScoreNum}>
                                    ₹{(getTotalRevenue() / 1000).toFixed(1)}K
                                </Text>
                                <Text style={styles.healthScoreLabel}>Total{'\n'}Revenue</Text>
                            </View>
                            <View style={styles.healthDivider} />
                            <View style={styles.healthStatsRow}>
                                <View style={styles.healthStat}>
                                    <Text style={styles.healthStatVal}>
                                        {summary.totalBookings}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Bookings</Text>
                                </View>
                                <View style={styles.healthStat}>
                                    <Text style={styles.healthStatVal}>
                                        {summary.completedBookings}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Completed</Text>
                                </View>
                                <View style={styles.healthStat}>
                                    <Text style={styles.healthStatVal}>
                                        {summary.upcomingBookingsCount}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Upcoming</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </LinearGradient>

            {/* ── Scrollable Content ── */}
            <Animated.View
                style={[
                    styles.contentWrapper,
                    {
                        opacity: contentAnim,
                        transform: [
                            {
                                translateY: contentAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
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
                    {/* Metric Cards */}
                    <Text style={styles.sectionLabel}>Overview</Text>
                    <View style={styles.cardGrid}>
                        {metricCards.map((card, i) => (
                            <MetricCard key={card.label} card={card} delay={i * 80} />
                        ))}
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionLabel}>Quick Actions</Text>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity
                            style={[styles.quickActionBtn, { flex: 1.6 }]}
                            activeOpacity={0.8}
                            onPress={() => rootNav().navigate('Booking')}
                        >
                            <LinearGradient
                                colors={[
                                    Colors.gradientStart,
                                    Colors.gradientMid,
                                    Colors.gradientEnd,
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.quickActionGradient}
                            >
                                <Ionicons name="calendar" size={28} color="#fff" />
                                <Text style={styles.quickActionText}>Book Service</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Next Appointment */}
                    {nextAppointment && (
                        <>
                            <Text style={styles.sectionLabel}>Next Appointment</Text>
                            <View style={styles.appointmentCard}>
                                <LinearGradient
                                    colors={['#00D4A022', '#00B4E811']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.appointmentGradientBg}
                                />
                                <View style={styles.appointmentHeader}>
                                    <View style={styles.apptIconWrap}>
                                        <MaterialCommunityIcons
                                            name="hospital-building"
                                            size={26}
                                            color="#00B4E8"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.apptType} numberOfLines={2}>
                                            {getPrimaryServiceName(nextAppointment)}
                                        </Text>
                                        <Text style={styles.apptSub}>
                                            Patient: {nextAppointment.patientName}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.apptBadge,
                                            {
                                                backgroundColor: getStatusMeta(
                                                    nextAppointment.bookingStatus,
                                                ).bg,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.apptBadgeText}>
                                            {(nextAppointment.bookingStatus ?? 'pending')
                                                .charAt(0)
                                                .toUpperCase() +
                                                (nextAppointment.bookingStatus ?? 'pending').slice(
                                                    1,
                                                )}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.apptTimeRow}>
                                    <View style={styles.apptTimeChip}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={14}
                                            color={Colors.textDark}
                                        />
                                        <Text style={styles.apptTimeText}>
                                            {formatDate(nextAppointment.createdAt)}
                                        </Text>
                                    </View>
                                    <View style={styles.apptTimeChip}>
                                        <Ionicons
                                            name="time-outline"
                                            size={14}
                                            color={Colors.textDark}
                                        />
                                        <Text style={styles.apptTimeText} numberOfLines={1}>
                                            {nextAppointment.preferredTimeSlot}
                                        </Text>
                                    </View>
                                </View>

                                {/* Amount row */}
                                <View style={styles.apptTotalRow}>
                                    <Text style={styles.apptTotalLabel}>Total Amount</Text>
                                    <Text style={styles.apptTotalValue}>
                                        {formatCurrency(nextAppointment.grandTotal)}
                                    </Text>
                                </View>

                                {/* Coupon discount row */}
                                {!!nextAppointment.appliedCoupon?.discountAmount && (
                                    <View style={styles.discountRow}>
                                        <View style={styles.discountLabelRow}>
                                            <MaterialCommunityIcons
                                                name="tag"
                                                size={14}
                                                color="#00A070"
                                            />
                                            <Text style={styles.discountLabel}>
                                                Coupon (
                                                {nextAppointment.appliedCoupon.couponCode ?? '—'})
                                            </Text>
                                        </View>
                                        <Text style={styles.discountValue}>
                                            -
                                            {formatCurrency(
                                                nextAppointment.appliedCoupon.discountAmount,
                                            )}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.viewDetailsBtn}
                                    activeOpacity={0.78}
                                    onPress={() => handleViewBooking(nextAppointment)}
                                >
                                    <LinearGradient
                                        colors={[Colors.gradientStart, Colors.gradientEnd]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.viewDetailsBtnInner}
                                    >
                                        <Text style={styles.viewDetailsBtnText}>
                                            View Full Details
                                        </Text>
                                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Most Used Services */}
                    {(dashboardData?.mostUsedServices?.length ?? 0) > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Top Services</Text>
                            <View style={styles.activityFeed}>
                                {dashboardData!.mostUsedServices
                                    .slice(0, 3)
                                    .map((svc, idx, arr) => (
                                        <View
                                            key={svc._id}
                                            style={[
                                                styles.activityItem,
                                                idx < arr.length - 1 && styles.activityItemBorder,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.activityIconWrap,
                                                    { backgroundColor: '#E8F9FF' },
                                                ]}
                                            >
                                                <MaterialCommunityIcons
                                                    name="hospital-building"
                                                    size={20}
                                                    color="#00B4E8"
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.activityText}>{svc._id}</Text>
                                                <Text style={styles.activityTime}>
                                                    {svc.count} booking
                                                    {svc.count !== 1 ? 's' : ''} ·{' '}
                                                    {formatCurrency(svc.totalSpent)}
                                                </Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.activityDot,
                                                    { backgroundColor: '#00B4E8' },
                                                ]}
                                            />
                                        </View>
                                    ))}
                            </View>
                        </>
                    )}

                    {/* Recent Activity */}
                    {activityFeed.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Recent Activity</Text>
                            <View style={styles.activityFeed}>
                                {activityFeed.map((item, idx) => {
                                    const IconComponent =
                                        item.iconLib === 'MaterialCommunityIcons'
                                            ? MaterialCommunityIcons
                                            : item.iconLib === 'FontAwesome5'
                                            ? FontAwesome5
                                            : Ionicons;

                                    return (
                                        <View
                                            key={idx}
                                            style={[
                                                styles.activityItem,
                                                idx < activityFeed.length - 1 &&
                                                    styles.activityItemBorder,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.activityIconWrap,
                                                    { backgroundColor: item.color },
                                                ]}
                                            >
                                                <IconComponent
                                                    name={item.iconName}
                                                    size={20}
                                                    color={item.dot}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.activityText}>{item.text}</Text>
                                                <Text style={styles.activityTime}>{item.time}</Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.activityDot,
                                                    { backgroundColor: item.dot },
                                                ]}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* Empty state */}
                    {summary?.totalBookings === 0 && (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="clipboard-text-outline"
                                size={64}
                                color={Colors.textMuted}
                            />
                            <Text style={styles.emptyTitle}>No bookings yet</Text>
                            <Text style={styles.emptyText}>
                                Start your health journey by booking your first service
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => rootNav().navigate('Booking')}
                            >
                                <Text style={styles.emptyButtonText}>Book Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
                <View style={{ marginBottom: 48 }}></View>
            </Animated.View>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    contentWrapper: { flex: 1 },

    // Header
    header: {
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
    },
    headerInner: { gap: 16 },
    blobTopRight: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    blobBottomLeft: {
        position: 'absolute',
        bottom: -30,
        left: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    greetingRow: { flexDirection: 'row', alignItems: 'center' },
    greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
    name: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginTop: 2,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 8,
        gap: 6,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#AAFFD2' },
    statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    avatarWrap: { alignItems: 'center', justifyContent: 'center' },
    avatarRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    // Banner
    healthBanner: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    healthScoreBlock: { alignItems: 'center', minWidth: 52 },
    healthScoreNum: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', lineHeight: 34 },
    healthScoreLabel: {
        color: 'rgba(255,255,255,0.80)',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 14,
        marginTop: 2,
    },
    healthDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.25)' },
    healthStatsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
    healthStat: { alignItems: 'center' },
    healthStatVal: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    healthStatKey: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2 },

    // Content
    content: { paddingHorizontal: 16, paddingBottom: 40, gap: 0 },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
        marginTop: 20,
    },

    // Metric cards
    cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    metricCard: {
        width: CARD_WIDTH,
        borderRadius: 18,
        padding: 16,
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    metricIconBubble: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    metricIcon: { fontSize: 20 },
    metricValue: { fontSize: 30, fontWeight: '900', lineHeight: 32 },
    metricLabel: { fontSize: 12, color: Colors.textMedium, marginTop: 4, fontWeight: '500' },
    metricAccentBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        opacity: 0.5,
    },

    // Appointment card
    appointmentCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        overflow: 'hidden',
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
        gap: 14,
    },
    appointmentGradientBg: { ...StyleSheet.absoluteFillObject },
    appointmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    apptIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#E8F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    apptIconEmoji: { fontSize: 22 },
    apptType: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
    apptSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    apptBadge: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#F5A62344',
    },
    apptBadgeText: { fontSize: 11, fontWeight: '700', color: '#C07A00' },
    apptTimeRow: { flexDirection: 'row', gap: 8 },
    apptTimeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F7FA',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        gap: 5,
        flex: 1,
        justifyContent: 'center',
    },
    apptTimeIcon: { fontSize: 12 },
    apptTimeText: { fontSize: 12, fontWeight: '600', color: Colors.textDark },
    apptTotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F2F7FA',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    apptTotalLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
    apptTotalValue: { fontSize: 16, fontWeight: '800', color: Colors.textDark },

    // Discount row
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E6FFF5',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    discountLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    discountLabel: { fontSize: 12, color: '#00A070', fontWeight: '600' },
    discountValue: { fontSize: 13, fontWeight: '700', color: '#00A070' },

    viewDetailsBtn: { borderRadius: 14, overflow: 'hidden' },
    viewDetailsBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        gap: 8,
    },
    viewDetailsBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    viewDetailsBtnArrow: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Quick Actions
    quickActionsRow: { flexDirection: 'row', gap: 12 },
    quickActionBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    quickActionGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        gap: 8,
        flex: 1,
    },
    quickActionIcon: { fontSize: 26 },
    quickActionText: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center' },

    // Activity feed
    activityFeed: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    activityItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
    activityIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityEmoji: { fontSize: 18 },
    activityText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
    activityTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    activityDot: { width: 8, height: 8, borderRadius: 4 },

    // Tip
    tipCard: {
        marginTop: 20,
        backgroundColor: 'rgba(0, 212, 160, 0.10)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 160, 0.20)',
    },
    tipIcon: { fontSize: 22 },
    tipText: { flex: 1, fontSize: 13, color: Colors.textMedium, lineHeight: 20 },
    menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.textDark },

    // Empty state
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
    emptyText: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    emptyButton: {
        backgroundColor: Colors.gradientStart,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    emptyButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});

export default DashboardScreen;
