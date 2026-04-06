import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../theme/colors';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { TabParamList } from '../../../navigation/TabNavigator';
import { useAlert } from '../../../context/AlertContext';
import { bookingAPI } from '../../../service/apis/bookingService';
import Loader from '../../../components/Loader';
import { Booking } from '@/types/booking';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';

type BookingsProps = NativeBottomTabScreenProps<TabParamList, 'Bookings'>;

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
    const renderItem = ({ item }: { item: Booking }) => {
        const getStatusColor = (status?: string) => {
            switch (status) {
                case 'pending':
                    return Colors.accent; // Orange for pending
                case 'accepted':
                    return Colors.gradientStart; // Green for accepted
                case 'in-progress':
                    return Colors.gradientMid; // Blue for in progress
                case 'completed':
                    return Colors.textMuted; // Gray for completed
                case 'cancelled':
                    return '#FF4757'; // Red for cancelled
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

        const formatDate = (date?: Date) => {
            if (!date) return 'Date not set';
            return new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        };

        const formatTime = (timeSlot: string) => {
            // Assuming timeSlot is in format like "10:00-11:00"
            return timeSlot.split('-')[0] || timeSlot;
        };

        const getServiceNames = (services: any[]) => {
            if (!services || services.length === 0) return 'No services';
            return services.map(service => service.serviceName).join(', ');
        };

        const handleNavigation = () => {
            if (item._id) {
                navigation
                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                    .navigate('BookingDetail', {
                        bookingId: item._id,
                    });
            }
        };
        return (
            <View style={styles.card} onTouchEnd={handleNavigation}>
                <View style={styles.row}>
                    <Text style={styles.title} numberOfLines={1}>
                        {getServiceNames(item.selectedServices)}
                    </Text>
                    <Text style={[styles.status, { color: getStatusColor(item.bookingStatus) }]}>
                        {getStatusText(item.bookingStatus)}
                    </Text>
                </View>

                <Text style={styles.datetime}>
                    {`${item.createdAt} • ${formatTime(item.preferredTimeSlot)}`}
                </Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailText}>₹{item.grandTotal?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.detailText}>
                        {item.serviceLocation || 'Location not set'}
                    </Text>
                </View>

                {item.bookingStatus === 'pending' && (
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </LinearGradient>

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>My Bookings</Text>
                    <TouchableOpacity
                        style={styles.refreshBtn}
                        onPress={fetchBookings}
                        disabled={loading}
                    >
                        <Text style={styles.refreshText}>↻</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Loader type="dots" size="large" text="Loading your bookings..." />
                    </View>
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No bookings found</Text>
                        <Text style={styles.emptySubtext}>
                            Your booking history will appear here
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        keyExtractor={item => item.userId || Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={fetchBookings}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FCFF' },
    header: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        position: 'absolute',
        left: 18,
        top: 60,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: { color: Colors.textLight, fontSize: 18, fontWeight: '700' },
    headerTitle: { color: Colors.textLight, fontSize: 22, fontWeight: '700', textAlign: 'center' },
    container: { padding: 16, paddingTop: 20, flex: 1 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, color: Colors.textDark, fontWeight: '700' },
    refreshBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.gradientStart,
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textMedium,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    list: { paddingBottom: 20 },
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        color: Colors.textDark,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    status: { fontSize: 13, fontWeight: '700' },
    datetime: { fontSize: 13, color: Colors.textMedium, marginBottom: 8 },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailText: { fontSize: 12, color: Colors.textMuted },
    actionBtn: {
        backgroundColor: '#FF4757',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    actionText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
});

export default BookingsScreen;
