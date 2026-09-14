import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, SlidersHorizontal, CheckCircle, AlertTriangle } from 'lucide-react';

export const CylinderAdjustmentModal: React.FC = () => {
  const {
    isAdjustStockModalOpen,
    setIsAdjustStockModalOpen,
    products,
    adjustStock,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [fullStockDelta, setFullStockDelta] = useState<number>(0);
  const [emptyStockDelta, setEmptyStockDelta] = useState<number>(0);
  const [reason, setReason] = useState<string>('Routine physical godown count audit');

  if (!isAdjustStockModalOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const newFullStock = (currentProduct?.fullStock || 0) + fullStockDelta;
  const newEmptyStock = (currentProduct?.emptyStock || 0) + emptyStockDelta;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    adjustStock(currentProduct.id, fullStockDelta, emptyStockDelta, reason);
    setIsAdjustStockModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Physical Stock Count Adjustment</h3>
              <p className="text-[11px] text-slate-500">Reconcile godown floor counts against system figures</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdjustStockModalOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Cylinder Spec *</label>
            <select
              value={selectedProductId}
              onChange={e => {
                setSelectedProductId(e.target.value);
                setFullStockDelta(0);
                setEmptyStockDelta(0);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.size} (Current: {p.fullStock} Full / {p.emptyStock} Empty)
                </option>
              ))}
            </select>
          </div>

          {/* Current vs Target Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            {/* Full Cylinders */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block">Full Cylinders</span>
              <div className="flex justify-between text-slate-500">
                <span>System Count:</span>
                <strong className="text-slate-900">{currentProduct?.fullStock}</strong>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Quantity Adjustment (+/-)</label>
                <input
                  type="number"
                  value={fullStockDelta}
                  onChange={e => setFullStockDelta(parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 border border-slate-300 rounded font-bold text-slate-900 text-center bg-white"
                  placeholder="+2 or -3"
                />
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">New Count:</span>
                <strong className="text-orange-600 font-black">{newFullStock} pcs</strong>
              </div>
            </div>

            {/* Empty Cylinders */}
            <div className="space-y-2 border-l border-slate-200 pl-3">
              <span className="font-bold text-slate-800 block">Empty Cylinders</span>
              <div className="flex justify-between text-slate-500">
                <span>System Count:</span>
                <strong className="text-slate-900">{currentProduct?.emptyStock}</strong>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Quantity Adjustment (+/-)</label>
                <input
                  type="number"
                  value={emptyStockDelta}
                  onChange={e => setEmptyStockDelta(parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 border border-slate-300 rounded font-bold text-slate-900 text-center bg-white"
                  placeholder="+5 or -1"
                />
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">New Count:</span>
                <strong className="text-slate-800 font-black">{newEmptyStock} pcs</strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Audit Reason / Justification *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-slate-800 mb-1"
            >
              <option value="Routine physical godown count audit">Routine physical godown count audit</option>
              <option value="Leakage cylinder discharged to empty">Leakage cylinder discharged to empty</option>
              <option value="Damaged / dented cylinder identified">Damaged / dented cylinder identified</option>
              <option value="Unregistered return received">Unregistered return received</option>
              <option value="Floor recount correction">Floor recount correction</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdjustStockModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
