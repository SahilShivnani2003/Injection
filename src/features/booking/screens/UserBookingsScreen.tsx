import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Loader from '@/components/Loader';
import { useAlert } from '@/context/AlertContext';
import { bookingAPI } from '@/service/apis/bookingService';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { UserTabParamList } from '@/types/UserTabParamList';
import { Booking } from '../types/Booking';
import Icon from 'react-native-vector-icons/MaterialIcons';

type BookingsProps = NativeBottomTabScreenProps<UserTabParamList, 'Bookings'>;

const BookingsScreen = ({ navigation }: BookingsProps) => {
    const alert = useAlert();
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.userBookings();
            setBookings(response.data?.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            alert.error('Error', 'Failed to load bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'pending':
                return Colors.accent;
            case 'accepted':
                return Colors.gradientStart;
            case 'in-progress':
                return Colors.gradientMid;
            case 'completed':
                return Colors.textMuted;
            case 'cancelled':
                return '#FF4757';
            default:
                return Colors.textMedium;
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'accepted':
                return 'Accepted';
            case 'in-progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

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

    const handleNavigation = (item: Booking) => {
        if (item._id) {
            navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                .navigate('BookingDetail', { bookingId: item._id });
        }
    };

    const renderItem = ({ item }: { item: Booking }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigation(item)}
            activeOpacity={0.75}
        >
            <View style={styles.cardRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {getServiceNames(item.selectedServices)}
                </Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.bookingStatus) + '1A' },
                    ]}
                >
                    <Text style={[styles.status, { color: getStatusColor(item.bookingStatus) }]}>
                        {getStatusText(item.bookingStatus)}
                    </Text>
                </View>
            </View>

            <Text style={styles.datetime}>
                {`${formatDate(item.createdAt)} • ${formatTime(item.preferredTimeSlot)}`}
            </Text>

            <View style={styles.detailsRow}>
                <View style={styles.detailChip}>
                    <Icon name="currency-rupee" size={13} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{item.grandTotal?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.detailChip}>
                    <Icon name="location-on" size={13} color={Colors.textMuted} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {item.serviceLocation || 'Location not set'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => {
                    handleNavigation(item)
                }}
            >
                <Text style={styles.cancelText}>View Detail</Text>
                <Icon name="arrow-right" size={25} color={Colors.white} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                {/* Left — back button */}
                <TouchableOpacity
                    style={styles.headerIconBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={22} color={Colors.textLight} />
                </TouchableOpacity>

                {/* Center — title */}
                <Text style={styles.headerTitle}>My Bookings</Text>

                {/* Right — spacer keeps title centered */}
                <View style={styles.headerIconBtn} />
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
                ) : (
                    <FlatList
                        data={bookings}
                        // Use _id for reliable unique keys
                        keyExtractor={item => item._id ?? Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={fetchBookings}
                    />
                )}
                <View style={{height: 42, marginBottom: 24}}></View>
            </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 32,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.textLight,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        flex: 1,
    },

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
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    list: {
        paddingBottom: 20,
    },

    /* ── Card ────────────────────────────────────────────── */
    card: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.tableBorder,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    status: {
        fontSize: 12,
        fontWeight: '700',
    },
    datetime: {
        fontSize: 13,
        color: Colors.textMedium,
        marginBottom: 10,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
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
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.gradientMid,
        borderRadius: 8,
        paddingVertical: 10,
    },
    cancelText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default BookingsScreen;
