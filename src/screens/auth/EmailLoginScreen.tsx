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

type EmailLoginProps = NativeStackScreenProps<RootStackParamList, 'EmailLogin'>;

const EmailLoginScreen = ({ navigation }: EmailLoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
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
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        // Simulate login process
        setTimeout(() => {
            setIsLoading(false);
            // For demo purposes, navigate to main tab
            // In real app, this would validate credentials
            navigation.replace('MainTab', {
                screen: 'Dashboard',
            });
        }, 1500);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header with Gradient Background */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                {/* Glow Rings */}
                <View style={styles.glowRingOuter} />
                <View style={styles.glowRingInner} />

                {/* Logo/Icon */}
                <View style={styles.logoRing}>
                    <Text style={styles.logoText}>💉</Text>
                </View>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Email Input */}
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
                                />
                                <View style={styles.inputIcon}>
                                    <Text style={styles.iconText}>📧</Text>
                                </View>
                            </View>
                        </View>

                        {/* Password Input */}
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
                                />
                                <TouchableOpacity
                                    style={styles.inputIcon}
                                    onPress={togglePasswordVisibility}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.iconText}>
                                        {showPassword ? '👁️' : '🙈'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, isLoading && styles.btnDimmed]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.btnGrad}
                            >
                                <Text style={styles.loginBtnText}>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Alternative Login */}
                        <View style={styles.alternativeContainer}>
                            <Text style={styles.alternativeText}>Or sign in with</Text>
                            <TouchableOpacity
                                style={styles.mobileLoginBtn}
                                onPress={() => navigation.replace('Login')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.mobileLoginText}>📱 Mobile Number</Text>
                            </TouchableOpacity>
                        </View>

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
    logoText: { fontSize: 32 },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },

    // Container
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

    // Input Groups
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
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.textDark,
        fontWeight: '500',
    },
    inputIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: { fontSize: 18 },

    // Forgot Password
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: Colors.gradientStart,
        fontWeight: '600',
    },

    // Login Button
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
    btnGrad: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    btnDimmed: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },

    // Alternative Login
    alternativeContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    alternativeText: {
        fontSize: 14,
        color: Colors.textMuted,
        marginBottom: 12,
    },
    mobileLoginBtn: {
        backgroundColor: '#F0F7FA',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8F0F4',
    },
    mobileLoginText: {
        fontSize: 14,
        color: Colors.textMedium,
        fontWeight: '600',
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
});

export default EmailLoginScreen;