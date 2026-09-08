import React, { useEffect, useState } from 'react';
import {
      View,
      Text,
      StyleSheet,
      TouchableOpacity,
      ScrollView,
      Image,
      Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { Colors, Spacing, Fonts } from '../../../theme/colors'; // adjust path to your theme file
import { Vendor, VendorAvailability, VendorDocument, VendorDocuments, VendorSetting, VendorResponse } from '../types/vendor';
import { vendorAPI } from '@/service/apis/vendorService';
import { useAuthStore } from '@/store/useAuthStore';
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const defaultData: Vendor = {
      _id: '',
      name: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      ambassadorId: '',
      availability: { days: [], timeSlots: [], emergencyAvailable: false },
      bio: '',
      businessName: '',
      businessType: '',
      city: '',
      documents: {
            identityProof: { type: '', status: '', rejectionReason: '' },
            businessLicense: { type: '', status: '', rejectionReason: '' },
            insuranceCertificate: { type: '', status: '', rejectionReason: '' },
            policeVerification: { type: '', status: '', rejectionReason: '' },
            qualificationCertificate: { type: '', status: '', rejectionReason: '' }
      },
      experience: 0,
      gender: '',
      gstNumber: '',
      isActive: false,
      isAmbassadorCredited: false,
      isPhoneVerified: false,
      isVerified: false,
      latitude: 0,
      longitude: 0,
      pincode: '',
      profileImage: '',
      qualifications: [],
      rating: 0,
      referralCode: '',
      referredBy: '',
      referredByModel: '',
      referredByRef: '',
      registrationNumber: '',
      role: '',
      serviceAreas: [],
      services: [],
      specialization: '',
      state: '',
      totalReviews: 0,
      createdAt: '',
      updatedAt: '',
      vendorId: '',
      verificationDate: '',
      verificationStatus: '',
      __v: 0
}

const defaultsetting: VendorSetting = {
      logoUrl: '',
      signatureUrl: '',
      title: ''
}
const formatIssueDate = (dateString: string): string => {
      if (!dateString) return '—';
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
};

const getInitial = (name: string): string => {
      if (!name) return '?';
      return name.trim().charAt(0).toUpperCase();
};

type VendorIdCardScreenProps = NativeStackScreenProps<RootStackParamList, 'IdCard'>;
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const VendorIdCardScreen = ({ navigation }: VendorIdCardScreenProps) => {
      const [vendor, setVendor] = useState<Vendor>(defaultData);
      const [setting, setSetting] = useState<VendorSetting>(defaultsetting);
      const { user } = useAuthStore();

      useEffect(() => {
            getVendorId();
      }, []);

      const getVendorId = async () => {
            const response = await vendorAPI.vendorIdCard(user?._id || '');
            console.log('vendor id card:', response.data);
            const data: VendorResponse = response.data;
            setVendor(data?.data?.vendor);
            setSetting(data?.data?.setting);
      }

      const onDownload = () => { }

      return (
            <ScrollView
                  style={styles.screen}
                  contentContainerStyle={styles.screenContent}
                  showsVerticalScrollIndicator={false}
            >
                  {/* Header */}
                  <View style={styles.headerWrap}>
                        <Ionicons
                              name="ribbon-outline"
                              size={26}
                              color={Colors.accentDark}
                              style={styles.headerIcon}
                        />
                        <Text style={styles.headerTitle}>My Digital ID Card</Text>
                  </View>
                  <Text style={styles.headerSubtitle}>
                        View, print, and download your digital identity card badge.
                  </Text>

                  {/* Download button */}
                  <TouchableOpacity
                        style={styles.downloadButton}
                        activeOpacity={0.85}
                        onPress={onDownload}
                  >
                        <LinearGradient
                              colors={[Colors.accent, Colors.accentDark]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.downloadButtonGradient}
                        >
                              <Ionicons name="download-outline" size={18} color={Colors.white} />
                              <Text style={styles.downloadButtonText}>Download / Print ID Card</Text>
                        </LinearGradient>
                  </TouchableOpacity>

                  {/* ID Card */}
                  <View style={styles.card}>
                        <LinearGradient
                              colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.cardHeader}
                        >
                              {setting.logoUrl ? (
                                    <Image source={{ uri: setting.logoUrl }} style={styles.logo} />
                              ) : (
                                    <View style={styles.logoPlaceholder}>
                                          <Ionicons name="add" size={22} color={Colors.white} />
                                    </View>
                              )}
                              <Text style={styles.cardHeaderTitle}>{setting.title || 'Service Partner'}</Text>
                              <Text style={styles.cardHeaderSubtitle}>REGISTERED MEDICAL PARTNER</Text>
                        </LinearGradient>

                        <View style={styles.cardBody}>
                              {/* Avatar */}
                              <View style={styles.avatarWrap}>
                                    {vendor.profileImage ? (
                                          <Image source={{ uri: vendor.profileImage }} style={styles.avatarImage} />
                                    ) : (
                                          <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarInitial}>{getInitial(vendor.name)}</Text>
                                          </View>
                                    )}
                                    {vendor.isVerified && (
                                          <View style={styles.verifiedBadge}>
                                                <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
                                          </View>
                                    )}
                              </View>

                              <Text style={styles.vendorName}>{vendor.name}</Text>
                              <Text style={styles.vendorRole}>
                                    {(vendor.role || 'GENERAL PARTNER').toUpperCase()}
                              </Text>
                              {!!vendor.businessName && (
                                    <Text style={styles.vendorBusiness}>{vendor.businessName}</Text>
                              )}

                              {/* Details table */}
                              <View style={styles.detailsTable}>
                                    <DetailRow label="PARTNER ID" value={vendor.vendorId} bold />
                                    <DetailRow label="EMAIL" value={vendor.email} />
                                    <DetailRow label="MOBILE" value={vendor.phone} bold />
                                    <DetailRow
                                          label="ISSUE DATE"
                                          value={formatIssueDate(vendor.verificationDate || vendor.createdAt)}
                                          bold
                                          last
                                    />
                              </View>

                              {/* Signature */}
                              <View style={styles.signatureWrap}>
                                    {setting.signatureUrl ? (
                                          <Image source={{ uri: setting.signatureUrl }} style={styles.signatureImage} />
                                    ) : (
                                          <Text style={styles.signatureScript}>Auth Signatory</Text>
                                    )}
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureLabel}>AUTHORIZED SIGN</Text>
                              </View>
                        </View>

                        {/* Bottom gradient accent */}
                        <LinearGradient
                              colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.cardFooterAccent}
                        />
                  </View>
            </ScrollView>
      );
};

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------
interface DetailRowProps {
      label: string;
      value: string;
      bold?: boolean;
      last?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, bold, last }) => (
      <View style={[styles.detailRow, last && styles.detailRowLast]}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, bold && styles.detailValueBold]}>
                  {value || '—'}
            </Text>
      </View>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
      screen: {
            flex: 1,
            backgroundColor: Colors.background,
      },
      screenContent: {
            alignItems: 'center',
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.section,
            paddingHorizontal: Spacing.lg,
      },
      headerWrap: {
            flexDirection: 'row',
            alignItems: 'center',
      },
      headerIcon: {
            marginRight: Spacing.xs,
      },
      headerTitle: {
            fontSize: Fonts.sizes.xxl,
            fontWeight: '800',
            color: Colors.textDark,
      },
      headerSubtitle: {
            fontSize: Fonts.sizes.sm,
            color: Colors.textMuted,
            textAlign: 'center',
            marginTop: Spacing.xs,
            marginBottom: Spacing.xl,
            paddingHorizontal: Spacing.lg,
      },
      downloadButton: {
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: Spacing.xxl,
            shadowColor: Colors.shadowColor,
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
      },
      downloadButtonGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xxl,
      },
      downloadButtonText: {
            color: Colors.textLight,
            fontWeight: '700',
            fontSize: Fonts.sizes.md,
            marginLeft: Spacing.sm,
      },
      card: {
            width: '100%',
            maxWidth: 420,
            borderRadius: CARD_RADIUS,
            backgroundColor: Colors.white,
            overflow: 'hidden',
            shadowColor: Colors.shadowColor,
            shadowOpacity: 0.15,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
      },
      cardHeader: {
            alignItems: 'center',
            paddingVertical: Spacing.xxl,
            paddingHorizontal: Spacing.lg,
      },
      logo: {
            width: 44,
            height: 44,
            borderRadius: 12,
            marginBottom: Spacing.sm,
      },
      logoPlaceholder: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.sm,
      },
      cardHeaderTitle: {
            color: Colors.textLight,
            fontWeight: '800',
            fontSize: Fonts.sizes.lg,
            textAlign: 'center',
      },
      cardHeaderSubtitle: {
            color: Colors.textLight,
            fontSize: Fonts.sizes.xs,
            fontWeight: '600',
            letterSpacing: 0.5,
            marginTop: Spacing.xs,
            textAlign: 'center',
      },
      cardBody: {
            alignItems: 'center',
            paddingHorizontal: Spacing.xl,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.xl,
      },
      avatarWrap: {
            width: 96,
            height: 96,
            marginBottom: Spacing.lg,
      },
      avatarImage: {
            width: 96,
            height: 96,
            borderRadius: 48,
      },
      avatarPlaceholder: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: Colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E4ECEF',
      },
      avatarInitial: {
            fontSize: Fonts.sizes.hero,
            fontWeight: '700',
            color: Colors.textMuted,
      },
      verifiedBadge: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.gradientStart,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: Colors.white,
      },
      vendorName: {
            fontSize: Fonts.sizes.xxl,
            fontWeight: '800',
            color: Colors.textDark,
      },
      vendorRole: {
            fontSize: Fonts.sizes.sm,
            fontWeight: '700',
            color: Colors.gradientEnd,
            letterSpacing: 0.5,
            marginTop: Spacing.xs,
      },
      vendorBusiness: {
            fontSize: Fonts.sizes.sm,
            color: Colors.textMuted,
            marginTop: Spacing.xs / 2,
      },
      detailsTable: {
            width: '100%',
            backgroundColor: Colors.background,
            borderRadius: 14,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            marginTop: Spacing.xl,
      },
      detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: '#E4ECEF',
      },
      detailRowLast: {
            borderBottomWidth: 0,
      },
      detailLabel: {
            fontSize: Fonts.sizes.xs,
            color: Colors.textMuted,
            fontWeight: '600',
            letterSpacing: 0.5,
      },
      detailValue: {
            fontSize: Fonts.sizes.md,
            color: Colors.textMedium,
      },
      detailValueBold: {
            fontWeight: '700',
            color: Colors.textDark,
      },
      signatureWrap: {
            alignItems: 'center',
            marginTop: Spacing.xxl,
      },
      signatureImage: {
            width: 120,
            height: 40,
            resizeMode: 'contain',
      },
      signatureScript: {
            fontSize: Fonts.sizes.md,
            fontStyle: 'italic',
            color: Colors.textMedium,
            fontFamily: Platform.select({ ios: 'Snell Roundhand', android: 'casual', default: undefined }),
      },
      signatureLine: {
            width: 160,
            height: 1,
            backgroundColor: '#C7D6DC',
            marginTop: Spacing.sm,
      },
      signatureLabel: {
            fontSize: Fonts.sizes.xs,
            color: Colors.textMuted,
            fontWeight: '600',
            letterSpacing: 1,
            marginTop: Spacing.xs,
      },
      cardFooterAccent: {
            height: 6,
            width: '100%',
      },
});

export default VendorIdCardScreen;