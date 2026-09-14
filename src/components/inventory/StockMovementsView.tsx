import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Activity, ArrowDownLeft, ArrowUpRight, RotateCcw, Sliders, Flame } from 'lucide-react';

export const StockMovementsView: React.FC = () => {
  const { stockMovements, products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const getRef = (m: any) => m.reference || m.referenceNo || '';
  const getProductName = (m: any) => m.productName || `${m.brand || ''} ${m.size || ''}`.trim() || 'LPG Cylinder';
  const getMovementType = (m: any) => m.movementType || m.type || '';
  const getFullChange = (m: any) => (m.fullQtyChange !== undefined ? m.fullQtyChange : (m.fullQty || 0));
  const getEmptyChange = (m: any) => (m.emptyQtyChange !== undefined ? m.emptyQtyChange : (m.emptyQty || 0));
  const getGodown = (m: any) => m.godown || 'Main Godown';

  const term = (searchTerm || '').toLowerCase();
  const filtered = stockMovements.filter(m => {
    const prodName = getProductName(m).toLowerCase();
    const refNo = getRef(m).toLowerCase();
    const notes = (m.notes || '').toLowerCase();
    const movType = getMovementType(m);

    const matchesSearch =
      prodName.includes(term) ||
      refNo.includes(term) ||
      notes.includes(term);

    const matchesType = typeFilter === 'ALL' || movType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Cylinder Movement Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of every cylinder transaction: Inflows, Outflows, Exchanges, and Godown reconciliation
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, cylinder brand, notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">All Movement Types</option>
            <option value="SALE_FULL_OUT">Sale Full Out</option>
            <option value="CUSTOMER_EMPTY_IN">Customer Empty In</option>
            <option value="PURCHASE_FULL_IN">Purchase Full In</option>
            <option value="EMPTY_SENT_TO_SUPPLIER">Empty Sent to Depot</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            <option value="DAMAGED">Damaged / Defect</option>
            <option value="LOST">Lost</option>
            <option value="RECOVERED">Recovered</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> movement records
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Date & Time</th>
                <th className="px-3 py-2.5">Reference No</th>
                <th className="px-3 py-2.5">Cylinder Spec</th>
                <th className="px-3 py-2.5">Movement Type</th>
                <th className="px-3 py-2.5 text-center">Full Change</th>
                <th className="px-3 py-2.5 text-center">Empty Change</th>
                <th className="px-3 py-2.5">Warehouse</th>
                <th className="px-3 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => {
                const fullQtyChange = getFullChange(m);
                const emptyQtyChange = getEmptyChange(m);
                const isFullOut = fullQtyChange < 0;
                const isEmptyOut = emptyQtyChange < 0;
                const mType = getMovementType(m);

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{m.date}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{getRef(m)}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{getProductName(m)}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {mType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold">
                      {fullQtyChange === 0 ? (
                        <span className="text-slate-400 font-normal">-</span>
                      ) : (
                        <span className={isFullOut ? 'text-rose-600' : 'text-emerald-600'}>
                          {fullQtyChange > 0 ? `+${fullQtyChange}` : fullQtyChange}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold">
                      {emptyQtyChange === 0 ? (
                        <span className="text-slate-400 font-normal">-</span>
                      ) : (
                        <span className={isEmptyOut ? 'text-rose-600' : 'text-blue-600'}>
                          {emptyQtyChange > 0 ? `+${emptyQtyChange}` : emptyQtyChange}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{getGodown(m)}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-[11px]">{m.notes}</td>
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
