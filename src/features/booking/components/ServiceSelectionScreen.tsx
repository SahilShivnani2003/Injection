import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    FlatList,
    Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../theme/colors';
import { SelectedService } from '@/types/booking';
import { serviceAPI } from '@/service/apis/medicalServices';
import { Service } from '@/features/vendorService/types/Service';

/* ─────────────────────── Extended type ─────────────────────────────────────
 * The Service interface doesn't include _id (it's added by MongoDB at runtime).
 * We extend it locally so TypeScript doesn't complain.
 * ─────────────────────────────────────────────────────────────────────────── */
type ServiceDoc = Service & { _id: string };

/* ─────────────────────── Category icon map ─────────────────────── */

type IconDef = { name: string; color: string; bg: string };

const CATEGORY_ICON: Record<string, IconDef> = {
    'Home Injections': { name: 'medical', color: '#E8445A', bg: '#FDEEF1' },
    'IV Drip Services': { name: 'water', color: '#0E8DFF', bg: '#E6F3FF' },
    'Wound Dressing': { name: 'bandage-outline', color: '#FF8C00', bg: '#FFF3E0' },
    'Day Care at Home': { name: 'home', color: '#7B61FF', bg: '#F0EEFF' },
    'Patient Monitoring': { name: 'pulse', color: '#00B4A0', bg: '#E0F7F5' },
    'Old Age Patient Care': { name: 'accessibility', color: '#FF6B6B', bg: '#FFF0F0' },
    '24 HR Patient Care': { name: 'moon', color: '#5B7FFF', bg: '#EEF2FF' },
    'Blood Collection': { name: 'water-outline', color: '#E84040', bg: '#FFECEC' },
    'BP/Sugar Monitoring': { name: 'heart-circle', color: '#FF4D6D', bg: '#FFF0F3' },
    'ECG at Home': { name: 'stats-chart', color: '#00C07F', bg: '#E0FAF1' },
    'Catheter Care': { name: 'fitness', color: '#6C8EFF', bg: '#EEF2FF' },
    'Physiotherapy Session': { name: 'body', color: '#FF7043', bg: '#FFF3F0' },
    'Field Survey Service': { name: 'clipboard', color: '#26A69A', bg: '#E0F2F1' },
    'Data Collection Service': { name: 'folder-open', color: '#42A5F5', bg: '#E3F2FD' },
    'Field Sample Collection': { name: 'flask', color: '#AB47BC', bg: '#F3E5F5' },
    'Community Survey': { name: 'people', color: '#5C6BC0', bg: '#E8EAF6' },
    'Awareness Activities': { name: 'megaphone', color: '#FFA726', bg: '#FFF8E1' },
    'Lab-based Training': { name: 'eye-outline', color: '#26C6DA', bg: '#E0F7FA' },
    'BSC/MSC Training': { name: 'school', color: '#66BB6A', bg: '#E8F5E9' },
    'DMLT Training': { name: 'flask-outline', color: '#EC407A', bg: '#FCE4EC' },
    'Nursing Training': { name: 'medkit', color: '#EF5350', bg: '#FFEBEE' },
    'Dissertation Program': { name: 'book', color: '#8D6E63', bg: '#EFEBE9' },
    'Placement Services': { name: 'briefcase', color: '#78909C', bg: '#ECEFF1' },
    Other: { name: 'ellipsis-horizontal-circle', color: '#90A4AE', bg: '#ECEFF1' },
};

const DEFAULT_ICON: IconDef = {
    name: 'medkit-outline',
    color: Colors.gradientStart,
    bg: '#E6FAF5',
};

const getCategoryIcon = (category?: string): IconDef => {
    if (!category) return DEFAULT_ICON;
    return CATEGORY_ICON[category] ?? DEFAULT_ICON;
};

/* ─────────────────────── Props ─────────────────────── */

interface ServiceSelectionScreenProps {
    selectedServices: SelectedService[];
    setSelectedServices: (v: SelectedService[]) => void;
}

/* ─────────────────────── Separator (stable, outside render) ─────────────────
 * Defining this inside the component creates a new reference every render,
 * causing FlatList to unmount/remount every separator on each state change.
 * ─────────────────────────────────────────────────────────────────────────── */
const ItemSeparator = () => <View style={styles.separator} />;

/* ─────────────────────── Service List Item ─────────────────────── */

interface ServiceListItemProps {
    service: ServiceDoc;
    selected: boolean;
    onPress: () => void;
}

const ServiceListItem: React.FC<ServiceListItemProps> = React.memo(
    ({ service, selected, onPress }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;
        // Initialise with current selected value to avoid flash on first render
        const checkAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

        useEffect(() => {
            Animated.spring(checkAnim, {
                toValue: selected ? 1 : 0,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }, [selected, checkAnim]);

        const handlePress = () => {
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 0.97, duration: 60, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
            onPress();
        };

        const icon = getCategoryIcon(service.category.name);
        // Single interpolation node — avoids the duplicate/conditional interpolate bug
        const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[styles.listItem, selected && styles.listItemSelected]}
                    onPress={handlePress}
                    activeOpacity={0.85}
                >
                    {/* Left — category icon */}
                    {/* Left — service image, falls back to category icon */}
                    {service.image ? (
                        <Image
                            source={{ uri: service.image }}
                            style={[styles.listImage, selected && styles.listImageSelected]}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.listIconBox,
                                { backgroundColor: selected ? icon.color + '22' : icon.bg },
                            ]}
                        >
                            <Ionicons name={icon.name as any} size={22} color={icon.color} />
                        </View>
                    )}

                    {/* Center — name + meta chips */}
                    <View style={styles.listInfo}>
                        <Text
                            style={[styles.listName, selected && styles.listNameSelected]}
                            numberOfLines={1}
                        >
                            {service.serviceName}
                        </Text>

                        <View style={styles.listMetaRow}>
                            {/* Category chip */}
                            <View style={styles.listMetaChip}>
                                <Ionicons
                                    name="pricetag-outline"
                                    size={10}
                                    color={Colors.textMuted}
                                />
                                <Text style={styles.listMetaText} numberOfLines={1}>
                                    {service.category.name ?? 'General'}
                                </Text>
                            </View>

                            {/* Duration chip */}
                            {!!service.duration && (
                                <View style={styles.listMetaChip}>
                                    <Ionicons
                                        name="time-outline"
                                        size={10}
                                        color={Colors.textMuted}
                                    />
                                    <Text style={styles.listMetaText}>{service.duration} min</Text>
                                </View>
                            )}

                            {/* Service type chip */}
                            {!!service.serviceType && (
                                <View style={styles.listMetaChip}>
                                    <Ionicons
                                        name={
                                            service.serviceType === 'At Home'
                                                ? 'home-outline'
                                                : service.serviceType === 'At Clinic'
                                                    ? 'business-outline'
                                                    : 'swap-horizontal-outline'
                                        }
                                        size={10}
                                        color={Colors.textMuted}
                                    />
                                    <Text style={styles.listMetaText}>{service.serviceType}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Right — price + checkbox */}
                    <View style={styles.listRight}>
                        <Text style={[styles.listPrice, selected && styles.listPriceSelected]}>
                            ₹{service.basePrice?.toLocaleString('en-IN') ?? '—'}
                        </Text>

                        {/* FIX: single clean animated checkbox — no conditional interpolation */}
                        <Animated.View
                            style={[
                                styles.checkbox,
                                selected && styles.checkboxSelected,
                                { transform: [{ scale: checkScale }] },
                            ]}
                        >
                            <Ionicons
                                name={selected ? 'checkmark' : 'remove-outline'}
                                size={13}
                                color={selected ? Colors.white : '#C8DDE5'}
                            />
                        </Animated.View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    },
);

ServiceListItem.displayName = 'ServiceListItem';

/* ─────────────────────── Section Label ─────────────────────── */

const SectionLabel: React.FC<{ title: string; count: number }> = ({ title, count }) => (
    <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{count}</Text>
        </View>
    </View>
);

/* ─────────────────────── Selected Summary Bar ───────────────────────────────
 * FIX: hooks (useRef, useEffect) are called unconditionally.
 * The early return was previously AFTER the hooks → Rules of Hooks violation.
 * Now the animated opacity/translate is applied regardless, and we just
 * return a zero-height view when nothing is selected so the parent layout
 * doesn't jump.
 * ─────────────────────────────────────────────────────────────────────────── */

const SelectedBar: React.FC<{
    selectedServices: SelectedService[];
    onClear: () => void;
}> = ({ selectedServices, onClear }) => {
    const animVal = useRef(new Animated.Value(0)).current;
    const visible = selectedServices.length > 0;

    useEffect(() => {
        Animated.spring(animVal, {
            toValue: visible ? 1 : 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
        }).start();
    }, [visible, animVal]);

    const subtotal = selectedServices.reduce((sum, s) => sum + s.price * (s.quantity ?? 1), 0);

    const translateY = animVal.interpolate({ inputRange: [0, 1], outputRange: [-56, 0] });
    const opacity = animVal;

    // Render a zero-height placeholder when not visible so hooks are always called
    if (!visible) {
        return (
            <Animated.View
                style={[styles.selectedBar, { transform: [{ translateY }], opacity }]}
                pointerEvents="none"
            />
        );
    }

    return (
        <Animated.View style={[styles.selectedBar, { transform: [{ translateY }], opacity }]}>
            <View style={styles.selectedBarLeft}>
                <View style={styles.selectedBarBadge}>
                    <Text style={styles.selectedBarBadgeText}>{selectedServices.length}</Text>
                </View>
                <View>
                    <Text style={styles.selectedBarLabel}>
                        {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}{' '}
                        selected
                    </Text>
                    <Text style={styles.selectedBarSubtotal}>
                        Subtotal: ₹{subtotal.toLocaleString('en-IN')}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.selectedBarClear}
                onPress={onClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="close-circle" size={16} color={Colors.gradientStart} />
                <Text style={styles.selectedBarClearText}>Clear all</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

/* ─────────────────────── Empty / Error State ─────────────────────── */

const EmptyState: React.FC<{ onRetry: () => void; isError: boolean }> = ({ onRetry, isError }) => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIconBox}>
            <Ionicons
                name={isError ? 'cloud-offline-outline' : 'medical-outline'}
                size={38}
                color={isError ? '#FF5A5F' : Colors.gradientStart + '90'}
            />
        </View>
        <Text style={styles.emptyTitle}>
            {isError ? 'Failed to Load Services' : 'No Services Available'}
        </Text>
        <Text style={styles.emptyText}>
            {isError
                ? 'Check your connection and try again.'
                : 'No active services found right now.'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Ionicons name="refresh" size={14} color={Colors.gradientStart} />
            <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
    </View>
);

/* ─────────────────────── Main Screen ─────────────────────── */

const ServiceSelectionScreen: React.FC<ServiceSelectionScreenProps> = ({
    selectedServices,
    setSelectedServices,
}) => {
    const [availableServices, setAvailableServices] = useState<ServiceDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);

    /* ── Fetch ── */
    const fetchServices = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(false);
        try {
            const res = await serviceAPI.getAllServices();
            // Normalise multiple possible API response shapes
            console.log('response services:', res.data);
            const raw: ServiceDoc[] =
                res.data?.data ?? res.data?.services ?? (Array.isArray(res.data) ? res.data : []);

            // Only show active services; guard against missing _id
            const active = raw.filter(s => s.isActive !== false && !!s._id);
            setAvailableServices(active);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchServices(true);
    }, [fetchServices]);

    /* ── Toggle ── */
    const toggleService = useCallback(
        (svc: ServiceDoc) => {
            // _id is guaranteed by the active filter above, but double-guard
            if (!svc._id) return;
            const alreadySelected = selectedServices.some(s => s.serviceId === svc._id);
            if (alreadySelected) {
                setSelectedServices(selectedServices.filter(s => s.serviceId !== svc._id));
            } else {
                setSelectedServices([
                    ...selectedServices,
                    {
                        serviceId: svc._id,
                        serviceName: svc.serviceName,
                        price: svc.basePrice,
                        quantity: 1,
                    },
                ]);
            }
        },
        [selectedServices, setSelectedServices],
    );

    const clearAll = useCallback(() => setSelectedServices([]), [setSelectedServices]);

    /* ── FlatList helpers — all stable via useCallback ── */
    const renderItem = useCallback(
        ({ item }: { item: ServiceDoc }) => (
            <ServiceListItem
                service={item}
                selected={selectedServices.some(s => s.serviceId === item._id)}
                onPress={() => toggleService(item)}
            />
        ),
        [selectedServices, toggleService],
    );

    /*
     * FIX: use _id as key (guaranteed unique from MongoDB).
     * Fallback appends index to handle edge-case duplicate names.
     */
    const keyExtractor = useCallback(
        (item: ServiceDoc, index: number) => item._id ?? `svc-${index}`,
        [],
    );

    /* ── Loading state ── */
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.loadingText}>Loading services…</Text>
            </View>
        );
    }

    /* ── Main render ──
     * FIX: FlatList with scrollEnabled={false} and RefreshControl doesn't work
     * (the pull gesture is swallowed by the parent ScrollView before reaching
     * the FlatList). We remove RefreshControl from the FlatList and instead
     * offer a manual refresh button at the top. The parent ScrollView in
     * BookingScreen handles all scrolling.
     * ─────────────────────────────────────────────────────────────────────── */
    return (
        <View style={styles.root}>
            {/* Selected summary bar */}
            {selectedServices.length > 0 && (
                <SelectedBar selectedServices={selectedServices} onClear={clearAll} />
            )}

            {/* Header row */}
            <View style={styles.headerRow}>
                <SectionLabel title="Available Services" count={availableServices.length} />
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={onRefresh}
                    disabled={refreshing}
                    activeOpacity={0.75}
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color={Colors.gradientStart} />
                    ) : (
                        <Ionicons name="refresh-outline" size={18} color={Colors.gradientStart} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Content */}
            {error || availableServices.length === 0 ? (
                <EmptyState onRetry={() => fetchServices()} isError={error} />
            ) : (
                <FlatList
                    data={availableServices}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ItemSeparator}
                    showsVerticalScrollIndicator={false}
                    /*
                     * scrollEnabled={false}: parent ScrollView owns scrolling.
                     * RefreshControl removed — it only works on the scrollable
                     * component that owns the gesture (not nested FlatLists).
                     * Use the manual refresh button above instead.
                     */
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                    removeClippedSubviews={false}
                    ListFooterComponent={<View style={{ height: 12 }} />}
                />
            )}
        </View>
    );
};

/* ─────────────────────── Styles ─────────────────────── */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },

    // Loading
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: { marginTop: 12, fontSize: 14, color: Colors.textMuted, fontWeight: '600' },

    // Header row
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 4,
    },
    refreshBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: Colors.gradientStart + '14',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Section label
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textDark,
        letterSpacing: 0.2,
        marginRight: 8,
    },
    sectionBadge: {
        backgroundColor: Colors.gradientStart + '20',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    sectionBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.gradientStart,
    },

    // Selected summary bar
    selectedBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E6FAF5',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.gradientStart + '44',
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 12,
        // min height so the zero-height placeholder doesn't collapse layout
        minHeight: 52,
        overflow: 'hidden',
    },
    selectedBarLeft: { flexDirection: 'row', alignItems: 'center' },
    selectedBarBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    selectedBarBadgeText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
    selectedBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
    selectedBarSubtotal: {
        fontSize: 11,
        color: Colors.gradientStart,
        fontWeight: '600',
        marginTop: 1,
    },
    selectedBarClear: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: Colors.gradientStart + '30',
    },
    selectedBarClearText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.gradientStart,
        marginLeft: 4,
    },

    // List
    listContent: { paddingBottom: 4 },
    separator: {
        height: 1,
        backgroundColor: '#EEF5F8',
        marginLeft: 70,
        marginRight: 4,
    },

    // List item
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRadius: 14,
    },
    listItemSelected: { backgroundColor: '#F4FDF9' },

    listIconBox: {
        width: 46,
        height: 46,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    listImage: {
        width: 46,
        height: 46,
        borderRadius: 13,
        marginRight: 12,
        flexShrink: 0,
        backgroundColor: '#F2F7FA', // placeholder while the image loads
    },
    listImageSelected: {
        borderWidth: 2,
        borderColor: Colors.gradientStart,
    },

    listInfo: { flex: 1, marginRight: 8 },
    listName: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 5 },
    listNameSelected: { color: Colors.gradientStart },

    listMetaRow: { flexDirection: 'row', flexWrap: 'wrap' },
    listMetaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F7FA',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginRight: 5,
        marginBottom: 2,
    },
    listMetaText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textMuted,
        marginLeft: 3,
    },

    listRight: { alignItems: 'flex-end', flexShrink: 0 },
    listPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textDark,
        marginBottom: 6,
    },
    listPriceSelected: { color: Colors.gradientStart },

    // Checkbox
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#C8DDE5',
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: Colors.gradientStart,
        borderColor: Colors.gradientStart,
    },

    // Empty / error state
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyIconBox: {
        width: 76,
        height: 76,
        borderRadius: 22,
        backgroundColor: '#E6FAF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    emptyTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
    emptyText: {
        fontSize: 13,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6FAF5',
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: Colors.gradientStart + '40',
    },
    retryText: { fontSize: 13, fontWeight: '700', color: Colors.gradientStart, marginLeft: 6 },
});

export default ServiceSelectionScreen;
