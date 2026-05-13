import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Zap, ExternalLink, Bot, User, Sparkles, RotateCcw, Copy, Check, BookOpen, Scale, Shield, FileText, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { chatService, type ChatResponse } from '@/services/chatService';


interface Citation {
  title: string;
  url: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  llmSource?: string;
  skillsUsed?: string[];
  isStreaming?: boolean;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Scale,
    label: 'SEBI Compliance',
    prompt: 'What are the latest SEBI compliance requirements for investment advisors?',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    icon: Shield,
    label: 'KYC/AML',
    prompt: 'Explain KYC/AML regulations in India for financial institutions',
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    icon: BookOpen,
    label: 'Investor Protection',
    prompt: 'What is the SEBI Investor Protection framework and how does it work?',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    icon: FileText,
    label: 'RBI Guidelines',
    prompt: 'How do I ensure compliance with RBI guidelines for digital lending?',
    color: '#dc2626',
    bg: '#fef2f2',
  },
];

const SKILL_BADGES: Record<string, { label: string; color: string }> = {
  regulatory_assistance: { label: 'Regulatory', color: '#2563eb' },
  regulatory_rag: { label: 'RAG', color: '#2563eb' },
  'local-rag': { label: 'Local KB', color: '#059669' },
  'azure-ai-search': { label: 'Azure Search', color: '#7c3aed' },
  portfolio_analysis: { label: 'Portfolio', color: '#059669' },
  risk_assessment: { label: 'Risk', color: '#dc2626' },
  stock_recommendation: { label: 'Stocks', color: '#7c3aed' },
};

export function RegulatoryAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder AI message with streaming state
    const aiPlaceholderId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: aiPlaceholderId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const response: ChatResponse = await chatService.sendMessage({
        message: text,
        session_id: sessionId,
        context: {
          force_regulatory_rag: true,
          assistant_scope: 'indian_financial_regulation',
        },
      });

      if (!sessionId) {
        setSessionId(response.session_id);
      }

      const citations: Citation[] | undefined = response.citations?.map((c) => ({
        title: c.title || c.source || 'Regulatory source',
        url: c.source_url || c.url || (c.page ? `#source-${c.page}` : '#'),
      }));

      // Replace placeholder with real response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiPlaceholderId
            ? {
                ...m,
                content: response.response,
                citations: citations?.length ? citations : undefined,
                llmSource: response.llm_source,
                skillsUsed: response.skills_used,
                isStreaming: false,
              }
            : m
        )
      );
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorText =
        apiError.response?.data?.detail ||
        apiError.message ||
        'Unable to reach the AI service. Please check that the backend is running.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiPlaceholderId
            ? {
                ...m,
                content: `⚠️ ${errorText}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(undefined);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering: bold, headers, lists, code
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.*$)/gm, '<h4 class="text-[13px] font-bold text-gray-900 mt-3 mb-1">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="text-[14px] font-bold text-gray-900 mt-3 mb-1">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="text-[15px] font-bold text-gray-900 mt-3 mb-1.5">$1</h2>')
      .replace(/^- (.*$)/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-blue-400 mt-1 shrink-0">•</span><span>$1</span></div>')
      .replace(/^\d+\. (.*$)/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-blue-500 font-semibold shrink-0">$1.</span><span>$2</span></div>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 text-blue-700 rounded text-[11px] font-mono break-all whitespace-pre-wrap">$1</code>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br/>');
    return html;
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 105px)', background: 'linear-gradient(180deg, #f8fafc 0%, #f0f4f8 100%)' }}>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Empty State — Premium Landing */
          <div className="flex items-center justify-center h-full px-6">
            <div className="max-w-2xl w-full">
              {/* Hero */}
              <div className="text-center mb-10">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                  Regulatory Intelligence
                </h1>
                <p className="text-[14px] text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                  AI-powered compliance assistant backed by SEBI, RBI & Indian financial regulation knowledge base
                </p>
              </div>

              {/* Feature Badges */}
              <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-sm">
                  <Zap size={12} className="text-amber-500" /> Groq LLM
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-sm">
                  <BookOpen size={12} className="text-blue-500" /> RAG Knowledge Base
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-sm">
                  <Shield size={12} className="text-green-500" /> Multi-Agent Skills
                </span>
              </div>

              {/* Suggested Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="group flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: item.bg }}
                    >
                      <item.icon size={16} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: item.color }}>
                        {item.label}
                      </p>
                      <p className="text-[12px] text-gray-600 font-medium leading-snug line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors mt-1 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Bottom hint */}
              <p className="text-center text-[11px] text-gray-400 font-medium mt-6">
                Ask any question about Indian financial regulations, compliance requirements, or investment rules
              </p>
            </div>
          </div>
        ) : (
          /* Message Thread */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                {/* AI Avatar */}
                {message.type === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm">
                    <Bot size={16} className="text-white" />
                  </div>
                )}

                <div className={`max-w-[85%]`}>
                  {/* Message Bubble */}
                  <div
                    className={`${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md shadow-md shadow-blue-500/10'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-md shadow-sm'
                    } px-5 py-3.5 relative break-words overflow-hidden w-full`}
                  >
                    {/* Streaming Indicator */}
                    {message.isStreaming && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium ml-1">Analyzing with RAG pipeline...</span>
                      </div>
                    )}

                    {/* Message Content */}
                    {!message.isStreaming && (
                      <div
                        className={`text-[13px] leading-relaxed break-words ${message.type === 'user' ? 'text-white' : 'text-gray-700'}`}
                        dangerouslySetInnerHTML={
                          message.type === 'ai'
                            ? { __html: renderMarkdown(message.content) }
                            : undefined
                        }
                      >
                        {message.type === 'user' ? <div className="whitespace-pre-wrap">{message.content}</div> : undefined}
                      </div>
                    )}


                  </div>

                  {message.type === 'ai' && message.citations && message.citations.length > 0 && (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">Sources</p>
                      <div className="space-y-1">
                        {message.citations.slice(0, 3).map((citation, idx) => (
                          <a
                            key={`${citation.url}-${idx}`}
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700 hover:text-blue-900"
                          >
                            <ExternalLink size={10} />
                            <span className="truncate">{citation.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta Row */}
                  <div className={`flex items-center gap-2 mt-1.5 ${message.type === 'user' ? 'justify-end' : 'justify-start'} px-1`}>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <Clock size={9} /> {formatTime(message.timestamp)}
                    </span>

                    {/* Skill badges for AI messages */}
                    {message.type === 'ai' && message.skillsUsed && message.skillsUsed.length > 0 && (
                      <>
                        <span className="text-gray-200">·</span>
                        {message.skillsUsed.map((skill) => {
                          const badge = SKILL_BADGES[skill];
                          return badge ? (
                            <span
                              key={skill}
                              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                              style={{ color: badge.color, backgroundColor: badge.color + '10' }}
                            >
                              {badge.label}
                            </span>
                          ) : null;
                        })}
                      </>
                    )}

                    {/* LLM source badge */}
                    {message.type === 'ai' && message.llmSource && message.llmSource !== 'unknown' && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-[9px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          via {message.llmSource}
                        </span>
                      </>
                    )}

                    {/* Copy button for AI messages */}
                    {message.type === 'ai' && !message.isStreaming && message.content && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="text-gray-300 hover:text-gray-500 transition-colors ml-1"
                        title="Copy response"
                      >
                        {copiedId === message.id ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0 ml-3 mt-1 shadow-sm">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area — Premium Design */}
      <div className="border-t border-gray-200/80 bg-white/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {/* Action bar when chat has messages */}
          {!isEmpty && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                >
                  <RotateCcw size={11} /> New Chat
                </button>
              </div>
              {sessionId && (
                <span className="text-[10px] text-gray-300 font-mono">
                  Session: {sessionId.slice(0, 8)}...
                </span>
              )}
            </div>
          )}

          {/* Input Box */}
          <div className="relative flex items-end gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-blue-300 focus-within:shadow-md focus-within:shadow-blue-500/5 transition-all duration-200 px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask a regulatory question..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed min-h-[24px] max-h-[120px] py-0.5 disabled:opacity-50"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <AlertCircle size={9} />
              AI-generated responses. Not legal or financial advice. Verify with official sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
