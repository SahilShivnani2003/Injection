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
import { bookingAPI } from '@/service/apis/bookingService';
import { Booking } from '@/features/booking/types/Booking';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { Colors } from '@/theme/colors';

const VendorBookingsScreen = ({ navigation }: NativeBottomTabScreenProps<VendorTabParamList, 'Bookings'>) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await bookingAPI.vendorBookings();
            setBookings(response.data?.data ?? response.data?.bookings ?? response.data ?? []);
        } catch (error) {
            console.warn('Unable to load bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'accept' | 'start' | 'complete' | 'cancel') => {
        setProcessingId(bookingId);
        try {
            if (action === 'accept') {
                await bookingAPI.vendorAcceptBooking({ bookingId });
            } else if (action === 'start') {
                await bookingAPI.vendorStartBooking({ bookingId });
            } else if (action === 'complete') {
                await bookingAPI.vendorCompleteBooking({ bookingId });
            } else {
                await bookingAPI.vendorCancelBooking({ bookingId });
            }
            await fetchBookings();
        } catch (error) {
            Alert.alert('Action failed', 'Unable to update booking status.');
        } finally {
            setProcessingId(null);
        }
    };

    const statusColors = (status?: string) => {
        switch (status) {
            case 'accepted':
                return '#00D4A0';
            case 'in-progress':
                return '#0E8DFF';
            case 'completed':
                return '#7ED321';
            case 'cancelled':
                return '#FF5A5F';
            default:
                return '#FFB800';
        }
    };

    const renderActions = (booking: Booking) => {
        switch (booking.bookingStatus) {
            case 'pending':
                return (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryAction]}
                            onPress={() => handleBookingAction(booking._id ?? '', 'accept')}
                            disabled={processingId === booking._id}
                        >
                            <Text style={styles.actionText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.dangerAction]}
                            onPress={() => handleBookingAction(booking._id ?? '', 'cancel')}
                            disabled={processingId === booking._id}
                        >
                            <Text style={styles.actionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'accepted':
                return (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryAction]}
                            onPress={() => handleBookingAction(booking._id ?? '', 'start')}
                            disabled={processingId === booking._id}
                        >
                            <Text style={styles.actionText}>Start</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'in-progress':
                return (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryAction]}
                            onPress={() => handleBookingAction(booking._id ?? '', 'complete')}
                            disabled={processingId === booking._id}
                        >
                            <Text style={styles.actionText}>Complete</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
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
                <Text style={styles.headerTitle}>Bookings</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {bookings.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No booking requests are available right now.</Text>
                    </View>
                ) : (
                    bookings.map(booking => (
                        <View key={booking._id ?? booking.patientName + booking.preferredTimeSlot} style={styles.bookingCard}>
                            <View style={styles.bookingHeader}>
                                <Text style={styles.bookingTitle}>{booking.patientName}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColors(booking.bookingStatus) + '22' }]}>
                                    <Text style={[styles.statusText, { color: statusColors(booking.bookingStatus) }]}>
                                        {booking.bookingStatus?.replace('-', ' ')?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.bookingMeta}>{booking.address}</Text>
                            <Text style={styles.bookingMeta}>Preferred: {booking.preferredTimeSlot}</Text>
                            <Text style={styles.bookingPrice}>₹{booking.grandTotal?.toLocaleString('en-IN') ?? booking.subtotal?.toLocaleString('en-IN')}</Text>
                            <View style={styles.serviceChipsRow}>
                                {(booking.selectedServices || []).map(service => (
                                    <View key={service.serviceId} style={styles.serviceChip}>
                                        <Text style={styles.serviceChipText}>{service.serviceName}</Text>
                                    </View>
                                ))}
                            </View>
                            {renderActions(booking)}
                        </View>
                    ))
                )}

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={fetchBookings}
                    activeOpacity={0.85}
                >
                    <Ionicons name="refresh" size={18} color={Colors.gradientStart} />
                    <Text style={styles.secondaryButtonText}>Refresh bookings</Text>
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
    bookingCard: {
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
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textDark,
        flexShrink: 1,
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
    bookingMeta: {
        color: Colors.textMedium,
        fontSize: 13,
        marginBottom: 6,
    },
    bookingPrice: {
        color: Colors.textDark,
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 10,
    },
    serviceChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    serviceChip: {
        backgroundColor: '#F4F8FB',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    serviceChipText: {
        color: Colors.textMuted,
        fontSize: 11,
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryAction: {
        backgroundColor: Colors.gradientStart,
    },
    dangerAction: {
        backgroundColor: '#FF5A5F',
    },
    actionText: {
        color: Colors.white,
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
    secondaryButton: {
        marginTop: 8,
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
    secondaryButtonText: {
        color: Colors.gradientStart,
        fontWeight: '800',
        fontSize: 13,
    },
});

export default VendorBookingsScreen;
