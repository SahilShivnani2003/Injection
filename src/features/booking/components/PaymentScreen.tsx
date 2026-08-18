import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout, {
    CheckoutOptions,
    SuccessResponse,
    ErrorResponse,
} from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Fonts } from '../../../theme/colors';
import { privateClient } from '@/service/apiClient';
import { useAlert } from '@/context/AlertContext';
import { envConfig } from '@/config/env';
import { useAuthStore } from '@/store/useAuthStore';

type PaymentMethod = 'cash' | 'razorpay';

interface PaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    bookingId: string;
    amount: number; // in rupees
    onCashPayment: () => void;
    onRazorpaySuccess: (response: SuccessResponse) => void;
    onRazorpayFailure?: (error: ErrorResponse) => void;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    visible,
    onClose,
    bookingId,
    amount,
    onCashPayment,
    onRazorpaySuccess,
    onRazorpayFailure,
}) => {
    const { user } = useAuthStore();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('razorpay');
    const alert = useAlert();

    const handlePay = () => {
        if (selectedMethod === 'cash') {
            onCashPayment();
            onClose();
            return;
        }
        openRazorpayCheckout();
    };

    const openRazorpayCheckout = async () => {
        const order = await privateClient.post(`/bookings/${bookingId}/pay/razorpay-order`);
        console.log('order res:', order.data);
        if (order === null) {
            alert.error('Failed', 'Unable to create order. Please try again.');
        }
        const options: CheckoutOptions = {
            order_id: order.data?.orderId || '',
            description: `Payment for Booking`,
            currency: 'INR',
            key: envConfig.RAZORPAYKEY,
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            name: 'Injection',
            prefill: {
                name: user?.name || '',
                email: user?.email || '',
                contact: user?.phone || '',
            },
            theme: { color: Colors.gradientMid },
        };

        RazorpayCheckout.open(options)
            .then((data: SuccessResponse) => {
                onRazorpaySuccess(data);
                onClose();
            })
            .catch((error: ErrorResponse) => {
                if (onRazorpayFailure) {
                    onRazorpayFailure(error);
                    console.log('error:', error);
                } else {
                    Alert.alert('Payment Failed', error.description || 'Something went wrong');
                }
            });
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Header */}
                    <LinearGradient
                        colors={[Colors.gradientStart, Colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.header}
                    >
                        <View style={styles.headerTitleRow}>
                            <View style={styles.headerIconBadge}>
                                <Icon
                                    name="account-balance-wallet"
                                    size={18}
                                    color={Colors.textLight}
                                />
                            </View>
                            <View style={styles.headerTextWrap}>
                                <Text style={styles.headerTitle}>Process Payment</Text>
                                {/* <Text style={styles.headerSubtitle}>Booking ID: {bookingId}</Text> */}
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.closeIconBtn}
                        >
                            <Icon name="close" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Body */}
                    <View style={styles.body}>
                        {/* Patient / Amount info */}
                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoLabelRow}>
                                    <Icon name="person" size={15} color={Colors.textMuted} />
                                    <Text style={styles.infoLabel}>Patient:</Text>
                                </View>
                                <Text style={styles.infoValue}>{user?.name || ''}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.infoLabelRow}>
                                    <Icon
                                        name="currency-rupee"
                                        size={15}
                                        color={Colors.textMuted}
                                    />
                                    <Text style={styles.infoLabel}>Amount to Pay:</Text>
                                </View>
                                <Text style={styles.infoAmount}>₹{amount}</Text>
                            </View>
                        </View>

                        {/* Section label */}
                        <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>

                        {/* Payment method options */}
                        <View style={styles.methodsRow}>
                            {/* <TouchableOpacity
                                style={[
                                    styles.methodCard,
                                    selectedMethod === 'cash' && styles.methodCardSelected,
                                ]}
                                onPress={() => setSelectedMethod('cash')}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.methodIconBadge,
                                        selectedMethod === 'cash' && styles.methodIconBadgeSelected,
                                    ]}
                                >
                                    <Icon
                                        name="payments"
                                        size={22}
                                        color={
                                            selectedMethod === 'cash'
                                                ? Colors.white
                                                : Colors.textMuted
                                        }
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.methodLabel,
                                        selectedMethod === 'cash' && styles.methodLabelSelected,
                                    ]}
                                >
                                    Cash Payment
                                </Text>
                                {selectedMethod === 'cash' && (
                                    <View style={styles.methodCheckBadge}>
                                        <Icon
                                            name="check-circle"
                                            size={16}
                                            color={Colors.gradientMid}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity> */}

                            <TouchableOpacity
                                style={[
                                    styles.methodCard,
                                    selectedMethod === 'razorpay' && styles.methodCardSelected,
                                ]}
                                onPress={() => setSelectedMethod('razorpay')}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.methodIconBadge,
                                        selectedMethod === 'razorpay' &&
                                            styles.methodIconBadgeSelected,
                                    ]}
                                >
                                    <Icon
                                        name="credit-card"
                                        size={22}
                                        color={
                                            selectedMethod === 'razorpay'
                                                ? Colors.white
                                                : Colors.textMuted
                                        }
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.methodLabel,
                                        selectedMethod === 'razorpay' && styles.methodLabelSelected,
                                    ]}
                                >
                                    Razorpay
                                </Text>
                                {selectedMethod === 'razorpay' && (
                                    <View style={styles.methodCheckBadge}>
                                        <Icon
                                            name="check-circle"
                                            size={16}
                                            color={Colors.gradientMid}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Info note (only for Razorpay) */}
                        {selectedMethod === 'razorpay' && (
                            <View style={styles.noteBox}>
                                <Icon
                                    name="lightbulb"
                                    size={16}
                                    color={Colors.accentDark}
                                    style={styles.noteIcon}
                                />
                                <Text style={styles.noteText}>
                                    <Text style={styles.noteBold}>Razorpay: </Text>
                                    This launches the secure Razorpay payment checkout window. You
                                    can pay via Credit/Debit card, UPI, Netbanking, or Wallet.
                                </Text>
                            </View>
                        )}

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Actions */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handlePay} activeOpacity={0.85}>
                                <LinearGradient
                                    colors={[Colors.gradientMid, Colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.payButton}
                                >
                                    <Icon
                                        name={selectedMethod === 'cash' ? 'check' : 'lock'}
                                        size={16}
                                        color={Colors.textLight}
                                    />
                                    <Text style={styles.payButtonText}>
                                        {selectedMethod === 'cash'
                                            ? 'Confirm Cash Payment'
                                            : 'Pay via Razorpay'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: Colors.white,
        borderRadius: Spacing.lg,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xl,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconBadge: {
        width: 34,
        height: 34,
        borderRadius: Spacing.md,
        backgroundColor: 'rgba(255,255,255,0.22)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        color: Colors.textLight,
        fontSize: Fonts.sizes.xxl,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: Colors.textLight,
        fontSize: Fonts.sizes.sm,
        marginTop: Spacing.xs,
        opacity: 0.9,
    },
    closeIconBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        padding: Spacing.xl,
    },
    infoBox: {
        backgroundColor: Colors.background,
        borderRadius: Spacing.md,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    infoLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoLabel: {
        color: Colors.textMuted,
        fontSize: Fonts.sizes.md,
    },
    infoValue: {
        color: Colors.textDark,
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
    },
    infoAmount: {
        color: Colors.textDark,
        fontSize: Fonts.sizes.xl,
        fontWeight: '700',
    },
    sectionLabel: {
        color: Colors.textMedium,
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: Spacing.md,
    },
    methodsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    methodCard: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: Colors.checkboxBorder,
        borderRadius: Spacing.md,
        paddingVertical: Spacing.xl,
        alignItems: 'center',
        backgroundColor: Colors.white,
        position: 'relative',
    },
    methodCardSelected: {
        borderColor: Colors.gradientMid,
        backgroundColor: Colors.background,
    },
    methodIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    methodIconBadgeSelected: {
        backgroundColor: Colors.gradientMid,
    },
    methodCheckBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    methodLabel: {
        color: Colors.textDark,
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
    },
    methodLabelSelected: {
        color: Colors.gradientMid,
    },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.background,
        borderRadius: Spacing.md,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    noteIcon: {
        marginRight: Spacing.sm,
        marginTop: 2,
    },
    noteText: {
        flex: 1,
        color: Colors.textMedium,
        fontSize: Fonts.sizes.sm,
        lineHeight: 20,
    },
    noteBold: {
        fontWeight: '700',
        color: Colors.textDark,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.background,
        marginBottom: Spacing.lg,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: Spacing.md,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: Spacing.sm + 4,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
    },
    cancelButtonText: {
        color: Colors.textMedium,
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: Spacing.sm + 4,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
    },
    payButtonText: {
        color: Colors.textLight,
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
    },
});

export default PaymentMethodModal;
