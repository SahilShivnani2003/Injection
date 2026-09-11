import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { NotificationBannerManager } from '../features/notification/screen/NotificationBanner';

/**
 * Call this ONCE near your app root (same place you mount
 * <NotificationBannerHost />). Whenever a push arrives while the app is in
 * the foreground, it pops the in-app banner instead of staying silent.
 *
 * onNotificationPress is called with the FCM `data` payload when the vendor
 * taps the banner — use it to navigate to the relevant booking/notifications
 * screen.
 */
export function useForegroundNotificationBanner(
      onNotificationPress?: (data?: Record<string, string>) => void,
) {
      useEffect(() => {
            const unsubscribe = messaging().onMessage(async remoteMessage => {
                  console.log('FCM foreground message:', remoteMessage);
                  NotificationBannerManager.show({
                        title: remoteMessage.notification?.title ?? 'New notification',
                        body: remoteMessage.notification?.body,
                        data: remoteMessage.data as Record<string, string> | undefined,
                        onPress: onNotificationPress,
                  });
            });

            return unsubscribe;
      }, [onNotificationPress]);
}