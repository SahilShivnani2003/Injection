import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
    Dimensions,
    ScrollView,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import Loader from '@/components/Loader';
import { useAlert } from '@/context/AlertContext';
import { userApi } from '@/service/apis/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { vendorAPI } from '@/service/apis/vendorService';
import { FieldInput } from '@/components/FieldInput';

const { height } = Dimensions.get('window');

type EmailLoginProps = NativeStackScreenProps<RootStackParamList, 'EmailLogin'>;

const EmailLoginScreen = ({ navigation }: EmailLoginProps) => {
    const { setAuth } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<'patient' | 'Vendor'>('patient');
    const alert = useAlert();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        const entrance = Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);
        entrance.start();
        return () => entrance.stop();
    }, []);

    const handleLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            alert.error('Validation Error', 'Please enter your email address');
            return;
        }
        if (!password.trim()) {
            alert.error('Validation Error', 'Please enter your password');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            alert.warning('Invalid Email', 'Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);
            const response =
                userType === 'patient'
                    ? await userApi.login({ email: trimmedEmail, password })
                    : await vendorAPI.loginVendor({ email: trimmedEmail, password });

            if (response.data?.success) {              

                setAuth(
                    userType === 'Vendor' ? response.data.data?.vendor : response.data.data.user,
                    userType,
                    response.data.data.token,
                );

                alert.success('Login Successful', 'Welcome back!');
                
                if (userType === 'Vendor') {
                    navigation.replace('VendorTab', { screen: 'Dashboard' });
                } else {
                    navigation.replace('UserTab', { screen: 'Dashboard' });
                }
            } else {
                alert.error('Login Failed', 'Invalid email or password. Please try again.');
            }
        } catch (error: any) {
            console.error('Error while login: ', error);
            alert.error(
                'Login Failed',
                error?.message || 'An error occurred while logging in. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const userTypes: {
        key: 'patient' | 'Vendor';
        label: string;
        icon: string;
    }[] = [
        { key: 'patient', label: 'Patient', icon: 'person' },
        { key: 'Vendor', label: 'Vendor', icon: 'medical-services' },
    ];

    return (
        <View style={styles.root}>
            {/* ── Gradient Header ────────────────────────────────────────── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.glowRingOuter} />
                <View style={styles.glowRingInner} />
                <View style={styles.logoRing}>
                    <Image
                        source={require('@/assets/injection.png')}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
            </LinearGradient>

            {/* ── Form Sheet ─────────────────────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        styles.formContainer,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.sheetHandle} />

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── User Type Selection ─────────────────────────── */}
                        <Text style={styles.sectionLabel}>Login as</Text>
                        <View style={styles.userTypeRow}>
                            {userTypes.map(type => {
                                const active = userType === type.key;
                                return (
                                    <TouchableOpacity
                                        key={type.key}
                                        style={[
                                            styles.userTypeBtn,
                                            active && styles.userTypeBtnActive,
                                        ]}
                                        onPress={() => setUserType(type.key)}
                                        activeOpacity={0.75}
                                    >
                                        <View
                                            style={[
                                                styles.userTypeIconWrap,
                                                active && styles.userTypeIconWrapActive,
                                            ]}
                                        >
                                            <Icon
                                                name={type.icon}
                                                size={20}
                                                color={active ? Colors.white : Colors.textMuted}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.userTypeText,
                                                active && styles.userTypeTextActive,
                                            ]}
                                        >
                                            {type.label}
                                        </Text>
                                        {active && (
                                            <View style={styles.userTypeCheck}>
                                                <Icon
                                                    name="check-circle"
                                                    size={16}
                                                    color={Colors.gradientStart}
                                                />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* ── Email Input ─────────────────────────────────── */}
                        <FieldInput
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            editable={!isLoading}
                            required
                            rightIcon={<Icon name="email" size={18} color="#A8BEC8" />}
                        />

                        {/* ── Password Input ──────────────────────────────── */}
                        <FieldInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            editable={!isLoading}
                            required
                            secureTextEntry={!showPassword}
                            rightIcon={
                                <TouchableOpacity
                                    onPress={() => setShowPassword(p => !p)}
                                    activeOpacity={0.7}
                                    disabled={isLoading}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Icon
                                        name={showPassword ? 'visibility' : 'visibility-off'}
                                        size={18}
                                        color="#A8BEC8"
                                    />
                                </TouchableOpacity>
                            }
                        />

                        {/* ── Forgot Password ─────────────────────────────── */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            activeOpacity={0.7}
                            disabled={isLoading}
                            onPress={()=> navigation.navigate('forgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* ── Login Button ────────────────────────────────── */}
                        <TouchableOpacity
                            style={[styles.loginBtn, isLoading && styles.btnDimmed]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[
                                    Colors.gradientStart,
                                    Colors.gradientMid,
                                    Colors.gradientEnd,
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.btnGrad}
                            >
                                {isLoading ? (
                                    <Loader type="spinner" size="small" color={Colors.white} />
                                ) : (
                                    <>
                                        <Text style={styles.loginBtnText}>Sign In</Text>
                                        <Icon
                                            name="arrow-forward"
                                            size={18}
                                            color={Colors.white}
                                            style={{ marginLeft: 8 }}
                                        />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* ── Register Link ───────────────────────────────── */}
                        <View style={styles.divider} />
                        <TouchableOpacity
                            style={styles.registerLink}
                            onPress={() => {
                                if (userType === 'Vendor') {
                                    navigation.navigate('VendorRegister');
                                } else {
                                    navigation.navigate('Register');
                                }
                            }}
                            activeOpacity={0.7}
                            disabled={isLoading}
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

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FA' },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
        height: height * 0.36,
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
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.82)', textAlign: 'center' },

    // ── Form Sheet ─────────────────────────────────────────────────────────
    container: { flex: 1 },
    formContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        paddingHorizontal: 24,
        paddingTop: 14,
        shadowColor: '#0B2E3A',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 6,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E4EEF2',
        marginBottom: 20,
    },
    scrollContent: { paddingBottom: 40 },

    sectionLabel: {
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
        marginBottom: 26,
        gap: 12,
    },
    userTypeBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F8FBFC',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E8F0F4',
    },
    userTypeBtnActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#EAFAF6',
    },
    userTypeIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: '#EEF4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    userTypeIconWrapActive: {
        backgroundColor: Colors.gradientStart,
    },
    userTypeText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMuted,
        flexShrink: 1,
    },
    userTypeTextActive: {
        color: Colors.textDark,
        fontWeight: '700',
    },
    userTypeCheck: {
        marginLeft: 'auto',
    },

    // ── Forgot Password ────────────────────────────────────────────────────
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 28, marginTop: 2 },
    forgotPasswordText: { fontSize: 13.5, color: Colors.gradientStart, fontWeight: '600' },

    // ── Login Button ───────────────────────────────────────────────────────
    loginBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
        elevation: 8,
        marginBottom: 20,
    },
    btnGrad: {
        paddingVertical: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.6 },
    btnDimmed: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },

    // ── Divider / Register ─────────────────────────────────────────────────
    divider: {
        height: 1,
        backgroundColor: '#EEF4F6',
        marginBottom: 16,
    },
    registerLink: { alignItems: 'center', paddingVertical: 6 },
    registerText: { fontSize: 14, color: Colors.textMedium },
    registerLinkText: {
        color: Colors.gradientStart,
        fontWeight: '700',
    },
});

export default EmailLoginScreen;
