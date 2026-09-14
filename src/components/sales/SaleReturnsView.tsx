import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, AlertTriangle, CheckCircle, Plus, Calendar, Search } from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const SaleReturnsView: React.FC = () => {
  const { customers, products } = useApp();

  const [returnsList, setReturnsList] = useState([
    {
      id: 'RET-001',
      returnNo: 'SR-2026-0012',
      date: '2026-09-12',
      customerName: 'M/S Nayeem Traders',
      brand: 'Bashundhara LP Gas',
      size: '12 KG',
      qty: 2,
      reason: 'Valve leakage detected at retailer shop',
      refundAmount: 2820,
      status: 'Processed (Replaced)',
    },
    {
      id: 'RET-002',
      returnNo: 'SR-2026-0011',
      date: '2026-09-10',
      customerName: 'Al-Madina Restaurant',
      brand: 'Omera LPG',
      size: '35 KG',
      qty: 1,
      reason: 'Pin defect - safety seal issue',
      refundAmount: 4100,
      status: 'Credit Note Issued',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [returnQty, setReturnQty] = useState(1);
  const [reason, setReason] = useState('Safety leak detected at cylinder neck');
  const [refundAction, setRefundAction] = useState<'replacement' | 'credit_note' | 'cash'>('replacement');

  const handleAddReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustomerId);
    const prod = products.find(p => p.id === selectedProductId);

    const newReturn = {
      id: `RET-${Date.now()}`,
      returnNo: `SR-2026-${String(returnsList.length + 13).padStart(4, '0')}`,
      date: '2026-09-14',
      customerName: cust?.businessName || 'Customer',
      brand: prod?.brand || 'Bashundhara',
      size: prod?.size || '12 KG',
      qty: returnQty,
      reason,
      refundAmount: (prod?.dealerPrice || 1410) * returnQty,
      status: refundAction === 'replacement' ? 'Processed (Replaced)' : 'Credit Note Issued',
    };

    setReturnsList([newReturn, ...returnsList]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Sale Returns & Defective Gas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log cylinder returns, pin defects, body dents, or valve leakage replacements
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Sale Return</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5">Return No</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Product & Size</th>
              <th className="px-3 py-2.5 text-center">Qty</th>
              <th className="px-3 py-2.5">Defect / Reason</th>
              <th className="px-3 py-2.5 text-right">Value (৳)</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {returnsList.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80">
                <td className="px-3 py-2.5 font-bold text-rose-700">{r.returnNo}</td>
                <td className="px-3 py-2.5 text-slate-500">{r.date}</td>
                <td className="px-3 py-2.5 font-bold text-slate-900">{r.customerName}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{r.brand} - {r.size}</td>
                <td className="px-3 py-2.5 text-center font-bold text-slate-900">{r.qty} pcs</td>
                <td className="px-3 py-2.5 text-slate-600 italic">{r.reason}</td>
                <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatBDT(r.refundAmount)}</td>
                <td className="px-3 py-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 border border-slate-200 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Record Defective Cylinder / Sale Return</span>
            </h3>

            <form onSubmit={handleAddReturn} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded font-medium"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cylinder Product</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brand} {p.size}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Return Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={returnQty}
                    onChange={e => setReturnQty(parseInt(e.target.value) || 1)}
                    className="w-full p-1.5 border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Settlement Action</label>
                  <select
                    value={refundAction}
                    onChange={e => setRefundAction(e.target.value as any)}
                    className="w-full p-1.5 border border-slate-300 rounded"
                  >
                    <option value="replacement">Immediate Cylinder Replacement</option>
                    <option value="credit_note">Issue Credit Note (Reduce Due)</option>
                    <option value="cash">Cash Refund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Defect Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded"
                  placeholder="e.g. Pin leakage, body ring damaged, low weight"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
                >
                  Save Return Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
