import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Switch,
    Modal,
    StatusBar,
    RefreshControl,
    Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { useAuthStore } from '@/store/useAuthStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/theme/colors';
import { RootStackParamList } from '@/types/RootStackParamList';
import { UserTabParamList } from '@/types/UserTabParamList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '../types/User';
import { userApi } from '@/service/apis/userService';
import { useAlert } from '@/context/AlertContext';
import { LogoutModal } from '../model/LogoutModal';

type ProfileProps = NativeBottomTabScreenProps<UserTabParamList, 'Profile'>;

interface MenuRowProps {
    icon: string;
    label: string;
    sublabel?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
}

const MenuRow = ({ icon, label, sublabel, onPress, rightElement, danger }: MenuRowProps) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.menuIconWrap, danger && styles.menuIconWrapDanger]}>
            {/* Fixed: use `name` prop (not `glyph`) for MaterialIcons */}
            <Icon name={icon} size={18} color={danger ? '#E53935' : Colors.gradientStart} />
        </View>
        <View style={styles.menuText}>
            <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
            {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
        </View>
        {rightElement ?? <Icon name="chevron-right" size={20} color="#BCCDD6" />}
    </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const ProfileScreen = ({ navigation }: ProfileProps) => {
    const { removeAuth } = useAuthStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [user, setUser] = useState<User | null>();
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const alert = useAlert();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            console.log('Fetching user profile...');

            const response = await userApi.getProfile();

            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.log('Error while fetching user profile', error);
            setUser(null);
        }
    };

    const handleRefresh = () => {
        fetchProfile();
    };
    const handleLogout = async () => {
        setLogoutModalVisible(false);
        await removeAuth();
        navigation.getParent<NativeStackNavigationProp<RootStackParamList>>().reset({
            index: 0,
            routes: [{ name: 'EmailLogin' }],
        });
    };

    // Returns a MaterialIcons icon name and label for the user's role
    const getRoleDisplay = (): { icon: string; label: string } => {
        if (!user) return { icon: 'person', label: 'User' };
        if (user.role === 'admin') return { icon: 'admin-panel-settings', label: 'Admin' };
        if (user.isStaff) return { icon: 'badge', label: 'Staff' };
        return { icon: 'person', label: 'Patient' };
    };

    const getDateOfBirth = () => {
        if (!user?.age) return 'Not provided';
        return `${user.age} years old`;
    };

    const getLocation = () => {
        if (user?.currentLocation) return user.currentLocation;
        if (user?.address) return user.address;
        return 'Not provided';
    };

    const stats = {
        visits: 0,
        reports: 0,
        upcoming: 0,
    };

    if (loading) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.menuLabel}>Loading profile...</Text>
            </View>
        );
    }

    const role = getRoleDisplay();
    const handelEdit = () => {
        navigation
            .getParent<NativeStackNavigationProp<RootStackParamList>>()
            ?.navigate('EditProfile', { userData: user });
    };

    const openWebsite = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
            } else {
                alert.error('Error', 'Unable to open the link.');
            }
        } catch (error) {
            alert.error('Error', 'Something went wrong while opening the link.');
        }
    };

    return (
        <View style={styles.root}>
            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                {/* Left — back button */}
                <TouchableOpacity
                    style={styles.headerIconBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={22} color={Colors.textLight} />
                </TouchableOpacity>

                {/* Center — title */}
                <Text style={styles.headerTitle}>My Profile</Text>

                {/* Right — spacer keeps title perfectly centered */}
                <View style={styles.headerIconBtn} />
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                {/* ── Avatar Card ── */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarRing}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>
                                    {user?.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{user?.name}</Text>

                    {/* Role pill with vector icon */}
                    <View style={styles.rolePill}>
                        <Icon
                            name={role.icon}
                            size={13}
                            color={Colors.gradientStart}
                            style={{ marginRight: 5 }}
                        />
                        <Text style={styles.roleText}>{role.label}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.visits}</Text>
                            <Text style={styles.statLabel}>Visits</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.reports}</Text>
                            <Text style={styles.statLabel}>Reports</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.upcoming}</Text>
                            <Text style={styles.statLabel}>Upcoming</Text>
                        </View>
                    </View>
                </View>

                {/* ── Personal Information ── */}
                <SectionHeader title="PERSONAL INFORMATION" />
                <View style={styles.menuCard}>
                    <MenuRow icon="email" label="Email" sublabel={user?.email} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="phone" label="Phone" sublabel={user?.phone} />
                    {user?.alternateMobile && (
                        <>
                            <View style={styles.rowDivider} />
                            <MenuRow
                                icon="phone-android"
                                label="Alternate Phone"
                                sublabel={user.alternateMobile}
                            />
                        </>
                    )}
                    <View style={styles.rowDivider} />
                    <MenuRow icon="location-on" label="Location" sublabel={getLocation()} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="cake" label="Age" sublabel={getDateOfBirth()} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="wc" label="Gender" sublabel={user?.gender} />
                    {user?.bloodGroup && user?.bloodGroup !== 'Unknown' && (
                        <>
                            <View style={styles.rowDivider} />
                            <MenuRow
                                icon="water-drop"
                                label="Blood Group"
                                sublabel={user.bloodGroup}
                            />
                        </>
                    )}
                </View>

                {/* ── Medical Information ── */}
                {user?.allergies?.length ||
                user?.chronicDiseases?.length ||
                user?.currentMedications?.length ? (
                    <>
                        <SectionHeader title="MEDICAL INFORMATION" />
                        <View style={styles.menuCard}>
                            {user.allergies && user.allergies.length > 0 && (
                                <>
                                    <MenuRow
                                        icon="warning"
                                        label="Allergies"
                                        sublabel={user.allergies.join(', ')}
                                    />
                                    <View style={styles.rowDivider} />
                                </>
                            )}
                            {user.chronicDiseases && user.chronicDiseases.length > 0 && (
                                <>
                                    <MenuRow
                                        icon="local-hospital"
                                        label="Chronic Diseases"
                                        sublabel={user.chronicDiseases.join(', ')}
                                    />
                                    <View style={styles.rowDivider} />
                                </>
                            )}
                            {user.currentMedications && user.currentMedications.length > 0 && (
                                <MenuRow
                                    icon="medication"
                                    label="Current Medications"
                                    sublabel={user.currentMedications.join(', ')}
                                />
                            )}
                        </View>
                    </>
                ) : null}

                {/* ── Insurance Information ── */}
                {user?.hasInsurance && (
                    <>
                        <SectionHeader title="INSURANCE" />
                        <View style={styles.menuCard}>
                            <MenuRow
                                icon="verified-user"
                                label="Insurance Type"
                                sublabel={user.insuranceType}
                            />
                            {user.insuranceProvider && (
                                <>
                                    <View style={styles.rowDivider} />
                                    <MenuRow
                                        icon="business"
                                        label="Provider"
                                        sublabel={user.insuranceProvider}
                                    />
                                </>
                            )}
                            {user.insurancePolicyNumber && (
                                <>
                                    <View style={styles.rowDivider} />
                                    <MenuRow
                                        icon="confirmation-number"
                                        label="Policy Number"
                                        sublabel={user.insurancePolicyNumber}
                                    />
                                </>
                            )}
                            {user.insuranceExpiryDate && (
                                <>
                                    <View style={styles.rowDivider} />
                                    <MenuRow
                                        icon="event"
                                        label="Expiry Date"
                                        sublabel={
                                            user.insuranceExpiryDate instanceof Date
                                                ? user.insuranceExpiryDate.toLocaleDateString(
                                                      'en-IN',
                                                  )
                                                : String(user.insuranceExpiryDate)
                                        }
                                    />
                                </>
                            )}
                        </View>
                    </>
                )}

                {/* ── Emergency Contact ── */}
                {user?.emergencyContactName && (
                    <>
                        <SectionHeader title="EMERGENCY CONTACT" />
                        <View style={styles.menuCard}>
                            <MenuRow
                                icon="person"
                                label="Contact Name"
                                sublabel={user.emergencyContactName}
                            />
                            {user.emergencyContactPhone && (
                                <>
                                    <View style={styles.rowDivider} />
                                    <MenuRow
                                        icon="phone"
                                        label="Contact Phone"
                                        sublabel={user.emergencyContactPhone}
                                    />
                                </>
                            )}
                            {user.emergencyContactRelation && (
                                <>
                                    <View style={styles.rowDivider} />
                                    <MenuRow
                                        icon="favorite"
                                        label="Relationship"
                                        sublabel={user.emergencyContactRelation}
                                    />
                                </>
                            )}
                        </View>
                    </>
                )}

                {/* ── Account ── */}
                <SectionHeader title="ACCOUNT" />
                <View style={styles.menuCard}>
                    <MenuRow icon="edit" label="Edit Profile" onPress={handelEdit} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="lock" label="Change Password" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                </View>

                {/* ── Support ── */}
                <SectionHeader title="SUPPORT" />
                <View style={styles.menuCard}>
                    <MenuRow
                        icon="help-outline"
                        label="Help & FAQ"
                        onPress={() => openWebsite('https://www.prlthealthcare.com/')}
                    />
                    <View style={styles.rowDivider} />
                    <MenuRow
                        icon="feedback"
                        label="Send Feedback"
                        onPress={() => openWebsite('https://www.prlthealthcare.com/')}
                    />
                    <View style={styles.rowDivider} />
                    <MenuRow
                        icon="privacy-tip"
                        label="Privacy Policy"
                        onPress={() => openWebsite('https://www.prlthealthcare.com/privacy')}
                    />
                    <View style={styles.rowDivider} />
                    <MenuRow
                        icon="description"
                        label="Terms of Service"
                        onPress={() => openWebsite('https://www.prlthealthcare.com/terms')}
                    />
                    <MenuRow
                        icon="info"
                        label="About"
                        onPress={() => openWebsite('https://www.prlthealthcare.com/about')}
                    />
                </View>

                {/* ── Danger Zone ── */}
                <SectionHeader title="ACCOUNT ACTIONS" />
                <View style={styles.menuCard}>
                    <MenuRow
                        icon="logout"
                        label="Log Out"
                        danger
                        onPress={() => setLogoutModalVisible(true)}
                    />
                </View>
                <View style={{ height: 40, marginBottom: 28 }}></View>
            </ScrollView>

            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                logout={handleLogout}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#EFF6FA' },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 32,
        paddingHorizontal: 16,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        flex: 1,
    },

    // ── Scroll ──
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40, marginBottom: 40 },

    // ── Avatar Card ──
    avatarCard: {
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingTop: 28,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarRing: {
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 3,
        borderColor: Colors.gradientStart,
        padding: 3,
        marginBottom: 14,
    },
    avatar: { width: '100%', height: '100%', borderRadius: 50 },
    avatarPlaceholder: {
        backgroundColor: Colors.gradientStart,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: Colors.white,
    },
    name: { fontSize: 22, fontWeight: '800', color: Colors.textDark, letterSpacing: 0.3 },
    rolePill: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: '#E6FBF5',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#B2EFE0',
    },
    roleText: { fontSize: 13, color: Colors.gradientStart, fontWeight: '600' },

    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F4',
        width: '100%',
        justifyContent: 'center',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
    statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
    statDivider: { width: 1, backgroundColor: '#E0E8EC', marginVertical: 4 },

    // ── Section Header ──
    sectionHeader: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: Colors.textMuted,
        marginTop: 24,
        marginBottom: 8,
        marginHorizontal: 20,
    },

    // ── Menu Card ──
    menuCard: {
        marginHorizontal: 16,
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E8F8F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuIconWrapDanger: { backgroundColor: '#FDECEA' },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
    menuLabelDanger: { color: '#E53935' },
    menuSublabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    rowDivider: { height: 1, backgroundColor: '#F0F5F8', marginLeft: 66 },

    // ── Version ──
    version: {
        textAlign: 'center',
        fontSize: 11,
        color: Colors.textMuted,
        marginTop: 18,
        letterSpacing: 0.4,
        lineHeight: 16,
    },
});

export default ProfileScreen;
