declare module 'framer-motion' {
  import { ComponentType, ReactNode } from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    className?: string;
    children?: ReactNode;
    d?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    pathLength?: number;
    pathOffset?: number;
  }

  export const motion: {
    div: ComponentType<MotionProps>;
    span: ComponentType<MotionProps>;
    path: ComponentType<MotionProps>;
  };
} 