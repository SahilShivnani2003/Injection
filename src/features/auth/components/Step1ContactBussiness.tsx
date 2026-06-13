import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { VendorForm, BUSINESS_TYPES } from '../types/VendorRegistration';
import { FieldInput } from '../../../components/FieldInput';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
    form: VendorForm;
    updateField: (key: keyof VendorForm, value: string | string[]) => void;
};

type FieldErrors = Partial<Record<keyof VendorForm, string>>;

// ── Password strength ──────────────────────────────────────────────────────────
const getStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
        { label: 'Too short', color: '#E53935' },
        { label: 'Weak', color: '#FB8C00' },
        { label: 'Fair', color: '#FDD835' },
        { label: 'Good', color: '#43A047' },
        { label: 'Strong', color: '#1B5E20' },
    ];
    return { score, ...map[score] };
};

const PasswordStrength = ({ password }: { password: string }) => {
    const { score, label, color } = getStrength(password);
    if (!password) return null;
    return (
        <View style={strengthStyles.wrapper}>
            <View style={strengthStyles.bars}>
                {[0, 1, 2, 3].map(i => (
                    <View
                        key={i}
                        style={[
                            strengthStyles.bar,
                            { backgroundColor: i < score ? color : '#E2ECF2' },
                        ]}
                    />
                ))}
            </View>
            <Text style={[strengthStyles.label, { color }]}>{label}</Text>
        </View>
    );
};

// ── Inline error row ───────────────────────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <View style={errorStyles.row}>
            <Icon name="error-outline" size={12} color="#E53935" />
            <Text style={errorStyles.text}>{message}</Text>
        </View>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
const StepContactBusiness = ({ form, updateField }: Props) => {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const setError = (key: keyof VendorForm, msg: string) =>
        setErrors(prev => ({ ...prev, [key]: msg }));

    const clearError = (key: keyof VendorForm) =>
        setErrors(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

    const handleChange = (key: keyof VendorForm, value: string) => {
        updateField(key, value);
        if (value.trim()) clearError(key);
        // Live confirm-password match check
        if (key === 'confirmPassword') {
            value === form.password
                ? clearError('confirmPassword')
                : setError('confirmPassword', 'Passwords do not match.');
        }
        if (key === 'password' && form.confirmPassword) {
            value === form.confirmPassword
                ? clearError('confirmPassword')
                : setError('confirmPassword', 'Passwords do not match.');
        }
    };

    const validateField = (key: keyof VendorForm) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        switch (key) {
            case 'name':
                if (!form.name.trim()) setError('name', 'Contact name is required.');
                break;
            case 'email':
                if (!emailRegex.test(form.email.trim()))
                    setError('email', 'Enter a valid email address.');
                break;
            case 'phone':
                if (form.phone.replace(/[^0-9]/g, '').length !== 10)
                    setError('phone', 'Enter a valid 10-digit phone number.');
                break;
            case 'password':
                if (form.password.length < 6)
                    setError('password', 'Password must be at least 6 characters.');
                break;
            case 'confirmPassword':
                if (form.confirmPassword !== form.password)
                    setError('confirmPassword', 'Passwords do not match.');
                break;
            case 'businessName':
                if (!form.businessName.trim())
                    setError('businessName', 'Business name is required.');
                break;
        }
    };

    // ── Eye toggle icon helpers ────────────────────────────────────────────────
    const EyeIcon = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Icon
                name={visible ? 'visibility-off' : 'visibility'}
                size={20}
                color={Colors.textMedium}
            />
        </TouchableOpacity>
    );

    return (
        <View>
            {/* ── Contact Details ── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Icon name="person" size={16} color={Colors.gradientStart} />
                </View>
                <Text style={styles.sectionTitle}>Contact Details</Text>
            </View>

            <FieldInput
                label="Contact Name"
                value={form.name}
                onChangeText={v => handleChange('name', v)}
                placeholder="Enter contact name"
                required
            />
            <FieldError message={errors.name} />

            <FieldInput
                label="Email Address"
                value={form.email}
                onChangeText={v => handleChange('email', v.toLowerCase())}
                placeholder="Enter business email"
                keyboardType="email-address"
                required
            />
            <FieldError message={errors.email} />

            {/* Phone row */}
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <FieldInput
                        label="Phone"
                        value={form.phone}
                        onChangeText={v => handleChange('phone', v.replace(/[^0-9]/g, ''))}
                        placeholder="10-digit number"
                        keyboardType="phone-pad"
                        maxLength={10}
                        required
                    />
                    <FieldError message={errors.phone} />
                </View>
                <View style={styles.rowItem}>
                    <FieldInput
                        label="Alternate Phone"
                        value={form.alternatePhone}
                        onChangeText={v => updateField('alternatePhone', v.replace(/[^0-9]/g, ''))}
                        placeholder="Optional"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>
            </View>

            {/* Password */}
            <FieldInput
                label="Password"
                value={form.password}
                onChangeText={v => handleChange('password', v)}
                placeholder="Choose a secure password"
                required
                rightIcon={
                    <EyeIcon visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                }
                // FieldInput already has secureTextEntry support via rightIcon;
                // pass the prop through by extending FieldInput if needed,
                // or wrap it — here we handle it via the existing rightIcon slot
                // and a local secureTextEntry prop (add to FieldInput if not present):
                secureTextEntry={!showPassword}
            />
            <PasswordStrength password={form.password} />
            <FieldError message={errors.password} />

            {/* Confirm Password */}
            <FieldInput
                label="Confirm Password"
                value={form.confirmPassword}
                onChangeText={v => handleChange('confirmPassword', v)}
                placeholder="Repeat password"
                required
                rightIcon={
                    <EyeIcon
                        visible={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(v => !v)}
                    />
                }
                secureTextEntry={!showConfirmPassword}
            />
            {/* Live match indicator */}
            {form.confirmPassword.length > 0 && (
                <View style={styles.matchRow}>
                    <Icon
                        name={form.confirmPassword === form.password ? 'check-circle' : 'cancel'}
                        size={14}
                        color={form.confirmPassword === form.password ? '#43A047' : '#E53935'}
                    />
                    <Text
                        style={[
                            styles.matchText,
                            {
                                color:
                                    form.confirmPassword === form.password ? '#43A047' : '#E53935',
                            },
                        ]}
                    >
                        {form.confirmPassword === form.password
                            ? 'Passwords match'
                            : 'Passwords do not match'}
                    </Text>
                </View>
            )}
            <FieldError message={errors.confirmPassword} />

            {/* ── Business Details ── */}
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                <View style={styles.sectionIcon}>
                    <Icon name="business" size={16} color={Colors.gradientStart} />
                </View>
                <Text style={styles.sectionTitle}>Business Details</Text>
            </View>

            <FieldInput
                label="Business Name"
                value={form.businessName}
                onChangeText={v => handleChange('businessName', v)}
                placeholder="Enter business name"
                required
            />
            <FieldError message={errors.businessName} />

            {/* Business Type chips */}
            <Text style={styles.chipLabel}>Business Type</Text>
            <View style={styles.chipGrid}>
                {BUSINESS_TYPES.map(type => {
                    const active = form.businessType === type;
                    return (
                        <TouchableOpacity
                            key={type}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => updateField('businessType', type)}
                            activeOpacity={0.8}
                        >
                            {active && (
                                <Icon
                                    name="check"
                                    size={12}
                                    color={Colors.white}
                                    style={{ marginRight: 4 }}
                                />
                            )}
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Reg + GST row */}
            <View style={styles.row}>
                <View style={styles.rowItem}>
                    <FieldInput
                        label="Registration No."
                        value={form.registrationNumber}
                        onChangeText={v => updateField('registrationNumber', v)}
                        placeholder="Reg. number"
                    />
                </View>
                <View style={styles.rowItem}>
                    <FieldInput
                        label="GST Number"
                        value={form.gstNumber}
                        onChangeText={v => updateField('gstNumber', v.toUpperCase())}
                        placeholder="GSTIN"
                    />
                </View>
            </View>
        </View>
    );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const strengthStyles = StyleSheet.create({
    wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -8, marginBottom: 8 },
    bars: { flexDirection: 'row', gap: 4, flex: 1 },
    bar: { flex: 1, height: 4, borderRadius: 2 },
    label: { fontSize: 11, fontWeight: '700', minWidth: 52, textAlign: 'right' },
});

const errorStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -10, marginBottom: 8 },
    text: { fontSize: 11, color: '#E53935', fontWeight: '500' },
});

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        marginTop: 4,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EDF6FB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    rowItem: {
        flex: 1,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: -10,
        marginBottom: 8,
    },
    matchText: {
        fontSize: 11,
        fontWeight: '600',
    },
    chipLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D8E8EE',
        backgroundColor: '#F4F8FB',
    },
    chipActive: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },
    chipText: {
        color: Colors.textMedium,
        fontWeight: '600',
        fontSize: 12,
    },
    chipTextActive: {
        color: Colors.white,
    },
});

export default StepContactBusiness;
