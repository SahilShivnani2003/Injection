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
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { AlertState } from '../types/alert';

const { width } = Dimensions.get('window');

interface AlertProps {
  alert: AlertState;
  onDismiss: (id: string) => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss if not confirm type
    if (alert.type !== 'confirm' && alert.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, alert.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(alert.id);
    });
  };

  const handleConfirm = () => {
    alert.onConfirm?.();
    handleDismiss();
  };

  const handleCancel = () => {
    alert.onCancel?.();
    handleDismiss();
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'success':
        return {
          gradient: [Colors.accent, '#5EA300'],
          icon: '✅',
          borderColor: Colors.accent,
        };
      case 'error':
        return {
          gradient: ['#FF4757', '#FF3838'],
          icon: '❌',
          borderColor: '#FF4757',
        };
      case 'warning':
        return {
          gradient: ['#FFA726', '#FB8C00'],
          icon: '⚠️',
          borderColor: '#FFA726',
        };
      case 'info':
        return {
          gradient: [Colors.gradientStart, Colors.gradientMid],
          icon: 'ℹ️',
          borderColor: Colors.gradientStart,
        };
      case 'confirm':
        return {
          gradient: [Colors.gradientStart, Colors.gradientMid],
          icon: '❓',
          borderColor: Colors.gradientStart,
        };
      default:
        return {
          gradient: [Colors.gradientStart, Colors.gradientMid],
          icon: '📢',
          borderColor: Colors.gradientStart,
        };
    }
  };

  const alertStyles = getAlertStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={alertStyles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.alert, { borderLeftColor: alertStyles.borderColor }]}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{alertStyles.icon}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.message}>{alert.message}</Text>
          </View>
          {alert.type !== 'confirm' && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {alert.type === 'confirm' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>
                {alert.cancelText || 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {alert.confirmText || 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  alert: {
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeIcon: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  confirmButton: {},
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default Alert;