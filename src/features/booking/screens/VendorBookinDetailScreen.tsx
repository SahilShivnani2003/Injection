import { Colors, Fonts, Spacing } from '@/theme/colors';
import { Booking, BookingStatus } from '@/types/Booking';
import { RootStackParamList } from '@/types/RootStackParamList';
import { bookingAPI } from '@/service/apis/bookingService';
import { useAlert } from '@/context/AlertContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

type BookingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'VendorBookingDetail'>;

// ─── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
    BookingStatus,
    { label: string; color: string; bg: string; icon: string }
> = {
    pending: {
        label: 'Pending',
        color: '#E6A817',
        bg: 'rgba(230,168,23,0.12)',
        icon: 'time-outline',
    },
    accepted: {
        label: 'Accepted',
        color: Colors.gradientStart,
        bg: 'rgba(0,212,160,0.12)',
        icon: 'checkmark-circle-outline',
    },
    'in-progress': {
        label: 'In Progress',
        color: Colors.gradientEnd,
        bg: 'rgba(0,180,232,0.12)',
        icon: 'play-circle-outline',
    },
    completed: {
        label: 'Completed',
        color: '#5EA300',
        bg: 'rgba(94,163,0,0.12)',
        icon: 'checkmark-done-circle-outline',
    },
    cancelled: {
        label: 'Cancelled',
        color: '#E05555',
        bg: 'rgba(224,85,85,0.12)',
        icon: 'close-circle-outline',
    },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (date?: Date | string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatAmount = (n?: number | null) => (n != null ? `₹${n.toLocaleString('en-IN')}` : '—');

// ─── Small reusable pieces ──────────────────────────────────────────────────────
const SectionCard = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
                <Ionicons name={icon} size={16} color={Colors.gradientStart} />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.cardBody}>{children}</View>
    </View>
);

const Row = ({
    label,
    value,
    highlight,
}: {
    label: string;
    value?: string | number | null;
    highlight?: boolean;
}) => (
    <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value ?? '—'}</Text>
    </View>
);

const Divider = () => <View style={styles.divider} />;

// ─── Screen ─────────────────────────────────────────────────────────────────────
export const VendorBookingDetailScreen = ({ route, navigation }: BookingDetailScreenProps) => {
    // The notification passes the populated booking object directly
    const booking: Booking = route.params?.booking;
    const notificationId: string | undefined = route.params?.notificationId;

    const alert = useAlert();
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(booking?.bookingStatus === 'accepted');

    if (!booking) {
        return (
            <View style={[styles.root, styles.centered]}>
                <Text style={styles.errorText}>Booking details not found.</Text>
            </View>
        );
    }

    const status = booking.bookingStatus ?? 'pending';
    const statusCfg = STATUS_CONFIG[status];

    const handleAccept = async () => {
        if (!booking._id) return;
        try {
            setAccepting(true);
            const response = await bookingAPI.acceptUserBooking(booking._id);
            if (response.data?.success) {
                setAccepted(true);
                alert.success('Booking Accepted', 'You have accepted this booking.');
            }
        } catch (error: any) {
            alert.error('Accept Failed', error?.message || 'Could not accept booking.');
        } finally {
            setAccepting(false);
        }
    };

    const totalServices = booking.selectedServices?.length ?? 0;
    const couponDiscount = booking.appliedCoupon?.discountAmount ?? 0;

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
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Booking Detail</Text>
                        <Text style={styles.headerSub} numberOfLines={1}>
                            #{booking._id?.slice(-8).toUpperCase()}
                        </Text>
                    </View>
                    {/* Status badge */}
                    <View
                        style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
                    >
                        <Ionicons name={statusCfg.icon} size={13} color={Colors.white} />
                        <Text style={styles.statusBadgeText}>{statusCfg.label}</Text>
                    </View>
                </View>

                {/* Quick stats strip */}
                <View style={styles.statsStrip}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatAmount(booking.grandTotal)}</Text>
                        <Text style={styles.statLabel}>Grand Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{totalServices}</Text>
                        <Text style={styles.statLabel}>Services</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{booking.estimatedDuration ?? '—'} min</Text>
                        <Text style={styles.statLabel}>Est. Duration</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ── Body ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Patient Info ── */}
                <SectionCard title="Patient" icon="person-outline">
                    <Row label="Name" value={booking.patientName} />
                    <Divider />
                    <Row label="Age" value={`${booking.age} yrs`} />
                    <Divider />
                    <Row label="Sex" value={booking.sex} />
                    <Divider />
                    <Row label="Email" value={booking.email} />
                    {booking.alternateMobile && (
                        <>
                            <Divider />
                            <Row label="Alt. Mobile" value={booking.alternateMobile} />
                        </>
                    )}
                </SectionCard>

                {/* ── Location & Schedule ── */}
                <SectionCard title="Location & Schedule" icon="location-outline">
                    <Row label="Address" value={booking.address} />
                    <Divider />
                    <Row label="Area" value={booking.currentLocation} />
                    <Divider />
                    <Row label="Pincode" value={booking.pincode} />
                    {booking.serviceLocation && booking.serviceLocation !== booking.address && (
                        <>
                            <Divider />
                            <Row label="Service Location" value={booking.serviceLocation} />
                        </>
                    )}
                    <Divider />
                    <Row label="Preferred Slot" value={booking.preferredTimeSlot} />
                    <Divider />
                    <Row label="Staff Preference" value={booking.staffPreference} />
                    {booking.freeComplimentaryService &&
                        booking.freeComplimentaryService !== 'None' && (
                            <>
                                <Divider />
                                <Row
                                    label="Free Complimentary"
                                    value={booking.freeComplimentaryService}
                                />
                            </>
                        )}
                </SectionCard>

                {/* ── Services ── */}
                <SectionCard title="Selected Services" icon="medkit-outline">
                    {booking.selectedServices?.map((svc, idx) => (
                        <View key={svc.serviceId ?? idx}>
                            {idx > 0 && <Divider />}
                            <View style={styles.serviceRow}>
                                <View style={styles.serviceLeft}>
                                    <View style={styles.serviceDot} />
                                    <Text style={styles.serviceName}>{svc.serviceName}</Text>
                                    {(svc.quantity ?? 1) > 1 && (
                                        <View style={styles.qtyBadge}>
                                            <Text style={styles.qtyText}>×{svc.quantity}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.servicePrice}>{formatAmount(svc.price)}</Text>
                            </View>
                        </View>
                    ))}
                </SectionCard>

                {/* ── Pricing ── */}
                <SectionCard title="Pricing" icon="receipt-outline">
                    <Row label="Subtotal" value={formatAmount(booking.subtotal)} />
                    <Divider />
                    <Row label="GST" value={formatAmount(booking.gstAmount)} />
                    {couponDiscount > 0 && (
                        <>
                            <Divider />
                            <Row
                                label={`Coupon (${booking.appliedCoupon?.couponCode ?? ''})`}
                                value={`− ${formatAmount(couponDiscount)}`}
                            />
                        </>
                    )}
                    <Divider />
                    <Row label="Grand Total" value={formatAmount(booking.grandTotal)} highlight />
                    {booking.finalAmount != null && (
                        <>
                            <Divider />
                            <Row
                                label="Final Amount"
                                value={formatAmount(booking.finalAmount)}
                                highlight
                            />
                        </>
                    )}
                </SectionCard>

                {/* ── Timeline ── */}
                <SectionCard title="Timeline" icon="calendar-outline">
                    <Row label="Booked On" value={formatDate(booking.createdAt)} />
                    {booking.acceptedAt && (
                        <>
                            <Divider />
                            <Row label="Accepted At" value={formatDate(booking.acceptedAt)} />
                        </>
                    )}
                    {booking.startedAt && (
                        <>
                            <Divider />
                            <Row label="Started At" value={formatDate(booking.startedAt)} />
                        </>
                    )}
                    {booking.completedAt && (
                        <>
                            <Divider />
                            <Row label="Completed At" value={formatDate(booking.completedAt)} />
                        </>
                    )}
                    {booking.cancelledAt && (
                        <>
                            <Divider />
                            <Row label="Cancelled At" value={formatDate(booking.cancelledAt)} />
                        </>
                    )}
                    {booking.cancellationReason && (
                        <>
                            <Divider />
                            <Row label="Reason" value={booking.cancellationReason} />
                        </>
                    )}
                </SectionCard>

                {/* ── Insurance ── */}
                {booking.hasInsurance && (
                    <SectionCard title="Insurance" icon="shield-checkmark-outline">
                        <Row label="Has Insurance" value="Yes" />
                        {booking.insurancePolicyNumber && (
                            <>
                                <Divider />
                                <Row label="Policy No." value={booking.insurancePolicyNumber} />
                            </>
                        )}
                    </SectionCard>
                )}

                {/* ── Notes ── */}
                {booking.notes && booking.notes.length > 0 && (
                    <SectionCard title="Notes" icon="document-text-outline">
                        {booking.notes.map((note, idx) => (
                            <View key={idx}>
                                {idx > 0 && <Divider />}
                                <Text style={styles.noteText}>{note.text}</Text>
                                {note.addedAt && (
                                    <Text style={styles.noteTime}>{formatDate(note.addedAt)}</Text>
                                )}
                            </View>
                        ))}
                    </SectionCard>
                )}

                {/* bottom padding so CTA doesn't overlap */}
                <View style={{ height: accepted ? Spacing.xxxl : 96 }} />
            </ScrollView>

            {/* ── Accept CTA ── */}
            {!accepted && status === 'pending' && (
                <View style={styles.ctaWrap}>
                    <TouchableOpacity
                        onPress={handleAccept}
                        activeOpacity={0.85}
                        disabled={accepting}
                        style={styles.ctaBtn}
                    >
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            {accepting ? (
                                <ActivityIndicator color={Colors.white} size="small" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={20}
                                        color={Colors.white}
                                    />
                                    <Text style={styles.ctaText}>Accept Booking</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {accepted && (
                <View style={styles.acceptedBanner}>
                    <Ionicons name="checkmark-done" size={18} color={Colors.gradientStart} />
                    <Text style={styles.acceptedBannerText}>Booking Accepted</Text>
                </View>
            )}
        </View>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    errorText: { color: Colors.textMuted, fontSize: Fonts.sizes.md },

    // Header
    header: {
        paddingTop: 52,
        paddingBottom: 0,
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    headerCenter: { flex: 1 },
    headerTitle: {
        fontSize: Fonts.sizes.xl,
        fontWeight: '800',
        color: Colors.white,
    },
    headerSub: {
        fontSize: Fonts.sizes.xs,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusBadgeText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
        color: Colors.white,
    },

    // Stats strip
    statsStrip: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginTop: Spacing.xs,
        paddingVertical: Spacing.md,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.white,
    },
    statLabel: {
        fontSize: Fonts.sizes.xs,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.25)',
        marginVertical: 4,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
    },

    // Section card
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: Spacing.md,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    cardIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(0,212,160,0.10)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.textMedium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardBody: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
    },

    // Row
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 10,
        gap: Spacing.md,
    },
    rowLabel: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textMuted,
        fontWeight: '500',
        flexShrink: 0,
    },
    rowValue: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textDark,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
    },
    rowValueHighlight: {
        color: Colors.gradientStart,
        fontSize: Fonts.sizes.md,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.background,
    },

    // Service row
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    serviceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.sm,
    },
    serviceDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.gradientStart,
        flexShrink: 0,
    },
    serviceName: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textDark,
        fontWeight: '600',
        flex: 1,
    },
    qtyBadge: {
        backgroundColor: Colors.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    qtyText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
        color: Colors.textMuted,
    },
    servicePrice: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.textDark,
    },

    // Notes
    noteText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textDark,
        lineHeight: 20,
        paddingVertical: 10,
    },
    noteTime: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        marginBottom: 6,
    },

    // CTA
    ctaWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
        paddingBottom: 32,
        paddingTop: Spacing.md,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    ctaBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.lg,
    },
    ctaText: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.white,
    },

    // Accepted banner
    acceptedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        backgroundColor: 'rgba(0,212,160,0.08)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,212,160,0.2)',
        paddingBottom: 28,
    },
    acceptedBannerText: {
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
        color: Colors.gradientStart,
    },
});
