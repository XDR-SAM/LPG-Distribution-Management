import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Purchase } from '../../types';
import { Search, Plus, Eye, Calendar, Building2, Truck, X } from 'lucide-react';

export const PurchaseListView: React.FC = () => {
  const {
    purchases,
    suppliers,
    setActiveView,
    t,
    language,
    formatCurrency,
    formatQty,
    toBnNum,
    formatDate,
  } = useApp();
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
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('purchase.title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('purchase.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setActiveView('purchase_new')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('purchase.new_purchase')}</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('purchase.search_placeholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
          />
        </div>
        <div className="text-slate-500 font-medium">
          {language === 'bn' ? (
            <>মোট <strong>{toBnNum(filtered.length)}</strong> টি ক্রয় রেকর্ড</>
          ) : (
            <>Showing <strong>{filtered.length}</strong> purchases</>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">{t('purchase.ref_date')}</th>
                <th className="px-3 py-2.5">{t('sales.date')}</th>
                <th className="px-3 py-2.5">{t('purchase.supplier')}</th>
                <th className="px-3 py-2.5">{t('sales.challan_no')}</th>
                <th className="px-3 py-2.5 text-center">{t('purchase.full_inward')}</th>
                <th className="px-3 py-2.5 text-center">{t('purchase.empty_sent')}</th>
                <th className="px-3 py-2.5 text-right">{t('purchase.bill_amount')} (৳)</th>
                <th className="px-3 py-2.5 text-right">{t('purchase.paid_amount')} (৳)</th>
                <th className="px-3 py-2.5 text-right">{t('purchase.balance_due')} (৳)</th>
                <th className="px-3 py-2.5">{t('purchase.payment_status')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 font-bold text-blue-700">{p.purchaseNo}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{formatDate(p.date)}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{p.supplierName}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-600">{toBnNum(p.supplierInvoiceNo)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-orange-600">{formatQty(p.totalFullReceived)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-emerald-700">{formatQty(p.totalEmptySent)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatCurrency(p.grandTotal)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{formatCurrency(p.amountPaid)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-rose-700">
                    {formatCurrency(p.grandTotal - p.amountPaid)}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{p.paymentMethod}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => setSelectedPurchase(p)}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title={t('common.view')}
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
                  {language === 'bn' ? `ক্রয় চালান ${selectedPurchase.purchaseNo}` : `Purchase Invoice ${selectedPurchase.purchaseNo}`}
                </h3>
                <p className="text-slate-500">{selectedPurchase.supplierName} · {formatDate(selectedPurchase.date)}</p>
              </div>
              <button onClick={() => setSelectedPurchase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2">{t('sales.product_item')}</th>
                    <th className="p-2 text-center">{t('purchase.full_inward')}</th>
                    <th className="p-2 text-center">{t('purchase.empty_sent')}</th>
                    <th className="p-2 text-right">{t('stock.cost_rate')}</th>
                    <th className="p-2 text-right">{t('sales.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPurchase.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">{it.brand} {it.size}</td>
                      <td className="p-2 text-center font-bold text-orange-600">{formatQty(it.fullQtyReceived)}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{formatQty(it.emptyQtySent)}</td>
                      <td className="p-2 text-right">{formatCurrency(it.unitCost)}</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-slate-600 border border-slate-200">
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'গাড়ি ও চালক:' : 'Truck & Driver:'}</span>
                <strong>{selectedPurchase.truckNo || 'N/A'} ({language === 'bn' ? 'চালক: ' : 'Driver: '}{selectedPurchase.driverName || 'N/A'})</strong>
              </div>
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'কোম্পানি চালান নং:' : 'Depot Challan No:'}</span>
                <strong>{toBnNum(selectedPurchase.supplierInvoiceNo)}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">{t('sales.total')}:</span>
                <span className="font-extrabold text-slate-900">{formatCurrency(selectedPurchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('sales.amount_paid')}:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(selectedPurchase.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('sales.due_amount')}:</span>
                <span className="font-bold text-rose-700">{formatCurrency(selectedPurchase.grandTotal - selectedPurchase.amountPaid)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
