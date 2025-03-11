export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  language: string;
  authenticated: boolean;
}