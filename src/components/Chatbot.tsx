import { useState, useRef, useEffect, type ReactNode } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Client-side pre-filter. This is a best-effort, defense-in-depth layer only —
// it catches obvious cases cheaply (no API call, no embedding call, no chat
// completion) but is NOT a substitute for the server-side guardrails, and
// can't be relied on as the sole protection since a determined user can call
// the API directly with the key exposed in the client bundle.
// ---------------------------------------------------------------------------

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all|any|previous|prior|the above)\s+instructions/i,
  /disregard\s+(all|any|previous|prior)\s+instructions/i,
  /you are now/i,
  /system prompt/i,
  /reveal your (instructions|prompt|rules)/i,
  /pretend (you|to) (are|be)/i,
  /jailbreak/i,
  /developer mode/i,
];

function looksLikeInjectionAttempt(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

function looksLikeNonPlainText(text: string): boolean {
  if (/<\s*script/i.test(text)) return true;
  if (/```/.test(text)) return true;
  if (/(.)\1{2,}/.test(text)) return true;
  const hasSpaces = /\s/.test(text.trim());
  if (!hasSpaces && text.length > 14) return true;
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s.,!?'"-]/g) || []).length;
  const specialCharRatio = specialCharCount / Math.max(text.length, 1);
  if (text.length > 15 && specialCharRatio > 0.15) return true;
  return false;
}

const GUARDRAIL_REFUSAL =
  "I'm only able to help with plain-language questions about St Gabriel Catholic Church SHG. Could you rephrase your question?";

// ---------------------------------------------------------------------------
// Lightweight markdown-lite renderer: **bold**, *italic*/_italic_, bullet
// lists ("- " / "* "), and numbered lists ("1. "). Avoids pulling in a full
// markdown library for a handful of formatting needs.
// ---------------------------------------------------------------------------

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*.+?\*\*|\*[^*]+?\*|_[^_]+?_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderMessageContent(content: string): ReactNode {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === 'ul') {
      elements.push(
        <ul key={elements.length} className="list-disc pl-5 space-y-0.5 my-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    } else if (listType === 'ol') {
      elements.push(
        <ol key={elements.length} className="list-decimal pl-5 space-y-0.5 my-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    }
    listItems = [];
    listType = null;
  };

  lines.forEach((line) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);
    const numberedMatch = line.match(/^\s*\d+\.\s+(.*)/);

    if (bulletMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
    } else if (numberedMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(numberedMatch[1]);
    } else {
      flushList();
      if (line.trim() === '') {
        elements.push(<div key={elements.length} className="h-1.5" />);
      } else {
        elements.push(
          <p key={elements.length} className="mb-1 last:mb-0">
            {renderInline(line)}
          </p>
        );
      }
    }
  });
  flushList();

  return <>{elements}</>;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm here to help you with information about St Gabriel Catholic Church SHG. How can I assist you today?" },
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

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };

    // Cheap client-side pre-filter before spending an embeddings + chat completion call
    if (looksLikeInjectionAttempt(trimmed) || looksLikeNonPlainText(trimmed)) {
      setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: GUARDRAIL_REFUSAL }]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // NOTE: no system message built here anymore. The server (api/chat.js
      // in prod, the Vite dev proxy locally - both calling the same
      // api/_lib/chatHandler.js) builds the full prompt itself, including
      // retrieval against the knowledge base. We just send the conversation
      // turns.
      const conversationHistory = [...messages, userMessage].map((msg) => ({ role: msg.role, content: msg.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Chat service error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact our office directly for assistance.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#16210E] text-[#FAF9F5] p-4 rounded-full shadow-lg hover:bg-[#237A17] transition-all z-50 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[#FAF9F5] rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 max-h-[600px] font-sans">
          <div className="bg-[#16210E] text-[#FAF9F5] p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <div className="flex flex-col">
                <span className="font-semibold">St Gabriel Catholic Church SHG</span>
                <span className="text-base text-gray-200">Ask me anything</span>
              </div>
            </div>
            <button onClick={handleClose} className="hover:bg-[#237A17] p-1 rounded transition-colors" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '400px' }}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-base ${
                    message.role === 'user'
                      ? 'bg-[#16210E] text-[#FAF9F5] rounded-br-none whitespace-pre-wrap'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.role === 'assistant' ? renderMessageContent(message.content) : message.content}
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

          <div className="p-4 border-t border-gray-200 bg-[#F3F0E8] rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-[#FAF9F5]"
                disabled={isLoading}
              />
              <Button onClick={handleSend} className="bg-[#16210E] hover:bg-[#237A17]" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </Button>
            </div>
            <p className="text-base text-gray-500 mt-2 text-center">Powered by Mistral AI</p>
          </div>
        </div>
      )}
    </>
  );
}