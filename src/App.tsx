import { useState, createContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import { motion } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/theme-toggle';
import { ChatInterface } from './components/ui/chat/ChatInterface';
import BackgroundPathsDemo from './pages/BackgroundPathsDemo';

// Create language context
export const LanguageContext = createContext<{
  language: string;
  setLanguage: (lang: string) => void;
}>({ language: 'en', setLanguage: () => undefined });

function App() {
  const [language, setLanguage] = useState('en');
  const { messages, isLoading, error, sendMessage } = useChat(language);

  const handleChangeLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <LanguageProvider>
      <ThemeProvider>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <motion.div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-gray-800 dark:to-gray-900 opacity-20"
              animate={{ x: [0, -50, 50, 0], y: [0, -50, 50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <div className="container mx-auto p-4 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <nav className="space-x-4">
                  <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">Home</Link>
                  <Link to="/background-paths" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">Background Paths</Link>
                </nav>
                <ThemeToggle />
              </div>

              <Routes>
                <Route path="/" element={
                  <ChatInterface 
                    messages={messages}
                    isLoading={isLoading}
                    error={error ? error : undefined}
                    onSendMessage={sendMessage}
                    onChangeLanguage={handleChangeLanguage}
                  />
                } />
                <Route path="/background-paths" element={<BackgroundPathsDemo />} />
              </Routes>
            </div>
          </motion.div>
        </LanguageContext.Provider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;