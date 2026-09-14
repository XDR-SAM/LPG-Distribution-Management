import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { CylinderDueBadge } from '../common/Badge';
import { Flame, RotateCcw, Search, AlertTriangle, ShieldCheck, Printer } from 'lucide-react';

export const CustomerCylinderDueView: React.FC = () => {
  const {
    customers,
    products,
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
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone, area..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
          />
        </div>
        <div className="text-slate-500">
          Showing <strong>{filteredCustomers.length}</strong> accounts with cylinder dues
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
              className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{cust.businessName}</h3>
                  <div className="text-slate-500 text-[11px]">
                    {cust.contactPerson} · {cust.phone} ({cust.area})
                  </div>
                  <div className="text-slate-400 text-[10px] capitalize">Category: {cust.customerType}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Total Dues:</span>
                  <span className="text-lg font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {totalEmptyDue} pcs
                  </span>
                </div>
              </div>

              {/* Brand Breakup Table */}
              <div className="border border-slate-100 rounded-md overflow-hidden bg-slate-50 text-xs">
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
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-800">
                          {h.brand} {h.size}
                        </td>
                        <td className="p-2 text-center font-bold text-amber-800">
                          {h.emptyDue} pcs
                        </td>
                        <td className="p-2 text-right font-medium text-slate-600">
                          {h.depositHeld > 0 ? formatBDT(h.depositHeld) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="text-[11px] text-slate-500">
                  Cash Due: <strong className="text-rose-600">{formatBDT(cust.currentDue)}</strong>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomerForDetails(cust);
                    setIsReceiveEmptyModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Receive Empty From Shop</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
