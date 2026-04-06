import React, { useRef, useEffect, useState } from 'react';
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
import { Colors } from '../../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { TabParamList } from '../../../navigation/TabNavigator';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { dashboardService } from '@/service/apis/dashboardService';
import { useAuthStore } from '@/store/useAuthStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type DashboardProps = NativeBottomTabScreenProps<TabParamList, 'Dashboard'>;

// ── Types matching API response ──────────────────────────────────────────────

interface SelectedService {
    serviceId: string;
    serviceName: string;
    price: number;
    quantity: number;
    _id: string;
}

interface VendorInfo {
    _id: string;
    name: string;
    phone: string;
    businessName: string;
}

interface Booking {
    _id: string;
    patientName: string;
    selectedServices: SelectedService[];
    grandTotal: number;
    preferredTimeSlot: string;
    vendorId: VendorInfo;
    bookingStatus: string;
    createdAt: string;
}

interface BookingByStatus {
    _id: string;
    count: number;
}

interface MostUsedService {
    _id: string;
    count: number;
    totalSpent: number;
}

interface MonthlyBooking {
    _id: { year: number; month: number };
    count: number;
    spent: number;
}

interface Summary {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    upcomingBookingsCount: number;
    totalSpent: number;
}

interface DashboardData {
    summary: Summary;
    bookingsByStatus: BookingByStatus[];
    recentBookings: Booking[];
    upcomingBookings: Booking[];
    mostUsedServices: MostUsedService[];
    monthlyBookings: MonthlyBooking[];
}

// ── Animated metric card ─────────────────────────────────────────────────────

const MetricCard = ({
    card,
    delay,
}: {
    card: { label: string; value: string; bg: string; accent: string; icon: string };
    delay: number;
}) => {
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
                <Text style={styles.metricIcon}>{card.icon}</Text>
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

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(contentAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchDashboardData = async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);

            const response = await dashboardService.dashboardStats();

            // API returns { success, data: { summary, recentBookings, ... } }
            if (response.data?.success) {
                console.log('dashboad response : ',response.data.data);
                setDashboardData(response.data.data as DashboardData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(true);
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
        return user.name.substring(0, 2).toUpperCase();
    };

    /** Primary service name from a booking's selectedServices array */
    const getPrimaryServiceName = (booking: Booking): string => {
        if (!booking.selectedServices?.length) return 'Service';
        const first = booking.selectedServices[0].serviceName;
        const extra = booking.selectedServices.length - 1;
        return extra > 0 ? `${first} +${extra} more` : first;
    };

    const getTimeAgo = (date: Date) => {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    // ── Metric cards ─────────────────────────────────────────────────────────

    const getMetricCards = () => {
        if (!dashboardData) return [];
        const { summary } = dashboardData;

        if (!user?.isStaff && user?.role !== 'admin') {
            // Patient view
            return [
                {
                    label: 'Upcoming',
                    value: summary.upcomingBookingsCount.toString(),
                    bg: '#E8F9FF',
                    accent: '#00B4E8',
                    icon: '📅',
                },
                {
                    label: 'Total Bookings',
                    value: summary.totalBookings.toString(),
                    bg: '#E6FFF5',
                    accent: '#00D4A0',
                    icon: '📋',
                },
                {
                    label: 'Completed',
                    value: summary.completedBookings.toString(),
                    bg: '#FFF8E6',
                    accent: '#F5A623',
                    icon: '✅',
                },
                {
                    label: 'Cancelled',
                    value: summary.cancelledBookings.toString(),
                    bg: '#FFE8F5',
                    accent: '#E91E63',
                    icon: '❌',
                },
            ];
        }

        // Admin / staff view
        return [
            {
                label: 'Total Bookings',
                value: summary.totalBookings.toString(),
                bg: '#E8F9FF',
                accent: '#00B4E8',
                icon: '📅',
            },
            {
                label: 'Upcoming',
                value: summary.upcomingBookingsCount.toString(),
                bg: '#E6FFF5',
                accent: '#00D4A0',
                icon: '🗓️',
            },
            {
                label: 'Completed',
                value: summary.completedBookings.toString(),
                bg: '#FFF8E6',
                accent: '#F5A623',
                icon: '✅',
            },
            {
                label: 'Cancelled',
                value: summary.cancelledBookings.toString(),
                bg: '#FFE8F5',
                accent: '#E91E63',
                icon: '❌',
            },
        ];
    };

    // ── Activity feed ─────────────────────────────────────────────────────────

    const getActivityFeed = () => {
        if (!dashboardData?.recentBookings?.length) return [];

        const statusMeta: Record<string, { icon: string; bg: string; dot: string }> = {
            completed: { icon: '✅', bg: '#E6FFF5', dot: '#00D4A0' },
            confirmed: { icon: '📋', bg: '#E8F9FF', dot: '#00B4E8' },
            cancelled: { icon: '❌', bg: '#FFE8E8', dot: '#E53935' },
            pending:   { icon: '⏳', bg: '#FFF8E6', dot: '#F5A623' },
        };

        return dashboardData.recentBookings.slice(0, 3).map((booking) => {
            const meta = statusMeta[booking.bookingStatus] ?? statusMeta.pending;
            return {
                icon: meta.icon,
                text: `${getPrimaryServiceName(booking)} — ${booking.bookingStatus}`,
                time: getTimeAgo(new Date(booking.createdAt)),
                color: meta.bg,
                dot: meta.dot,
                patientName: booking.patientName,
            };
        });
    };

    // ── Next appointment — taken from upcomingBookings ────────────────────────

    const getNextAppointment = (): Booking | null => {
        if (!dashboardData?.upcomingBookings?.length) return null;
        return dashboardData.upcomingBookings[0];
    };

    const handleViewBooking = (booking: Booking) => {
        navigation
            .getParent<NativeStackNavigationProp<RootStackParamList>>()
            .navigate('BookingDetail', { bookingId: booking._id });
    };

    // ── Revenue totals for admin banner ──────────────────────────────────────

    const getTotalRevenue = () => {
        if (!dashboardData) return 0;
        return dashboardData.monthlyBookings.reduce((sum, m) => sum + m.spent, 0);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading && !dashboardData) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={[styles.menuLabel, { marginTop: 12 }]}>Loading dashboard...</Text>
            </View>
        );
    }

    const metricCards = getMetricCards();
    const activityFeed = getActivityFeed();
    const nextAppointment = getNextAppointment();
    const summary = dashboardData?.summary;

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

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
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                            <Text style={styles.name}>{user?.name || 'User'}</Text>
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
                    {!user?.isStaff && user?.role !== 'admin' && summary && (
                        <View style={styles.healthBanner}>
                            <View style={styles.healthScoreBlock}>
                                <Text style={styles.healthScoreNum}>
                                    {summary.totalBookings}
                                </Text>
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
                                        ₹{summary.totalSpent.toLocaleString()}
                                    </Text>
                                    <Text style={styles.healthStatKey}>Spent</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Admin / staff revenue banner */}
                    {(user?.isStaff || user?.role === 'admin') && summary && (
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
                    { flex: 1 },
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
                            onPress={() =>
                                navigation
                                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                                    .navigate('Booking')
                            }
                        >
                            <LinearGradient
                                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.quickActionGradient}
                            >
                                <Text style={styles.quickActionIcon}>📅</Text>
                                <Text style={styles.quickActionText}>Book Service</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Next Appointment — from upcomingBookings[0] */}
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
                                        <Text style={styles.apptIconEmoji}>🏥</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.apptType}>
                                            {getPrimaryServiceName(nextAppointment)}
                                        </Text>
                                        <Text style={styles.apptSub}>
                                            Patient: {nextAppointment.patientName}
                                        </Text>
                                    </View>
                                    <View style={styles.apptBadge}>
                                        <Text style={styles.apptBadgeText}>
                                            {nextAppointment.bookingStatus.charAt(0).toUpperCase() +
                                                nextAppointment.bookingStatus.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.apptTimeRow}>
                                    <View style={styles.apptTimeChip}>
                                        <Text style={styles.apptTimeIcon}>📅</Text>
                                        <Text style={styles.apptTimeText}>
                                            {formatDate(nextAppointment.createdAt)}
                                        </Text>
                                    </View>
                                    <View style={styles.apptTimeChip}>
                                        <Text style={styles.apptTimeIcon}>⏰</Text>
                                        <Text style={styles.apptTimeText}>
                                            {nextAppointment.preferredTimeSlot}
                                        </Text>
                                    </View>
                                </View>

                                {/* Grand total chip */}
                                <View style={styles.apptTotalRow}>
                                    <Text style={styles.apptTotalLabel}>Total Amount</Text>
                                    <Text style={styles.apptTotalValue}>
                                        ₹{nextAppointment.grandTotal.toLocaleString()}
                                    </Text>
                                </View>

                                {nextAppointment.vendorId && (
                                    <View style={styles.apptNurseRow}>
                                        <View style={styles.nurseAvatar}>
                                            <Text style={styles.nurseAvatarText}>
                                                {nextAppointment.vendorId.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.nurseName}>
                                                {nextAppointment.vendorId.name}
                                            </Text>
                                            <Text style={styles.nurseRating}>
                                                {nextAppointment.vendorId.businessName}
                                            </Text>
                                        </View>
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
                                        <Text style={styles.viewDetailsBtnText}>View Full Details</Text>
                                        <Text style={styles.viewDetailsBtnArrow}>→</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Most Used Services */}
                    {(dashboardData?.mostUsedServices as MostUsedService[])?.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Top Services</Text>
                            <View style={styles.activityFeed}>
                                {dashboardData?.mostUsedServices.slice(0, 3).map((svc, idx, arr) => (
                                    <View
                                        key={svc._id}
                                        style={[
                                            styles.activityItem,
                                            idx < arr.length - 1 && styles.activityItemBorder,
                                        ]}
                                    >
                                        <View
                                            style={[styles.activityIconWrap, { backgroundColor: '#E8F9FF' }]}
                                        >
                                            <Text style={styles.activityEmoji}>🏥</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.activityText}>{svc._id}</Text>
                                            <Text style={styles.activityTime}>
                                                {svc.count} booking{svc.count !== 1 ? 's' : ''} · ₹
                                                {svc.totalSpent.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={[styles.activityDot, { backgroundColor: '#00B4E8' }]} />
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
                                {activityFeed.map((item, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.activityItem,
                                            idx < activityFeed.length - 1 && styles.activityItemBorder,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.activityIconWrap,
                                                { backgroundColor: item.color },
                                            ]}
                                        >
                                            <Text style={styles.activityEmoji}>{item.icon}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.activityText}>{item.text}</Text>
                                            <Text style={styles.activityTime}>{item.time}</Text>
                                        </View>
                                        <View
                                            style={[styles.activityDot, { backgroundColor: item.dot }]}
                                        />
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Patient tip */}
                    {!user?.isStaff && user?.role !== 'admin' && (
                        <View style={styles.tipCard}>
                            <Text style={styles.tipIcon}>🏆</Text>
                            <Text style={styles.tipText}>
                                Welcome to your health dashboard! Book appointments and track your
                                health journey.
                            </Text>
                        </View>
                    )}

                    {/* Empty state */}
                    {summary?.totalBookings === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyTitle}>No bookings yet</Text>
                            <Text style={styles.emptyText}>
                                Start your health journey by booking your first service
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() =>
                                    navigation
                                        .getParent<NativeStackNavigationProp<RootStackParamList>>()
                                        .navigate('Booking')
                                }
                            >
                                <Text style={styles.emptyButtonText}>Book Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },

    // Header
    header: {
        paddingTop: 56,
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
    content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 0 },
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
        backgroundColor: '#FFF8E6',
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
    apptNurseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F8FCFF',
        borderRadius: 12,
        padding: 10,
    },
    nurseAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.gradientMid + '30',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nurseAvatarText: { fontSize: 13, fontWeight: '700', color: Colors.gradientMid },
    nurseName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
    nurseRating: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
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