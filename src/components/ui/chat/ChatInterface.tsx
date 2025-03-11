import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatHeader } from './ChatHeader';
import { ChatBubble } from './ChatBubble';
import { EnhancedChatInput } from './EnhancedChatInput';
import { Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import BackgroundPaths from '../BackgroundPaths';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  error?: string;
  onSendMessage: (message: string) => void;
  onChangeLanguage: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  onChangeLanguage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All Topics', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'math', name: 'Mathematics', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'science', name: 'Science', icon: <GraduationCap className="h-4 w-4" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  return (
    <div
      className="relative flex flex-col h-screen bg-background bg-opacity-90"
      style={{ maxWidth: '900px', margin: '0 auto' }}
    >
      <BackgroundPaths className="opacity-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <ChatHeader onChangeLanguage={onChangeLanguage} />
        
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Categories</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`w-full text-left p-2 rounded-lg mb-1 flex items-center space-x-2 transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className={`${
                    selectedCategory === category.id
                      ? 'text-blue-500 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {category.icon}
                  </span>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <motion.div 
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/70 dark:bg-gray-800/70"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Start a new conversation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    Ask me any question about your studies. I'm here to help you learn and understand new concepts.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChatBubble message={message} />
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 p-2"
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>Thinking...</span>
                    </motion.div>
                  )}
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mt-4 text-sm">
                  {error}
                </div>
              )}
            </motion.div>
            
            {/* Input area */}
            <EnhancedChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
