import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Loader from '@/components/Loader';
import { FieldInput } from '@/components/FieldInput';
import OtpVerificationModal from '../models/OtpVerificationModal';
import { useAlert } from '@/context/AlertContext';
import { userApi } from '@/service/apis/userService';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { RegisterForm } from '../types/RegisterForm';
import { useAuthStore } from '@/store/useAuthStore';
import { ISendOtp, OtpService } from '@/service/apis/otpService';
import { getCurrentCoordinates, LocationPermissionDeniedError } from '@/utils/deviceLocation';
import { addressToCoordinates, coordinatesToAddress } from '@/utils/geocoding';
import { getCitiesByState, getStates } from '@/utils/location';
import { DropdownSelect } from '@/components/DropdownSelect';

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

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

type FieldErrors = Partial<Record<keyof RegisterForm, string>>;

// ── Inline error row ─────────────────────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <View style={errorStyles.row}>
            <Icon name="error-outline" size={12} color="#E53935" />
            <Text style={errorStyles.text}>{message}</Text>
        </View>
    );
};

// ── Card section wrapper ─────────────────────────────────────────────────────
const SectionCard = ({
    icon,
    title,
    children,
}: {
    icon: string;
    title: string;
    children: React.ReactNode;
}) => (
    <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
                <Icon name={icon} size={16} color={Colors.gradientStart} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const RegisterScreen = ({ navigation }: RegisterProps) => {
    const alert = useAlert();
    const { setAuth } = useAuthStore();
    const [locating, setLocating] = useState(false);

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
        city: '', // new
        state: '',
        latitude: 0,
        longitude: 0,
    });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ── Phone verification state ─────────────────────────────────────────────
    const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);

    const setError = (key: keyof RegisterForm, msg: string) =>
        setErrors(prev => ({ ...prev, [key]: msg }));

    const clearError = (key: keyof RegisterForm) =>
        setErrors(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

    // ── Change handlers ──────────────────────────────────────────────────────
    const handleChange = (key: keyof RegisterForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (value.trim()) clearError(key);

        // Live confirm-password match check
        if (key === 'confirmPassword') {
            value === form.password
                ? clearError('confirmPassword')
                : setError('confirmPassword', 'Passwords do not match.');
        }
        if (key === 'password' && form.confirmPassword) {
            value === form.confirmPassword
                ? clearError('confirmPassword')
                : setError('confirmPassword', 'Passwords do not match.');
        }
    };

    const handlePhoneChange = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        setForm(prev => ({ ...prev, phone: digits }));
        if (digits.trim()) clearError('phone');
        // Editing the number invalidates any prior verification
        if (isPhoneVerified) setIsPhoneVerified(false);
    };

    // ── Eye toggle icon helper ───────────────────────────────────────────────
    const EyeIcon = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Icon
                name={visible ? 'visibility-off' : 'visibility'}
                size={20}
                color={Colors.textMedium}
            />
        </TouchableOpacity>
    );

    // ── Use current location ──────────────────────────────────────────────────
    const handleUseCurrentLocation = async () => {
        setLocating(true);
        try {
            const coords = await getCurrentCoordinates();
            if (!coords) {
                alert.error('Location Error', 'Could not determine your co-ordinates.');
                return;
            }

            setForm({ ...form, latitude: coords?.latitude, longitude: coords?.longitude });
            const geocoded = await coordinatesToAddress(coords);

            if (!geocoded) {
                alert.error(
                    'Location Error',
                    'Could not determine your address from your location. Please enter it manually.',
                );
                return;
            }

            if (geocoded.addressLine) {
                setForm(prev => ({ ...prev, address: geocoded.addressLine }));
                clearError('address');
            }
            if (geocoded.state) {
                setForm(prev => ({ ...prev, state: geocoded.state, city: '' })); // reset city on state change
            }
            if (geocoded.city) {
                setForm(prev => ({ ...prev, city: geocoded.city }));
            }
            if (geocoded.pincode) {
                setForm(prev => ({ ...prev, pincode: geocoded.pincode }));
                clearError('pincode');
            }

            alert.success('Location Found', 'Address fields have been auto-filled.');
        } catch (error) {
            if (error instanceof LocationPermissionDeniedError) {
                alert.error(
                    'Permission Denied',
                    'Location access is needed to auto-fill your address. You can still enter it manually.',
                );
            } else {
                console.error('Error getting current location:', error);
                alert.error('Location Error', 'Unable to fetch your current location.');
            }
        } finally {
            setLocating(false);
        }
    };

    // ── State search ──────────────────────────────────────────────────────────
    const searchStates = useCallback(async (query: string) => {
        const states = await getStates(query || 'a');
        return states.map(s => ({ label: s.name, value: s.name }));
    }, []);

    // ── City search — depends on selected state ─────────────────────────────
    const searchCities = useCallback(
        async (query: string) => {
            if (!form.state) return [];
            const cities = await getCitiesByState(query || form.state, form.state);
            return cities.map(c => ({ label: c.name, value: c.name }));
        },
        [form.state],
    );

    const handleStateChange = (stateName: string) => {
        setForm(prev => ({ ...prev, state: stateName, city: '' })); // reset dependent city
    };

    // ── OTP modal callbacks ──────────────────────────────────────────────────
    const sendOtpRequest = async (phone: string): Promise<boolean> => {
        try {
            const data: ISendOtp= {
                phone: phone,
                type: 'user',
                isForgotPassword: false
            }
            const response = await OtpService.sendOtp(data);
            return !!response.data?.success;
        } catch (error) {
            return false;
        }
    };

    const verifyOtpRequest = async (phone: string, otp: string): Promise<boolean> => {
        try {
            const response = await OtpService.verifyOtp({ phone, otp });
            return !!response.data?.success;
        } catch (error) {
            return false;
        }
    };

    const handleOtpVerified = () => {
        setIsPhoneVerified(true);
        setOtpModalVisible(false);
        alert.success('Phone Verified', 'Your mobile number has been verified.');
    };

    // ── Full-form validation (on submit) ─────────────────────────────────────
    const validate = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.name.trim()) {
            setError('name', 'Full name is required.');
            alert.error('Validation Error', 'Full name is required.');
            return false;
        }
        if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
            setError('email', 'Please enter a valid email address.');
            alert.error('Validation Error', 'Please enter a valid email address.');
            return false;
        }
        if (form.phone.length !== 10) {
            setError('phone', 'Mobile number must be 10 digits.');
            alert.error('Validation Error', 'Mobile number must be 10 digits.');
            return false;
        }
        if (!isPhoneVerified) {
            alert.error('Verification Required', 'Please verify your mobile number.');
            return false;
        }
        if (!form.age || form.age < 1 || form.age > 120) {
            setError('age', 'Enter a valid age (1–120).');
            alert.error('Validation Error', 'Please enter a valid age (1–120).');
            return false;
        }
        if (!form.address.trim()) {
            setError('address', 'Address is required.');
            alert.error('Validation Error', 'Address is required.');
            return false;
        }
        if (!form.state.trim()) {
            setError('state', 'State is required.');
            alert.error('Validation Error', 'Please select your state.');
            return false;
        }
        if (!form.city.trim()) {
            setError('city', 'City is required.');
            alert.error('Validation Error', 'Please select your city.');
            return false;
        }
        if (form.pincode.length !== 6) {
            setError('pincode', 'Pincode must be 6 digits.');
            alert.error('Validation Error', 'Pincode must be 6 digits.');
            return false;
        }
        if (form.password.length < 6) {
            setError('password', 'Password must be at least 6 characters.');
            alert.error('Validation Error', 'Password must be at least 6 characters.');
            return false;
        }
        if (form.password !== form.confirmPassword) {
            setError('confirmPassword', 'Passwords do not match.');
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

        if (form.latitude == 0 && form.longitude == 0) {
            const addressToConvert = `${form.address}, ${form.city}, ${form.state}, ${form.pincode}`;
            const coords = await addressToCoordinates(addressToConvert);

            if (!coords) {
                console.error('Coords not found');
            }

            setForm({
                ...form,
                longitude: coords?.coordinates?.longitude ?? 0,
                latitude: coords?.coordinates?.latitude ?? 0,
            });
        }
        setLoading(true);
        try {
            const data: RegisterForm = {
                name: form.name,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                phone: form.phone,
                gender: form.gender,
                age: form.age,
                address: form.address,
                pincode: form.pincode,
                role: form.role,
                city: form.city, // new
                state: form.state,
                longitude: form.longitude,
                latitude: form.latitude,
            };
            const response = await userApi.register(data);

            if (response.data.success) {
                setAuth(response.data?.data?.user, 'patient', response.data?.data?.token);
                alert.success(
                    'Registration Successful',
                    'Your account has been created',
                );
                navigation.navigate('UserTab', { screen: 'Dashboard' });
            } else {
                alert.error('Registration Failed', 'Unable to create account. Please try again.');
            }
        } catch (error: any) {
            console.error('failed to register : ', error);
            alert.error(
                'Registration Failed',
                error?.message ||
                    'An error occurred while creating your account. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    const canOpenOtpModal = form.phone.length === 10;

    return (
        <View style={styles.root}>
            {/* ── Gradient Header ─────────────────────────────────────────── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                {/* Decorative depth circles */}
                <View style={styles.headerCircleLarge} pointerEvents="none" />
                <View style={styles.headerCircleSmall} pointerEvents="none" />

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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Personal Information ─────────────────────────────────── */}
                    <SectionCard icon="badge" title="Personal Information">
                        <FieldInput
                            label="Full Name"
                            value={form.name}
                            onChangeText={value => handleChange('name', value)}
                            placeholder="Enter your full name"
                            required
                        />
                        <FieldError message={errors.name} />

                        <FieldInput
                            label="Email Address"
                            value={form.email}
                            onChangeText={value => handleChange('email', value)}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            required
                        />
                        <FieldError message={errors.email} />

                        {/* ── Mobile Number + OTP verification ─────────────────── */}
                        <FieldInput
                            label="Mobile Number"
                            value={form.phone}
                            onChangeText={handlePhoneChange}
                            placeholder="10-digit mobile number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            required
                            editable={!isPhoneVerified}
                            rightIcon={
                                isPhoneVerified ? (
                                    <TouchableOpacity
                                        onPress={() => setIsPhoneVerified(false)}
                                        activeOpacity={0.7}
                                        style={styles.verifiedBadge}
                                    >
                                        <Icon name="verified" size={13} color="#1B8E5A" />
                                        <Text style={styles.verifiedBadgeText}>Verified</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => setOtpModalVisible(true)}
                                        disabled={!canOpenOtpModal}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.verifyLink,
                                                !canOpenOtpModal && styles.verifyLinkDisabled,
                                            ]}
                                        >
                                            Verify
                                        </Text>
                                    </TouchableOpacity>
                                )
                            }
                        />
                        <FieldError message={errors.phone} />

                        {/* ── Gender ─────────────────────────────────────────────── */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>
                                Gender<Text style={styles.required}> *</Text>
                            </Text>
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
                                                form.gender === gender.key &&
                                                    styles.genderLabelActive,
                                            ]}
                                        >
                                            {gender.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* ── Address ───────────────────────────────────────────── */}
                        <View style={styles.addressHeaderRow}>
                            <TouchableOpacity
                                style={[styles.locationBtn, locating && styles.locationBtnDisabled]}
                                onPress={handleUseCurrentLocation}
                                activeOpacity={0.75}
                                disabled={locating}
                            >
                                {locating ? (
                                    <ActivityIndicator size="small" color={Colors.gradientStart} />
                                ) : (
                                    <Icon
                                        name="my-location"
                                        size={14}
                                        color={Colors.gradientStart}
                                    />
                                )}
                                <Text style={styles.locationBtnText}>
                                    {locating ? 'Locating...' : 'Use current location'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <FieldInput
                            label="Address"
                            value={form.address}
                            onChangeText={value => handleChange('address', value)}
                            placeholder="Enter your full address"
                            required
                            multiline
                        />
                        <FieldError message={errors.address} />

                        <DropdownSelect
                            label="State"
                            placeholder="Select state"
                            value={form.state}
                            onChange={handleStateChange}
                            onSearch={searchStates}
                            searchable
                            required
                            emptyText="No matching states."
                            errorText={errors.state}
                        />

                        <DropdownSelect
                            label="City"
                            placeholder="Select city"
                            value={form.city}
                            onChange={v => {
                                setForm(prev => ({ ...prev, city: v }));
                                clearError('city');
                            }}
                            onSearch={searchCities}
                            searchable
                            required
                            disabled={!form.state}
                            disabledHint="Select a state first"
                            emptyText="No matching cities."
                            errorText={errors.city}
                        />

                        {/* ── Age + Pincode in one row to reduce scrolling ─────── */}
                        <View style={styles.rowGroup}>
                            <View style={styles.halfGroup}>
                                <FieldInput
                                    label="Age"
                                    value={form.age > 0 ? form.age.toString() : ''}
                                    onChangeText={value => {
                                        const num = value.replace(/[^0-9]/g, '');
                                        setForm(prev => ({
                                            ...prev,
                                            age: num ? parseInt(num, 10) : 0,
                                        }));
                                        if (num) clearError('age');
                                    }}
                                    placeholder="Age"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    required
                                />
                                <FieldError message={errors.age} />
                            </View>

                            <View style={styles.halfGroup}>
                                <FieldInput
                                    label="Pincode"
                                    value={form.pincode}
                                    onChangeText={value =>
                                        handleChange('pincode', value.replace(/[^0-9]/g, ''))
                                    }
                                    placeholder="6-digit"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    required
                                />
                                <FieldError message={errors.pincode} />
                            </View>
                        </View>
                    </SectionCard>

                    {/* ── Account Security ─────────────────────────────────────── */}
                    <SectionCard icon="lock" title="Account Security">
                        <FieldInput
                            label="Password"
                            value={form.password}
                            onChangeText={value => handleChange('password', value)}
                            placeholder="Min 6 chars"
                            required
                            rightIcon={
                                <EyeIcon
                                    visible={showPassword}
                                    onToggle={() => setShowPassword(v => !v)}
                                />
                            }
                            secureTextEntry={!showPassword}
                        />
                        <FieldError message={errors.password} />

                        <FieldInput
                            label="Confirm Password"
                            value={form.confirmPassword}
                            onChangeText={value => handleChange('confirmPassword', value)}
                            placeholder="Repeat password"
                            required
                            rightIcon={
                                <EyeIcon
                                    visible={showConfirmPassword}
                                    onToggle={() => setShowConfirmPassword(v => !v)}
                                />
                            }
                            secureTextEntry={!showConfirmPassword}
                        />
                        {form.confirmPassword.length > 0 && (
                            <View style={styles.matchRow}>
                                <Icon
                                    name={
                                        form.confirmPassword === form.password
                                            ? 'check-circle'
                                            : 'cancel'
                                    }
                                    size={14}
                                    color={
                                        form.confirmPassword === form.password
                                            ? '#43A047'
                                            : '#E53935'
                                    }
                                />
                                <Text
                                    style={[
                                        styles.matchText,
                                        {
                                            color:
                                                form.confirmPassword === form.password
                                                    ? '#43A047'
                                                    : '#E53935',
                                        },
                                    ]}
                                >
                                    {form.confirmPassword === form.password
                                        ? 'Passwords match'
                                        : 'Passwords do not match'}
                                </Text>
                            </View>
                        )}
                        <FieldError message={errors.confirmPassword} />
                    </SectionCard>

                    {/* ── Terms and Conditions ─────────────────────────────────── */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {agreed && <Icon name="check" size={13} color={Colors.white} />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>{' '}
                            and <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* ── Register Button ──────────────────────────────────────── */}
                    <TouchableOpacity
                        style={[
                            styles.registerBtn,
                            (loading || !agreed) && styles.registerBtnDisabled,
                        ]}
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
            </KeyboardAvoidingView>

            {/* ── Reusable OTP verification modal ──────────────────────────── */}
            <OtpVerificationModal
                visible={otpModalVisible}
                destination={form.phone}
                subjectLabel="mobile number"
                onClose={() => setOtpModalVisible(false)}
                onVerified={handleOtpVerified}
                onSendOtp={sendOtpRequest}
                onVerifyOtp={verifyOtpRequest}
            />
        </View>
    );
};

const errorStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -10, marginBottom: 8 },
    text: { fontSize: 11, color: '#E53935', fontWeight: '500' },
});

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F7FA' },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 16,
        paddingBottom: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
    },
    headerCircleLarge: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -60,
        right: -40,
    },
    headerCircleSmall: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.07)',
        bottom: -30,
        left: -20,
    },
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
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // ── Section cards ──────────────────────────────────────────────────────
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#0B2B33',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EDF6FB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },

    // ── User Type (unused in current layout, kept for future use) ──────────
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
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    required: { color: Colors.gradientStart },

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
        backgroundColor: '#F8FBFC',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
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

    // ── Phone verification ────────────────────────────────────────────────
    verifyLink: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.gradientStart,
    },
    verifyLinkDisabled: {
        color: Colors.textMuted,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#E6F7EE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    verifiedBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1B8E5A',
    },

    addressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#EDF6FB',
        borderWidth: 1,
        borderColor: '#D8E8EE',
    },
    locationBtnDisabled: { opacity: 0.7 },
    locationBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gradientStart,
    },
    // ── Password match indicator ──────────────────────────────────────────
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: -10,
        marginBottom: 8,
    },
    matchText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Checkbox ───────────────────────────────────────────────────────────
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
    },
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
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 3,
    },
    registerBtnDisabled: {
        backgroundColor: Colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    registerBtnText: { color: Colors.white, fontSize: 18, fontWeight: '700' },

    loginLink: { alignItems: 'center', marginTop: 20 },
    loginText: { fontSize: 14, color: Colors.textMedium },
    loginLinkText: { color: Colors.gradientStart, fontWeight: '600' },
});

export default RegisterScreen;
