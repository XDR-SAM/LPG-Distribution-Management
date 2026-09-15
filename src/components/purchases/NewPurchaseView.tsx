import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, PurchaseItem } from '../../types';
import { formatBDT } from '../../utils/formatters';
import {
  ShoppingBag,
  Building2,
  Plus,
  Trash2,
  CheckCircle,
  Truck,
  RotateCcw,
  Receipt
} from 'lucide-react';

export const NewPurchaseView: React.FC = () => {
  const {
    suppliers,
    products,
    addPurchase,
    setActiveView,
    t,
    language,
    formatCurrency,
    formatQty,
    toBnNum,
  } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [date, setDate] = useState<string>('2026-09-14');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState<string>('BLPG-CH-99201');
  const [truckNo, setTruckNo] = useState<string>('Dhaka Metro-U 14-8890');
  const [driverName, setDriverName] = useState<string>('Abdul Jalil');
  const [driverPhone, setDriverPhone] = useState<string>('01711-443322');

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: `pitem-${Date.now()}`,
      productId: products[0]?.id || '',
      brand: products[0]?.brand || 'Bashundhara LP Gas',
      size: products[0]?.size || '12 KG',
      fullQtyReceived: 50,
      emptyQtySent: 50,
      unitCost: products[0]?.purchasePrice || 1320,
      amount: (products[0]?.purchasePrice || 1320) * 50,
    }
  ]);

  const [transportCost, setTransportCost] = useState<number>(1500);
  const [laborCost, setLaborCost] = useState<number>(500);
  const [amountPaid, setAmountPaid] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [notes, setNotes] = useState<string>('Delivered directly from Mongla Plant Depot.');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const totalFullReceived = items.reduce((sum, i) => sum + i.fullQtyReceived, 0);
  const totalEmptySent = items.reduce((sum, i) => sum + i.emptyQtySent, 0);
  const grandTotal = subtotal + transportCost + laborCost;

  const previousPayable = selectedSupplier?.currentPayable || 0;
  const currentPayable = previousPayable + (grandTotal - amountPaid);

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        brand: prod.brand,
        size: prod.size,
        unitCost: prod.purchasePrice,
        amount: prod.purchasePrice * updated[index].fullQtyReceived,
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'fullQtyReceived' || field === 'unitCost') {
        const fullQty = Number(field === 'fullQtyReceived' ? value : item.fullQtyReceived);
        const unitCost = Number(field === 'unitCost' ? value : item.unitCost);
        item.amount = fullQty * unitCost;

        if (field === 'fullQtyReceived') {
          item.emptyQtySent = fullQty; // auto balance empty truck
        }
      }
      updated[index] = item;
      return updated;
    });
  };

  const addItemRow = () => {
    const first = products[0];
    setItems(prev => [
      ...prev,
      {
        id: `pitem-${Date.now()}-${Math.random()}`,
        productId: first.id,
        brand: first.brand,
        size: first.size,
        fullQtyReceived: 30,
        emptyQtySent: 30,
        unitCost: first.purchasePrice,
        amount: first.purchasePrice * 30,
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePurchase = () => {
    if (!selectedSupplier) return;

    addPurchase({
      date,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.companyName,
      supplierInvoiceNo,
      truckNo,
      driverName,
      driverPhone,
      items,
      subtotal,
      transportCost,
      laborCost,
      grandTotal,
      amountPaid,
      previousPayable,
      currentPayable,
      totalFullReceived,
      totalEmptySent,
      paymentMethod,
      notes,
    });

    setIsCompleted(true);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {t('purchase.new_title')}
            </h1>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              PUR-2026-(Auto)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('purchase.new_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveView('purchase_list')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
          >
            {t('purchase.history_btn')}
          </button>
          <button
            onClick={handleSavePurchase}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-xs"
          >
            {t('purchase.save_btn')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Form details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Supplier Info */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{t('purchase.depot_details')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.company_supplier')}</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.gate_pass')}</label>
                <input
                  type="text"
                  value={supplierInvoiceNo}
                  onChange={e => setSupplierInvoiceNo(e.target.value)}
                  placeholder="e.g. BLPG-CH-99201"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.arrival_date')}</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.truck_no')}</label>
                <input
                  type="text"
                  value={truckNo}
                  onChange={e => setTruckNo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.driver_name')}</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.driver_phone')}</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {t('purchase.received_and_returned')}
                </h2>
              </div>
              <button
                onClick={addItemRow}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('purchase.add_product')}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">{t('sales.product_item')}</th>
                    <th className="px-2 py-2 text-center w-24">{t('purchase.full_recv')}</th>
                    <th className="px-2 py-2 text-center w-24">{t('purchase.empty_sent_col')}</th>
                    <th className="px-2 py-2 text-right w-24">{t('purchase.cost_rate')}</th>
                    <th className="px-3 py-2 text-right w-28">{t('sales.total')}</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        <select
                          value={item.productId}
                          onChange={e => handleProductChange(idx, e.target.value)}
                          className="w-full p-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.brand} {p.size} ({language === 'bn' ? 'দর: ' : 'Cost: '}{formatCurrency(p.purchasePrice)})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.fullQtyReceived}
                          onChange={e => handleItemChange(idx, 'fullQtyReceived', Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-20 text-center p-1 border border-slate-300 rounded font-bold text-slate-900 bg-white"
                        />
                      </td>

                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.emptyQtySent}
                          onChange={e => handleItemChange(idx, 'emptyQtySent', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 text-center p-1 border border-slate-300 rounded font-bold text-slate-900 bg-blue-50"
                        />
                      </td>

                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={e => handleItemChange(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-20 text-right p-1 border border-slate-300 rounded font-medium text-slate-900"
                        />
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>

                      <td className="px-2 py-2 text-center">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cylinder balance notice */}
            <div className="p-3 bg-blue-500/10 border-t border-blue-200/60 flex items-center justify-between text-xs text-blue-950 font-medium">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>
                  {language === 'bn' ? (
                    <>মোট <strong>{formatQty(totalFullReceived)}</strong> ভর্তি সিলিন্ডার গৃহীত। ট্রাকে <strong>{formatQty(totalEmptySent)}</strong> খালি সিলিন্ডার প্রেরিত।</>
                  ) : (
                    <>Receiving <strong>{totalFullReceived} full cylinders</strong>. Returning <strong>{totalEmptySent} empty cylinders</strong> on depot truck.</>
                  )}
                </span>
              </div>
              <span className="font-bold text-blue-900">
                {t('purchase.supplier_balance_impact')}: {formatQty(totalFullReceived - totalEmptySent)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs text-xs">
            <label className="block font-bold text-slate-700 mb-1">{t('purchase.purchase_notes')}</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
            />
          </div>
        </div>

        {/* Right Col: Costing & Supplier Ledger */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              {t('purchase.settlement')}
            </h2>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">{t('purchase.product_subtotal')}:</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">{t('purchase.transport_freight')}:</span>
                <input
                  type="number"
                  min="0"
                  value={transportCost}
                  onChange={e => setTransportCost(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right p-1 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">{t('purchase.unloading_labor')}:</span>
                <input
                  type="number"
                  min="0"
                  value={laborCost}
                  onChange={e => setLaborCost(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right p-1 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900 bg-slate-50 px-2 rounded">
                <span>{t('purchase.total_invoice_bill')}:</span>
                <span className="text-blue-700 text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Previous Balance */}
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('purchase.prev_payable')}:</span>
                <span className="font-bold text-rose-700">{formatCurrency(previousPayable)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">{t('purchase.total_liability')}:</span>
                <span className="font-extrabold text-slate-900">{formatCurrency(previousPayable + grandTotal)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.amount_paid_company')}</label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border-2 border-blue-500 rounded font-black text-slate-900 text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('purchase.payment_channel')}</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                >
                  <option value="Bank Transfer">{t('payment.bank')}</option>
                  <option value="Cash">{t('payment.cash')}</option>
                  <option value="Cheque">{t('payment.cheque')}</option>
                  <option value="Credit / Due">{t('payment.due')}</option>
                </select>
              </div>

              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-rose-800">{t('purchase.closing_payable')}:</span>
                  <span className="font-black text-rose-700 text-sm">{formatCurrency(currentPayable)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSavePurchase}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('purchase.confirm_btn')}</span>
            </button>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{t('purchase.success_title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('purchase.success_subtitle')}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setActiveView('inventory_stock');
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs"
              >
                {t('purchase.view_updated_stock')}
              </button>
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setActiveView('purchase_list');
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs"
              >
                {t('purchase.history_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
