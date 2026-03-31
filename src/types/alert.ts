export type AlertType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface AlertState extends AlertConfig {
  id: string;
  visible: boolean;
}