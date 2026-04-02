import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const TAB_COUNT = 3;
const TAB_WIDTH = width / TAB_COUNT;
const PILL_WIDTH = 64;
const PILL_HEIGHT = 32;

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
    Dashboard: { active: '🏠', inactive: '🏠' },
    Bookings:  { active: '📅', inactive: '📅' },
    Profile:   { active: '👤', inactive: '👤' },
};

// Individual tab — scale springs on press
const TabItem: React.FC<{
    route: BottomTabBarProps['state']['routes'][0];
    index: number;
    isFocused: boolean;
    label: string | React.ReactNode;
    onPress: () => void;
    onLongPress: () => void;
}> = ({ route, index, isFocused, label, onPress, onLongPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const iconTranslateY = useRef(new Animated.Value(0)).current;
    const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(iconTranslateY, {
                toValue: isFocused ? -2 : 0,
                useNativeDriver: true,
                tension: 80,
                friction: 8,
            }),
            Animated.timing(labelOpacity, {
                toValue: isFocused ? 1 : 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isFocused]);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.82,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 6,
        }).start();
    };

    const icons = TAB_ICONS[route.name] ?? { active: '●', inactive: '○' };

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
        >
            <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
                {/* Active pill behind icon */}
                {isFocused && (
                    <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.activePill}
                    />
                )}

                <Animated.Text
                    style={[
                        styles.icon,
                        { transform: [{ translateY: iconTranslateY }] },
                    ]}
                >
                    {icons.active}
                </Animated.Text>

                <Animated.Text
                    style={[
                        styles.label,
                        {
                            opacity: labelOpacity,
                            color: isFocused ? Colors.gradientStart : Colors.textMuted,
                            transform: [
                                {
                                    translateY: labelOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [4, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {typeof label === 'string' ? label : route.name}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation, }) => {
    // Sliding indicator
    const slideAnim = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: state.index * TAB_WIDTH + (TAB_WIDTH - PILL_WIDTH) / 2,
            useNativeDriver: true,
            tension: 70,
            friction: 10,
        }).start();
    }, [state.index]);

    return (
        <View style={styles.wrapper}>
            {/* Floating card shadow layer */}
            <View style={styles.shadowLayer} />

            <View style={styles.container}>
                {/* Sliding top accent bar */}
                <Animated.View
                    style={[
                        styles.slideIndicator,
                        { transform: [{ translateX: slideAnim }] },
                    ]}
                >
                    <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.slideIndicatorInner}
                    />
                </Animated.View>

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? typeof options.tabBarLabel === 'function'
                                ? options.tabBarLabel({
                                      focused: state.index === index,
                                      color: '',
                                      position: 'below-icon',
                                      children: '',
                                  })
                                : options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TabItem
                            key={route.key}
                            route={route}
                            index={index}
                            isFocused={isFocused}
                            label={label}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const BOTTOM_INSET = Platform.OS === 'ios' ? 20 : 0;

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        backgroundColor: 'transparent',
    },
    // Fake shadow card below
    shadowLayer: {
        position: 'absolute',
        top: 0,
        left: 12,
        right: 12,
        bottom: -4,
        backgroundColor: Colors.white,
        borderRadius: 24,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 16,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: BOTTOM_INSET + 6,
        paddingTop: 0,
        overflow: 'hidden',
        borderTopWidth: 0,
    },
    // Top sliding gradient bar
    slideIndicator: {
        position: 'absolute',
        top: 0,
        width: PILL_WIDTH,
        height: 3,
        borderRadius: 2,
    },
    slideIndicatorInner: {
        flex: 1,
        borderRadius: 2,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 4,
    },
    tabInner: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minWidth: 56,
        minHeight: 48,
    },
    activePill: {
        position: 'absolute',
        top: -4,
        left: -12,
        right: -12,
        bottom: 14,
        borderRadius: 14,
        opacity: 0.10,
    },
    icon: {
        fontSize: 22,
        marginBottom: 3,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});

export default CustomTabBar;