import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { TabParamList } from '../../../navigation/TabNavigator';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type DashboardProps = NativeBottomTabScreenProps<TabParamList, 'Dashboard'>;

const metricCards = [
    { label: 'Upcoming Visits', value: '2', bg: '#E8F9FF', accent: '#00B4E8', icon: '📅' },
    { label: 'Prescriptions', value: '5', bg: '#E6FFF5', accent: '#00D4A0', icon: '💊' },
];

const activityFeed = [
    { icon: '💊', text: 'Prescription refilled', time: '2h ago', color: '#E6FFF5', dot: '#00D4A0' },
    {
        icon: '📋',
        text: 'Care plan updated by Dr. Smith',
        time: 'Yesterday',
        color: '#E8F9FF',
        dot: '#00B4E8',
    },
    {
        icon: '✅',
        text: 'Wound care visit completed',
        time: 'Mar 30',
        color: '#FFF8E6',
        dot: '#F5A623',
    },
];

// Animated metric card
const MetricCard = ({ card, delay }: { card: (typeof metricCards)[0]; delay: number }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, {
            toValue: 1,
            delay,
            useNativeDriver: true,
            tension: 60,
            friction: 8,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.metricCard,
                { backgroundColor: card.bg },
                {
                    opacity: anim,
                    transform: [
                        {
                            translateY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [24, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={[styles.metricIconBubble, { backgroundColor: card.accent + '22' }]}>
                <Text style={styles.metricIcon}>{card.icon}</Text>
            </View>
            <Text style={[styles.metricValue, { color: card.accent }]}>{card.value}</Text>
            <Text style={styles.metricLabel}>{card.label}</Text>
            <View style={[styles.metricAccentBar, { backgroundColor: card.accent }]} />
        </Animated.View>
    );
};

const DashboardScreen = ({ navigation }: DashboardProps) => {
    const headerAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(contentAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.0, y: 0 }}
                end={{ x: 1.0, y: 1 }}
                style={styles.header}
            >
                {/* Decorative blobs */}
                <View style={styles.blobTopRight} />
                <View style={styles.blobBottomLeft} />

                <Animated.View
                    style={[
                        styles.headerInner,
                        {
                            opacity: headerAnim,
                            transform: [
                                {
                                    translateY: headerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-12, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.greeting}>Good morning 👋</Text>
                            <Text style={styles.name}>Jane Doe</Text>
                            <View style={styles.statusPill}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Care plan active</Text>
                            </View>
                        </View>
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatarRing} />
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>JD</Text>
                            </View>
                        </View>
                    </View>

                    {/* Health score banner */}
                    <View style={styles.healthBanner}>
                        <View style={styles.healthScoreBlock}>
                            <Text style={styles.healthScoreNum}>87</Text>
                            <Text style={styles.healthScoreLabel}>Health{'\n'}Score</Text>
                        </View>
                        <View style={styles.healthDivider} />
                        <View style={styles.healthStatsRow}>
                            <View style={styles.healthStat}>
                                <Text style={styles.healthStatVal}>94%</Text>
                                <Text style={styles.healthStatKey}>Adherence</Text>
                            </View>
                            <View style={styles.healthStat}>
                                <Text style={styles.healthStatVal}>4.8</Text>
                                <Text style={styles.healthStatKey}>Nurse Rating</Text>
                            </View>
                            <View style={styles.healthStat}>
                                <Text style={styles.healthStatVal}>12d</Text>
                                <Text style={styles.healthStatKey}>Streak</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            {/* ── Scrollable Content ── */}
            <Animated.View
                style={[
                    { flex: 1 },
                    {
                        opacity: contentAnim,
                        transform: [
                            {
                                translateY: contentAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Metric Cards */}
                    <Text style={styles.sectionLabel}>Overview</Text>
                    <View style={styles.cardGrid}>
                        {metricCards.map((card, i) => (
                            <MetricCard key={card.label} card={card} delay={i * 80} />
                        ))}
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionLabel}>Quick Actions</Text>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity
                            style={[styles.quickActionBtn, { flex: 1.6 }]}
                            activeOpacity={0.8}
                            onPress={() =>
                                navigation
                                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                                    .navigate('Booking')
                            }
                        >
                            <LinearGradient
                                colors={[
                                    Colors.gradientStart,
                                    Colors.gradientMid,
                                    Colors.gradientEnd,
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.quickActionGradient}
                            >
                                <Text style={styles.quickActionIcon}>📅</Text>
                                <Text style={styles.quickActionText}>Book Follow-up</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Next Appointment */}
                    <Text style={styles.sectionLabel}>Next Appointment</Text>
                    <View style={styles.appointmentCard}>
                        <LinearGradient
                            colors={['#00D4A022', '#00B4E811']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.appointmentGradientBg}
                        />
                        <View style={styles.appointmentHeader}>
                            <View style={styles.apptIconWrap}>
                                <Text style={styles.apptIconEmoji}>🏥</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.apptType}>Nursing Visit</Text>
                                <Text style={styles.apptSub}>Wound care · Home visit</Text>
                            </View>
                            <View style={styles.apptBadge}>
                                <Text style={styles.apptBadgeText}>Confirmed</Text>
                            </View>
                        </View>

                        <View style={styles.apptTimeRow}>
                            <View style={styles.apptTimeChip}>
                                <Text style={styles.apptTimeIcon}>📅</Text>
                                <Text style={styles.apptTimeText}>Apr 2, 2026</Text>
                            </View>
                            <View style={styles.apptTimeChip}>
                                <Text style={styles.apptTimeIcon}>⏰</Text>
                                <Text style={styles.apptTimeText}>10:30 AM</Text>
                            </View>
                            <View style={styles.apptTimeChip}>
                                <Text style={styles.apptTimeIcon}>⏱</Text>
                                <Text style={styles.apptTimeText}>~45 min</Text>
                            </View>
                        </View>

                        <View style={styles.apptNurseRow}>
                            <View style={styles.nurseAvatar}>
                                <Text style={styles.nurseAvatarText}>SN</Text>
                            </View>
                            <View>
                                <Text style={styles.nurseName}>Sarah Nguyen, RN</Text>
                                <Text style={styles.nurseRating}>⭐ 4.9 · 127 visits</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.viewDetailsBtn} activeOpacity={0.78}>
                            <LinearGradient
                                colors={[Colors.gradientStart, Colors.gradientEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.viewDetailsBtnInner}
                            >
                                <Text style={styles.viewDetailsBtnText}>View Full Details</Text>
                                <Text style={styles.viewDetailsBtnArrow}>→</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Activity Feed */}
                    <Text style={styles.sectionLabel}>Recent Activity</Text>
                    <View style={styles.activityFeed}>
                        {activityFeed.map((item, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.activityItem,
                                    idx < activityFeed.length - 1 && styles.activityItemBorder,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.activityIconWrap,
                                        { backgroundColor: item.color },
                                    ]}
                                >
                                    <Text style={styles.activityEmoji}>{item.icon}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.activityText}>{item.text}</Text>
                                    <Text style={styles.activityTime}>{item.time}</Text>
                                </View>
                                <View style={[styles.activityDot, { backgroundColor: item.dot }]} />
                            </View>
                        ))}
                    </View>

                    {/* Bottom tip */}
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🏆</Text>
                        <Text style={styles.tipText}>
                            You're on a <Text style={styles.tipHighlight}>12-day streak</Text>! 4
                            nurse visits completed last week. Keep it up!
                        </Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },

    // ── Header ──
    header: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
    },
    headerInner: { gap: 16 },
    blobTopRight: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    blobBottomLeft: {
        position: 'absolute',
        bottom: -30,
        left: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    greeting: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 15,
    },
    name: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginTop: 2,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 8,
        gap: 6,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#AAFFD2',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    avatarWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    // Health banner
    healthBanner: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    healthScoreBlock: { alignItems: 'center', minWidth: 52 },
    healthScoreNum: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 38,
    },
    healthScoreLabel: {
        color: 'rgba(255,255,255,0.80)',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 14,
        marginTop: 2,
    },
    healthDivider: {
        width: 1,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    healthStatsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    healthStat: { alignItems: 'center' },
    healthStatVal: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
    healthStatKey: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 10,
        marginTop: 2,
    },

    // ── Content ──
    content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 0 },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
        marginTop: 20,
    },

    // Metric cards
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        width: CARD_WIDTH,
        borderRadius: 18,
        padding: 16,
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    metricIconBubble: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    metricIcon: { fontSize: 20 },
    metricValue: {
        fontSize: 30,
        fontWeight: '900',
        lineHeight: 32,
    },
    metricLabel: {
        fontSize: 12,
        color: Colors.textMedium,
        marginTop: 4,
        fontWeight: '500',
    },
    metricAccentBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        opacity: 0.5,
    },

    // Appointment card
    appointmentCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        overflow: 'hidden',
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
        gap: 14,
    },
    appointmentGradientBg: {
        ...StyleSheet.absoluteFillObject,
    },
    appointmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    apptIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#E8F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    apptIconEmoji: { fontSize: 22 },
    apptType: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textDark,
    },
    apptSub: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
    apptBadge: {
        backgroundColor: '#E6FFF5',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#00D4A044',
    },
    apptBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#00A07A',
    },
    apptTimeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    apptTimeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F7FA',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        gap: 5,
        flex: 1,
        justifyContent: 'center',
    },
    apptTimeIcon: { fontSize: 12 },
    apptTimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textDark,
    },
    apptNurseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F8FCFF',
        borderRadius: 12,
        padding: 10,
    },
    nurseAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.gradientMid + '30',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nurseAvatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.gradientMid,
    },
    nurseName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textDark,
    },
    nurseRating: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 1,
    },
    viewDetailsBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    viewDetailsBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        gap: 8,
    },
    viewDetailsBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    viewDetailsBtnArrow: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // Quick Actions
    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    quickActionGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        gap: 8,
        flex: 1,
    },
    quickActionIcon: { fontSize: 26 },
    quickActionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },
    quickActionStack: {
        flex: 1,
        gap: 10,
    },
    quickActionSmall: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        gap: 4,
    },
    quickActionSmallIcon: { fontSize: 20 },
    quickActionSmallText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textDark,
    },

    // Activity feed
    activityFeed: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    activityItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F8',
    },
    activityIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityEmoji: { fontSize: 18 },
    activityText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textDark,
    },
    activityTime: {
        fontSize: 11,
        color: Colors.textMuted,
        marginTop: 2,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    // Tip
    tipCard: {
        marginTop: 20,
        backgroundColor: 'rgba(0, 212, 160, 0.10)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 160, 0.20)',
    },
    tipIcon: { fontSize: 22 },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textMedium,
        lineHeight: 20,
    },
    tipHighlight: {
        fontWeight: '700',
        color: '#00A07A',
    },
});

export default DashboardScreen;
