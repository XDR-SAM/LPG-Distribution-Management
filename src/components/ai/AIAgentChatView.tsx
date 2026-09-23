import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Flame, 
  ArrowRight, 
  RotateCcw, 
  Cpu, 
  Settings, 
  User, 
  Check, 
  Copy, 
  FileText, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Receipt,
  Truck,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  ChatMessage, 
  AgentAction, 
  GeminiModel, 
  LLMProvider,
  Sale 
} from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { 
  buildDatabaseSnapshot, 
  sendChatMessageToAgent, 
  executeAgentAction 
} from '../../services/aiAgentService';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `👋 **Assalamu Alaikum! I am your AI Godown Operations Agent for LPG Manager BD.**

I have real-time live access to your godown database:
- 📦 **Inventory & Cylinders:** Live counts of full, empty, and damaged cylinders across all brands.
- 👥 **Customers & Dues:** Credit balances, cylinder holding counts, and customer ledgers.
- 💰 **Cashbook & Accounts:** Real-time balances in Cash in Hand, bKash, and Bank accounts.
- ⚡ **Action Execution:** You can tell me to **create sales**, **record payments**, **adjust stock**, **add expenses**, or **receive empty cylinders** directly via chat!

How can I assist you with Mohammadpur Godown operations today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  modelUsed: 'gemini-3.5-flash',
  providerUsed: 'gemini',
};

export const AIAgentChatView: React.FC = () => {
  const {
    settings,
    updateSettings,
    products,
    customers,
    suppliers,
    sales,
    transactions,
    bercPrices,
    addSale,
    receivePayment,
    adjustStock,
    receiveEmptyCylinders,
    addExpense,
    addCustomer,
    makeSupplierPayment,
    sendEmptyToSupplier,
    currentUser,
    setPrintSale,
    setActiveView,
  } = useApp();

  // Load chat history from localStorage or fallback
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('LPG_AI_CHAT_HISTORY_V1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved chat history:', e);
    }
    return [INITIAL_GREETING];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Model switch state
  const aiSettings = settings.aiSettings || {
    provider: 'gemini' as LLMProvider,
    geminiModel: 'gemini-3.5-flash' as GeminiModel,
    openaiConfig: { baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o-mini' },
    agentRole: 'Senior Godown Operations Manager & Database Agent',
    autoExecuteActions: true,
  };

  const [selectedGeminiModel, setSelectedGeminiModel] = useState<GeminiModel>(aiSettings.geminiModel || 'gemini-3.5-flash');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save chat to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('LPG_AI_CHAT_HISTORY_V1', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat history:', e);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleModelChange = (model: GeminiModel) => {
    setSelectedGeminiModel(model);
    updateSettings({
      aiSettings: {
        ...aiSettings,
        geminiModel: model,
      },
    });
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputPrompt).trim();
    if (!textToSend || isLoading) return;

    setInputPrompt('');
    setErrorStatus(null);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // 1. Build live database snapshot
      const dbSnapshot = buildDatabaseSnapshot({
        settings,
        products,
        customers,
        suppliers,
        sales,
        transactions,
        bercPrices,
      });

      // 2. Call backend AI API
      const result = await sendChatMessageToAgent({
        messages: newHistory,
        aiSettings: {
          ...aiSettings,
          geminiModel: selectedGeminiModel,
        },
        databaseContext: dbSnapshot,
      });

      let actionResult: AgentAction | undefined = undefined;

      // 3. If action was produced by the agent, execute or mark pending
      if (result.action) {
        actionResult = { ...result.action };

        if (aiSettings.autoExecuteActions) {
          const exec = executeAgentAction(actionResult, {
            products,
            customers,
            suppliers,
            addSale,
            receivePayment,
            adjustStock,
            receiveEmptyCylinders,
            addExpense,
            addCustomer,
            makeSupplierPayment,
            sendEmptyToSupplier,
            settings,
            currentUser,
          });

          actionResult.status = exec.success ? 'executed' : 'failed';
          actionResult.resultMessage = exec.message;
          actionResult.resultData = exec.data;
          actionResult.executedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: result.modelUsed,
        providerUsed: result.providerUsed as LLMProvider,
        action: actionResult,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorStatus(err.message || 'Failed to communicate with AI provider.');
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ **Connection Notice:** ${err.message || 'Could not reach server-side AI provider.'}\n\nPlease verify your network or check settings in **Settings > AI Agent & LLM Provider**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualExecuteAction = (msgId: string, action: AgentAction) => {
    const exec = executeAgentAction(action, {
      products,
      customers,
      suppliers,
      addSale,
      receivePayment,
      adjustStock,
      receiveEmptyCylinders,
      addExpense,
      addCustomer,
      makeSupplierPayment,
      sendEmptyToSupplier,
      settings,
      currentUser,
    });

    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.action) {
          return {
            ...m,
            action: {
              ...m.action,
              status: exec.success ? 'executed' : 'failed',
              resultMessage: exec.message,
              resultData: exec.data,
              executedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          };
        }
        return m;
      })
    );
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation history?')) {
      setMessages([INITIAL_GREETING]);
      localStorage.removeItem('LPG_AI_CHAT_HISTORY_V1');
    }
  };

  const handleExportChat = () => {
    const text = messages
      .map(m => `[${m.timestamp}] ${m.role === 'user' ? 'YOU' : 'AI AGENT'}:\n${m.content}\n${m.action ? `[ACTION: ${m.action.type}] ${m.action.resultMessage || ''}\n` : ''}`)
      .join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LPG_AI_Chat_Log_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick prompt suggestions
  const SUGGESTED_PROMPTS = [
    { label: '📦 Stock levels for 12kg', text: 'What is our current full, empty, and damaged stock count for 12kg cylinders across all brands?' },
    { label: '💰 Top overdue customers', text: 'Which customers currently have the highest outstanding due balance? Show their phone numbers and amounts.' },
    { label: '📊 Today\'s cashbook & sales', text: 'Give me a brief summary of today\'s total sales, cash collections, and available funds in Cash and bKash.' },
    { label: '🛒 Sell 5 Bashundhara 12kg', text: 'Create a sale of 5 Bashundhara 12kg cylinders to Kalam Store for 7,000 tk cash with 5 empties exchanged.' },
    { label: '💵 Receive ৳10,000 payment', text: 'Receive 10,000 BDT payment from Bismillah Hotel via bKash to reduce their due.' },
    { label: '⚠️ Mark 2 leaking cylinders', text: 'Adjust inventory: mark 2 Omera 12kg cylinders as damaged due to pinhole gas leak.' },
    { label: '⛽ Record ৳1,500 fuel expense', text: 'Record 1,500 BDT expense for truck diesel fuel paid from Cash in Hand.' },
  ];

  // Live database totals for header strip
  const totalFullStock = products.reduce((acc, p) => acc + (p.fullStock || 0), 0);
  const totalEmptyStock = products.reduce((acc, p) => acc + (p.emptyStock || 0), 0);
  const totalCustomerDue = customers.reduce((acc, c) => acc + (c.currentDue || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-6xl mx-auto space-y-3">
      {/* Top Header Card & Model Switcher */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                AI Godown Operations Agent
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live DB Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Intelligent conversational assistant with full read/write database actions for Mohammadpur Godown.
            </p>
          </div>
        </div>

        {/* Model Switcher & Utility Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {aiSettings.provider === 'gemini' ? (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleModelChange('gemini-3.5-flash')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  selectedGeminiModel === 'gemini-3.5-flash'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gemini 3.5 Flash: Recommended for general tasks"
              >
                3.5 Flash
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  selectedGeminiModel === 'gemini-3.1-flash-lite'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gemini 3.1 Flash-Lite: Fast tasks & quick queries"
              >
                3.1 Lite
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('gemini-3.1-pro-preview')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  selectedGeminiModel === 'gemini-3.1-pro-preview'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gemini 3.1 Pro Preview: Complex reasoning & audits"
              >
                3.1 Pro
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
              OpenAI: {aiSettings.openaiConfig.model}
            </span>
          )}

          <button
            type="button"
            onClick={handleExportChat}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="AI & LLM Provider Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Context Metric Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-600 shrink-0">
        <div className="flex flex-wrap items-center gap-3 font-medium">
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-orange-600" />
            Full Cylinders: <strong className="text-slate-900">{totalFullStock}</strong>
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            Empty in Godown: <strong className="text-slate-900">{totalEmptyStock}</strong>
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-rose-600" />
            Total Customer Due: <strong className="text-slate-900">৳{totalCustomerDue.toLocaleString()}</strong>
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono hidden md:block">
          Provider: {aiSettings.provider === 'gemini' ? `Google Gemini (${selectedGeminiModel})` : `OpenAI (${aiSettings.openaiConfig.model})`}
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 sm:p-4 overflow-y-auto space-y-4 shadow-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 font-black shadow-xs">
                <Flame className="w-4 h-4 fill-white" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              {/* Header meta */}
              <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2 border-slate-200/40 text-[10px] opacity-75">
                <span className="font-bold flex items-center gap-1">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {msg.role === 'user' ? 'You' : 'LPG Godown Agent'}
                  {msg.modelUsed && (
                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-slate-200 text-slate-700">
                      {msg.modelUsed}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>{msg.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.id, msg.content)}
                    className="p-1 hover:opacity-100 opacity-60 transition-opacity"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Message text with rich Markdown formatting */}
              <div className="font-sans select-text">
                <MarkdownRenderer
                  content={msg.content}
                  isDark={msg.role === 'user'}
                  className={msg.role === 'user' ? 'text-white' : 'text-slate-800'}
                />
              </div>

              {/* Action Execution Card (when an action was parsed) */}
              {msg.action && (
                <div className="mt-3 pt-3 border-t border-slate-200/80">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {msg.action.type}
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          Database Action
                        </span>
                      </div>
                      {msg.action.status === 'executed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Executed in DB
                        </span>
                      ) : msg.action.status === 'failed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Execution Failed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Confirmation
                        </span>
                      )}
                    </div>

                    {msg.action.resultMessage && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                        {msg.action.resultMessage}
                      </p>
                    )}

                    {/* Pending Action Confirmation Trigger */}
                    {msg.action.status === 'pending' && (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleManualExecuteAction(msg.id, msg.action!)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm & Apply to Database</span>
                        </button>
                      </div>
                    )}

                    {/* Action Deep-Link Buttons */}
                    {msg.action.status === 'executed' && msg.action.resultData && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {msg.action.type === 'CREATE_SALE' && msg.action.resultData.invoiceNo && (
                          <button
                            type="button"
                            onClick={() => {
                              setPrintSale(msg.action!.resultData as Sale);
                            }}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md font-bold text-[10px] border border-orange-200 flex items-center gap-1 transition-colors"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Print / View Invoice ({msg.action.resultData.invoiceNo})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (msg.action?.type === 'CREATE_SALE') setActiveView('sales_list');
                            else if (msg.action?.type === 'RECEIVE_PAYMENT') setActiveView('money_receipt');
                            else if (msg.action?.type === 'ADJUST_STOCK') setActiveView('stock_movements');
                            else if (msg.action?.type === 'ADD_EXPENSE') setActiveView('expenses');
                            else if (msg.action?.type === 'ADD_CUSTOMER') setActiveView('customer_list');
                            else if (msg.action?.type === 'MAKE_SUPPLIER_PAYMENT') setActiveView('supplier_payment');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open View</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 font-black shadow-xs animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-xs p-3 text-xs text-slate-600 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 animate-spin text-orange-600" />
              <span>Agent is querying godown database & reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
          Suggestions:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt.text)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full shrink-0 text-[11px] font-medium transition-colors shadow-2xs hover:border-slate-300 disabled:opacity-50"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Input Composer Card */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about godown stock, customers, dues, or command: 'Sell 5 12kg cylinders to Kalam Store'..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none pr-3"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="h-10 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>Agent can read inventory, dues, cashbooks and write sales, receipts, expenses.</span>
          </div>
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
