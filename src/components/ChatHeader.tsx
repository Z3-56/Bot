import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { GraduationCap } from 'lucide-react';

interface ChatHeaderProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

export function ChatHeader({ language, onLanguageChange }: ChatHeaderProps) {
  return (
    <div className="border-b bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Educational Assistant</h1>
            <p className="text-sm text-gray-500">Ask me about admissions, courses, and more</p>
          </div>
        </div>
        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </div>
  );
}