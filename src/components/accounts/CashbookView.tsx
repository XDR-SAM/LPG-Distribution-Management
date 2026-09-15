import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, Building, Smartphone, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';

export const CashbookView: React.FC = () => {
  const { transactions, setActiveView, t, language, formatCurrency, formatDate, toBnNum } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');

  // Account Balances
  const cashBalance = 48500;
  const bankBalance = 385000;
  const bkashBalance = 24500;
  const nagadBalance = 12800;
  const totalLiquidity = cashBalance + bankBalance + bkashBalance + nagadBalance;

  const term = (searchTerm || '').toLowerCase();
  const filtered = transactions.filter(t => {
    const matchesSearch =
      (t.voucherNo || '').toLowerCase().includes(term) ||
      (t.description || '').toLowerCase().includes(term) ||
      (t.partyName ? t.partyName.toLowerCase().includes(term) : false);
    const matchesAccount = accountFilter === 'ALL' || (t.account || '').includes(accountFilter);
    return matchesSearch && matchesAccount;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('cashbook.title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('cashbook.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveView('accounts_receive')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1 shadow-xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t('cashbook.receive_btn')}</span>
          </button>
          <button
            onClick={() => setActiveView('accounts_pay')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold flex items-center gap-1 shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t('cashbook.pay_btn')}</span>
          </button>
        </div>
      </div>

      {/* 4 Account Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="font-bold text-[11px] uppercase">{t('cashbook.cash_in_hand')}</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-950 mt-1 block">{formatCurrency(cashBalance)}</span>
          <span className="text-[10px] text-emerald-700">{t('cashbook.cash_drawer')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="font-bold text-[11px] uppercase">{t('cashbook.bank_account')}</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl font-black text-blue-950 mt-1 block">{formatCurrency(bankBalance)}</span>
          <span className="text-[10px] text-blue-700">{t('cashbook.bank_sub')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-pink-200 bg-pink-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-pink-800">
            <span className="font-bold text-[11px] uppercase">{t('cashbook.bkash')}</span>
            <Smartphone className="w-4 h-4 text-pink-600" />
          </div>
          <span className="text-xl font-black text-pink-950 mt-1 block">{formatCurrency(bkashBalance)}</span>
          <span className="text-[10px] text-pink-700">{toBnNum('01711-XXXXXX')} (QR)</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-orange-200 bg-orange-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-orange-800">
            <span className="font-bold text-[11px] uppercase">{t('cashbook.nagad')}</span>
            <Smartphone className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-xl font-black text-orange-950 mt-1 block">{formatCurrency(nagadBalance)}</span>
          <span className="text-[10px] text-orange-700">{toBnNum('01911-XXXXXX')}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('cashbook.search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
            />
          </div>

          <select
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">{t('cashbook.all_accounts')}</option>
            <option value="Cash">{t('cashbook.cash_in_hand')}</option>
            <option value="Bank">{t('cashbook.bank_accounts')}</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
          </select>
        </div>

        <div className="text-slate-700 font-bold">
          {t('cashbook.total_liquid_capital')}: <span className="text-emerald-700">{formatCurrency(totalLiquidity)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">{t('cashbook.date')}</th>
                <th className="px-3 py-2.5">{t('cashbook.voucher_no')}</th>
                <th className="px-3 py-2.5">{t('cashbook.account')}</th>
                <th className="px-3 py-2.5">{t('cashbook.party')}</th>
                <th className="px-3 py-2.5">{t('cashbook.description')}</th>
                <th className="px-3 py-2.5 text-right">{t('cashbook.debit_in')}</th>
                <th className="px-3 py-2.5 text-right">{t('cashbook.credit_out')}</th>
                <th className="px-3 py-2.5 text-right">{t('cashbook.running_balance')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tItem => (
                <tr key={tItem.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{formatDate(tItem.date)}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{toBnNum(tItem.voucherNo)}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-700">{tItem.account}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900">{tItem.partyName || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{tItem.description}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                    {tItem.debit > 0 ? formatCurrency(tItem.debit) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-rose-700">
                    {tItem.credit > 0 ? formatCurrency(tItem.credit) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-extrabold text-slate-900">
                    {formatCurrency(tItem.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
