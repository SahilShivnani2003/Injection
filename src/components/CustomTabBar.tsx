import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { ITabItem } from '../types/ITabItems';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomTabBarProps {
    state: any;
    navigation: any;
    tabs: ITabItem[];
}

interface TabItemProps {
    tab: ITabItem;
    isActive: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

const TabItemComponent = ({ tab, isActive, onPress, onLongPress }: TabItemProps) => {
    // Scale animation for the active indicator bubble
    const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
    // Translate-Y animation: icon floats up when active
    const translateY = useRef(new Animated.Value(isActive ? -6 : 0)).current;
    // Opacity for label
    const labelOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isActive ? 1 : 0,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
            }),
            Animated.spring(translateY, {
                toValue: isActive ? -6 : 0,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
            }),
            Animated.timing(labelOpacity, {
                toValue: isActive ? 1 : 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isActive]);

    return (
        <TouchableOpacity
            style={styles.tabItem}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
        >
            {/* Active glowing bubble behind icon */}
            <Animated.View
                style={[
                    styles.activeBubble,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: scaleAnim,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(0, 212, 160, 0.15)', 'rgba(0, 212, 160, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeBubbleGradient}
                />
            </Animated.View>

            {/* Icon */}
            <Animated.View style={[styles.iconContainer, { transform: [{ translateY }] }]}>
                <Ionicons
                    name={isActive ? tab.icon : tab.iconOff}
                    size={26}
                    color={isActive ? Colors.white : Colors.textMuted}
                />
            </Animated.View>

            {/* Label fades in under icon when active */}
            <Animated.Text
                style={[
                    styles.tabLabel,
                    {
                        opacity: labelOpacity,
                        color: Colors.gradientStart,
                    },
                ]}
                numberOfLines={1}
            >
                {tab.label}
            </Animated.Text>
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, navigation, tabs }: CustomTabBarProps) => {
    return (
        <View style={styles.wrapper}>
            {/* Floating card container */}
            <View style={styles.container}>
                {/* Subtle inner top highlight */}
                <View style={styles.topHighlight} />

                {state.routes.map((route: any, index: number) => {
                    const tab = tabs.find(t => t.name === route.name);
                    if (!tab) return null;

                    const isActive = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isActive && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({ type: 'tabLongPress', target: route.key });
                    };

                    return (
                        <TabItemComponent
                            key={route.key}
                            tab={tab}
                            isActive={isActive}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const TAB_BAR_HEIGHT = 68;
const HORIZONTAL_MARGIN = 20;
const BOTTOM_OFFSET = Platform.OS === 'ios' ? 28 : 14;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: BOTTOM_OFFSET,
        left: HORIZONTAL_MARGIN,
        right: HORIZONTAL_MARGIN,
        alignItems: 'center',
    },
    container: {
        width: '100%',
        height: TAB_BAR_HEIGHT,
        backgroundColor: Colors.white,
        borderRadius: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
        // Multi-layer shadow for a lifted, floating feel
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 160, 0.12)',
    },
    topHighlight: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        height: 1,
        backgroundColor: 'rgba(0, 212, 160, 0.25)',
        borderRadius: 1,
    },
    tabItem: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeBubble: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        // subtle glow ring
        shadowColor: Colors.gradientStart,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 8,
        opacity: 1,
    },
    activeBubbleGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 42,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    inactiveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'transparent',
        marginTop: 2,
    },
    iconContainer: {
        paddingTop: 18,
    },
});

export default CustomTabBar;
