import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Languages, Globe } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'compact' | 'pill' | 'full';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold border transition-colors ${
          language === 'bn'
            ? 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
        } ${className}`}
        title="Switch Language / ভাষা পরিবর্তন করুন"
      >
        <Globe className="w-3.5 h-3.5 text-orange-600" />
        <span>{language === 'bn' ? 'বাংলা' : 'English'}</span>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-2xs ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{t('app.switch_language')}</div>
            <div className="text-[11px] text-slate-500">
              {language === 'bn' ? 'বর্তমান ভাষা: বাংলা' : 'Current Language: English'}
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('bn')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              language === 'bn'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>
    );
  }

  // Default 'pill' variant (ideal for TopBar header)
  return (
    <div
      className={`inline-flex items-center bg-slate-100/90 hover:bg-slate-200/80 p-0.5 rounded-md border border-slate-200 text-xs select-none transition-colors ${className}`}
      title="Toggle between English and বাংলা"
    >
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
          language === 'en'
            ? 'bg-white text-slate-900 shadow-2xs'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('bn')}
        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
          language === 'bn'
            ? 'bg-orange-600 text-white shadow-2xs'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        বাং
      </button>
    </div>
  );
};
