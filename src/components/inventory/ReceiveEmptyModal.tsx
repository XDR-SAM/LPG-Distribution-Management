import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, RotateCcw, CheckCircle, Flame, User } from 'lucide-react';

export const ReceiveEmptyModal: React.FC = () => {
  const {
    isReceiveEmptyModalOpen,
    setIsReceiveEmptyModalOpen,
    customers,
    products,
    receiveEmptyFromCustomer,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState<number>(5);
  const [notes, setNotes] = useState<string>('Driver collected empties on return route');

  if (!isReceiveEmptyModalOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || !currentProduct || qty <= 0) return;

    receiveEmptyFromCustomer(
      currentCustomer.id,
      currentProduct.id,
      qty,
      notes
    );

    setIsReceiveEmptyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Receive Empty Cylinders</h3>
              <p className="text-[11px] text-slate-500">Collect empty cylinders from customer to settle cylinder dues</p>
            </div>
          </div>
          <button
            onClick={() => setIsReceiveEmptyModalOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Customer / Dealer *</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.area}) - Holding: {c.cylinderHoldings.reduce((s, h) => s + h.emptyDue, 0)} due pcs
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Current Cylinder Dues Held:</span>
              <span className="font-extrabold text-purple-900 text-sm">
                {currentCustomer?.cylinderHoldings.reduce((s, h) => s + h.emptyDue, 0)} Cylinders Due
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Contact Person:</span>
              <span className="font-semibold text-slate-800">{currentCustomer?.contactPerson}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cylinder Spec *</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Empty Quantity Received *</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-slate-300 rounded font-black text-slate-900 text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Collection Memo / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Collected by Driver Rahim with vehicle Dhaka Metro-Ta 11-4521"
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsReceiveEmptyModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record Empty Return</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
