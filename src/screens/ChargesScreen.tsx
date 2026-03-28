import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');
type chargesProps = NativeStackScreenProps<RootStackParamList, 'Charges'>;


const ALL_SERVICES = [
  { id: 1, name: 'IV Fluid Administration',  charge: 350, icon: '💧' },
  { id: 2, name: 'Injection Service',         charge: 150, icon: '💉' },
  { id: 3, name: 'Blood Collection',          charge: 200, icon: '🩸' },
  { id: 4, name: 'Wound Dressing',            charge: 300, icon: '🩹' },
  { id: 5, name: 'BP / Sugar Monitoring',     charge: 100, icon: '📊' },
  { id: 6, name: 'ECG at Home',               charge: 500, icon: '❤️' },
  { id: 7, name: 'Catheter Care',             charge: 400, icon: '🏥' },
  { id: 8, name: 'Physiotherapy Session',     charge: 600, icon: '🤸' },
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

// ── Service row in the charges list ─────────────────────────────────────────
const ServiceRow: React.FC<{
  index: number;
  name: string;
  icon: string;
  charge: number;
  isLast: boolean;
}> = ({ index, name, icon, charge, isLast }) => (
  <View style={[styles.serviceRow, !isLast && styles.serviceRowBorder]}>
    <View style={styles.serviceIndexBox}>
      <Text style={styles.serviceIndex}>{index + 1}</Text>
    </View>
    <Text style={styles.serviceRowIcon}>{icon}</Text>
    <Text style={styles.serviceRowName}>{name}</Text>
    <Text style={styles.serviceRowCharge}>₹{charge}</Text>
  </View>
);

// ── Summary row ──────────────────────────────────────────────────────────────
const SummaryRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}> = ({ label, value, bold, accent }) => (
  <View style={[styles.summaryRow, accent && styles.summaryRowAccent]}>
    <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold, accent && styles.summaryLabelAccent]}>
      {label}
    </Text>
    <Text style={[styles.summaryValue, bold && styles.summaryValueBold, accent && styles.summaryValueAccent]}>
      {value}
    </Text>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
const ChargesScreen = ({ navigation, route }: chargesProps) => {
  const selectedIds: number[] = route?.params?.selectedServices || [1, 2, 4];
  const selected = ALL_SERVICES.filter(s => selectedIds.includes(s.id));
  const subtotal   = selected.reduce((sum, s) => sum + s.charge, 0);
  const gst        = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  const sheetY  = useRef(new Animated.Value(60)).current;
  const sheetOp = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;
  const headerOp= useRef(new Animated.Value(0)).current;
  const totalScale = useRef(new Animated.Value(0.85)).current;
  const totalOp    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(sheetY,   { toValue: 0, duration: 580, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sheetOp,  { toValue: 1, duration: 580, delay: 140, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(totalScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(totalOp,   { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

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
          <StepBar current={3} total={4} />
          <Text style={styles.stepLabel}>Step 3 of 4</Text>
          <Text style={styles.headerTitle}>Charges Summary</Text>
          <Text style={styles.headerSub}>Review your selected services</Text>
        </Animated.View>

        {/* Grand total floating pill in header */}
        <Animated.View style={[styles.totalPill, { opacity: totalOp, transform: [{ scale: totalScale }] }]}>
          <Text style={styles.totalPillLabel}>Grand Total</Text>
          <Text style={styles.totalPillValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </Animated.View>
      </LinearGradient>

      {/* ── White sheet ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, { opacity: sheetOp, transform: [{ translateY: sheetY }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── Services list ─────────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Selected Services</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selected.length}</Text>
            </View>
          </View>

          <View style={styles.servicesList}>
            {selected.length > 0 ? (
              selected.map((s, i) => (
                <ServiceRow
                  key={s.id}
                  index={i}
                  name={s.name}
                  icon={s.icon}
                  charge={s.charge}
                  isLast={i === selected.length - 1}
                />
              ))
            ) : (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No services selected</Text>
              </View>
            )}
          </View>

          {/* ── Bill summary ──────────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Bill Summary</Text>
          </View>

          <View style={styles.billCard}>
            <SummaryRow
              label="Subtotal"
              value={`₹${subtotal.toLocaleString('en-IN')}`}
            />
            <View style={styles.billDivider} />
            <SummaryRow
              label="GST & Other Tax (18%)"
              value={`₹${gst.toLocaleString('en-IN')}`}
            />
            <View style={styles.billDividerThick} />
            <SummaryRow
              label="Grand Total"
              value={`₹${grandTotal.toLocaleString('en-IN')}`}
              bold
              accent
            />
          </View>

          {/* ── Info chips ────────────────────────────────────────── */}
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipIcon}>🛒</Text>
              <Text style={styles.chipText}>{selected.length} service{selected.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipIcon}>🕐</Text>
              <Text style={styles.chipText}>Est. 45 mins</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipIcon}>🏠</Text>
              <Text style={styles.chipText}>At Home</Text>
            </View>
          </View>

          {/* ── Confirm button ────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => navigation.navigate('Complimentary')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.confirmBtnGrad}
            >
              <Text style={styles.confirmBtnText}>Proceed to Booking</Text>
              <View style={styles.confirmArrow}>
                <Text style={styles.confirmArrowText}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Prices include visiting charges. GST applicable as per government norms.
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

  // Total pill floating in header
  totalPill: {
    position: 'absolute', right: 24, bottom: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignItems: 'flex-end',
  },
  totalPillLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600', letterSpacing: 0.8 },
  totalPillValue: { fontSize: 18, color: Colors.white, fontWeight: '900', letterSpacing: 0.3 },

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

  // Section headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 14, marginTop: 4,
  },
  sectionAccent: {
    width: 4, height: 18, borderRadius: 2,
    backgroundColor: Colors.gradientStart,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, flex: 1 },
  countBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.gradientStart,
    alignItems: 'center', justifyContent: 'center',
  },
  countBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '800' },

  // Services list
  servicesList: {
    borderRadius: 16, borderWidth: 1.5,
    borderColor: '#D8E8EE', overflow: 'hidden',
    marginBottom: 24, backgroundColor: Colors.white,
  },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 10,
  },
  serviceRowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF5F8' },
  serviceIndexBox: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F0F7FA',
    alignItems: 'center', justifyContent: 'center',
  },
  serviceIndex: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  serviceRowIcon: { fontSize: 18 },
  serviceRowName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
  serviceRowCharge: { fontSize: 15, fontWeight: '800', color: Colors.gradientStart },
  emptyRow: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted },

  // Bill card
  billCard: {
    borderRadius: 16, borderWidth: 1.5,
    borderColor: '#D8E8EE', overflow: 'hidden',
    marginBottom: 20, backgroundColor: Colors.white,
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  summaryRowAccent: { backgroundColor: '#E6FAF5' },
  summaryLabel: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  summaryLabelBold: { fontWeight: '700', color: Colors.textDark },
  summaryLabelAccent: { fontWeight: '800', color: '#0A6B50', fontSize: 15 },
  summaryValue: { fontSize: 14, color: Colors.textDark, fontWeight: '600' },
  summaryValueBold: { fontWeight: '800' },
  summaryValueAccent: { fontSize: 17, fontWeight: '900', color: '#0A6B50' },
  billDivider: { height: 1, backgroundColor: '#EEF5F8', marginHorizontal: 16 },
  billDividerThick: { height: 2, backgroundColor: '#D8E8EE' },

  // Chips
  chipRow: {
    flexDirection: 'row', gap: 10, marginBottom: 24,
  },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FBFC',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#D8E8EE',
    paddingVertical: 10, paddingHorizontal: 10, gap: 6,
    justifyContent: 'center',
  },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },

  // Confirm button
  confirmBtn: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    marginBottom: 16,
  },
  confirmBtnGrad: {
    flexDirection: 'row', paddingVertical: 16,
    paddingHorizontal: 28, alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  confirmBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
  confirmArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmArrowText: { color: Colors.white, fontSize: 16, fontWeight: '800' },

  disclaimer: {
    color: Colors.textMuted, fontSize: 11,
    textAlign: 'center', lineHeight: 17,
  },
});

export default ChargesScreen;