import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
    label: string;
    onPress: () => void;
    style?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export interface CustomAlertProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
    dismissable?: boolean;
}

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
    AlertType,
    {
        icon: string;
        iconColor: string;
        gradientColors: string[];
        ringColor: string;
    }
> = {
    success: {
        icon: 'checkmark-circle',
        iconColor: '#7ED321',
        gradientColors: ['rgba(126, 211, 33, 0.15)', 'rgba(94, 163, 0, 0.08)'],
        ringColor: 'rgba(126, 211, 33, 0.3)',
    },
    error: {
        icon: 'close-circle',
        iconColor: '#FF6B6B',
        gradientColors: ['rgba(255, 107, 107, 0.15)', 'rgba(230, 50, 50, 0.08)'],
        ringColor: 'rgba(255, 107, 107, 0.3)',
    },
    warning: {
        icon: 'warning',
        iconColor: '#FFB84D',
        gradientColors: ['rgba(255, 184, 77, 0.15)', 'rgba(230, 150, 0, 0.08)'],
        ringColor: 'rgba(255, 184, 77, 0.3)',
    },
    info: {
        icon: 'information-circle',
        iconColor: '#00D4A0',
        gradientColors: [Colors.gradientStart + '26', Colors.gradientMid + '14'],
        ringColor: 'rgba(0, 212, 160, 0.3)',
    },
    confirm: {
        icon: 'help-circle',
        iconColor: '#00B4E8',
        gradientColors: [Colors.gradientEnd + '26', Colors.gradientMid + '14'],
        ringColor: 'rgba(0, 180, 232, 0.3)',
    },
};

const BUTTON_STYLES: Record<
    string,
    {
        bg: string[];
        text: string;
        border: string;
    }
> = {
    primary: {
        bg: [Colors.gradientStart, Colors.gradientMid],
        text: Colors.white,
        border: 'transparent',
    },
    secondary: {
        bg: [Colors.gradientEnd, Colors.gradientMid],
        text: Colors.white,
        border: 'transparent',
    },
    danger: {
        bg: ['rgba(255, 107, 107, 0.15)', 'rgba(255, 107, 107, 0.08)'],
        text: '#FF6B6B',
        border: 'rgba(255, 107, 107, 0.3)',
    },
    ghost: {
        bg: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)'],
        text: Colors.textMuted,
        border: 'rgba(255, 255, 255, 0.2)',
    },
};

// ─── Floating particle component ──────────────────────────────────────────────
const FloatingParticle: React.FC<{
    delay: number;
    left: `${number}%`;
    top: `${number}%`;
    size: number;
}> = ({ delay, left, top, size }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -12],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.2, 0.5, 0.2],
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left,
                    top,
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomAlert({
    visible,
    type = 'info',
    title,
    message,
    buttons = [{ label: 'OK', onPress: () => {}, style: 'primary' }],
    onDismiss,
    dismissable = true,
}: CustomAlertProps) {
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.85)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardY = useRef(new Animated.Value(20)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const ring1Scale = useRef(new Animated.Value(0.7)).current;
    const ring2Scale = useRef(new Animated.Value(0.7)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Backdrop in
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();

            // Card entrance
            Animated.parallel([
                Animated.spring(cardScale, {
                    toValue: 1,
                    tension: 65,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(cardY, {
                    toValue: 0,
                    tension: 65,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // Icon sequence: rings then icon
            Animated.sequence([
                Animated.delay(150),
                Animated.parallel([
                    Animated.spring(ring1Scale, {
                        toValue: 1,
                        tension: 70,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                    Animated.spring(ring2Scale, {
                        toValue: 1,
                        tension: 80,
                        friction: 6,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.spring(iconScale, {
                    toValue: 1,
                    tension: 90,
                    friction: 5,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Start pulse after entrance
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.06,
                            duration: 1400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 1400,
                            useNativeDriver: true,
                        }),
                    ]),
                ).start();
            });
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(cardScale, {
                    toValue: 0.9,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                cardScale.setValue(0.85);
                cardY.setValue(20);
                iconScale.setValue(0);
                ring1Scale.setValue(0.7);
                ring2Scale.setValue(0.7);
                pulseAnim.setValue(1);
            });
        }
    }, [visible]);

    const cfg = TYPE_CONFIG[type];

    // Particles positions
    const particles: Array<{
        left: `${number}%`;
        top: `${number}%`;
        size: number;
        delay: number;
    }> = [
        { left: '8%', top: '15%', size: 4, delay: 0 },
        { left: '85%', top: '12%', size: 3, delay: 400 },
        { left: '15%', top: '75%', size: 5, delay: 800 },
        { left: '88%', top: '70%', size: 4, delay: 200 },
    ];

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            {/* ── Backdrop ── */}
            <Animated.View
                style={[styles.backdrop, { opacity: backdropOpacity }]}
                onTouchEnd={dismissable ? onDismiss : undefined}
            />

            {/* ── Card ── */}
            <View style={styles.centerer} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: cardOpacity,
                            transform: [{ scale: cardScale }, { translateY: cardY }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        {/* Floating particles */}
                        {particles.map((p, i) => (
                            <FloatingParticle key={i} {...p} />
                        ))}

                        {/* Top gradient accent */}
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.topAccent}
                        />

                        {/* Icon container with rings */}
                        <View style={styles.iconContainer}>
                            {/* Outer ring */}
                            <Animated.View
                                style={[
                                    styles.iconRing1,
                                    {
                                        borderColor: cfg.ringColor,
                                        transform: [{ scale: ring1Scale }],
                                    },
                                ]}
                            />

                            {/* Inner ring */}
                            <Animated.View
                                style={[
                                    styles.iconRing2,
                                    {
                                        borderColor: cfg.ringColor,
                                        transform: [{ scale: ring2Scale }],
                                    },
                                ]}
                            />

                            {/* Icon background with gradient */}
                            <Animated.View
                                style={{
                                    transform: [{ scale: iconScale }, { scale: pulseAnim }],
                                }}
                            >
                                <LinearGradient
                                    colors={cfg.gradientColors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.iconWrap}
                                >
                                    <Ionicons
                                        name={cfg.icon as any}
                                        size={38}
                                        color={cfg.iconColor}
                                    />
                                </LinearGradient>
                            </Animated.View>
                        </View>

                        {/* Text */}
                        <Text style={styles.title}>{title}</Text>
                        {message ? <Text style={styles.message}>{message}</Text> : null}

                        {/* Decorative divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerDot} />
                            <View style={styles.divider} />
                            <View style={styles.dividerDot} />
                        </View>

                        {/* Buttons */}
                        <View
                            style={[
                                styles.buttonsRow,
                                buttons.length === 1 && styles.buttonsSingle,
                            ]}
                        >
                            {buttons.map((btn, i) => {
                                const bStyle = BUTTON_STYLES[btn.style ?? 'primary'];
                                const isGradient = Array.isArray(bStyle.bg);

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.btnContainer,
                                            buttons.length === 1 && styles.btnFull,
                                        ]}
                                        onPress={btn.onPress}
                                        activeOpacity={0.85}
                                    >
                                        {isGradient ? (
                                            <LinearGradient
                                                colors={bStyle.bg}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={[
                                                    styles.btn,
                                                    {
                                                        borderColor: bStyle.border,
                                                        borderWidth:
                                                            bStyle.border !== 'transparent'
                                                                ? 1.5
                                                                : 0,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[styles.btnText, { color: bStyle.text }]}
                                                >
                                                    {btn.label}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View
                                                style={[
                                                    styles.btn,
                                                    {
                                                        backgroundColor: bStyle.bg[0],
                                                        borderColor: bStyle.border,
                                                        borderWidth:
                                                            bStyle.border !== 'transparent'
                                                                ? 1.5
                                                                : 0,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[styles.btnText, { color: bStyle.text }]}
                                                >
                                                    {btn.label}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 68, 102, 0.6)',
    },
    centerer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 35,
        elevation: 18,
    },
    cardGradient: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 24,
    },
    particle: {
        position: 'absolute',
        backgroundColor: Colors.gradientStart,
    },
    topAccent: {
        width: '100%',
        height: 4,
        marginBottom: 32,
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        height: 90,
    },
    iconRing1: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 1.5,
    },
    iconRing2: {
        position: 'absolute',
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 1.5,
    },
    iconWrap: {
        width: 68,
        height: 68,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textDark,
        textAlign: 'center',
        letterSpacing: -0.2,
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 28,
        fontWeight: '400',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
        gap: 8,
    },
    divider: {
        width: 50,
        height: 1.5,
        backgroundColor: 'rgba(0, 196, 200, 0.3)',
    },
    dividerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.gradientMid,
    },
    buttonsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        width: '100%',
    },
    buttonsSingle: {
        justifyContent: 'center',
    },
    btnContainer: {
        flex: 1,
    },
    btn: {
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnFull: {
        flex: 1,
    },
    btnText: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
});

// ─── Usage Example ────────────────────────────────────────────────────────────
import { useState } from 'react';

export function AlertDemo() {
    const [alert, setAlert] = useState<{
        visible: boolean;
        type: AlertType;
        title: string;
        message: string;
        buttons: AlertButton[];
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
        buttons: [],
    });

    const show = (type: AlertType, title: string, message: string, buttons: AlertButton[]) =>
        setAlert({ visible: true, type, title, message, buttons });

    const hide = () => setAlert(prev => ({ ...prev, visible: false }));

    return (
        <View style={demoStyles.container}>
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={demoStyles.header}
            >
                <Text style={demoStyles.eyebrow}>HEALTHCARE UI</Text>
                <Text style={demoStyles.heading}>Alert System</Text>
                <Text style={demoStyles.subheading}>Medical-grade notifications</Text>
            </LinearGradient>

            <View style={demoStyles.grid}>
                {/* Success */}
                <TouchableOpacity
                    style={[demoStyles.tile]}
                    onPress={() =>
                        show(
                            'success',
                            'Appointment Confirmed',
                            'Your home healthcare visit is scheduled for March 15th at 10:00 AM.',
                            [
                                { label: 'View Details', onPress: hide, style: 'secondary' },
                                { label: 'Done', onPress: hide, style: 'primary' },
                            ],
                        )
                    }
                >
                    <LinearGradient
                        colors={['rgba(126, 211, 33, 0.15)', 'rgba(94, 163, 0, 0.08)']}
                        style={demoStyles.tileGradient}
                    >
                        <Ionicons name="checkmark-circle" size={32} color="#7ED321" />
                        <Text style={[demoStyles.tileLabel, { color: '#5EA300' }]}>Success</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Error */}
                <TouchableOpacity
                    style={[demoStyles.tile]}
                    onPress={() =>
                        show(
                            'error',
                            'Booking Failed',
                            'Unable to process your request. Please check your connection and try again.',
                            [
                                { label: 'Retry', onPress: hide, style: 'primary' },
                                { label: 'Cancel', onPress: hide, style: 'ghost' },
                            ],
                        )
                    }
                >
                    <LinearGradient
                        colors={['rgba(255, 107, 107, 0.15)', 'rgba(230, 50, 50, 0.08)']}
                        style={demoStyles.tileGradient}
                    >
                        <Ionicons name="close-circle" size={32} color="#FF6B6B" />
                        <Text style={[demoStyles.tileLabel, { color: '#E63232' }]}>Error</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Warning */}
                <TouchableOpacity
                    style={[demoStyles.tile]}
                    onPress={() =>
                        show(
                            'warning',
                            'Limited Availability',
                            'Only 2 time slots remaining for injection services this week. Book soon!',
                            [
                                { label: 'Book Now', onPress: hide, style: 'primary' },
                                { label: 'Later', onPress: hide, style: 'ghost' },
                            ],
                        )
                    }
                >
                    <LinearGradient
                        colors={['rgba(255, 184, 77, 0.15)', 'rgba(230, 150, 0, 0.08)']}
                        style={demoStyles.tileGradient}
                    >
                        <Ionicons name="warning" size={32} color="#FFB84D" />
                        <Text style={[demoStyles.tileLabel, { color: '#E69600' }]}>Warning</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Info */}
                <TouchableOpacity
                    style={[demoStyles.tile]}
                    onPress={() =>
                        show(
                            'info',
                            'Service Update',
                            'Our home injection service now includes vitamin B12 and COVID-19 vaccinations.',
                            [{ label: 'Got it', onPress: hide, style: 'primary' }],
                        )
                    }
                >
                    <LinearGradient
                        colors={[Colors.gradientStart + '26', Colors.gradientMid + '14']}
                        style={demoStyles.tileGradient}
                    >
                        <Ionicons
                            name="information-circle"
                            size={32}
                            color={Colors.gradientStart}
                        />
                        <Text style={[demoStyles.tileLabel, { color: '#00A080' }]}>Info</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Confirm */}
                <TouchableOpacity
                    style={[demoStyles.tile, demoStyles.tileWide]}
                    onPress={() =>
                        show(
                            'confirm',
                            'Cancel Appointment?',
                            'Are you sure you want to cancel your scheduled home visit? This cannot be undone.',
                            [
                                { label: 'Keep', onPress: hide, style: 'secondary' },
                                { label: 'Cancel', onPress: hide, style: 'danger' },
                            ],
                        )
                    }
                >
                    <LinearGradient
                        colors={[Colors.gradientEnd + '26', Colors.gradientMid + '14']}
                        style={demoStyles.tileGradient}
                    >
                        <Ionicons name="help-circle" size={32} color={Colors.gradientEnd} />
                        <Text style={[demoStyles.tileLabel, { color: '#0090C0' }]}>Confirm</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <CustomAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                buttons={alert.buttons}
                onDismiss={hide}
            />
        </View>
    );
}

const demoStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F8F8' },
    header: {
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 24,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2.5,
        marginBottom: 6,
    },
    heading: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subheading: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.3,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    tile: {
        width: (SCREEN_WIDTH - 44) / 2,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    tileWide: { width: '100%' },
    tileGradient: {
        paddingVertical: 28,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    tileLabel: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
