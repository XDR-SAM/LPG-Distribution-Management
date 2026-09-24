import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'orange' | 'green' | 'red' | 'amber' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  badge?: string;
}

const colorMap = {
  blue: {
    borderTop: 'border-t-blue-500',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
  },
  orange: {
    borderTop: 'border-t-orange-500',
    iconBg: 'bg-orange-50',
    iconBorder: 'border-orange-100',
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200/60',
  },
  green: {
    borderTop: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
  },
  red: {
    borderTop: 'border-t-rose-500',
    iconBg: 'bg-rose-50',
    iconBorder: 'border-rose-100',
    iconColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/60',
  },
  amber: {
    borderTop: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-100',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/60',
  },
  purple: {
    borderTop: 'border-t-purple-500',
    iconBg: 'bg-purple-50',
    iconBorder: 'border-purple-100',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/60',
  },
  slate: {
    borderTop: 'border-t-slate-500',
    iconBg: 'bg-slate-100',
    iconBorder: 'border-slate-200',
    iconColor: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
  badge,
}) => {
  const { language } = useLanguage();
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-slate-200/90 border-t-3 ${c.borderTop} rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {title}
            </p>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${c.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums truncate">
            {value}
          </p>
        </div>

        <div className={`p-2.5 rounded-xl border ${c.iconBg} ${c.iconBorder} ${c.iconColor} shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
        {subtitle && (
          <p className="text-slate-500 truncate">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 shrink-0 ml-auto font-semibold">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {language === 'bn' ? 'গতকালকের তুলনায়' : 'vs yesterday'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
