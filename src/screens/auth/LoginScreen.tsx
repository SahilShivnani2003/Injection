import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Animated,
    Easing,
    Dimensions,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type loginPros = NativeStackScreenProps<RootStackParamList, 'Login'>;

// ── Individual OTP Cell ──────────────────────────────────────────────────────
const OtpCell: React.FC<{ char: string; active: boolean; filled: boolean }> = ({
    char,
    active,
    filled,
}) => {
    const borderAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: active ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [active]);
    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D8E8EE', Colors.gradientStart],
    });
    return (
        <Animated.View style={[styles.otpCell, { borderColor }, filled && styles.otpCellFilled]}>
            <Text style={styles.otpChar}>{char}</Text>
        </Animated.View>
    );
};

// ── Screen ───────────────────────────────────────────────────────────────────
const LoginScreen = ({ navigation }: loginPros) => {
    const [userType, setUserType] = useState<'patient' | 'labpartner' | 'staff'>('patient');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpFocused, setOtpFocused] = useState(false);
    const [mobileActive, setMobileActive] = useState(false);
    const otpRef = useRef<TextInput>(null);

    const sheetY = useRef(new Animated.Value(80)).current;
    const sheetOp = useRef(new Animated.Value(0)).current;
    const logoY = useRef(new Animated.Value(-20)).current;
    const logoOp = useRef(new Animated.Value(0)).current;
    const otpSlide = useRef(new Animated.Value(0)).current;
    const otpOp = useRef(new Animated.Value(0)).current;
    const mobileBorder = useRef(new Animated.Value(0)).current;

    const mobileBorderColor = mobileBorder.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D8E8EE', Colors.gradientStart],
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoY, {
                toValue: 0,
                duration: 560,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(logoOp, { toValue: 1, duration: 560, useNativeDriver: true }),
            Animated.timing(sheetY, {
                toValue: 0,
                duration: 640,
                delay: 160,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(sheetOp, {
                toValue: 1,
                duration: 640,
                delay: 160,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        Animated.timing(mobileBorder, {
            toValue: mobileActive ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [mobileActive]);

    useEffect(() => {
        if (otpSent) {
            Animated.parallel([
                Animated.timing(otpSlide, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(otpOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start(() => otpRef.current?.focus());
        } else {
            Animated.parallel([
                Animated.timing(otpSlide, { toValue: 0, duration: 260, useNativeDriver: true }),
                Animated.timing(otpOp, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [otpSent]);

    const handleSendOtp = () => {
        if (mobile.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }
        setOtpSent(true);
        Alert.alert('OTP Sent', `OTP sent to +91 ${mobile}`);
    };

    const handleLogin = () => {
        if (!agreed) {
            Alert.alert('Terms Required', 'Please accept the terms and conditions.');
            return;
        }
        if (otp.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter the correct OTP.');
            return;
        }

        // Navigate based on user type
        switch (userType) {
            case 'labpartner':
                navigation.navigate('LabPartner');
                break;
            case 'staff':
                navigation.navigate('StaffPanel');
                break;
            case 'patient':
            default:
                navigation.navigate('MainTab', {
                    screen: 'Dashboard',
                });
                break;
        }
    };

    const otpTranslateY = otpSlide.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
    const canLogin = agreed && otp.length >= 4 && otpSent;
    const otpCells = Array.from({ length: 6 }, (_, i) => ({
        char: otp[i] ?? '',
        filled: !!otp[i],
        active: otpFocused && otp.length === i,
    }));

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* ── Gradient Header ─────────────────────────────────────────────── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <View style={styles.glowRingOuter} />
                <View style={styles.glowRingInner} />

                <Animated.View
                    style={{
                        opacity: logoOp,
                        transform: [{ translateY: logoY }],
                        alignItems: 'center',
                    }}
                >
                    <View style={styles.logoRing}>
                        <View style={styles.logoDisk}>
                            <View style={styles.crossH} />
                            <View style={styles.crossV} />
                        </View>
                    </View>
                    <Text style={styles.brandName}>INJECTION</Text>
                    <Text style={styles.brandTagline}>Home Healthcare at Your Doorstep</Text>
                </Animated.View>
            </LinearGradient>

            {/* ── White Bottom Sheet ──────────────────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.sheetWrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        styles.sheet,
                        { opacity: sheetOp, transform: [{ translateY: sheetY }] },
                    ]}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        <Text style={styles.sheetTitle}>Welcome Back</Text>
                        <Text style={styles.sheetSub}>
                            Enter your mobile number to receive an OTP
                        </Text>

                        {/* User Type Selection */}
                        <Text style={styles.fieldLabel}>Login as</Text>
                        <View style={styles.userTypeRow}>
                            {[
                                { key: 'patient', label: 'Patient', icon: '👤' },
                                { key: 'labpartner', label: 'Lab Partner', icon: '🏥' },
                                { key: 'staff', label: 'Staff', icon: '👨‍⚕️' },
                            ].map((type) => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[
                                        styles.userTypeBtn,
                                        userType === type.key && styles.userTypeBtnActive,
                                    ]}
                                    onPress={() => setUserType(type.key as any)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.userTypeIcon}>{type.icon}</Text>
                                    <Text
                                        style={[
                                            styles.userTypeText,
                                            userType === type.key && styles.userTypeTextActive,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Mobile field */}
                        <Text style={styles.fieldLabel}>Mobile Number</Text>
                        <Animated.View
                            style={[styles.mobileRow, { borderColor: mobileBorderColor }]}
                        >
                            <View style={styles.prefixBox}>
                                <Text style={styles.flag}>🇮🇳</Text>
                                <Text style={styles.code}>+91</Text>
                            </View>
                            <View style={styles.sep} />
                            <TextInput
                                style={styles.mobileInput}
                                placeholder="10-digit number"
                                placeholderTextColor="#B0C4CC"
                                value={mobile}
                                onChangeText={t => setMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
                                keyboardType="phone-pad"
                                maxLength={10}
                                onFocus={() => setMobileActive(true)}
                                onBlur={() => setMobileActive(false)}
                            />
                            {mobile.length === 10 && (
                                <View style={styles.validBadge}>
                                    <Text style={styles.validTick}>✓</Text>
                                </View>
                            )}
                        </Animated.View>

                        {/* Send / Resend OTP */}
                        {!otpSent ? (
                            <TouchableOpacity
                                style={[styles.sendBtn, mobile.length !== 10 && styles.btnDimmed]}
                                onPress={handleSendOtp}
                                activeOpacity={0.82}
                                disabled={mobile.length !== 10}
                            >
                                <LinearGradient
                                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.btnGrad}
                                >
                                    <Text style={styles.sendBtnText}>Send OTP</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.sentRow}>
                                <View style={styles.sentBadge}>
                                    <Text style={styles.sentText}>✓ OTP sent to +91 {mobile}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setOtp('');
                                        setOtpSent(false);
                                    }}
                                >
                                    <Text style={styles.resendText}>Resend</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* OTP entry */}
                        <Animated.View
                            style={{ opacity: otpOp, transform: [{ translateY: otpTranslateY }] }}
                        >
                            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
                                One-Time Password
                            </Text>
                            <TextInput
                                ref={otpRef}
                                style={styles.hiddenInput}
                                value={otp}
                                onChangeText={t => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                keyboardType="number-pad"
                                maxLength={6}
                                onFocus={() => setOtpFocused(true)}
                                onBlur={() => setOtpFocused(false)}
                            />
                            <TouchableOpacity
                                style={styles.otpRow}
                                onPress={() => otpRef.current?.focus()}
                                activeOpacity={1}
                            >
                                {otpCells.map((c, i) => (
                                    <OtpCell
                                        key={i}
                                        char={c.char}
                                        active={c.active}
                                        filled={c.filled}
                                    />
                                ))}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Terms */}
                        <TouchableOpacity
                            style={styles.termsRow}
                            onPress={() => setAgreed(!agreed)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                                {agreed && <Text style={styles.tick}>✓</Text>}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the{' '}
                                <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Login CTA */}
                        <TouchableOpacity
                            style={[styles.loginBtn, !canLogin && styles.btnDimmed]}
                            onPress={handleLogin}
                            activeOpacity={canLogin ? 0.82 : 1}
                            disabled={!canLogin}
                        >
                            <LinearGradient
                                colors={
                                    canLogin
                                        ? [Colors.accent, Colors.accentDark]
                                        : ['#E8F0F4', '#DDE8EE']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGrad}
                            >
                                <Text
                                    style={[
                                        styles.loginBtnText,
                                        !canLogin && styles.loginBtnTextOff,
                                    ]}
                                >
                                    Confirm & Login
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.footerNote}>
                            Your data is encrypted and never shared.
                        </Text>

                        {/* Register Link */}
                        <TouchableOpacity
                            style={styles.registerLink}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.registerText}>
                                New user? <Text style={styles.registerLinkText}>Create Account</Text>
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
};

const RADIUS = 32;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FA' },

    // Header
    header: {
        height: height * 0.38,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    glowRingOuter: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    glowRingInner: {
        position: 'absolute',
        width: 190,
        height: 190,
        borderRadius: 95,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    logoRing: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    logoDisk: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossH: {
        position: 'absolute',
        width: 32,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: Colors.white,
    },
    crossV: {
        position: 'absolute',
        width: 9,
        height: 32,
        borderRadius: 4.5,
        backgroundColor: Colors.white,
    },
    brandName: {
        fontSize: 30,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: 9,
        textShadowColor: 'rgba(0,50,70,0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    brandTagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.4,
        marginTop: 6,
        fontWeight: '400',
    },

    // Sheet
    sheetWrapper: { flex: 1, marginTop: -RADIUS },
    sheet: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 32,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 12,
    },
    sheetTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textDark,
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    sheetSub: {
        fontSize: 13,
        color: Colors.textMuted,
        marginBottom: 28,
        lineHeight: 18,
    },

    // Labels
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },

    // Mobile input
    mobileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        backgroundColor: '#F8FBFC',
        marginBottom: 18,
        height: 56,
        overflow: 'hidden',
    },
    prefixBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 6,
    },
    flag: { fontSize: 18 },
    code: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
    sep: { width: 1.5, height: 28, backgroundColor: '#D8E8EE' },
    mobileInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.textDark,
        fontWeight: '600',
        paddingHorizontal: 14,
    },
    validBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    validTick: { color: Colors.white, fontSize: 14, fontWeight: '800' },

    // Send OTP
    sendBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    btnGrad: { paddingVertical: 16, alignItems: 'center' },
    sendBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    btnDimmed: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },

    // Sent row
    sentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sentBadge: {
        backgroundColor: '#EAF9F4',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B0E8D4',
        flex: 1,
        marginRight: 12,
    },
    sentText: { fontSize: 12, color: '#0F7A58', fontWeight: '600' },
    resendText: {
        fontSize: 13,
        color: Colors.gradientStart,
        fontWeight: '800',
        textDecorationLine: 'underline',
    },

    // OTP
    hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0, zIndex: -1 },
    otpRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
    otpCell: {
        flex: 1,
        height: 56,
        borderRadius: 14,
        borderWidth: 1.5,
        backgroundColor: '#F8FBFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpCellFilled: { backgroundColor: '#EAF9F4', borderColor: Colors.accent },
    otpChar: { fontSize: 22, fontWeight: '800', color: Colors.textDark },

    // Terms
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginTop: 24,
        marginBottom: 20,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#C8DDE5',
        backgroundColor: '#F4F9FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accentDark },
    tick: { color: Colors.white, fontSize: 13, fontWeight: '900' },
    termsText: { flex: 1, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
    termsLink: { color: Colors.gradientStart, fontWeight: '700', textDecorationLine: 'underline' },

    // Login
    loginBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.accentDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    loginBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
    loginBtnTextOff: { color: '#A0B8C4' },

    footerNote: {
        textAlign: 'center',
        fontSize: 11,
        color: '#A8BEC8',
        marginTop: 20,
        lineHeight: 17,
        paddingHorizontal: 10,
    },

    // Register Link
    registerLink: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
    registerText: {
        fontSize: 14,
        color: Colors.textMedium,
    },
    registerLinkText: {
        color: Colors.gradientStart,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // User Type Selection
    userTypeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    userTypeBtn: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: '#E8F0F4',
    },
    userTypeBtnActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
    },
    userTypeIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    userTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMedium,
        textAlign: 'center',
    },
    userTypeTextActive: {
        color: Colors.gradientStart,
    },
});

export default LoginScreen;
