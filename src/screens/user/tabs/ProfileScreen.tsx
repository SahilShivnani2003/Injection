import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Image,
    ScrollView,
    Switch,
    Alert,
    Modal,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../theme/colors';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { TabParamList } from '../../../navigation/TabNavigator';

type ProfileProps = NativeBottomTabScreenProps<TabParamList, 'Profile'>;

// ── Minimal icon set using Unicode / text glyphs (no extra lib needed) ──
const Icon = ({
    glyph,
    size = 18,
    color = Colors.gradientStart,
}: {
    glyph: string;
    size?: number;
    color?: string;
}) => <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>{glyph}</Text>;

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
            <Icon glyph={icon} size={16} color={danger ? '#E53935' : Colors.gradientStart} />
        </View>
        <View style={styles.menuText}>
            <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
            {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
        </View>
        {rightElement ?? <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const ProfileScreen = ({ navigation }: ProfileProps) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const handleLogout = () => {
        setLogoutModalVisible(false);
        // Replace with your actual logout logic / navigation reset
        Alert.alert('Logged out', 'You have been signed out.');
    };

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>

                {/* Settings shortcut */}
                <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
                    <Icon glyph="⚙" size={18} color={Colors.white} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Avatar Card ── */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarRing}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.name}>Jane Doe</Text>
                    <View style={styles.rolePill}>
                        <Text style={styles.roleText}>🏥 Patient</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Visits</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>4</Text>
                            <Text style={styles.statLabel}>Reports</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>2</Text>
                            <Text style={styles.statLabel}>Upcoming</Text>
                        </View>
                    </View>
                </View>

                {/* ── Personal Info ── */}
                <SectionHeader title="PERSONAL INFORMATION" />
                <View style={styles.menuCard}>
                    <MenuRow icon="✉" label="Email" sublabel="jane.doe@example.com" />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="📞" label="Phone" sublabel="+91 98765 43210" />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="📍" label="Location" sublabel="Bangalore, India" />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="🎂" label="Date of Birth" sublabel="14 March 1992" />
                </View>

                {/* ── Account ── */}
                <SectionHeader title="ACCOUNT" />
                <View style={styles.menuCard}>
                    <MenuRow icon="✏" label="Edit Profile" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="🔒" label="Change Password" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="🩺" label="Medical Records" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="💳" label="Insurance & Billing" onPress={() => {}} />
                </View>

                {/* ── Preferences ── */}
                <SectionHeader title="PREFERENCES" />
                <View style={styles.menuCard}>
                    <MenuRow
                        icon="🔔"
                        label="Push Notifications"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#D0D8DC', true: Colors.gradientStart }}
                                thumbColor={Colors.white}
                            />
                        }
                    />
                    <View style={styles.rowDivider} />
                </View>

                {/* ── Support ── */}
                <SectionHeader title="SUPPORT" />
                <View style={styles.menuCard}>
                    <MenuRow icon="❓" label="Help & FAQ" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="📣" label="Send Feedback" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="🛡" label="Privacy Policy" onPress={() => {}} />
                    <View style={styles.rowDivider} />
                    <MenuRow icon="📄" label="Terms of Service" onPress={() => {}} />
                </View>

                {/* ── Danger Zone ── */}
                <SectionHeader title="ACCOUNT ACTIONS" />
                <View style={styles.menuCard}>
                    <MenuRow
                        icon="🚪"
                        label="Log Out"
                        danger
                        onPress={() => setLogoutModalVisible(true)}
                    />
                    <View style={styles.rowDivider} />
                </View>

                {/* App version */}
                <Text style={styles.version}>HealthApp v2.4.1 • Build 2025.06</Text>
            </ScrollView>

            {/* ── Logout Confirmation Modal ── */}
            <Modal
                transparent
                animationType="fade"
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconWrap}>
                            <Text style={{ fontSize: 32 }}>👋</Text>
                        </View>
                        <Text style={styles.modalTitle}>Log Out?</Text>
                        <Text style={styles.modalBody}>
                            You'll need to sign in again to access your health records and
                            appointments.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalLogoutBtn}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalLogoutText}>Yes, Log Me Out</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setLogoutModalVisible(false)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.modalCancelText}>Stay Signed In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#EFF6FA' },

    // ── Header ──
    header: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtn: {
        position: 'absolute',
        left: 18,
        top: 58,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: { color: Colors.white, fontSize: 20, fontWeight: '700', marginTop: -2 },
    headerTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
    },
    settingsBtn: {
        position: 'absolute',
        right: 18,
        top: 58,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Scroll ──
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },

    // ── Avatar Card ──
    avatarCard: {
        marginHorizontal: 16,
        marginTop: -2,
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
    name: { fontSize: 22, fontWeight: '800', color: Colors.textDark, letterSpacing: 0.3 },
    rolePill: {
        marginTop: 6,
        backgroundColor: '#E6FBF5',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 4,
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
    chevron: { fontSize: 22, color: '#BCCDD6', fontWeight: '300' },
    rowDivider: { height: 1, backgroundColor: '#F0F5F8', marginLeft: 66 },

    // ── Version ──
    version: {
        textAlign: 'center',
        fontSize: 11,
        color: Colors.textMuted,
        marginTop: 28,
        letterSpacing: 0.4,
    },

    // ── Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,30,50,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 12,
    },
    modalIconWrap: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.textDark, marginBottom: 10 },
    modalBody: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    modalLogoutBtn: {
        width: '100%',
        backgroundColor: '#E53935',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalLogoutText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
    modalCancelBtn: {
        width: '100%',
        backgroundColor: '#F0F5F8',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalCancelText: { color: Colors.textMedium, fontWeight: '600', fontSize: 15 },
});

export default ProfileScreen;
