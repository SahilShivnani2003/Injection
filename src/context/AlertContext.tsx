import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertState, AlertConfig, AlertType } from '../types/alert';

interface AlertContextType {
  alerts: AlertState[];
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  confirm: (config: Omit<AlertConfig, 'type'>) => void;
  show: (config: AlertConfig) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showAlert = useCallback((config: AlertConfig) => {
    const id = generateId();
    const alert: AlertState = {
      id,
      ...config,
      visible: true,
    };

    setAlerts(prev => [...prev, alert]);
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    showAlert({
      type: 'success',
      title,
      message,
      duration,
    });
  }, [showAlert]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    showAlert({
      type: 'error',
      title,
      message,
      duration,
    });
  }, [showAlert]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    showAlert({
      type: 'info',
      title,
      message,
      duration,
    });
  }, [showAlert]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    showAlert({
      type: 'warning',
      title,
      message,
      duration,
    });
  }, [showAlert]);

  const confirm = useCallback((config: Omit<AlertConfig, 'type'>) => {
    showAlert({
      ...config,
      type: 'confirm',
    });
  }, [showAlert]);

  const show = useCallback((config: AlertConfig) => {
    showAlert(config);
  }, [showAlert]);

  const dismiss = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts([]);
  }, []);

  const value: AlertContextType = {
    alerts,
    success,
    error,
    info,
    warning,
    confirm,
    show,
    dismiss,
    dismissAll,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;