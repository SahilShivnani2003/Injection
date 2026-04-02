import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { useBookingStore } from '../../../store/useBookingStore';
import { validatePatientDetailsDTO } from '../../../types/bookingDTO';
import { FieldInput } from '../../../components/FieldInput';

const SEX_OPTIONS = ['Male', 'Female', 'Other'];

// ── Sex selector pill group ──────────────────────────────────────────────────
const SexSelector: React.FC<{ value: string; onChange: (v: string) => void }> = ({
    value,
    onChange,
}) => (
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
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                            {opt}
                        </Text>
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
const BasicDetailsScreen = () => {
    const { bookingData, updateBasicDetails, setStep, isLoading, setLoading } = useBookingStore();

    const [form, setForm] = useState({
        patientName: bookingData.patientName || '',
        age: bookingData.age?.toString() || '',
        sex: bookingData.sex || '',
        address: bookingData.address || '',
        pinCode: bookingData.pinCode || '',
        currentLocation: bookingData.currentLocation || '',
        alternateMobile: bookingData.alternateMobile || '',
        email: bookingData.email || '',
    });

    const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleNext = async () => {
        const patientData = {
            patientName: form.patientName,
            age: parseInt(form.age),
            sex: form.sex as 'Male' | 'Female' | 'Other',
            address: form.address,
            pinCode: form.pinCode,
            currentLocation: form.currentLocation,
            alternateMobile: form.alternateMobile || undefined,
            email: form.email,
        };

        const errors = validatePatientDetailsDTO(patientData);
        if (errors.length > 0) {
            Alert.alert('Validation Error', errors.join('\n'));
            return;
        }

        try {
            setLoading(true);
            updateBasicDetails(patientData);
            setStep(2);
        } catch (error) {
            Alert.alert('Error', 'Failed to save patient details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FA' },

    fieldWrap: { marginBottom: 16 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    required: { color: Colors.gradientStart },
    
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
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
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
});

export default BasicDetailsScreen;
