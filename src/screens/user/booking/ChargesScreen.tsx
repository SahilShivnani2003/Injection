import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../../theme/colors';
import { SelectedService } from '@/types/booking';

/* ─────────────────────── Props ─────────────────────── */

interface ChargesScreenProps {
    selectedServices: SelectedService[];
}

/* ─────────────────────── Sub-components ─────────────────────── */

const ServiceRow: React.FC<{
    index: number;
    service: SelectedService;
    isLast: boolean;
}> = ({ index, service, isLast }) => (
    <View style={[styles.serviceRow, !isLast && styles.serviceRowBorder]}>
        <View style={styles.serviceIndexBox}>
            <Text style={styles.serviceIndex}>{index + 1}</Text>
        </View>
        <View style={styles.serviceInfo}>
            <Text style={styles.serviceRowName}>{service.serviceName}</Text>
            {service.quantity > 1 && <Text style={styles.serviceQty}>x{service.quantity}</Text>}
        </View>
        <Text style={styles.serviceRowCharge}>
            ₹{(service.price * service.quantity).toLocaleString('en-IN')}
        </Text>
    </View>
);

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

/* ─────────────────────── Main Screen ─────────────────────── */

const ChargesScreen: React.FC<ChargesScreenProps> = ({ selectedServices }) => {
    const subtotal = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    if (selectedServices.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No Services Selected</Text>
                <Text style={styles.emptyText}>
                    Go back to Step 2 to select your required services.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
            {/* ── Services list ── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Selected Services</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{selectedServices.length}</Text>
                </View>
            </View>

            <View style={styles.servicesList}>
                {selectedServices.map((s, i) => (
                    <ServiceRow
                        key={s.serviceId}
                        index={i}
                        service={s}
                        isLast={i === selectedServices.length - 1}
                    />
                ))}
            </View>

            {/* ── Bill summary ── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Bill Summary</Text>
            </View>

            <View style={styles.billCard}>
                <SummaryRow label="Subtotal" value={fmt(subtotal)} />
                <View style={styles.billDivider} />
                <SummaryRow label="GST & Other Tax (18%)" value={fmt(gstAmount)} />
                <View style={styles.billDividerThick} />
                <SummaryRow label="Grand Total" value={fmt(grandTotal)} bold accent />
            </View>

            {/* ── Info chips ── */}
            <View style={styles.chipRow}>
                {[
                    {
                        icon: '🛒',
                        label: `${selectedServices.length} service${
                            selectedServices.length !== 1 ? 's' : ''
                        }`,
                    },
                    { icon: '🕐', label: 'Est. 45 mins' },
                    { icon: '🏠', label: 'At Home' },
                ].map(c => (
                    <View key={c.label} style={styles.chip}>
                        <Text style={styles.chipIcon}>{c.icon}</Text>
                        <Text style={styles.chipText}>{c.label}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.disclaimer}>
                Prices include visiting charges. GST applicable as per government norms.
            </Text>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FA' },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
    emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
        marginTop: 4,
    },
    sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: Colors.gradientStart },
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
    serviceInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
    serviceRowName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textDark },
    serviceQty: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
    serviceRowCharge: { fontSize: 15, fontWeight: '800', color: Colors.gradientStart },

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

    chipRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
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

    disclaimer: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 17 },
});

export default ChargesScreen;
