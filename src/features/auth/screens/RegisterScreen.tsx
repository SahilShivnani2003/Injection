import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Loader from '@/components/Loader';
import { useAlert } from '@/context/AlertContext';
import { userApi } from '@/service/apis/userService';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { RegisterForm } from '../types/RegisterForm';

// FIX 1: `Gender` type was used in GENDER_DATA but never defined in the file.
type Gender = 'Male' | 'Female' | 'Other';

type GenderData = {
    key: Gender;
    label: string;
    icon: string; // MaterialIcons icon name
};

// FIX 2: Replaced emoji strings with MaterialIcons names.
const GENDER_DATA: GenderData[] = [
    { key: 'Male', label: 'Male', icon: 'male' },
    { key: 'Female', label: 'Female', icon: 'female' },
    { key: 'Other', label: 'Other', icon: 'transgender' },
];

type UserTypeData = {
    key: 'patient' | 'labpartner' | 'staff';
    label: string;
    icon: string; // MaterialIcons icon name
    desc: string;
};

// FIX 2 continued: Replaced emoji strings with MaterialIcons names.
const USER_TYPES: UserTypeData[] = [
    { key: 'patient', label: 'Patient', icon: 'person', desc: 'Book tests & view reports' },
    {
        key: 'labpartner',
        label: 'Lab Partner',
        icon: 'local-hospital',
        desc: 'Manage lab operations',
    },
    { key: 'staff', label: 'Staff', icon: 'medical-services', desc: 'Phlebotomist services' },
];

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterProps) => {
    const alert = useAlert();
    const {setAuth} = useAuthStore();
    const [userType, setUserType] = useState<'patient' | 'labpartner' | 'staff'>('patient');

    // FIX 3: Form now typed as RegisterForm (from the provided interface) instead
    const [form, setForm] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: 'Male',
        age: 0,
        address: '',
        pincode: '',
        role: 'user',
    });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    // ── Field-level validation ──────────────────────────────────────────────
    const validate = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.name.trim()) {
            alert.error('Validation Error', 'Full name is required.');
            return false;
        }
        if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
            alert.error('Validation Error', 'Please enter a valid email address.');
            return false;
        }
        if (form.phone.length !== 10) {
            alert.error('Validation Error', 'Mobile number must be 10 digits.');
            return false;
        }
        if (!form.age || form.age < 1 || form.age > 120) {
            alert.error('Validation Error', 'Please enter a valid age (1–120).');
            return false;
        }
        if (!form.address.trim()) {
            alert.error('Validation Error', 'Address is required.');
            return false;
        }
        if (form.pincode.length !== 6) {
            alert.error('Validation Error', 'Pincode must be 6 digits.');
            return false;
        }
        if (form.password.length < 6) {
            alert.error('Validation Error', 'Password must be at least 6 characters.');
            return false;
        }
        if (form.password !== form.confirmPassword) {
            alert.error('Validation Error', 'Passwords do not match.');
            return false;
        }
        if (!agreed) {
            alert.error('Terms Required', 'Please accept the Terms & Conditions.');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const { confirmPassword, ...payload } = form;
            const response = await userApi.register(payload);

            if (response.data.success) {
                setAuth(response.data?.user, response.data?.token);
                alert.success(
                    'Registration Successful',
                    'Your account has been created. Please login.',
                );
                navigation.navigate('UserTab', { screen: 'Dashboard' });
            } else {
                alert.error('Registration Failed', 'Unable to create account. Please try again.');
            }
        } catch (error) {
            alert.error(
                'Registration Failed',
                'An error occurred while creating your account. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            {/* ── Gradient Header ─────────────────────────────────────────── */}
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
                    </View>

                    {/* Right spacer — same width as the back button so the
                        center block is truly centered, not just left-biased. */}
                    <View style={styles.headerSpacer} />
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Personal Information ─────────────────────────────────── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={value => setForm({ ...form, name: value })}
                            placeholder="Enter your full name"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={form.email}
                            onChangeText={value => setForm({ ...form, email: value })}
                            placeholder="Enter your email"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            value={form.phone}
                            onChangeText={value =>
                                setForm({ ...form, phone: value.replace(/[^0-9]/g, '') })
                            }
                            placeholder="10-digit mobile number"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>

                    {/* ── Gender ─────────────────────────────────────────────── */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.genderRow}>
                            {GENDER_DATA.map(gender => (
                                <TouchableOpacity
                                    key={gender.key}
                                    style={[
                                        styles.genderOption,
                                        form.gender === gender.key && styles.genderOptionActive,
                                    ]}
                                    onPress={() => setForm({ ...form, gender: gender.key })}
                                    activeOpacity={0.7}
                                >
                                    {/* FIX 2 continued: Vector icons replace gender emojis */}
                                    <Icon
                                        name={gender.icon}
                                        size={22}
                                        color={
                                            form.gender === gender.key
                                                ? Colors.gradientStart
                                                : Colors.textMuted
                                        }
                                        style={styles.genderIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.genderLabel,
                                            form.gender === gender.key && styles.genderLabelActive,
                                        ]}
                                    >
                                        {gender.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Age + Pincode in one row to reduce scrolling ─────── */}
                    <View style={styles.rowGroup}>
                        <View style={[styles.inputGroup, styles.halfGroup]}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={form.age > 0 ? form.age.toString() : ''}
                                onChangeText={value => {
                                    const num = value.replace(/[^0-9]/g, '');
                                    setForm({ ...form, age: num ? parseInt(num, 10) : 0 });
                                }}
                                placeholder="Age"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfGroup]}>
                            <Text style={styles.inputLabel}>Pincode</Text>
                            <TextInput
                                style={styles.input}
                                value={form.pincode}
                                onChangeText={value =>
                                    setForm({ ...form, pincode: value.replace(/[^0-9]/g, '') })
                                }
                                placeholder="6-digit"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>
                    </View>

                    {/* ── Address ───────────────────────────────────────────── */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={form.address}
                            onChangeText={value => setForm({ ...form, address: value })}
                            placeholder="Enter your full address"
                            placeholderTextColor={Colors.textMuted}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* ── Password + Confirm in one row to reduce scrolling ─── */}
                    <View style={styles.passwordGroup}>
                        <View style={[styles.inputGroup, styles.halfGroup]}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={styles.input}
                                value={form.password}
                                onChangeText={value => setForm({ ...form, password: value })}
                                placeholder="Min 6 chars"
                                placeholderTextColor={Colors.textMuted}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfGroup]}>
                            <Text style={styles.inputLabel}>Confirm</Text>
                            <TextInput
                                style={styles.input}
                                value={form.confirmPassword}
                                onChangeText={value => setForm({ ...form, confirmPassword: value })}
                                placeholder="Repeat"
                                placeholderTextColor={Colors.textMuted}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                {/* ── Terms and Conditions ─────────────────────────────────── */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {/* FIX 2 continued: Vector icon replaces ✓ text */}
                            {agreed && <Icon name="check" size={13} color={Colors.white} />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>{' '}
                            and <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Register Button ──────────────────────────────────────── */}
                <TouchableOpacity
                    style={[styles.registerBtn, (loading || !agreed) && styles.registerBtnDisabled]}
                    onPress={handleRegister}
                    disabled={loading || !agreed}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <Loader type="dots" size="small" color={Colors.white} />
                    ) : (
                        <Text style={styles.registerBtnText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* ── Login Link ───────────────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text style={styles.loginLinkText}>Login here</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FCFF' },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 16,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    // 3-column row: [backBtn 40px] | [headerCenter flex:1] | [headerSpacer 40px]
    // Equal flanks guarantee the center block is always optically centered.
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    // Mirrors backBtn width so headerCenter is truly centered
    headerSpacer: {
        width: 40,
    },
    headerTitle: {
        color: Colors.textLight,
        fontSize: 24,
        fontWeight: '700',
    },
    headerSub: {
        color: Colors.textLight,
        fontSize: 14,
        opacity: 0.9,
        marginTop: 4,
    },
    content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },

    // ── User Type ──────────────────────────────────────────────────────────
    userTypeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    userTypeCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: '#E8F0F4',
    },
    userTypeCardActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
    },
    userTypeIcon: { marginBottom: 8 },
    userTypeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 4,
    },
    userTypeLabelActive: { color: Colors.gradientStart },
    userTypeDesc: {
        fontSize: 11,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 14,
    },
    userTypeDescActive: { color: Colors.gradientStart },

    // ── Form Inputs ────────────────────────────────────────────────────────
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 6 },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        color: Colors.textDark,
    },
    textArea: { height: 80, textAlignVertical: 'top' },

    passowrdGroup : {
        flexDirection: 'column',
        gap: 12,
    },
    // REDUCE SCROLL: Row layout for paired short fields.
    rowGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    halfGroup: { flex: 1 },

    // ── Gender ─────────────────────────────────────────────────────────────
    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    genderOption: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    genderOptionActive: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#E6FAF5',
    },
    genderIcon: { marginBottom: 4 },
    genderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textMedium,
    },
    genderLabelActive: { color: Colors.gradientStart },

    // ── Checkbox ───────────────────────────────────────────────────────────
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start' },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        marginRight: 12,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxChecked: { backgroundColor: Colors.gradientStart, borderColor: Colors.gradientStart },
    checkboxText: { flex: 1, fontSize: 14, color: Colors.textMedium, lineHeight: 20 },
    linkText: { color: Colors.gradientStart, textDecorationLine: 'underline' },

    // ── Buttons ────────────────────────────────────────────────────────────
    registerBtn: {
        backgroundColor: Colors.gradientStart,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    registerBtnDisabled: { backgroundColor: Colors.textMuted },
    // FIX 8: Renamed from `registerText` (conflicted with loginText semantics)
    //         to `registerBtnText` for clarity.
    registerBtnText: { color: Colors.white, fontSize: 18, fontWeight: '700' },

    loginLink: { alignItems: 'center', marginTop: 20 },
    loginText: { fontSize: 14, color: Colors.textMedium },
    loginLinkText: { color: Colors.gradientStart, fontWeight: '600' },
});

export default RegisterScreen;
