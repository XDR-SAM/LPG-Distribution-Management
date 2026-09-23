import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentStatusBadge, CylinderDueBadge } from '../common/Badge';
import { Sale } from '../../types';
import { RoleGate } from '../common/RoleGate';
import {
  Search,
  Filter,
  Plus,
  Printer,
  Truck,
  Ban,
  ArrowDownLeft,
  Calendar,
  FileText,
  Clock,
  Eye,
  X
} from 'lucide-react';

export const SalesListView: React.FC = () => {
  const {
    sales,
    customers,
    setActiveView,
    setPrintSale,
    setPrintChallan,
    cancelSale,
    t,
    language,
    formatCurrency,
    formatDate,
    formatQty,
    toBnNum,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSaleDetails, setSelectedSaleDetails] = useState<Sale | null>(null);

  // Cancellation modal
  const [cancelModalSale, setCancelModalSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Filter logic
  const term = (searchTerm || '').toLowerCase();
  const safeSales = sales || [];
  const filteredSales = safeSales.filter(s => {
    if (!s) return false;
    const matchesSearch =
      (s.invoiceNo || '').toLowerCase().includes(term) ||
      (s.customerName || '').toLowerCase().includes(term) ||
      (s.customerPhone || '').includes(searchTerm);

    const matchesCustomer = customerFilter === 'ALL' || s.customerId === customerFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesCustomer && matchesStatus;
  });

  const handleConfirmCancel = () => {
    if (!cancelModalSale || !cancelReason.trim()) return;
    cancelSale(cancelModalSale.id, cancelReason);
    setCancelModalSale(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('sales.invoice_list_title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('sales.invoice_list_subtitle')}
          </p>
        </div>

        <RoleGate action="create_sale">
          <button
            onClick={() => setActiveView('sales_new')}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('sales.new_sale_btn')}</span>
          </button>
        </RoleGate>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'ইনভয়েস নং, গ্রাহকের নাম, ফোন নম্বর...' : 'Search by invoice #, customer name, phone...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs focus:bg-white"
            />
          </div>

          {/* Customer filter */}
          <select
            value={customerFilter}
            onChange={e => setCustomerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">
              {language === 'bn' ? `সকল গ্রাহক (${formatQty(customers.length)})` : `All Customers (${customers.length})`}
            </option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.businessName}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">{language === 'bn' ? 'সকল অবস্থা' : 'All Statuses'}</option>
            <option value="paid">{language === 'bn' ? 'পরিশোধিত' : 'Paid'}</option>
            <option value="partial">{language === 'bn' ? 'আংশিক' : 'Partial'}</option>
            <option value="due">{language === 'bn' ? 'বাকি' : 'Due'}</option>
            <option value="cancelled">{language === 'bn' ? 'বাতিলকৃত' : 'Cancelled'}</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          {language === 'bn' ? (
            <>মোট <strong>{formatQty(safeSales.length)}</strong> টির মধ্যে <strong>{formatQty(filteredSales.length)}</strong> টি প্রদর্শিত</>
          ) : (
            <>Showing <strong>{filteredSales.length}</strong> of <strong>{safeSales.length}</strong> invoices</>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">{t('sales.invoice_no')}</th>
                <th className="px-3 py-2.5">{t('common.date')}</th>
                <th className="px-3 py-2.5">{t('sales.customer_name')}</th>
                <th className="px-3 py-2.5 text-center">{t('sales.full_qty')}</th>
                <th className="px-3 py-2.5 text-center">{t('sales.empty_recv')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.total')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.paid')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.due')}</th>
                <th className="px-3 py-2.5 text-center">{t('sales.cylinder_due')}</th>
                <th className="px-3 py-2.5">{t('sales.payment_method')}</th>
                <th className="px-3 py-2.5">{t('common.status')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    {t('sales.no_sales_found')}
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const saleDue = (sale.grandTotal || 0) - (sale.amountPaid || 0);

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        sale.status === 'cancelled' ? 'bg-slate-50/50 opacity-60' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                        <span className="text-orange-600">{sale.invoiceNo}</span>
                      </td>

                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                        {formatDate ? formatDate(sale.date) : sale.date}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{sale.customerName}</div>
                        <div className="text-[11px] text-slate-400">{sale.customerType} · {toBnNum(sale.customerPhone)}</div>
                      </td>

                      <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                        {formatQty(sale.totalFullQty)}
                      </td>

                      <td className="px-3 py-2.5 text-center font-bold text-emerald-700">
                        {formatQty(sale.totalEmptyReceived)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(sale.grandTotal)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">
                        {formatCurrency(sale.amountPaid)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                        {saleDue > 0 ? formatCurrency(saleDue) : formatCurrency(0)}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <CylinderDueBadge count={sale.netCylinderDueAdded} />
                      </td>

                      <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                        {sale.paymentMethod}
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <PaymentStatusBadge status={sale.status} />
                      </td>

                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedSaleDetails(sale)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title={t('sales.view_details')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintSale(sale)}
                            className="p-1 rounded text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                            title={t('sales.print_invoice')}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintChallan({ sale })}
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title={t('sales.print_challan')}
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                          {sale.status !== 'cancelled' && (
                            <RoleGate action="cancel_sale">
                              <button
                                onClick={() => {
                                  setCancelModalSale(sale);
                                  setCancelReason('');
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title={t('sales.cancel_invoice')}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </RoleGate>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Details Modal */}
      {selectedSaleDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('sales.sale_details')} - {selectedSaleDetails.invoiceNo}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedSaleDetails.customerName} · {formatDate ? formatDate(selectedSaleDetails.date) : selectedSaleDetails.date} ({toBnNum ? toBnNum(selectedSaleDetails.createdAt) : selectedSaleDetails.createdAt})
                </p>
              </div>
              <button
                onClick={() => setSelectedSaleDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2">{t('sales.product')}</th>
                    <th className="p-2 text-center">{t('sales.full_qty')}</th>
                    <th className="p-2 text-center">{t('sales.empty_recv')}</th>
                    <th className="p-2 text-right">{t('sales.unit_rate')}</th>
                    <th className="p-2 text-right">{t('common.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSaleDetails.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800">
                        {item.brand} {language === 'bn' ? toBnNum(item.size) : item.size}
                      </td>
                      <td className="p-2 text-center font-bold">{formatQty(item.fullQty)}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{formatQty(item.emptyQtyReceived)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financials Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <div className="text-slate-500">{t('sales.salesperson')}: <strong className="text-slate-700">{selectedSaleDetails.salesperson}</strong></div>
                <div className="text-slate-500">{t('sales.warehouse')}: <strong className="text-slate-700">{selectedSaleDetails.godown}</strong></div>
                <div className="text-slate-500">{t('sales.payment_method')}: <strong className="text-slate-700">{selectedSaleDetails.paymentMethod}</strong></div>
                {selectedSaleDetails.notes && (
                  <div className="text-slate-500">{t('common.notes')}: <span className="text-slate-700">{selectedSaleDetails.notes}</span></div>
                )}
              </div>
              <div className="space-y-1 text-right">
                <div className="text-slate-500">{t('sales.subtotal')}: <strong className="text-slate-700">{formatCurrency(selectedSaleDetails.subtotal)}</strong></div>
                {selectedSaleDetails.transportCharge > 0 && (
                  <div className="text-slate-500">{t('sales.transport')}: <strong className="text-slate-700">{formatCurrency(selectedSaleDetails.transportCharge)}</strong></div>
                )}
                <div className="text-slate-900 font-extrabold text-sm">{t('sales.grand_total')}: {formatCurrency(selectedSaleDetails.grandTotal)}</div>
                <div className="text-emerald-700 font-bold">{t('sales.amount_paid')}: {formatCurrency(selectedSaleDetails.amountPaid)}</div>
                <div className="text-rose-700 font-bold">{t('sales.due_remaining')}: {formatCurrency(selectedSaleDetails.grandTotal - selectedSaleDetails.amountPaid)}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setPrintSale(selectedSaleDetails);
                  setSelectedSaleDetails(null);
                }}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('sales.print_invoice')}</span>
              </button>
              <button
                onClick={() => {
                  setPrintChallan({ sale: selectedSaleDetails });
                  setSelectedSaleDetails(null);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold flex items-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t('sales.print_challan')}</span>
              </button>
              <button
                onClick={() => setSelectedSaleDetails(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 border border-rose-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Ban className="w-5 h-5" />
              <span>{t('sales.cancel_confirm_title')} - {cancelModalSale.invoiceNo}</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              {t('sales.cancel_warning')}
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('sales.cancel_reason_label')}
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder={t('sales.cancel_reason_placeholder')}
                rows={3}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCancelModalSale(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
              >
                {t('sales.keep_invoice')}
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded font-bold"
              >
                {t('sales.confirm_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

