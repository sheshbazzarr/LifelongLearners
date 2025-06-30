import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Book, Target, Lightbulb, ThumbsUp, ThumbsDown, BarChart3, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  feedbackSubmitted?: boolean;
  conversationId?: string;
  isTyping?: boolean;
}

const TortoiseChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [learningInsights, setLearningInsights] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, userProfile } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with personalized greeting
  useEffect(() => {
    if (isOpen && messages.length === 0 && userProfile) {
      const timeOfDay = new Date().getHours();
      let greeting = '';
      
      if (timeOfDay < 12) greeting = 'Good morning';
      else if (timeOfDay < 17) greeting = 'Good afternoon';
      else greeting = 'Good evening';

      const userName = userProfile.name.split(' ')[0];
      const personalizedGreeting = `${greeting}, ${userName}! 🐢 I'm your wise learning companion. I can help you discover books, find challenges, create learning plans, and track your progress. What would you like to explore today?`;

      setMessages([{
        id: '1',
        text: personalizedGreeting,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, userProfile, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await aiService.askAI({
        user_id: user?.id,
        message: inputValue,
        context: {
          userProfile: userProfile
        }
      });

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
        };
        return [...withoutTyping, aiMessage];
      });
    } catch (error) {
      console.error('AI response error:', error);
      
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. Remember, every challenge is an opportunity to learn! 🐢",
          isUser: false,
          timestamp: new Date(),
        };
        return [...withoutTyping, errorMessage];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      // In a real implementation, you'd get the conversation ID from the message
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedbackSubmitted: true }
          : msg
      ));
    } catch (error) {
      console.error('Feedback submission error:', error);
    }
  };

  const loadLearningInsights = async () => {
    if (!user?.id) return;
    
    try {
      const insights = await aiService.getLearningInsights(user.id);
      setLearningInsights(insights);
      setShowInsights(true);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const quickPrompts = [
    { text: "What books would you recommend for me?", icon: Book },
    { text: "Find me a challenge to improve my skills", icon: Target },
    { text: "Create a learning plan for productivity", icon: Lightbulb },
    { text: "How am I doing with my learning progress?", icon: BarChart3 },
    { text: "I need some motivation to keep learning", icon: Sparkles },
  ];

  const renderInsights = () => {
    if (!learningInsights) return null;

    return (
      <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Your Learning Insights
          </h4>
          <button
            onClick={() => setShowInsights(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          {learningInsights.most_discussed_topics?.length > 0 && (
            <div>
              <span className="font-medium">Top interests: </span>
              {learningInsights.most_discussed_topics.map((topic: any, index: number) => (
                <span key={index} className="text-primary-600">
                  {topic.topic}{index < learningInsights.most_discussed_topics.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          
          <div>
            <span className="font-medium">Activity level: </span>
            <span className="text-secondary-600 capitalize">
              {learningInsights.learning_frequency?.replace('_', ' ')}
            </span>
          </div>
          
          {learningInsights.satisfaction_trend && (
            <div>
              <span className="font-medium">Satisfaction trend: </span>
              <span className={`capitalize ${
                learningInsights.satisfaction_trend === 'improving' ? 'text-green-600' :
                learningInsights.satisfaction_trend === 'declining' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {learningInsights.satisfaction_trend?.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'scale-0' : 'scale-100 hover:scale-110'
        }`}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img 
            src="/photo_2024-12-26_12-17-47.jpg" 
            alt="Tortoise AI" 
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="/photo_2024-12-26_12-17-47.jpg" 
                alt="Tortoise AI" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">The Tortoise</h3>
              <p className="text-xs opacity-90">Your wise learning companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={loadLearningInsights}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                title="View Learning Insights"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Learning Insights Panel */}
        {showInsights && renderInsights()}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.isUser
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.isTyping ? (
                  <div className="flex space-x-1 py-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    
                    {/* Feedback buttons for AI messages */}
                    {!message.isUser && message.text && !message.feedbackSubmitted && !message.isTyping && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Helpful?</span>
                        <button
                          onClick={() => handleFeedback(message.id, 5)}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 1)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    )}

                    {message.feedbackSubmitted && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Thank you for your feedback! 🐢</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
            <div className="space-y-1">
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setInputValue(prompt.text)}
                    className="w-full text-left flex items-center space-x-2 p-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={userProfile ? `Ask me anything, ${userProfile.name.split(' ')[0]}...` : "Ask me anything about learning..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {userProfile && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Personalized for {userProfile.name} • {userProfile.role}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TortoiseChat;