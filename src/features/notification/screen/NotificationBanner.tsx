import React, { useEffect, useRef, useState } from 'react';
import {
      Animated,
      PanResponder,
      Platform,
      StatusBar,
      StyleSheet,
      Text,
      TouchableOpacity,
      View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, Fonts } from '../../../theme/colors'; // adjust path to your theme file

export interface BannerPayload {
      title: string;
      body?: string;
      data?: Record<string, string>;
      onPress?: (data?: Record<string, string>) => void;
}

type ShowFn = (payload: BannerPayload) => void;
type HideFn = () => void;

// Singleton so the banner can be triggered from anywhere — including a
// messaging().onMessage() listener that lives outside the component tree.
let showRef: ShowFn | null = null;
let hideRef: HideFn | null = null;

export const NotificationBannerManager = {
      show: (payload: BannerPayload) => showRef?.(payload),
      hide: () => hideRef?.(),
};

const AUTO_HIDE_MS = 4000;
const TOP_OFFSET =
      Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 10;

/**
 * Mount this ONCE near the root of your app (e.g. just above or inside your
 * NavigationContainer), alongside useForegroundNotificationBanner().
 */
export const NotificationBannerHost: React.FC = () => {
      const [payload, setPayload] = useState<BannerPayload | null>(null);
      const translateY = useRef(new Animated.Value(-200)).current;
      const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

      const hide: HideFn = () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
            Animated.spring(translateY, {
                  toValue: -200,
                  useNativeDriver: true,
                  bounciness: 4,
            }).start(() => setPayload(null));
      };

      const show: ShowFn = next => {
            setPayload(next);
            translateY.setValue(-200);
            Animated.spring(translateY, {
                  toValue: 0,
                  useNativeDriver: true,
                  bounciness: 6,
            }).start();

            if (hideTimer.current) clearTimeout(hideTimer.current);
            hideTimer.current = setTimeout(hide, AUTO_HIDE_MS);
      };

      useEffect(() => {
            showRef = show;
            hideRef = hide;
            return () => {
                  showRef = null;
                  hideRef = null;
                  if (hideTimer.current) clearTimeout(hideTimer.current);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      // Swipe up to dismiss
      const panResponder = useRef(
            PanResponder.create({
                  onMoveShouldSetPanResponder: (_, gesture) => gesture.dy < -5,
                  onPanResponderMove: (_, gesture) => {
                        if (gesture.dy < 0) translateY.setValue(gesture.dy);
                  },
                  onPanResponderRelease: (_, gesture) => {
                        if (gesture.dy < -30) {
                              hide();
                        } else {
                              Animated.spring(translateY, {
                                    toValue: 0,
                                    useNativeDriver: true,
                              }).start();
                        }
                  },
            }),
      ).current;

      if (!payload) return null;

      return (
            <Animated.View
                  pointerEvents="box-none"
                  style={[styles.container, { top: TOP_OFFSET, transform: [{ translateY }] }]}
            >
                  <View {...panResponder.panHandlers}>
                        <TouchableOpacity
                              activeOpacity={0.9}
                              style={styles.touchable}
                              onPress={() => {
                                    payload.onPress?.(payload.data);
                                    hide();
                              }}
                        >
                              <View style={styles.iconWrap}>
                                    <Ionicons name="notifications" size={20} color={Colors.white} />
                              </View>
                              <View style={styles.textWrap}>
                                    <Text style={styles.title} numberOfLines={1}>
                                          {payload.title}
                                    </Text>
                                    {!!payload.body && (
                                          <Text style={styles.body} numberOfLines={2}>
                                                {payload.body}
                                          </Text>
                                    )}
                              </View>
                              <TouchableOpacity
                                    onPress={hide}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              >
                                    <Ionicons name="close" size={18} color={Colors.textMuted} />
                              </TouchableOpacity>
                        </TouchableOpacity>
                  </View>
            </Animated.View>
      );
};

const styles = StyleSheet.create({
      container: {
            position: 'absolute',
            left: Spacing.lg,
            right: Spacing.lg,
            zIndex: 999,
            elevation: 10,
      },
      touchable: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: Spacing.md,
            shadowColor: Colors.shadowColor,
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
      },
      iconWrap: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: Colors.gradientEnd,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.sm,
      },
      textWrap: {
            flex: 1,
            marginRight: Spacing.sm,
      },
      title: {
            fontSize: Fonts.sizes.md,
            fontWeight: '700',
            color: Colors.textDark,
      },
      body: {
            fontSize: Fonts.sizes.sm,
            color: Colors.textMuted,
            marginTop: 2,
      },
});