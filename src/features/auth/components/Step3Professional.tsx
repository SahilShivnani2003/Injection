import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FieldInput } from '../../../components/FieldInput';
import { Colors } from '../../../theme/colors';
import { VendorForm } from '../types/VendorRegistration';

type Props = {
    form: VendorForm;
    updateField: (key: keyof VendorForm, value: string | string[]) => void;
};

const StepProfessional = ({ form, updateField }: Props) => {
    return (
        <View>
            <Text style={styles.sectionTitle}>Professional Details</Text>

            <FieldInput
                label="Specialization"
                value={form.specialization}
                onChangeText={v => updateField('specialization', v)}
                placeholder="Primary service area or expertise"
            />
            <FieldInput
                label="Experience (years)"
                value={form.experience}
                onChangeText={v => updateField('experience', v.replace(/[^0-9]/g, ''))}
                placeholder="Number of years in practice"
                keyboardType="number-pad"
            />
            <FieldInput
                label="Short Bio"
                value={form.bio}
                onChangeText={v => updateField('bio', v)}
                placeholder="Tell customers about your business, qualifications, and approach..."
                multiline
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textDark,
        marginTop: 8,
        marginBottom: 14,
    },
});

export default StepProfessional;
