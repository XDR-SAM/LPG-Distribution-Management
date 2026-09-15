import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer } from 'lucide-react';

export const DailyReportView: React.FC = () => {
  const { sales, purchases, expenses, moneyReceipts, products, t, formatCurrency, formatDate, formatQty, toBnNum } = useApp();
  const [selectedDate, setSelectedDate] = useState('2026-09-14');

  // Daily filtered records
  const daySales = sales.filter(s => s.date === selectedDate && s.status !== 'cancelled');
  const dayPurchases = purchases.filter(p => p.date === selectedDate);
  const dayReceipts = moneyReceipts.filter(r => r.date === selectedDate);
  const dayExpenses = expenses.filter(e => e.date === selectedDate);

  const daySalesTotal = daySales.reduce((sum, s) => sum + s.grandTotal, 0);
  const dayFullCylindersSold = daySales.reduce((sum, s) => sum + s.totalFullQty, 0);
  const dayEmptiesCollected = daySales.reduce((sum, s) => sum + s.totalEmptyReceived, 0);

  const dayCashCollected =
    daySales.reduce((sum, s) => sum + s.amountPaid, 0) +
    dayReceipts.reduce((sum, r) => sum + r.amount, 0);

  const dayCashOutflow =
    dayPurchases.reduce((sum, p) => sum + p.amountPaid, 0) +
    dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netDayCash = dayCashCollected - dayCashOutflow;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('report.daily_closing_title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('report.daily_closing_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-800"
          />
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{t('report.print_daysheet')}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5 print:border-none print:shadow-none print:p-0 text-xs">
        <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-black text-slate-900">RAHMAN LPG DISTRIBUTION</h2>
            <p className="text-slate-500 text-xs">{t('report.daily_closing_title')} & {t('nav.cashbook')}</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900 text-sm">{formatDate(selectedDate)}</span>
            <span className="block text-[11px] text-slate-400">Time Printed: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 4 Summary Highlight Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-200">
            <span className="text-orange-800 font-bold block text-[11px]">{t('report.gas_sold_today')}</span>
            <span className="text-xl font-black text-orange-950 mt-0.5 block">{formatQty(dayFullCylindersSold)}</span>
            <span className="text-[10px] text-slate-500">{t('common.total')}: {formatCurrency(daySalesTotal)}</span>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
            <span className="text-purple-800 font-bold block text-[11px]">{t('report.empty_received_today')}</span>
            <span className="text-xl font-black text-purple-950 mt-0.5 block">{formatQty(dayEmptiesCollected)}</span>
            <span className="text-[10px] text-slate-500">Exchanged from market</span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <span className="text-emerald-800 font-bold block text-[11px]">{t('report.cash_collected_today')}</span>
            <span className="text-xl font-black text-emerald-950 mt-0.5 block">{formatCurrency(dayCashCollected)}</span>
            <span className="text-[10px] text-slate-500">{t('nav.sales')} + {t('nav.receive_payment')}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-600 font-bold block text-[11px]">{t('report.net_cash_today')}</span>
            <span className={`text-xl font-black mt-0.5 block ${netDayCash >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatCurrency(netDayCash)}
            </span>
            <span className="text-[10px] text-slate-400">After refinery/expenses</span>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Sales Register */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-200">
              Today's Invoices ({toBnNum(daySales.length)})
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2">Invoice #</th>
                  <th className="p-2">{t('common.customer')}</th>
                  <th className="p-2 text-center">Full/Empty</th>
                  <th className="p-2 text-right">{t('common.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daySales.map(s => (
                  <tr key={s.id}>
                    <td className="p-2 font-mono font-bold text-blue-700">{s.invoiceNo}</td>
                    <td className="p-2 font-medium">{s.customerName}</td>
                    <td className="p-2 text-center font-bold text-slate-700">
                      {formatQty(s.totalFullQty)} / {formatQty(s.totalEmptyReceived)}
                    </td>
                    <td className="p-2 text-right font-black text-slate-900">{formatCurrency(s.grandTotal)}</td>
                  </tr>
                ))}
                {daySales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No invoices logged for this date</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Day Expenses & Collections */}
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-200">
                Today's Money Receipts ({toBnNum(dayReceipts.length)})
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2">Receipt #</th>
                    <th className="p-2">{t('common.customer')}</th>
                    <th className="p-2">{t('common.method')}</th>
                    <th className="p-2 text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayReceipts.map(r => (
                    <tr key={r.id}>
                      <td className="p-2 font-mono font-bold text-emerald-700">{r.receiptNo}</td>
                      <td className="p-2 font-medium">{r.customerName}</td>
                      <td className="p-2 text-slate-600">{r.paymentMethod}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">{formatCurrency(r.amount)}</td>
                    </tr>
                  ))}
                  {dayReceipts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-400">No separate money receipts logged</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-200">
                Today's Operating Expenses ({toBnNum(dayExpenses.length)})
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2">{t('expense.category')}</th>
                    <th className="p-2">{t('expense.particulars')}</th>
                    <th className="p-2 text-right">{t('common.amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="p-2 font-semibold text-slate-800">{e.category}</td>
                      <td className="p-2 text-slate-500">{e.notes}</td>
                      <td className="p-2 text-right font-bold text-rose-600">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  {dayExpenses.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-slate-400">No expenses recorded for this date</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Closing Physical Godown Stock Status */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between items-center">
            <span>Closing Godown Inventory Status (End of Day)</span>
            <span className="text-[11px] text-slate-500 font-normal">Updated in real-time</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-2">Brand & Size</th>
                <th className="p-2 text-center">Closing Full in Godown</th>
                <th className="p-2 text-center">Closing Empty in Godown</th>
                <th className="p-2 text-center">With Customers</th>
                <th className="p-2 text-center">Total Asset Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="p-2 font-bold text-slate-900">{p.brand} {p.size}</td>
                  <td className="p-2 text-center font-black text-orange-600">{formatQty(p.fullStock)}</td>
                  <td className="p-2 text-center font-bold text-slate-700">{formatQty(p.emptyStock)}</td>
                  <td className="p-2 text-center font-semibold text-purple-700">{formatQty(p.customerHeldStock)}</td>
                  <td className="p-2 text-center font-black text-slate-900">{formatQty(p.totalCylinders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Line */}
        <div className="pt-8 flex justify-between text-xs text-slate-600">
          <div className="text-center w-40 border-t border-slate-300 pt-1">
            Godown In-Charge
          </div>
          <div className="text-center w-40 border-t border-slate-300 pt-1">
            Accountant
          </div>
          <div className="text-center w-40 border-t border-slate-300 pt-1">
            Managing Director
          </div>
        </div>
      </div>
    </div>
  );
};

