import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Image,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { serviceAPI } from '@/service/apis/medicalServices';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { Colors } from '@/theme/colors';
import { Service } from '@/features/vendorService/types/Service';
import { useAlert } from '@/context/AlertContext';
import AddServiceModal from '../model/AddServiceModal';

type ServiceWithId = Service & { _id: string };

// ── Service Request API types ─────────────────────────────────────────────────
// GET /vendor/service-requests (serviceAPI.myRequests()) response shape:
// {
//   "success": true,
//   "count": 1,
//   "data": [
//     {
//       "_id": "6a842fe4456b2bcd1b6b2346",
//       "vendor": "6a2d2d82f7bb131d0982379d",
//       "services": [
//         { "_id": "...", "serviceName": "Community Health Survey", "category": "...", "basePrice": 5000, "duration": 480 }
//       ],
//       "status": "pending",
//       "createdAt": "2026-08-18T10:11:48.086Z",
//       "updatedAt": "2026-08-18T10:11:48.086Z",
//       "__v": 0
//     }
//   ]
// }

export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected';

// Services embedded in a request come back un-populated — `category` is just
// the category's ObjectId string here, not the full category document.
export interface ServiceRequestServiceItem {
    _id: string;
    serviceName: string;
    category: string;
    basePrice: number;
    duration?: number;
}

export interface ServiceRequestItem {
    _id: string;
    vendor: string;
    services: ServiceRequestServiceItem[];
    status: ServiceRequestStatus;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface ServiceRequestsResponse {
    success: boolean;
    count: number;
    data: ServiceRequestItem[];
}

// ── Top tabs ───────────────────────────────────────────────────────────────────

type ScreenTab = 'services' | 'requests';

const REQUEST_STATUS_CONFIG: Record<
    ServiceRequestStatus,
    { label: string; color: string; bg: string; icon: string }
> = {
    pending: { label: 'Pending', color: '#C07800', bg: '#FFF8E6', icon: 'time-outline' },
    approved: {
        label: 'Approved',
        color: '#00A07A',
        bg: '#E6FFF5',
        icon: 'checkmark-circle-outline',
    },
    rejected: { label: 'Rejected', color: '#CC2200', bg: '#FFF1F0', icon: 'close-circle-outline' },
};

const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// ── My Services card ────────────────────────────────────────────────────────

const ServiceCard = ({
    service,
    processing,
    onToggle,
}: {
    service: ServiceWithId;
    processing: boolean;
    onToggle: () => void;
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleTogglePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        onToggle();
    };

    const active = service.isActive ?? false;

    return (
        <Animated.View style={[styles.serviceCard, { transform: [{ scale: scaleAnim }] }]}>
            {/* Header row */}
            <View style={styles.cardHeader}>
                <View
                    style={[
                        styles.catIconWrap,
                        { backgroundColor: active ? Colors.gradientStart + '18' : '#F3F7FA' },
                    ]}
                >
                    {service.image ? (
                        <Image source={{ uri: service.image }} style={styles.serviceImage} />
                    ) : (
                        <Ionicons
                            name="medical"
                            size={22}
                            color={active ? Colors.gradientStart : Colors.textMuted}
                        />
                    )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.serviceTitle} numberOfLines={1}>
                        {service.serviceName}
                    </Text>
                    <Text style={styles.serviceCategory}>{service.category?.name}</Text>
                </View>
                <View
                    style={[styles.statusPill, { backgroundColor: active ? '#E6FFF5' : '#FFF1F0' }]}
                >
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: active ? '#00D4A0' : '#FF5A5F' },
                        ]}
                    />
                    <Text style={[styles.statusText, { color: active ? '#00A07A' : '#CC2200' }]}>
                        {active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>

            {/* Description */}
            <Text style={styles.serviceDescription} numberOfLines={2}>
                {service.description ?? 'No description available.'}
            </Text>

            {/* Meta chips */}
            <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                    <Ionicons name="cash-outline" size={13} color={Colors.textDark} />
                    <Text style={styles.metaText}>
                        ₹{service.basePrice?.toLocaleString('en-IN')}
                    </Text>
                </View>
                {!!service.duration && (
                    <View style={styles.metaChip}>
                        <Ionicons name="time-outline" size={13} color={Colors.textDark} />
                        <Text style={styles.metaText}>{service.duration} min</Text>
                    </View>
                )}
                {!!service.serviceType && (
                    <View style={styles.metaChip}>
                        <Ionicons name="location-outline" size={13} color={Colors.textDark} />
                        <Text style={styles.metaText}>{service.serviceType}</Text>
                    </View>
                )}
            </View>

            {/* Tags */}
            {(service.tags?.length ?? 0) > 0 && (
                <View style={styles.tagsRow}>
                    {service.tags!.map(tag => (
                        <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Requirements */}
            {!!service.requirements && (
                <View style={styles.reqRow}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={15}
                        color="#C07800"
                        style={{ marginTop: 1 }}
                    />
                    <Text style={styles.reqText} numberOfLines={2}>
                        {service.requirements}
                    </Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[
                        styles.toggleBtn,
                        active ? styles.deactivateBtn : styles.activateBtn,
                        processing && styles.toggleBtnDisabled,
                    ]}
                    onPress={handleTogglePress}
                    disabled={processing}
                    activeOpacity={0.85}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color={active ? '#CC2200' : '#00A07A'} />
                    ) : (
                        <>
                            <Ionicons
                                name={active ? 'pause-circle' : 'play-circle'}
                                size={16}
                                color={active ? '#CC2200' : '#00A07A'}
                            />
                            <Text
                                style={[
                                    styles.toggleText,
                                    { color: active ? '#CC2200' : '#00A07A' },
                                ]}
                            >
                                {active ? 'Deactivate' : 'Activate'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// ── Service Request card ──────────────────────────────────────────────────────

const RequestCard = ({ request }: { request: ServiceRequestItem }) => {
    const cfg = REQUEST_STATUS_CONFIG[request.status] ?? REQUEST_STATUS_CONFIG.pending;
    const totalValue = request.services.reduce((sum, s) => sum + (s.basePrice ?? 0), 0);

    return (
        <View style={styles.requestCard}>
            {/* Header */}
            <View style={styles.requestHeader}>
                <View style={styles.requestHeaderLeft}>
                    <Ionicons name="document-text-outline" size={15} color={Colors.textMuted} />
                    <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
                </View>
                <View style={[styles.requestStatusPill, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
                    <Text style={[styles.requestStatusText, { color: cfg.color }]}>
                        {cfg.label}
                    </Text>
                </View>
            </View>

            {/* Requested services */}
            <View style={styles.requestServicesList}>
                {request.services.map((s, idx) => (
                    <View
                        key={s._id ?? idx}
                        style={[
                            styles.requestServiceRow,
                            idx !== request.services.length - 1 && styles.requestServiceRowDivider,
                        ]}
                    >
                        <View style={styles.requestServiceIconWrap}>
                            <Ionicons name="medical" size={14} color={Colors.gradientMid} />
                        </View>
                        <Text style={styles.requestServiceName} numberOfLines={1}>
                            {s.serviceName}
                        </Text>
                        <Text style={styles.requestServicePrice}>
                            ₹{s.basePrice?.toLocaleString('en-IN')}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Footer summary */}
            <View style={styles.requestFooter}>
                <Text style={styles.requestFooterText}>
                    {request.services.length} service{request.services.length > 1 ? 's' : ''}{' '}
                    requested
                </Text>
                <Text style={styles.requestFooterTotal}>
                    Total: ₹{totalValue.toLocaleString('en-IN')}
                </Text>
            </View>
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

const VendorServicesScreen = ({
    navigation,
}: NativeBottomTabScreenProps<VendorTabParamList, 'Services'>) => {
    const alert = useAlert();

    const [activeTab, setActiveTab] = useState<ScreenTab>('services');

    const [services, setServices] = useState<ServiceWithId[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestsLoaded, setRequestsLoaded] = useState(false);

    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // ── Fetch: My Services ────────────────────────────────────────────────────

    const fetchServices = async (silent = false) => {
        if (!silent) setServicesLoading(true);
        try {
            const response = await serviceAPI.vendorServices();
            setServices((response.data?.data ?? []) as ServiceWithId[]);
        } catch (error) {
            console.warn('Unable to load vendor services', error);
            alert.error('Error', 'Unable to load services. Pull down to retry.');
        } finally {
            setServicesLoading(false);
        }
    };

    // ── Fetch: Service Requests ───────────────────────────────────────────────

    const fetchPendingRequest = async (silent = false) => {
        if (!silent) setRequestsLoading(true);
        try {
            const response = await serviceAPI.myRequests();
            debugger
            const payload = response.data as ServiceRequestsResponse;
            setRequests(payload?.data ?? []);
        } catch (error) {
            console.error('failed to fetch pending requests : ', error);
            alert.error('Error', 'Unable to load your service requests.');
        } finally {
            setRequestsLoading(false);
            setRequestsLoaded(true);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // Lazy-load requests the first time that tab is opened.
    useEffect(() => {
        if (activeTab === 'requests' && !requestsLoaded) {
            fetchPendingRequest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // ── Activate / Deactivate ────────────────────────────────────────────────

    const handleToggle = async (serviceId: string, currentStatus?: boolean) => {
        setProcessingId(serviceId);
        try {
            await serviceAPI.toggleServiceStatus(serviceId);
            // Optimistic update
            setServices(prev =>
                prev.map(s => (s._id === serviceId ? { ...s, isActive: !currentStatus } : s)),
            );
        } catch (error: any) {
            console.error('Error while updating status : ', error);
            alert.error('Action Failed', 'Unable to update service status.');
        } finally {
            setProcessingId(null);
        }
    };

    // ── Request modal open/close ─────────────────────────────────────────────

    const openRequestModal = () => setRequestModalVisible(true);

    const closeRequestModal = () => {
        setRequestModalVisible(false);
        // A newly submitted request affects both tabs — pending grant list and
        // (once approved) the services list.
        fetchServices(true);
        fetchPendingRequest(true);
    };

    // ── Pull to refresh — refreshes whichever tab is active ──────────────────

    const handleRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'services') {
            await fetchServices(true);
        } else {
            await fetchPendingRequest(true);
        }
        setRefreshing(false);
    };

    // ── Counts ────────────────────────────────────────────────────────────────

    const activeCount = services.filter(s => s.isActive).length;
    const inactiveCount = services.length - activeCount;
    const pendingRequestCount = requests.filter(r => r.status === 'pending').length;

    const isInitialLoading =
        activeTab === 'services' ? servicesLoading : requestsLoading && !requestsLoaded;

    return (
        <View style={styles.root}>
            {/* ── Request Services Modal ── */}
            <AddServiceModal visible={requestModalVisible} onClose={closeRequestModal} />

            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.blobTR} />
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>My Services</Text>
                        <Text style={styles.headerSub}>
                            {services.length} total · {activeCount} active · {inactiveCount}{' '}
                            inactive
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={openRequestModal}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.addBtnText}>Request</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Top tabs ── */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'services' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('services')}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name="briefcase-outline"
                            size={15}
                            color={activeTab === 'services' ? Colors.gradientStart : '#fff'}
                        />
                        <Text
                            style={[
                                styles.tabBtnText,
                                activeTab === 'services' && styles.tabBtnTextActive,
                            ]}
                        >
                            My Services
                        </Text>
                        {services.length > 0 && (
                            <View
                                style={[
                                    styles.tabCountBadge,
                                    activeTab === 'services' && styles.tabCountBadgeActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabCountText,
                                        activeTab === 'services' && styles.tabCountTextActive,
                                    ]}
                                >
                                    {services.length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('requests')}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name="hourglass-outline"
                            size={15}
                            color={activeTab === 'requests' ? Colors.gradientStart : '#fff'}
                        />
                        <Text
                            style={[
                                styles.tabBtnText,
                                activeTab === 'requests' && styles.tabBtnTextActive,
                            ]}
                        >
                            Service Requests
                        </Text>
                        {pendingRequestCount > 0 && (
                            <View
                                style={[
                                    styles.tabCountBadge,
                                    activeTab === 'requests' && styles.tabCountBadgeActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabCountText,
                                        activeTab === 'requests' && styles.tabCountTextActive,
                                    ]}
                                >
                                    {pendingRequestCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* ── Content ── */}
            {isInitialLoading ? (
                <View style={[styles.centered, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={Colors.gradientStart} />
                    <Text style={styles.loadingText}>
                        {activeTab === 'services' ? 'Loading services...' : 'Loading requests...'}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={Colors.gradientStart}
                            colors={[Colors.gradientStart]}
                        />
                    }
                >
                    {activeTab === 'services' ? (
                        services.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Ionicons
                                    name="medkit-outline"
                                    size={48}
                                    color={Colors.gradientStart}
                                    style={{ marginBottom: 14 }}
                                />
                                <Text style={styles.emptyTitle}>No Services Yet</Text>
                                <Text style={styles.emptyText}>
                                    Tap the <Text style={{ fontWeight: '800' }}>+ Request</Text>{' '}
                                    button above to browse the catalog and request services to
                                    offer.
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyCta}
                                    onPress={openRequestModal}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="add-circle" size={16} color="#fff" />
                                    <Text style={styles.emptyCtaText}>Request Services</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            services.map(service => (
                                <ServiceCard
                                    key={service._id}
                                    service={service}
                                    processing={processingId === service._id}
                                    onToggle={() => handleToggle(service._id, service.isActive)}
                                />
                            ))
                        )
                    ) : requests.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons
                                name="hourglass-outline"
                                size={48}
                                color={Colors.gradientStart}
                                style={{ marginBottom: 14 }}
                            />
                            <Text style={styles.emptyTitle}>No Requests Yet</Text>
                            <Text style={styles.emptyText}>
                                Services you request will show up here while they&apos;re waiting
                                for approval.
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyCta}
                                onPress={openRequestModal}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="add-circle" size={16} color="#fff" />
                                <Text style={styles.emptyCtaText}>Request Services</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        requests.map(request => <RequestCard key={request._id} request={request} />)
                    )}
                </ScrollView>
            )}
        </View>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: Colors.textMuted },

    // Header
    header: {
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        overflow: 'hidden',
    },
    blobTR: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.09)',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4, fontWeight: '500' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    addBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

    // Top tabs
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: 14,
        padding: 4,
        gap: 4,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 11,
    },
    tabBtnActive: { backgroundColor: '#fff' },
    tabBtnText: { fontSize: 12.5, fontWeight: '800', color: '#fff' },
    tabBtnTextActive: { color: Colors.gradientStart },
    tabCountBadge: {
        marginLeft: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 999,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    tabCountBadgeActive: { backgroundColor: Colors.gradientStart + '22' },
    tabCountText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    tabCountTextActive: { color: Colors.gradientStart },

    // Content
    content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 100 },

    // Service Card
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    catIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    serviceImage: { width: 46, height: 46, borderRadius: 14 },
    serviceTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 2 },
    serviceCategory: { fontSize: 12, fontWeight: '600', color: Colors.gradientMid },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: '800' },
    serviceDescription: {
        fontSize: 13,
        color: Colors.textMedium,
        lineHeight: 20,
        marginBottom: 12,
    },

    // Meta chips
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#F2F7FA',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    metaText: { fontSize: 12, fontWeight: '700', color: Colors.textDark },

    // Tags
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    tagChip: {
        backgroundColor: Colors.gradientStart + '15',
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    tagText: { fontSize: 11, fontWeight: '600', color: Colors.gradientStart },

    // Requirements
    reqRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#FFF8E6',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F5A62330',
    },
    reqText: { flex: 1, fontSize: 12, color: '#7A5000', fontWeight: '500', lineHeight: 18 },

    // Footer — Activate/Deactivate only (no edit — vendors can't change service definitions)
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        borderRadius: 14,
        paddingVertical: 11,
        paddingHorizontal: 18,
        minWidth: 120,
        justifyContent: 'center',
    },
    activateBtn: { backgroundColor: '#E6FFF5', borderWidth: 1.5, borderColor: '#00D4A033' },
    deactivateBtn: { backgroundColor: '#FFF1F0', borderWidth: 1.5, borderColor: '#FF5A5F33' },
    toggleBtnDisabled: { opacity: 0.6 },
    toggleText: { fontSize: 13, fontWeight: '800' },

    // Request card
    requestCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    requestHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    requestDate: { fontSize: 12.5, fontWeight: '600', color: Colors.textMuted },
    requestStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    requestStatusText: { fontSize: 11, fontWeight: '800' },
    requestServicesList: {
        borderTopWidth: 1,
        borderTopColor: '#F0F4F8',
        paddingTop: 4,
    },
    requestServiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    requestServiceRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F8',
    },
    requestServiceIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.gradientMid + '15',
    },
    requestServiceName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.textDark },
    requestServicePrice: { fontSize: 13, fontWeight: '800', color: Colors.textDark },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F4F8',
    },
    requestFooterText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
    requestFooterTotal: { fontSize: 13, fontWeight: '800', color: Colors.gradientMid },

    // Empty state
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
    emptyText: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 16,
    },
    emptyCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.gradientStart,
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    emptyCtaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});

export default VendorServicesScreen;
            