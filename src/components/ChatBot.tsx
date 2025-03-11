import { useState } from 'react';
import { processInput, updateContext } from '../services/nlpProcessor';
import type { SemanticAnalysis, ConversationContext } from '../services/nlpProcessor';
import { getProcessingStrategy, createNLPWorker } from '../utils/performance';
import { KnowledgeGraph } from '../services/knowledgeGraph';
import { ExternalResource } from '../services/knowledgeGraph';

type ChatMessage = {
  text: string;
  isUser: boolean;
};

const ChatBot = () => {
  // State management
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    mentionedEntities: [],
    history: [],
  });
  const [knowledgeGraph] = useState(new KnowledgeGraph());

  // Message handling functions
  const handleMessage = async (input: string) => {
    // Add user message to history
    setChatHistory(prev => [...prev, { text: input, isUser: true }]);
    
    const strategy = getProcessingStrategy();
    const analysis = await (strategy === 'parallel' 
      ? workerProcessInput(input)
      : localProcessInput(input));

    knowledgeGraph.updateWithAnalysis(analysis);
    
    // Fetch external data for mentioned entities
    analysis.entities.forEach(async (entity) => {
      await knowledgeGraph.updateExternalData(entity);
    });
    
    // Generate response with external data
    const externalData = knowledgeGraph.getExternalResources(analysis.entities[0]);
    const response = generateResponse(analysis, conversationContext, externalData);
    setChatHistory(prev => [...prev, { text: response, isUser: false }]);
    
    // Update conversation context
    setConversationContext(prev => updateContext(prev, input, analysis));
  };

  // Helper functions
  const workerProcessInput = async (text: string) => {
    const worker = createNLPWorker();
    return new Promise<SemanticAnalysis>((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage(text);
    });
  };

  const localProcessInput = (text: string) => {
    return processInput(text, conversationContext);
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={msg.isUser ? 'user' : 'bot'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleMessage(userInput)}
        />
        <button onClick={() => handleMessage(userInput)}>
          Send
        </button>
      </div>
    </div>
  );
};

// Response generation functions
const generateResponse = (
  analysis: SemanticAnalysis,
  context: ConversationContext,
  externalData?: ExternalResource[]
) => {
  let response = "Let me think about that...";
  
  // Add external data usage
  if (externalData?.length) {
    const collegeInfo = externalData.find(d => d.source === 'college_api');
    if (collegeInfo) {
      response += `\n\nCollege Data: ${collegeInfo.data[0]?.name || ''}`;
    }
    
    const gfInfo = externalData.find(d => d.source === 'geeksforgeeks');
    if (gfInfo) {
      response += `\n\nTech Resource: ${gfInfo.data.title}`;
    }
  }
  
  switch(analysis.intent) {
    case 'create_task':
      response = `I'll help create ${analysis.entities[0] || 'that'}. ${analysis.temporalReference === 'future' ? 'When should I remind you?' : ''}`;
      break;
    case 'set_reminder':
      response = `I'll remind you about ${context.lastTopic || 'this'}. When should I set the reminder?`;
      break;
    case 'seek_advice':
      response = `Based on previous chat about ${context.mentionedEntities.join(', ')}, maybe consider...`;
      break;
  }

  if (analysis.urgency > 1) {
    response += ' ⏰ This seems important!';
  }

  return response;
};

export default ChatBot; 