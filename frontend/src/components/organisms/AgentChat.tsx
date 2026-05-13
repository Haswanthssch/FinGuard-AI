import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore, type AgentType } from '@/stores/agentStore';
import { motion } from 'framer-motion';
import { Send, MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { chatService } from '@/services/chatService';

interface AgentChatProps {
  agentId: AgentType;
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  const lines = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\*\*/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, index) => {
        const cleanLine = line.replace(/^#{1,4}\s*/, '').replace(/^\*\s*/, '- ');
        const isHeading = /^(Summary|Key Insights|Recommendations|Risk Observations|Confidence Notes|Direct Answer|Sources|Next Step|How It Works|What To Do):?$/i.test(cleanLine);
        const isBullet = cleanLine.startsWith('- ');

        if (isHeading) {
          return (
            <div key={`${line}-${index}`} className="pt-1 text-[12px] font-bold uppercase tracking-wide text-gray-500">
              {cleanLine.replace(/:$/, '')}
            </div>
          );
        }

        if (isBullet) {
          return (
            <div key={`${line}-${index}`} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{cleanLine.slice(2)}</span>
            </div>
          );
        }

        return <p key={`${line}-${index}`}>{cleanLine}</p>;
      })}
    </div>
  );
}

export function AgentChat({ agentId }: AgentChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const conversationMessages = useAgentStore((state) => state.conversations[agentId]);
  const addMessage = useAgentStore((state) => state.addMessage);
  const clearConversation = useAgentStore((state) => state.clearConversation);
  const agent = useAgentStore((state) => state.agents[agentId]);
  const portfolioId = useAgentStore((state) =>
    state.portfolioContext.uploadedData?.portfolio_id || state.portfolioContext.uploadedData?.id
  );

  const accentClass = {
    portfolio: 'bg-blue-600 hover:bg-blue-700 focus:border-blue-500 focus:ring-blue-500/20',
    risk: 'bg-amber-500 hover:bg-amber-600 focus:border-amber-500 focus:ring-amber-500/20',
    compliance: 'bg-slate-900 hover:bg-slate-800 focus:border-slate-500 focus:ring-slate-500/20',
    performance: 'bg-emerald-500 hover:bg-emerald-600 focus:border-emerald-500 focus:ring-emerald-500/20',
  }[agentId];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      agentId,
      role: 'user' as const,
      content: messageText,
      timestamp: new Date(),
    };

    addMessage(agentId, userMessage);
    if (!customInput) setInput('');
    setIsLoading(true);

    try {
      // Call backend AI
      const response = await chatService.sendMessage({
        message: messageText,
        portfolio_id: portfolioId,
        // session_id could be derived from agentId to keep independent histories
        session_id: `session_${agentId}`,
        context: {
          active_agent: agentId,
        },
      });

      const agentMessage = {
        id: (Date.now() + 1).toString(),
        agentId,
        role: 'agent' as const,
        content: response.response,
        timestamp: new Date(),
        thinking: response.skills_used?.length ? `Using skills: ${response.skills_used.join(', ')}` : undefined,
        llm_source: response.llm_source,
      };
      
      addMessage(agentId, agentMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        agentId,
        role: 'agent' as const,
        content: 'Agent temporarily unavailable. Please retry.',
        timestamp: new Date(),
      };
      addMessage(agentId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts: Record<AgentType, string[]> = {
    portfolio: [
      'Analyze my diversification',
      'Suggest portfolio improvements',
      'Compare with NIFTY 50',
    ],
    risk: [
      'Calculate my portfolio VaR',
      'Run a market crash stress test',
      'What is my current risk score?',
    ],
    compliance: [
      'What are SEBI position limits for me?',
      'Explain AML/KYC requirements',
      'Check my portfolio compliance',
    ],
    performance: [
      'Calculate my CAGR since inception',
      'What is my Sharpe ratio?',
      'Compare performance vs NIFTY 50',
    ],
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Chat Session</span>
        </div>
        <button 
          onClick={() => clearConversation(agentId)}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear History"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {agent.name}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              How can I help you with your {agentId} analysis today?
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {starterPrompts[agentId].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(undefined, prompt)}
                  className="text-left text-xs px-4 py-3 bg-white border border-gray-100 text-gray-700 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all group shadow-sm"
                >
                  {prompt}
                  <span className="float-right opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {conversationMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    msg.role === 'user'
                      ? `${accentClass} text-white rounded-br-none`
                      : 'bg-gray-50 text-gray-900 rounded-bl-none border border-gray-100 shadow-sm'
                  }`}
                >
                  {msg.thinking && (
                    <div className="text-[10px] opacity-70 mb-1.5 flex items-center gap-1.5 font-medium border-b border-black/5 pb-1">
                      <span className="animate-spin text-[8px]">⚙️</span> {msg.thinking}
                    </div>
                  )}
                  <FormattedMessage content={msg.content} isUser={msg.role === 'user'} />
                  <div className="flex items-center justify-between mt-2 gap-4">
                    <span className="text-[9px] opacity-50 font-bold uppercase tracking-tighter">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.llm_source && (
                      <span className="text-[8px] opacity-40 font-mono bg-black/5 px-1 rounded">
                        {msg.llm_source}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#FAFAFA] border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agent.name.split(' ')[0]}...`}
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 transition-all outline-none"
            disabled={isLoading}
          />
          <div className="absolute right-2">
            <Button
              type="submit"
              size="sm"
              className={`h-8 w-8 p-0 rounded-xl text-white ${accentClass}`}
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
