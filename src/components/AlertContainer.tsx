import React from 'react';
import { View, StyleSheet } from 'react-native';
import Alert from './Alert';
import { AlertState } from '../types/alert';

interface AlertContainerProps {
  alerts: AlertState[];
  onDismiss: (id: string) => void;
}

const AlertContainer: React.FC<AlertContainerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});

export default AlertContainer;