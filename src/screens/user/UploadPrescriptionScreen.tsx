import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import * as DocumentPicker from '@react-native-documents/picker';
import type { DocumentPickerResponse } from '@react-native-documents/picker';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingAPI } from '../../service/apis/bookingService';

type UploadPrescriptionProps = NativeStackScreenProps<RootStackParamList, 'UploadPrescription'>;

const UploadPrescriptionScreen = ({ navigation }: UploadPrescriptionProps) => {
  const { bookingData, updatePrescription, setStep, isLoading, setLoading } = useBookingStore();
  const [uploadedFile, setUploadedFile] = useState<DocumentPickerResponse | null>(bookingData.prescriptionFile || null);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const mockTestsFromPrescription = [
    { id: 1, name: 'Complete Blood Count (CBC)', price: 500 },
    { id: 2, name: 'Thyroid Function Test', price: 800 },
    { id: 3, name: 'Lipid Profile', price: 600 },
    { id: 4, name: 'Blood Sugar (Fasting)', price: 200 },
  ];

  const handleUpload = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];

        // Check file size (5MB limit)
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        // Upload to server
        const formData = new FormData();
        formData.append('prescription', {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || 'prescription',
        } as any);

        try {
          const uploadResponse = await bookingAPI.uploadPrescription(formData);
          const prescriptionUrl = uploadResponse.data.url; // Assuming API returns { url: string }

          const fileWithUrl = { ...file, serverUrl: prescriptionUrl } as any;
          updatePrescription(fileWithUrl);
          setUploadedFile(fileWithUrl);
          Alert.alert('Success', 'Prescription uploaded successfully!');
        } catch (uploadError) {
          // If upload fails, still save locally for now
          updatePrescription(file as any);
          setUploadedFile(file);
          Alert.alert('Warning', 'Prescription saved locally. Upload to server failed.');
        }
      }
    } catch (err: any) {
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to pick document. Please try again.');
        console.error('Document picker error:', err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTest = (id: number) => {
    setSelectedTests(prev =>
      prev.includes(id) ? prev.filter(testId => testId !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (!uploadedFile && selectedTests.length === 0) {
      Alert.alert('Error', 'Please upload prescription or select tests manually');
      return;
    }

    // If prescription uploaded, save selected tests (if any)
    if (uploadedFile) {
      // Here we could analyze the prescription and auto-select tests
      // For now, we'll proceed
    }

    setStep(3);
    navigation.navigate('Requirements');
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
        <Text style={styles.headerTitle}>Upload Prescription</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          Upload your doctor's prescription to automatically detect required tests, or select manually.
        </Text>

        <TouchableOpacity
          style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          activeOpacity={0.8}
          disabled={isUploading}
        >
          <Text style={styles.uploadIcon}>{isUploading ? '⏳' : '📎'}</Text>
          <Text style={styles.uploadText}>
            {isUploading ? 'Picking Document...' : 'Upload Doctor\'s Slip'}
          </Text>
          <Text style={styles.uploadSub}>JPG, PNG, PDF up to 5MB</Text>
        </TouchableOpacity>

        {uploadedFile && (
          <View style={styles.filePreview}>
            {uploadedFile.type?.startsWith('image/') ? (
              <Image source={{ uri: uploadedFile.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.pdfPreview}>
                <Text style={styles.pdfIcon}>📄</Text>
                <Text style={styles.pdfText}>PDF Document</Text>
              </View>
            )}
            <Text style={styles.previewText}>
              {uploadedFile.name || 'Document'} uploaded
            </Text>
            <Text style={styles.fileSize}>
              Size: {uploadedFile.size ? (uploadedFile.size / 1024 / 1024).toFixed(2) : 'Unknown'} MB
            </Text>
          </View>
        )}

        {uploadedFile && (
          <View style={styles.testsSection}>
            <Text style={styles.sectionTitle}>Detected Tests from Prescription</Text>
            {mockTestsFromPrescription.map(test => (
              <TouchableOpacity
                key={test.id}
                style={[
                  styles.testItem,
                  selectedTests.includes(test.id) && styles.testItemSelected
                ]}
                onPress={() => toggleTest(test.id)}
                activeOpacity={0.7}
              >
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testPrice}>₹{test.price}</Text>
                </View>
                {selectedTests.includes(test.id) && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>Or Add Tests Manually</Text>
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() => navigation.navigate('Requirements')}
            activeOpacity={0.8}
          >
            <Text style={styles.manualText}>Browse All Tests</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueText}>Continue</Text>
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
    marginRight: 16,
  },
  backText: { color: Colors.textLight, fontSize: 20, fontWeight: 'bold' },
  headerTitle: {
    color: Colors.textLight,
    fontSize: 20,
    fontWeight: '700',
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  instruction: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  filePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pdfPreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: Colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pdfIcon: { fontSize: 48, marginBottom: 8 },
  pdfText: { fontSize: 16, color: Colors.textMedium },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { fontSize: 18, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  uploadSub: { fontSize: 12, color: Colors.textMuted },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewText: { fontSize: 14, color: Colors.textMedium },
  fileSize: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  testsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  testItem: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  testItemSelected: {
    borderColor: Colors.gradientStart,
    backgroundColor: 'rgba(0, 212, 160, 0.05)',
  },
  testInfo: { flex: 1 },
  testName: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
  testPrice: { fontSize: 14, color: Colors.textMedium, marginTop: 2 },
  checkIcon: { fontSize: 18, color: Colors.gradientStart, fontWeight: 'bold' },
  manualSection: { marginBottom: 24 },
  manualBtn: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  manualText: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
  continueBtn: {
    backgroundColor: Colors.gradientStart,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
});

export default UploadPrescriptionScreen;