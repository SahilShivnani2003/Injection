import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
    Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { FieldInput } from '../../../components/FieldInput';
import { Colors } from '../../../theme/colors';
import { VendorForm, DocumentField } from '../types/VendorRegistration';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { vendorAPI } from '@/service/apis/vendorService';

type Props = {
    form: VendorForm;
    updateField: (key: keyof VendorForm, value: string | string[]) => void;
    profileImage: string | null;
    setProfileImage: (file: string | null) => void;
    documents: Record<DocumentField, string | null>;
    setDocuments: React.Dispatch<React.SetStateAction<Record<DocumentField, string | null>>>;
    onImageError: (msg: string) => void;
};

const DOCUMENT_FIELDS: { field: DocumentField; label: string; icon: string }[] = [
    { field: 'identityProof', label: 'Identity Proof', icon: 'badge' },
    { field: 'qualificationCertificate', label: 'Qualification', icon: 'school' },
    { field: 'businessLicense', label: 'Business License', icon: 'store' },
    { field: 'insuranceCertificate', label: 'Insurance Cert', icon: 'health-and-safety' },
    { field: 'policeVerification', label: 'Police Verification', icon: 'verified-user' },
];

// ── Section header (matches StepContactBusiness style) ────────────────────────
const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <View style={sectionStyles.header}>
        <View style={sectionStyles.iconBox}>
            <Icon name={icon} size={16} color={Colors.gradientStart} />
        </View>
        <Text style={sectionStyles.title}>{title}</Text>
    </View>
);

const sectionStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        marginTop: 8,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EDF6FB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
    },
});

// ── Main component ─────────────────────────────────────────────────────────────
const StepBankDocuments = ({
    form,
    updateField,
    profileImage,
    setProfileImage,
    documents,
    setDocuments,
    onImageError,
}: Props) => {
    // Per-item upload loading state
    const [uploadingField, setUploadingField] = useState<DocumentField | 'profile' | null>(null);

    // ── Upload helper ──────────────────────────────────────────────────────────
    const handleUpload = async (
        file: { uri: string; name: string; type: string },
        isProfilePhoto: boolean,
        field?: DocumentField,
    ) => {
        try {
            const formData = new FormData();

            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);

            const response = await vendorAPI.uploadImage(formData);

            if (response.data?.success) {
                const url: string = response.data?.data?.url;

                if (isProfilePhoto) {
                    setProfileImage(url);
                } else if (field) {
                    setDocuments(prev => ({ ...prev, [field]: url }));
                }
            } else {
                onImageError(response.data?.message ?? 'Upload failed.');
            }
        } catch (error: any) {
            console.error('File upload failed:', error);
            onImageError(error?.response?.data?.message ?? error?.message ?? 'Upload failed.');
        }
    };

    // ── Shared: convert a picker asset into our upload file shape ───────────────
    const assetToFile = (asset: Asset, fallbackName: string) => ({
        uri: asset.uri ?? '',
        name: asset.fileName ?? fallbackName,
        type: asset.type ?? 'image/jpeg',
    });

    // ── Profile image: camera ────────────────────────────────────────────────
    const captureProfilePhoto = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.7,
                saveToPhotos: true,
            });
            if (result.didCancel) return;
            if (result.errorCode) {
                onImageError(
                    result.errorCode === 'camera_unavailable'
                        ? 'Camera is not available on this device.'
                        : 'Unable to access the camera.',
                );
                return;
            }
            if (!result.assets?.[0]) return;

            const file = assetToFile(result.assets[0], 'profile.jpg');
            setUploadingField('profile');
            await handleUpload(file, true);
        } catch {
            onImageError('Unable to open the camera.');
        } finally {
            setUploadingField(null);
        }
    };

    // ── Profile image: gallery ───────────────────────────────────────────────
    const pickProfileFromLibrary = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
            if (result.didCancel) return;
            if (!result.assets?.[0]) return;

            const file = assetToFile(result.assets[0], 'profile.jpg');
            setUploadingField('profile');
            await handleUpload(file, true);
        } catch {
            onImageError('Unable to open the image library.');
        } finally {
            setUploadingField(null);
        }
    };

    // ── Profile image: entry point — choose source ───────────────────────────
    const handleSelectProfileImage = () => {
        Alert.alert(
            'Profile Image',
            'Choose a source',
            [
                { text: 'Take Photo', onPress: captureProfilePhoto },
                { text: 'Choose from Library', onPress: pickProfileFromLibrary },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true },
        );
    };

    // ── Document: camera ─────────────────────────────────────────────────────
    const captureDocumentPhoto = async (field: DocumentField) => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: true,
            });
            if (result.didCancel) return;
            if (result.errorCode) {
                onImageError(
                    result.errorCode === 'camera_unavailable'
                        ? 'Camera is not available on this device.'
                        : 'Unable to access the camera.',
                );
                return;
            }
            if (!result.assets?.[0]) return;

            const file = assetToFile(result.assets[0], `${field}.jpg`);
            setUploadingField(field);
            await handleUpload(file, false, field);
        } catch {
            onImageError('Unable to open the camera.');
        } finally {
            setUploadingField(null);
        }
    };

    // ── Document: file/gallery picker ────────────────────────────────────────
    const pickDocumentFile = async (field: DocumentField) => {
        try {
            const [result] = await pick({
                type: [types.pdf, types.doc, types.docx, types.images],
                copyTo: 'cachesDirectory',
            });
            if (!result?.uri) return;

            const file = {
                uri: result.uri,
                name: result.name ?? `${field}.pdf`,
                type: result.type ?? 'application/pdf',
            };

            setUploadingField(field);
            await handleUpload(file, false, field);
        } catch (error) {
            // User cancelled — ignore silently
        } finally {
            setUploadingField(null);
        }
    };

    // ── Document: entry point — choose source ────────────────────────────────
    const handlePickDocument = (field: DocumentField) => {
        Alert.alert(
            'Upload Document',
            'Choose a source',
            [
                { text: 'Take Photo', onPress: () => captureDocumentPhoto(field) },
                { text: 'Choose File', onPress: () => pickDocumentFile(field) },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true },
        );
    };

    // ── Remove helpers ─────────────────────────────────────────────────────────
    const removeProfileImage = () => setProfileImage(null);
    const removeDocument = (field: DocumentField) =>
        setDocuments(prev => ({ ...prev, [field]: null }));

    return (
        <View>
            {/* ── Bank Details ── */}
            <SectionHeader icon="account-balance" title="Bank Details" />

            <FieldInput
                label="Bank Name"
                value={form.bankName}
                onChangeText={v => updateField('bankName', v)}
                placeholder="e.g. State Bank of India"
            />
            <FieldInput
                label="Account Number"
                value={form.accountNumber}
                onChangeText={v => updateField('accountNumber', v.replace(/[^0-9]/g, ''))}
                placeholder="Enter account number"
                keyboardType="number-pad"
            />
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <FieldInput
                        label="IFSC Code"
                        value={form.ifscCode}
                        onChangeText={v => updateField('ifscCode', v.toUpperCase())}
                        placeholder="e.g. SBIN0001234"
                    />
                </View>
                <View style={styles.rowItem}>
                    <FieldInput
                        label="Branch"
                        value={form.branch}
                        onChangeText={v => updateField('branch', v)}
                        placeholder="Branch name"
                    />
                </View>
            </View>

            {/* ── Profile Image ── */}
            <SectionHeader icon="photo-camera" title="Profile Image" />

            <TouchableOpacity
                style={[styles.imageButton, profileImage && styles.imageButtonFilled]}
                onPress={handleSelectProfileImage}
                activeOpacity={0.75}
                disabled={uploadingField === 'profile'}
            >
                {/* Left: preview or camera icon */}
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileThumb} />
                ) : (
                    <View style={styles.iconCircle}>
                        <Icon name="photo-camera" size={22} color={Colors.gradientStart} />
                    </View>
                )}

                <View style={styles.imageTextWrap}>
                    <Text style={styles.imageLabel}>
                        {profileImage ? 'Profile image uploaded' : 'Select profile image'}
                    </Text>
                    <Text style={styles.imageSubLabel}>
                        {profileImage ? 'Tap to change photo' : 'Camera or gallery, max 5MB'}
                    </Text>
                </View>

                {uploadingField === 'profile' ? (
                    <ActivityIndicator size="small" color={Colors.gradientStart} />
                ) : profileImage ? (
                    <TouchableOpacity
                        onPress={removeProfileImage}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Icon name="close" size={20} color="#E53935" />
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.imageAction}>Upload</Text>
                )}
            </TouchableOpacity>

            {/* ── Verification Documents ── */}
            <SectionHeader icon="folder-open" title="Verification Documents" />
            <Text style={styles.hint}>
                Take a photo or upload a PDF/DOC/image for each document.
            </Text>

            {DOCUMENT_FIELDS.map(item => {
                const url = documents[item.field];
                const isUploading = uploadingField === item.field;

                return (
                    <TouchableOpacity
                        key={item.field}
                        style={[styles.docRow, url && styles.docRowFilled]}
                        onPress={() => handlePickDocument(item.field)}
                        activeOpacity={0.75}
                        disabled={isUploading}
                    >
                        {/* Left icon */}
                        <View style={[styles.iconCircle, url && styles.iconCircleFilled]}>
                            <Icon
                                name={url ? 'insert-drive-file' : item.icon}
                                size={20}
                                color={url ? Colors.white : Colors.gradientStart}
                            />
                        </View>

                        {/* Text */}
                        <View style={styles.docTextWrap}>
                            <Text style={styles.docLabel}>{item.label}</Text>
                            <Text
                                style={[styles.docSubLabel, !url && styles.docSubLabelEmpty]}
                                numberOfLines={1}
                            >
                                {isUploading
                                    ? 'Uploading...'
                                    : url
                                    ? 'Uploaded successfully'
                                    : 'Tap to upload'}
                            </Text>
                        </View>

                        {/* Right: loader / check / remove */}
                        {isUploading ? (
                            <ActivityIndicator size="small" color={Colors.gradientStart} />
                        ) : url ? (
                            <TouchableOpacity
                                onPress={() => removeDocument(item.field)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Icon name="close" size={18} color="#E53935" />
                            </TouchableOpacity>
                        ) : (
                            <Icon name="chevron-right" size={20} color={Colors.textMedium} />
                        )}
                    </TouchableOpacity>
                );
            })}

            {/* ── Upload summary ── */}
            {(() => {
                const uploadedCount = Object.values(documents).filter(Boolean).length;
                const total = DOCUMENT_FIELDS.length;
                if (uploadedCount === 0) return null;
                return (
                    <View style={styles.summaryRow}>
                        <Icon name="check-circle" size={14} color={Colors.gradientStart} />
                        <Text style={styles.summaryText}>
                            {uploadedCount} of {total} documents uploaded
                        </Text>
                    </View>
                );
            })()}
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 10 },
    rowItem: { flex: 1 },

    hint: {
        fontSize: 12,
        color: Colors.textMedium,
        marginBottom: 12,
        marginTop: -6,
    },

    // Shared icon circle
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDF6FB',
        borderWidth: 1,
        borderColor: Colors.gradientStart,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconCircleFilled: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },

    // Profile image row
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F8FB',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 20,
    },
    imageButtonFilled: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#EDF6FB',
    },
    profileThumb: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderWidth: 2,
        borderColor: Colors.gradientStart,
    },
    imageTextWrap: { flex: 1 },
    imageLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textDark,
    },
    imageSubLabel: {
        fontSize: 11,
        color: Colors.textMedium,
        marginTop: 2,
    },
    imageAction: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gradientStart,
    },

    // Document rows
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F8FB',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 10,
    },
    docRowFilled: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#EDF6FB',
    },
    docTextWrap: { flex: 1 },
    docLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textDark,
    },
    docSubLabel: {
        fontSize: 11,
        color: Colors.gradientStart,
        marginTop: 2,
        fontWeight: '500',
    },
    docSubLabelEmpty: {
        color: Colors.textMedium,
    },

    // Summary
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gradientStart,
    },
});

export default StepBankDocuments;
