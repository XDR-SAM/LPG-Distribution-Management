import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { Printer, X, CheckCircle, ShieldCheck, Flame } from 'lucide-react';

export const PrintInvoiceModal: React.FC = () => {
  const { printInvoice, setPrintInvoice } = useApp();
  const [printFormat, setPrintFormat] = useState<'A4' | 'POS'>('A4');

  if (!printInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto no-print-bg">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 text-xs my-auto print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              Print Invoice - {printInvoice.invoiceNo}
            </h3>
            <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-300">
              <button
                type="button"
                onClick={() => setPrintFormat('A4')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  printFormat === 'A4' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                }`}
              >
                Standard (A4 / A5)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('POS')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  printFormat === 'POS' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                }`}
              >
                POS Thermal (80mm)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>
            <button
              onClick={() => setPrintInvoice(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div className={`p-4 bg-white border border-slate-100 rounded-lg print:border-none print:p-0 ${
          printFormat === 'POS' ? 'max-w-sm mx-auto font-mono text-[11px]' : 'space-y-4'
        }`}>
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-3">
            <div className="flex items-center justify-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-600 inline" />
              <h1 className="text-xl font-black text-slate-900 tracking-tight">RAHMAN LPG DISTRIBUTION</h1>
            </div>
            <p className="text-slate-600 text-[11px] font-medium mt-0.5">
              Govt. Authorized LPG Wholesale & Godown Distribution Agency
            </p>
            <p className="text-slate-500 text-[10px]">
              Ring Road, Mohammadpur, Dhaka-1207 · Phone: 01711-000000 · BERC Lic: BERC/LPG/DHK-0419
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white text-[11px] font-black tracking-wider uppercase rounded">
              Sales Invoice & Cylinder Memo
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer / Dealer:</span>
              <div className="font-extrabold text-slate-900 text-sm">{printInvoice.customerName}</div>
              <div className="text-slate-600 text-[11px]">Phone: {printInvoice.customerPhone || 'N/A'}</div>
              <div className="text-slate-500 text-[10px]">Delivery: {printInvoice.customerArea || 'Counter Pickup'}</div>
            </div>

            <div className="text-right">
              <div className="space-y-0.5">
                <div>
                  <span className="text-slate-500 text-[11px]">Invoice No: </span>
                  <strong className="font-mono text-slate-900 text-xs">{printInvoice.invoiceNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Date: </span>
                  <strong className="text-slate-800">{printInvoice.date}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Payment Mode: </span>
                  <strong className="text-slate-800">{printInvoice.paymentMethod}</strong>
                </div>
                {printInvoice.deliveryVehicle && (
                  <div>
                    <span className="text-slate-500 text-[11px]">Vehicle: </span>
                    <span className="font-medium text-slate-700">{printInvoice.deliveryVehicle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded overflow-hidden mt-3">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2">SL</th>
                  <th className="p-2">Brand & Spec</th>
                  <th className="p-2 text-center">Full Given</th>
                  <th className="p-2 text-right">Rate (৳)</th>
                  <th className="p-2 text-center">Empty Recv</th>
                  <th className="p-2 text-center text-amber-900">Cyl. Due</th>
                  <th className="p-2 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">
                      {item.brand} {item.size}
                    </td>
                    <td className="p-2 text-center font-bold text-orange-600">{item.fullQty} pcs</td>
                    <td className="p-2 text-right">{formatBDT(item.unitPrice)}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{item.emptyReceived} pcs</td>
                    <td className="p-2 text-center font-bold text-amber-800 bg-amber-50/50">
                      {item.emptyDue} pcs
                    </td>
                    <td className="p-2 text-right font-black text-slate-900">{formatBDT(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-amber-50/40 rounded border border-amber-200 space-y-1 text-[11px]">
              <span className="font-bold text-amber-900 block">Cylinder Exchange Summary:</span>
              <div className="flex justify-between text-slate-700">
                <span>Total Full Cylinders Delivered:</span>
                <strong>{printInvoice.totalFullQty} pcs</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Empty Cylinders Collected:</span>
                <strong className="text-emerald-700">{printInvoice.totalEmptyReceived} pcs</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-amber-200 font-bold text-amber-900">
                <span>Net Unreturned Empty Dues:</span>
                <span>{printInvoice.totalEmptyDue} Cylinders</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal Gas Value:</span>
                <strong className="text-slate-900">{formatBDT(printInvoice.subTotal)}</strong>
              </div>
              {printInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span>- {formatBDT(printInvoice.discount)}</span>
                </div>
              )}
              {printInvoice.cylinderDepositTotal > 0 && (
                <div className="flex justify-between text-purple-700">
                  <span>Cylinder Security Deposit:</span>
                  <span>+ {formatBDT(printInvoice.cylinderDepositTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-y border-slate-300 font-extrabold text-sm text-slate-900">
                <span>Invoice Grand Total:</span>
                <span className="text-base">{formatBDT(printInvoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Paid Today:</span>
                <span>{formatBDT(printInvoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-black text-sm pt-1 border-t border-slate-200">
                <span>Current Invoice Due:</span>
                <span>{formatBDT(printInvoice.grandTotal - printInvoice.amountPaid)}</span>
              </div>
            </div>
          </div>

          {/* Safety Notice & Signatures */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 italic text-center">
              * গুরুত্বপূর্ণ বিজ্ঞপ্তি: ডেলিভারি গ্রহণের পূর্বে সিল ও নিরাপত্তা ক্যাপ পরীক্ষা করুন। খালি সিলিন্ডার গ্রাহকের নিজস্ব দায়বদ্ধতা।
            </p>

            <div className="pt-10 flex justify-between text-xs text-slate-600">
              <div className="text-center w-40 border-t border-slate-400 pt-1">
                Customer Signature
              </div>
              <div className="text-center w-40 border-t border-slate-400 pt-1">
                For Rahman LPG Distribution
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
