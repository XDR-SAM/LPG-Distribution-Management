import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, toBanglaDigits } from '../utils/translations';
import { formatBDT as standardFormatBDT, formatNumber as standardFormatNumber, formatDate as standardFormatDate } from '../utils/formatters';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  toBnNum: (input: number | string | null | undefined) => string;
  formatCurrency: (amount: number | null | undefined, forceBanglaDigits?: boolean) => string;
  formatQty: (num: number | null | undefined, forceBanglaDigits?: boolean) => string;
  formatDisplayDate: (dateStr: string | Date | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'lpg_manager_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      // localStorage unavailable or restricted
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    } catch (e) {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
    } catch (e) {}
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const formatCurrency = (amount: number | null | undefined, forceBanglaDigits = false): string => {
    const formatted = standardFormatBDT(amount);
    if (forceBanglaDigits || language === 'bn') {
      return toBanglaDigits(formatted);
    }
    return formatted;
  };

  const formatQty = (num: number | null | undefined, forceBanglaDigits = false): string => {
    const formatted = standardFormatNumber(num);
    if (forceBanglaDigits || language === 'bn') {
      return toBanglaDigits(formatted);
    }
    return formatted;
  };

  const formatDisplayDate = (dateStr: string | Date | null | undefined): string => {
    const formatted = standardFormatDate(dateStr);
    if (language === 'bn') {
      // Map English short month names to Bengali
      const monthMap: Record<string, string> = {
        'Jan': 'জানু',
        'Feb': 'ফেব্রু',
        'Mar': 'মার্চ',
        'Apr': 'এপ্রিল',
        'May': 'মে',
        'Jun': 'জুন',
        'Jul': 'জুলাই',
        'Aug': 'আগস্ট',
        'Sep': 'সেপ্টে',
        'Oct': 'অক্টো',
        'Nov': 'নভে',
        'Dec': 'ডিসে',
      };
      let bnDate = formatted;
      Object.entries(monthMap).forEach(([enMonth, bnMonth]) => {
        bnDate = bnDate.replace(enMonth, bnMonth);
      });
      return toBanglaDigits(bnDate);
    }
    return formatted;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        toBnNum: toBanglaDigits,
        formatCurrency,
        formatQty,
        formatDisplayDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
