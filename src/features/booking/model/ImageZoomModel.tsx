import { Colors } from '@/theme/colors';
import { Modal, Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const ImageZoomModal = ({
    visible,
    imageUrl,
    onClose,
}: {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}) => {
    if (!imageUrl) return null;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={zoomStyles.overlay}>
                <TouchableOpacity
                    style={zoomStyles.closeBtn}
                    onPress={onClose}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="close" size={26} color={Colors.white} />
                </TouchableOpacity>
                <ScrollView
                    style={zoomStyles.scroll}
                    contentContainerStyle={zoomStyles.scrollContent}
                    minimumZoomScale={1}
                    maximumZoomScale={4}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    centerContent
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={zoomStyles.fullImage}
                        resizeMode="contain"
                    />
                </ScrollView>
            </View>
        </Modal>
    );
};

const zoomStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
    closeBtn: {
        position: 'absolute',
        top: 48,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: SCREEN_W,
        minHeight: SCREEN_H,
    },
    fullImage: { width: SCREEN_W, height: SCREEN_H * 0.85 },
});
