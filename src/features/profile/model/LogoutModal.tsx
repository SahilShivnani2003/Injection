import { Colors } from '@/theme/colors';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ILogoutModalProps ={
    visible: boolean;
    onClose:() => void;
    logout: () =>void;
}
export const LogoutModal = ({visible, onClose, logout}: ILogoutModalProps) => {
    console.log('modal visible : ', visible);
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View style={styles.modalIconWrap}>
                        <Icon name="logout" size={32} color="#E53935" />
                    </View>
                    <Text style={styles.modalTitle}>Log Out?</Text>
                    <Text style={styles.modalBody}>
                        You'll need to sign in again to access your health records and appointments.
                    </Text>
                    <TouchableOpacity
                        style={styles.modalLogoutBtn}
                        onPress={logout}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.modalLogoutText}>Yes, Log Me Out</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalCancelBtn}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.modalCancelText}>Stay Signed In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: '#FDECEA',
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
