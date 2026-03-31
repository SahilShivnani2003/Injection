export type LoaderType =
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'bars'
  | 'ring'
  | 'bounce'
  | 'wave'
  | 'gradient';

export type LoaderSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface LoaderProps {
  type?: LoaderType;
  size?: LoaderSize;
  color?: string;
  gradientColors?: string[];
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  overlay?: boolean;
  style?: any;
}