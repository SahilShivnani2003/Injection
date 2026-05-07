import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { FieldInput } from '../../../components/FieldInput';
import { BookingFormData } from '../screens/BookingScreen';

const SEX_OPTIONS = ['Male', 'Female', 'Other'];

/* ─────────────────────── Types ─────────────────────── */

/** Subset of BookingFormData that lives in Step 1 */
export interface BasicDetails {
    patientName: string;
    age: string;
    sex: string;
    address: string;
    pincode: string;
    currentLocation: string;
    phoneNumber: string;
    email: string;
}

interface BasicDetailsScreenProps {
    basicDetails: BasicDetails;
    /**
     * FIX: Accepts a (field, value) pair instead of a functional updater.
     * This prevents the field-clearing bug caused by passing a function into
     * BookingScreen's setFormData spread.
     */
    onChange: (field: keyof BookingFormData, value: string) => void;
}

/* ─────────────────────── Sex selector ─────────────────────── */

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

/* ─────────────────────── Section divider ─────────────────────── */

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionRow}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

/* ─────────────────────── Main Screen ─────────────────────── */

const BasicDetailsScreen: React.FC<BasicDetailsScreenProps> = ({ basicDetails, onChange }) => {
    /**
     * Each handler calls onChange(fieldName, value) — a direct field update.
     * This avoids the previous pattern of calling setBasicDetails(prev => ...)
     * which passed a function into BookingScreen's setState spread and caused
     * every field to clear on each keystroke.
     */
    const handlePatientName = useCallback((v: string) => onChange('patientName', v), [onChange]);
    const handleAge = useCallback(
        (v: string) => onChange('age', v.replace(/[^0-9]/g, '')),
        [onChange],
    );
    const handleSex = useCallback((v: string) => onChange('sex', v), [onChange]);
    const handleAddress = useCallback((v: string) => onChange('address', v), [onChange]);
    const handlePincode = useCallback(
        (v: string) => onChange('pincode', v.replace(/[^0-9]/g, '')),
        [onChange],
    );
    const handleCurrentLocation = useCallback(
        (v: string) => onChange('currentLocation', v),
        [onChange],
    );
    const handlePhone = useCallback(
        (v: string) => onChange('phoneNumber', v.replace(/[^0-9]/g, '')),
        [onChange],
    );
    const handleEmail = useCallback((v: string) => onChange('email', v), [onChange]);

    return (
        <View style={styles.root}>
            {/* ── Personal Info ── */}
            <SectionLabel title="Personal Info" />

            <FieldInput
                label="Patient Name"
                required
                value={basicDetails.patientName}
                onChangeText={handlePatientName}
                placeholder="Full name of patient"
            />

            <View style={styles.rowTwo}>
                <View style={styles.rowHalf}>
                    <FieldInput
                        label="Age"
                        required
                        value={basicDetails.age}
                        onChangeText={handleAge}
                        keyboardType="number-pad"
                        maxLength={3}
                        placeholder="Years"
                    />
                </View>
                <View style={styles.rowHalf}>
                    <SexSelector value={basicDetails.sex} onChange={handleSex} />
                </View>
            </View>

            {/* ── Location ── */}
            <SectionLabel title="Location" />

            <FieldInput
                label="Address"
                required
                value={basicDetails.address}
                onChangeText={handleAddress}
                multiline
                placeholder="House no., street, locality"
            />

            <View style={styles.rowTwo}>
                <View style={styles.rowHalf}>
                    <FieldInput
                        label="Pin Code"
                        required
                        value={basicDetails.pincode}
                        onChangeText={handlePincode}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="6-digit"
                    />
                </View>
                <View style={styles.rowHalf}>
                    <FieldInput
                        label="Current Location"
                        required
                        value={basicDetails.currentLocation}
                        onChangeText={handleCurrentLocation}
                        placeholder="Landmark / area"
                        rightIcon={<Text style={styles.pinIcon}>📍</Text>}
                    />
                </View>
            </View>

            {/* ── Contact ── */}
            <SectionLabel title="Contact" />

            <FieldInput
                label="Phone Number"
                required
                value={basicDetails.phoneNumber}
                onChangeText={handlePhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="10-digit mobile number"
            />

            <FieldInput
                label="Email Address"
                required
                value={basicDetails.email}
                onChangeText={handleEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
            />
        </View>
    );
};

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },

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

    rowTwo: { flexDirection: 'row', gap: 12, marginBottom: 0 },
    rowHalf: { flex: 1 },

    pillRow: { flexDirection: 'row', gap: 8 },
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
    pillText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
    pillTextActive: { color: Colors.gradientStart, fontWeight: '800' },
});

export default BasicDetailsScreen;
