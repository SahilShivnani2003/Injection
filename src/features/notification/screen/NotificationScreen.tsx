import { Colors, Fonts, Spacing } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Notification } from '../types/Notification';
import { bookingAPI } from '@/service/apis/bookingService';
import { useAlert } from '@/context/AlertContext';

type NotificationScreenProps = NativeStackScreenProps<RootStackParamList, 'Notification'>;

// ─── Icon map per notification type ────────────────────────────────────────────
const TYPE_META: Record<
    NonNullable<Notification['type']>,
    { icon: string; label: string; iconColor: string; iconBg: string }
> = {
    new_booking: {
        icon: 'calendar-outline',
        label: 'New Booking',
        iconColor: Colors.gradientStart,
        iconBg: 'rgba(0,212,160,0.12)',
    },
    booking_update: {
        icon: 'create-outline',
        label: 'Booking Update',
        iconColor: Colors.gradientEnd,
        iconBg: 'rgba(0,180,232,0.12)',
    },
    general: {
        icon: 'information-circle-outline',
        label: 'General',
        iconColor: Colors.textMuted,
        iconBg: 'rgba(90,122,138,0.12)',
    },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Notification Card ──────────────────────────────────────────────────────────
interface CardProps {
    item: Notification;
    onAccept: (id: string) => void;
    onRead: (id: string) => void;
}

const NotificationCard = ({ item, onAccept, onRead }: CardProps) => {
    const type = item.type ?? 'general';
    const meta = TYPE_META[type];
    const unread = !item.isRead;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.card, unread && styles.cardUnread]}
            onPress={() => !item.isRead && onRead(item.bookingId?._id)}
        >
            {/* Unread indicator */}
            {unread && <View style={styles.unreadDot} />}

            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: meta.iconBg }]}>
                <Ionicons name={meta.icon} size={22} color={meta.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                    <Text style={styles.cardLabel}>{meta.label}</Text>
                    <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.cardMessage} numberOfLines={2}>
                    {item.message}
                </Text>

                {/* Accept button — only for unaccepted new bookings */}
                {type === 'new_booking' && !item.isAccepted && (
                    <TouchableOpacity
                        style={styles.acceptBtn}
                        activeOpacity={0.8}
                        onPress={() => onAccept(item.bookingId?._id)}
                    >
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.acceptGradient}
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={15}
                                color={Colors.white}
                            />
                            <Text style={styles.acceptText}>Accept Booking</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Accepted badge */}
                {type === 'new_booking' && item.isAccepted && (
                    <View style={styles.acceptedBadge}>
                        <Ionicons name="checkmark-done" size={13} color={Colors.gradientStart} />
                        <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

// ─── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = () => (
    <View style={styles.emptyWrap}>
        <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-off-outline" size={40} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>All caught up</Text>
        <Text style={styles.emptySub}>
            No notifications yet. New booking alerts will appear here.
        </Text>
    </View>
);

// ─── Screen ─────────────────────────────────────────────────────────────────────
export const NotificationScreen = ({ navigation }: NotificationScreenProps) => {
    const alert = useAlert();
    const [notifications, setNotifications] = useState<Notification[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await bookingAPI.getNotifications();
            if (response.data?.success) {
                console.log('Notification response : ', response.data)
                setNotifications(response.data?.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAcceptBooking = async (bookingId: string) => {
        if (!bookingId) return;
        try {
            const response = await bookingAPI.acceptUserBooking(bookingId);
            if (response.data?.success) {
                alert.success('Success', 'Booking accepted.');
                // Optimistic update
                setNotifications(prev =>
                    prev
                        ? prev.map(n =>
                              n.bookingId === bookingId ? { ...n, isAccepted: true } : n,
                          )
                        : prev,
                );
            }
        } catch (error: any) {
            alert.error('Status Update Failed', error?.message || 'Failed to update booking.');
        }
    };

    const handleReadNotification = async (notificationId: string) => {
        if (!notificationId) return;
        try {
            const response = await bookingAPI.readNotification(notificationId);
            if (response.data?.success) {
                setNotifications(prev =>
                    prev
                        ? prev.map(n =>
                              n.bookingId === notificationId ? { ...n, isRead: true } : n,
                          )
                        : prev,
                );
            }
        } catch (error) {
            console.error('Error reading notification:', error);
        }
    };

    const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                        <View style={styles.headerTextGroup}>
                            <Text style={styles.headerTitle}>Notifications</Text>
                            {unreadCount > 0 && (
                                <Text style={styles.headerSub}>{unreadCount} unread</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.refreshIconBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => fetchNotifications(true)}
                    >
                        <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* ── Body ── */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.gradientStart} />
                    <Text style={styles.loadingText}>Loading notifications…</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications ?? []}
                    keyExtractor={(item, idx) => item.bookingId ?? String(idx)}
                    contentContainerStyle={[
                        styles.listContent,
                        (!notifications || notifications.length === 0) && styles.listEmpty,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => fetchNotifications(true)}
                    ListEmptyComponent={<EmptyState />}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <NotificationCard
                            item={item}
                            onAccept={handleAcceptBooking}
                            onRead={handleReadNotification}
                        />
                    )}
                />
            )}
        </View>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
    loadingText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
        color: Colors.textMuted,
    },

    // Header
    header: {
        paddingTop: 24,
        paddingBottom: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    headerTextGroup: { gap: 2 },
    headerTitle: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: '800',
        color: Colors.white,
    },
    headerSub: {
        fontSize: Fonts.sizes.sm,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
    },
    refreshIconBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 10,
    },

    // List
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    listEmpty: {
        flex: 1,
    },
    separator: { height: Spacing.sm },

    // Card
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.lg,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    cardUnread: {
        borderLeftWidth: 3,
        borderLeftColor: Colors.gradientStart,
    },
    unreadDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.gradientStart,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        flexShrink: 0,
    },
    cardContent: { flex: 1 },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.textMedium,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    cardTime: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    cardMessage: {
        fontSize: Fonts.sizes.md,
        color: Colors.textDark,
        lineHeight: 20,
        marginBottom: 2,
    },

    // Accept button
    acceptBtn: {
        marginTop: Spacing.sm,
        alignSelf: 'flex-start',
        borderRadius: 10,
        overflow: 'hidden',
    },
    acceptGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 7,
        paddingHorizontal: Spacing.md,
    },
    acceptText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.white,
    },

    // Accepted badge
    acceptedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.sm,
    },
    acceptedText: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
        color: Colors.gradientStart,
    },

    // Empty state
    emptyWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxxl,
        gap: Spacing.sm,
    },
    emptyIconWrap: {
        width: 76,
        height: 76,
        borderRadius: 24,
        backgroundColor: 'rgba(90,122,138,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    emptyTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
        color: Colors.textDark,
    },
    emptySub: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
