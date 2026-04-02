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
const OtpCell: React.FC<{
    char: string;
    active: boolean;
    filled: boolean;
}> = ({ char, active, filled }) => {
    const borderAnim = useRef(new Animated.Value(0)).current;
    const cursorAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: active ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [active]);

    // Blinking cursor animation
    useEffect(() => {
        if (active && !char) {
            const blink = Animated.loop(
                Animated.sequence([
                    Animated.timing(cursorAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(cursorAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]),
            );
            blink.start();
            return () => blink.stop();
        } else {
            cursorAnim.setValue(1);
        }
    }, [active, char]);

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D8E8EE', Colors.gradientStart],
    });

    return (
        <Animated.View
            style={[
                styles.otpCell,
                { borderColor },
                filled && styles.otpCellFilled,
                active && styles.otpCellActive,
            ]}
        >
            {char ? (
                <Text style={styles.otpChar}>{char}</Text>
            ) : active ? (
                <Animated.View style={[styles.cursor, { opacity: cursorAnim }]} />
            ) : null}
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

    // ── Entrance animation ────────────────────────────────────────────────────
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

    // ── Mobile border focus ───────────────────────────────────────────────────
    useEffect(() => {
        Animated.timing(mobileBorder, {
            toValue: mobileActive ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [mobileActive]);

    // ── OTP section slide-in ──────────────────────────────────────────────────
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
            ]).start(() => {
                // Small delay so animation completes before focusing
                setTimeout(() => otpRef.current?.focus(), 50);
            });
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

        switch (userType) {
            case 'labpartner':
                navigation.navigate('LabPartner');
                break;
            case 'staff':
                navigation.navigate('StaffPanel');
                break;
            case 'patient':
            default:
                navigation.navigate('MainTab', { screen: 'Dashboard' });
                break;
        }
    };

    const otpTranslateY = otpSlide.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
    const canLogin = agreed && otp.length >= 4 && otpSent;

    // Active index: where the cursor sits (next character position)
    const activeIndex = otpFocused ? Math.min(otp.length, 5) : -1;

    const otpCells = Array.from({ length: 6 }, (_, i) => ({
        char: otp[i] ?? '',
        filled: !!otp[i],
        active: activeIndex === i,
    }));

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* ── Gradient Header ─────────────────────────────────────────── */}
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

            {/* ── White Bottom Sheet ──────────────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.sheetWrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                        contentContainerStyle={styles.scrollContent}
                    >
                        <Text style={styles.sheetTitle}>Welcome Back</Text>
                        <Text style={styles.sheetSub}>
                            Enter your mobile number to receive an OTP
                        </Text>

                        {/* ── User Type Selection ─────────────────────────── */}
                        <Text style={styles.fieldLabel}>Login as</Text>
                        <View style={styles.userTypeRow}>
                            {[
                                { key: 'patient', label: 'Patient', icon: '👤' },
                                { key: 'labpartner', label: 'Lab Partner', icon: '🏥' },
                                { key: 'staff', label: 'Staff', icon: '👨‍⚕️' },
                            ].map((type, index) => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[
                                        styles.userTypeBtn,
                                        userType === type.key && styles.userTypeBtnActive,
                                        index === 0 && styles.userTypeBtnFirst,
                                        index === 2 && styles.userTypeBtnLast,
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

                        {/* ── Mobile Field ─────────────────────────────────── */}
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
                                returnKeyType="done"
                            />
                            {mobile.length === 10 && (
                                <View style={styles.validBadge}>
                                    <Text style={styles.validTick}>✓</Text>
                                </View>
                            )}
                        </Animated.View>

                        {/* ── Send / Resend OTP ─────────────────────────────── */}
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
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text style={styles.resendText}>Resend</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ── OTP Entry ─────────────────────────────────────── */}
                        {otpSent ? (
                            <Animated.View
                                pointerEvents={otpSent ? 'auto' : 'none'}
                                style={[
                                    styles.otpSection,
                                    { opacity: otpOp, transform: [{ translateY: otpTranslateY }] },
                                ]}
                            >
                                <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
                                    One-Time Password
                                </Text>

                                {/* Hidden real input — off-screen, NOT zIndex:-1 */}
                                <TextInput
                                    ref={otpRef}
                                    style={styles.hiddenInput}
                                    value={otp}
                                    onChangeText={t => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    onFocus={() => setOtpFocused(true)}
                                    onBlur={() => setOtpFocused(false)}
                                    caretHidden
                                    autoCorrect={false}
                                    returnKeyType="done"
                                />

                                {/* Visual OTP cells */}
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
                        ) : null}

                        {/* ── Terms ─────────────────────────────────────────── */}
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

                        {/* ── Login CTA ─────────────────────────────────────── */}
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

                        {/* ── Alternative Login ─────────────────────────────── */}
                        <View style={styles.alternativeContainer}>
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.alternativeText}>Or sign in with</Text>
                                <View style={styles.dividerLine} />
                            </View>
                            <TouchableOpacity
                                style={styles.emailLoginBtn}
                                onPress={() => navigation.replace('EmailLogin')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.emailLoginText}>📧 Email & Password</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Register Link ─────────────────────────────────── */}
                        <TouchableOpacity
                            style={styles.registerLink}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.registerText}>
                                New user?{' '}
                                <Text style={styles.registerLinkText}>Create Account</Text>
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

    // ── Header ─────────────────────────────────────────────────────────────
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

    // ── Sheet ──────────────────────────────────────────────────────────────
    sheetWrapper: { flex: 1, marginTop: -RADIUS },
    sheet: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 12,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
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

    // ── Labels ─────────────────────────────────────────────────────────────
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },

    // ── User Type ──────────────────────────────────────────────────────────
    userTypeRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 10,
    },
    userTypeBtn: {
        flex: 1,
        backgroundColor: '#F8FBFC',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 6,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E8F0F4',
    },
    userTypeBtnFirst: { marginLeft: 0 },
    userTypeBtnLast: { marginRight: 0 },
    userTypeBtnActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
    },
    userTypeIcon: {
        fontSize: 22,
        marginBottom: 6,
    },
    userTypeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textMuted,
        textAlign: 'center',
    },
    userTypeTextActive: {
        color: Colors.gradientStart,
        fontWeight: '700',
    },

    // ── Mobile Input ───────────────────────────────────────────────────────
    mobileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        backgroundColor: '#F8FBFC',
        marginBottom: 16,
        height: 54,
        overflow: 'hidden',
    },
    prefixBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 14,
        paddingRight: 12,
        gap: 6,
    },
    flag: { fontSize: 18 },
    code: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
    sep: { width: 1.5, height: 26, backgroundColor: '#D8E8EE' },
    mobileInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.textDark,
        fontWeight: '600',
        paddingHorizontal: 14,
        paddingVertical: 0, // prevents Android vertical clipping
        height: 54,
    },
    validBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    validTick: { color: Colors.white, fontSize: 13, fontWeight: '800' },

    // ── Send OTP Button ────────────────────────────────────────────────────
    sendBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    btnGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
    sendBtnText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    btnDimmed: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },

    // ── Sent Row ───────────────────────────────────────────────────────────
    sentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 12,
    },
    sentBadge: {
        flex: 1,
        backgroundColor: '#EAF9F4',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B0E8D4',
    },
    sentText: { fontSize: 12, color: '#0F7A58', fontWeight: '600' },
    resendText: {
        fontSize: 13,
        color: Colors.gradientStart,
        fontWeight: '800',
        textDecorationLine: 'underline',
    },

    // ── OTP ────────────────────────────────────────────────────────────────
    otpSection: {
        // Wrapper keeps the section from intercepting touches when hidden
    },
    hiddenInput: {
        position: 'absolute',
        top: -9999,
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 4,
    },
    otpCell: {
        flex: 1,
        height: 56,
        borderRadius: 14,
        borderWidth: 1.5,
        backgroundColor: '#F8FBFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpCellActive: {
        backgroundColor: '#F0FAFA',
    },
    otpCellFilled: {
        backgroundColor: '#EAF9F4',
        borderColor: Colors.accent,
    },
    otpChar: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textDark,
        lineHeight: 28,
    },
    // Blinking cursor bar shown inside the active empty cell
    cursor: {
        width: 2,
        height: 24,
        borderRadius: 1,
        backgroundColor: Colors.gradientStart,
    },

    // ── Terms ──────────────────────────────────────────────────────────────
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 24,
        marginBottom: 20,
        gap: 12,
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
        flexShrink: 0,
    },
    checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accentDark },
    tick: { color: Colors.white, fontSize: 13, fontWeight: '900' },
    termsText: { flex: 1, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
    termsLink: {
        color: Colors.gradientStart,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },

    // ── Login CTA ──────────────────────────────────────────────────────────
    loginBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: Colors.accentDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.38,
        shadowRadius: 14,
        elevation: 7,
    },
    loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
    loginBtnTextOff: { color: '#A0B8C4' },

    footerNote: {
        textAlign: 'center',
        fontSize: 11,
        color: '#A8BEC8',
        marginTop: 18,
        lineHeight: 17,
        paddingHorizontal: 10,
    },

    // ── Alternative Login ──────────────────────────────────────────────────
    alternativeContainer: {
        alignItems: 'center',
        marginTop: 28,
        marginBottom: 4,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E4EEF2',
    },
    alternativeText: {
        fontSize: 13,
        color: Colors.textMuted,
        paddingHorizontal: 4,
    },
    emailLoginBtn: {
        backgroundColor: '#F4F9FB',
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0EDF2',
    },
    emailLoginText: {
        fontSize: 14,
        color: Colors.textMedium,
        fontWeight: '600',
    },

    // ── Register Link ──────────────────────────────────────────────────────
    registerLink: {
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 4,
    },
    registerText: {
        fontSize: 14,
        color: Colors.textMedium,
    },
    registerLinkText: {
        color: Colors.gradientStart,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
