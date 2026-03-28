import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const metricCards = [
  { label: 'Upcoming Visits', value: '2', color: '#E0F8FF' },
  { label: 'Prescriptions', value: '5', color: '#E8FFF1' },
  { label: 'Completed', value: '19', color: '#FFF9E6' },
  { label: 'Messages', value: '3', color: '#F5E8FF' },
];

const DashboardScreen = ({ navigation }: DashboardProps) => {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.hello}>Good morning,</Text>
            <Text style={styles.name}>Jane Doe</Text>
            <Text style={styles.sub}>{'Your care status in one place'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>
        <View style={styles.topButtons}>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.75}
          >
            <Text style={styles.profileBtnText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileBtn, styles.bookingBtn]}
            onPress={() => navigation.navigate('Bookings')}
            activeOpacity={0.75}
          >
            <Text style={styles.profileBtnText}>Bookings</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardGrid}>
          {metricCards.map(card => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: card.color }]}> 
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>Apr 2, 2026</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>10:30 AM</Text>
            </View>
          </View>
          <Text style={styles.infoSub}>Nursing visit for wound care at your home</Text>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.78}>
            <Text style={styles.primaryBtnText}>View details</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.accent }]}> 
            <Text style={[styles.actionText, { color: Colors.accent }]}>Add Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.gradientStart }]}> 
            <Text style={[styles.actionText, { color: Colors.gradientStart }]}>Book Follow-up</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your Recent Activity</Text>
        <View style={styles.activityCard}> 
          <Text style={styles.activityText}>You completed 4 nurse visits last week. Keep up the excellent progress!</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutText}>Log out</Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topButtons: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.24)',
    marginRight: 10,
  },
  bookingBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  profileBtnText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  hello: {
    color: Colors.textLight,
    fontSize: 16,
    opacity: 0.85,
  },
  name: {
    color: Colors.textLight,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  sub: {
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 2,
    opacity: 0.95,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.textLight, fontWeight: '700', fontSize: 16 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: (width - 54) / 2,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
  },
  statLabel: { fontSize: 12, color: Colors.textMedium, marginTop: 6 },
  sectionTitle: { fontSize: 16, color: Colors.textDark, fontWeight: '700', marginBottom: 12 },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 12, color: Colors.textMuted },
  infoValue: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  infoSub: { fontSize: 13, color: Colors.textMedium, marginBottom: 12 },
  primaryBtn: {
    backgroundColor: Colors.gradientStart,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  primaryBtnText: { color: Colors.white, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    width: (width - 52) / 2,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontWeight: '700', fontSize: 14 },
  activityCard: {
    backgroundColor: 'rgba(0, 180, 232, 0.10)',
    borderRadius: 12,
    padding: 14,
  },
  activityText: { color: Colors.textDark, fontSize: 14, lineHeight: 20 },
  logoutBtn: {
    marginTop: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.textMuted,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logoutText: { color: Colors.textMuted, fontWeight: '700' },
});

export default DashboardScreen;
