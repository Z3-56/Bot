import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// Generate a unique ID using timestamp and random number
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useChat = (language: string = 'en') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      content: text,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: generateId(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};