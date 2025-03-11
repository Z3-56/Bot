import React from 'react';
import { motion } from 'framer-motion';

interface ChatContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
  error?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ children, isLoading, error }) => {
  return (
    <motion.div
      className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 min-h-[400px] max-h-[600px] overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="text-red-500 p-4 text-center">
          {error}
        </div>
      )}
    </motion.div>
  );
};
