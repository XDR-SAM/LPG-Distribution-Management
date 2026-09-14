import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/formatters';
import { ArrowUpRight, CheckCircle, Building2, Wallet } from 'lucide-react';

export const MakePaymentView: React.FC = () => {
  const { suppliers, paySupplier, setActiveView } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [date, setDate] = useState<string>('2026-09-14');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [account, setAccount] = useState<string>('Islami Bank (A/C: 205011...)');
  const [chequeNo, setChequeNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('Depot refinery shipment advance/bill settlement');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || amount <= 0) return;

    paySupplier({
      date,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.companyName,
      amount,
      paymentMethod,
      account,
      chequeNo: chequeNo || undefined,
      notes,
    });

    setActiveView('accounts_cashbook');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Pay Supplier / Depot</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue payments to LPG refineries and plant operators, reducing company trade payables
          </p>
        </div>

        <button
          onClick={() => setActiveView('accounts_cashbook')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
        >
          View Cashbook
        </button>
      </div>

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Supplier Depot *</label>
            <select
              value={selectedSupplierId}
              onChange={e => setSelectedSupplierId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.companyName} — Payable: {formatBDT(s.currentPayable)}
                </option>
              ))}
            </select>
          </div>

          {selectedSupplier && (
            <div className="p-3 bg-rose-50/40 rounded-lg border border-rose-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[11px]">Current Outstanding Payable:</span>
                <span className="font-black text-rose-600 text-base">{formatBDT(selectedSupplier.currentPayable)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Contact Depot:</span>
                <span className="font-semibold text-slate-700">{selectedSupplier.contactPerson} ({selectedSupplier.phone})</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
              >
                <option value="Bank Transfer">Direct Bank Transfer / BEFTN / RTGS</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Godown Cash in Hand</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Source Account *</label>
              <select
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
              >
                <option value="Islami Bank (A/C: 205011...)">Islami Bank CD Account</option>
                <option value="Dutch-Bangla Bank (DBBL)">Dutch-Bangla Bank (DBBL)</option>
                <option value="Cash in Hand">Godown Cash in Hand</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cheque No / Transfer Reference</label>
              <input
                type="text"
                value={chequeNo}
                onChange={e => setChequeNo(e.target.value)}
                placeholder="e.g. Cheque #891240 or BEFTN TrxID"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="block font-black text-slate-900 mb-1 text-xs">Payment Amount (৳) *</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 border-2 border-rose-500 rounded font-black text-rose-900 text-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Memo / Purpose</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record Supplier Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
