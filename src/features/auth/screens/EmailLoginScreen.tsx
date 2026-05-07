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

const { width, height } = Dimensions.get('window');

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

    // FIX 1: Store the animation reference and stop it on unmount to prevent
    //         setState-on-unmounted-component warnings.
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
        // Trim once so all subsequent checks and calls use a clean value.
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
                console.log('Login response : ', response.data);

                alert.success('Login Successful', 'Welcome back!');

                setAuth(userType === 'Vendor' ? response.data.data?.vendor : response.data.data.user, userType, response.data.data.token);

                if (userType === 'Vendor') {
                    navigation.replace('VendorTab', { screen: 'Dashboard' });
                } else {
                    navigation.replace('UserTab', { screen: 'Dashboard' });
                }
            } else {
                alert.error('Login Failed', 'Invalid email or password. Please try again.');
            }
        } catch (error:any) {
            console.error('Error while vendor loggin : ', error);
            alert.error('Login Failed', error?.message || 'An error occurred while logging in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const userTypes: {
        key: 'patient' | 'Vendor';
        label: string;
        icon: string; // MaterialIcons name
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
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── User Type Selection ─────────────────────────── */}
                        <Text style={styles.inputLabel}>Login as</Text>
                        <View style={styles.userTypeRow}>
                            {userTypes.map(type => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[
                                        styles.userTypeBtn,
                                        userType === type.key && styles.userTypeBtnActive,
                                    ]}
                                    onPress={() => setUserType(type.key)}
                                    activeOpacity={0.7}
                                >
                                    {/* FIX 6: Vector icon replaces emoji */}
                                    <Icon
                                        name={type.icon}
                                        size={24}
                                        color={
                                            userType === type.key
                                                ? Colors.gradientStart
                                                : Colors.textMuted
                                        }
                                        style={styles.userTypeIcon}
                                    />
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

                        {/* ── Email Input ─────────────────────────────────── */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#A8BEC8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                {/* FIX 3: Vector icon replaces 📧 emoji */}
                                <View style={styles.inputIcon}>
                                    <Icon name="email" size={20} color="#A8BEC8" />
                                </View>
                            </View>
                        </View>

                        {/* ── Password Input ──────────────────────────────── */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#A8BEC8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                {/* FIX 3 continued: Vector icons replace 👁️ / 🙈 emojis */}
                                <TouchableOpacity
                                    style={styles.inputIcon}
                                    onPress={() => setShowPassword(p => !p)}
                                    activeOpacity={0.7}
                                    disabled={isLoading}
                                >
                                    <Icon
                                        name={showPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color="#A8BEC8"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ── Forgot Password ─────────────────────────────── */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* ── Login Button ────────────────────────────────── */}
                        <TouchableOpacity
                            style={[styles.loginBtn, isLoading && styles.btnDimmed]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
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
                                    <Text style={styles.loginBtnText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* ── Alternative Login ───────────────────────────── */}
                        <View style={styles.alternativeContainer}>
                            <Text style={styles.alternativeText}>Or sign in with</Text>
                            {/* FIX 4: Row layout added so the vector icon sits beside the label */}
                            <TouchableOpacity
                                style={styles.mobileLoginBtn}
                                onPress={() => navigation.replace('Login')}
                                activeOpacity={0.7}
                                disabled={isLoading}
                            >
                                {/* FIX 3 continued: Vector icon replaces 📱 emoji */}
                                <Icon name="smartphone" size={18} color={Colors.textMedium} />
                                <Text style={styles.mobileLoginText}>Mobile Number</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Register Link ───────────────────────────────── */}
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
    // FIX 5: Removed dead `logoText` style — it was defined but never used.
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

    // ── Form Sheet ─────────────────────────────────────────────────────────
    container: { flex: 1 },
    formContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    scrollContent: { paddingBottom: 40 },

    // ── Inputs ─────────────────────────────────────────────────────────────
    inputGroup: { marginBottom: 24 },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textMedium,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FCFE',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E8F0F4',
        paddingHorizontal: 16,
        height: 56,
    },
    input: { flex: 1, fontSize: 16, color: Colors.textDark, fontWeight: '500' },
    inputIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    //User type
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
    // FIX 7: Removed dead userTypeBtnFirst / userTypeBtnLast styles (were
    //         just margin: 0 on flex children that already default to 0).
    userTypeBtnActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
    },
    userTypeIcon: {
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

    // ── Forgot Password ────────────────────────────────────────────────────
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 32 },
    forgotPasswordText: { fontSize: 14, color: Colors.gradientStart, fontWeight: '600' },

    // ── Login Button ───────────────────────────────────────────────────────
    loginBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    btnGrad: { paddingVertical: 16, alignItems: 'center' },
    loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.8 },
    btnDimmed: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },

    // ── Alternative Login ──────────────────────────────────────────────────
    alternativeContainer: { alignItems: 'center', marginBottom: 24 },
    alternativeText: { fontSize: 14, color: Colors.textMuted, marginBottom: 12 },
    mobileLoginBtn: {
        // FIX 4: Row layout so the vector icon aligns beside the text label.
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F0F7FA',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8F0F4',
    },
    mobileLoginText: { fontSize: 14, color: Colors.textMedium, fontWeight: '600' },

    // ── Register Link ──────────────────────────────────────────────────────
    registerLink: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
    registerText: { fontSize: 14, color: Colors.textMedium },
    registerLinkText: {
        color: Colors.gradientStart,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default EmailLoginScreen;
