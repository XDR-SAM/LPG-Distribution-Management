import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CylinderSettlementType, PaymentMethod, SaleItem } from '../../types';
import { formatBDT } from '../../utils/formatters';
import {
  Plus,
  Trash2,
  AlertTriangle,
  Printer,
  CheckCircle,
  Truck,
  RotateCcw,
  Receipt,
  User,
  ShieldAlert
} from 'lucide-react';

export const NewSaleView: React.FC = () => {
  const {
    products,
    customers,
    currentUser,
    settings,
    addSale,
    setActiveView,
    setPrintSale,
    setPrintChallan,
  } = useApp();

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [date, setDate] = useState<string>('2026-09-14');
  const [salesperson, setSalesperson] = useState<string>(currentUser?.name || 'Kawsar Ahmed');
  const [godown, setGodown] = useState<string>('Main Godown Mohammadpur');

  // Items table
  const [items, setItems] = useState<SaleItem[]>([
    {
      id: `item-${Date.now()}`,
      productId: products[0]?.id || '',
      brand: products[0]?.brand || 'Bashundhara LP Gas',
      size: products[0]?.size || '12 KG',
      fullQty: 10,
      emptyQtyReceived: 10,
      unitPrice: products[0]?.dealerPrice || 1410,
      discount: 0,
      amount: (products[0]?.dealerPrice || 1410) * 10,
      cylinderSettlement: 'exchange',
    }
  ]);

  // Charges & Payments
  const [transportCharge, setTransportCharge] = useState<number>(300);
  const [loadingCharge, setLoadingCharge] = useState<number>(100);
  const [otherCharge, setOtherCharge] = useState<number>(0);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('Standard exchange delivery.');

  // Credit limit override modal
  const [showCreditWarning, setShowCreditWarning] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isOverrideApproved, setIsOverrideApproved] = useState<boolean>(false);

  // Success dialog
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Calculations
  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const totalFullQty = items.reduce((sum, i) => sum + i.fullQty, 0);
  const totalEmptyReceived = items.reduce((sum, i) => sum + i.emptyQtyReceived, 0);
  const netCylinderDue = totalFullQty - totalEmptyReceived;

  const vatRate = settings.vatModeEnabled ? settings.vatRatePercent : 0;
  const vatAmount = settings.vatModeEnabled ? Math.round((subtotal - overallDiscount) * (vatRate / 100)) : 0;
  const grandTotal = subtotal - overallDiscount + transportCharge + loadingCharge + otherCharge + vatAmount;

  const previousDue = selectedCustomer ? selectedCustomer.currentDue : 0;
  const currentDue = previousDue + (grandTotal - amountPaid);

  // Check credit limit
  const isCreditLimitExceeded = selectedCustomer && (currentDue > selectedCustomer.creditLimit);

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      const price = selectedCustomer?.customerType === 'dealer' ? prod.dealerPrice : prod.sellingPrice;
      const amount = (price * updated[index].fullQty) - updated[index].discount;
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        brand: prod.brand,
        size: prod.size,
        unitPrice: price,
        amount,
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'fullQty' || field === 'unitPrice' || field === 'discount') {
        const fullQty = Number(field === 'fullQty' ? value : item.fullQty);
        const unitPrice = Number(field === 'unitPrice' ? value : item.unitPrice);
        const discount = Number(field === 'discount' ? value : item.discount);
        item.amount = (fullQty * unitPrice) - discount;

        // Auto-match empty received if exchange
        if (field === 'fullQty' && item.cylinderSettlement === 'exchange') {
          item.emptyQtyReceived = fullQty;
        }
      }

      if (field === 'cylinderSettlement') {
        if (value === 'due') item.emptyQtyReceived = 0;
        if (value === 'exchange') item.emptyQtyReceived = item.fullQty;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addItemRow = () => {
    const first = products[0];
    const price = selectedCustomer?.customerType === 'dealer' ? first.dealerPrice : first.sellingPrice;
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: first.id,
        brand: first.brand,
        size: first.size,
        fullQty: 5,
        emptyQtyReceived: 5,
        unitPrice: price,
        discount: 0,
        amount: price * 5,
        cylinderSettlement: 'exchange',
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSale = (printType?: 'invoice' | 'challan') => {
    if (!selectedCustomer) return;

    // Validate stock
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.fullStock < item.fullQty) {
        alert(`Insufficient stock for ${prod.brand} ${prod.size}. Available: ${prod.fullStock} units, Requested: ${item.fullQty} units.`);
        return;
      }
    }

    // Validate credit limit
    if (isCreditLimitExceeded && !isOverrideApproved) {
      setShowCreditWarning(true);
      return;
    }

    const newSale = addSale({
      date,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.businessName,
      customerType: selectedCustomer.customerType,
      customerPhone: selectedCustomer.phone,
      customerAddress: `${selectedCustomer.address}, ${selectedCustomer.area}`,
      salesperson,
      godown,
      items,
      subtotal,
      discount: overallDiscount,
      transportCharge,
      loadingCharge,
      otherCharge,
      vatRate,
      vatAmount,
      grandTotal,
      previousDue,
      amountPaid,
      currentDue,
      totalFullQty,
      totalEmptyReceived,
      netCylinderDueAdded: netCylinderDue,
      paymentMethod,
      notes,
      overrideCreditLimit: isCreditLimitExceeded ? true : undefined,
      overrideReason: isCreditLimitExceeded ? overrideReason : undefined,
    });

    if (printType === 'invoice') {
      setPrintSale(newSale);
    } else if (printType === 'challan') {
      setPrintChallan({ sale: newSale });
    } else {
      setCompletedSale(newSale);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              New Sale & Delivery Dispatch (POS)
            </h1>
            <span className="text-[11px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-200">
              INV-2026-(Auto)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record cylinder distribution, exchange empty returns, and collect payments
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveView('sales_list')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors"
          >
            Sales List
          </button>
          <button
            onClick={() => handleSaveSale()}
            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold shadow-xs transition-colors"
          >
            Save Sale
          </button>
        </div>
      </div>

      {/* Main Form Layout: Left Items + Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Customer Details & Products Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Selection Card */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <span>Customer & Invoice Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Select Customer / Dealer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:bg-white focus:outline-orange-500"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.area}) - Due: {formatBDT(c.currentDue)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Godown Warehouse</label>
                <select
                  value={godown}
                  onChange={e => setGodown(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  <option>Main Godown Mohammadpur</option>
                  <option>Sub-Godown Mirpur</option>
                </select>
              </div>
            </div>

            {/* Customer Live Status Banner */}
            {selectedCustomer && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Type:</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedCustomer.customerType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Current Financial Due:</span>
                  <span className="font-bold text-rose-600">{formatBDT(selectedCustomer.currentDue)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Credit Limit:</span>
                  <span className="font-bold text-slate-900">{formatBDT(selectedCustomer.creditLimit)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Contact Phone:</span>
                  <span className="font-bold text-slate-700">{selectedCustomer.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Items Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Delivered Cylinders & Empty Return Exchange
                </h2>
              </div>
              <button
                onClick={addItemRow}
                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Product / Brand</th>
                    <th className="px-2 py-2 text-center w-20">Full Qty</th>
                    <th className="px-2 py-2 text-center w-24">Empty Recv</th>
                    <th className="px-2 py-2 text-right w-24">Rate (৳)</th>
                    <th className="px-2 py-2 text-right w-20">Disc (৳)</th>
                    <th className="px-3 py-2 text-right w-24">Amount</th>
                    <th className="px-2 py-2 w-28">Settlement</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const isLowStock = prod && prod.fullStock < item.fullQty;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2">
                          <select
                            value={item.productId}
                            onChange={e => handleProductChange(idx, e.target.value)}
                            className="w-full p-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.brand} {p.size} (Stock: {p.fullStock})
                              </option>
                            ))}
                          </select>
                          {isLowStock && (
                            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-3 h-3" /> Insufficient Full stock ({prod?.fullStock})
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.fullQty}
                            onChange={e => handleItemChange(idx, 'fullQty', Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-16 text-center p-1 border border-slate-300 rounded font-bold text-slate-900 bg-white"
                          />
                        </td>

                        <td className="px-2 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.emptyQtyReceived}
                            onChange={e => handleItemChange(idx, 'emptyQtyReceived', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 text-center p-1 border border-slate-300 rounded font-bold text-slate-900 bg-amber-50"
                          />
                        </td>

                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-20 text-right p-1 border border-slate-300 rounded font-medium text-slate-900"
                          />
                        </td>

                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-16 text-right p-1 border border-slate-300 rounded font-medium text-slate-900"
                          />
                        </td>

                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {formatBDT(item.amount)}
                        </td>

                        <td className="px-2 py-2">
                          <select
                            value={item.cylinderSettlement}
                            onChange={e => handleItemChange(idx, 'cylinderSettlement', e.target.value as CylinderSettlementType)}
                            className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-[11px]"
                          >
                            <option value="exchange">Exchange</option>
                            <option value="due">Cylinder Due</option>
                            <option value="deposit">Deposit Taken</option>
                            <option value="sold_permanently">Permanent Sale</option>
                          </select>
                        </td>

                        <td className="px-2 py-2 text-center">
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItemRow(idx)}
                              className="text-slate-400 hover:text-rose-600"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cylinder balance notice */}
            <div className="p-3 bg-amber-500/10 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-950 font-medium">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>
                  Delivering <strong>{totalFullQty} full cylinders</strong>. Receiving <strong>{totalEmptyReceived} empty cylinders</strong>.
                </span>
              </div>
              <span className="font-bold text-amber-900">
                Net Cylinder Due to Customer: +{netCylinderDue} pcs
              </span>
            </div>
          </div>

          {/* Notes & Salesperson */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Salesperson / Operator</label>
              <input
                type="text"
                value={salesperson}
                onChange={e => setSalesperson(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Notes / Instructions</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Empty cylinders to collect on return trip"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Bill Calculations & Settlement */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              Payment & Settlement
            </h2>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Product Subtotal:</span>
                <span className="font-bold text-slate-900">{formatBDT(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Special Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={overallDiscount}
                  onChange={e => setOverallDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right p-1 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Transport Charge:</span>
                <input
                  type="number"
                  min="0"
                  value={transportCharge}
                  onChange={e => setTransportCharge(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right p-1 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Loading / Labor:</span>
                <input
                  type="number"
                  min="0"
                  value={loadingCharge}
                  onChange={e => setLoadingCharge(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right p-1 border border-slate-300 rounded font-medium"
                />
              </div>

              {settings.vatModeEnabled && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 font-semibold text-blue-700">
                    VAT ({settings.vatRatePercent}% Mushak):
                  </span>
                  <span className="font-bold text-blue-700">{formatBDT(vatAmount)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900 bg-slate-50 px-2 rounded">
                <span>Grand Total:</span>
                <span className="text-orange-600 text-base">{formatBDT(grandTotal)}</span>
              </div>
            </div>

            {/* Previous Due & Ledger Effect */}
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Balance Due:</span>
                <span className="font-bold text-rose-700">{formatBDT(previousDue)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total Outstanding:</span>
                <span className="font-extrabold text-slate-900">{formatBDT(previousDue + grandTotal)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Paid Now (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border-2 border-orange-500 rounded font-black text-slate-900 text-base focus:bg-orange-50/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="bKash">bKash (Merchant)</option>
                  <option value="Nagad">Nagad (Merchant)</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer (Islami Bank)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit / Due">Credit / Full Due</option>
                </select>
              </div>

              {/* Remaining Financial Due Calculation */}
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-rose-800">Closing Financial Due:</span>
                  <span className="font-black text-rose-700 text-sm">{formatBDT(currentDue)}</span>
                </div>
                {isCreditLimitExceeded && (
                  <p className="text-[10px] text-rose-700 mt-1 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 shrink-0" /> Exceeds Credit Limit ({formatBDT(selectedCustomer?.creditLimit)})
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSaveSale()}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Sale Transaction</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSaveSale('invoice')}
                  className="py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Save & Print Invoice</span>
                </button>
                <button
                  onClick={() => handleSaveSale('challan')}
                  className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Save & Challan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Limit Override Modal */}
      {showCreditWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 border border-rose-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Credit Limit Warning</span>
            </div>

            <p className="text-slate-600">
              Customer <strong>{selectedCustomer?.businessName}</strong> has a credit limit of{' '}
              <strong>{formatBDT(selectedCustomer?.creditLimit)}</strong>. This sale will increase their outstanding
              balance to <strong>{formatBDT(currentDue)}</strong>.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Manager / Admin Override Reason (Required) *
              </label>
              <textarea
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="e.g. Verbal approval from Haji Shaheb; committed payment by tomorrow noon."
                rows={3}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCreditWarning(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
              >
                Cancel Sale
              </button>
              <button
                disabled={!overrideReason.trim()}
                onClick={() => {
                  setIsOverrideApproved(true);
                  setShowCreditWarning(false);
                  handleSaveSale();
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded font-bold"
              >
                Authorize & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Sale Successfully Completed!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Invoice <strong>{completedSale.invoiceNo}</strong> created for{' '}
                <strong>{completedSale.customerName}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-left border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-slate-900">{formatBDT(completedSale.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Collected:</span>
                <span className="font-bold text-emerald-600">{formatBDT(completedSale.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cylinders (Full / Empty):</span>
                <span className="font-bold text-slate-800">
                  {completedSale.totalFullQty} full / {completedSale.totalEmptyReceived} empty
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <button
                onClick={() => {
                  setPrintSale(completedSale);
                  setCompletedSale(null);
                }}
                className="py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => {
                  setPrintChallan({ sale: completedSale });
                  setCompletedSale(null);
                }}
                className="py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded flex items-center justify-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Print Challan</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCompletedSale(null);
                setActiveView('sales_list');
              }}
              className="w-full text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
            >
              Close & View Sales List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
