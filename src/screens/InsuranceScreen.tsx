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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type InsuranceProps = NativeStackScreenProps<RootStackParamList, 'Insurance'>;

const InsuranceScreen = ({ navigation }: InsuranceProps) => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [insuranceDetails, setInsuranceDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockInsuranceData = {
    policyHolder: 'John Doe',
    provider: 'ABC Insurance',
    coverage: 'Full Coverage',
    validTill: '2026-12-31',
    maxLimit: 50000,
    usedAmount: 15000,
    remainingAmount: 35000,
  };

  const handleFetchInsurance = async () => {
    if (!policyNumber.trim()) {
      Alert.alert('Error', 'Please enter policy number');
      return;
    }

    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setInsuranceDetails(mockInsuranceData);
      setIsLoading(false);
      Alert.alert('Success', 'Insurance details fetched successfully!');
    }, 1500);
  };

  const handleContinue = () => {
    if (!insuranceDetails) {
      Alert.alert('Error', 'Please fetch insurance details first');
      return;
    }
    navigation.navigate('SlotBooking');
  };

  const handleSkip = () => {
    navigation.navigate('Charges', { selectedServices: [] }); // Pass empty for now, can be updated to include complimentary tests
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
        <Text style={styles.headerTitle}>Insurance Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          Enter your insurance policy number to check coverage and reduce out-of-pocket expenses.
        </Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Policy Number</Text>
          <TextInput
            style={styles.input}
            value={policyNumber}
            onChangeText={setPolicyNumber}
            placeholder="Enter policy number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.fetchBtn, isLoading && styles.fetchBtnDisabled]}
            onPress={handleFetchInsurance}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.fetchText}>
              {isLoading ? 'Fetching...' : 'Fetch Details'}
            </Text>
          </TouchableOpacity>
        </View>

        {insuranceDetails && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Insurance Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Policy Holder:</Text>
              <Text style={styles.detailValue}>{insuranceDetails.policyHolder}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Provider:</Text>
              <Text style={styles.detailValue}>{insuranceDetails.provider}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coverage:</Text>
              <Text style={[styles.detailValue, { color: Colors.accent }]}>
                {insuranceDetails.coverage}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valid Till:</Text>
              <Text style={styles.detailValue}>{insuranceDetails.validTill}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Max Limit:</Text>
              <Text style={styles.detailValue}>₹{insuranceDetails.maxLimit}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Used Amount:</Text>
              <Text style={styles.detailValue}>₹{insuranceDetails.usedAmount}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remaining:</Text>
              <Text style={[styles.detailValue, { color: Colors.accent }]}>
                ₹{insuranceDetails.remainingAmount}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipText}>Skip Insurance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueBtn, !insuranceDetails && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!insuranceDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
  inputSection: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 16,
  },
  fetchBtn: {
    backgroundColor: Colors.gradientStart,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fetchBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  fetchText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: { fontSize: 14, color: Colors.textMedium, fontWeight: '500' },
  detailValue: { fontSize: 14, color: Colors.textDark, fontWeight: '600' },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  skipText: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
  continueBtn: {
    flex: 1,
    backgroundColor: Colors.gradientStart,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  continueText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default InsuranceScreen;