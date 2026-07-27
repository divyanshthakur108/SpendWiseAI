import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  parseExpenseAPI,
  getMonthlyInsightsAPI,
  getBudgetAdviceAPI,
  sendAIChatMessageAPI,
} from '../services/aiService';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  Zap,
  BrainCircuit,
  HelpCircle,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'How much did I spend this month?',
  'How much income did I receive?',
  'What is my highest expense category?',
  'Show my recent transactions.',
  'How much have I saved?',
  'How much budget remains?',
  'Which category increased the most?',
  'What was my largest expense?',
  'Compare this month with last month.',
  'How can I save more?',
];

const FormatMarkdownText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const lineContent = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0F172A]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-sm text-[#DC2626] mt-2 mb-1">
              {line.replace('### ', '')}
            </h4>
          );
        }

        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 my-0.5 pl-1">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>{lineContent}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={idx} className="flex items-start space-x-2 my-0.5 pl-1">
              <span className="text-[#F97316] font-semibold">{line.split(' ')[0]}</span>
              <span>{lineContent}</span>
            </div>
          );
        }

        return (
          <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
            {lineContent}
          </p>
        );
      })}
    </div>
  );
};

const AIInsights = () => {
  const [nlInput, setNlInput] = useState('');
  const [nlLoading, setNlLoading] = useState(false);

  const [insights, setInsights] = useState('');
  const [summary, setSummary] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [adviceList, setAdviceList] = useState([]);
  const [adviceLoading, setAdviceLoading] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your SpendWise AI Financial Assistant. Ask me anything about your monthly spend, top categories, recent transactions, or budget limits.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [toast, setToast] = useState('');
  const chatBottomRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await getMonthlyInsightsAPI();
      if (res && res.success) {
        setInsights(res.insights);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load AI insights', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchAdvice = async () => {
    setAdviceLoading(true);
    try {
      const res = await getBudgetAdviceAPI();
      if (res && res.success) {
        setAdviceList(res.warnings || []);
      }
    } catch (err) {
      console.error('Failed to load AI budget advice', err);
    } finally {
      setAdviceLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    fetchAdvice();
  }, []);

  const handleParseNL = async (e) => {
    e.preventDefault();
    if (!nlInput.trim()) return;

    setNlLoading(true);
    try {
      const res = await parseExpenseAPI(nlInput.trim());
      if (res && res.success) {
        showToast(
          `AI Created Expense: "${res.data.description}" ($${res.data.amount}) under ${res.data.category}`
        );
        setNlInput('');
        fetchInsights();
        fetchAdvice();
      }
    } catch (err) {
      console.error('Error parsing expense', err);
      alert('Failed to parse natural language expense');
    } finally {
      setNlLoading(false);
    }
  };

  const handleSendChat = async (messageToSend) => {
    const text = messageToSend || chatInput;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageToSend) setChatInput('');
    setChatLoading(true);

    try {
      const res = await sendAIChatMessageAPI(text.trim());
      if (res && res.success) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: res.reply }]);
      }
    } catch (err) {
      console.error('Error in AI chat', err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: 'Apologies, I encountered an issue accessing your financial records. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0] mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-[#DC2626]" />
            <span>AI Copilot & Financial Intelligence</span>
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            Real-time MongoDB financial queries, natural language entry, and intelligent AI assistance.
          </p>
        </div>
      </div>

      {/* 1. Natural Language Expense Input */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FEF2F2] via-white to-[#F0FDFA] border border-[#FECACA] shadow-[0_8px_24px_rgba(220,38,38,0.08)] space-y-3">
        <div className="flex items-center space-x-2 text-[#DC2626] text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4 text-[#F59E0B]" />
          <span>Natural Language Expense Input</span>
        </div>

        <form onSubmit={handleParseNL} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder='Try: "I spent $45 on pizza yesterday" or "Earned $500 from freelance today"'
              className="w-full px-4 py-3 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={nlLoading || !nlInput.trim()}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            {nlLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Auto Create Expense</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Grid: AI Insights + Budget Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Monthly AI Insights */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-bold text-[#0F172A]">Monthly AI Spending Analysis</h3>
          </div>

          {insightsLoading ? (
            <div className="p-8 text-center text-xs text-[#64748B] flex flex-col items-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
              <span>Generating personalized insights from MongoDB...</span>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#64748B] font-medium">Top Expense Category</span>
                  <span className="font-bold text-[#DC2626]">{summary?.highestCategory || 'None'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#64748B] font-medium">Top Category Spend</span>
                  <span className="font-extrabold text-[#0F172A]">{formatCurrency(summary?.highestCategoryAmount)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#334155]">
                <FormatMarkdownText text={insights} />
              </div>
            </div>
          )}
        </div>

        {/* 3. Budget Advice & Alerts */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-base font-bold text-[#0F172A]">AI Budget Advice & Alerts</h3>
          </div>

          {adviceLoading ? (
            <div className="p-8 text-center text-xs text-[#64748B] flex flex-col items-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
              <span>Evaluating threshold warnings...</span>
            </div>
          ) : adviceList.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-[#22C55E] mx-auto" />
              <p className="text-xs font-bold text-[#0F172A]">All Budgets Within Safe Limits</p>
              <p className="text-[11px] text-[#475569]">
                No active monthly budgets have exceeded the 80% threshold.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {adviceList.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-1.5 text-xs ${
                    item.level === 'critical'
                      ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                      : item.level === 'warning'
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]'
                      : 'bg-[#FFFBEB] border-[#FDE68A] text-[#CA8A04]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{item.message}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-white/60 border border-current/20">
                      {item.percentage}% Spent
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">💡 <strong>AI Advice:</strong> {item.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. AI Chatbot */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#F97316] flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">SpendWise AI Financial Assistant</h3>
              <p className="text-[11px] text-[#475569]">Ask questions about your live transactions, categories, and savings</p>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChat(prompt)}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#DC2626] hover:bg-[#FEF2F2] text-[#334155] text-xs transition-all flex items-center space-x-1.5 hover:text-[#DC2626] font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-gradient-to-tr from-[#DC2626] to-[#F97316] text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-xl text-xs max-w-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#DC2626] text-white rounded-tr-none font-medium'
                    : 'bg-white border border-[#E2E8F0] text-[#334155] rounded-tl-none shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  msg.text
                ) : (
                  <FormatMarkdownText text={msg.text} />
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#F97316] flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#64748B] flex items-center space-x-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#DC2626]" />
                <span>SpendWise AI is querying your data...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask AI anything (e.g. 'How much did I spend this month?')"
            className="flex-1 px-4 py-3 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
