import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
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
const BasicDetailsScreen = ({ basicDetails, setBasicDetails }: any) => {
    const handlePatientName = useCallback(
        (v: string) => setBasicDetails((prev: any) => ({ ...prev, patientName: v })),
        [setBasicDetails], // ✅ dependency add karo
    );

    const handleAge = useCallback(
        (v: string) => setBasicDetails((prev: any) => ({ ...prev, age: v.replace(/[^0-9]/g, '') })),
        [setBasicDetails],
    );

    const handleSex = useCallback(
        (v: string) => setBasicDetails((prev: any) => ({ ...prev, sex: v })),
        [setBasicDetails],
    );

    const handleAddress = useCallback(
        (v: string) => setBasicDetails((prev: any) => ({ ...prev, address: v })),
        [setBasicDetails],
    );

    const handlePincode = useCallback(
        (v: string) =>
            setBasicDetails((prev: any) => ({ ...prev, pincode: v.replace(/[^0-9]/g, '') })),
        [setBasicDetails],
    );

    const handleCurrentLocation = useCallback(
        (v: string) => setBasicDetails((prev: any) => ({ ...prev, currentLocation: v })),
        [setBasicDetails],
    );

    const handlePhone = useCallback(
        (v: string) =>
            setBasicDetails((prev: any) => ({ ...prev, phoneNumber: v.replace(/[^0-9]/g, '') })),
        [setBasicDetails],
    );

    const handleEmail = useCallback(
        (v: string) => setBasicDetails((prev: any) => ({ ...prev, email: v })),
        [setBasicDetails],
    );

    return (
        <View style={styles.root}>
            {/* ── Personal info ──────────────────────────────────────── */}
            <SectionLabel title="Personal Info" />

            <FieldInput
                label="Patient Name"
                required
                value={basicDetails.patientName}
                onChangeText={handlePatientName}
            />

            <View style={styles.rowTwo}>
                <View style={styles.rowHalf}>
                    <FieldInput
                        label="Age"
                        required
                        value={String(basicDetails.age)}
                        onChangeText={handleAge}
                        keyboardType="number-pad"
                        maxLength={3}
                    />
                </View>
                <View style={styles.rowHalf}>
                    <SexSelector value={basicDetails.sex} onChange={handleSex} />
                </View>
            </View>

            {/* ── Location ───────────────────────────────────────────── */}
            <SectionLabel title="Location" />

            <FieldInput
                label="Address"
                required
                value={basicDetails.address}
                onChangeText={handleAddress}
                multiline
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
                    />
                </View>
                <View style={styles.rowHalf}>
                    <FieldInput
                        label="Current Location"
                        required
                        value={basicDetails.currentLocation}
                        onChangeText={handleCurrentLocation}
                        rightIcon={<Text style={styles.pinIcon}>📍</Text>}
                    />
                </View>
            </View>

            {/* ── Contact (optional) ─────────────────────────────────── */}
            <SectionLabel title="Contact (Optional)" />

            <FieldInput
                label="Phone Number"
                value={basicDetails.phoneNumber}
                onChangeText={handlePhone}
                keyboardType="phone-pad"
                maxLength={10}
            />

            <FieldInput
                label="Email Address"
                value={basicDetails.email}
                onChangeText={handleEmail}
                keyboardType="email-address"
            />
        </View>
    );
};

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
