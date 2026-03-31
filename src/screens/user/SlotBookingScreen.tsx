import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingAPI } from '../../service/apis/bookingService';

type SlotBookingProps = NativeStackScreenProps<RootStackParamList, 'SlotBooking'>;

const SlotBookingScreen = ({ navigation }: SlotBookingProps) => {
  const { bookingData, updateSlot, calculateCharges, setStep, isLoading, setLoading } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(bookingData.selectedDate || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(bookingData.selectedTime || null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(bookingData.selectedStaff || 'any');
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        // Fetch available dates (mock for now)
        const dates = [
          { date: '2026-03-31', day: 'Today', display: '31 Mar' },
          { date: '2026-04-01', day: 'Tomorrow', display: '1 Apr' },
          { date: '2026-04-02', day: 'Wed', display: '2 Apr' },
          { date: '2026-04-03', day: 'Thu', display: '3 Apr' },
          { date: '2026-04-04', day: 'Fri', display: '4 Apr' },
        ];
        setAvailableDates(dates);

        // Set default staff options
        setStaffOptions([
          { id: 'any', name: 'Any Available', icon: '👨‍⚕️' },
          { id: 'male', name: 'Male Staff', icon: '👨' },
          { id: 'female', name: 'Female Staff', icon: '👩' },
        ]);
      } catch (error) {
        console.error('Failed to fetch available slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, []);

  useEffect(() => {
    // Fetch available times when date changes
    if (selectedDate) {
      const fetchTimesForDate = async () => {
        try {
          const response = await bookingAPI.getAvailableSlots(selectedDate);
          setAvailableTimes(response.data);
        } catch (error) {
          // Fallback to mock times
          setAvailableTimes([
            '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
          ]);
        }
      };
      fetchTimesForDate();
    }
  }, [selectedDate]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    // Save slot booking data
    updateSlot({
      date: selectedDate,
      time: selectedTime,
      staff: selectedStaff as 'any' | 'male' | 'female'
    });

    // Calculate charges
    calculateCharges();

    navigation.navigate('Charges', { selectedServices: bookingData.selectedServices || [] });
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
        <Text style={styles.headerTitle}>Book Your Slot</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Preferred Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {availableDates.map((item) => (
              <TouchableOpacity
                key={item.date}
                style={[
                  styles.dateCard,
                  selectedDate === item.date && styles.dateCardSelected
                ]}
                onPress={() => setSelectedDate(item.date)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dateDay,
                  selectedDate === item.date && styles.dateDaySelected
                ]}>
                  {item.day}
                </Text>
                <Text style={[
                  styles.dateDisplay,
                  selectedDate === item.date && styles.dateDisplaySelected
                ]}>
                  {item.display}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Preferred Time</Text>
          <View style={styles.timeGrid}>
            {availableTimes.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeCard,
                  selectedTime === time && styles.timeCardSelected
                ]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.timeTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Staff Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Staff (Optional)</Text>
          <View style={styles.staffGrid}>
            {staffOptions.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={[
                  styles.staffCard,
                  selectedStaff === staff.id && styles.staffCardSelected
                ]}
                onPress={() => setSelectedStaff(staff.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.staffIcon}>{staff.icon}</Text>
                <Text style={[
                  styles.staffName,
                  selectedStaff === staff.id && styles.staffNameSelected
                ]}>
                  {staff.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmText}>Confirm Booking</Text>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  sectionSub: { fontSize: 14, color: Colors.textMedium, marginBottom: 12 },

  // Date selection
  dateScroll: { marginBottom: 8 },
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  dateCardSelected: {
    borderColor: Colors.gradientStart,
    backgroundColor: 'rgba(0, 212, 160, 0.05)',
  },
  dateDay: { fontSize: 12, color: Colors.textMedium, marginBottom: 4 },
  dateDaySelected: { color: Colors.gradientStart, fontWeight: '600' },
  dateDisplay: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
  dateDisplaySelected: { color: Colors.gradientStart },

  // Time selection
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  timeCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  timeCardSelected: {
    borderColor: Colors.gradientStart,
    backgroundColor: 'rgba(0, 212, 160, 0.05)',
  },
  timeText: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  timeTextSelected: { color: Colors.gradientStart },

  // Staff selection
  staffGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  staffCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  staffCardSelected: {
    borderColor: Colors.gradientStart,
    backgroundColor: 'rgba(0, 212, 160, 0.05)',
  },
  staffIcon: { fontSize: 24, marginBottom: 8 },
  staffName: { fontSize: 12, fontWeight: '600', color: Colors.textDark, textAlign: 'center' },
  staffNameSelected: { color: Colors.gradientStart },

  confirmBtn: {
    backgroundColor: Colors.gradientStart,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
});

export default SlotBookingScreen;