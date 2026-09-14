import React from 'react';

export const PaymentStatusBadge: React.FC<{ status: 'paid' | 'partial' | 'due' | 'cancelled' | 'returned' }> = ({ status }) => {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Paid
        </span>
      );
    case 'partial':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Partial
        </span>
      );
    case 'due':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          Due
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 line-through">
          Cancelled
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Returned
        </span>
      );
    default:
      return null;
  }
};

export const CylinderDueBadge: React.FC<{ count: number; label?: string }> = ({ count, label = 'due' }) => {
  if (count === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
        0 {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
      {count} {label}
    </span>
  );
};

export const StockStatusBadge: React.FC<{ current: number; min: number }> = ({ current, min }) => {
  if (current <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        Out of Stock
      </span>
    );
  }
  if (current <= min) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        Low Stock ({current})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      Adequate ({current})
    </span>
  );
};

export const CustomerTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { label: string; class: string }> = {
    dealer: { label: 'Dealer', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    retail_shop: { label: 'Retail Shop', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    restaurant: { label: 'Restaurant', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    hotel: { label: 'Hotel', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    commercial: { label: 'Commercial', class: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const c = map[type] || { label: type, class: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${c.class}`}>
      {c.label}
    </span>
  );
};
