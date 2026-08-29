import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Loader from '@/components/Loader';
import { FieldInput } from '@/components/FieldInput';
import { useAlert } from '@/context/AlertContext';
import { IResetPassword, ISendOtp, OtpService } from '@/service/apis/otpService';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'forgotPassword'>;

type Role = 'user' | 'vendor' | 'ambassador';

type RoleData = { key: Role; label: string; icon: string };

const ROLE_DATA: RoleData[] = [
    { key: 'user', label: 'User', icon: 'person' },
    { key: 'vendor', label: 'Vendor', icon: 'storefront' },
];

type Step = 'phone' | 'otp' | 'reset';

// ── Inline error row ─────────────────────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <View style={errorStyles.row}>
            <Icon name="error-outline" size={12} color="#E53935" />
            <Text style={errorStyles.text}>{message}</Text>
        </View>
    );
};

// ── Card section wrapper ─────────────────────────────────────────────────────
const SectionCard = ({
    icon,
    title,
    children,
}: {
    icon: string;
    title: string;
    children: React.ReactNode;
}) => (
    <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
                <Icon name={icon} size={16} color={Colors.gradientStart} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    const alert = useAlert();

    const [step, setStep] = useState<Step>('phone');

    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<Role>('user');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);

    const [errors, setErrors] = useState<{
        phone?: string;
        otp?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const setError = (key: keyof typeof errors, msg: string) =>
        setErrors(prev => ({ ...prev, [key]: msg }));
    const clearError = (key: keyof typeof errors) =>
        setErrors(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

    const handlePhoneChange = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        setPhone(digits);
        if (digits.trim()) clearError('phone');
    };

    const handleOtpChange = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        setOtp(digits);
        if (digits.trim()) clearError('otp');
    };

    const EyeIcon = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Icon
                name={visible ? 'visibility-off' : 'visibility'}
                size={20}
                color={Colors.textMedium}
            />
        </TouchableOpacity>
    );

    // ── Step 1: send OTP ──────────────────────────────────────────────────────
    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            setError('phone', 'Mobile number must be 10 digits.');
            alert.error('Validation Error', 'Please enter a valid 10-digit mobile number.');
            return;
        }

        setSendingOtp(true);
        try {
            const data: ISendOtp = {
                phone,
                type: role,
                isForgotPassword: true,
            };

            const response = await OtpService.sendOtp(data);

            if (response.data?.success) {
                alert.success('OTP Sent', 'An OTP has been sent to your mobile number.');
                setStep('otp');
            } else {
                alert.error('OTP Failed', 'Unable to send OTP. Please try again.');
            }
        } catch (error: any) {
            console.error('failed to send otp: ', error);
            alert.error(
                'OTP Failed',
                error?.message || 'Failed to send OTP. Please try again after some time.',
            );
        } finally {
            setSendingOtp(false);
        }
    };

    // ── Step 2: verify OTP ───────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            setError('otp', 'Please enter the OTP sent to your phone.');
            alert.error('Validation Error', 'Please enter a valid OTP.');
            return;
        }

        setVerifyingOtp(true);
        try {
            const response = await OtpService.verifyOtp({ phone, otp });

            if (response.data?.success) {
                alert.success('Verified', 'OTP verified successfully.');
                setStep('reset');
            } else {
                setError('otp', 'Incorrect OTP. Please try again.');
                alert.error('Verification Failed', 'Incorrect OTP. Please try again.');
            }
        } catch (error: any) {
            console.error('failed to verify otp: ', error);
            alert.error(
                'Verification Failed',
                error?.message || 'Failed to verify OTP. Please try again after some time.',
            );
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        setOtp('');
        clearError('otp');
        await handleSendOtp();
    };

    // ── Step 3: reset password ───────────────────────────────────────────────
    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            setError('newPassword', 'Password must be at least 6 characters.');
            alert.error('Validation Error', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('confirmPassword', 'Passwords do not match.');
            alert.error('Validation Error', 'New password and confirm password must match.');
            return;
        }

        setResetting(true);
        try {
            const data: IResetPassword = {
                phone,
                type: role,
                newPassword,
            };

            const response = await OtpService.resetPassword(data);

            if (response.data?.success) {
                alert.success('Success', 'Your password has been reset successfully.');
                navigation.replace('EmailLogin');
            } else {
                alert.error('Reset Failed', 'Unable to reset password. Please try again.');
            }
        } catch (error: any) {
            console.error('failed to reset password: ', error);
            alert.error(
                'Reset Failed',
                error?.message || 'Failed to reset password. Please try again later.',
            );
        } finally {
            setResetting(false);
        }
    };

    const stepTitle =
        step === 'phone'
            ? 'Verify your identity'
            : step === 'otp'
            ? 'Enter verification code'
            : 'Set a new password';

    const stepSub =
        step === 'phone'
            ? 'We’ll send an OTP to your mobile number'
            : step === 'otp'
            ? `Code sent to ${phone}`
            : 'Choose a strong new password';

    return (
        <View style={styles.root}>
            {/* ── Gradient Header ─────────────────────────────────────────── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerCircleLarge} pointerEvents="none" />
                <View style={styles.headerCircleSmall} pointerEvents="none" />

                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => {
                            if (step === 'otp') {
                                setStep('phone');
                            } else if (step === 'reset') {
                                setStep('otp');
                            } else {
                                navigation.goBack();
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={22} color={Colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{stepTitle}</Text>
                        <Text style={styles.headerSub}>{stepSub}</Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Step indicator ────────────────────────────────────── */}
                    <View style={styles.stepRow}>
                        {(['phone', 'otp', 'reset'] as Step[]).map((s, i) => (
                            <React.Fragment key={s}>
                                <View
                                    style={[
                                        styles.stepDot,
                                        (step === s ||
                                            (['otp', 'reset'].includes(step) && s === 'phone') ||
                                            (step === 'reset' && s === 'otp')) &&
                                            styles.stepDotActive,
                                    ]}
                                />
                                {i < 2 && <View style={styles.stepLine} />}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* ── Step 1: Phone + Role ─────────────────────────────── */}
                    {step === 'phone' && (
                        <SectionCard icon="phone-iphone" title="Account Details">
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>
                                    Account Type<Text style={styles.required}> *</Text>
                                </Text>
                                <View style={styles.roleRow}>
                                    {ROLE_DATA.map(r => (
                                        <TouchableOpacity
                                            key={r.key}
                                            style={[
                                                styles.roleOption,
                                                role === r.key && styles.roleOptionActive,
                                            ]}
                                            onPress={() => setRole(r.key)}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                name={r.icon}
                                                size={20}
                                                color={
                                                    role === r.key
                                                        ? Colors.gradientStart
                                                        : Colors.textMuted
                                                }
                                                style={{ marginBottom: 4 }}
                                            />
                                            <Text
                                                style={[
                                                    styles.roleLabel,
                                                    role === r.key && styles.roleLabelActive,
                                                ]}
                                            >
                                                {r.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <FieldInput
                                label="Mobile Number"
                                value={phone}
                                onChangeText={handlePhoneChange}
                                placeholder="10-digit mobile number"
                                keyboardType="phone-pad"
                                maxLength={10}
                                required
                            />
                            <FieldError message={errors.phone} />

                            <TouchableOpacity
                                style={[styles.primaryBtn, sendingOtp && styles.primaryBtnDisabled]}
                                onPress={handleSendOtp}
                                disabled={sendingOtp}
                                activeOpacity={0.8}
                            >
                                {sendingOtp ? (
                                    <Loader type="dots" size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.primaryBtnText}>Send OTP</Text>
                                )}
                            </TouchableOpacity>
                        </SectionCard>
                    )}

                    {/* ── Step 2: OTP ──────────────────────────────────────── */}
                    {step === 'otp' && (
                        <SectionCard icon="sms" title="Verification Code">
                            <FieldInput
                                label="OTP"
                                value={otp}
                                onChangeText={handleOtpChange}
                                placeholder="Enter the code"
                                keyboardType="numeric"
                                maxLength={6}
                                required
                            />
                            <FieldError message={errors.otp} />

                            <TouchableOpacity
                                style={[
                                    styles.primaryBtn,
                                    verifyingOtp && styles.primaryBtnDisabled,
                                ]}
                                onPress={handleVerifyOtp}
                                disabled={verifyingOtp}
                                activeOpacity={0.8}
                            >
                                {verifyingOtp ? (
                                    <Loader type="dots" size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.primaryBtnText}>Verify OTP</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resendLink}
                                onPress={handleResendOtp}
                                disabled={sendingOtp}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.resendLinkText}>
                                    {sendingOtp ? 'Resending...' : "Didn't get a code? Resend"}
                                </Text>
                            </TouchableOpacity>
                        </SectionCard>
                    )}

                    {/* ── Step 3: New Password ─────────────────────────────── */}
                    {step === 'reset' && (
                        <SectionCard icon="lock-reset" title="New Password">
                            <FieldInput
                                label="New Password"
                                value={newPassword}
                                onChangeText={value => {
                                    setNewPassword(value);
                                    if (value.trim()) clearError('newPassword');
                                    if (confirmPassword) {
                                        value === confirmPassword
                                            ? clearError('confirmPassword')
                                            : setError(
                                                  'confirmPassword',
                                                  'Passwords do not match.',
                                              );
                                    }
                                }}
                                placeholder="Min 6 chars"
                                required
                                rightIcon={
                                    <EyeIcon
                                        visible={showPassword}
                                        onToggle={() => setShowPassword(v => !v)}
                                    />
                                }
                                secureTextEntry={!showPassword}
                            />
                            <FieldError message={errors.newPassword} />

                            <FieldInput
                                label="Confirm Password"
                                value={confirmPassword}
                                onChangeText={value => {
                                    setConfirmPassword(value);
                                    value === newPassword
                                        ? clearError('confirmPassword')
                                        : setError('confirmPassword', 'Passwords do not match.');
                                }}
                                placeholder="Repeat new password"
                                required
                                rightIcon={
                                    <EyeIcon
                                        visible={showConfirmPassword}
                                        onToggle={() => setShowConfirmPassword(v => !v)}
                                    />
                                }
                                secureTextEntry={!showConfirmPassword}
                            />
                            <FieldError message={errors.confirmPassword} />

                            <TouchableOpacity
                                style={[styles.primaryBtn, resetting && styles.primaryBtnDisabled]}
                                onPress={handleResetPassword}
                                disabled={resetting}
                                activeOpacity={0.8}
                            >
                                {resetting ? (
                                    <Loader type="dots" size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.primaryBtnText}>Reset Password</Text>
                                )}
                            </TouchableOpacity>
                        </SectionCard>
                    )}

                    {/* ── Back to login ────────────────────────────────────── */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('EmailLogin')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginText}>
                            Remembered your password?{' '}
                            <Text style={styles.loginLinkText}>Login here</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const errorStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -10, marginBottom: 8 },
    text: { fontSize: 11, color: '#E53935', fontWeight: '500' },
});

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F7FA' },

    header: {
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 16,
        paddingBottom: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
    },
    headerCircleLarge: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -60,
        right: -40,
    },
    headerCircleSmall: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.07)',
        bottom: -30,
        left: -20,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerSpacer: { width: 40 },
    headerTitle: { color: Colors.textLight, fontSize: 22, fontWeight: '700', textAlign: 'center' },
    headerSub: {
        color: Colors.textLight,
        fontSize: 13,
        opacity: 0.9,
        marginTop: 4,
        textAlign: 'center',
    },
    content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

    // ── Step indicator ─────────────────────────────────────────────────────
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D8E8EE',
    },
    stepDotActive: { backgroundColor: Colors.gradientStart },
    stepLine: { width: 28, height: 2, backgroundColor: '#D8E8EE', marginHorizontal: 6 },

    // ── Section cards ──────────────────────────────────────────────────────
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#0B2B33',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EDF6FB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },

    inputGroup: { marginBottom: 16 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    required: { color: Colors.gradientStart },

    // ── Role selector ──────────────────────────────────────────────────────
    roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    roleOption: {
        flex: 1,
        backgroundColor: '#F8FBFC',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
    },
    roleOptionActive: { borderColor: Colors.gradientStart, backgroundColor: '#E6FAF5' },
    roleLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },
    roleLabelActive: { color: Colors.gradientStart },

    // ── Buttons ────────────────────────────────────────────────────────────
    primaryBtn: {
        backgroundColor: Colors.gradientStart,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 3,
    },
    primaryBtnDisabled: { backgroundColor: Colors.textMuted, shadowOpacity: 0, elevation: 0 },
    primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

    resendLink: { alignItems: 'center', marginTop: 16 },
    resendLinkText: { fontSize: 13, fontWeight: '600', color: Colors.gradientStart },

    loginLink: { alignItems: 'center', marginTop: 20 },
    loginText: { fontSize: 14, color: Colors.textMedium },
    loginLinkText: { color: Colors.gradientStart, fontWeight: '600' },
});
