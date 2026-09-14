import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { Building2, Printer, Calendar, FileText, ArrowUpRight, RotateCcw } from 'lucide-react';

export const SupplierLedgerView: React.FC = () => {
  const { suppliers, purchases, supplierPayments } = useApp();
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-14');

  const currentSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  const supPurchases = purchases
    .filter(p => p.supplierId === currentSupplier?.id)
    .map(p => ({
      date: p.date,
      type: 'PURCHASE',
      reference: p.purchaseNo,
      companyRef: p.supplierInvoiceNo,
      description: `Purchase of ${p.totalFullReceived} full cylinders (Sent ${p.totalEmptySent} empties)`,
      debit: 0,
      credit: p.grandTotal, // supplier credit (payable increased)
      amountPaid: p.amountPaid,
      fullReceived: p.totalFullReceived,
      emptySent: p.totalEmptySent,
    }));

  const supPayments = supplierPayments
    .filter(p => p.supplierId === currentSupplier?.id)
    .map(p => ({
      date: p.date,
      type: 'PAYMENT',
      reference: p.voucherNo,
      companyRef: p.chequeNo || p.transactionRef || 'Direct Transfer',
      description: `Payment made via ${p.paymentMethod}`,
      debit: p.amount, // supplier debit (payable decreased)
      credit: 0,
      amountPaid: p.amount,
      fullReceived: 0,
      emptySent: 0,
    }));

  const combined = [...supPurchases, ...supPayments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningPayable = 120000;
  const ledgerRows = combined.map(entry => {
    runningPayable = runningPayable + entry.credit - entry.debit;
    return {
      ...entry,
      balance: runningPayable,
    };
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Supplier Ledger & Cylinder Account</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Depot financial reconciliation and empty truck return account statements
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Statement</span>
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs no-print">
        <div className="flex-1 min-w-[280px]">
          <label className="block font-bold text-slate-700 mb-1">Select Supplier Depot</label>
          <select
            value={selectedSupplierId}
            onChange={e => setSelectedSupplierId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.companyName} - Payable: {formatBDT(s.currentPayable)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="p-1.5 border border-slate-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="p-1.5 border border-slate-300 rounded"
          />
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
          <div>
            <div className="text-xl font-black text-slate-900">RAHMAN LPG DISTRIBUTION</div>
            <div className="text-xs text-slate-500">Mohammadpur Godown, Dhaka · Supplier Account Ledger</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase bg-slate-100 text-slate-800 px-2 py-1 rounded">
              Supplier Statement
            </span>
            <div className="text-xs text-slate-500 mt-1 font-mono">{fromDate} to {toDate}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Supplier Depot</span>
            <div className="text-sm font-extrabold text-slate-900">{currentSupplier?.companyName}</div>
            <div className="text-slate-600">Contact: {currentSupplier?.contactPerson} ({currentSupplier?.phone})</div>
            <div className="text-slate-500">{currentSupplier?.address}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Balance & Cylinder Position</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Payable Balance:</span>
              <strong className="text-rose-600 font-black text-sm">{formatBDT(currentSupplier?.currentPayable)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Empty Cylinders at Company Depot:</span>
              <strong className="text-blue-700 font-bold">{currentSupplier?.emptyCylindersHeld} pcs</strong>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Ref No</th>
                <th className="px-3 py-2.5">Challan / Cheque</th>
                <th className="px-3 py-2.5">Particulars</th>
                <th className="px-2 py-2.5 text-center">Full Recv</th>
                <th className="px-2 py-2.5 text-center">Empty Sent</th>
                <th className="px-3 py-2.5 text-right">Debit (Payment)</th>
                <th className="px-3 py-2.5 text-right">Credit (Purchase)</th>
                <th className="px-3 py-2.5 text-right">Balance Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-500">{row.date}</td>
                  <td className="px-3 py-2 font-mono font-bold text-slate-900">{row.reference}</td>
                  <td className="px-3 py-2 font-mono text-slate-600">{row.companyRef}</td>
                  <td className="px-3 py-2 text-slate-700">{row.description}</td>
                  <td className="px-2 py-2 text-center font-bold text-orange-600">
                    {row.fullReceived > 0 ? row.fullReceived : '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-blue-700">
                    {row.emptySent > 0 ? row.emptySent : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-700">
                    {row.debit > 0 ? formatBDT(row.debit) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">
                    {row.credit > 0 ? formatBDT(row.credit) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-black text-rose-600">
                    {formatBDT(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
