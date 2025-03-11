import React, { useState, useRef, ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Send, Paperclip, Mic, X } from 'lucide-react';

// Create a custom motion button component with proper typing
type MotionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & MotionProps;

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, ...props }, ref) => {
    const MotionComponent = motion.div;
    return (
      <MotionComponent {...props}>
        <button ref={ref} {...props}>
          {children}
        </button>
      </MotionComponent>
    );
  }
);

MotionButton.displayName = 'MotionButton';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording functionality
  };

  return (
    <motion.div
      className="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-md border-t border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2"
      >
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="w-full p-3 pr-10 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
            rows={1}
            disabled={isLoading || isRecording}
            style={{ minHeight: '50px', maxHeight: '120px' }}
          />
          <motion.div
            className="absolute right-3 top-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => {/* File upload functionality would go here */}}
              disabled={isLoading || isRecording}
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            type="button"
            className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'} text-${isRecording ? 'white' : 'gray-600 dark:text-gray-300'} hover:bg-${isRecording ? 'red-600' : 'gray-300 dark:hover:bg-gray-600'}`}
            onClick={toggleRecording}
            disabled={isLoading}
          >
            {isRecording ? <X className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(!message.trim() && !isRecording) || isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
        </motion.div>
      </form>
      
      {isRecording && (
        <motion.div 
          className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-center text-sm text-red-600 dark:text-red-300"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          Recording... Speak clearly into your microphone
        </motion.div>
      )}
    </motion.div>
  );
};
