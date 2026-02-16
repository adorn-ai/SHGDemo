import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! How can I help you?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', text: input }]);
    
    // Simple bot responses
    setTimeout(() => {
      let response = "I'm here to help! For specific queries, please contact our office or visit the About Us page.";
      
      if (input.toLowerCase().includes('loan')) {
        response = "To apply for a loan, please use the 'Apply for Loan' button in the navigation menu. You'll need to be a registered member.";
      } else if (input.toLowerCase().includes('register') || input.toLowerCase().includes('member')) {
        response = "You can register as a new member using the 'Register' link in the navigation. You'll need Aadhar, PAN, and bank details.";
      } else if (input.toLowerCase().includes('interest') || input.toLowerCase().includes('rate')) {
        response = "Our current interest rate is 12% per annum. Terms may vary based on the loan amount and duration.";
      } else if (input.toLowerCase().includes('contact') || input.toLowerCase().includes('phone') || input.toLowerCase().includes('email')) {
        response = "You can reach us at contact@stgabrielshg.org or call us at +91 98765 43210. Office hours: Mon-Fri 9 AM - 5 PM.";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 500);
    
    setInput('');
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#2D5016] text-white p-4 rounded-full shadow-lg hover:bg-[#4A7C2C] transition-all z-50"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-[#2D5016] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <span>Chat with us</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-[#4A7C2C] p-1 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto h-80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#2D5016] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                className="bg-[#2D5016] hover:bg-[#4A7C2C]"
                size="icon"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
