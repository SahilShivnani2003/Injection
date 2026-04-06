import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export const FieldInput: React.FC<{
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    keyboardType?: any;
    maxLength?: number;
    multiline?: boolean;
    required?: boolean;
    rightIcon?: React.ReactNode;
    editable?: boolean;
}> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    maxLength,
    multiline,
    required,
    rightIcon,
    editable = true,
}) => {
    const [focused, setFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;

    // ✅ Stable references — not recreated on every render
    const handleFocus = useCallback(() => setFocused(true), []);
    const handleBlur = useCallback(() => setFocused(false), []);

    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: focused ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [focused]);

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D8E8EE', Colors.gradientStart],
    });

    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <Animated.View
                style={[styles.fieldBox, { borderColor }, multiline && styles.fieldBoxMulti]}
            >
                <TextInput
                    style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
                    placeholder={placeholder || label}
                    placeholderTextColor="#B0C4CC"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType || 'default'}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={multiline ? 3 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    editable={editable}
                    onFocus={handleFocus} // ✅ stable
                    onBlur={handleBlur} // ✅ stable
                    autoCorrect={false}
                    autoCapitalize="none" // ✅ stops capital/small flicker
                />
                {rightIcon && <View style={styles.fieldRight}>{rightIcon}</View>}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    fieldBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        backgroundColor: '#F8FBFC',
        height: 52,
        paddingHorizontal: 16,
    },
    fieldBoxMulti: {
        height: 90,
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    fieldInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.textDark,
        fontWeight: '500',
        padding: 0,
    },
    fieldInputMulti: {
        height: '100%',
        textAlignVertical: 'top',
    },
    fieldRight: { marginLeft: 8 },
});
