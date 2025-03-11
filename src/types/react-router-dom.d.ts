declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';

  export interface RouteProps {
    path: string;
    element: ReactNode;
  }

  export interface LinkProps {
    to: string;
    className?: string;
    children: ReactNode;
  }

  export const Routes: ComponentType<{ children: ReactNode }>;
  export const Route: ComponentType<RouteProps>;
  export const Link: ComponentType<LinkProps>;
  export const BrowserRouter: ComponentType<{ children: ReactNode }>;
} 