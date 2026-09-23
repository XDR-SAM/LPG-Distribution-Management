import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Sparkles, 
  Cpu, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  Layers, 
  ShieldAlert, 
  Check, 
  Eye, 
  EyeOff,
  Zap,
  Flame,
  HelpCircle
} from 'lucide-react';
import { AISettings, LLMProvider, GeminiModel } from '../../types';

export const AIAgentSettingsPanel: React.FC = () => {
  const { settings, updateSettings, t } = useApp();

  const currentAISettings: AISettings = settings.aiSettings || {
    provider: 'gemini',
    geminiModel: 'gemini-3.5-flash',
    openaiConfig: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
    },
    agentRole: 'Senior Godown Operations Manager & Database Agent for Bangladesh LPG distribution business.',
    autoExecuteActions: true,
  };

  const [provider, setProvider] = useState<LLMProvider>(currentAISettings.provider);
  const [geminiModel, setGeminiModel] = useState<GeminiModel>(currentAISettings.geminiModel || 'gemini-3.5-flash');
  const [openAiBaseUrl, setOpenAiBaseUrl] = useState(currentAISettings.openaiConfig?.baseUrl || 'https://api.openai.com/v1');
  const [openAiApiKey, setOpenAiApiKey] = useState(currentAISettings.openaiConfig?.apiKey || '');
  const [openAiModel, setOpenAiModel] = useState(currentAISettings.openaiConfig?.model || 'gpt-4o-mini');
  const [showKey, setShowKey] = useState(false);
  const [agentRole, setAgentRole] = useState(currentAISettings.agentRole || '');
  const [autoExecute, setAutoExecute] = useState(currentAISettings.autoExecuteActions ?? true);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAI: AISettings = {
      provider,
      geminiModel,
      openaiConfig: {
        baseUrl: openAiBaseUrl.trim() || 'https://api.openai.com/v1',
        apiKey: openAiApiKey.trim(),
        model: openAiModel.trim() || 'gpt-4o-mini',
      },
      agentRole: agentRole.trim(),
      autoExecuteActions: autoExecute,
    };

    updateSettings({
      aiSettings: updatedAI,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Connecting to server-side AI provider...');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Ping! Respond with the single word "CONNECTED".' }],
          provider,
          model: provider === 'gemini' ? geminiModel : openAiModel,
          openaiConfig: {
            baseUrl: openAiBaseUrl,
            apiKey: openAiApiKey,
            model: openAiModel,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Connection failed' }));
        throw new Error(data.error || `Server returned error ${res.status}`);
      }

      const data = await res.json();
      setTestStatus('success');
      setTestMessage(`Success! Response received from ${data.provider} (${data.model}): "${data.reply?.slice(0, 50)}..."`);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection test failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset AI Agent settings to default Google Gemini configuration?')) {
      setProvider('gemini');
      setGeminiModel('gemini-3.5-flash');
      setOpenAiBaseUrl('https://api.openai.com/v1');
      setOpenAiApiKey('');
      setOpenAiModel('gpt-4o-mini');
      setAgentRole('Senior Godown Operations Manager & Database Agent for Bangladesh LPG distribution business.');
      setAutoExecute(true);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-4xl text-xs">
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>AI Agent settings saved and active across the system!</span>
        </div>
      )}

      {/* Main Provider Selection */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">LLM Provider Selection</h3>
              <p className="text-slate-500 text-[11px]">
                Choose the underlying intelligence provider powering your LPG Godown Agent.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            Active: {provider === 'gemini' ? 'Google Gemini' : 'OpenAI Compatible'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Google Gemini */}
          <div
            onClick={() => setProvider('gemini')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'gemini'
                ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Google Gemini</h4>
                  <span className="text-[10px] text-orange-600 font-semibold">Recommended · Server-Side Native</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                provider === 'gemini' ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'
              }`}>
                {provider === 'gemini' && <Check className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
              Utilizes Google's Gemini models directly via backend SDK (@google/genai) with zero browser API key exposure. Fast, reliable, and optimized for complex database queries.
            </p>
          </div>

          {/* Option 2: OpenAI Compatible */}
          <div
            onClick={() => setProvider('openai')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'openai'
                ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">OpenAI Compatible (ChatGPT)</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold">ChatGPT / Ollama / Groq / DeepSeek</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                provider === 'openai' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
              }`}>
                {provider === 'openai' && <Check className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
              Connect to OpenAI (GPT-4o, GPT-4o-mini) or any custom OpenAI-compatible endpoint like local Ollama, Groq, DeepSeek, or private gateway.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Details Card */}
      {provider === 'gemini' ? (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-orange-600" />
            <span>Google Gemini Model Configuration</span>
          </h3>

          <div className="space-y-3">
            <label className="block font-bold text-slate-700">Select Gemini Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Gemini 3.5 Flash */}
              <div
                onClick={() => setGeminiModel('gemini-3.5-flash')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  geminiModel === 'gemini-3.5-flash'
                    ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-orange-600 font-black">
                  <Zap className="w-3.5 h-3.5" />
                  <span>gemini-3.5-flash</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 mt-1">General Tasks (Default)</div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Optimal balance of reasoning and response speed for day-to-day operations.
                </p>
              </div>

              {/* Gemini 3.1 Flash-Lite */}
              <div
                onClick={() => setGeminiModel('gemini-3.1-flash-lite')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  geminiModel === 'gemini-3.1-flash-lite'
                    ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-black">
                  <Zap className="w-3.5 h-3.5" />
                  <span>gemini-3.1-flash-lite</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 mt-1">Fast Tasks</div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Ultra-fast response for instant stock lookups and rapid queries.
                </p>
              </div>

              {/* Gemini 3.1 Pro Preview */}
              <div
                onClick={() => setGeminiModel('gemini-3.1-pro-preview')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  geminiModel === 'gemini-3.1-pro-preview'
                    ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-purple-600 font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>gemini-3.1-pro-preview</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 mt-1">Complex Reasoning</div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Advanced reasoning for complex reconciliation, audits, and multi-step tasks.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Backend Key Status: <strong>Configured securely on server</strong></span>
              </div>
              <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold text-[10px]">
                Ready
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>OpenAI Compatible API Credentials & Endpoint</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                API Base URL (Endpoint) *
              </label>
              <input
                type="text"
                value={openAiBaseUrl}
                onChange={e => setOpenAiBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Default: <code>https://api.openai.com/v1</code>. For Ollama: <code>http://localhost:11434/v1</code>. For Groq: <code>https://api.groq.com/openai/v1</code>.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                OpenAI API Key (or provider Bearer token) *
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={openAiApiKey}
                  onChange={e => setOpenAiApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Required when using OpenAI or cloud proxies (optional for unauthenticated local Ollama).
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Model Identifier *
              </label>
              <input
                type="text"
                value={openAiModel}
                onChange={e => setOpenAiModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'deepseek-chat', 'llama-3.3-70b-versatile'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setOpenAiModel(m)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Behavior & Database Execution Permissions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Agent Database Operations & Persona</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="font-bold text-slate-900">Auto-Execute Database Actions</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When enabled, valid commands like "Sell 5 cylinders to Karim" or "Receive ৳10,000" will immediately create the invoice/receipt in the database and display the transaction confirmation.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={autoExecute}
                onChange={e => setAutoExecute(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Custom Agent Role & Persona
            </label>
            <textarea
              rows={2}
              value={agentRole}
              onChange={e => setAgentRole(e.target.value)}
              placeholder="e.g. Senior Godown Operations Manager & Database Agent for Bangladesh LPG distribution business."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Connection Test Output */}
      {testStatus !== 'idle' && (
        <div className={`p-3 rounded-lg border flex items-start gap-2 text-xs ${
          testStatus === 'testing' ? 'bg-blue-50 border-blue-200 text-blue-800' :
          testStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' :
          'bg-rose-50 border-rose-200 text-rose-800 font-semibold'
        }`}>
          {testStatus === 'testing' && <RotateCcw className="w-4 h-4 animate-spin text-blue-600 shrink-0 mt-0.5" />}
          {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          <div>
            <span>{testMessage}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Test Connection</span>
          </button>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save AI Settings</span>
        </button>
      </div>
    </form>
  );
};
