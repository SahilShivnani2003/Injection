import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { Colors } from '../../../theme/colors';
import { FieldInput } from '../../../components/FieldInput';
import { vendorAPI } from '../../../service/apis/vendorService';
import { useAlert } from '../../../context/AlertContext';
import { RootStackParamList } from '../../../types/RootStackParamList';

type VendorRegisterProps = NativeStackScreenProps<RootStackParamList, 'VendorRegister'>;

type UploadedFile = {
    uri: string;
    name: string;
    type: string;
};

type DocumentField =
    | 'identityProof'
    | 'qualificationCertificate'
    | 'businessLicense'
    | 'insuranceCertificate';

const BUSINESS_TYPES = [
    'Individual',
    'Clinic',
    'Hospital',
    'Laboratory',
    'Pharmacy',
    'Other',
] as const;

const SERVICE_OPTIONS = [
    'Home Injections',
    'IV Drip Services',
    'Wound Dressing',
    'Day Care at Home',
    'Patient Monitoring',
    '24 HR Patient Care',
    'Field Sample Collection',
    'Community Survey',
    'Data Collection Service',
    'Nursing Training',
] as const;

const VendorRegistrationScreen = ({ navigation }: VendorRegisterProps) => {
    const alert = useAlert();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<UploadedFile | null>(null);
    const [documents, setDocuments] = useState<Record<DocumentField, UploadedFile | null>>({
        identityProof: null,
        qualificationCertificate: null,
        businessLicense: null,
        insuranceCertificate: null,
    });
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        alternatePhone: '',
        businessName: '',
        businessType: 'Individual',
        registrationNumber: '',
        gstNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bio: '',
        specialization: '',
        experience: '',
        serviceAreas: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        servicesOffered: [] as string[],
    });

    const updateField = (key: keyof typeof form, value: string | string[]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectProfileImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.7,
            });

            if (result.assets?.[0]) {
                const asset = result.assets[0];
                setProfileImage({
                    uri: asset.uri ?? '',
                    name: asset.fileName ?? 'profile.jpg',
                    type: asset.type ?? 'image/jpeg',
                });
            }
        } catch (error) {
            Alert.alert('Image Error', 'Unable to open the image library.');
        }
    };

    const handlePickDocument = async (field: DocumentField) => {
        try {
            const [result] = await pick({
                type: [types.pdf, types.doc, types.docx, types.images],
                copyTo: 'cachesDirectory',
            });

            if (!result?.uri) {
                return;
            }

            setDocuments(prev => ({
                ...prev,
                [field]: {
                    uri: result.uri,
                    name: result.name ?? `${field}.pdf`,
                    type: result.type ?? 'application/pdf',
                },
            }));
        } catch (error) {
            // User canceled or permission denied, ignore silently.
        }
    };

    const toggleService = (service: string) => {
        const current = form.servicesOffered;
        const next = current.includes(service)
            ? current.filter(item => item !== service)
            : [...current, service];
        updateField('servicesOffered', next);
    };

    const validate = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.name.trim()) {
            alert.error('Validation', 'Vendor contact name is required.');
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
        if (!form.businessName.trim()) {
            alert.error('Validation', 'Business name is required.');
            return false;
        }
        if (!form.address.trim() || !form.city.trim() || !form.state.trim()) {
            alert.error('Validation', 'Business address, city, and state are required.');
            return false;
        }
        if (form.pincode.replace(/[^0-9]/g, '').length !== 6) {
            alert.error('Validation', 'Pincode must be 6 digits.');
            return false;
        }
        if (form.password.length < 6) {
            alert.error('Validation', 'Password should be at least 6 characters.');
            return false;
        }
        if (form.password !== form.confirmPassword) {
            alert.error('Validation', 'Passwords do not match.');
            return false;
        }
        if (form.servicesOffered.length === 0) {
            alert.error('Validation', 'Select at least one service offered.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

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
        formData.append('bankName', form.bankName.trim());
        formData.append('accountNumber', form.accountNumber.trim());
        formData.append('ifscCode', form.ifscCode.trim());
        formData.append('branch', form.branch.trim());
        formData.append('servicesOffered', JSON.stringify(form.servicesOffered));

        if (profileImage) {
            formData.append('profileImage', {
                uri: profileImage.uri,
                name: profileImage.name,
                type: profileImage.type,
            } as any);
        }

        Object.entries(documents).forEach(([key, file]) => {
            if (file) {
                formData.append(key, {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                } as any);
            }
        });

        setLoading(true);
        try {
            const response = await vendorAPI.registerVendor(formData);
            if (response?.data?.success) {
                alert.success('Vendor Registered', 'Your vendor account was created successfully.');
                navigation.navigate('Login');
            } else {
                alert.error('Registration Failed', response?.data?.message || 'Unable to register vendor.');
            }
        } catch (error: any) {
            alert.error('Registration Failed', error.message || 'Unable to register vendor.');
        } finally {
            setLoading(false);
        }
    };

    const renderFileLabel = (file: UploadedFile | null) =>
        file ? file.name.replace(/^.*[\\/]/, '') : 'Upload file';

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vendor Registration</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Contact & Business Details</Text>
                    <FieldInput
                        label="Contact Name"
                        value={form.name}
                        onChangeText={value => updateField('name', value)}
                        placeholder="Enter contact name"
                        required
                    />
                    <FieldInput
                        label="Email"
                        value={form.email}
                        onChangeText={value => updateField('email', value)}
                        placeholder="Enter business email"
                        keyboardType="email-address"
                        required
                    />
                    <FieldInput
                        label="Phone"
                        value={form.phone}
                        onChangeText={value => updateField('phone', value.replace(/[^0-9]/g, ''))}
                        placeholder="10-digit mobile number"
                        keyboardType="phone-pad"
                        maxLength={10}
                        required
                    />
                    <FieldInput
                        label="Alternate Phone"
                        value={form.alternatePhone}
                        onChangeText={value => updateField('alternatePhone', value.replace(/[^0-9]/g, ''))}
                        placeholder="Optional alternate number"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    <FieldInput
                        label="Password"
                        value={form.password}
                        onChangeText={value => updateField('password', value)}
                        placeholder="Choose a secure password"
                    />
                    <FieldInput
                        label="Confirm Password"
                        value={form.confirmPassword}
                        onChangeText={value => updateField('confirmPassword', value)}
                        placeholder="Repeat password"
                    />
                    <FieldInput
                        label="Business Name"
                        value={form.businessName}
                        onChangeText={value => updateField('businessName', value)}
                        placeholder="Enter business name"
                        required
                    />

                    <View style={styles.segmentRow}>
                        {BUSINESS_TYPES.map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.chip,
                                    form.businessType === type && styles.chipActive,
                                ]}
                                onPress={() => updateField('businessType', type)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        form.businessType === type && styles.chipTextActive,
                                    ]}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <FieldInput
                        label="Registration Number"
                        value={form.registrationNumber}
                        onChangeText={value => updateField('registrationNumber', value)}
                        placeholder="GST / registration number"
                    />
                    <FieldInput
                        label="GST Number"
                        value={form.gstNumber}
                        onChangeText={value => updateField('gstNumber', value)}
                        placeholder="GSTIN"
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Location & Services</Text>
                    <FieldInput
                        label="Address"
                        value={form.address}
                        onChangeText={value => updateField('address', value)}
                        placeholder="Street address"
                        multiline
                    />
                    <FieldInput
                        label="City"
                        value={form.city}
                        onChangeText={value => updateField('city', value)}
                        placeholder="City"
                    />
                    <FieldInput
                        label="State"
                        value={form.state}
                        onChangeText={value => updateField('state', value)}
                        placeholder="State"
                    />
                    <FieldInput
                        label="Pincode"
                        value={form.pincode}
                        onChangeText={value => updateField('pincode', value.replace(/[^0-9]/g, ''))}
                        placeholder="6-digit pin code"
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                    <FieldInput
                        label="Service Areas"
                        value={form.serviceAreas}
                        onChangeText={value => updateField('serviceAreas', value)}
                        placeholder="Cities or neighborhoods served"
                    />

                    <Text style={styles.subHeading}>Services Offered</Text>
                    <View style={styles.serviceGrid}>
                        {SERVICE_OPTIONS.map(service => {
                            const active = form.servicesOffered.includes(service);
                            return (
                                <TouchableOpacity
                                    key={service}
                                    style={[styles.serviceChip, active && styles.serviceChipActive]}
                                    onPress={() => toggleService(service)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[styles.serviceText, active && styles.serviceTextActive]}>
                                        {service}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Professional Details</Text>
                    <FieldInput
                        label="Specialization"
                        value={form.specialization}
                        onChangeText={value => updateField('specialization', value)}
                        placeholder="Primary service area"
                    />
                    <FieldInput
                        label="Experience (years)"
                        value={form.experience}
                        onChangeText={value => updateField('experience', value.replace(/[^0-9]/g, ''))}
                        placeholder="Number of years"
                        keyboardType="number-pad"
                    />
                    <FieldInput
                        label="Short Bio"
                        value={form.bio}
                        onChangeText={value => updateField('bio', value)}
                        placeholder="Tell customers about your business"
                        multiline
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Bank & Verification Documents</Text>
                    <FieldInput
                        label="Bank Name"
                        value={form.bankName}
                        onChangeText={value => updateField('bankName', value)}
                        placeholder="Bank name"
                    />
                    <FieldInput
                        label="Account Number"
                        value={form.accountNumber}
                        onChangeText={value => updateField('accountNumber', value)}
                        placeholder="Account number"
                        keyboardType="number-pad"
                    />
                    <FieldInput
                        label="IFSC Code"
                        value={form.ifscCode}
                        onChangeText={value => updateField('ifscCode', value)}
                        placeholder="IFSC code"
                    />
                    <FieldInput
                        label="Branch"
                        value={form.branch}
                        onChangeText={value => updateField('branch', value)}
                        placeholder="Branch name"
                    />

                    <Text style={styles.subHeading}>Profile Image</Text>
                    <TouchableOpacity style={styles.fileButton} onPress={handleSelectProfileImage}>
                        <Text style={styles.fileButtonText}>
                            {profileImage ? renderFileLabel(profileImage) : 'Select profile image'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.subHeading}>Upload Documents</Text>
                    <View style={styles.fileGrid}>
                        {(
                            [
                                { field: 'identityProof', label: 'Identity Proof' },
                                { field: 'qualificationCertificate', label: 'Qualification' },
                                { field: 'businessLicense', label: 'Business License' },
                                { field: 'insuranceCertificate', label: 'Insurance Cert' },
                            ] as const
                        ).map(item => (
                            <TouchableOpacity
                                key={item.field}
                                style={styles.fileButton}
                                onPress={() => handlePickDocument(item.field)}
                            >
                                <Text style={styles.fileButtonText}>
                                    {documents[item.field]
                                        ? renderFileLabel(documents[item.field])
                                        : item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Register Vendor'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    header: {
        paddingTop: 56,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.28)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    backText: {
        color: Colors.textLight,
        fontSize: 20,
        fontWeight: '700',
    },
    headerTitle: {
        color: Colors.textLight,
        fontSize: 22,
        fontWeight: '800',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 14,
    },
    segmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D8E8EE',
        marginBottom: 10,
    },
    chipActive: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },
    chipText: {
        color: Colors.textMedium,
        fontWeight: '600',
        fontSize: 12,
    },
    chipTextActive: {
        color: Colors.white,
    },
    subHeading: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 10,
    },
    serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    serviceChip: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#F3F7FA',
        borderWidth: 1,
        borderColor: '#E2ECF2',
        marginBottom: 10,
    },
    serviceChipActive: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },
    serviceText: {
        color: Colors.textMedium,
        fontSize: 12,
        fontWeight: '600',
    },
    serviceTextActive: {
        color: Colors.white,
    },
    fileGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    fileButton: {
        backgroundColor: '#F4F8FB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D8E8EE',
        paddingVertical: 14,
        paddingHorizontal: 14,
        width: '48%',
        marginBottom: 10,
    },
    fileButtonText: {
        color: Colors.textMedium,
        fontSize: 13,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: Colors.gradientStart,
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
});

export default VendorRegistrationScreen;
