import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { Purchase } from '../../types';
import { Search, Plus, Eye, Calendar, Building2, Truck, X } from 'lucide-react';

export const PurchaseListView: React.FC = () => {
  const { purchases, suppliers, setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const term = (searchTerm || '').toLowerCase();
  const filtered = purchases.filter(p =>
    (p.purchaseNo || '').toLowerCase().includes(term) ||
    (p.supplierName || '').toLowerCase().includes(term) ||
    (p.supplierInvoiceRef || (p as any).supplierInvoiceNo || '').toLowerCase().includes(term)
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Depot Purchase Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of refinery deliveries, incoming filled gas, and empty return accounts
          </p>
        </div>

        <button
          onClick={() => setActiveView('purchase_new')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search purchase #, supplier, company challan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
          />
        </div>
        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> purchases
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Purchase No</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Supplier Depot</th>
                <th className="px-3 py-2.5">Company Challan</th>
                <th className="px-3 py-2.5 text-center">Full Recv</th>
                <th className="px-3 py-2.5 text-center">Empty Sent</th>
                <th className="px-3 py-2.5 text-right">Total Bill (৳)</th>
                <th className="px-3 py-2.5 text-right">Paid (৳)</th>
                <th className="px-3 py-2.5 text-right">Balance Due (৳)</th>
                <th className="px-3 py-2.5">Payment</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 font-bold text-blue-700">{p.purchaseNo}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{p.date}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{p.supplierName}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-600">{p.supplierInvoiceNo}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-orange-600">{p.totalFullReceived} pcs</td>
                  <td className="px-3 py-2.5 text-center font-bold text-emerald-700">{p.totalEmptySent} pcs</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatBDT(p.grandTotal)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{formatBDT(p.amountPaid)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-rose-700">
                    {formatBDT(p.grandTotal - p.amountPaid)}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{p.paymentMethod}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => setSelectedPurchase(p)}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Purchase Invoice {selectedPurchase.purchaseNo}
                </h3>
                <p className="text-slate-500">{selectedPurchase.supplierName} · {selectedPurchase.date}</p>
              </div>
              <button onClick={() => setSelectedPurchase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2">Brand & Size</th>
                    <th className="p-2 text-center">Full Recv</th>
                    <th className="p-2 text-center">Empty Sent</th>
                    <th className="p-2 text-right">Cost Rate</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPurchase.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">{it.brand} {it.size}</td>
                      <td className="p-2 text-center font-bold text-orange-600">{it.fullQtyReceived}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{it.emptyQtySent}</td>
                      <td className="p-2 text-right">{formatBDT(it.unitCost)}</td>
                      <td className="p-2 text-right font-bold">{formatBDT(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-slate-600 border border-slate-200">
              <div className="flex justify-between">
                <span>Truck & Driver:</span>
                <strong>{selectedPurchase.truckNo || 'N/A'} (Driver: {selectedPurchase.driverName || 'N/A'})</strong>
              </div>
              <div className="flex justify-between">
                <span>Depot Challan No:</span>
                <strong>{selectedPurchase.supplierInvoiceNo}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Purchase:</span>
                <span className="font-extrabold text-slate-900">{formatBDT(selectedPurchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-700">{formatBDT(selectedPurchase.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance Payable:</span>
                <span className="font-bold text-rose-700">{formatBDT(selectedPurchase.grandTotal - selectedPurchase.amountPaid)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
