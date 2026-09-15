import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { toBanglaDigits } from '../../utils/translations';

export const PaymentStatusBadge: React.FC<{ status: 'paid' | 'partial' | 'due' | 'cancelled' | 'returned' }> = ({ status }) => {
  const { language } = useLanguage();

  const labels = {
    paid: language === 'bn' ? 'পরিশোধিত' : 'Paid',
    partial: language === 'bn' ? 'আংশিক' : 'Partial',
    due: language === 'bn' ? 'বাকি' : 'Due',
    cancelled: language === 'bn' ? 'বাতিলকৃত' : 'Cancelled',
    returned: language === 'bn' ? 'ফেরতকৃত' : 'Returned',
  };

  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {labels.paid}
        </span>
      );
    case 'partial':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {labels.partial}
        </span>
      );
    case 'due':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          {labels.due}
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 line-through">
          {labels.cancelled}
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          {labels.returned}
        </span>
      );
    default:
      return null;
  }
};

export const CylinderDueBadge: React.FC<{ count: number; label?: string }> = ({ count, label }) => {
  const { language } = useLanguage();
  const displayCount = language === 'bn' ? toBanglaDigits(count) : count;
  const displayLabel = label || (language === 'bn' ? 'বাকি' : 'due');

  if (count === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
        {displayCount} {displayLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
      {displayCount} {displayLabel}
    </span>
  );
};

export const StockStatusBadge: React.FC<{ current: number; min: number }> = ({ current, min }) => {
  const { language } = useLanguage();
  const displayCurrent = language === 'bn' ? toBanglaDigits(current) : current;

  if (current <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        {language === 'bn' ? 'মজুদ শেষ' : 'Out of Stock'}
      </span>
    );
  }
  if (current <= min) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        {language === 'bn' ? `মজুদ স্বল্প (${displayCurrent})` : `Low Stock (${displayCurrent})`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      {language === 'bn' ? `পর্যাপ্ত (${displayCurrent})` : `Adequate (${displayCurrent})`}
    </span>
  );
};

export const CustomerTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const { language } = useLanguage();

  const map: Record<string, { labelEn: string; labelBn: string; class: string }> = {
    dealer: { labelEn: 'Dealer', labelBn: 'ডিলার', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    retail_shop: { labelEn: 'Retail Shop', labelBn: 'খুচরা দোকান', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    restaurant: { labelEn: 'Restaurant', labelBn: 'রেস্তোরাঁ', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    hotel: { labelEn: 'Hotel', labelBn: 'হোটেল', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    commercial: { labelEn: 'Commercial', labelBn: 'বাণিজ্যিক', class: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const item = map[type];
  const label = item ? (language === 'bn' ? item.labelBn : item.labelEn) : type;
  const cls = item ? item.class : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cls}`}>
      {label}
    </span>
  );
};
