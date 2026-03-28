import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type bookingProps = NativeStackScreenProps<RootStackParamList, 'BasicDetails'>;

const SEX_OPTIONS = ['Male', 'Female', 'Other'];

// ── Step progress bar ────────────────────────────────────────────────────────
const StepBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={styles.stepBar}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.stepSegment,
          i < current ? styles.stepSegmentDone : styles.stepSegmentPending,
          i < total - 1 && { marginRight: 6 },
        ]}
      />
    ))}
  </View>
);

// ── Floating label input ─────────────────────────────────────────────────────
const FieldInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  maxLength?: number;
  multiline?: boolean;
  required?: boolean;
  rightIcon?: React.ReactNode;
  editable?: boolean;
}> = ({ label, value, onChangeText, placeholder, keyboardType, maxLength, multiline, required, rightIcon, editable = true }) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D8E8EE', Colors.gradientStart],
  });

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <Animated.View style={[styles.fieldBox, { borderColor }, multiline && styles.fieldBoxMulti]}>
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
          placeholder={placeholder || label}
          placeholderTextColor="#B0C4CC"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && <View style={styles.fieldRight}>{rightIcon}</View>}
      </Animated.View>
    </View>
  );
};

// ── Sex selector pill group ──────────────────────────────────────────────────
const SexSelector: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>
      Sex<Text style={styles.required}> *</Text>
    </Text>
    <View style={styles.pillRow}>
      {SEX_OPTIONS.map(opt => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ── Section divider ──────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionRow}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
const BasicDetailsScreen= ({ navigation }: bookingProps) => {
  const [form, setForm] = useState({
    patientName: '',
    age: '',
    sex: '',
    address: '',
    pinCode: '',
    currentLocation: '',
    alternateMobile: '',
    email: '',
  });

  const sheetY  = useRef(new Animated.Value(60)).current;
  const sheetOp = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;
  const headerOp= useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(sheetY,   { toValue: 0, duration: 580, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(sheetOp,  { toValue: 1, duration: 580, delay: 140, useNativeDriver: true }),
    ]).start();
  }, []);

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (!form.patientName || !form.age || !form.sex || !form.address || !form.pinCode) {
      Alert.alert('Required Fields', 'Please fill all required fields.');
      return;
    }
    navigation.navigate('Requirements');
  };

  const isComplete = !!(form.patientName && form.age && form.sex && form.address && form.pinCode);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Gradient header ─────────────────────────────────────────── */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.header}
      >
        <View style={styles.glowRingOuter} />
        <View style={styles.glowRingInner} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: headerOp, transform: [{ translateY: headerY }] }}>
          <StepBar current={1} total={4} />
          <Text style={styles.stepLabel}>Step 1 of 4</Text>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <Text style={styles.headerSub}>Tell us about the patient</Text>
        </Animated.View>
      </LinearGradient>

      {/* ── White sheet ─────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.sheetWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.sheet, { opacity: sheetOp, transform: [{ translateY: sheetY }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >

            {/* ── Personal info ──────────────────────────────────────── */}
            <SectionLabel title="Personal Info" />

            <FieldInput
              label="Patient Name"
              required
              value={form.patientName}
              onChangeText={v => update('patientName', v)}
            />

            <View style={styles.rowTwo}>
              <View style={styles.rowHalf}>
                <FieldInput
                  label="Age"
                  required
                  value={form.age}
                  onChangeText={v => update('age', v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <View style={styles.rowHalf}>
                <SexSelector value={form.sex} onChange={v => update('sex', v)} />
              </View>
            </View>

            {/* ── Location ───────────────────────────────────────────── */}
            <SectionLabel title="Location" />

            <FieldInput
              label="Address"
              required
              value={form.address}
              onChangeText={v => update('address', v)}
              multiline
            />

            <View style={styles.rowTwo}>
              <View style={styles.rowHalf}>
                <FieldInput
                  label="Pin Code"
                  required
                  value={form.pinCode}
                  onChangeText={v => update('pinCode', v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <View style={styles.rowHalf}>
                <FieldInput
                  label="Current Location"
                  value={form.currentLocation}
                  onChangeText={v => update('currentLocation', v)}
                  rightIcon={<Text style={styles.pinIcon}>📍</Text>}
                />
              </View>
            </View>

            {/* ── Contact (optional) ─────────────────────────────────── */}
            <SectionLabel title="Contact (Optional)" />

            <FieldInput
              label="Alternate Mobile"
              value={form.alternateMobile}
              onChangeText={v => update('alternateMobile', v.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <FieldInput
              label="Email Address"
              value={form.email}
              onChangeText={v => update('email', v)}
              keyboardType="email-address"
            />

            {/* ── Next button ────────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.nextBtn, !isComplete && styles.nextBtnOff]}
              onPress={handleNext}
              activeOpacity={isComplete ? 0.82 : 1}
            >
              <LinearGradient
                colors={isComplete ? [Colors.accent, Colors.accentDark] : ['#E8F0F4', '#DDE8EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtnGrad}
              >
                <Text style={[styles.nextBtnText, !isComplete && styles.nextBtnTextOff]}>
                  Next Step
                </Text>
                <View style={[styles.nextArrow, !isComplete && styles.nextArrowOff]}>
                  <Text style={[styles.nextArrowText, !isComplete && styles.nextArrowTextOff]}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const RADIUS = 32;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F7FA' },

  // Header
  header: {
    height: height * 0.28,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  glowRingOuter: {
    position: 'absolute', right: -60, top: -60,
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  glowRingInner: {
    position: 'absolute', right: -20, top: -20,
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: Colors.white, fontSize: 18, fontWeight: '700', marginTop: -1 },

  // Step bar
  stepBar: { flexDirection: 'row', marginBottom: 10 },
  stepSegment: { flex: 1, height: 4, borderRadius: 2 },
  stepSegmentDone: { backgroundColor: Colors.white },
  stepSegmentPending: { backgroundColor: 'rgba(255,255,255,0.3)' },
  stepLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 0.8, marginBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: 0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 3 },

  // Sheet
  sheetWrapper: { flex: 1, marginTop: -RADIUS },
  sheet: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    shadowColor: '#004466',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },

  // Section divider
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
    gap: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#E8F0F4' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700',
    color: Colors.textMuted, letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Field
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700',
    color: Colors.textMuted, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 8,
  },
  required: { color: Colors.gradientStart },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: '#F8FBFC',
    height: 52,
    paddingHorizontal: 16,
  },
  fieldBoxMulti: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: '500',
    padding: 0,
  },
  fieldInputMulti: {
    height: '100%',
    textAlignVertical: 'top',
  },
  fieldRight: { marginLeft: 8 },
  pinIcon: { fontSize: 18 },

  // Two-column layout
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  rowHalf: { flex: 1 },

  // Sex pills
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D8E8EE',
    backgroundColor: '#F8FBFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: Colors.gradientStart,
    backgroundColor: '#E6FAF5',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.gradientStart,
    fontWeight: '800',
  },

  // Next button
  nextBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  nextBtnOff: { shadowOpacity: 0, elevation: 0 },
  nextBtnGrad: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  nextBtnTextOff: { color: '#A0B8C4' },
  nextArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextArrowOff: { backgroundColor: 'rgba(160,184,196,0.2)' },
  nextArrowText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  nextArrowTextOff: { color: '#A0B8C4' },
});

export default BasicDetailsScreen;