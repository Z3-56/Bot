import { Message } from '../types/chat';

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: "Hello! I am your educational assistant. How can I help you today?",
  role: 'assistant',
  timestamp: new Date(),
};

export const generateResponse = async (message: string): Promise<Message> => {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        timestamp: new Date(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from server');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    return {
      id: data.response.id,
      content: data.response.content,
      role: 'assistant',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      id: Date.now().toString(),
      content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
      role: 'assistant',
      timestamp: new Date(),
    };
  }
};

export const chatService = {
  INITIAL_MESSAGE,
  generateResponse,
};