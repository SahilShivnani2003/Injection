import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type StaffPanelProps = NativeStackScreenProps<RootStackParamList, 'StaffPanel'>;

const StaffPanelScreen = ({ navigation }: StaffPanelProps) => {
  const [activeTab, setActiveTab] = useState('assignments');

  const mockAssignments = [
    {
      id: 'ASS001',
      patient: 'John Doe',
      address: '123 Main St, City',
      test: 'Blood Test',
      time: '10:00 AM',
      status: 'assigned',
      phone: '+91 9876543210',
    },
    {
      id: 'ASS002',
      patient: 'Jane Smith',
      address: '456 Oak Ave, City',
      test: 'Urine Test',
      time: '2:00 PM',
      status: 'completed',
      phone: '+91 9876543211',
    },
  ];

  const mockEarnings = {
    today: 1200,
    week: 8500,
    month: 32000,
    total: 125000,
  };

  const handleMarkCollected = (assignmentId: string) => {
    Alert.alert(
      'Mark as Collected',
      'Upload sample image to confirm collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload', onPress: () => Alert.alert('Success', 'Sample collected and uploaded!') },
      ]
    );
  };

  const handleCallPatient = (phone: string) => {
    Alert.alert('Call Patient', `Calling ${phone}...`);
  };

  const handleNavigate = (address: string) => {
    Alert.alert('Navigate', `Opening maps to ${address}`);
  };

  const renderAssignment = ({ item }: { item: typeof mockAssignments[0] }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentId}>{item.id}</Text>
        <Text style={[styles.assignmentStatus, item.status === 'completed' && styles.statusCompleted]}>
          {item.status === 'completed' ? 'Completed' : 'Assigned'}
        </Text>
      </View>

      <Text style={styles.patientName}>{item.patient}</Text>
      <Text style={styles.testType}>{item.test}</Text>
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.time}>⏰ {item.time}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleCallPatient(item.phone)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>📞 Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleNavigate(item.address)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>🗺️ Navigate</Text>
        </TouchableOpacity>

        {item.status !== 'completed' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.collectBtn]}
            onPress={() => handleMarkCollected(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.collectText}>✓ Collect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'assignments':
        return (
          <View>
            <Text style={styles.sectionTitle}>Today's Assignments</Text>
            <FlatList
              data={mockAssignments}
              renderItem={renderAssignment}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      case 'earnings':
        return (
          <View>
            <Text style={styles.sectionTitle}>Earnings Summary</Text>
            <View style={styles.earningsGrid}>
              <View style={styles.earningCard}>
                <Text style={styles.earningValue}>₹{mockEarnings.today}</Text>
                <Text style={styles.earningLabel}>Today</Text>
              </View>
              <View style={styles.earningCard}>
                <Text style={styles.earningValue}>₹{mockEarnings.week}</Text>
                <Text style={styles.earningLabel}>This Week</Text>
              </View>
              <View style={styles.earningCard}>
                <Text style={styles.earningValue}>₹{mockEarnings.month}</Text>
                <Text style={styles.earningLabel}>This Month</Text>
              </View>
              <View style={styles.earningCard}>
                <Text style={styles.earningValue}>₹{mockEarnings.total}</Text>
                <Text style={styles.earningLabel}>Total</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.payoutBtn} onPress={() => Alert.alert('Payout', 'Request payout functionality')}>
              <Text style={styles.payoutText}>Request Payout</Text>
            </TouchableOpacity>
          </View>
        );
      case 'profile':
        return (
          <View>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.profileCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/100x100?text=Staff' }}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>Dr. Rajesh Kumar</Text>
              <Text style={styles.profileRole}>Phlebotomist</Text>
              <Text style={styles.profileId}>ID: PHL001</Text>
            </View>

            <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert('Edit Profile', 'Edit profile functionality')}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
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
        <Text style={styles.headerTitle}>Staff Panel</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        {[
          { key: 'assignments', label: 'Assignments' },
          { key: 'earnings', label: 'Earnings' },
          { key: 'profile', label: 'Profile' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.gradientStart,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMedium,
  },
  tabTextActive: {
    color: Colors.white,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },

  // Assignments
  assignmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  assignmentId: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  assignmentStatus: { fontSize: 12, fontWeight: '600', color: Colors.textMedium },
  statusCompleted: { color: Colors.accent },
  patientName: { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  testType: { fontSize: 14, color: Colors.textMedium, marginBottom: 4 },
  address: { fontSize: 14, color: Colors.textDark, marginBottom: 4 },
  time: { fontSize: 14, color: Colors.textMedium, marginBottom: 12 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textDark },
  collectBtn: { backgroundColor: Colors.gradientStart, borderColor: Colors.gradientStart },
  collectText: { color: Colors.white },

  // Earnings
  earningsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  earningCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  earningValue: { fontSize: 20, fontWeight: '700', color: Colors.gradientStart },
  earningLabel: { fontSize: 12, color: Colors.textMedium, marginTop: 4 },
  payoutBtn: {
    backgroundColor: Colors.gradientStart,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payoutText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  // Profile
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  profileRole: { fontSize: 14, color: Colors.textMedium, marginBottom: 4 },
  profileId: { fontSize: 12, color: Colors.textMuted },
  editBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  editText: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
});

export default StaffPanelScreen;