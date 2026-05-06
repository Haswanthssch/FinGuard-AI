import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Send, Zap, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  citations?: Array<{ title: string; url: string }>;
}

export function RegulatoryAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Regulatory Assistant. I can help you with compliance questions, regulatory requirements, and financial regulations. How can I assist you today?',
      timestamp: new Date(),
    },
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

  const suggestedPrompts = [
    'What are the latest SEC compliance requirements?',
    'Explain KYC/AML regulations',
    'What is the Dodd-Frank Act?',
    'How do I ensure GDPR compliance?',
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you're asking about "${input}". This is a complex topic in financial regulation. Based on current guidelines, here are the key points:\n\n1. **Regulatory Framework**: The primary regulations governing this area include...\n\n2. **Compliance Requirements**: Organizations must ensure...\n\n3. **Best Practices**: Industry leaders typically implement...`,
        timestamp: new Date(),
        citations: [
          { title: 'SEC Official Guidelines', url: 'https://www.sec.gov' },
          { title: 'Federal Reserve Regulations', url: 'https://www.federalreserve.gov' },
        ],
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-lg">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-h3 font-bold text-gray-900">Regulatory Assistant</h1>
            <p className="text-caption text-gray-600">AI-powered compliance guidance</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-lg space-y-lg">
        {messages.length === 1 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-lg">
                <Zap size={32} className="text-blue-600" />
              </div>
              <h2 className="text-h2 font-bold text-gray-900 mb-md">Ask Anything</h2>
              <p className="text-body text-gray-600 mb-2xl">
                Get instant answers to your regulatory and compliance questions
              </p>

              {/* Suggested Prompts */}
              <div className="space-y-md">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="w-full p-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
                  >
                    <p className="text-body text-gray-900 font-medium">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md lg:max-w-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md'
                  : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-md'
              } p-lg`}
            >
              <p className="text-body whitespace-pre-wrap">{message.content}</p>

              {message.citations && message.citations.length > 0 && (
                <div className="mt-lg pt-lg border-t border-gray-300 space-y-md">
                  <p className="text-caption font-medium opacity-75">Sources:</p>
                  {message.citations.map((citation, idx) => (
                    <a
                      key={idx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-md p-md bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-caption">{citation.title}</span>
                    </a>
                  ))}
                </div>
              )}

              <p className="text-caption opacity-75 mt-md">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-md p-lg">
              <div className="flex gap-md">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-lg bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-md">
          <Input
            type="text"
            placeholder="Ask a regulatory question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={<Send size={18} />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
