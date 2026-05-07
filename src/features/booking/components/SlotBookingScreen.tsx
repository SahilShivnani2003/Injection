import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    FlatList,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { StaffPreference } from '@/types/booking';

/* ─────────────────────── Props ─────────────────────── */

interface SlotBookingScreenProps {
    selectedDate: string | null;
    setSelectedDate: (v: string | null) => void;
    selectedTime: string | null;
    setSelectedTime: (v: string | null) => void;
    staffPreference: StaffPreference;
    setStaffPreference: (v: StaffPreference) => void;
}

/* ─────────────────────── Helpers ─────────────────────── */

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const toDateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

const STATIC_TIMES: string[] = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
];

const STAFF_OPTIONS: { id: StaffPreference; icon: string }[] = [
    { id: 'Any Available', icon: '👨‍⚕️' },
    { id: 'Male Staff', icon: '👨' },
    { id: 'Female Staff', icon: '👩' },
];

/* ─────────────────────── Calendar ─────────────────────── */

const Calendar: React.FC<{
    selectedDate: string | null;
    onSelectDate: (d: string) => void;
    minDateKey: string;
}> = ({ selectedDate, onSelectDate, minDateKey }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewYear(y => y - 1);
            setViewMonth(11);
        } else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewYear(y => y + 1);
            setViewMonth(0);
        } else setViewMonth(m => m + 1);
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <View style={calStyles.wrapper}>
            <View style={calStyles.header}>
                <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn} activeOpacity={0.7}>
                    <Text style={calStyles.navArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={calStyles.headerTitle}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn} activeOpacity={0.7}>
                    <Text style={calStyles.navArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={calStyles.weekRow}>
                {DAYS_OF_WEEK.map(d => (
                    <Text key={d} style={calStyles.weekLabel}>
                        {d}
                    </Text>
                ))}
            </View>

            <View style={calStyles.grid}>
                {cells.map((day, idx) => {
                    if (day === null) return <View key={`b-${idx}`} style={calStyles.cell} />;
                    const key = toDateKey(viewYear, viewMonth, day);
                    const isSelected = selectedDate === key;
                    const isToday =
                        day === today.getDate() &&
                        viewMonth === today.getMonth() &&
                        viewYear === today.getFullYear();
                    const disabled = key < minDateKey;
                    return (
                        <TouchableOpacity
                            key={key}
                            style={[
                                calStyles.cell,
                                isToday && calStyles.cellToday,
                                isSelected && calStyles.cellSelected,
                                disabled && calStyles.cellDisabled,
                            ]}
                            onPress={() => !disabled && onSelectDate(key)}
                            activeOpacity={disabled ? 1 : 0.7}
                        >
                            <Text
                                style={[
                                    calStyles.cellText,
                                    isToday && calStyles.cellTextToday,
                                    isSelected && calStyles.cellTextSelected,
                                    disabled && calStyles.cellTextDisabled,
                                ]}
                            >
                                {day}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const calStyles = StyleSheet.create({
    wrapper: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,212,160,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navArrow: { fontSize: 22, color: Colors.gradientStart, fontWeight: '700', lineHeight: 26 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
    weekRow: { flexDirection: 'row', marginBottom: 6 },
    weekLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
        width: `${100 / 7}%` as any,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
    cellToday: { borderWidth: 1.5, borderColor: Colors.gradientStart },
    cellSelected: { backgroundColor: Colors.gradientStart },
    cellDisabled: { opacity: 0.3 },
    cellText: { fontSize: 14, fontWeight: '500', color: Colors.textDark },
    cellTextToday: { color: Colors.gradientStart, fontWeight: '700' },
    cellTextSelected: { color: Colors.white, fontWeight: '700' },
    cellTextDisabled: { color: Colors.textMuted },
});

/* ─────────────────────── Time Dropdown ─────────────────────── */

const TimeDropdown: React.FC<{
    times: string[];
    selected: string | null;
    onSelect: (t: string) => void;
}> = ({ times, selected, onSelect }) => {
    const [open, setOpen] = useState(false);
    return (
        <View>
            <TouchableOpacity
                style={dropStyles.trigger}
                onPress={() => setOpen(true)}
                activeOpacity={0.8}
            >
                <Text style={[dropStyles.triggerText, !selected && dropStyles.placeholder]}>
                    {selected ?? 'Select a time slot'}
                </Text>
                <Text style={dropStyles.chevron}>▾</Text>
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <TouchableOpacity
                    style={dropStyles.backdrop}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                />
                <View style={dropStyles.sheet}>
                    <View style={dropStyles.sheetHandle} />
                    <Text style={dropStyles.sheetTitle}>Select Time Slot</Text>
                    <FlatList
                        data={times}
                        keyExtractor={item => item}
                        numColumns={3}
                        columnWrapperStyle={dropStyles.row}
                        renderItem={({ item }) => {
                            const isSel = item === selected;
                            return (
                                <TouchableOpacity
                                    style={[dropStyles.option, isSel && dropStyles.optionSelected]}
                                    onPress={() => {
                                        onSelect(item);
                                        setOpen(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            dropStyles.optionText,
                                            isSel && dropStyles.optionTextSel,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </Modal>
        </View>
    );
};

const dropStyles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.inputBorder,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    triggerText: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
    placeholder: { color: Colors.textMuted, fontWeight: '400' },
    chevron: { fontSize: 18, color: Colors.gradientStart, marginLeft: 8 },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingBottom: 32,
        paddingTop: 12,
        elevation: 20,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D0D8E0',
        alignSelf: 'center',
        marginBottom: 14,
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 16,
        textAlign: 'center',
    },
    row: { justifyContent: 'space-between', marginBottom: 10 },
    option: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.inputBorder,
        backgroundColor: Colors.white,
    },
    optionSelected: { borderColor: Colors.gradientStart, backgroundColor: 'rgba(0,212,160,0.08)' },
    optionText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
    optionTextSel: { color: Colors.gradientStart },
});

/* ─────────────────────── Main Screen ─────────────────────── */

const SlotBookingScreen: React.FC<SlotBookingScreenProps> = ({
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    staffPreference,
    setStaffPreference,
}) => {
    const today = new Date();
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    // When date changes, reset time
    const handleDateSelect = (d: string) => {
        setSelectedDate(d);
        setSelectedTime(null);
    };

    const formatDisplayDate = (key: string) => {
        const [y, m, d] = key.split('-').map(Number);
        return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
    };

    return (
        <ScrollView
            style={styles.root}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Date ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Preferred Date</Text>
                {selectedDate && (
                    <Text style={styles.selectedBadge}>📅 {formatDisplayDate(selectedDate)}</Text>
                )}
                <Calendar
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    minDateKey={todayKey}
                />
            </View>

            {/* ── Time ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Preferred Time</Text>
                <TimeDropdown
                    times={STATIC_TIMES}
                    selected={selectedTime}
                    onSelect={setSelectedTime}
                />
            </View>

            {/* ── Staff ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choose Staff (Optional)</Text>
                <View style={styles.staffGrid}>
                    {STAFF_OPTIONS.map(staff => (
                        <TouchableOpacity
                            key={staff.id}
                            style={[
                                styles.staffCard,
                                staffPreference === staff.id && styles.staffCardSelected,
                            ]}
                            onPress={() => setStaffPreference(staff.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.staffIcon}>{staff.icon}</Text>
                            <Text
                                style={[
                                    styles.staffName,
                                    staffPreference === staff.id && styles.staffNameSelected,
                                ]}
                            >
                                {staff.id}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },
    content: { paddingBottom: 16 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
    selectedBadge: {
        fontSize: 13,
        color: Colors.gradientStart,
        fontWeight: '600',
        marginBottom: 10,
    },
    staffGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    staffCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        width: '30%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.inputBorder,
    },
    staffCardSelected: {
        borderColor: Colors.gradientStart,
        backgroundColor: 'rgba(0,212,160,0.06)',
    },
    staffIcon: { fontSize: 24, marginBottom: 8 },
    staffName: { fontSize: 11, fontWeight: '600', color: Colors.textDark, textAlign: 'center' },
    staffNameSelected: { color: Colors.gradientStart },
});

export default SlotBookingScreen;
