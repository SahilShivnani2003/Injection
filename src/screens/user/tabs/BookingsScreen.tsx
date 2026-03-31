import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';

type BookingsProps = NativeStackScreenProps<RootStackParamList, 'Bookings'>;

const bookingData = [
  {
    id: '1',
    type: 'Nurse Visit',
    date: 'Apr 2, 2026',
    time: '10:30 AM',
    status: 'Upcoming',
  },
  {
    id: '2',
    type: 'Physician Teleconsult',
    date: 'Mar 25, 2026',
    time: '2:00 PM',
    status: 'Completed',
  },
  {
    id: '3',
    type: 'Lab Sample Pickup',
    date: 'Mar 13, 2026',
    time: '11:00 AM',
    status: 'Completed',
  },
];

const BookingsScreen = ({ navigation }: BookingsProps) => {
  const renderItem = ({ item }: { item: typeof bookingData[0] }) => {
    const statusColor =
      item.status === 'Upcoming' ? Colors.gradientStart : Colors.textMuted;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.type}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{item.status}</Text>
        </View>
        <Text style={styles.datetime}>{`${item.date} • ${item.time}`}</Text>
      </View>
    );
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
        <Text style={styles.headerTitle}>My Bookings</Text>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Current & past bookings</Text>

        <FlatList
          data={bookingData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  backBtn: {
    position: 'absolute',
    left: 18,
    top: 60,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { color: Colors.textLight, fontSize: 18, fontWeight: '700' },
  headerTitle: { color: Colors.textLight, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  container: { padding: 16, paddingTop: 20, flex: 1 },
  sectionTitle: { fontSize: 16, color: Colors.textDark, fontWeight: '700', marginBottom: 14 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.tableBorder,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 15, color: Colors.textDark, fontWeight: '700' },
  status: { fontSize: 13, fontWeight: '700' },
  datetime: { fontSize: 13, color: Colors.textMedium },
  actionBtn: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: Colors.gradientStart,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnText: { color: Colors.white, fontWeight: '700' },
});

export default BookingsScreen;
