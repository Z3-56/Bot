import React from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[80%] p-4 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">
          {message.content.split(/(https?:\/\/[^\s]+)/).map((part, index) => {
            if (part.match(/(https?:\/\/[^\s]+)/)) {
              return (
                <motion.span
                  key={index}
                  className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 group"
                  whileHover={{ scale: 1.02 }}
                >
                  <a
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {part.length > 30 ? part.substring(0, 30) + '...' : part}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.span>
              );
            }
            return part;
          })}
        </p>
        <span className="text-xs opacity-75 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
};