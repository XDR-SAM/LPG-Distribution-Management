import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { CylinderDueBadge } from '../common/Badge';
import { Flame, RotateCcw, Search, AlertTriangle, ShieldCheck, Printer, X, FileText } from 'lucide-react';

export const CustomerCylinderDueView: React.FC = () => {
  const {
    customers,
    products,
    setActiveView,
    setIsReceiveEmptyModalOpen,
    setSelectedCustomerForDetails,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Total empty cylinders with customers across entire system
  const totalHeldWithCustomers = customers.reduce(
    (sum, c) => sum + (c.cylinderHoldings || []).reduce((s, h) => s + (h.emptyDue || 0), 0),
    0
  );

  // Total security deposits held
  const totalSecurityDeposit = customers.reduce(
    (sum, c) => sum + (c.cylinderHoldings || []).reduce((s, h) => s + (h.depositHeld || 0), 0),
    0
  );

  const term = (searchTerm || '').toLowerCase();
  const filteredCustomers = customers.filter(c => {
    const totalDues = (c.cylinderHoldings || []).reduce((s, h) => s + (h.emptyDue || 0), 0);
    const matchesSearch =
      (c.businessName || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term) ||
      (c.area || '').toLowerCase().includes(term);
    return matchesSearch && totalDues > 0;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Customer Empty Cylinder Receivables
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cylinder security tracking: Monitored count of empty LPG cylinders currently held by dealers and restaurants
          </p>
        </div>

        <button
          onClick={() => setIsReceiveEmptyModalOpen(true)}
          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Receive Empty Cylinders</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-amber-800 font-bold block text-[11px] uppercase">
            Total Empty Cylinders Receivable
          </span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">
            {totalHeldWithCustomers} Cylinders
          </span>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Asset value equivalent: ~{formatBDT(totalHeldWithCustomers * 2200)}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-emerald-800 font-bold block text-[11px] uppercase">
            Cylinder Security Deposits Held
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">
            {formatBDT(totalSecurityDeposit)}
          </span>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Cash guarantee held against non-returned cylinders
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-slate-500 font-bold block text-[11px] uppercase">
              Overdue Recovery Rate
            </span>
            <span className="text-xl font-bold text-slate-800 mt-1 block">
              {filteredCustomers.length} Out of {customers.length} Accounts
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Accounts with active cylinder balances pending return
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-80 max-w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone, area..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="text-slate-500 text-[11px] font-medium">
          Showing <strong>{filteredCustomers.length}</strong> accounts with active cylinder balances
        </div>
      </div>

      {/* Dues Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map(cust => {
          const holdings = cust.cylinderHoldings || [];
          const totalEmptyDue = holdings.reduce((s, h) => s + (h.emptyDue || 0), 0);
          const totalDeposit = holdings.reduce((s, h) => s + (h.depositHeld || 0), 0);

          return (
            <div
              key={cust.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-purple-300 shadow-2xs p-4 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {cust.businessName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{cust.businessName}</h3>
                    <div className="text-slate-500 text-[11px] truncate">
                      {cust.contactPerson} · {cust.phone}
                    </div>
                    <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                      <span className="capitalize">{cust.customerType}</span>
                      <span>·</span>
                      <span>{cust.area}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Unreturned:</span>
                  <span className="text-base font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 inline-block font-mono">
                    {totalEmptyDue} pcs
                  </span>
                </div>
              </div>

              {/* Brand Breakup Table */}
              <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2">Cylinder Brand / Size</th>
                      <th className="p-2 text-center">Unreturned Due</th>
                      <th className="p-2 text-right">Deposit Held</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {holdings.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50">
                        <td className="p-2 font-medium text-slate-800">
                          {h.brand} {h.size}
                        </td>
                        <td className="p-2 text-center font-bold text-purple-900 font-mono">
                          {h.emptyDue} pcs
                        </td>
                        <td className="p-2 text-right font-medium text-slate-600 font-mono">
                          {h.depositHeld > 0 ? formatBDT(h.depositHeld) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs gap-2 flex-wrap">
                <div className="text-[11px] text-slate-500">
                  Cash Balance: <strong className={cust.currentDue > 0 ? 'text-rose-600' : 'text-slate-700'}>{formatBDT(cust.currentDue)}</strong>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => {
                      setSelectedCustomerForDetails(cust);
                      setActiveView('customer_ledger');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition-colors text-[11px]"
                    title="View Customer Ledger"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ledger</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomerForDetails(cust);
                      setIsReceiveEmptyModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors text-[11px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Receive Empties</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
