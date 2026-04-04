import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../../../theme/colors';
import { ComplimentaryService } from '@/types/booking';

/* ─────────────────────── Props ─────────────────────── */

interface BookingSummary {
    date: string;
    time: string;
    serviceCount: number;
    patientName: string;
}

interface ComplimentaryScreenProps {
    freeComplimentaryService: ComplimentaryService;
    setFreeComplimentaryService: (v: ComplimentaryService) => void;
    bookingSummary: BookingSummary;
}

/* ─────────────────────── Static data ─────────────────────── */

const COMPLIMENTARY_OPTIONS: {
    id: ComplimentaryService;
    name: string;
    icon: string;
    desc: string;
}[] = [
    { id: 'Blood Sugar', name: 'Blood Sugar', icon: '🍬', desc: 'Random / Fasting' },
    { id: 'Blood Group', name: 'Blood Group', icon: '🩸', desc: 'ABO & Rh Typing' },
    { id: 'Haemoglobin', name: 'Haemoglobin', icon: '⚗️', desc: 'Hb Level Check' },
];

/* ─────────────────────── Complimentary Card ─────────────────────── */

const CompCard: React.FC<{
    item: (typeof COMPLIMENTARY_OPTIONS)[number];
    selected: boolean;
    onPress: () => void;
}> = ({ item, selected, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: selected ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [selected]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    return (
        <Animated.View style={[styles.compWrap, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={1}>
                <Animated.View
                    style={[
                        styles.compCard,
                        {
                            borderColor: borderAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#D8E8EE', Colors.accent],
                            }),
                            backgroundColor: borderAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#F8FBFC', '#EFF9E6'],
                            }),
                        },
                    ]}
                >
                    {selected && (
                        <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>FREE</Text>
                        </View>
                    )}
                    <Text style={styles.compIcon}>{item.icon}</Text>
                    <Text style={[styles.compName, selected && styles.compNameSelected]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.compDesc, selected && styles.compDescSelected]}>
                        {item.desc}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

/* ─────────────────────── Main Screen ─────────────────────── */

const ComplimentaryScreen: React.FC<ComplimentaryScreenProps> = ({
    freeComplimentaryService,
    setFreeComplimentaryService,
    bookingSummary,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleToggle = (id: ComplimentaryService) => {
        // Selecting the same one de-selects it (toggle to 'None')
        setFreeComplimentaryService(freeComplimentaryService === id ? 'None' : id);
    };

    return (
        <Animated.View
            style={[styles.root, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
            {/* ── Booking summary card ── */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryIconWrap}>
                    <Text style={styles.summaryIcon}>📋</Text>
                </View>
                <View style={styles.summaryText}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    <Text style={styles.summaryLine}>
                        👤 {bookingSummary.patientName || 'Patient'}
                    </Text>
                    <Text style={styles.summaryLine}>
                        📅 {bookingSummary.date || '—'} · 🕐 {bookingSummary.time || '—'}
                    </Text>
                    <Text style={styles.summaryLine}>
                        🔬 {bookingSummary.serviceCount} service
                        {bookingSummary.serviceCount !== 1 ? 's' : ''} booked
                    </Text>
                </View>
            </View>

            {/* ── Complimentary ── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <View>
                    <Text style={styles.sectionTitle}>Free Complimentary Service</Text>
                    <Text style={styles.sectionSub}>Choose any one — on us! (optional)</Text>
                </View>
            </View>

            <View style={styles.compRow}>
                {COMPLIMENTARY_OPTIONS.map(item => (
                    <CompCard
                        key={item.id}
                        item={item}
                        selected={freeComplimentaryService === item.id}
                        onPress={() => handleToggle(item.id)}
                    />
                ))}
            </View>

            {/* ── Confirmation note ── */}
            <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>ℹ️</Text>
                <Text style={styles.noteText}>
                    Our team will arrive within the selected time slot. You'll receive a
                    confirmation call 30 mins prior.
                </Text>
            </View>

            <View style={styles.confirmPrompt}>
                <Text style={styles.confirmPromptText}>
                    Tap <Text style={styles.confirmBold}>Confirm</Text> below to finalise your
                    booking.
                </Text>
            </View>
        </Animated.View>
    );
};

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },

    summaryCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        backgroundColor: '#E6FAF5',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#B0E8D4',
        padding: 16,
        marginBottom: 24,
    },
    summaryIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryIcon: { fontSize: 24 },
    summaryText: { flex: 1, gap: 4 },
    summaryTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
    summaryLine: { fontSize: 13, color: Colors.textMedium, fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
    sectionAccent: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: Colors.gradientStart,
        marginTop: 2,
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
    sectionSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

    compRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    compWrap: { flex: 1 },
    compCard: {
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14,
        alignItems: 'center',
        position: 'relative',
    },
    freeBadge: {
        position: 'absolute',
        top: -8,
        right: -4,
        backgroundColor: Colors.accent,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    freeBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
    compIcon: { fontSize: 26, marginBottom: 8 },
    compName: { fontSize: 13, fontWeight: '700', color: Colors.textDark, textAlign: 'center' },
    compNameSelected: { color: Colors.accentDark },
    compDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 3 },
    compDescSelected: { color: '#5A8A00' },

    noteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#F8FBFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 20,
    },
    noteIcon: { fontSize: 16, marginTop: 1 },
    noteText: { flex: 1, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },

    confirmPrompt: { alignItems: 'center', paddingVertical: 8 },
    confirmPromptText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
    confirmBold: { color: Colors.gradientStart, fontWeight: '800' },
});

export default ComplimentaryScreen;
