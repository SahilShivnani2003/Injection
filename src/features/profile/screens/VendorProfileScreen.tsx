import React, { useEffect, useState } from 'react';
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

const VendorProfileScreen = ({ navigation }: VendorProfileProps) => {
    const alert = useAlert();
    const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    const vendorData = useAuthStore().user;
    const { removeAuth } = useAuthStore();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    useEffect(() => {
        if (vendorData?._id) {
            fetchVendorProfile();
        }
    }, [vendorData?._id]);

    const fetchVendorProfile = async () => {
        if (!vendorData?._id) {
            console.log('Vendor id not found');
            return;
        }
        setLoading(true);
        try {
            const response = await vendorAPI.fetchProfile(vendorData._id);
            console.log('Vendor profile response ', response.data);
            setVendor(response.data?.data);
        } catch (error) {
            console.warn('Unable to load vendor profile', error);
        } finally {
            setLoading(false);
        }
    };

    const renderRow = (label: string, value?: string | number | string[]) => {
        if (!value && value !== 0) return null;
        const display = Array.isArray(value) ? value.join(', ') : String(value);
        return (
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{display}</Text>
            </View>
        );
    };

    const handleRefresh = () => {
        fetchVendorProfile();
    };

    const handleLogOut = () => {
        alert.show({
            title: 'Log Out',
            message: 'Are you sure, you want to log out ?',
            buttons: [
                { label: 'No', onPress: alert.dismiss, style: 'ghost' },
                {
                    label: 'Log Out',
                    onPress: async () => {
                        await removeAuth();
                        rootNav.navigate('Login');
                    },
                    style: 'danger',
                },
            ],
        });
    };
    const renderDocument = (label: string, doc?: { url?: string }) => {
        if (!doc?.url) return null;
        return (
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{doc.url.replace(/^https?:\/\//, '')}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.root, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gradientStart} />
            </View>
        );
    }
    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vendor Profile</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.profileCard}>
                    {vendor?.profileImage ? (
                        <Image source={{ uri: vendor.profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>
                                {vendor?.name?.charAt(0)?.toUpperCase() ?? 'V'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.vendorName}>{vendor?.businessName || vendor?.name}</Text>
                    <Text style={styles.vendorSubtitle}>{vendor?.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{vendor?.businessType}</Text>
                        </View>
                        {vendor?.isVerified && (
                            <View style={[styles.badge, styles.verifiedBadge]}>
                                <Text style={[styles.badgeText, styles.verifiedText]}>
                                    Verified
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Contact</Text>
                    {renderRow('Email', vendor?.email)}
                    {renderRow('Phone', vendor?.phone)}
                    {renderRow('Alternate', vendor?.alternatePhone)}
                    {renderRow('Address', vendor?.address)}
                    {renderRow('City', vendor?.city)}
                    {renderRow('State', vendor?.state)}
                    {renderRow('Pincode', vendor?.pincode)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Business</Text>
                    {renderRow('Business Type', vendor?.businessType)}
                    {renderRow('Registration #', vendor?.registrationNumber)}
                    {renderRow('GST Number', vendor?.gstNumber)}
                    {renderRow('Services Offered', vendor?.servicesOffered)}
                    {renderRow('Specialization', vendor?.specialization)}
                    {renderRow('Experience', vendor?.experience)}
                    {renderRow('Service Areas', vendor?.serviceAreas)}
                </View>

                {vendor?.bio ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>About</Text>
                        <Text style={styles.bioText}>{vendor.bio}</Text>
                    </View>
                ) : null}

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Bank Details</Text>
                    {renderRow('Bank', vendor?.bankDetails?.bankName)}
                    {renderRow('Account', vendor?.bankDetails?.accountNumber)}
                    {renderRow('IFSC', vendor?.bankDetails?.ifscCode)}
                    {renderRow('Branch', vendor?.bankDetails?.branch)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Documents</Text>
                    {renderDocument('Identity Proof', vendor?.documents?.identityProof)}
                    {renderDocument('Qualification', vendor?.documents?.qualificationCertificate)}
                    {renderDocument('License', vendor?.documents?.businessLicense)}
                    {renderDocument('Insurance', vendor?.documents?.insuranceCertificate)}
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => rootNav.navigate('VendorRegister')}
                >
                    <Text style={styles.actionText}>Edit Registration</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logOutButton}
                    onPress={handleLogOut}
                >
                    <Text style={styles.actionText}>Log Out</Text>
                </TouchableOpacity>
                <View style={{ height: 40, marginBottom: 28 }}></View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 56,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    backText: {
        color: Colors.textLight,
        fontSize: 20,
        fontWeight: '700',
    },
    headerTitle: {
        color: Colors.textLight,
        fontSize: 21,
        fontWeight: '800',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
        marginBottom: 18,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#EAF6F9',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D0E9EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarInitial: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.gradientMid,
    },
    vendorName: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textDark,
        marginBottom: 6,
    },
    vendorSubtitle: {
        fontSize: 14,
        color: Colors.textMedium,
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    badge: {
        backgroundColor: '#EDF7F8',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    verifiedBadge: {
        backgroundColor: Colors.gradientStart,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textDark,
    },
    verifiedText: {
        color: Colors.white,
    },
    section: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    sectionHeading: {
        color: Colors.textDark,
        fontWeight: '800',
        fontSize: 14,
        marginBottom: 14,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        marginBottom: 4,
    },
    infoValue: {
        color: Colors.textDark,
        fontSize: 14,
        fontWeight: '600',
    },
    bioText: {
        color: Colors.textMedium,
        fontSize: 14,
        lineHeight: 22,
    },
    actionButton: {
        backgroundColor: Colors.gradientStart,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 6,
    },
    logOutButton: {
        backgroundColor: '#ed3755',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    actionText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },
    emptyText: {
        color: Colors.textMedium,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 18,
    },
});

export default VendorProfileScreen;
