import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Loader from '../../components/Loader';
import { userApi } from '../../service/apis/userService';
import { useAlert } from '../../context/AlertContext';
import { CreateUser, Gender } from '@/types/user';

type GenderData = {
    key: Gender;
    label: string;
    icon: string;
};

const GENDER_DATA: GenderData[] = [
    { key: 'Male', label: 'Male', icon: '👨' },
    { key: 'Female', label: 'Female', icon: '👩' },
    { key: 'Other', label: 'Other', icon: '🧑' },
];
type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterProps) => {
    const alert = useAlert();
    const [userType, setUserType] = useState<'patient' | 'labpartner' | 'staff'>('patient');
    const [form, setForm] = useState<CreateUser>({
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

    const handleRegister = async () => {
        if (form.password !== form.confirmPassword) {
            alert.error('Validation Error ', 'Password must be same.');
            return;
        }

        setLoading(true);

        try {
            const userData: CreateUser = {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                gender: form.gender,
                age: form.age,
                address: form.address,
                pincode: form.pincode,
                role: form.role,
            };

            console.log('User registration data:', userData);

            const respoonse = await userApi.register(userData);
            console.log('API response:', respoonse);

            if (respoonse.data.success) {
                alert.success(
                    'Registration Successful',
                    'Your account has been created successfully! Please login.',
                );
                navigation.navigate('Login');
                return;
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert.error(
                'Registration Failed',
                'An error occurred while creating your account. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Account</Text>
                <Text style={styles.headerSub}>Join our diagnostic network</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>I am registering as</Text>
                    <View style={styles.userTypeRow}>
                        {[
                            {
                                key: 'patient',
                                label: 'Patient',
                                icon: '👤',
                                desc: 'Book tests & view reports',
                            },
                            {
                                key: 'labpartner',
                                label: 'Lab Partner',
                                icon: '🏥',
                                desc: 'Manage lab operations',
                            },
                            {
                                key: 'staff',
                                label: 'Staff',
                                icon: '👨‍⚕️',
                                desc: 'Phlebotomist services',
                            },
                        ].map(type => (
                            <TouchableOpacity
                                key={type.key}
                                style={[
                                    styles.userTypeCard,
                                    userType === type.key && styles.userTypeCardActive,
                                ]}
                                onPress={() => setUserType(type.key as any)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.userTypeIcon}>{type.icon}</Text>
                                <Text
                                    style={[
                                        styles.userTypeLabel,
                                        userType === type.key && styles.userTypeLabelActive,
                                    ]}
                                >
                                    {type.label}
                                </Text>
                                <Text
                                    style={[
                                        styles.userTypeDesc,
                                        userType === type.key && styles.userTypeDescActive,
                                    ]}
                                >
                                    {type.desc}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Registration Form */}
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
                                    <Text style={styles.genderIcon}>{gender.icon}</Text>
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput
                            style={styles.input}
                            value={form.age.toString()}
                            onChangeText={value => {
                                const numValue = value.replace(/[^0-9]/g, '');
                                setForm({ ...form, age: numValue ? parseInt(numValue) : 0 });
                            }}
                            placeholder="Enter your age"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>

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

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Pincode</Text>
                        <TextInput
                            style={styles.input}
                            value={form.pincode}
                            onChangeText={value =>
                                setForm({ ...form, pincode: value.replace(/[^0-9]/g, '') })
                            }
                            placeholder="6-digit pincode"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="numeric"
                            maxLength={6}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={form.password}
                            onChangeText={value => setForm({ ...form, password: value })}
                            placeholder="Create a password (min 6 characters)"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            value={form.confirmPassword}
                            onChangeText={value => setForm({ ...form, confirmPassword: value })}
                            placeholder="Confirm your password"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Terms and Conditions */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {agreed && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>{' '}
                            and <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <Loader type="dots" size="small" color={Colors.white} />
                    ) : (
                        <Text style={styles.registerText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={handleLogin}
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
    header: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        alignItems: 'center',
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 36,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: { color: Colors.textLight, fontSize: 20, fontWeight: 'bold' },
    headerTitle: {
        color: Colors.textLight,
        fontSize: 24,
        fontWeight: '700',
        marginTop: 10,
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

    // User Type Selection
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
    userTypeIcon: { fontSize: 28, marginBottom: 8 },
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

    // Form Inputs
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 6 },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },

    // Gender Selection
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
    genderIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    genderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textMedium,
    },
    genderLabelActive: {
        color: Colors.gradientStart,
    },

    // Checkbox
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
    },
    checkboxChecked: { backgroundColor: Colors.gradientStart, borderColor: Colors.gradientStart },
    checkmark: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
    checkboxText: { flex: 1, fontSize: 14, color: Colors.textMedium, lineHeight: 20 },
    linkText: { color: Colors.gradientStart, textDecorationLine: 'underline' },

    // Buttons
    registerBtn: {
        backgroundColor: Colors.gradientStart,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    registerBtnDisabled: { backgroundColor: Colors.textMuted },
    registerText: { color: Colors.white, fontSize: 18, fontWeight: '700' },

    loginLink: { alignItems: 'center', marginTop: 20 },
    loginText: { fontSize: 14, color: Colors.textMedium },
    loginLinkText: { color: Colors.gradientStart, fontWeight: '600' },
});

export default RegisterScreen;
