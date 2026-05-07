import { bookingAPI } from '@/service/apis/bookingService';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
    TextInput,
    Modal,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Booking, BookingStatus } from '../types/Booking';
import { useAlert } from '@/context/AlertContext';

const { width } = Dimensions.get('window');

type BookingDetailProps = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

// ── Populated sub-types from API (vendorId / userId come as objects) ──────────

interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface PopulatedVendor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    businessName: string;
}

// Extend Booking so populated fields are typed properly
type PopulatedBooking = Omit<Booking, 'userId' | 'vendorId'> & {
    _id: string;
    userId: PopulatedUser;
    vendorId: PopulatedVendor | null;
};

// ─── Reschedule form state ────────────────────────────────────────────────────

interface RescheduleForm {
    newDate: string;
    newTime: string;
    reason: string;
}

const RESCHEDULE_FORM_DEFAULT: RescheduleForm = { newDate: '', newTime: '', reason: '' };

// Validation helpers
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:MM (24-hr)

const validateRescheduleForm = (form: RescheduleForm): string | null => {
    if (!form.newDate.trim()) return 'Please enter a new date.';
    if (!DATE_REGEX.test(form.newDate)) return 'Date must be in YYYY-MM-DD format.';
    const inputDate = new Date(form.newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(inputDate.getTime())) return 'Please enter a valid date.';
    if (inputDate < today) return 'Date cannot be in the past.';
    if (!form.newTime.trim()) return 'Please enter a new time.';
    if (!TIME_REGEX.test(form.newTime)) return 'Time must be in HH:MM (24-hr) format.';
    if (!form.reason.trim()) return 'Please provide a reason for rescheduling.';
    if (form.reason.trim().length < 5) return 'Reason must be at least 5 characters.';
    return null;
};

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    BookingStatus,
    { label: string; bg: string; text: string; dot: string; icon: string }
> = {
    pending: { label: 'Pending', bg: '#FFF8E6', text: '#C07800', dot: '#F5A623', icon: '⏳' },
    accepted: { label: 'Accepted', bg: '#E6FFF5', text: '#00A07A', dot: '#00D4A0', icon: '✅' },
    'in-progress': {
        label: 'In Progress',
        bg: '#E8F9FF',
        text: '#0077AA',
        dot: '#00B4E8',
        icon: '🔄',
    },
    completed: { label: 'Completed', bg: '#F0F0FF', text: '#5B5BD6', dot: '#7B7BFF', icon: '🏆' },
    cancelled: { label: 'Cancelled', bg: '#FFF0F0', text: '#CC2200', dot: '#FF4444', icon: '❌' },
};

// ─── Section Header ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <View style={sectionStyles.row}>
        <View style={sectionStyles.iconBox}>
            <Text style={sectionStyles.icon}>{icon}</Text>
        </View>
        <Text style={sectionStyles.title}>{title}</Text>
        <View style={sectionStyles.line} />
    </View>
);

const sectionStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 24 },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#E8F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: { fontSize: 16 },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    line: { flex: 1, height: 1, backgroundColor: '#E8EFF4' },
});

// ─── Info Row ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <View style={infoStyles.row}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={[infoStyles.value, accent && infoStyles.accentValue]}>{value}</Text>
    </View>
);

const infoStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F8',
    },
    label: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', flex: 1 },
    value: {
        fontSize: 13,
        color: Colors.textDark,
        fontWeight: '600',
        flex: 1.5,
        textAlign: 'right',
    },
    accentValue: { color: Colors.gradientMid },
});

// ─── Service Row ───────────────────────────────────────────────────────────────

const ServiceRow = ({
    service,
    isLast,
}: {
    // FIX: quantity is optional in Booking type — handled with fallback below
    service: { serviceName: string; price: number; quantity?: number };
    isLast: boolean;
}) => {
    const qty = service.quantity ?? 1;
    return (
        <View style={[srStyles.row, !isLast && srStyles.border]}>
            <View style={srStyles.dot} />
            <Text style={srStyles.name}>{service.serviceName}</Text>
            <Text style={srStyles.qty}>×{qty}</Text>
            <Text style={srStyles.price}>₹{(service.price * qty).toLocaleString()}</Text>
        </View>
    );
};

const srStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 10 },
    border: { borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.gradientMid },
    name: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
    qty: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', marginRight: 6 },
    price: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
});

// ─── Helper: initials from name ───────────────────────────────────────────────

const getInitials = (name: string) =>
    name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?';

// ─── Reschedule Modal ─────────────────────────────────────────────────────────

interface RescheduleModalProps {
    visible: boolean;
    loading: boolean;
    form: RescheduleForm;
    onChange: (field: keyof RescheduleForm, value: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}

const RescheduleModal = ({
    visible,
    loading,
    form,
    onChange,
    onConfirm,
    onClose,
}: RescheduleModalProps) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
    >
        <KeyboardAvoidingView
            style={modalStyles.overlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={onClose} />

            <View style={modalStyles.sheet}>
                {/* Handle */}
                <View style={modalStyles.handle} />

                {/* Title */}
                <View style={modalStyles.titleRow}>
                    <View style={modalStyles.titleIcon}>
                        <Text style={{ fontSize: 20 }}>📅</Text>
                    </View>
                    <View>
                        <Text style={modalStyles.title}>Reschedule Booking</Text>
                        <Text style={modalStyles.subtitle}>
                            Choose a new date, time &amp; reason
                        </Text>
                    </View>
                </View>

                {/* Date Field */}
                <View style={modalStyles.fieldGroup}>
                    <Text style={modalStyles.fieldLabel}>New Date</Text>
                    <View style={modalStyles.inputWrapper}>
                        <Text style={modalStyles.inputIcon}>📆</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#B0BEC5"
                            value={form.newDate}
                            onChangeText={v => onChange('newDate', v)}
                            keyboardType="numbers-and-punctuation"
                            maxLength={10}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Time Field */}
                <View style={modalStyles.fieldGroup}>
                    <Text style={modalStyles.fieldLabel}>Preferred Time</Text>
                    <View style={modalStyles.inputWrapper}>
                        <Text style={modalStyles.inputIcon}>🕐</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="HH:MM  (24-hr format, e.g. 09:30)"
                            placeholderTextColor="#B0BEC5"
                            value={form.newTime}
                            onChangeText={v => onChange('newTime', v)}
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Reason Field */}
                <View style={modalStyles.fieldGroup}>
                    <Text style={modalStyles.fieldLabel}>Reason for Rescheduling</Text>
                    <View style={[modalStyles.inputWrapper, modalStyles.textAreaWrapper]}>
                        <TextInput
                            style={[modalStyles.input, modalStyles.textArea]}
                            placeholder="e.g. Patient unavailable, need to change time slot..."
                            placeholderTextColor="#B0BEC5"
                            value={form.reason}
                            onChangeText={v => onChange('reason', v)}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Buttons */}
                <View style={modalStyles.buttonRow}>
                    <TouchableOpacity
                        style={modalStyles.cancelBtn}
                        onPress={onClose}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[modalStyles.confirmBtn, loading && { opacity: 0.7 }]}
                        onPress={onConfirm}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={modalStyles.confirmGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={modalStyles.confirmBtnText}>Confirm Reschedule</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        gap: 16,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#DDE3EA',
        alignSelf: 'center',
        marginBottom: 4,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    titleIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#E8F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 17, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
    subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

    fieldGroup: { gap: 6 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E0E8EF',
        borderRadius: 14,
        backgroundColor: '#F8FCFF',
        paddingHorizontal: 12,
        gap: 8,
    },
    textAreaWrapper: { alignItems: 'flex-start', paddingVertical: 10 },
    inputIcon: { fontSize: 16 },
    input: {
        flex: 1,
        fontSize: 14,
        color: Colors.textDark,
        fontWeight: '500',
        paddingVertical: 13,
    },
    textArea: { paddingVertical: 0, minHeight: 70 },

    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: '#DDE3EA',
        backgroundColor: '#F8FCFF',
    },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
    confirmBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
    confirmGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    confirmBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

const BookingDetailScreen = ({ navigation, route }: BookingDetailProps) => {
    const alert = useAlert();
    const bookingId = route.params?.bookingId;

    const [booking, setBooking] = useState<PopulatedBooking | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedPrescription, setExpandedPrescription] = useState<number | null>(null);

    // Reschedule modal state
    const [rescheduleVisible, setRescheduleVisible] = useState(false);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>(RESCHEDULE_FORM_DEFAULT);

    const headerAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(0)).current;
    const statusScale = useRef(new Animated.Value(0.85)).current;

    // ── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchBookingData();
    }, [bookingId]);

    const fetchBookingData = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.getBookingDetails(bookingId);
            if (response.data?.success) {
                setBooking(response.data.data as PopulatedBooking);
            } else {
                setBooking(null);
            }
        } catch (error) {
            console.error('Error fetching booking detail:', error);
            setBooking(null);
        } finally {
            setLoading(false);
        }
    };

    // ── Cancel ─────────────────────────────────────────────────────────────────

    const handleCancelBooking = async () => {
        try {
            const response = await bookingAPI.CancelBooking(bookingId);
            if (response.data?.success) {
                // Optimistically update local state
                setBooking(prev =>
                    prev ? { ...prev, bookingStatus: 'cancelled', cancelledAt: new Date() } : prev,
                );
                alert.success('Success', 'Booking cancelled successfully.');
            } else {
                alert.error('Error', response.data?.message || 'Could not cancel booking.');
            }
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            alert.error(
                'Error',
                error?.response?.data?.message || error?.message || 'Something went wrong.',
            );
        }
    };

    // FIX: removed duplicate `Alert.alert`. Fixed onPress — was `() => {handleCancelBooking}` (no-op).
    const handleCancel = () => {
        alert.show({
            title: 'Cancel Booking',
            message: 'Are you sure you want to cancel this booking?',
            buttons: [
                { label: 'No', style: 'secondary', onPress: alert.dismiss },
                {
                    label: 'Yes, Cancel',
                    style: 'danger',
                    onPress: () => {
                        alert.dismiss();
                        handleCancelBooking();
                    },
                },
            ],
        });
    };

    // ── Reschedule ─────────────────────────────────────────────────────────────

    const openRescheduleModal = () => {
        setRescheduleForm(RESCHEDULE_FORM_DEFAULT);
        setRescheduleVisible(true);
    };

    const handleRescheduleFormChange = (field: keyof RescheduleForm, value: string) => {
        setRescheduleForm(prev => ({ ...prev, [field]: value }));
    };

    const handleRescheduleConfirm = async () => {
        const error = validateRescheduleForm(rescheduleForm);
        if (error) {
            alert.error('Invalid Input', error);
            return;
        }

        try {
            setRescheduleLoading(true);

            const payload = {
                newDate: rescheduleForm.newDate.trim(),
                newTime: rescheduleForm.newTime.trim(),
                reason: rescheduleForm.reason.trim(),
            };

            const response = await bookingAPI.rescheduleBooking(bookingId, payload);

            if (response.data?.success) {
                setRescheduleVisible(false);
                // Optimistically update the preferred time slot shown in the header
                setBooking(prev =>
                    prev
                        ? {
                              ...prev,
                              preferredTimeSlot: `${payload.newDate} ${payload.newTime}`,
                          }
                        : prev,
                );
                alert.success('Success', 'Booking rescheduled successfully.');
            } else {
                alert.error('Error', response.data?.message || 'Could not reschedule booking.');
            }
        } catch (error: any) {
            console.error('Error rescheduling booking:', error);
            alert.error(
                'Error',
                error?.response?.data?.message || error?.message || 'Something went wrong.',
            );
        } finally {
            setRescheduleLoading(false);
        }
    };

    // ── Animations (run after data loads) ─────────────────────────────────────

    useEffect(() => {
        if (!booking) return;
        Animated.parallel([
            Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(contentAnim, {
                toValue: 1,
                duration: 550,
                delay: 150,
                useNativeDriver: true,
            }),
            Animated.spring(statusScale, {
                toValue: 1,
                delay: 300,
                tension: 70,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [booking]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const formatDate = (iso?: string | Date | null) => {
        if (!iso) return '—';
        return new Date(iso as string).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ── Loading ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.loadingText}>Loading booking details...</Text>
            </View>
        );
    }

    // ── Not Found ──────────────────────────────────────────────────────────────

    if (!booking) {
        return (
            <View
                style={[
                    styles.root,
                    { justifyContent: 'center', alignItems: 'center', padding: 32 },
                ]}
            >
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
                <Text style={styles.loadingText}>Booking not found.</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backFallbackBtn}
                >
                    <Text style={styles.backFallbackText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const status = STATUS_CONFIG[booking.bookingStatus ?? 'pending'] ?? STATUS_CONFIG.pending;

    // A booking is still actionable if it's not completed or cancelled
    const isActionable =
        booking.bookingStatus !== 'completed' && booking.bookingStatus !== 'cancelled';

    // Reschedule is only available before a provider accepts
    const canReschedule =
        booking.bookingStatus === 'pending' || booking.bookingStatus === 'accepted';

    return (
        <View style={styles.root}>
            {/* ── Reschedule Modal ── */}
            <RescheduleModal
                visible={rescheduleVisible}
                loading={rescheduleLoading}
                form={rescheduleForm}
                onChange={handleRescheduleFormChange}
                onConfirm={handleRescheduleConfirm}
                onClose={() => !rescheduleLoading && setRescheduleVisible(false)}
            />

            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
                                        outputRange: [-10, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {/* Back + Title */}
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.backArrow}>←</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Booking Details</Text>
                            <Text style={styles.headerSub}>
                                Created {formatDate(booking.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Patient pill */}
                    <View style={styles.patientRow}>
                        <View style={styles.patientAvatar}>
                            <Text style={styles.patientAvatarText}>
                                {getInitials(booking.patientName)}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.patientName}>{booking.patientName}</Text>
                            <Text style={styles.patientMeta}>
                                {booking.age} yrs · {booking.sex} · {booking.currentLocation}
                            </Text>
                        </View>
                        <Animated.View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: status.bg, transform: [{ scale: statusScale }] },
                            ]}
                        >
                            <Text style={styles.statusIcon}>{status.icon}</Text>
                            <Text style={[styles.statusText, { color: status.text }]}>
                                {status.label}
                            </Text>
                        </Animated.View>
                    </View>

                    {/* Slot + Duration strip */}
                    <View style={styles.slotStrip}>
                        <View style={styles.slotChip}>
                            <Text style={styles.slotIcon}>⏰</Text>
                            <Text style={styles.slotText}>{booking.preferredTimeSlot}</Text>
                        </View>
                        <View style={styles.slotDivider} />
                        <View style={styles.slotChip}>
                            <Text style={styles.slotIcon}>⏱</Text>
                            <Text style={styles.slotText}>~{booking.estimatedDuration} min</Text>
                        </View>
                        <View style={styles.slotDivider} />
                        <View style={styles.slotChip}>
                            <Text style={styles.slotIcon}>👤</Text>
                            <Text style={styles.slotText}>{booking.staffPreference}</Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            {/* ── Content ── */}
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
                >
                    {/* ── Services ── */}
                    <SectionHeader icon="🩺" title="Services" />
                    <View style={styles.card}>
                        {booking.selectedServices.map((s, i) => (
                            <ServiceRow
                                key={s.serviceId}
                                service={s}
                                isLast={i === booking.selectedServices.length - 1}
                            />
                        ))}

                        {/* Totals */}
                        <View style={styles.totalBlock}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal</Text>
                                <Text style={styles.totalVal}>
                                    ₹{booking.subtotal.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>GST</Text>
                                <Text style={styles.totalVal}>
                                    ₹{booking.gstAmount.toLocaleString()}
                                </Text>
                            </View>
                            {booking.appliedCoupon?.discountAmount != null &&
                                booking.appliedCoupon.discountAmount > 0 && (
                                    <View style={styles.totalRow}>
                                        <Text style={[styles.totalLabel, { color: '#00A07A' }]}>
                                            🏷️ Coupon ({booking.appliedCoupon.couponCode})
                                        </Text>
                                        <Text style={[styles.totalVal, { color: '#00A07A' }]}>
                                            −₹
                                            {booking.appliedCoupon.discountAmount.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            {booking.freeComplimentaryService &&
                                booking.freeComplimentaryService !== 'None' && (
                                    <View style={styles.totalRow}>
                                        <Text style={[styles.totalLabel, { color: '#00A07A' }]}>
                                            🎁 Free: {booking.freeComplimentaryService}
                                        </Text>
                                        <Text style={[styles.totalVal, { color: '#00A07A' }]}>
                                            ₹0
                                        </Text>
                                    </View>
                                )}
                            <View style={[styles.totalRow, styles.grandTotalRow]}>
                                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                                <LinearGradient
                                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.grandTotalBadge}
                                >
                                    <Text style={styles.grandTotalVal}>
                                        ₹
                                        {(
                                            booking.finalAmount ?? booking.grandTotal
                                        ).toLocaleString()}
                                    </Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>

                    {/* ── Patient Info ── */}
                    <SectionHeader icon="👤" title="Patient Information" />
                    <View style={styles.card}>
                        <InfoRow label="Full Name" value={booking.patientName} />
                        <InfoRow label="Age / Sex" value={`${booking.age} yrs / ${booking.sex}`} />
                        <InfoRow label="Email" value={booking.email} />
                        <InfoRow label="Address" value={booking.address} />
                        <InfoRow label="Pincode" value={booking.pincode} />
                        <InfoRow label="Location" value={booking.currentLocation} />
                        {!!booking.alternateMobile && (
                            <InfoRow label="Alt. Mobile" value={booking.alternateMobile} />
                        )}
                        {booking.hasInsurance && (
                            <InfoRow
                                label="Insurance Policy"
                                value={booking.insurancePolicyNumber || '—'}
                                accent
                            />
                        )}
                    </View>

                    {/* ── Vendor / Service Provider ── */}
                    {booking.vendorId && (
                        <>
                            <SectionHeader icon="🏥" title="Service Provider" />
                            <View style={styles.card}>
                                <View style={styles.vendorRow}>
                                    <View style={styles.vendorAvatar}>
                                        <Text style={styles.vendorAvatarText}>
                                            {getInitials(booking.vendorId.name)}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.vendorName}>
                                            {booking.vendorId.name}
                                        </Text>
                                        <Text style={styles.vendorBusiness}>
                                            {booking.vendorId.businessName}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.callChip} activeOpacity={0.8}>
                                        <Text style={styles.callChipIcon}>📞</Text>
                                        <Text style={styles.callChipText}>
                                            {booking.vendorId.phone}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <InfoRow label="Email" value={booking.vendorId.email} />
                                <InfoRow label="Location" value={booking.serviceLocation ?? '—'} />
                            </View>
                        </>
                    )}

                    {/* ── Prescriptions ── */}
                    {(booking.prescriptions?.length ?? 0) > 0 && (
                        <>
                            <SectionHeader icon="📋" title="Prescriptions" />
                            {booking.prescriptions!.map((rx, idx) => (
                                <View key={idx} style={[styles.card, idx > 0 && { marginTop: 10 }]}>
                                    <TouchableOpacity
                                        style={styles.rxHeader}
                                        onPress={() =>
                                            setExpandedPrescription(
                                                expandedPrescription === idx ? null : idx,
                                            )
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.rxIconWrap}>
                                            <Text style={{ fontSize: 20 }}>📄</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.rxTitle}>
                                                {rx.doctorName ?? 'Prescription'}
                                            </Text>
                                            <Text style={styles.rxSub}>
                                                {rx.hospitalName} · {formatDate(rx.addedAt)}
                                            </Text>
                                        </View>
                                        <Text style={styles.rxChevron}>
                                            {expandedPrescription === idx ? '▲' : '▼'}
                                        </Text>
                                    </TouchableOpacity>

                                    {expandedPrescription === idx && (
                                        <View style={styles.rxBody}>
                                            {!!rx.diagnosis && (
                                                <InfoRow label="Diagnosis" value={rx.diagnosis} />
                                            )}
                                            {!!rx.doctorRegistration && (
                                                <InfoRow
                                                    label="Reg. No."
                                                    value={rx.doctorRegistration}
                                                />
                                            )}
                                            {(rx.medications?.length ?? 0) > 0 && (
                                                <View style={{ marginTop: 8 }}>
                                                    <Text style={styles.rxSubLabel}>
                                                        💊 Medications
                                                    </Text>
                                                    {rx.medications!.map((med, mi) => (
                                                        <View key={mi} style={styles.medRow}>
                                                            <Text style={styles.medName}>
                                                                {med.name}
                                                            </Text>
                                                            <Text style={styles.medDetail}>
                                                                {med.dosage} · {med.frequency} ·{' '}
                                                                {med.duration}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                            {!!rx.specialInstructions && (
                                                <View style={styles.specialNote}>
                                                    <Text style={styles.specialNoteIcon}>⚠️</Text>
                                                    <Text style={styles.specialNoteText}>
                                                        {rx.specialInstructions}
                                                    </Text>
                                                </View>
                                            )}
                                            {!!rx.followUpDate && (
                                                <InfoRow
                                                    label="Follow-up"
                                                    value={String(rx.followUpDate)}
                                                    accent
                                                />
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {/* ── Additional Requirements ── */}
                    {!!booking.additionalRequirements && (
                        <>
                            <SectionHeader icon="📝" title="Special Requirements" />
                            <View style={[styles.card, styles.reqCard]}>
                                <Text style={styles.reqText}>{booking.additionalRequirements}</Text>
                            </View>
                        </>
                    )}

                    {/* ── Notes ── */}
                    {(booking.notes?.length ?? 0) > 0 && (
                        <>
                            <SectionHeader icon="🗒️" title="Notes" />
                            <View style={styles.card}>
                                {booking.notes!.map((note, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.noteRow,
                                            i < booking.notes!.length - 1 && styles.noteBorder,
                                        ]}
                                    >
                                        <View style={styles.noteAvatar}>
                                            <Text style={{ fontSize: 13 }}>👩‍⚕️</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.noteText}>{note.text}</Text>
                                            <Text style={styles.noteMeta}>
                                                by {note.addedBy} · {formatDate(note.addedAt)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* ── Timeline ── */}
                    <SectionHeader icon="🕒" title="Timeline" />
                    <View style={styles.card}>
                        {[
                            {
                                label: 'Booking Created',
                                time: booking.createdAt,
                                dot: Colors.gradientMid,
                            },
                            { label: 'Accepted', time: booking.acceptedAt, dot: '#00D4A0' },
                            { label: 'Started', time: booking.startedAt, dot: '#00B4E8' },
                            { label: 'Completed', time: booking.completedAt, dot: '#7B7BFF' },
                            { label: 'Cancelled', time: booking.cancelledAt, dot: '#FF4444' },
                        ]
                            .filter(t => !!t.time)
                            .map((t, i, arr) => (
                                <View key={i} style={styles.timelineRow}>
                                    <View style={styles.timelineLeft}>
                                        <View
                                            style={[styles.timelineDot, { backgroundColor: t.dot }]}
                                        />
                                        {i < arr.length - 1 && <View style={styles.timelineLine} />}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineLabel}>{t.label}</Text>
                                        <Text style={styles.timelineTime}>
                                            {formatDate(t.time)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                    </View>

                    {/* ── Action Buttons ── */}
                    {isActionable && (
                        <View style={styles.actionsCol}>
                            {/* Row 1: Contact Provider + Reschedule */}
                            <View style={styles.actionsRow}>
                                {booking.vendorId && (
                                    <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
                                        <Text style={styles.contactBtnIcon}>📞</Text>
                                        <Text style={styles.contactBtnText}>Contact Provider</Text>
                                    </TouchableOpacity>
                                )}
                                {canReschedule && (
                                    <TouchableOpacity
                                        style={[
                                            styles.rescheduleBtn,
                                            !booking.vendorId && { flex: 1 },
                                        ]}
                                        onPress={openRescheduleModal}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.rescheduleBtnIcon}>📅</Text>
                                        <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Row 2: Cancel (full width) */}
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={handleCancel}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {booking.bookingStatus === 'completed' && !booking.reportUrl && (
                        <View style={styles.reportPending}>
                            <Text style={styles.reportPendingIcon}>📊</Text>
                            <Text style={styles.reportPendingText}>
                                Report is being prepared and will be available soon.
                            </Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </Animated.View>
        </View>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },
    loadingText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted, marginTop: 12 },
    backFallbackBtn: {
        marginTop: 20,
        backgroundColor: Colors.gradientStart,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backFallbackText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Header
    header: {
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 22,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
    },
    headerInner: { gap: 14 },
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
    headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
    headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

    // Patient row
    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 18,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    patientAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    patientName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
    patientMeta: { color: 'rgba(255,255,255,0.78)', fontSize: 12, marginTop: 3 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statusIcon: { fontSize: 13 },
    statusText: { fontSize: 12, fontWeight: '700' },

    // Slot strip
    slotStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    slotChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    slotDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.25)' },
    slotIcon: { fontSize: 13 },
    slotText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    // Content
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    // Vendor card
    vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    vendorAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: Colors.gradientMid + '22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vendorAvatarText: { fontSize: 15, fontWeight: '800', color: Colors.gradientMid },
    vendorName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
    vendorBusiness: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    callChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E6FFF5',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    callChipIcon: { fontSize: 12 },
    callChipText: { fontSize: 11, fontWeight: '700', color: '#00A07A' },

    // Totals
    totalBlock: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E8EFF4',
        gap: 6,
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
    totalVal: { fontSize: 13, color: Colors.textDark, fontWeight: '600' },
    grandTotalRow: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E8EFF4' },
    grandTotalLabel: { fontSize: 15, color: Colors.textDark, fontWeight: '800' },
    grandTotalBadge: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
    grandTotalVal: { color: '#fff', fontSize: 16, fontWeight: '900' },

    // Prescription
    rxHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rxIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: '#E8F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rxTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
    rxSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    rxChevron: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },
    rxBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
    rxSubLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    medRow: { backgroundColor: '#F8FCFF', borderRadius: 10, padding: 10, marginBottom: 7 },
    medName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
    medDetail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    specialNote: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
        backgroundColor: '#FFF8E6',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#F5A62330',
    },
    specialNoteIcon: { fontSize: 15, marginTop: 1 },
    specialNoteText: { flex: 1, fontSize: 13, color: '#7A5000', fontWeight: '500', lineHeight: 19 },

    // Requirements
    reqCard: { backgroundColor: '#F8FCFF' },
    reqText: { fontSize: 14, color: Colors.textMedium, lineHeight: 22, fontStyle: 'italic' },

    // Notes
    noteRow: { flexDirection: 'row', gap: 12, paddingVertical: 11, alignItems: 'flex-start' },
    noteBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
    noteAvatar: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#E6FFF5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteText: { fontSize: 13, fontWeight: '600', color: Colors.textDark, lineHeight: 19 },
    noteMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 3 },

    // Timeline
    timelineRow: { flexDirection: 'row', gap: 14, minHeight: 48 },
    timelineLeft: { alignItems: 'center', width: 16 },
    timelineDot: { width: 14, height: 14, borderRadius: 7, marginTop: 4, zIndex: 1 },
    timelineLine: { flex: 1, width: 2, backgroundColor: '#E8EFF4', marginTop: 3, marginBottom: -3 },
    timelineContent: { flex: 1, paddingBottom: 14 },
    timelineLabel: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
    timelineTime: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

    // Actions
    actionsCol: { marginTop: 24, gap: 10 },
    actionsRow: { flexDirection: 'row', gap: 10 },
    contactBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 14,
        gap: 8,
        borderWidth: 1.5,
        borderColor: Colors.gradientMid + '55',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    contactBtnIcon: { fontSize: 18 },
    contactBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gradientMid },
    rescheduleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        paddingVertical: 14,
        gap: 8,
        borderWidth: 1.5,
        borderColor: '#93C5FD',
    },
    rescheduleBtnIcon: { fontSize: 16 },
    rescheduleBtnText: { fontSize: 14, fontWeight: '700', color: '#1D4ED8' },
    cancelBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        borderRadius: 16,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: '#FF444430',
    },
    cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#CC2200' },

    // Report pending
    reportPending: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F0F0FF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#7B7BFF22',
    },
    reportPendingIcon: { fontSize: 22 },
    reportPendingText: {
        flex: 1,
        fontSize: 13,
        color: '#5B5BD6',
        fontWeight: '500',
        lineHeight: 20,
    },
});

export default BookingDetailScreen;
