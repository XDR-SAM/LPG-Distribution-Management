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
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          {labels.paid}
        </span>
      );
    case 'partial':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
          {labels.partial}
        </span>
      );
    case 'due':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          {labels.due}
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 line-through">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {labels.cancelled}
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        {displayCount} {displayLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300/70 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
      {displayCount} {displayLabel}
    </span>
  );
};

export const StockStatusBadge: React.FC<{ current: number; min: number }> = ({ current, min }) => {
  const { language } = useLanguage();
  const displayCurrent = language === 'bn' ? toBanglaDigits(current) : current;

  if (current <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
        {language === 'bn' ? 'মজুদ শেষ' : 'Out of Stock'}
      </span>
    );
  }
  if (current <= min) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        {language === 'bn' ? `মজুদ স্বল্প (${displayCurrent})` : `Low Stock (${displayCurrent})`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      {language === 'bn' ? `পর্যাপ্ত (${displayCurrent})` : `Adequate (${displayCurrent})`}
    </span>
  );
};

export const CustomerTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const { language } = useLanguage();

  const map: Record<string, { labelEn: string; labelBn: string; class: string; dot: string }> = {
    dealer: { labelEn: 'Dealer', labelBn: 'ডিলার', class: 'bg-blue-50/80 text-blue-800 border-blue-200/70', dot: 'bg-blue-600' },
    retail_shop: { labelEn: 'Retail Shop', labelBn: 'খুচরা দোকান', class: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/70', dot: 'bg-emerald-600' },
    restaurant: { labelEn: 'Restaurant', labelBn: 'রেস্তোরাঁ', class: 'bg-orange-50/80 text-orange-800 border-orange-200/70', dot: 'bg-orange-600' },
    hotel: { labelEn: 'Hotel', labelBn: 'হোটেল', class: 'bg-purple-50/80 text-purple-800 border-purple-200/70', dot: 'bg-purple-600' },
    commercial: { labelEn: 'Commercial', labelBn: 'বাণিজ্যিক', class: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-600' },
  };

  const item = map[type];
  const label = item ? (language === 'bn' ? item.labelBn : item.labelEn) : type;
  const cls = item ? item.class : 'bg-slate-100 text-slate-700 border-slate-200';
  const dotCls = item ? item.dot : 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotCls} shrink-0`} />
      {label}
    </span>
  );
};
