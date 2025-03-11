import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { BookOpen, Lightbulb, Languages } from 'lucide-react';

interface ChatHeaderProps {
  onChangeLanguage: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onChangeLanguage }) => {
  // Using theme to conditionally render UI elements based on dark/light mode
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-t-lg shadow-sm border-b border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Educational Assistant</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything about your studies</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          onClick={onChangeLanguage}
          aria-label="Change language"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Languages className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </motion.div>
        </button>
        <button
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Show tips"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
};
