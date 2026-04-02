import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ScrollView,
    Easing,
    StatusBar,
} from 'react-native';
import { Colors, Fonts, Spacing } from '../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import BasicDetailsScreen from './booking/BasicDetailsScreen';
import UploadPrescriptionScreen from './booking/UploadPrescriptionScreen';
import InsuranceScreen from './booking/InsuranceScreen';
import ChargesScreen from './booking/ChargesScreen';
import ComplimentaryScreen from './booking/ComplimentaryScreen';
import SlotBookingScreen from './booking/SlotBookingScreen';
import RequirementsScreen from './booking/RequirementsScreen';

const RADIUS = 32;
const { width, height } = Dimensions.get('window');

type IStepType = {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
};

const steps: IStepType[] = [
    { id: 1, title: 'Basic Details', subtitle: 'Your information', icon: 'person-outline' },
    {
        id: 2,
        title: 'Upload Prescription',
        subtitle: 'Upload your prescription',
        icon: 'medical-outline',
    },
    {
        id: 3,
        title: 'Insurance Details',
        subtitle: 'Provide insurance information',
        icon: 'card-outline',
    },
    {
        id: 4,
        title: 'Select Services',
        subtitle: 'Review & book',
        icon: 'checkmark-circle-outline',
    },
    { id: 5, title: 'Select Slots', subtitle: 'Choose date & time', icon: 'calendar-outline' },
    {
        id: 6,
        title: 'Review & Charges',
        subtitle: 'Review & confirm',
        icon: 'checkmark-done-outline',
    },
    {
        id: 7,
        title: 'Complimentary & Confirmation',
        subtitle: 'Your appointment is booked',
        icon: 'checkmark-circle',
    },
];

type BookingScreenProps = NativeStackScreenProps<RootStackParamList, 'Booking'>;

const BookingScreen = ({ navigation }: BookingScreenProps) => {
    const [current, setCurrent] = useState<IStepType>(steps[0]);
    const total = steps.length;

    //Basic Details Data
    const [basicDetails, setBasicDetails] = useState({
        patientName: '',
        age: '',
        sex: '',
        address: '',
        pincode: '',
        currentLocation: '',
        phoneNumber: '',
        email: '',
    });

    // Animation refs
    const sheetY = useRef(new Animated.Value(60)).current;
    const sheetOp = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(sheetY, {
                toValue: 0,
                duration: 580,
                delay: 140,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(sheetOp, {
                toValue: 1,
                duration: 580,
                delay: 140,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        // Animate progress bar
        Animated.timing(progressWidth, {
            toValue: (current.id / total) * 100,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [current.id]);

    const handleNext = () => {
        if (current.id < total) {
            setCurrent(steps[current.id]);
        }
    };

    const handlePrevious = () => {
        if (current.id > 1) {
            setCurrent(steps[current.id - 2]);
        }
    };

    const progressWidthInterpolated = progressWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const renderSteps = () => {
        switch (current.id) {
            case 1:
                return <BasicDetailsScreen basicDetails={basicDetails} setBasicDetails={setBasicDetails} />;
            case 2:
                return <UploadPrescriptionScreen />;
            case 3:
                return <InsuranceScreen />;
            case 4:
                return <RequirementsScreen />;
            case 5:
                return <SlotBookingScreen />;
            case 6:
                return <ChargesScreen />;
            case 7:
                return <ComplimentaryScreen />;
        }
    };
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ── Header with Gradient ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
                    {/* Top bar */}
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={22} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Book Appointment</Text>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                            <Ionicons name="help-circle-outline" size={22} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Step info */}
                    <View style={styles.stepInfoContainer}>
                        <View style={styles.stepIconWrapper}>
                            <Ionicons name={current.icon as any} size={28} color={Colors.white} />
                        </View>
                        <View style={styles.stepTextContainer}>
                            <Text style={styles.stepLabel}>
                                Step {current.id} of {total}
                            </Text>
                            <Text style={styles.stepTitle}>{current.title}</Text>
                            <Text style={styles.stepSubtitle}>{current.subtitle}</Text>
                        </View>
                    </View>

                    {/* Progress bar with segments */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <Animated.View
                                style={[styles.progressFill, { width: progressWidthInterpolated }]}
                            />
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            {/* ── Form Container ── */}
            <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        styles.formSheet,
                        { opacity: sheetOp, transform: [{ translateY: sheetY }] },
                    ]}
                >
                    {/* Sheet handle */}
                    <View style={styles.sheetHandle} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        {renderSteps()}
                    </ScrollView>

                    {/* ── Bottom Navigation ── */}
                    <View style={styles.bottomNav}>
                        <View style={styles.bottomNavGradientBorder} />
                        <View style={styles.bottomNavContent}>
                            {current.id > 1 ? (
                                <TouchableOpacity
                                    style={styles.btnSecondary}
                                    onPress={handlePrevious}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons
                                        name="arrow-back"
                                        size={20}
                                        color={Colors.gradientMid}
                                    />
                                    <Text style={styles.btnSecondaryText}>Previous</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ flex: 1 }} />
                            )}

                            <TouchableOpacity
                                style={styles.btnPrimaryContainer}
                                onPress={handleNext}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={[Colors.gradientStart, Colors.gradientMid]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.btnPrimary}
                                >
                                    <Text style={styles.btnPrimaryText}>
                                        {current.id === total ? 'Confirm' : 'Next'}
                                    </Text>
                                    <Ionicons
                                        name={
                                            current.id === total
                                                ? 'checkmark-circle'
                                                : 'arrow-forward'
                                        }
                                        size={20}
                                        color={Colors.white}
                                    />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8F8',
    },

    // ── Header Styles ──
    header: {
        height: height * 0.28,
        paddingTop: Spacing.xxl,
        position: 'relative',
        overflow: 'hidden',
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
        justifyContent: 'space-between',
        marginBottom: Spacing.xxxl,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    iconBtn: {
        padding: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        height: 44,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Fonts.sizes.xxxl,
        color: Colors.white,
        fontWeight: '800',
        letterSpacing: -0.5,
    },

    // ── Step Info ──
    stepInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        gap: 14,
    },
    stepIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    stepTextContainer: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    stepTitle: {
        fontSize: 22,
        color: Colors.white,
        fontWeight: '800',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    stepSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
    },

    // ── Progress Bar ──
    progressContainer: {
        gap: 12,
    },
    progressTrack: {
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.white,
        borderRadius: 3,
    },

    // ── Form Container ──
    formContainer: {
        flex: 1,
        marginTop: -RADIUS,
    },
    formSheet: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 16,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 120,
    },

    // ── Placeholder Content ──
    placeholderContent: {
        gap: 16,
    },
    placeholderIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: `${Colors.gradientStart}15`,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: `${Colors.gradientStart}30`,
    },
    placeholderTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textDark,
        textAlign: 'center',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    placeholderText: {
        fontSize: 15,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },

    // ── Demo Cards ──
    demoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 14,
    },
    demoCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${Colors.gradientStart}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    demoCardContent: {
        flex: 1,
    },
    demoCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 2,
    },
    demoCardSubtitle: {
        fontSize: 13,
        color: Colors.textMuted,
    },

    // ── Bottom Navigation ──
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    bottomNavGradientBorder: {
        height: 3,
        width: '100%',
    },
    bottomNavContent: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 16,
        gap: 12,
        alignItems: 'center',
    },

    // ── Buttons ──
    btnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: `${Colors.gradientMid}15`,
        borderWidth: 1.5,
        borderColor: `${Colors.gradientMid}30`,
        gap: 8,
    },
    btnSecondaryText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.gradientMid,
        letterSpacing: 0.2,
    },
    btnPrimaryContainer: {
        flex: 2,
    },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnPrimaryText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
});

export default BookingScreen;
