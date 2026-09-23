import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, Sparkles, X, Maximize2, Flame } from 'lucide-react';
import { AIAgentChatView } from './AIAgentChatView';

export const FloatingAIAssistant: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // If already on the dedicated full-page AI Agent view, don't show the floating widget
  if (activeView === 'ai_agent') {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white p-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group border border-orange-400/40"
          title="Open AI Godown Operations Agent"
          aria-label="Open AI Operations Agent"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-orange-600 animate-pulse" />
          </div>
          <span className="font-extrabold text-xs hidden sm:inline-block pr-1 tracking-tight">
            AI Agent
          </span>
        </button>
      )}

      {/* Floating Slide-over / Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-5 bg-slate-950/40 backdrop-blur-2xs animate-fade-in">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Container */}
          <div className="relative z-10 w-full sm:w-[540px] md:w-[600px] h-[92vh] sm:h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
            {/* Quick Header Bar */}
            <div className="h-12 bg-slate-950 text-white px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                  <Flame className="w-4 h-4 fill-white" />
                </div>
                <div className="text-xs font-bold truncate">
                  AI Godown Agent · Live Quick Assistant
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveView('ai_agent');
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Expand to Full Page"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat View Content */}
            <div className="flex-1 p-3 overflow-hidden">
              <AIAgentChatView />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
