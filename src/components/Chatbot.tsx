import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import faqData from '../faq.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m here to help you with information about St Gabriel Self Help Group. How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build context from FAQ
  const buildContext = () => {
    const context = `You are a helpful assistant for St Gabriel Self Help Group (SHG) in Nairobi, Kenya.

Organization Information:
- Name: ${faqData.organization.name}
- Location: ${faqData.organization.location}
- Affiliation: ${faqData.organization.affiliation}

Here is important information about the organization:

${faqData.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

Instructions:
- Answer questions about St Gabriel SHG based on the information provided above
- Be friendly, professional, and concise
- If asked about something not covered in the FAQ, politely say you don't have that specific information and suggest contacting the office
- Use Kenyan English and currency (KES)
- For registration: direct users to ${faqData.contact_info.registration_link}
- For loan applications: direct users to ${faqData.contact_info.loan_application_link}
- For general info: direct users to ${faqData.contact_info.about_link}`;

    return context;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if API key is configured
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
      
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but the chatbot is not configured properly. Please contact the administrator to set up the VITE_MISTRAL_API_KEY environment variable.'
        }]);
        setIsLoading(false);
        return;
      }

      // Build conversation history for Mistral
      const conversationHistory = [
        {
          role: 'system',
          content: buildContext()
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: input
        }
      ];

      // Call Mistral API
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-tiny-latest',
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment or contact our office directly for assistance.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#2D5016] text-white p-4 rounded-full shadow-lg hover:bg-[#4A7C2C] transition-all z-50 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 max-h-[600px]">
          {/* Header */}
          <div className="bg-[#2D5016] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <div className="flex flex-col">
                <span className="font-semibold">St Gabriel SHG</span>
                <span className="text-xs text-gray-200">Ask me anything</span>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="hover:bg-[#4A7C2C] p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '400px' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#2D5016] text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-white"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                className="bg-[#2D5016] hover:bg-[#4A7C2C]"
                size="icon"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Mistral AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}