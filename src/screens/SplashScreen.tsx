import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Animated,
    Dimensions,
    Easing,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';

const { width, height } = Dimensions.get('window');

interface Props {
    navigation: any;
}

// Floating background particle
const Particle: React.FC<{
    x: number;
    y: number;
    size: number;
    delay: number;
    opacity: number;
}> = ({ x, y, size, delay, opacity }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -18],
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        />
    );
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    const { loadAuth } = useAuthStore();
    // Core animation refs
    const ring1Scale = useRef(new Animated.Value(0.6)).current;
    const ring1Opacity = useRef(new Animated.Value(0)).current;
    const ring2Scale = useRef(new Animated.Value(0.6)).current;
    const ring2Opacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const crossScale = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(24)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(16)).current;
    const dividerWidth = useRef(new Animated.Value(0)).current;
    const bottomOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Particles data
    const particles = [
        { x: 0.08 * width, y: 0.12 * height, size: 6, delay: 0, opacity: 0.35 },
        { x: 0.82 * width, y: 0.08 * height, size: 4, delay: 400, opacity: 0.25 },
        { x: 0.15 * width, y: 0.78 * height, size: 8, delay: 800, opacity: 0.2 },
        { x: 0.88 * width, y: 0.72 * height, size: 5, delay: 200, opacity: 0.3 },
        { x: 0.5 * width, y: 0.06 * height, size: 4, delay: 600, opacity: 0.2 },
        { x: 0.72 * width, y: 0.85 * height, size: 6, delay: 1000, opacity: 0.25 },
        { x: 0.05 * width, y: 0.45 * height, size: 4, delay: 300, opacity: 0.2 },
        { x: 0.92 * width, y: 0.42 * height, size: 5, delay: 700, opacity: 0.28 },
        { x: 0.3 * width, y: 0.92 * height, size: 4, delay: 150, opacity: 0.22 },
        { x: 0.62 * width, y: 0.18 * height, size: 3, delay: 900, opacity: 0.18 },
    ];

    const handleNavigation = async () => {
        await loadAuth();

        const { isAuthenticated, user } = useAuthStore.getState();

        if (isAuthenticated) {
            navigation.replace('MainTab', {
                screen: 'Dashboard',
            });
        } else {
            navigation.replace('Login');
        }
    };

    useEffect(() => {
        // Entrance sequence
        Animated.sequence([
            // 1) Rings expand in
            Animated.parallel([
                Animated.timing(ring1Scale, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(ring1Opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            // 2) Inner ring
            Animated.parallel([
                Animated.timing(ring2Scale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(ring2Opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            // 3) Cross appears
            Animated.spring(crossScale, {
                toValue: 1,
                tension: 80,
                friction: 6,
                useNativeDriver: true,
            }),
            // 4) Title slides up
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                }),
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(dividerWidth, {
                    toValue: 60,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false, // width can't use native driver
                }),
            ]),
            // 5) Tagline + bottom
            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(bottomOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            // Start idle pulse after entrance
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        });

        const timer = setTimeout(() => {
            handleNavigation();
        }, 4200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.container}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Background diagonal accent strip */}
            <View style={styles.accentStrip} />

            {/* Floating particles */}
            {particles.map((p, i) => (
                <Particle key={i} {...p} />
            ))}

            {/* Corner decorative arcs */}
            <View style={[styles.cornerArc, styles.cornerTopLeft]} />
            <View style={[styles.cornerArc, styles.cornerBottomRight]} />

            {/* ── Main Content ── */}
            <View style={styles.content}>
                {/* Outer glow ring */}
                <Animated.View
                    style={[
                        styles.ring1,
                        {
                            opacity: ring1Opacity,
                            transform: [{ scale: ring1Scale }],
                        },
                    ]}
                />

                {/* Inner ring */}
                <Animated.View
                    style={[
                        styles.ring2,
                        {
                            opacity: ring2Opacity,
                            transform: [{ scale: ring2Scale }],
                        },
                    ]}
                />

                {/* Logo disc */}
                <Animated.View
                    style={[
                        styles.logoDisk,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }, { scale: pulseAnim }],
                        },
                    ]}
                >
                    {/* Geometric medical cross */}
                    <Image
                        source={require('../assets/injection.png')}
                        style={{width: '100%', height: '100%'}}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* App name */}
                <Animated.Text
                    style={[
                        styles.appName,
                        {
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslateY }],
                        },
                    ]}
                >
                    INJECTION
                </Animated.Text>

                {/* Animated divider line */}
                <Animated.View style={[styles.divider, { width: dividerWidth }]} />

                {/* Tagline */}
                <Animated.Text
                    style={[
                        styles.tagline,
                        {
                            opacity: taglineOpacity,
                            transform: [{ translateY: taglineTranslateY }],
                        },
                    ]}
                >
                    Home Healthcare at Your Doorstep
                </Animated.Text>
            </View>

            {/* ── Bottom section ── */}
            <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity }]}>
                {/* Progress bar strip */}
                <View style={styles.progressTrack}>
                    <Animated.View style={styles.progressFill} />
                </View>

                <Text style={styles.bottomLabel}>Connecting your care</Text>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Background decorative elements
    accentStrip: {
        position: 'absolute',
        width: width * 1.5,
        height: 260,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: height * 0.28,
        left: -width * 0.25,
        transform: [{ rotate: '-12deg' }],
    },
    cornerArc: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    cornerTopLeft: {
        top: -60,
        left: -60,
    },
    cornerBottomRight: {
        bottom: -60,
        right: -60,
    },
    particle: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,1)',
    },

    // Main content
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Rings
    ring1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'transparent',
    },
    ring2: {
        position: 'absolute',
        width: 156,
        height: 156,
        borderRadius: 78,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
        backgroundColor: 'transparent',
    },

    // Logo
    logoDisk: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 36,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 16,
        // Inner glass shimmer via background approach
        overflow: 'hidden',
    },

    // Geometric cross
    crossH: {
        position: 'absolute',
        width: 46,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.white,
    },
    crossV: {
        position: 'absolute',
        width: 12,
        height: 46,
        borderRadius: 6,
        backgroundColor: Colors.white,
    },
    crossDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },

    // Typography
    appName: {
        fontSize: 38,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: 10,
        textShadowColor: 'rgba(0,60,80,0.3)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 10,
        marginBottom: 14,
    },

    divider: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 1,
        marginBottom: 14,
    },

    tagline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2,
        fontWeight: '500',
        textTransform: 'uppercase',
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    // Bottom
    bottomSection: {
        position: 'absolute',
        bottom: 52,
        alignItems: 'center',
        width: width,
        paddingHorizontal: 60,
        gap: 10,
    },
    progressTrack: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressFill: {
        width: '40%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 1,
    },
    bottomLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
});

export default SplashScreen;
