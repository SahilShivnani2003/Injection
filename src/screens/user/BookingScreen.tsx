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
    Alert,
} from 'react-native';
import { Colors, Fonts, Spacing } from '../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import BasicDetailsScreen from './booking/BasicDetailsScreen';
import ChargesScreen from './booking/ChargesScreen';
import ComplimentaryScreen from './booking/ComplimentaryScreen';
import SlotBookingScreen from './booking/SlotBookingScreen';
import RequirementsScreen from './booking/RequirementsScreen';
import { useAuthStore } from '@/store/useAuthStore';
import { bookingAPI } from '@/service/apis/bookingService';
import {
    Booking,
    ComplimentaryService,
    Gender,
    SelectedService,
    StaffPreference,
} from '@/types/booking';

const RADIUS = 32;
const { width, height } = Dimensions.get('window');

/* ─────────────────────── Types ─────────────────────── */

export interface UploadedFile {
    name: string;
    uri: string;
    type: 'image' | 'document';
}

/** All form data collected across all 5 steps */
export interface BookingFormData {
    // Step 1 — Basic Details
    patientName: string;
    age: string;
    sex: string;
    address: string;
    pincode: string;
    currentLocation: string;
    phoneNumber: string;
    email: string;

    // Step 2 — Requirements
    selectedServices: SelectedService[];
    additionalRequirements: string;
    uploadedFile: UploadedFile | null;
    hasInsurance: boolean;
    insurancePolicyNumber: string;

    // Step 3 — Slot
    selectedDate: string | null;
    selectedTime: string | null;
    staffPreference: StaffPreference;

    // Step 5 — Complimentary
    freeComplimentaryService: ComplimentaryService;
}

/* ─────────────────────── Steps config ─────────────────────── */

type IStepType = { id: number; title: string; subtitle: string; icon: string };

const steps: IStepType[] = [
    { id: 1, title: 'Basic Details', subtitle: 'Your information', icon: 'person-outline' },
    {
        id: 2,
        title: 'Select Services',
        subtitle: 'Choose your tests',
        icon: 'checkmark-circle-outline',
    },
    { id: 3, title: 'Select Slots', subtitle: 'Choose date & time', icon: 'calendar-outline' },
    {
        id: 4,
        title: 'Review & Charges',
        subtitle: 'Review & confirm',
        icon: 'checkmark-done-outline',
    },
    {
        id: 5,
        title: 'Confirmation',
        subtitle: 'Your appointment is booked',
        icon: 'checkmark-circle',
    },
];

/* ─────────────────────── Component ─────────────────────── */

type BookingScreenProps = NativeStackScreenProps<RootStackParamList, 'Booking'>;

const BookingScreen = ({ navigation }: BookingScreenProps) => {
    const { user } = useAuthStore();
    const [current, setCurrent] = useState<IStepType>(steps[0]);
    const [submitting, setSubmitting] = useState(false);
    const total = steps.length;

    /* ── Consolidated form state ── */
    const [formData, setFormData] = useState<BookingFormData>({
        // Step 1
        patientName: user?.name ?? '',
        age: user?.age ? String(user.age) : '',
        sex: user?.gender ?? '',
        address: user?.address ?? '',
        pincode: user?.pincode ?? '',
        currentLocation: '',
        phoneNumber: user?.phone ?? '',
        email: user?.email ?? '',
        // Step 2
        selectedServices: [],
        additionalRequirements: '',
        uploadedFile: null,
        hasInsurance: false,
        insurancePolicyNumber: '',
        // Step 3
        selectedDate: null,
        selectedTime: null,
        staffPreference: 'Any Available',
        // Step 5
        freeComplimentaryService: 'None',
    });

    /** Partial updater — merges any subset of BookingFormData */
    const update = (patch: Partial<BookingFormData>) =>
        setFormData(prev => ({ ...prev, ...patch }));

    /* ── Animation refs ── */
    const sheetY = useRef(new Animated.Value(60)).current;
    const sheetOp = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
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
        Animated.timing(progressWidth, {
            toValue: (current.id / total) * 100,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [current.id]);

    /* ── Step validation ── */
    const validateStep = (): boolean => {
        switch (current.id) {
            case 1:
                if (!formData.patientName.trim()) return warn('Please enter patient name.');
                if (!formData.age || isNaN(Number(formData.age)))
                    return warn('Please enter a valid age.');
                if (Number(formData.age) <= 0 || Number(formData.age) > 150)
                    return warn('Please enter a valid age between 1 and 150.');
                if (!formData.sex) return warn('Please select sex.');
                if (!formData.address.trim()) return warn('Please enter address.');
                if (formData.pincode.length !== 6)
                    return warn('Please enter a valid 6-digit pincode.');
                // Email validation if provided
                if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    return warn('Please enter a valid email address.');
                }
                return true;

            case 2:
                if (formData.selectedServices.length === 0)
                    return warn('Please select at least one service.');
                if (formData.hasInsurance && !formData.insurancePolicyNumber.trim())
                    return warn('Please enter your insurance policy number.');
                return true;

            case 3:
                if (!formData.selectedDate) return warn('Please select a preferred date.');
                if (!formData.selectedTime) return warn('Please select a preferred time slot.');
                return true;

            default:
                return true;
        }
    };

    const warn = (msg: string): false => {
        Alert.alert('Required', msg);
        return false;
    };

    /* ── Navigation ── */
    const handleNext = () => {
        if (!validateStep()) return;
        if (current.id === total) {
            handleConfirm();
        } else {
            setCurrent(steps[current.id]); // steps is 0-indexed; current.id == next index
        }
    };

    const handlePrevious = () => {
        if (current.id > 1) setCurrent(steps[current.id - 2]);
    };

    /* ── Submit ── */
    const handleConfirm = async () => {
        try {
            setSubmitting(true);

            const subtotal = formData.selectedServices.reduce(
                (sum, s) => sum + s.price * s.quantity,
                0,
            );
            const gstAmount = Math.round(subtotal * 0.18);
            const grandTotal = subtotal + gstAmount;

            // Validate sex is a valid Gender type
            const validGenders: Gender[] = ['Male', 'Female', 'Other'];
            const gender = validGenders.includes(formData.sex as Gender) 
                ? (formData.sex as Gender) 
                : 'Other';

            const payload: Booking = {
                patientName: formData.patientName.trim(),
                age: parseInt(formData.age, 10),
                sex: gender,
                address: formData.address.trim(),
                pincode: formData.pincode.trim(),
                currentLocation: formData.currentLocation.trim() || formData.address.trim(),
                alternateMobile: formData.phoneNumber || undefined,
                email: formData.email.trim(),

                selectedServices: formData.selectedServices,
                additionalRequirements: formData.additionalRequirements.trim() || undefined,

                // Prescriptions will be uploaded separately if file exists
                prescriptions: [],

                hasInsurance: formData.hasInsurance,
                insurancePolicyNumber: formData.hasInsurance
                    ? formData.insurancePolicyNumber
                    : undefined,

                subtotal,
                gstAmount,
                grandTotal,

                freeComplimentaryService: formData.freeComplimentaryService,
                preferredTimeSlot: `${formData.selectedDate} ${formData.selectedTime}`,
                staffPreference: formData.staffPreference,
                serviceLocation: formData.address.trim(),
                estimatedDuration: 45,

                userId: user?._id ?? '',
                vendorId: null,
                bookingStatus: 'pending',
                reportUrl: null,
            };

            const response = await bookingAPI.createBooking(payload);

            // Handle file upload if exists (would need prescription upload API)
            // if (formData.uploadedFile) {
            //     await prescriptionAPI.upload(response.data.bookingId, formData.uploadedFile);
            // }

            Alert.alert(
                'Booking Confirmed! 🎉',
                `Your appointment on ${formData.selectedDate} at ${formData.selectedTime} has been booked successfully.`,
                [{ text: 'Done', onPress: () => navigation.goBack() }],
            );
        } catch (error: any) {
            console.error('Booking error:', error);
            const errorMessage = error?.response?.data?.message || 
                                 error?.message || 
                                 'Failed to create booking. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Progress bar ── */
    const progressWidthInterpolated = progressWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    /* ── Screen renderer ── */
    const renderStep = () => {
        switch (current.id) {
            case 1:
                return (
                    <BasicDetailsScreen
                        basicDetails={{
                            patientName: formData.patientName,
                            age: formData.age,
                            sex: formData.sex,
                            address: formData.address,
                            pincode: formData.pincode,
                            currentLocation: formData.currentLocation,
                            phoneNumber: formData.phoneNumber,
                            email: formData.email,
                        }}
                        setBasicDetails={(patch: any) =>
                            setFormData(prev => ({ ...prev, ...patch }))
                        }
                    />
                );
            case 2:
                return (
                    <RequirementsScreen
                        selectedServices={formData.selectedServices}
                        setSelectedServices={v => update({ selectedServices: v })}
                        additionalRequirements={formData.additionalRequirements}
                        setAdditionalRequirements={v => update({ additionalRequirements: v })}
                        uploadedFile={formData.uploadedFile}
                        setUploadedFile={v => update({ uploadedFile: v })}
                        hasInsurance={formData.hasInsurance}
                        setHasInsurance={v => update({ hasInsurance: v })}
                        insurancePolicyNumber={formData.insurancePolicyNumber}
                        setInsurancePolicyNumber={v => update({ insurancePolicyNumber: v })}
                    />
                );
            case 3:
                return (
                    <SlotBookingScreen
                        selectedDate={formData.selectedDate}
                        setSelectedDate={v => update({ selectedDate: v })}
                        selectedTime={formData.selectedTime}
                        setSelectedTime={v => update({ selectedTime: v })}
                        staffPreference={formData.staffPreference}
                        setStaffPreference={v => update({ staffPreference: v })}
                    />
                );
            case 4:
                return <ChargesScreen selectedServices={formData.selectedServices} />;
            case 5:
                return (
                    <ComplimentaryScreen
                        freeComplimentaryService={formData.freeComplimentaryService}
                        setFreeComplimentaryService={v => update({ freeComplimentaryService: v })}
                        bookingSummary={{
                            date: formData.selectedDate ?? '',
                            time: formData.selectedTime ?? '',
                            serviceCount: formData.selectedServices.length,
                            patientName: formData.patientName,
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() =>
                                current.id > 1 ? handlePrevious() : navigation.goBack()
                            }
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={22} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Book Appointment</Text>
                        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                            <Ionicons name="help-circle-outline" size={22} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

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

                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <Animated.View
                                style={[styles.progressFill, { width: progressWidthInterpolated }]}
                            />
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            {/* ── Form sheet ── */}
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
                    <View style={styles.sheetHandle} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        {renderStep()}
                    </ScrollView>

                    {/* ── Bottom navigation ── */}
                    <View style={styles.bottomNav}>
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
                                style={[
                                    styles.btnPrimaryContainer,
                                    submitting && styles.btnDisabled,
                                ]}
                                onPress={handleNext}
                                activeOpacity={0.85}
                                disabled={submitting}
                            >
                                <LinearGradient
                                    colors={[Colors.gradientStart, Colors.gradientMid]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.btnPrimary}
                                >
                                    <Text style={styles.btnPrimaryText}>
                                        {submitting
                                            ? 'Booking...'
                                            : current.id === total
                                            ? 'Confirm'
                                            : 'Next'}
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

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F8F8' },

    header: {
        height: height * 0.28,
        paddingTop: Spacing.xxl,
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
    stepTextContainer: { flex: 1 },
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
    stepSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

    progressContainer: { gap: 12 },
    progressTrack: {
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 3 },

    formContainer: { flex: 1, marginTop: -RADIUS },
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
    scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 },

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
    bottomNavContent: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 16,
        gap: 12,
        alignItems: 'center',
    },

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
    btnPrimaryContainer: { flex: 2 },
    btnDisabled: { opacity: 0.6 },
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