import React from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, ExternalLink, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { content, role, timestamp } = message;
  const isUser = role === 'user';
  
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
      )}
      
      <div
        className={`max-w-[75%] p-4 rounded-2xl ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none shadow-md'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-md border border-gray-100 dark:border-gray-600'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">
          {content.split(/(https?:\/\/[^\s]+)/).map((part, index) => {
            if (part.match(/(https?:\/\/[^\s]+)/)) {
              return (
                <motion.span
                  key={index}
                  className={`${isUser ? 'text-blue-100' : 'text-blue-500 dark:text-blue-300'} hover:underline inline-flex items-center gap-1 group`}
                  whileHover={{ scale: 1.02 }}
                >
                  <a
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {part.length > 30 ? part.substring(0, 30) + '...' : part}
                    <ExternalLink className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.span>
              );
            }
            return part;
          })}
        </p>
        <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} mt-1 block`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
