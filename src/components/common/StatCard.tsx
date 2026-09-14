import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
    text: 'text-blue-900',
  },
  orange: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    text: 'text-amber-950',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600',
    iconColor: 'text-white',
    text: 'text-emerald-950',
  },
  red: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-600',
    iconColor: 'text-white',
    text: 'text-rose-950',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
    text: 'text-amber-950',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    text: 'text-purple-950',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-700',
    iconColor: 'text-white',
    text: 'text-slate-900',
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
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-lg p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-400">vs yesterday</span>
            </div>
          )}
        </div>

        <div className={`p-2.5 rounded-lg ${c.iconBg} ${c.iconColor} shadow-xs shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
          {badge}
        </span>
      )}
    </div>
  );
};
