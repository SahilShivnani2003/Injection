import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@/theme/colors';
import Loader from '@/components/Loader';

type OtpVerificationModalProps = {
    /** Controls modal visibility. */
    visible: boolean;
    /** The phone number (or email) the code was sent to — shown to the user. */
    destination: string;
    /** Called when the user closes the modal without completing verification. */
    onClose: () => void;
    /** Called once the code has been confirmed as valid. */
    onVerified: () => void;
    /** Should trigger sending/resending the code. Return true on success. */
    onSendOtp: (destination: string) => Promise<boolean>;
    /** Should check the code with the backend. Return true if valid. */
    onVerifyOtp: (destination: string, otp: string) => Promise<boolean>;
    /** Number of digits in the code. Defaults to 6. */
    otpLength?: number;
    /** Seconds before "Resend code" becomes available again. Defaults to 30. */
    resendCooldown?: number;
    /** Short label describing what's being verified, e.g. "mobile number". */
    subjectLabel?: string;
};

const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <View style={styles.errorRow}>
            <Icon name="error-outline" size={12} color="#E53935" />
            <Text style={styles.errorText}>{message}</Text>
        </View>
    );
};

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
    visible,
    destination,
    onClose,
    onVerified,
    onSendOtp,
    onVerifyOtp,
    otpLength = 6,
    resendCooldown = 30,
    subjectLabel = 'number',
}) => {
    const [digits, setDigits] = useState<string[]>(Array(otpLength).fill(''));
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [sending, setSending] = useState(false);
    const [hasSentOnce, setHasSentOnce] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Reset and auto-send whenever the modal opens for a (possibly new) destination.
    useEffect(() => {
        if (!visible) return;
        setDigits(Array(otpLength).fill(''));
        setError('');
        setVerifying(false);
        setHasSentOnce(false);
        setResendTimer(0);
        triggerSend();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, destination]);

    // Resend cooldown ticker.
    useEffect(() => {
        if (!visible || resendTimer <= 0) return;
        const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
        return () => clearTimeout(id);
    }, [visible, resendTimer]);

    const focusBox = (index: number) => {
        const clamped = Math.max(0, Math.min(index, otpLength - 1));
        inputRefs.current[clamped]?.focus();
    };

    const triggerSend = async () => {
        setSending(true);
        setError('');
        try {
            const ok = await onSendOtp(destination);
            if (ok) {
                setDigits(Array(otpLength).fill(''));
                setResendTimer(resendCooldown);
                setHasSentOnce(true);
                setTimeout(() => focusBox(0), 250);
            } else {
                setError('Could not send the code. Please try again.');
            }
        } catch {
            setError('Could not send the code. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const triggerVerify = async (code: string) => {
        if (code.length !== otpLength) {
            setError(`Enter the ${otpLength}-digit code.`);
            return;
        }
        Keyboard.dismiss();
        setError('');
        setVerifying(true);
        try {
            const ok = await onVerifyOtp(destination, code);
            if (ok) {
                onVerified();
            } else {
                setError('Incorrect code. Please try again.');
                setDigits(Array(otpLength).fill(''));
                focusBox(0);
            }
        } catch {
            setError('Incorrect code. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleDigitChange = (text: string, index: number) => {
        const clean = text.replace(/[^0-9]/g, '');
        if (!clean) {
            const next = [...digits];
            next[index] = '';
            setDigits(next);
            return;
        }

        // Support pasting the full code into any box.
        if (clean.length > 1) {
            const next = [...digits];
            let cursor = index;
            for (const ch of clean) {
                if (cursor >= otpLength) break;
                next[cursor] = ch;
                cursor++;
            }
            setDigits(next);
            const joined = next.join('');
            if (joined.length === otpLength && !next.includes('')) {
                triggerVerify(joined);
            } else {
                focusBox(cursor);
            }
            return;
        }

        const next = [...digits];
        next[index] = clean;
        setDigits(next);

        if (index < otpLength - 1) {
            focusBox(index + 1);
        }

        const joined = next.join('');
        if (joined.length === otpLength && !next.includes('')) {
            triggerVerify(joined);
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            const next = [...digits];
            next[index - 1] = '';
            setDigits(next);
            focusBox(index - 1);
        }
    };

    const joinedCode = digits.join('');
    const canManuallyVerify = joinedCode.length === otpLength && !verifying;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={styles.iconCircle}>
                            <Icon name="sms" size={20} color={Colors.gradientStart} />
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.7}
                        >
                            <Icon name="close" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>Verify your {subjectLabel}</Text>
                    <Text style={styles.subtitle}>
                        {hasSentOnce
                            ? `Enter the ${otpLength}-digit code sent to ${destination}`
                            : `Sending a code to ${destination}…`}
                    </Text>

                    {sending && !hasSentOnce ? (
                        <View style={styles.sendingRow}>
                            <Loader type="dots" size="small" color={Colors.gradientStart} />
                        </View>
                    ) : (
                        <>
                            <View style={styles.boxRow}>
                                {digits.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={r => {
                                            inputRefs.current[index] = r;
                                        }}
                                        style={[
                                            styles.box,
                                            focusedIndex === index && styles.boxFocused,
                                            !!error && styles.boxError,
                                        ]}
                                        value={digit}
                                        onChangeText={text => handleDigitChange(text, index)}
                                        onKeyPress={e => handleKeyPress(e, index)}
                                        onFocus={() => setFocusedIndex(index)}
                                        keyboardType="numeric"
                                        maxLength={otpLength}
                                        textAlign="center"
                                        selectTextOnFocus
                                        editable={!verifying}
                                    />
                                ))}
                            </View>

                            <FieldError message={error} />

                            <TouchableOpacity
                                style={[
                                    styles.verifyBtn,
                                    !canManuallyVerify && styles.verifyBtnDisabled,
                                ]}
                                onPress={() => triggerVerify(joinedCode)}
                                disabled={!canManuallyVerify}
                                activeOpacity={0.85}
                            >
                                {verifying ? (
                                    <Loader type="dots" size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.verifyBtnText}>Verify</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={triggerSend}
                                disabled={resendTimer > 0 || sending}
                                activeOpacity={0.7}
                                style={styles.resendWrap}
                            >
                                <Text
                                    style={[
                                        styles.resendText,
                                        (resendTimer > 0 || sending) && styles.resendTextDisabled,
                                    ]}
                                >
                                    {resendTimer > 0
                                        ? `Resend code in ${resendTimer}s`
                                        : 'Resend code'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(11,43,51,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#0B2B33',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDF6FB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F8FB',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textDark,
        marginTop: 14,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textMedium,
        marginTop: 6,
        marginBottom: 22,
        lineHeight: 18,
    },
    sendingRow: {
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── OTP digit boxes ────────────────────────────────────────────────────
    boxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    box: {
        width: 46,
        height: 54,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        backgroundColor: '#F8FBFC',
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textDark,
        padding: 0,
    },
    boxFocused: {
        borderColor: Colors.gradientStart,
        backgroundColor: Colors.white,
    },
    boxError: {
        borderColor: '#E53935',
    },

    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
    },
    errorText: {
        fontSize: 12,
        color: '#E53935',
        fontWeight: '500',
    },

    // ── Buttons ────────────────────────────────────────────────────────────
    verifyBtn: {
        height: 52,
        borderRadius: 14,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    verifyBtnDisabled: {
        backgroundColor: Colors.textMuted,
    },
    verifyBtnText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
    resendWrap: {
        alignItems: 'center',
        marginTop: 16,
    },
    resendText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.gradientStart,
    },
    resendTextDisabled: {
        color: Colors.textMuted,
    },
});

export default OtpVerificationModal;