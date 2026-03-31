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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type LabPartnerProps = NativeStackScreenProps<RootStackParamList, 'LabPartner'>;

const LabPartnerScreen = ({ navigation }: LabPartnerProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const mockStats = {
    totalBookings: 245,
    revenue: 125000,
    pendingPayout: 25000,
    activeStaff: 12,
  };

  const mockOrders = [
    { id: 'ORD001', patient: 'John Doe', test: 'Blood Test', status: 'Completed', amount: 500 },
    { id: 'ORD002', patient: 'Jane Smith', test: 'X-Ray', status: 'Processing', amount: 800 },
    { id: 'ORD003', patient: 'Bob Johnson', test: 'MRI', status: 'Pending', amount: 2500 },
  ];

  const renderOrder = ({ item }: { item: typeof mockOrders[0] }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.id}</Text>
        <Text style={[styles.orderStatus, item.status === 'Completed' && styles.statusCompleted]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.orderPatient}>{item.patient}</Text>
      <Text style={styles.orderTest}>{item.test}</Text>
      <Text style={styles.orderAmount}>₹{item.amount}</Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <View>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{mockStats.totalBookings}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>₹{mockStats.revenue}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>₹{mockStats.pendingPayout}</Text>
                <Text style={styles.statLabel}>Pending Payout</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{mockStats.activeStaff}</Text>
                <Text style={styles.statLabel}>Active Staff</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <FlatList
              data={mockOrders}
              renderItem={renderOrder}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      case 'tests':
        return (
          <View>
            <Text style={styles.sectionTitle}>Test Management</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Add Test', 'Add new test functionality')}>
              <Text style={styles.actionText}>+ Add New Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Manage Prices', 'Price management functionality')}>
              <Text style={styles.actionText}>Manage Pricing</Text>
            </TouchableOpacity>
          </View>
        );
      case 'staff':
        return (
          <View>
            <Text style={styles.sectionTitle}>Staff Management</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Add Staff', 'Add new staff functionality')}>
              <Text style={styles.actionText}>+ Add Phlebotomist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Track Staff', 'Staff tracking functionality')}>
              <Text style={styles.actionText}>Track Live Location</Text>
            </TouchableOpacity>
          </View>
        );
      case 'payouts':
        return (
          <View>
            <Text style={styles.sectionTitle}>Payout Management</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('View Payouts', 'Payout history functionality')}>
              <Text style={styles.actionText}>View Payout History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Commission', 'Commission settings functionality')}>
              <Text style={styles.actionText}>Commission Settings</Text>
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
        <Text style={styles.headerTitle}>Lab Partner Panel</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'tests', label: 'Tests' },
          { key: 'staff', label: 'Staff' },
          { key: 'payouts', label: 'Payouts' },
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
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
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.textDark },
  statLabel: { fontSize: 12, color: Colors.textMedium, marginTop: 4 },
  orderCard: {
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
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  orderStatus: { fontSize: 12, fontWeight: '600', color: Colors.textMedium },
  statusCompleted: { color: Colors.accent },
  orderPatient: { fontSize: 14, color: Colors.textDark, marginBottom: 4 },
  orderTest: { fontSize: 14, color: Colors.textMedium, marginBottom: 8 },
  orderAmount: { fontSize: 16, fontWeight: '600', color: Colors.gradientStart },
  actionBtn: {
    backgroundColor: Colors.gradientStart,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});

export default LabPartnerScreen;