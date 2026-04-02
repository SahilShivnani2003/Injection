import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useBookingStore } from '../../../store/useBookingStore';
import { bookingAPI } from '../../../service/apis/bookingService';
import { CreateBookingRequestDTO, validateCreateBookingRequestDTO } from '../../../types/bookingDTO';

// ── Service row in the charges list ─────────────────────────────────────────
const ServiceRow: React.FC<{
    index: number;
    name: string;
    icon: string;
    charge: number;
    isLast: boolean;
}> = ({ index, name, icon, charge, isLast }) => (
    <View style={[styles.serviceRow, !isLast && styles.serviceRowBorder]}>
        <View style={styles.serviceIndexBox}>
            <Text style={styles.serviceIndex}>{index + 1}</Text>
        </View>
        <Text style={styles.serviceRowIcon}>{icon}</Text>
        <Text style={styles.serviceRowName}>{name}</Text>
        <Text style={styles.serviceRowCharge}>₹{charge}</Text>
    </View>
);

// ── Summary row ──────────────────────────────────────────────────────────────
const SummaryRow: React.FC<{
    label: string;
    value: string;
    bold?: boolean;
    accent?: boolean;
}> = ({ label, value, bold, accent }) => (
    <View style={[styles.summaryRow, accent && styles.summaryRowAccent]}>
        <Text
            style={[
                styles.summaryLabel,
                bold && styles.summaryLabelBold,
                accent && styles.summaryLabelAccent,
            ]}
        >
            {label}
        </Text>
        <Text
            style={[
                styles.summaryValue,
                bold && styles.summaryValueBold,
                accent && styles.summaryValueAccent,
            ]}
        >
            {value}
        </Text>
    </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
const ChargesScreen = () => {
    const { bookingData, setLoading, isLoading, resetBooking } = useBookingStore();
    const selectedIds: number[] = bookingData.selectedServices || [];
    const selected = selectedIds.map(id => ({ id, name: `Service ${id}`, charge: 500 })); // Mock service data
    const subtotal = bookingData.subtotal || 0;
    const gst = bookingData.gst || 0;
    const grandTotal = bookingData.total || 0;
    const insuranceCoverage = bookingData.insuranceCoverage || 0;
    const finalAmount = bookingData.finalAmount || 0;

    return (
        <View style={styles.root}>
            {/* ── Services list ─────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Selected Services</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{selected.length}</Text>
                </View>
            </View>

            <View style={styles.servicesList}>
                {selected.length > 0 ? (
                    selected.map((s, i) => (
                        <ServiceRow
                            key={s.id}
                            index={i}
                            name={s.name}
                            icon={s.icon}
                            charge={s.charge}
                            isLast={i === selected.length - 1}
                        />
                    ))
                ) : (
                    <View style={styles.emptyRow}>
                        <Text style={styles.emptyText}>No services selected</Text>
                    </View>
                )}
            </View>

            {/* ── Bill summary ──────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Bill Summary</Text>
            </View>

            <View style={styles.billCard}>
                <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
                <View style={styles.billDivider} />
                <SummaryRow
                    label="GST & Other Tax (18%)"
                    value={`₹${gst.toLocaleString('en-IN')}`}
                />
                <View style={styles.billDividerThick} />
                <SummaryRow
                    label="Grand Total"
                    value={`₹${grandTotal.toLocaleString('en-IN')}`}
                    bold
                    accent
                />
            </View>

            {/* ── Info chips ────────────────────────────────────────── */}
            <View style={styles.chipRow}>
                <View style={styles.chip}>
                    <Text style={styles.chipIcon}>🛒</Text>
                    <Text style={styles.chipText}>
                        {selected.length} service{selected.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <View style={styles.chip}>
                    <Text style={styles.chipIcon}>🕐</Text>
                    <Text style={styles.chipText}>Est. 45 mins</Text>
                </View>
                <View style={styles.chip}>
                    <Text style={styles.chipIcon}>🏠</Text>
                    <Text style={styles.chipText}>At Home</Text>
                </View>
            </View>

            {/* ── Confirm button ────────────────────────────────────── */}
            <TouchableOpacity
                style={styles.confirmBtn}
                activeOpacity={0.85}
                disabled={isLoading}
            >
                <LinearGradient
                    colors={isLoading ? ['#A0B8C4', '#8FA3AE'] : [Colors.accent, Colors.accentDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmBtnGrad}
                >
                    <Text style={styles.confirmBtnText}>
                        {isLoading ? 'Creating Booking...' : 'Confirm Booking'}
                    </Text>
                    <View style={styles.confirmArrow}>
                        <Text style={styles.confirmArrowText}>{isLoading ? '⏳' : '✓'}</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
                Prices include visiting charges. GST applicable as per government norms.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FA' },

    // Total pill floating in header
    totalPill: {
        position: 'absolute',
        right: 24,
        bottom: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.45)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'flex-end',
    },
    totalPillLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '600',
        letterSpacing: 0.8,
    },
    totalPillValue: { fontSize: 18, color: Colors.white, fontWeight: '900', letterSpacing: 0.3 },
    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
        marginTop: 4,
    },
    sectionAccent: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: Colors.gradientStart,
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, flex: 1 },
    countBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '800' },

    // Services list
    servicesList: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: Colors.white,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 10,
    },
    serviceRowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF5F8' },
    serviceIndexBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F0F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceIndex: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
    serviceRowIcon: { fontSize: 18 },
    serviceRowName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
    serviceRowCharge: { fontSize: 15, fontWeight: '800', color: Colors.gradientStart },
    emptyRow: { paddingVertical: 24, alignItems: 'center' },
    emptyText: { fontSize: 14, color: Colors.textMuted },

    // Bill card
    billCard: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: Colors.white,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    summaryRowAccent: { backgroundColor: '#E6FAF5' },
    summaryLabel: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
    summaryLabelBold: { fontWeight: '700', color: Colors.textDark },
    summaryLabelAccent: { fontWeight: '800', color: '#0A6B50', fontSize: 15 },
    summaryValue: { fontSize: 14, color: Colors.textDark, fontWeight: '600' },
    summaryValueBold: { fontWeight: '800' },
    summaryValueAccent: { fontSize: 17, fontWeight: '900', color: '#0A6B50' },
    billDivider: { height: 1, backgroundColor: '#EEF5F8', marginHorizontal: 16 },
    billDividerThick: { height: 2, backgroundColor: '#D8E8EE' },

    // Chips
    chipRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    chip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FBFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        paddingVertical: 10,
        paddingHorizontal: 10,
        gap: 6,
        justifyContent: 'center',
    },
    chipIcon: { fontSize: 14 },
    chipText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },

    // Confirm button
    confirmBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.accentDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
        marginBottom: 16,
    },
    confirmBtnGrad: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    confirmBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
    confirmArrow: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmArrowText: { color: Colors.white, fontSize: 16, fontWeight: '800' },

    disclaimer: {
        color: Colors.textMuted,
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 17,
    },
});

export default ChargesScreen;
