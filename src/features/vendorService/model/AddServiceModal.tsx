import { Colors } from '@/theme/colors';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Service } from '../types/Service';
import { serviceAPI } from '@/service/apis/medicalServices';
import { useAlert } from '@/context/AlertContext';

type ServiceDoc = Service & { _id: string };

// ── Request Services Modal ────────────────────────────────────────────────────
// Vendors don't create or edit service definitions themselves — they browse the
// platform's active service catalog and request the ones they want to offer.
// Fully self-contained: fetches the catalog, manages selection, and submits the
// request on its own, so the parent only needs to control visibility.

interface AddServiceModalProps {
    visible: boolean;
    onClose: () => void;
}

const AddServiceModal = ({ visible, onClose }: AddServiceModalProps) => {
    const alert = useAlert();

    const [loading, setLoading] = useState(true);
    const [availableServices, setAvailableServices] = useState<ServiceDoc[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Fetch catalog every time the modal opens ─────────────────────────────

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await serviceAPI.getAllServices();
            // Normalise multiple possible API response shapes
            const raw: ServiceDoc[] =
                res.data?.data ?? res.data?.services ?? (Array.isArray(res.data) ? res.data : []);

            // Only show active services; guard against missing _id
            const active = raw.filter(s => s.isActive !== false && !!s._id);
            setAvailableServices(active);
        } catch (error) {
            console.error('Unable to load service catalog:', error);
            alert.error('Error', 'Unable to load available services.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setSelectedIds([]);
            setSearchQuery('');
            fetchServices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // ── Selection ─────────────────────────────────────────────────────────────

    const toggleSelect = (id: string) => {
        debugger
        setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    };

    const filteredServices = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return availableServices;
        return availableServices.filter(
            s =>
                s.serviceName?.toLowerCase().includes(q) ||
                s.category?.name?.toLowerCase().includes(q),
        );
    }, [availableServices, searchQuery]);

    // ── Submit request ────────────────────────────────────────────────────────

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const handleRequestServices = async () => {
        if (selectedIds.length === 0) {
            alert.error('No Services Selected', 'Select at least one service to request.');
            return;
        }

        setSubmitting(true);
        try {
            debugger
            const response = await serviceAPI.vendorServiceRequest(selectedIds);
            if (response?.data?.success ?? true) {
                alert.success(
                    'Request Sent',
                    `Your request for ${selectedIds.length} service${
                        selectedIds.length > 1 ? 's' : ''
                    } has been submitted for approval.`,
                );
                setSelectedIds([]);
                onClose();
            } else {
                alert.error('Failed', response?.data?.message || 'Unable to request services.');
            }
        } catch (error: any) {
            console.error('Failed to request services:', error);
            alert.error(
                'Failed',
                error?.response?.data?.message || error?.message || 'Unable to request services.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={modal.overlay}>
                <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={handleClose} />

                <View style={modal.sheet}>
                    <View style={modal.handle} />

                    {/* Title */}
                    <View style={modal.titleRow}>
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid]}
                            style={modal.titleIconWrap}
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={modal.title}>Request Services</Text>
                            <Text style={modal.subtitle}>
                                Select the services you&apos;d like to offer
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={modal.closeIconBtn}
                            onPress={handleClose}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="close" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={modal.searchBox}>
                        <Ionicons name="search" size={16} color={Colors.textMuted} />
                        <TextInput
                            style={modal.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search services or categories"
                            placeholderTextColor="#B0BEC5"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Selected count */}
                    {selectedIds.length > 0 && (
                        <View style={modal.selectedBanner}>
                            <Ionicons
                                name="checkmark-circle"
                                size={15}
                                color={Colors.gradientStart}
                            />
                            <Text style={modal.selectedBannerText}>
                                {selectedIds.length} service{selectedIds.length > 1 ? 's' : ''}{' '}
                                selected
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedIds([])}>
                                <Text style={modal.selectedBannerClear}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* List */}
                    {loading ? (
                        <View style={modal.loadingBox}>
                            <ActivityIndicator size="small" color={Colors.gradientStart} />
                            <Text style={modal.loadingText}>Loading services…</Text>
                        </View>
                    ) : filteredServices.length === 0 ? (
                        <View style={modal.emptyBox}>
                            <Ionicons name="medkit-outline" size={40} color={Colors.textMuted} />
                            <Text style={modal.emptyTitle}>
                                {availableServices.length === 0
                                    ? 'No services available'
                                    : 'No matches found'}
                            </Text>
                            <Text style={modal.emptyText}>
                                {availableServices.length === 0
                                    ? 'Check back later for new services to offer.'
                                    : 'Try a different search term.'}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={modal.list}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {filteredServices.map(service => {
                                const selected = selectedIds.includes(service._id);
                                return (
                                    <TouchableOpacity
                                        key={service._id}
                                        style={[modal.item, selected && modal.itemSelected]}
                                        onPress={() => toggleSelect(service._id)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={selected ? 'checkbox' : 'square-outline'}
                                            size={22}
                                            color={selected ? Colors.gradientStart : '#C6D3DA'}
                                            style={{ marginRight: 12 }}
                                        />

                                        <View
                                            style={[
                                                modal.itemIconWrap,
                                                {
                                                    backgroundColor: selected
                                                        ? Colors.gradientStart + '18'
                                                        : '#F3F7FA',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="medical"
                                                size={18}
                                                color={
                                                    selected
                                                        ? Colors.gradientStart
                                                        : Colors.textMuted
                                                }
                                            />
                                        </View>

                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={modal.itemTitle} numberOfLines={1}>
                                                {service.serviceName}
                                            </Text>
                                            <Text style={modal.itemCategory} numberOfLines={1}>
                                                {service.category?.name}
                                            </Text>

                                            <View style={modal.itemMetaRow}>
                                                <View style={modal.itemChip}>
                                                    <Ionicons
                                                        name="cash-outline"
                                                        size={11}
                                                        color={Colors.textDark}
                                                    />
                                                    <Text style={modal.itemChipText}>
                                                        ₹
                                                        {service.basePrice?.toLocaleString('en-IN')}
                                                    </Text>
                                                </View>
                                                {!!service.duration && (
                                                    <View style={modal.itemChip}>
                                                        <Ionicons
                                                            name="time-outline"
                                                            size={11}
                                                            color={Colors.textDark}
                                                        />
                                                        <Text style={modal.itemChipText}>
                                                            {service.duration} min
                                                        </Text>
                                                    </View>
                                                )}
                                                {!!service.serviceType && (
                                                    <View style={modal.itemChip}>
                                                        <Ionicons
                                                            name="location-outline"
                                                            size={11}
                                                            color={Colors.textDark}
                                                        />
                                                        <Text style={modal.itemChipText}>
                                                            {service.serviceType}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            <View style={{ height: 4 }} />
                        </ScrollView>
                    )}

                    {/* Buttons */}
                    <View style={modal.btnRow}>
                        <TouchableOpacity
                            style={modal.cancelBtn}
                            onPress={handleClose}
                            disabled={submitting}
                            activeOpacity={0.8}
                        >
                            <Text style={modal.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                modal.submitBtn,
                                (submitting || selectedIds.length === 0) && { opacity: 0.6 },
                            ]}
                            onPress={handleRequestServices}
                            disabled={submitting || selectedIds.length === 0}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[
                                    Colors.gradientStart,
                                    Colors.gradientMid,
                                    Colors.gradientEnd,
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={modal.submitGradient}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="send"
                                            size={15}
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={modal.submitText}>
                                            Request
                                            {selectedIds.length > 0
                                                ? ` (${selectedIds.length})`
                                                : ''}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const modal = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 22,
        paddingBottom: 22,
        maxHeight: '90%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#DDE3EA',
        alignSelf: 'center',
        marginBottom: 18,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    titleIconWrap: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 17, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
    subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    closeIconBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F7FA',
    },

    // Search
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderColor: '#E0E8EF',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#F8FCFF',
        marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textDark, padding: 0 },

    // Selected banner
    selectedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.gradientStart + '12',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        marginBottom: 10,
    },
    selectedBannerText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textDark,
    },
    selectedBannerClear: { fontSize: 12, fontWeight: '800', color: Colors.gradientStart },

    // List
    list: { maxHeight: 380 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E9EEF2',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    itemSelected: {
        borderColor: Colors.gradientStart,
        backgroundColor: Colors.gradientStart + '0A',
    },
    itemIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark },
    itemCategory: { fontSize: 11, fontWeight: '600', color: Colors.gradientMid, marginTop: 1 },
    itemMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    itemChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#F2F7FA',
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    itemChipText: { fontSize: 10, fontWeight: '700', color: Colors.textDark },

    // Loading / Empty
    loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
    loadingText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
    emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 },
    emptyTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginTop: 6 },
    emptyText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },

    // Buttons
    btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#DDE3EA',
        borderRadius: 14,
        paddingVertical: 14,
        backgroundColor: '#F8FCFF',
    },
    cancelText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
    submitBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
    submitGradient: {
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default AddServiceModal;
