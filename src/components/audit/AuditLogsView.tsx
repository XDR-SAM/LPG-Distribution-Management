import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const term = (searchTerm || '').toLowerCase();
  const filtered = auditLogs.filter(log => {
    const act = (log.action || '').toLowerCase();
    const det = (log.details || '').toLowerCase();
    const ref = (log.reference || (log as any).entityId || '').toLowerCase();
    const usr = (log.user || (log as any).userName || '').toLowerCase();

    const matchesSearch =
      act.includes(term) ||
      det.includes(term) ||
      ref.includes(term) ||
      usr.includes(term);

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">System Security & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all user activities, sales dispatches, stock adjustments, and financial transactions
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Audit Logging Active (ISO 9001 / BERC Compliant)</span>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit details, entity ref, operator..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
            />
          </div>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE_INVOICE">Create Invoice</option>
            <option value="CANCEL_INVOICE">Cancel Invoice</option>
            <option value="RECORD_PURCHASE">Record Purchase</option>
            <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
            <option value="RECEIVE_EMPTY_CYLINDERS">Receive Empties</option>
            <option value="RECEIVE_PAYMENT">Receive Payment</option>
            <option value="MAKE_SUPPLIER_PAYMENT">Supplier Payment</option>
            <option value="RECORD_EXPENSE">Record Expense</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> log entries
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">User</th>
                <th className="px-3 py-2.5">Action Event</th>
                <th className="px-3 py-2.5">Entity Reference</th>
                <th className="px-3 py-2.5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.map(l => {
                const userDisplayName = l.user || (l as any).userName || 'System';
                const entityRef = l.reference || (l as any).entityId || '—';

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{l.timestamp}</td>
                    <td className="px-3 py-2.5 font-sans font-bold text-slate-900">{userDisplayName}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-blue-700">{entityRef}</td>
                    <td className="px-3 py-2.5 font-sans text-slate-700">{l.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
