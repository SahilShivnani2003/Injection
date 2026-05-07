import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Image,
    RefreshControl,
    Animated,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { Colors } from '../../../theme/colors';
import { vendorAPI } from '../../../service/apis/vendorService';
import { Vendor } from '../types/Vendor';
import { VendorTabParamList } from '@/types/VendorTabParamList';
import { useAuthStore } from '@/store/useAuthStore';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useAlert } from '@/context/AlertContext';

type VendorProfileProps = NativeBottomTabScreenProps<VendorTabParamList, 'Profile'>;

const { width } = Dimensions.get('window');

// ── Verification badge config ──────────────────────────────────────────────────

const VERIFICATION_CONFIG = {
    pending: { label: 'Pending Review', bg: '#FFF8E6', text: '#C07800', icon: '⏳' },
    verified: { label: 'Verified', bg: '#E6FFF5', text: '#00A07A', icon: '✅' },
    rejected: { label: 'Rejected', bg: '#FFF0F0', text: '#CC2200', icon: '❌' },
} as const;

// ── Section Header ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <View style={sh.row}>
        <View style={sh.iconBox}>
            <Text style={sh.icon}>{icon}</Text>
        </View>
        <Text style={sh.title}>{title}</Text>
        <View style={sh.line} />
    </View>
);

const sh = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    iconBox: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: '#EAF5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: { fontSize: 15 },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
    },
    line: { flex: 1, height: 1, backgroundColor: '#E8EFF4' },
});

// ── Info Row ──────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={ir.row}>
        <View style={ir.iconBox}>
            <Text style={ir.icon}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={ir.label}>{label}</Text>
            <Text style={ir.value}>{value}</Text>
        </View>
    </View>
);

const ir = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F8',
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#F4F8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    icon: { fontSize: 15 },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    value: { fontSize: 13, fontWeight: '600', color: Colors.textDark, lineHeight: 19 },
});

// ── Services Chip List ────────────────────────────────────────────────────────

const ServicesChips = ({ services }: { services: string[] }) => (
    <View style={sc.wrap}>
        {services.map(s => (
            <View key={s} style={sc.chip}>
                <Text style={sc.text}>{s}</Text>
            </View>
        ))}
    </View>
);

const sc = StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    chip: {
        backgroundColor: Colors.gradientStart + '18',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: Colors.gradientStart + '30',
    },
    text: { fontSize: 12, fontWeight: '600', color: Colors.gradientStart },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

const VendorProfileScreen = ({ navigation }: VendorProfileProps) => {
    const alert = useAlert();
    const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    const vendorData = useAuthStore().user;
    const { removeAuth } = useAuthStore();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchVendorProfile = async (isRefresh = false) => {
        if (!vendorData?._id) return;
        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const response = await vendorAPI.fetchProfile(vendorData._id);
            setVendor(response.data?.data ?? null);
        } catch (error) {
            console.warn('Unable to load vendor profile', error);
        } finally {
            isRefresh ? setRefreshing(false) : setLoading(false);
        }
    };

    useEffect(() => {
        if (vendorData?._id) fetchVendorProfile();
    }, [vendorData?._id]);

    // ── Animate on data load ──────────────────────────────────────────────────

    useEffect(() => {
        if (!vendor) return;
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, [vendor]);

    // ── Logout ────────────────────────────────────────────────────────────────

    const handleLogOut = () => {
        alert.show({
            title: 'Log Out',
            message: 'Are you sure you want to log out?',
            buttons: [
                { label: 'Cancel', onPress: alert.dismiss, style: 'ghost' },
                {
                    label: 'Log Out',
                    style: 'danger',
                    onPress: async () => {
                        await removeAuth();
                        alert.dismiss();
                        rootNav.navigate('Login');
                    },
                },
            ],
        });
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    const getInitials = (name?: string) =>
        (name ?? 'V')
            .trim()
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    const verif = VERIFICATION_CONFIG[vendor?.verificationStatus ?? 'pending'];

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchVendorProfile(true)}
                        colors={[Colors.gradientStart]}
                        tintColor={Colors.gradientStart}
                    />
                }
            >
                {/* ── Hero Header ── */}
                <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    {/* Decorative blobs */}
                    <View style={styles.blobTR} />
                    <View style={styles.blobBL} />

                    {/* Avatar — overlaps gradient bottom via negative marginBottom */}
                    <View style={styles.avatarWrap}>
                        {vendor?.profileImage ? (
                            <Image source={{ uri: vendor.profileImage }} style={styles.avatar} />
                        ) : (
                            <LinearGradient
                                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']}
                                style={styles.avatarFallback}
                            >
                                <Text style={styles.avatarInitials}>
                                    {getInitials(vendor?.name)}
                                </Text>
                            </LinearGradient>
                        )}
                        {/* Online dot */}
                        {vendor?.isActive && <View style={styles.activeDot} />}
                    </View>

                    {/* Name & type */}
                    <Text style={styles.heroName}>
                        {vendor?.businessName || vendor?.name || 'Vendor'}
                    </Text>
                    {vendor?.businessName && vendor?.name !== vendor?.businessName && (
                        <Text style={styles.heroSub}>{vendor.name}</Text>
                    )}

                    {/* Badges row */}
                    <View style={styles.heroBadges}>
                        {vendor?.businessType && (
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeBadgeText}>{vendor.businessType}</Text>
                            </View>
                        )}
                        <View style={[styles.verifBadge, { backgroundColor: verif.bg }]}>
                            <Text style={styles.verifIcon}>{verif.icon}</Text>
                            <Text style={[styles.verifText, { color: verif.text }]}>
                                {verif.label}
                            </Text>
                        </View>
                    </View>

                    {/* Stats strip */}
                    <View style={styles.statsStrip}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {vendor?.rating != null ? vendor.rating.toFixed(1) : '—'}
                            </Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {vendor?.experience != null ? `${vendor.experience}` : '—'}
                            </Text>
                            <Text style={styles.statLabel}>Yrs Exp.</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {vendor?.totalReviews != null ? vendor.totalReviews : '—'}
                            </Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* ── Content ── */}
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* ── Contact ── */}
                    <View style={styles.card}>
                        <SectionHeader icon="📞" title="Contact" />
                        {vendor?.email && <InfoRow icon="✉️" label="Email" value={vendor.email} />}
                        {vendor?.phone && <InfoRow icon="📱" label="Phone" value={vendor.phone} />}
                        {vendor?.alternatePhone && (
                            <InfoRow icon="📟" label="Alternate" value={vendor.alternatePhone} />
                        )}
                        {vendor?.address && (
                            <InfoRow icon="🏠" label="Address" value={vendor.address} />
                        )}
                        {(vendor?.city || vendor?.state) && (
                            <InfoRow
                                icon="📍"
                                label="City / State"
                                value={[vendor?.city, vendor?.state].filter(Boolean).join(', ')}
                            />
                        )}
                        {vendor?.pincode && (
                            <InfoRow icon="🔢" label="Pincode" value={vendor.pincode} />
                        )}
                    </View>

                    {/* ── Business ── */}
                    <View style={styles.card}>
                        <SectionHeader icon="🏢" title="Business" />
                        {vendor?.registrationNumber && (
                            <InfoRow
                                icon="📋"
                                label="Registration #"
                                value={vendor.registrationNumber}
                            />
                        )}
                        {vendor?.gstNumber && (
                            <InfoRow icon="🧾" label="GST Number" value={vendor.gstNumber} />
                        )}
                        {vendor?.specialization && (
                            <InfoRow
                                icon="🎯"
                                label="Specialization"
                                value={vendor.specialization}
                            />
                        )}
                        {vendor?.serviceAreas && (
                            <InfoRow
                                icon="🗺️"
                                label="Service Areas"
                                value={
                                    Array.isArray(vendor.serviceAreas)
                                        ? vendor.serviceAreas.join(', ')
                                        : vendor.serviceAreas
                                }
                            />
                        )}

                        {/* Services as chips */}
                        {(vendor?.servicesOffered?.length ?? 0) > 0 && (
                            <View style={{ marginTop: 8 }}>
                                <Text style={styles.chipSectionLabel}>Services Offered</Text>
                                <ServicesChips services={vendor!.servicesOffered as string[]} />
                            </View>
                        )}
                    </View>

                    {/* ── About ── */}
                    {!!vendor?.bio && (
                        <View style={styles.card}>
                            <SectionHeader icon="💬" title="About" />
                            <Text style={styles.bioText}>{vendor.bio}</Text>
                        </View>
                    )}

                    {/* ── Bank Details ── */}
                    {(vendor?.bankDetails?.bankName ||
                        vendor?.bankDetails?.accountNumber ||
                        vendor?.bankDetails?.ifscCode) && (
                        <View style={styles.card}>
                            <SectionHeader icon="🏦" title="Bank Details" />
                            {vendor?.bankDetails?.bankName && (
                                <InfoRow
                                    icon="🏛️"
                                    label="Bank"
                                    value={vendor.bankDetails.bankName}
                                />
                            )}
                            {vendor?.bankDetails?.accountNumber && (
                                <InfoRow
                                    icon="💳"
                                    label="Account Number"
                                    value={vendor.bankDetails.accountNumber}
                                />
                            )}
                            {vendor?.bankDetails?.ifscCode && (
                                <InfoRow
                                    icon="🔑"
                                    label="IFSC Code"
                                    value={vendor.bankDetails.ifscCode}
                                />
                            )}
                            {vendor?.bankDetails?.branch && (
                                <InfoRow
                                    icon="📌"
                                    label="Branch"
                                    value={vendor.bankDetails.branch}
                                />
                            )}
                        </View>
                    )}

                    {/* ── Documents ── */}
                    {(vendor?.documents?.identityProof?.url ||
                        vendor?.documents?.qualificationCertificate?.url ||
                        vendor?.documents?.businessLicense?.url ||
                        vendor?.documents?.insuranceCertificate?.url) && (
                        <View style={styles.card}>
                            <SectionHeader icon="📂" title="Documents" />
                            {vendor?.documents?.identityProof?.url && (
                                <InfoRow
                                    icon="🪪"
                                    label="Identity Proof"
                                    value={vendor.documents.identityProof.url.replace(
                                        /^https?:\/\//,
                                        '',
                                    )}
                                />
                            )}
                            {vendor?.documents?.qualificationCertificate?.url && (
                                <InfoRow
                                    icon="🎓"
                                    label="Qualification"
                                    value={vendor.documents.qualificationCertificate.url.replace(
                                        /^https?:\/\//,
                                        '',
                                    )}
                                />
                            )}
                            {vendor?.documents?.businessLicense?.url && (
                                <InfoRow
                                    icon="📜"
                                    label="Business License"
                                    value={vendor.documents.businessLicense.url.replace(
                                        /^https?:\/\//,
                                        '',
                                    )}
                                />
                            )}
                            {vendor?.documents?.insuranceCertificate?.url && (
                                <InfoRow
                                    icon="🛡️"
                                    label="Insurance Cert"
                                    value={vendor.documents.insuranceCertificate.url.replace(
                                        /^https?:\/\//,
                                        '',
                                    )}
                                />
                            )}
                        </View>
                    )}

                    {/* ── Actions ── */}
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => rootNav.navigate('VendorRegister')}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.editBtnGradient}
                        >
                            <Text style={styles.editBtnIcon}>✏️</Text>
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogOut}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                    <View style={{ height: 48 , marginBottom: 28}} />
                </Animated.View>
            </ScrollView>
        </View>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F7FA' },
    centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: Colors.textMuted },

    // ── Hero ──────────────────────────────────────────────────────────────────
    hero: {
        paddingTop: 56,
        paddingBottom: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
        overflow: 'hidden',
        // No borderRadius — bleeds full-width; content card overlaps below
    },
    blobTR: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.09)',
    },
    blobBL: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },

    avatarWrap: {
        width: AVATAR_SIZE + 6,
        height: AVATAR_SIZE + 6,
        borderRadius: (AVATAR_SIZE + 6) / 2,
        backgroundColor: 'rgba(255,255,255,0.22)',
        padding: 3,
        marginBottom: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: '#EAF6F9',
    },
    avatarFallback: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    activeDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#00E88F',
        borderWidth: 2.5,
        borderColor: '#fff',
    },

    heroName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.4,
        textAlign: 'center',
    },
    heroSub: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 3, textAlign: 'center' },

    heroBadges: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    typeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    verifBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    verifIcon: { fontSize: 12 },
    verifText: { fontSize: 12, fontWeight: '700' },

    statsStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginTop: 20,
        width: width - 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    statLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '600', marginTop: 3 },
    statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

    // ── Content ───────────────────────────────────────────────────────────────
    content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#004466',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },

    chipSectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 10,
    },

    bioText: { fontSize: 14, color: Colors.textMedium, lineHeight: 22 },

    // ── Buttons ───────────────────────────────────────────────────────────────
    editBtn: { borderRadius: 18, overflow: 'hidden', marginBottom: 12 },
    editBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    editBtnIcon: { fontSize: 18 },
    editBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFF0F2',
        borderRadius: 18,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: '#FF3B5530',
    },
    logoutIcon: { fontSize: 18 },
    logoutText: { color: '#CC1133', fontSize: 15, fontWeight: '800' },
});

export default VendorProfileScreen;
