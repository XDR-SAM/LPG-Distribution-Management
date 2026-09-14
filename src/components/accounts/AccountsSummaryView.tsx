import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Printer, Calendar, ShieldCheck, PieChart, ArrowRight } from 'lucide-react';

export const AccountsSummaryView: React.FC = () => {
  const { sales, purchases, expenses, customers, suppliers } = useApp();

  // Financial aggregates
  const totalSalesRevenue = sales
    .filter(s => s.status !== 'cancelled')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const grossProfit = totalSalesRevenue - totalPurchaseCost;
  const grossMarginPct = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMarginPct = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  const totalReceivables = customers.reduce((sum, c) => sum + c.currentDue, 0);
  const totalPayables = suppliers.reduce((sum, s) => sum + s.currentPayable, 0);

  // Grouped expenses
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Financial Statement & Profit / Loss</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial P&L statement, gross gas distribution margins, operating overheads, and balance sheet summary
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print P&L Statement</span>
        </button>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold block text-[11px] uppercase">Gross Revenue (Sales)</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{formatBDT(totalSalesRevenue)}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Billed LPG cylinders</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-blue-800 font-bold block text-[11px] uppercase">Gross Distribution Margin</span>
          <span className="text-xl font-black text-blue-950 mt-1 block">{formatBDT(grossProfit)}</span>
          <span className="text-[10px] text-blue-700 font-semibold">{grossMarginPct}% gross return</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-rose-800 font-bold block text-[11px] uppercase">Operating Expenses</span>
          <span className="text-xl font-black text-rose-950 mt-1 block">{formatBDT(totalOperatingExpenses)}</span>
          <span className="text-[10px] text-rose-700">Fuel, labor & godown lease</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <span className="text-emerald-800 font-bold block text-[11px] uppercase">Net Operating Profit</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{formatBDT(netProfit)}</span>
          <span className="text-[10px] text-emerald-700 font-bold">{netMarginPct}% net margin</span>
        </div>
      </div>

      {/* Detailed P&L Statement Sheet */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5 print:border-none print:shadow-none print:p-0 text-xs">
        <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Profit & Loss Summary (September 2026)
          </h2>
          <span className="text-slate-400 font-mono text-[11px]">Currency: Bangladeshi Taka (BDT)</span>
        </div>

        <div className="space-y-4">
          {/* Revenue */}
          <div>
            <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900">
              <span>1. Total Sales Revenue (Gross Billed Gas)</span>
              <span>{formatBDT(totalSalesRevenue)}</span>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div>
            <div className="flex justify-between py-1 text-slate-600">
              <span className="pl-4">Cost of Refinery Refills & Purchases</span>
              <span>{formatBDT(totalPurchaseCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-y border-slate-200 font-bold text-slate-900 bg-slate-50/70 px-2">
              <span>Gross Profit (Trading Profit)</span>
              <span className="text-emerald-700 font-extrabold">{formatBDT(grossProfit)}</span>
            </div>
          </div>

          {/* Operating Overhead */}
          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">2. Operating Expenses & Godown Overhead:</span>
            {Object.entries(expensesByCategory).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between py-1 text-slate-600 pl-4">
                <span>• {cat}</span>
                <span>{formatBDT(amt)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 border-t border-slate-200 font-semibold text-slate-700 pl-4">
              <span>Total Operational Costs:</span>
              <span className="text-rose-600 font-bold">({formatBDT(totalOperatingExpenses)})</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="flex justify-between py-3 border-y-2 border-slate-900 font-black text-slate-900 text-sm bg-emerald-50/30 px-3">
            <span>NET COMMERCIAL PROFIT</span>
            <span className="text-emerald-700 text-base">{formatBDT(netProfit)}</span>
          </div>

          {/* Balance Sheet Working Capital Snapshot */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] mb-2">Working Capital & Asset Snapshot</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Accounts Receivable (Customer Dues):</span>
                <span className="text-base font-extrabold text-rose-600 block">{formatBDT(totalReceivables)}</span>
                <span className="text-[10px] text-slate-400">Total trade credit owed by dealers</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Accounts Payable (Supplier Dues):</span>
                <span className="text-base font-extrabold text-blue-700 block">{formatBDT(totalPayables)}</span>
                <span className="text-[10px] text-slate-400">Total dues payable to LPG plant depots</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
