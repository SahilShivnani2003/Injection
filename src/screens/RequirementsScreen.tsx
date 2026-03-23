import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const SERVICES = [
  { id: 1, name: 'IV Fluid\nAdministration', icon: '💧' },
  { id: 2, name: 'Injection\nService',        icon: '💉' },
  { id: 3, name: 'Blood\nCollection',         icon: '🩸' },
  { id: 4, name: 'Wound\nDressing',           icon: '🩹' },
  { id: 5, name: 'BP / Sugar\nMonitoring',    icon: '📊' },
  { id: 6, name: 'ECG at\nHome',              icon: '❤️' },
  { id: 7, name: 'Catheter\nCare',            icon: '🏥' },
  { id: 8, name: 'Physiotherapy\nSession',    icon: '🤸' },
];

// ── Step progress bar ────────────────────────────────────────────────────────
const StepBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={styles.stepBar}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.stepSegment,
          i < current ? styles.stepDone : styles.stepPending,
          i < total - 1 && { marginRight: 6 },
        ]}
      />
    ))}
  </View>
);

// ── Service card ─────────────────────────────────────────────────────────────
const ServiceCard: React.FC<{
  service: typeof SERVICES[0];
  selected: boolean;
  onPress: () => void;
}> = ({ service, selected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim    = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const borderColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D8E8EE', Colors.gradientStart],
  });
  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F8FBFC', '#E6FAF5'],
  });

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[styles.serviceCard, { borderColor, backgroundColor: bgColor }]}>
          {/* Selected check */}
          {selected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedTick}>✓</Text>
            </View>
          )}
          <Text style={styles.serviceIcon}>{service.icon}</Text>
          <Text style={[styles.serviceName, selected && styles.serviceNameSelected]}>
            {service.name}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionRow}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
const RequirementsScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected]         = useState<number[]>([]);
  const [otherText, setOtherText]       = useState('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [policyNo, setPolicyNo]         = useState('');
  const [policyFetched, setPolicyFetched] = useState(false);
  const [otherFocused, setOtherFocused]   = useState(false);
  const [policyFocused, setPolicyFocused] = useState(false);

  const sheetY  = useRef(new Animated.Value(60)).current;
  const sheetOp = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;
  const headerOp= useRef(new Animated.Value(0)).current;

  const insHeight = useRef(new Animated.Value(0)).current;
  const insOp     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(sheetY,   { toValue: 0, duration: 580, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(sheetOp,  { toValue: 1, duration: 580, delay: 140, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(insHeight, {
        toValue: hasInsurance ? 1 : 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(insOp, {
        toValue: hasInsurance ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasInsurance]);

  const toggleService = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleFetchPolicy = () => {
    if (!policyNo.trim()) { Alert.alert('Policy Required', 'Please enter your policy number.'); return; }
    setPolicyFetched(true);
    Alert.alert('Policy Found', `Policy No. ${policyNo} — Active\nCoverage: ₹5,00,000\nExpiry: 31-Dec-2025`);
  };

  const handleNext = () => {
    if (selected.length === 0 && !otherText.trim()) {
      Alert.alert('Select Service', 'Please select at least one service.');
      return;
    }
    navigation.navigate('Charges', { selectedServices: selected });
  };

  const insMaxHeight = insHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 180] });
  const canNext = selected.length > 0 || otherText.trim().length > 0;

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

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: headerOp, transform: [{ translateY: headerY }] }}>
          <StepBar current={2} total={4} />
          <Text style={styles.stepLabel}>Step 2 of 4</Text>
          <Text style={styles.headerTitle}>Select Services</Text>
          <Text style={styles.headerSub}>Choose the services you need</Text>
        </Animated.View>

        {/* Selection counter pill */}
        {selected.length > 0 && (
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{selected.length} selected</Text>
          </View>
        )}
      </LinearGradient>

      {/* ── White sheet ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, { opacity: sheetOp, transform: [{ translateY: sheetY }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── Service grid ───────────────────────────────────────── */}
          <SectionLabel title="Available Services" />

          <View style={styles.grid}>
            {SERVICES.map(s => (
              <ServiceCard
                key={s.id}
                service={s}
                selected={selected.includes(s.id)}
                onPress={() => toggleService(s.id)}
              />
            ))}
          </View>

          {/* ── Other requirement ──────────────────────────────────── */}
          <SectionLabel title="Other Requirement" />

          <Animated.View
            style={[
              styles.otherBox,
              otherFocused && styles.otherBoxFocused,
            ]}
          >
            <TextInput
              style={styles.otherInput}
              placeholder="Describe any additional requirement here..."
              placeholderTextColor="#B0C4CC"
              value={otherText}
              onChangeText={setOtherText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setOtherFocused(true)}
              onBlur={() => setOtherFocused(false)}
            />
          </Animated.View>

          {/* ── Upload prescription ────────────────────────────────── */}
          <SectionLabel title="Documents" />

          <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
            <View style={styles.uploadIconBox}>
              <Text style={styles.uploadIconText}>📄</Text>
            </View>
            <View style={styles.uploadTextBox}>
              <Text style={styles.uploadTitle}>Upload Prescription</Text>
              <Text style={styles.uploadSub}>Dr. slip / prescription (optional)</Text>
            </View>
            <Text style={styles.uploadArrow}>+</Text>
          </TouchableOpacity>

          {/* ── Insurance ──────────────────────────────────────────── */}
          <SectionLabel title="Insurance" />

          <TouchableOpacity
            style={styles.insuranceToggle}
            onPress={() => { setHasInsurance(!hasInsurance); if (hasInsurance) { setPolicyNo(''); setPolicyFetched(false); }}}
            activeOpacity={0.75}
          >
            <View style={[styles.checkbox, hasInsurance && styles.checkboxOn]}>
              {hasInsurance && <Text style={styles.tick}>✓</Text>}
            </View>
            <View style={styles.insToggleText}>
              <Text style={styles.insToggleTitle}>I have health insurance</Text>
              <Text style={styles.insToggleSub}>Tap to add your policy details</Text>
            </View>
            <View style={[styles.insChevron, hasInsurance && styles.insChevronOpen]}>
              <Text style={styles.insChevronText}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Insurance fields — animated reveal */}
          <Animated.View style={{ maxHeight: insMaxHeight, opacity: insOp, overflow: 'hidden' }}>
            <View style={styles.insBlock}>
              <Text style={styles.fieldLabel}>Policy Number</Text>
              <View style={[styles.policyRow, policyFocused && styles.policyRowFocused]}>
                <TextInput
                  style={styles.policyInput}
                  placeholder="Enter your policy number"
                  placeholderTextColor="#B0C4CC"
                  value={policyNo}
                  onChangeText={t => { setPolicyNo(t); setPolicyFetched(false); }}
                  onFocus={() => setPolicyFocused(true)}
                  onBlur={() => setPolicyFocused(false)}
                />
              </View>
              <TouchableOpacity
                style={[styles.fetchBtn, policyFetched && styles.fetchBtnDone]}
                onPress={handleFetchPolicy}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={policyFetched ? [Colors.accent, Colors.accentDark] : [Colors.gradientStart, Colors.gradientEnd]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.fetchBtnGrad}
                >
                  <Text style={styles.fetchBtnText}>
                    {policyFetched ? '✓  Policy Verified' : 'Fetch Policy Details'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Next button ────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.nextBtn, !canNext && styles.nextBtnOff]}
            onPress={handleNext}
            activeOpacity={canNext ? 0.82 : 1}
          >
            <LinearGradient
              colors={canNext ? [Colors.accent, Colors.accentDark] : ['#E8F0F4', '#DDE8EE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.nextBtnGrad}
            >
              <Text style={[styles.nextBtnText, !canNext && styles.nextBtnTextOff]}>
                Next Step
              </Text>
              <View style={[styles.nextArrow, !canNext && styles.nextArrowOff]}>
                <Text style={[styles.nextArrowText, !canNext && styles.nextArrowTextOff]}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </View>
  );
};

const RADIUS = 32;
const CARD_W = (width - 48 - 24) / 4; // 4 per row with gaps

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
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: Colors.white, fontSize: 18, fontWeight: '700', marginTop: -1 },
  stepBar: { flexDirection: 'row', marginBottom: 10 },
  stepSegment: { flex: 1, height: 4, borderRadius: 2 },
  stepDone: { backgroundColor: Colors.white },
  stepPending: { backgroundColor: 'rgba(255,255,255,0.3)' },
  stepLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 0.8, marginBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: 0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
  counterPill: {
    position: 'absolute', right: 24, bottom: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  counterText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS,
    marginTop: -RADIUS,
    shadowColor: '#004466',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 12,
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },

  // Section divider
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16, marginTop: 8, gap: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#E8F0F4' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // Service grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  cardWrap: { width: CARD_W },
  serviceCard: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.gradientStart,
    alignItems: 'center', justifyContent: 'center',
  },
  selectedTick: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  serviceIcon: { fontSize: 22, marginBottom: 6 },
  serviceName: {
    fontSize: 9.5, color: Colors.textMuted,
    textAlign: 'center', fontWeight: '600',
    lineHeight: 13, letterSpacing: 0.2,
  },
  serviceNameSelected: { color: Colors.gradientStart },

  // Other
  otherBox: {
    borderWidth: 1.5, borderColor: '#D8E8EE',
    borderRadius: 14, backgroundColor: '#F8FBFC',
    padding: 14, marginBottom: 8,
    minHeight: 90,
  },
  otherBoxFocused: { borderColor: Colors.gradientStart },
  otherInput: {
    fontSize: 14, color: Colors.textDark,
    fontWeight: '500', minHeight: 64,
    padding: 0,
  },

  // Upload
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FBFC',
    borderRadius: 14, borderWidth: 1.5,
    borderColor: '#D8E8EE', padding: 14,
    marginBottom: 8, gap: 14,
  },
  uploadIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#E6FAF5',
    borderWidth: 1, borderColor: '#B0E8D4',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadIconText: { fontSize: 20 },
  uploadTextBox: { flex: 1 },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  uploadSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  uploadArrow: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },

  // Insurance toggle
  insuranceToggle: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FBFC', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#D8E8EE',
    padding: 14, marginBottom: 8, gap: 12,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 2, borderColor: '#C8DDE5',
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accentDark },
  tick: { color: Colors.white, fontSize: 13, fontWeight: '900' },
  insToggleText: { flex: 1 },
  insToggleTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  insToggleSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  insChevron: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E8F0F4',
    alignItems: 'center', justifyContent: 'center',
  },
  insChevronOpen: { backgroundColor: '#E6FAF5' },
  insChevronText: { fontSize: 18, color: Colors.textMuted, lineHeight: 22 },

  // Insurance block
  insBlock: { paddingBottom: 8 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
  },
  policyRow: {
    borderWidth: 1.5, borderColor: '#D8E8EE',
    borderRadius: 14, backgroundColor: '#F8FBFC',
    paddingHorizontal: 16, height: 52,
    justifyContent: 'center', marginBottom: 10,
  },
  policyRowFocused: { borderColor: Colors.gradientStart },
  policyInput: { fontSize: 15, color: Colors.textDark, fontWeight: '500' },
  fetchBtn: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: Colors.gradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  fetchBtnDone: { shadowColor: Colors.accentDark },
  fetchBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  fetchBtnText: { color: Colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  // Next
  nextBtn: {
    borderRadius: 16, overflow: 'hidden', marginTop: 24,
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  nextBtnOff: { shadowOpacity: 0, elevation: 0 },
  nextBtnGrad: {
    flexDirection: 'row', paddingVertical: 16,
    paddingHorizontal: 28, alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  nextBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
  nextBtnTextOff: { color: '#A0B8C4' },
  nextArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  nextArrowOff: { backgroundColor: 'rgba(160,184,196,0.2)' },
  nextArrowText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  nextArrowTextOff: { color: '#A0B8C4' },
});

export default RequirementsScreen;