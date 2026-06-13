import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { serviceAPI } from '@/service/apis/medicalServices';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { Colors } from '@/theme/colors';
import { Service } from '@/features/vendorService/types/Service';
import { useAlert } from '@/context/AlertContext';

// Service type needs _id from the API response
type ServiceWithId = Service & { _id: string };

const { width } = Dimensions.get('window');

// ── Category list ─────────────────────────────────────────────────────────────

const CATEGORIES: Service['category'][] = [
    'Home Injections',
    'IV Drip Services',
    'Wound Dressing',
    'Day Care at Home',
    'Patient Monitoring',
    'Old Age Patient Care',
    '24 HR Patient Care',
    'Field Survey Service',
    'Data Collection Service',
    'Field Sample Collection',
    'Community Survey',
    'Awareness Activities',
    'Lab-based Training',
    'BSC/MSC Training',
    'DMLT Training',
    'Nursing Training',
    'Dissertation Program',
    'Placement Services',
    'Blood Collection',
    'BP/Sugar Monitoring',
    'ECG at Home',
    'Catheter Care',
    'Physiotherapy Session',
    'Other',
];

const SERVICE_TYPES: NonNullable<Service['serviceType']>[] = ['At Home', 'At Clinic', 'Both'];

// ── New Service Form ──────────────────────────────────────────────────────────

interface ServiceForm {
    serviceName: string;
    description: string;
    category: Service['category'] | '';
    basePrice: string;
    duration: string;
    serviceType: Service['serviceType'] | '';
    requirements: string;
}

const FORM_DEFAULT: ServiceForm = {
    serviceName: '',
    description: '',
    category: '',
    basePrice: '',
    duration: '',
    serviceType: '',
    requirements: '',
};

const validateServiceForm = (form: ServiceForm): string | null => {
    if (!form.serviceName.trim()) return 'Service name is required.';
    if (!form.category) return 'Please select a category.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.basePrice.trim()) return 'Base price is required.';
    const price = parseFloat(form.basePrice);
    if (isNaN(price) || price <= 0) return 'Enter a valid base price.';
    if (form.duration && isNaN(parseInt(form.duration, 10))) return 'Duration must be a number.';
    return null;
};

// ── Add Service Modal ─────────────────────────────────────────────────────────

interface AddServiceModalProps {
    visible: boolean;
    submitting: boolean;
    form: ServiceForm;
    onChange: (field: keyof ServiceForm, value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

const AddServiceModal = ({
    visible,
    submitting,
    form,
    onChange,
    onSubmit,
    onClose,
}: AddServiceModalProps) => {
    const [categoryOpen, setCategoryOpen] = useState(false);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={modal.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={modal.sheet}>
                    <View style={modal.handle} />

                    {/* Title */}
                    <View style={modal.titleRow}>
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid]}
                            style={modal.titleIconWrap}
                        >
                            <Ionicons name="medical" size={22} color="#fff" />
                        </LinearGradient>
                        <View>
                            <Text style={modal.title}>Add New Service</Text>
                            <Text style={modal.subtitle}>Fill in the service details below</Text>
                        </View>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Service Name */}
                        <Field label="Service Name" required>
                            <ModalInput
                                value={form.serviceName}
                                onChangeText={v => onChange('serviceName', v)}
                                placeholder="e.g. Home Blood Collection"
                                editable={!submitting}
                            />
                        </Field>

                        {/* Category picker */}
                        <Field label="Category" required>
                            <TouchableOpacity
                                style={[modal.input, modal.pickerBtn]}
                                onPress={() => setCategoryOpen(o => !o)}
                                disabled={submitting}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={
                                        form.category ? modal.pickerValue : modal.pickerPlaceholder
                                    }
                                >
                                    {form.category || 'Select a category'}
                                </Text>
                                <Ionicons
                                    name={categoryOpen ? 'chevron-up' : 'chevron-down'}
                                    size={16}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>
                            {categoryOpen && (
                                <View style={modal.categoryList}>
                                    <ScrollView
                                        style={{ maxHeight: 200 }}
                                        nestedScrollEnabled
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[
                                                    modal.categoryItem,
                                                    form.category === cat &&
                                                        modal.categoryItemActive,
                                                ]}
                                                onPress={() => {
                                                    onChange('category', cat);
                                                    setCategoryOpen(false);
                                                }}
                                                activeOpacity={0.75}
                                            >
                                                <Ionicons
                                                    name={
                                                        form.category === cat
                                                            ? 'checkmark-circle'
                                                            : 'medical-outline'
                                                    }
                                                    size={18}
                                                    color={
                                                        form.category === cat
                                                            ? Colors.gradientStart
                                                            : Colors.textMuted
                                                    }
                                                />
                                                <Text
                                                    style={[
                                                        modal.categoryItemText,
                                                        form.category === cat &&
                                                            modal.categoryItemTextActive,
                                                    ]}
                                                >
                                                    {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </Field>

                        {/* Description */}
                        <Field label="Description" required>
                            <ModalInput
                                value={form.description}
                                onChangeText={v => onChange('description', v)}
                                placeholder="Brief description of the service"
                                multiline
                                numberOfLines={3}
                                editable={!submitting}
                            />
                        </Field>

                        {/* Price + Duration row */}
                        <View style={modal.twoCol}>
                            <View style={{ flex: 1 }}>
                                <Field label="Base Price (₹)" required>
                                    <ModalInput
                                        value={form.basePrice}
                                        onChangeText={v =>
                                            onChange('basePrice', v.replace(/[^0-9.]/g, ''))
                                        }
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        editable={!submitting}
                                    />
                                </Field>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Field label="Duration (min)">
                                    <ModalInput
                                        value={form.duration}
                                        onChangeText={v =>
                                            onChange('duration', v.replace(/[^0-9]/g, ''))
                                        }
                                        placeholder="e.g. 30"
                                        keyboardType="number-pad"
                                        editable={!submitting}
                                    />
                                </Field>
                            </View>
                        </View>

                        {/* Service Type */}
                        <Field label="Service Type">
                            <View style={modal.typeRow}>
                                {SERVICE_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[
                                            modal.typeChip,
                                            form.serviceType === t && modal.typeChipActive,
                                        ]}
                                        onPress={() =>
                                            onChange('serviceType', form.serviceType === t ? '' : t)
                                        }
                                        disabled={submitting}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                modal.typeText,
                                                form.serviceType === t && modal.typeTextActive,
                                            ]}
                                        >
                                            {t}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Field>

                        {/* Requirements */}
                        <Field label="Requirements / Notes">
                            <ModalInput
                                value={form.requirements}
                                onChangeText={v => onChange('requirements', v)}
                                placeholder="Any special requirements for this service"
                                multiline
                                numberOfLines={2}
                                editable={!submitting}
                            />
                        </Field>

                        {/* Buttons */}
                        <View style={modal.btnRow}>
                            <TouchableOpacity
                                style={modal.cancelBtn}
                                onPress={onClose}
                                disabled={submitting}
                                activeOpacity={0.8}
                            >
                                <Text style={modal.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modal.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={onSubmit}
                                disabled={submitting}
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
                                        <Text style={modal.submitText}>Add Service</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: Platform.OS === 'ios' ? 20 : 8 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ── Small helpers for modal ───────────────────────────────────────────────────

const Field = ({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) => (
    <View style={modal.field}>
        <Text style={modal.fieldLabel}>
            {label}
            {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
        {children}
    </View>
);

const ModalInput = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
        style={[modal.input, props.multiline && modal.inputMulti]}
        placeholderTextColor="#B0BEC5"
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
    />
);

const modal = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 22,
        paddingBottom: Platform.OS === 'ios' ? 34 : 22,
        maxHeight: '92%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#DDE3EA',
        alignSelf: 'center',
        marginBottom: 18,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
    titleIconWrap: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 17, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
    subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    field: { marginBottom: 14 },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E0E8EF',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        color: Colors.textDark,
        fontWeight: '500',
        backgroundColor: '#F8FCFF',
    },
    inputMulti: { minHeight: 70, paddingTop: 12 },
    pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pickerValue: { fontSize: 14, color: Colors.textDark, fontWeight: '500', flex: 1 },
    pickerPlaceholder: { fontSize: 14, color: '#B0BEC5', flex: 1 },
    categoryList: {
        borderWidth: 1.5,
        borderColor: '#E0E8EF',
        borderRadius: 14,
        marginTop: 6,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F8',
    },
    categoryItemActive: { backgroundColor: Colors.gradientStart + '15' },
    categoryItemText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
    categoryItemTextActive: { color: Colors.gradientStart },
    twoCol: { flexDirection: 'row', gap: 12 },
    typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    typeChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        backgroundColor: '#F8FCFF',
    },
    typeChipActive: { backgroundColor: Colors.gradientStart, borderColor: Colors.gradientStart },
    typeText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
    typeTextActive: { color: '#fff' },
    btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
    submitGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    submitText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

// ── Service Card ──────────────────────────────────────────────────────────────

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

    const handlePress = () => {
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
                    <Text style={styles.serviceCategory}>{service.category}</Text>
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
                    onPress={handlePress}
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

// ── Main Screen ───────────────────────────────────────────────────────────────

const VendorServicesScreen = ({
    navigation,
}: NativeBottomTabScreenProps<VendorTabParamList, 'Services'>) => {
    const alert = useAlert();
    const [services, setServices] = useState<ServiceWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Add service modal
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<ServiceForm>(FORM_DEFAULT);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchServices = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await serviceAPI.vendorServices();
            setServices((response.data?.data ?? []) as ServiceWithId[]);
        } catch (error) {
            console.warn('Unable to load vendor services', error);
            alert.error('Error', 'Unable to load services. Pull down to retry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // ── Toggle ────────────────────────────────────────────────────────────────

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

    // ── Add Service ───────────────────────────────────────────────────────────

    const handleFormChange = (field: keyof ServiceForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddService = async () => {
        const error = validateServiceForm(form);
        if (error) {
            alert.error('Validation', error);
            return;
        }

        setSubmitting(true);
        try {
            const payload: Partial<Service> = {
                serviceName: form.serviceName.trim(),
                category: form.category as Service['category'],
                description: form.description.trim(),
                basePrice: parseFloat(form.basePrice),
                duration: form.duration ? parseInt(form.duration, 10) : undefined,
                serviceType: (form.serviceType as Service['serviceType']) || undefined,
                requirements: form.requirements.trim() || undefined,
                isActive: true,
            };

            const response = await serviceAPI.createService(payload);

            if (response?.data?.success) {
                setModalVisible(false);
                setForm(FORM_DEFAULT);
                alert.success(
                    'Service Added',
                    `"${payload.serviceName}" has been added successfully.`,
                );
                await fetchServices(true);
            } else {
                alert.error('Failed', response?.data?.message || 'Unable to add service.');
            }
        } catch (error: any) {
            console.error('Error adding service:', error);
            alert.error(
                'Failed',
                error?.response?.data?.message || error?.message || 'Unable to add service.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = () => {
        setForm(FORM_DEFAULT);
        setModalVisible(true);
    };

    // ── Active / Inactive counts ──────────────────────────────────────────────

    const activeCount = services.filter(s => s.isActive).length;
    const inactiveCount = services.length - activeCount;

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.loadingText}>Loading services...</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>

            {/* ── Add Service Modal ── */}
            <AddServiceModal
                visible={modalVisible}
                submitting={submitting}
                form={form}
                onChange={handleFormChange}
                onSubmit={handleAddService}
                onClose={() => !submitting && setModalVisible(false)}
            />

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
                        onPress={openModal}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* ── Content ── */}
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {services.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons
                            name="medkit-outline"
                            size={48}
                            color={Colors.gradientStart}
                            style={{ marginBottom: 14 }}
                        />
                        <Text style={styles.emptyTitle}>No Services Yet</Text>
                        <Text style={styles.emptyText}>
                            Tap the <Text style={{ fontWeight: '800' }}>+ Add</Text> button above to
                            create your first service.
                        </Text>
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
                )}

                {/* Refresh button */}
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => fetchServices()}
                    activeOpacity={0.85}
                >
                    <Ionicons name="refresh" size={16} color={Colors.gradientStart} />
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },
    centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: Colors.textMuted },

    // Header
    header: {
        paddingTop: 24,
        paddingBottom: 22,
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
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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

    // Toggle
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

    // Empty state
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
    emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 21 },

    // Refresh
    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 13,
        borderWidth: 1,
        borderColor: '#D8E8EE',
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    refreshText: { color: Colors.gradientStart, fontWeight: '800', fontSize: 13 },
});

export default VendorServicesScreen;
