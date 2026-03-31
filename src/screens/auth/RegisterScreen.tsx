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

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterProps) => {
  const [userType, setUserType] = useState<'patient' | 'labpartner' | 'staff'>('patient');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!form.mobile.trim() || form.mobile.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Mock registration API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully! Please login with your mobile number.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }, 2000);
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
              { key: 'patient', label: 'Patient', icon: '👤', desc: 'Book tests & view reports' },
              { key: 'labpartner', label: 'Lab Partner', icon: '🏥', desc: 'Manage lab operations' },
              { key: 'staff', label: 'Staff', icon: '👨‍⚕️', desc: 'Phlebotomist services' },
            ].map((type) => (
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
                <Text style={[
                  styles.userTypeLabel,
                  userType === type.key && styles.userTypeLabelActive
                ]}>
                  {type.label}
                </Text>
                <Text style={[
                  styles.userTypeDesc,
                  userType === type.key && styles.userTypeDescActive
                ]}>
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
              value={form.fullName}
              onChangeText={(value) => updateForm('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(value) => updateForm('email', value)}
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
              value={form.mobile}
              onChangeText={(value) => updateForm('mobile', value.replace(/[^0-9]/g, ''))}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(value) => updateForm('password', value)}
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
              onChangeText={(value) => updateForm('confirmPassword', value)}
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
              I agree to the{' '}
              <Text style={styles.linkText}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
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
          <Text style={styles.registerText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity style={styles.loginLink} onPress={handleLogin} activeOpacity={0.7}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLinkText}>Login here</Text>
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