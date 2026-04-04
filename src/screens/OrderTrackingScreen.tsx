import React, { useState } from 'react';
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
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type OrderTrackingProps = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

const OrderTrackingScreen = ({ navigation }: OrderTrackingProps) => {
    const [currentStatus, setCurrentStatus] = useState('confirmed');

    const statuses = [
        { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Your booking is confirmed' },
        {
            key: 'collected',
            label: 'Sample Collected',
            icon: '🩸',
            desc: 'Sample collected successfully',
        },
        { key: 'processing', label: 'Processing', icon: '🔬', desc: 'Tests are being processed' },
        {
            key: 'ready',
            label: 'Report Ready',
            icon: '📄',
            desc: 'Your report is ready to download',
        },
    ];

    const mockOrder = {
        orderId: 'ORD123456',
        date: '2026-03-31',
        time: '10:00 AM',
        tests: ['Complete Blood Count', 'Thyroid Test', 'Lipid Profile'],
        totalAmount: 1900,
        status: currentStatus,
    };

    const getStatusIndex = (status: string) => statuses.findIndex(s => s.key === status);

    const handleDownloadReport = () => {
        if (currentStatus !== 'ready') {
            Alert.alert('Not Ready', 'Report will be available once processing is complete');
            return;
        }
        Alert.alert('Download', 'Report downloaded successfully!');
    };

    const handleRebook = () => {
        navigation.navigate('Requirements');
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
                <Text style={styles.headerTitle}>Order Tracking</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Details */}
                <View style={styles.orderCard}>
                    <Text style={styles.orderId}>Order #{mockOrder.orderId}</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>{mockOrder.date}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>{mockOrder.time}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total:</Text>
                        <Text style={styles.detailValue}>₹{mockOrder.totalAmount}</Text>
                    </View>

                    <Text style={styles.testsTitle}>Tests:</Text>
                    {mockOrder.tests.map((test, index) => (
                        <Text key={index} style={styles.testItem}>
                            • {test}
                        </Text>
                    ))}
                </View>

                {/* Status Timeline */}
                <View style={styles.timeline}>
                    <Text style={styles.timelineTitle}>Booking Status</Text>
                    {statuses.map((status, index) => {
                        const isCompleted = getStatusIndex(mockOrder.status) >= index;
                        const isCurrent = mockOrder.status === status.key;

                        return (
                            <View key={status.key} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View
                                        style={[
                                            styles.statusIcon,
                                            isCompleted && styles.statusIconCompleted,
                                            isCurrent && styles.statusIconCurrent,
                                        ]}
                                    >
                                        <Text style={styles.statusEmoji}>{status.icon}</Text>
                                    </View>
                                    {index < statuses.length - 1 && (
                                        <View
                                            style={[
                                                styles.timelineLine,
                                                isCompleted && styles.timelineLineCompleted,
                                            ]}
                                        />
                                    )}
                                </View>
                                <View style={styles.timelineRight}>
                                    <Text
                                        style={[
                                            styles.statusLabel,
                                            isCompleted && styles.statusLabelCompleted,
                                        ]}
                                    >
                                        {status.label}
                                    </Text>
                                    <Text style={styles.statusDesc}>{status.desc}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.downloadBtn,
                            currentStatus !== 'ready' && styles.downloadBtnDisabled,
                        ]}
                        onPress={handleDownloadReport}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.downloadText}>📄 Download Report</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.rebookBtn}
                        onPress={handleRebook}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.rebookText}>🔄 Rebook Tests</Text>
                    </TouchableOpacity>
                </View>
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

    // Order Card
    orderCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    orderId: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    detailLabel: { fontSize: 14, color: Colors.textMedium },
    detailValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
    testsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textDark,
        marginTop: 12,
        marginBottom: 8,
    },
    testItem: { fontSize: 14, color: Colors.textMedium, marginBottom: 2 },

    // Timeline
    timeline: { marginBottom: 24 },
    timelineTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },
    timelineItem: { flexDirection: 'row', marginBottom: 20 },
    timelineLeft: { alignItems: 'center', marginRight: 16 },
    statusIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.inputBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusIconCompleted: { backgroundColor: Colors.accent },
    statusIconCurrent: { borderWidth: 2, borderColor: Colors.gradientStart },
    statusEmoji: { fontSize: 18 },
    timelineLine: {
        width: 2,
        height: 40,
        backgroundColor: Colors.inputBorder,
        marginTop: 8,
    },
    timelineLineCompleted: { backgroundColor: Colors.accent },
    timelineRight: { flex: 1 },
    statusLabel: { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
    statusLabelCompleted: { color: Colors.accent },
    statusDesc: { fontSize: 14, color: Colors.textMedium },

    // Actions
    actions: { gap: 12 },
    downloadBtn: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    downloadBtnDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: Colors.textMuted,
    },
    downloadText: { fontSize: 16, fontWeight: '600', color: Colors.textDark },
    rebookBtn: {
        backgroundColor: Colors.gradientStart,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    rebookText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});

export default OrderTrackingScreen;
