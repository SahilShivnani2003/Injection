import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    Easing,
    Dimensions,
    Modal,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { Colors } from '../../../theme/colors';
import { bookingAPI } from '../../../service/apis/bookingService';
import { SelectedService } from '@/types/booking';
import { UploadedFile } from '../BookingScreen';

const { width } = Dimensions.get('window');

/* ─────────────────────── Props ─────────────────────── */

interface RequirementsScreenProps {
    selectedServices: SelectedService[];
    setSelectedServices: (v: SelectedService[]) => void;
    additionalRequirements: string;
    setAdditionalRequirements: (v: string) => void;
    uploadedFile: UploadedFile | null;
    setUploadedFile: (v: UploadedFile | null) => void;
    hasInsurance: boolean;
    setHasInsurance: (v: boolean) => void;
    insurancePolicyNumber: string;
    setInsurancePolicyNumber: (v: string) => void;
}

interface ApiService {
    id: number;
    name: string;
    icon: string;
    price: number;
}

/* ─────────────────────── Upload Sheet ─────────────────────── */

const UploadPickerSheet: React.FC<{
    visible: boolean;
    onClose: () => void;
    onFilePicked: (f: UploadedFile) => void;
}> = ({ visible, onClose, onFilePicked }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : 300,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const handleCamera = async () => {
        onClose();
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: false,
            });
            if (result.assets?.[0]) {
                const a = result.assets[0];
                onFilePicked({ name: a.fileName ?? 'photo.jpg', uri: a.uri ?? '', type: 'image' });
            }
        } catch {
            Alert.alert('Camera Error', 'Unable to access camera. Check permissions.');
        }
    };

    const handleGallery = async () => {
        onClose();
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
            if (result.assets?.[0]) {
                const a = result.assets[0];
                onFilePicked({ name: a.fileName ?? 'image.jpg', uri: a.uri ?? '', type: 'image' });
            }
        } catch {
            Alert.alert('Gallery Error', 'Unable to open gallery. Check permissions.');
        }
    };

    const handleDocument = async () => {
        onClose();
        try {
            const [result] = await pick({
                type: [types.pdf, types.doc, types.docx, types.images],
                copyTo: 'cachesDirectory',
            });
            onFilePicked({
                name: result.name ?? 'document',
                uri: result.uri ?? result.uri,
                type: 'document',
            });
        } catch (err) {
           console.error(err)
        }
    };

    if (!visible) return null;
    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <TouchableOpacity style={ss.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[ss.sheet, { transform: [{ translateY: slideAnim }] }]}>
                <View style={ss.handle} />
                <Text style={ss.title}>Upload Prescription</Text>
                <Text style={ss.subtitle}>Choose how you'd like to add your file</Text>
                <View style={ss.optionsRow}>
                    {(
                        [
                            {
                                label: 'Camera',
                                sub: 'Take a photo',
                                emoji: '📷',
                                colors: [Colors.gradientStart, Colors.gradientEnd],
                                fn: handleCamera,
                            },
                            {
                                label: 'Gallery',
                                sub: 'Choose image',
                                emoji: '🖼️',
                                colors: ['#7ED321', '#5EA300'],
                                fn: handleGallery,
                            },
                            {
                                label: 'Document',
                                sub: 'PDF / Word',
                                emoji: '📄',
                                colors: ['#00B4E8', '#0090CC'],
                                fn: handleDocument,
                            },
                        ] as const
                    ).map(opt => (
                        <TouchableOpacity
                            key={opt.label}
                            style={ss.option}
                            onPress={opt.fn}
                            activeOpacity={0.75}
                        >
                            <LinearGradient
                                colors={[...opt.colors]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={ss.optionIcon}
                            >
                                <Text style={ss.optionEmoji}>{opt.emoji}</Text>
                            </LinearGradient>
                            <Text style={ss.optionLabel}>{opt.label}</Text>
                            <Text style={ss.optionSub}>{opt.sub}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={ss.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                    <Text style={ss.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
};

const ss = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        paddingTop: 14,
        elevation: 24,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D0DCE4',
        alignSelf: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 24 },
    optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    option: { flex: 1, alignItems: 'center', marginHorizontal: 6 },
    optionIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        elevation: 4,
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    optionEmoji: { fontSize: 26 },
    optionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 3 },
    optionSub: { fontSize: 11, color: Colors.textMuted },
    cancelBtn: {
        backgroundColor: '#F0F5F8',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelText: { fontSize: 15, fontWeight: '700', color: Colors.textMuted },
});

/* ─────────────────────── Service Card ─────────────────────── */

const ServiceCard: React.FC<{ service: ApiService; selected: boolean; onPress: () => void }> = ({
    service,
    selected,
    onPress,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(bgAnim, {
            toValue: selected ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [selected]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    return (
        <Animated.View style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={1}>
                <Animated.View
                    style={[
                        styles.serviceCard,
                        {
                            borderColor: bgAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#D8E8EE', Colors.gradientStart],
                            }),
                            backgroundColor: bgAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#F8FBFC', '#E6FAF5'],
                            }),
                        },
                    ]}
                >
                    {selected && (
                        <View style={styles.selectedBadge}>
                            <Text style={styles.selectedTick}>✓</Text>
                        </View>
                    )}
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                    <Text style={[styles.serviceName, selected && styles.serviceNameSel]}>
                        {service.name}
                    </Text>
                    <Text style={[styles.servicePrice, selected && styles.servicePriceSel]}>
                        ₹{service.price}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionRow}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

const FileChip: React.FC<{ file: UploadedFile; onRemove: () => void }> = ({ file, onRemove }) => (
    <View style={styles.fileChip}>
        <Text style={styles.fileChipIcon}>{file.type === 'image' ? '🖼️' : '📄'}</Text>
        <Text style={styles.fileChipName} numberOfLines={1}>
            {file.name}
        </Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.fileChipRemove}>✕</Text>
        </TouchableOpacity>
    </View>
);

/* ─────────────────────── Main Screen ─────────────────────── */

const RequirementsScreen: React.FC<RequirementsScreenProps> = ({
    selectedServices,
    setSelectedServices,
    additionalRequirements,
    setAdditionalRequirements,
    uploadedFile,
    setUploadedFile,
    hasInsurance,
    setHasInsurance,
    insurancePolicyNumber,
    setInsurancePolicyNumber,
}) => {
    const [availableServices, setAvailableServices] = useState<ApiService[]>([]);
    const [otherFocused, setOtherFocused] = useState(false);
    const [showUploadSheet, setShowUploadSheet] = useState(false);
    const [policyFocused, setPolicyFocused] = useState(false);
    const [policyFetched, setPolicyFetched] = useState(false);
    const [fetchingPolicy, setFetchingPolicy] = useState(false);

    /* Separate animated values to avoid native-driver conflict:
       insProgress  → useNativeDriver: false (drives maxHeight + opacity)
       insRotateAnim → useNativeDriver: true  (drives chevron transform)     */
    const insProgress = useRef(new Animated.Value(hasInsurance ? 1 : 0)).current;
    const insRotateAnim = useRef(new Animated.Value(hasInsurance ? 1 : 0)).current;

    useEffect(() => {
        (async () => {
            try {
                const res = await bookingAPI.getAvailableServices();
                setAvailableServices(res.data);
            } catch {
                setAvailableServices([
                    { id: 1, name: 'Blood Test', icon: '🩸', price: 500 },
                    { id: 2, name: 'Urine Test', icon: '🧪', price: 300 },
                    { id: 3, name: 'X-Ray Scan', icon: '🦴', price: 800 },
                    { id: 4, name: 'MRI Scan', icon: '🧠', price: 2500 },
                    { id: 5, name: 'ECG Test', icon: '❤️', price: 400 },
                    { id: 6, name: 'Ultrasound', icon: '🔊', price: 1200 },
                    { id: 7, name: 'CT Scan', icon: '🩻', price: 1800 },
                    { id: 8, name: 'Thyroid Test', icon: '🦋', price: 600 },
                ]);
            }
        })();
    }, []);

    useEffect(() => {
        const toValue = hasInsurance ? 1 : 0;
        Animated.parallel([
            Animated.timing(insProgress, {
                toValue,
                duration: 360,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(insRotateAnim, {
                toValue,
                duration: 360,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
        if (!hasInsurance) {
            setInsurancePolicyNumber('');
            setPolicyFetched(false);
        }
    }, [hasInsurance]);

    const toggleService = (svc: ApiService) => {
        const exists = selectedServices.find(s => s.serviceId === String(svc.id));
        if (exists) {
            setSelectedServices(selectedServices.filter(s => s.serviceId !== String(svc.id)));
        } else {
            setSelectedServices([
                ...selectedServices,
                { serviceId: String(svc.id), serviceName: svc.name, price: svc.price, quantity: 1 },
            ]);
        }
    };

    const handleFetchPolicy = async () => {
        if (!insurancePolicyNumber.trim()) return;
        try {
            setFetchingPolicy(true);
            // Replace with: await insuranceAPI.verifyPolicy(insurancePolicyNumber);
            await new Promise(r => console.log('fetching'));
            setPolicyFetched(true);
        } catch {
            Alert.alert('Policy Error', 'Could not verify policy number. Please check and retry.');
        } finally {
            setFetchingPolicy(false);
        }
    };

    const insMaxHeight = insProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 210] });
    const insOpacity = insProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const insRotate = insRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return (
        <View style={styles.root}>
            <SectionLabel title="Available Services" />
            {selectedServices.length > 0 && (
                <Text style={styles.selectedCount}>
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}{' '}
                    selected
                </Text>
            )}
            <View style={styles.grid}>
                {availableServices.map(s => (
                    <ServiceCard
                        key={s.id}
                        service={s}
                        selected={selectedServices.some(sel => sel.serviceId === String(s.id))}
                        onPress={() => toggleService(s)}
                    />
                ))}
            </View>

            <SectionLabel title="Other Requirement" />
            <View style={[styles.otherBox, otherFocused && styles.otherBoxFocused]}>
                <TextInput
                    style={styles.otherInput}
                    placeholder="Describe any additional requirement here..."
                    placeholderTextColor="#B0C4CC"
                    value={additionalRequirements}
                    onChangeText={setAdditionalRequirements}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    onFocus={() => setOtherFocused(true)}
                    onBlur={() => setOtherFocused(false)}
                />
            </View>

            <SectionLabel title="Documents" />
            {uploadedFile ? (
                <View style={styles.uploadedRow}>
                    <FileChip file={uploadedFile} onRemove={() => setUploadedFile(null)} />
                    <TouchableOpacity
                        style={styles.replaceBtn}
                        onPress={() => setShowUploadSheet(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.replaceBtnText}>Replace</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => setShowUploadSheet(true)}
                    activeOpacity={0.8}
                >
                    <View style={styles.uploadIconBox}>
                        <Text style={styles.uploadIconText}>📄</Text>
                    </View>
                    <View style={styles.uploadTextBox}>
                        <Text style={styles.uploadTitle}>Upload Prescription</Text>
                        <Text style={styles.uploadSub}>Camera · Gallery · PDF / Word</Text>
                    </View>
                    <Text style={styles.uploadArrow}>+</Text>
                </TouchableOpacity>
            )}

            <SectionLabel title="Insurance" />
            <TouchableOpacity
                style={[styles.insuranceToggle, hasInsurance && styles.insuranceToggleOn]}
                onPress={() => setHasInsurance(!hasInsurance)}
                activeOpacity={0.75}
            >
                <View style={[styles.checkbox, hasInsurance && styles.checkboxOn]}>
                    {hasInsurance && <Text style={styles.tick}>✓</Text>}
                </View>
                <View style={styles.insToggleText}>
                    <Text style={styles.insToggleTitle}>I have health insurance</Text>
                    <Text style={styles.insToggleSub}>
                        {hasInsurance
                            ? 'Enter your policy details below'
                            : 'Tap to add your policy details'}
                    </Text>
                </View>
                <Animated.View
                    style={[
                        styles.insChevron,
                        hasInsurance && styles.insChevronOpen,
                        { transform: [{ rotate: insRotate }] },
                    ]}
                >
                    <Text style={styles.insChevronText}>›</Text>
                </Animated.View>
            </TouchableOpacity>

            <Animated.View
                style={{ maxHeight: insMaxHeight, opacity: insOpacity, overflow: 'hidden' }}
            >
                <View style={styles.insBlock}>
                    <Text style={styles.fieldLabel}>Policy Number</Text>
                    <View style={[styles.policyRow, policyFocused && styles.policyRowFocused]}>
                        <TextInput
                            style={styles.policyInput}
                            placeholder="Enter your policy number"
                            placeholderTextColor="#B0C4CC"
                            value={insurancePolicyNumber}
                            onChangeText={v => {
                                setInsurancePolicyNumber(v);
                                setPolicyFetched(false);
                            }}
                            onFocus={() => setPolicyFocused(true)}
                            onBlur={() => setPolicyFocused(false)}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.fetchBtn, policyFetched && styles.fetchBtnDone]}
                        activeOpacity={0.82}
                        disabled={!insurancePolicyNumber.trim() || fetchingPolicy}
                        onPress={handleFetchPolicy}
                    >
                        <LinearGradient
                            colors={
                                policyFetched
                                    ? [Colors.accent, Colors.accentDark]
                                    : insurancePolicyNumber.trim()
                                    ? [Colors.gradientStart, Colors.gradientEnd]
                                    : ['#C8DCE4', '#B8CCCC']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.fetchBtnGrad}
                        >
                            <Text style={styles.fetchBtnText}>
                                {policyFetched
                                    ? '✓  Policy Verified'
                                    : fetchingPolicy
                                    ? 'Verifying...'
                                    : 'Fetch Policy Details'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={{ height: 16 }} />

            <UploadPickerSheet
                visible={showUploadSheet}
                onClose={() => setShowUploadSheet(false)}
                onFilePicked={file => {
                    setUploadedFile(file);
                    setShowUploadSheet(false);
                }}
            />
        </View>
    );
};

const CARD_W = (width - 48 - 30) / 4;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
        gap: 10,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: '#E8F0F4' },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    selectedCount: {
        fontSize: 12,
        color: Colors.gradientStart,
        fontWeight: '700',
        marginBottom: 8,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    cardWrap: { width: CARD_W },
    serviceCard: {
        width: '100%',
        aspectRatio: 0.85,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        position: 'relative',
    },
    selectedBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.gradientStart,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTick: { color: Colors.white, fontSize: 10, fontWeight: '900' },
    serviceIcon: { fontSize: 20, marginBottom: 4 },
    serviceName: {
        fontSize: 9,
        color: Colors.textMuted,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 13,
    },
    serviceNameSel: { color: Colors.gradientStart },
    servicePrice: { fontSize: 9, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
    servicePriceSel: { color: Colors.gradientStart, fontWeight: '700' },
    otherBox: {
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        borderRadius: 14,
        backgroundColor: '#F8FBFC',
        padding: 14,
        marginBottom: 8,
        minHeight: 90,
    },
    otherBoxFocused: { borderColor: Colors.gradientStart },
    otherInput: {
        fontSize: 14,
        color: Colors.textDark,
        fontWeight: '500',
        minHeight: 64,
        padding: 0,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FBFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 8,
        gap: 14,
    },
    uploadIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E6FAF5',
        borderWidth: 1,
        borderColor: '#B0E8D4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadIconText: { fontSize: 20 },
    uploadTextBox: { flex: 1 },
    uploadTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
    uploadSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    uploadArrow: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },
    uploadedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    fileChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6FAF5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B0E8D4',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    fileChipIcon: { fontSize: 18 },
    fileChipName: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textDark },
    fileChipRemove: { fontSize: 14, color: Colors.textMuted, fontWeight: '700' },
    replaceBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F0F5F8',
        borderWidth: 1,
        borderColor: '#D0DCE4',
    },
    replaceBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
    insuranceToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FBFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        padding: 14,
        marginBottom: 8,
        gap: 12,
    },
    insuranceToggleOn: { borderColor: Colors.accent, backgroundColor: 'rgba(126,211,33,0.04)' },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#C8DDE5',
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accentDark },
    tick: { color: Colors.white, fontSize: 13, fontWeight: '900' },
    insToggleText: { flex: 1 },
    insToggleTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
    insToggleSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    insChevron: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E8F0F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    insChevronOpen: { backgroundColor: '#E6FAF5' },
    insChevronText: { fontSize: 18, color: Colors.textMuted, lineHeight: 22 },
    insBlock: { paddingBottom: 8, paddingTop: 4 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    policyRow: {
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        borderRadius: 14,
        backgroundColor: '#F8FBFC',
        paddingHorizontal: 16,
        height: 52,
        justifyContent: 'center',
        marginBottom: 10,
    },
    policyRowFocused: { borderColor: Colors.gradientStart },
    policyInput: { fontSize: 15, color: Colors.textDark, fontWeight: '500' },
    fetchBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    fetchBtnDone: { shadowColor: Colors.accentDark },
    fetchBtnGrad: { paddingVertical: 14, alignItems: 'center' },
    fetchBtnText: { color: Colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});

export default RequirementsScreen;
