import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface BackgroundPathsProps {
  className?: string;
}

export const BackgroundPaths: React.FC<BackgroundPathsProps> = ({ className = '' }) => {
  // Theme is used indirectly through Tailwind classes for dark/light mode
  const { theme } = useTheme();
  
  return (
    <div className={`absolute inset-0 overflow-hidden -z-10 ${className}`}>
      <svg
        className={`absolute w-full h-full ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="backgroundPattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 50 Q 25 0, 50 50 T 100 50"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="2"
            />
            <path
              d="M0 80 Q 25 30, 50 80 T 100 80"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="2"
            />
            <path
              d="M0 20 Q 25 70, 50 20 T 100 20"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#backgroundPattern)" />
      </svg>
    </div>
  );
};

export default BackgroundPaths;
