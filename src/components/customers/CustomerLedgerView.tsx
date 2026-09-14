import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { FileText, Printer, Search, Calendar, User, Phone, MapPin, ArrowDownLeft, RotateCcw } from 'lucide-react';

export const CustomerLedgerView: React.FC = () => {
  const {
    customers,
    selectedCustomerForDetails,
    setSelectedCustomerForDetails,
    sales,
    moneyReceipts,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    selectedCustomerForDetails?.id || customers[0]?.id || ''
  );
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-14');

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Customer sales
  const customerSales = sales
    .filter(s => s.customerId === currentCustomer?.id && s.status !== 'cancelled')
    .map(s => ({
      date: s.date,
      type: 'INVOICE',
      reference: s.invoiceNo,
      description: `Sale of ${s.totalFullQty} cylinders (Exchange ${s.totalEmptyReceived} empties)`,
      debit: s.grandTotal,
      credit: s.amountPaid,
      fullCylinders: s.totalFullQty,
      emptyCylinders: s.totalEmptyReceived,
    }));

  // Customer money receipts
  const customerReceipts = moneyReceipts
    .filter(r => r.customerId === currentCustomer?.id)
    .map(r => ({
      date: r.date,
      type: 'PAYMENT',
      reference: r.receiptNo,
      description: `Cash/Online payment received (${r.paymentMethod})`,
      debit: 0,
      credit: r.amount,
      fullCylinders: 0,
      emptyCylinders: 0,
    }));

  // Combined ledger entries
  const allEntries = [...customerSales, ...customerReceipts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningBalance = 25000; // Simulated opening balance
  const ledgerRows = allEntries.map(entry => {
    runningBalance = runningBalance + entry.debit - entry.credit;
    return {
      ...entry,
      balance: runningBalance,
    };
  });

  const totalSalesDebit = allEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalPaidCredit = allEntries.reduce((sum, e) => sum + e.credit, 0);
  const totalEmptyDue = currentCustomer?.cylinderHoldings.reduce((s, h) => s + h.emptyDue, 0) || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Customer Ledger & Statement of Account</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready statement containing financial balance, invoice history, and cylinder exchange records
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Customer & Date Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs no-print">
        <div className="flex-1 min-w-[280px]">
          <label className="block font-bold text-slate-700 mb-1">Select Customer / Dealer</label>
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.businessName} ({c.area}) - Due: {formatBDT(c.currentDue)}
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

      {/* Printable Statement Sheet */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5 print:border-none print:shadow-none print:p-0">
        {/* Printable Business Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">RAHMAN LPG DISTRIBUTION</div>
            <div className="text-xs text-slate-600 font-medium">Mohammadpur, Dhaka-1207, Bangladesh</div>
            <div className="text-xs text-slate-500">Phone: 01711-000000 · Email: info@rahmanlpg.bd</div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-1 rounded">
              Customer Statement
            </span>
            <div className="text-xs text-slate-500 mt-1 font-mono">Statement Period: {fromDate} to {toDate}</div>
          </div>
        </div>

        {/* Customer Details Box & Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Account Details</span>
            <div className="text-sm font-extrabold text-slate-900">{currentCustomer?.businessName}</div>
            <div className="text-slate-600">Proprietor: {currentCustomer?.contactPerson}</div>
            <div className="text-slate-600">Phone: {currentCustomer?.phone}</div>
            <div className="text-slate-500">{currentCustomer?.address}, {currentCustomer?.area}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Financial Position</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Billed:</span>
              <strong className="text-slate-900">{formatBDT(totalSalesDebit)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Paid:</span>
              <strong className="text-emerald-700">{formatBDT(totalPaidCredit)}</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-700">Closing Balance Due:</span>
              <strong className="text-rose-600 font-black text-sm">{formatBDT(currentCustomer?.currentDue)}</strong>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Cylinder Asset Position</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Empty Cylinders Due:</span>
              <strong className="text-amber-900 text-sm font-black">{totalEmptyDue} pcs</strong>
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              Holdings breakdown:
              {currentCustomer?.cylinderHoldings.map((h, i) => (
                <span key={i} className="block font-medium text-slate-700">
                  • {h.brand} {h.size}: <strong>{h.emptyDue} pcs due</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Voucher / Invoice</th>
                <th className="px-3 py-2.5">Particulars / Description</th>
                <th className="px-2 py-2.5 text-center">Full Given</th>
                <th className="px-2 py-2.5 text-center">Empty Recv</th>
                <th className="px-3 py-2.5 text-right">Debit (৳)</th>
                <th className="px-3 py-2.5 text-right">Credit (৳)</th>
                <th className="px-3 py-2.5 text-right">Balance Due (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Opening row */}
              <tr className="bg-slate-50/40 italic text-slate-500">
                <td className="px-3 py-2">{fromDate}</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2 font-medium">Opening Balance B/F</td>
                <td className="px-2 py-2 text-center">—</td>
                <td className="px-2 py-2 text-center">—</td>
                <td className="px-3 py-2 text-right">—</td>
                <td className="px-3 py-2 text-right">—</td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">{formatBDT(25000)}</td>
              </tr>

              {ledgerRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-2 font-mono font-bold text-slate-900">{row.reference}</td>
                  <td className="px-3 py-2 text-slate-700">{row.description}</td>
                  <td className="px-2 py-2 text-center font-bold text-orange-600">
                    {row.fullCylinders > 0 ? row.fullCylinders : '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-emerald-700">
                    {row.emptyCylinders > 0 ? row.emptyCylinders : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">
                    {row.debit > 0 ? formatBDT(row.debit) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-700">
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

        {/* Printable Signatures */}
        <div className="pt-12 flex justify-between text-xs text-slate-600">
          <div className="text-center w-48 border-t border-slate-300 pt-1">
            Customer / Dealer Signature
          </div>
          <div className="text-center w-48 border-t border-slate-300 pt-1">
            Authorized Signature & Seal
          </div>
        </div>
      </div>
    </div>
  );
};
