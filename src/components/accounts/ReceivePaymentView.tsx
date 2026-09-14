import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { formatBDT } from '../../utils/formatters';
import { ArrowDownLeft, CheckCircle, Printer, User, Receipt, Clock } from 'lucide-react';

export const ReceivePaymentView: React.FC = () => {
  const {
    customers,
    selectedCustomerForDetails,
    receivePayment,
    setActiveView,
    setPrintReceipt,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    selectedCustomerForDetails?.id || customers[0]?.id || ''
  );
  const [date, setDate] = useState<string>('2026-09-14');
  const [amount, setAmount] = useState<number>(15000);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [account, setAccount] = useState<string>('Cash in Hand');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('Payment collected against invoice due.');
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || amount <= 0) return;

    const receipt = receivePayment({
      date,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.businessName,
      amount,
      discount,
      paymentMethod,
      account,
      transactionRef: transactionRef || undefined,
      notes,
    });

    setCompletedReceipt(receipt);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Receive Customer Payment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record money received from dealers or retail shops, reduce outstanding customer dues, and issue printed receipt
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
            <label className="block font-bold text-slate-700 mb-1">Select Customer / Dealer *</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.area}) — Due: {formatBDT(c.currentDue)}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Current Outstanding Due:</span>
                <span className="font-black text-rose-600 text-base">{formatBDT(selectedCustomer.currentDue)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Credit Limit:</span>
                <span className="font-bold text-slate-800">{formatBDT(selectedCustomer.creditLimit)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Proprietor / Phone:</span>
                <span className="font-semibold text-slate-700">{selectedCustomer.contactPerson} ({selectedCustomer.phone})</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Receipt Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deposit Account / Box *</label>
              <select
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
              >
                <option value="Cash in Hand">Cash in Hand (Drawer)</option>
                <option value="Islami Bank (A/C: 205011...)">Islami Bank CD Account</option>
                <option value="Dutch-Bangla Bank (DBBL)">Dutch-Bangla Bank (DBBL)</option>
                <option value="bKash Merchant">bKash Merchant Wallet</option>
                <option value="Nagad Merchant">Nagad Merchant Wallet</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
              >
                <option value="Cash">Cash in Hand</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank Transfer">Direct Bank Deposit / BEFTN</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cheque No / Transaction TrxID</label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. TrxID 9K4J2L1M or Cheque #49201"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/40 rounded-lg border border-emerald-200">
            <div>
              <label className="block font-black text-emerald-950 mb-1 text-xs">Amount Received (৳) *</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 border-2 border-emerald-500 rounded font-black text-emerald-900 text-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">Special Cash Discount / Rebate (৳)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 border border-slate-300 rounded font-bold text-slate-800 text-base"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks / Note</label>
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record Payment & Update Customer Ledger</span>
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Completed Dialog */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-center space-y-4 text-xs">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Received Successfully!</h3>
              <p className="text-slate-500 mt-0.5">Money receipt #{completedReceipt.receiptNo} has been generated</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-left border border-slate-200">
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong className="text-slate-900">{completedReceipt.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <strong className="text-emerald-700 text-sm">{formatBDT(completedReceipt.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Method / Account:</span>
                <strong className="text-slate-700">{completedReceipt.paymentMethod} ({completedReceipt.account})</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPrintReceipt(completedReceipt);
                  setCompletedReceipt(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Money Receipt</span>
              </button>
              <button
                onClick={() => {
                  setCompletedReceipt(null);
                  setActiveView('accounts_cashbook');
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded"
              >
                Cashbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
