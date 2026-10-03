import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Sparkles, 
  Cpu, 
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
  RefreshCw,
  Server
} from 'lucide-react';
import { AISettings, LLMProvider, GeminiModel } from '../../types';


interface GroqPreset {
  id: string;
  name: string;
  tag: string;
  provider: 'OpenAI' | 'Alibaba Cloud' | 'Canopy Labs' | 'Meta' | 'Other';
}

const GROQ_PRESETS: GroqPreset[] = [
  { id: 'openai/gpt-oss-120b', name: 'OpenAI GPT-OSS 120B', tag: 'Flagship Intelligence (Recommended)', provider: 'OpenAI' },
  { id: 'openai/gpt-oss-20b', name: 'OpenAI GPT-OSS 20B', tag: 'Fast Reasoning & Chat (Example)', provider: 'OpenAI' },
  { id: 'openai/gpt-oss-safeguard-20b', name: 'OpenAI GPT-OSS Safeguard 20B', tag: 'Safeguard Guardrails', provider: 'OpenAI' },
  { id: 'qwen/qwen3.8-27b', name: 'Alibaba Cloud Qwen 3.8 27B', tag: 'Multilingual & Code Reasoning', provider: 'Alibaba Cloud' },
  { id: 'canopylabs/orpheus-v1-english', name: 'Canopy Labs Orpheus v1 (English)', tag: 'English Audio / Text Specialist', provider: 'Canopy Labs' },
  { id: 'canopylabs/orpheus-arabic-saudi', name: 'Canopy Labs Orpheus (Arabic)', tag: 'Arabic Conversational Specialist', provider: 'Canopy Labs' },
  { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Meta Prompt Guard 86M', tag: 'Prompt Injection Defense', provider: 'Meta' },
  { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Meta Prompt Guard 22M', tag: 'Ultra-Lightweight Guard', provider: 'Meta' },
  { id: 'allam-2-7b', name: 'Allam 2 7B', tag: 'Efficient Edge & Language', provider: 'Other' },
];

export const AIAgentSettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const currentAISettings: AISettings = settings.aiSettings || {
    provider: 'groq',
    geminiModel: 'gemini-3.5-flash',
    groqConfig: {
      apiKey: '',
      model: 'openai/gpt-oss-120b',
    },
    openaiConfig: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
    },
    agentRole: 'Senior Godown Operations Manager & Database Agent for Bangladesh LPG distribution business.',
    autoExecuteActions: true,
  };

  const [provider, setProvider] = useState<LLMProvider>(currentAISettings.provider || 'groq');
  
  // Groq State
  const [groqApiKey, setGroqApiKey] = useState(currentAISettings.groqConfig?.apiKey || '');
  const [groqModel, setGroqModel] = useState(currentAISettings.groqConfig?.model || 'openai/gpt-oss-120b');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [liveGroqModels, setLiveGroqModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Gemini State
  const [geminiModel, setGeminiModel] = useState<GeminiModel>(currentAISettings.geminiModel || 'gemini-3.5-flash');

  // OpenAI State
  const [openAiBaseUrl, setOpenAiBaseUrl] = useState(currentAISettings.openaiConfig?.baseUrl || 'https://api.openai.com/v1');
  const [openAiApiKey, setOpenAiApiKey] = useState(currentAISettings.openaiConfig?.apiKey || '');
  const [openAiModel, setOpenAiModel] = useState(currentAISettings.openaiConfig?.model || 'gpt-4o-mini');
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);

  // Agent Persona & Execution
  const [agentRole, setAgentRole] = useState(currentAISettings.agentRole || '');
  const [autoExecute, setAutoExecute] = useState(currentAISettings.autoExecuteActions ?? true);

  // Test & Feedback
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFetchLiveGroqModels = async () => {
    setIsFetchingModels(true);
    try {
      const res = await fetch('/api/ai/groq/models');
      if (!res.ok) {
        throw new Error(`Failed to fetch models: ${res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const ids = data.data.map((m: any) => m.id).sort();
        setLiveGroqModels(ids);
      }
    } catch (err: any) {
      console.warn('Could not fetch dynamic Groq models list:', err);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAI: AISettings = {
      provider,
      geminiModel,
      groqConfig: {
        apiKey: groqApiKey.trim(),
        model: groqModel.trim() || 'openai/gpt-oss-120b',
      },
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
    setTestMessage(`Connecting to ${provider.toUpperCase()} provider...`);

    try {
      const targetModel = provider === 'groq' ? groqModel : provider === 'gemini' ? geminiModel : openAiModel;
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Ping! Respond in one short sentence confirming you are connected and your model name.' }],
          provider,
          model: targetModel,
          groqConfig: {
            apiKey: groqApiKey,
            model: groqModel,
          },
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
      setTestMessage(`Success! Connected to ${data.provider.toUpperCase()} (${data.model}): "${data.reply?.slice(0, 75)}..."`);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection test failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset AI Agent settings to Groq default configuration?')) {
      setProvider('groq');
      setGroqApiKey('');
      setGroqModel('openai/gpt-oss-120b');
      setGeminiModel('gemini-3.5-flash');
      setOpenAiBaseUrl('https://api.openai.com/v1');
      setOpenAiApiKey('');
      setOpenAiModel('gpt-4o-mini');
      setAgentRole('Senior Godown Operations Manager & Database Agent for Bangladesh LPG distribution business.');
      setAutoExecute(true);
    }
  };

  const getProviderBadgeLabel = () => {
    switch (provider) {
      case 'groq':
        return `Active: Groq (${groqModel})`;
      case 'gemini':
        return `Active: Google Gemini (${geminiModel})`;
      case 'openai':
        return `Active: OpenAI (${openAiModel})`;
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-4xl text-xs">
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>AI Agent settings saved! Active provider updated to {provider.toUpperCase()}.</span>
        </div>
      )}

      {/* Main Provider Selection */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">LLM Provider Selection</h3>
              <p className="text-slate-500 text-[11px]">
                Choose the underlying intelligence provider powering your LPG Godown Agent.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-center">
            {getProviderBadgeLabel()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Option 1: Groq LPU */}
          <div
            onClick={() => setProvider('groq')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'groq'
                ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Groq LPU Engine</h4>
                  <span className="text-[10px] text-orange-600 font-semibold">Ultra-Fast · Hardware Accelerated</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                provider === 'groq' ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'
              }`}>
                {provider === 'groq' && <Check className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
              Ultra-fast inference on custom Groq LPUs. Supports OpenAI GPT-OSS (120B/20B), Qwen 3.8, Canopy Orpheus, and Prompt Guard with near-instant responses.
            </p>
          </div>

          {/* Option 2: Google Gemini */}
          <div
            onClick={() => setProvider('gemini')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              provider === 'gemini'
                ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-400'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Google Gemini</h4>
                  <span className="text-[10px] text-blue-600 font-semibold">Server-Side Native (@google/genai)</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                provider === 'gemini' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
              }`}>
                {provider === 'gemini' && <Check className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
              Google's Gemini 3.5 Flash & 3.1 Pro models. Deep contextual understanding with server-side API integration.
            </p>
          </div>

          {/* Option 3: OpenAI Compatible */}
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
                  <h4 className="font-bold text-slate-900 text-xs">OpenAI Compatible</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold">ChatGPT / Ollama / Custom</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                provider === 'openai' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
              }`}>
                {provider === 'openai' && <Check className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
              Connect to OpenAI (GPT-4o, GPT-4o-mini) or any custom OpenAI-compatible endpoint such as local Ollama, DeepSeek, or private proxies.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Details Card: GROQ */}
      {provider === 'groq' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>Groq LPU Acceleration & Model Selector</span>
            </h3>
            <button
              type="button"
              onClick={handleFetchLiveGroqModels}
              disabled={isFetchingModels}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
              <span>{isFetchingModels ? 'Fetching...' : 'Fetch Live Models'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Groq API Key
              </label>
              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqApiKey}
                  onChange={e => setGroqApiKey(e.target.value)}
                  placeholder="Configured on server (or enter custom key)"
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Configured securely on server. Enter a custom key only to override.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Select Groq Model (from available models)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {GROQ_PRESETS.map(preset => {
                  const isSelected = groqModel === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setGroqModel(preset.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 font-bold text-slate-900 shadow-2xs ring-1 ring-orange-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-semibold">
                          {preset.provider}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1 font-mono">
                        {preset.id}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {preset.tag}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Model Input */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1">
                Selected Model Identifier
              </label>
              <input
                type="text"
                value={groqModel}
                onChange={e => setGroqModel(e.target.value)}
                placeholder="openai/gpt-oss-120b"
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* If live models fetched, show quick badges */}
            {liveGroqModels.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-700 text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-orange-600" />
                  <span>All Models Reported Live by Groq API ({liveGroqModels.length}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {liveGroqModels.map(id => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setGroqModel(id)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                        groqModel === id 
                          ? 'bg-orange-600 text-white font-bold' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Details Card: GEMINI */}
      {provider === 'gemini' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-blue-600" />
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
                    ? 'border-blue-500 bg-blue-50/60 font-bold text-slate-900 shadow-2xs ring-1 ring-blue-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-black">
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
                    ? 'border-blue-500 bg-blue-50/60 font-bold text-slate-900 shadow-2xs ring-1 ring-blue-400'
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
                    ? 'border-blue-500 bg-blue-50/60 font-bold text-slate-900 shadow-2xs ring-1 ring-blue-400'
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
      )}

      {/* Provider Details Card: OPENAI COMPATIBLE */}
      {provider === 'openai' && (
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
                Default: <code>https://api.openai.com/v1</code>. For Ollama: <code>http://localhost:11434/v1</code>.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                API Key (Bearer token)
              </label>
              <div className="relative">
                <input
                  type={showOpenAiKey ? 'text' : 'password'}
                  value={openAiApiKey}
                  onChange={e => setOpenAiApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showOpenAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                {['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'deepseek-chat'].map(m => (
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
            className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-orange-600" />
            <span>Test {provider.toUpperCase()} Connection</span>
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
