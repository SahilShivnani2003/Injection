import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
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

const COMPLIMENTARY = [
  { id: 'sugar', name: 'Blood Sugar',   icon: '🍬', desc: 'Random / Fasting' },
  { id: 'group', name: 'Blood Group',   icon: '🩸', desc: 'ABO & Rh Typing'  },
  { id: 'hb',    name: 'Haemoglobin',  icon: '⚗️', desc: 'Hb Level Check'   },
];

const TIME_SLOTS = [
  '07:00 AM – 09:00 AM',
  '09:00 AM – 11:00 AM',
  '11:00 AM – 01:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
];

const STAFF = [
  { id: 'any',    name: 'Any Available', icon: '👨‍⚕️' },
  { id: 'male',   name: 'Male Staff',    icon: '👨'   },
  { id: 'female', name: 'Female Staff',  icon: '👩'   },
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

// ── Section label ────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <View style={styles.sectionLabelWrap}>
    <View style={styles.sectionAccent} />
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
    </View>
  </View>
);

// ── Complimentary card ───────────────────────────────────────────────────────
const CompCard: React.FC<{
  item: typeof COMPLIMENTARY[0];
  selected: boolean;
  onPress: () => void;
}> = ({ item, selected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, { toValue: selected ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [selected]);

  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: ['#D8E8EE', Colors.accent] });
  const bgColor     = borderAnim.interpolate({ inputRange: [0, 1], outputRange: ['#F8FBFC', '#EFF9E6'] });

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.compWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[styles.compCard, { borderColor, backgroundColor: bgColor }]}>
          {selected && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
          <Text style={styles.compIcon}>{item.icon}</Text>
          <Text style={[styles.compName, selected && styles.compNameSelected]}>{item.name}</Text>
          <Text style={[styles.compDesc, selected && styles.compDescSelected]}>{item.desc}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Time slot grid ───────────────────────────────────────────────────────────
const TimeGrid: React.FC<{ selected: string; onSelect: (t: string) => void }> = ({ selected, onSelect }) => (
  <View style={styles.timeGrid}>
    {TIME_SLOTS.map(slot => {
      const active = selected === slot;
      return (
        <TouchableOpacity
          key={slot}
          style={[styles.timeSlot, active && styles.timeSlotActive]}
          onPress={() => onSelect(slot)}
          activeOpacity={0.75}
        >
          <Text style={[styles.timeSlotText, active && styles.timeSlotTextActive]}>{slot}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── Staff picker ─────────────────────────────────────────────────────────────
const StaffPicker: React.FC<{ selected: string; onSelect: (id: string) => void }> = ({ selected, onSelect }) => (
  <View style={styles.staffRow}>
    {STAFF.map(s => {
      const active = selected === s.id;
      return (
        <TouchableOpacity
          key={s.id}
          style={[styles.staffCard, active && styles.staffCardActive]}
          onPress={() => onSelect(s.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.staffIcon}>{s.icon}</Text>
          <Text style={[styles.staffName, active && styles.staffNameActive]}>{s.name}</Text>
          {active && <View style={styles.staffCheck}><Text style={styles.staffCheckTick}>✓</Text></View>}
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
const ComplimentaryScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedTime, setSelectedTime]       = useState('');
  const [selectedStaff, setSelectedStaff]     = useState('any');

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

  const handleConfirm = () => {
    if (!selectedTime) {
      Alert.alert('Required', 'Please select your preferred time slot.');
      return;
    }
    Alert.alert(
      'Booking Confirmed!',
      `Your booking has been confirmed.\n\n` +
      `Free Service: ${selectedService ? COMPLIMENTARY.find(c => c.id === selectedService)?.name : 'None'}\n` +
      `Time: ${selectedTime}\n` +
      `Staff: ${STAFF.find(s => s.id === selectedStaff)?.name}\n\n` +
      `A confirmation SMS will be sent to your registered mobile.`,
      [{ text: 'OK', onPress: () => navigation.navigate('Splash') }]
    );
  };

  const canConfirm = !!selectedTime;

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
          <StepBar current={4} total={4} />
          <Text style={styles.stepLabel}>Step 4 of 4 • Almost done!</Text>
          <Text style={styles.headerTitle}>Final Preferences</Text>
          <Text style={styles.headerSub}>Pick your slot & complimentary service</Text>
        </Animated.View>

        {/* Gift badge */}
        <View style={styles.giftPill}>
          <Text style={styles.giftPillIcon}>🎁</Text>
          <Text style={styles.giftPillText}>Free service included</Text>
        </View>
      </LinearGradient>

      {/* ── White sheet ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, { opacity: sheetOp, transform: [{ translateY: sheetY }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── Complimentary ────────────────────────────────────── */}
          <SectionLabel title="Free Complimentary Service" sub="Choose any one — on us!" />
          <View style={styles.compRow}>
            {COMPLIMENTARY.map(item => (
              <CompCard
                key={item.id}
                item={item}
                selected={selectedService === item.id}
                onPress={() => setSelectedService(selectedService === item.id ? '' : item.id)}
              />
            ))}
          </View>

          {/* ── Time slot ─────────────────────────────────────────── */}
          <SectionLabel title="Preferred Time Slot" sub="Select when you'd like us to visit" />
          <TimeGrid selected={selectedTime} onSelect={setSelectedTime} />

          {/* ── Staff preference ──────────────────────────────────── */}
          <SectionLabel title="Staff Preference" sub="We'll do our best to accommodate" />
          <StaffPicker selected={selectedStaff} onSelect={setSelectedStaff} />

          {/* ── Confirm button ────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.confirmBtn, !canConfirm && styles.confirmBtnOff]}
            onPress={handleConfirm}
            activeOpacity={canConfirm ? 0.82 : 1}
          >
            <LinearGradient
              colors={canConfirm ? [Colors.accent, Colors.accentDark] : ['#E8F0F4', '#DDE8EE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.confirmBtnGrad}
            >
              <Text style={[styles.confirmBtnText, !canConfirm && styles.confirmBtnTextOff]}>
                Confirm Booking
              </Text>
              <View style={[styles.confirmArrow, !canConfirm && styles.confirmArrowOff]}>
                <Text style={[styles.confirmArrowText, !canConfirm && styles.confirmArrowTextOff]}>✓</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Our team will arrive within the selected time slot. You'll receive a confirmation call 30 mins prior.
          </Text>

        </ScrollView>
      </Animated.View>
    </View>
  );
};

const RADIUS = 32;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F7FA' },

  // Header
  header: {
    height: height * 0.30,
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
    top: Platform.OS === 'ios' ? 54 : 36, left: 20,
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
  giftPill: {
    position: 'absolute', right: 24, bottom: 22,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  giftPillIcon: { fontSize: 14 },
  giftPillText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

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

  // Section label
  sectionLabelWrap: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, marginBottom: 14, marginTop: 4,
  },
  sectionAccent: {
    width: 4, height: 18, borderRadius: 2,
    backgroundColor: Colors.gradientStart, marginTop: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  sectionSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  // Complimentary cards
  compRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  compWrap: { flex: 1 },
  compCard: {
    borderRadius: 16, borderWidth: 1.5,
    padding: 14, alignItems: 'center',
    position: 'relative',
  },
  freeBadge: {
    position: 'absolute', top: -8, right: -4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  freeBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  compIcon: { fontSize: 26, marginBottom: 8 },
  compName: { fontSize: 13, fontWeight: '700', color: Colors.textDark, textAlign: 'center' },
  compNameSelected: { color: Colors.accentDark },
  compDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 3 },
  compDescSelected: { color: '#5A8A00' },

  // Time grid
  timeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24,
  },
  timeSlot: {
    width: (width - 48 - 10) / 2,
    paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: '#D8E8EE', backgroundColor: '#F8FBFC',
    alignItems: 'center',
  },
  timeSlotActive: {
    borderColor: Colors.gradientStart,
    backgroundColor: '#E6FAF5',
  },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  timeSlotTextActive: { color: Colors.gradientStart, fontWeight: '800' },

  // Staff row
  staffRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  staffCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: '#D8E8EE', backgroundColor: '#F8FBFC',
    position: 'relative',
  },
  staffCardActive: {
    borderColor: Colors.gradientStart,
    backgroundColor: '#E6FAF5',
  },
  staffIcon: { fontSize: 24, marginBottom: 6 },
  staffName: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  staffNameActive: { color: Colors.gradientStart, fontWeight: '800' },
  staffCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.gradientStart,
    alignItems: 'center', justifyContent: 'center',
  },
  staffCheckTick: { color: Colors.white, fontSize: 10, fontWeight: '900' },

  // Confirm button
  confirmBtn: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    marginBottom: 16,
  },
  confirmBtnOff: { shadowOpacity: 0, elevation: 0 },
  confirmBtnGrad: {
    flexDirection: 'row', paddingVertical: 16,
    paddingHorizontal: 28, alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  confirmBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
  confirmBtnTextOff: { color: '#A0B8C4' },
  confirmArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmArrowOff: { backgroundColor: 'rgba(160,184,196,0.2)' },
  confirmArrowText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  confirmArrowTextOff: { color: '#A0B8C4' },

  disclaimer: {
    color: Colors.textMuted, fontSize: 11,
    textAlign: 'center', lineHeight: 17,
  },
});

export default ComplimentaryScreen;