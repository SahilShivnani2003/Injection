import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { FieldInput } from '../../../components/FieldInput';
import { Colors } from '../../../theme/colors';
import { VendorForm, UploadedFile, DocumentField } from '../types/VendorRegistration';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
    form: VendorForm;
    updateField: (key: keyof VendorForm, value: string | string[]) => void;
    profileImage: UploadedFile | null;
    setProfileImage: (file: UploadedFile | null) => void;
    documents: Record<DocumentField, UploadedFile | null>;
    setDocuments: React.Dispatch<React.SetStateAction<Record<DocumentField, UploadedFile | null>>>;
    onImageError: (msg: string) => void;
};

const DOCUMENT_FIELDS: { field: DocumentField; label: string }[] = [
    { field: 'identityProof', label: 'Identity Proof' },
    { field: 'qualificationCertificate', label: 'Qualification' },
    { field: 'businessLicense', label: 'Business License' },
    { field: 'insuranceCertificate', label: 'Insurance Cert' },
];

const trimFileName = (file: UploadedFile | null, fallback: string) =>
    file ? file.name.replace(/^.*[\\/]/, '') : fallback;

const StepBankDocuments = ({
    form,
    updateField,
    profileImage,
    setProfileImage,
    documents,
    setDocuments,
    onImageError,
}: Props) => {
    const handleSelectProfileImage = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
            if (result.assets?.[0]) {
                const asset = result.assets[0];
                setProfileImage({
                    uri: asset.uri ?? '',
                    name: asset.fileName ?? 'profile.jpg',
                    type: asset.type ?? 'image/jpeg',
                });
            }
        } catch {
            onImageError('Unable to open the image library.');
        }
    };

    const handlePickDocument = async (field: DocumentField) => {
        try {
            const [result] = await pick({
                type: [types.pdf, types.doc, types.docx, types.images],
                copyTo: 'cachesDirectory',
            });
            if (!result?.uri) return;
            setDocuments(prev => ({
                ...prev,
                [field]: {
                    uri: result.uri,
                    name: result.name ?? `${field}.pdf`,
                    type: result.type ?? 'application/pdf',
                },
            }));
        } catch(error) {
            console.error('Error while picking document : ', error)
        }
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>Bank Details</Text>

            <FieldInput
                label="Bank Name"
                value={form.bankName}
                onChangeText={v => updateField('bankName', v)}
                placeholder="Bank name"
            />
            <FieldInput
                label="Account Number"
                value={form.accountNumber}
                onChangeText={v => updateField('accountNumber', v)}
                placeholder="Account number"
                keyboardType="number-pad"
            />
            <FieldInput
                label="IFSC Code"
                value={form.ifscCode}
                onChangeText={v => updateField('ifscCode', v)}
                placeholder="IFSC code"
            />
            <FieldInput
                label="Branch"
                value={form.branch}
                onChangeText={v => updateField('branch', v)}
                placeholder="Branch name"
            />

            <Text style={styles.sectionTitle}>Profile Image</Text>

            <TouchableOpacity style={styles.imageButton} onPress={handleSelectProfileImage}>
                <View style={[styles.iconCircle, profileImage && styles.iconCircleFilled]}>
                    <Icon
                        name={profileImage ? 'check-circle' : 'photo-camera'}
                        size={22}
                        color={profileImage ? Colors.white : Colors.gradientStart}
                    />
                </View>
                <View style={styles.imageTextWrap}>
                    <Text style={styles.imageLabel}>
                        {profileImage ? 'Image selected' : 'Select profile image'}
                    </Text>
                    {profileImage && (
                        <Text style={styles.imageName} numberOfLines={1}>
                            {trimFileName(profileImage, 'profile.jpg')}
                        </Text>
                    )}
                </View>
                <Text style={styles.imageAction}>{profileImage ? 'Change' : 'Upload'}</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Verification Documents</Text>
            <Text style={styles.hint}>Upload PDF, DOC, or image files for each document.</Text>

            {DOCUMENT_FIELDS.map(item => {
                const file = documents[item.field];
                return (
                    <TouchableOpacity
                        key={item.field}
                        style={[styles.docRow, file && styles.docRowFilled]}
                        onPress={() => handlePickDocument(item.field)}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.iconCircle, file && styles.iconCircleFilled]}>
                            <Icon
                                name={file ? 'insert-drive-file' : 'upload-file'}
                                size={20}
                                color={file ? Colors.white : Colors.gradientStart}
                            />
                        </View>
                        <View style={styles.docTextWrap}>
                            <Text style={styles.docLabel}>{item.label}</Text>
                            <Text
                                style={[styles.docName, !file && styles.docNameEmpty]}
                                numberOfLines={1}
                            >
                                {file ? trimFileName(file, item.label) : 'Tap to upload'}
                            </Text>
                        </View>
                        {file && (
                            <Icon name="check-circle" size={20} color={Colors.gradientStart} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
        marginTop: 8,
        marginBottom: 14,
    },
    hint: {
        fontSize: 12,
        color: Colors.textMedium,
        marginBottom: 12,
    },

    // Shared icon container
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
        borderWidth: 1,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 20,
    },
    imageTextWrap: {
        flex: 1,
    },
    imageLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textDark,
    },
    imageName: {
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
        borderWidth: 1,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 10,
    },
    docRowFilled: {
        borderColor: Colors.gradientStart,
        backgroundColor: '#EDF6FB',
    },
    docTextWrap: {
        flex: 1,
    },
    docLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textDark,
    },
    docName: {
        fontSize: 11,
        color: Colors.gradientStart,
        marginTop: 2,
        fontWeight: '500',
    },
    docNameEmpty: {
        color: Colors.textMedium,
    },
});

export default StepBankDocuments;
