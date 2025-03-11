import React from 'react';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' }
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
    >
      <Globe size={20} className="text-blue-500" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="border rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </motion.div>
  );
}