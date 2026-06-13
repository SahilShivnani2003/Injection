import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../../theme/colors';
import { useAlert } from '../../../context/AlertContext';
import { useAuthStore } from '@/store/useAuthStore';
import { vendorAPI } from '../../../service/apis/vendorService';
import { RootStackParamList } from '../../../types/RootStackParamList';
import StepContactBusiness from '../components/Step1ContactBussiness';
import StepLocationServices from '../components/Step2LocationService';
import StepProfessional from '../components/Step3Professional';
import StepBankDocuments from '../components/Step4BankDetails';
import {
    STEPS,
    VendorForm,
    INITIAL_FORM,
    UploadedFile,
    DocumentField,
    INITIAL_DOCUMENTS,
} from '../types/VendorRegistration';
import Icon from 'react-native-vector-icons/MaterialIcons';

type VendorRegisterProps = NativeStackScreenProps<RootStackParamList, 'VendorRegister'>;

const TOTAL_STEPS = STEPS.length; // 4

const VendorRegistrationScreen = ({ navigation }: VendorRegisterProps) => {
    const { setAuth } = useAuthStore();
    const alert = useAlert();

    const [step, setStep] = useState(0); // 0-indexed
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<VendorForm>(INITIAL_FORM);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [documents, setDocuments] =
        useState<Record<DocumentField, string | null>>(INITIAL_DOCUMENTS);

    const scrollRef = useRef<ScrollView>(null);

    // ── Field updater ──────────────────────────────────────────────────────────
    const updateField = (key: keyof VendorForm, value: string | string[]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    // ── Per-step validation ────────────────────────────────────────────────────
    const validateStep = (s: number): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (s === 0) {
            if (!form.name.trim()) {
                alert.error('Validation', 'Contact name is required.');
                return false;
            }
            if (!emailRegex.test(form.email.trim())) {
                alert.error('Validation', 'Please enter a valid email.');
                return false;
            }
            if (form.phone.replace(/[^0-9]/g, '').length !== 10) {
                alert.error('Validation', 'Enter a valid 10-digit phone number.');
                return false;
            }
            if (form.password.length < 6) {
                alert.error('Validation', 'Password must be at least 6 characters.');
                return false;
            }
            if (form.password !== form.confirmPassword) {
                alert.error('Validation', 'Passwords do not match.');
                return false;
            }
            if (!form.businessName.trim()) {
                alert.error('Validation', 'Business name is required.');
                return false;
            }
        }

        if (s === 1) {
            if (!form.address.trim() || !form.city.trim() || !form.state.trim()) {
                alert.error('Validation', 'Address, city, and state are required.');
                return false;
            }
            if (form.pincode.replace(/[^0-9]/g, '').length !== 6) {
                alert.error('Validation', 'Pincode must be 6 digits.');
                return false;
            }
            if (form.services.length === 0) {
                alert.error('Validation', 'Select at least one service offered.');
                return false;
            }
        }

        // Steps 2 (Professional) and 3 (Bank & Docs) are optional — no hard blocks.

        return true;
    };

    // ── Navigation ─────────────────────────────────────────────────────────────
    const goNext = () => {
        if (!validateStep(step)) return;
        if (step < TOTAL_STEPS - 1) {
            setStep(s => s + 1);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const goBack = () => {
        if (step > 0) {
            setStep(s => s - 1);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            navigation.goBack();
        }
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateStep(step)) return;

        const formData = new FormData();

        formData.append('name', form.name.trim());
        formData.append('email', form.email.trim());
        formData.append('password', form.password);
        formData.append('phone', form.phone.trim());
        formData.append('alternatePhone', form.alternatePhone.trim());
        formData.append('businessName', form.businessName.trim());
        formData.append('businessType', form.businessType);
        formData.append('registrationNumber', form.registrationNumber.trim());
        formData.append('gstNumber', form.gstNumber.trim());
        formData.append('address', form.address.trim());
        formData.append('city', form.city.trim());
        formData.append('state', form.state.trim());
        formData.append('pincode', form.pincode.trim());
        formData.append('bio', form.bio.trim());
        formData.append('specialization', form.specialization.trim());
        formData.append('experience', form.experience.trim());
        formData.append('serviceAreas', form.serviceAreas.trim());

        form.services.forEach(service => {
            formData.append('services', service);
        });

        formData.append('bankDetails[bankName]', form.bankName.trim());
        formData.append('bankDetails[accountNumber]', form.accountNumber.trim());
        formData.append('bankDetails[ifscCode]', form.ifscCode.trim());
        formData.append('bankDetails[branch]', form.branch.trim());

        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        Object.entries(documents).forEach(([key, file]) => {
            if (file) {
                formData.append(key, file);
            }
        });

        setLoading(true);
        try {
            const response = await vendorAPI.registerVendor(formData);
            if (response?.data?.success) {
                alert.success(
                    'Welcome Onboard!',
                    response?.data?.message ||
                        'Your vendor account has been created successfully. It will be activated after admin approval.',
                );
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'EmailLogin' }],
                });
            } else {
                alert.error(
                    'Registration Failed',
                    response?.data?.message || 'Unable to register vendor.',
                );
            }
        } catch (error: any) {
            console.error('Vendor registration error:', error);
            alert.error(
                'Registration Failed',
                error?.response?.data?.message || error?.message || 'Unable to register vendor.',
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Render active step ─────────────────────────────────────────────────────
    const renderStep = () => {
        switch (step) {
            case 0:
                return <StepContactBusiness form={form} updateField={updateField} />;
            case 1:
                return <StepLocationServices form={form} updateField={updateField} />;
            case 2:
                return <StepProfessional form={form} updateField={updateField} />;
            case 3:
                return (
                    <StepBankDocuments
                        form={form}
                        updateField={updateField}
                        profileImage={profileImage}
                        setProfileImage={setProfileImage}
                        documents={documents}
                        setDocuments={setDocuments}
                        onImageError={msg => alert.error('Image Error', msg)}
                    />
                );
            default:
                return null;
        }
    };

    const isLastStep = step === TOTAL_STEPS - 1;

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={22} color={Colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Create Account</Text>
                        <Text style={styles.headerSub}>Join our diagnostic network</Text>
                        <Text style={styles.headerSub}>
                            Step {step + 1} of {TOTAL_STEPS} — {STEPS[step].label}
                        </Text>
                    </View>

                    {/* Right spacer — same width as the back button so the
                                    center block is truly centered, not just left-biased. */}
                    <View style={styles.headerSpacer} />
                </View>
            </LinearGradient>
            {/* ── Step indicator ── */}
            // ── Step indicator ──
            <View style={styles.stepBar}>
                {STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                        <React.Fragment key={i}>
                            <View style={styles.stepItem}>
                                <View
                                    style={[
                                        styles.stepDot,
                                        done && styles.stepDotDone,
                                        active && styles.stepDotActive,
                                    ]}
                                >
                                    <Icon
                                        name={done ? 'check' : s.icon}
                                        size={18}
                                        color={done || active ? Colors.white : Colors.textMedium}
                                    />
                                </View>
                                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                                    {s.label}
                                </Text>
                            </View>
                            {i < TOTAL_STEPS - 1 && (
                                <View style={[styles.stepLine, done && styles.stepLineDone]} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
            {/* ── Progress bar ── */}
            <View style={styles.progressTrack}>
                <View
                    style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]}
                />
            </View>
            {/* ── Content ── */}
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>{renderStep()}</View>

                {/* ── Footer buttons ── */}
                <View style={styles.footer}>
                    {step > 0 && (
                        <TouchableOpacity
                            style={styles.prevButton}
                            onPress={goBack}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.prevText}>← Back</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            step === 0 && styles.nextButtonFull,
                            loading && styles.nextButtonDisabled,
                        ]}
                        onPress={isLastStep ? handleSubmit : goNext}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text style={styles.nextText}>
                            {loading
                                ? 'Submitting...'
                                : isLastStep
                                ? 'Submit Registration'
                                : `Next: ${STEPS[step + 1].label} →`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        paddingTop: 24,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.28)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    backText: { color: Colors.textLight, fontSize: 20, fontWeight: '700' },
    headerTitle: { color: Colors.textLight, fontSize: 22, fontWeight: '800' },
    headerSub: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
    },

    // Step indicator
    stepBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.white,
    },
    stepItem: {
        alignItems: 'center',
        minWidth: 56,
    },
    stepDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEF4F8',
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepDotActive: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },
    stepDotDone: {
        backgroundColor: '#2BA84A',
        borderColor: '#2BA84A',
    },
    stepDotText: {
        fontSize: 14,
        color: Colors.textMedium,
    },
    stepDotTextActive: {
        color: Colors.white,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textMedium,
        textAlign: 'center',
    },
    stepLabelActive: {
        color: Colors.gradientStart,
        fontWeight: '700',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#D8E8EE',
        marginBottom: 18,
        marginHorizontal: 4,
    },
    stepLineDone: {
        backgroundColor: '#2BA84A',
    },

    // Progress bar
    progressTrack: {
        height: 3,
        backgroundColor: '#E2ECF2',
    },
    progressFill: {
        height: 3,
        backgroundColor: Colors.gradientStart,
    },

    // Content
    content: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4,
    },

    // Footer navigation
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
        marginBottom: 10,
    },
    prevButton: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: Colors.gradientStart,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prevText: {
        color: Colors.gradientStart,
        fontSize: 15,
        fontWeight: '700',
    },
    nextButton: {
        flex: 2,
        backgroundColor: Colors.gradientStart,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonFull: {
        flex: 1,
    },
    nextButtonDisabled: {
        opacity: 0.7,
    },
    nextText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },
});

export default VendorRegistrationScreen;
