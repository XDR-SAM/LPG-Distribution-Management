import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { Printer, X, Receipt, CheckCircle } from 'lucide-react';

export const PrintMoneyReceiptModal: React.FC = () => {
  const { printReceipt, setPrintReceipt } = useApp();

  if (!printReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs no-print-bg">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 text-xs print:p-0 print:border-none print:shadow-none print:max-w-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
          <h3 className="text-sm font-bold text-slate-900">
            Money Receipt - {printReceipt.receiptNo}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => setPrintReceipt(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="border border-slate-300 rounded-lg p-5 space-y-4">
          <div className="text-center border-b-2 border-slate-800 pb-2">
            <h1 className="text-xl font-black text-slate-900">RAHMAN LPG DISTRIBUTION</h1>
            <p className="text-slate-500 text-[10px]">Ring Road, Mohammadpur, Dhaka · Phone: 01711-000000</p>
            <div className="mt-1 inline-block px-3 py-0.5 bg-emerald-800 text-white text-[10px] font-black uppercase rounded">
              OFFICIAL MONEY RECEIPT / টাকা জমার রশিদ
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <span className="text-slate-500">Receipt No: </span>
              <strong className="font-mono text-slate-900 text-sm">{printReceipt.receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <strong>{printReceipt.date}</strong>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500">Received with thanks from: </span>
              <strong className="text-slate-900 text-sm block mt-0.5">{printReceipt.customerName}</strong>
            </div>
            <div>
              <span className="text-slate-500">The sum of amount: </span>
              <strong className="text-emerald-700 text-base block mt-0.5">{formatBDT(printReceipt.amount)}</strong>
            </div>
            <div className="text-slate-600 text-[11px]">
              Payment Channel: <strong>{printReceipt.paymentMethod}</strong> ({printReceipt.account})
              {printReceipt.transactionRef && (
                <span> · Ref/TrxID: <strong className="font-mono">{printReceipt.transactionRef}</strong></span>
              )}
            </div>
            {printReceipt.notes && (
              <div className="text-slate-500 text-[11px]">
                Particulars: {printReceipt.notes}
              </div>
            )}
          </div>

          <div className="pt-10 flex justify-between text-xs text-slate-600">
            <div className="text-center w-36 border-t border-slate-400 pt-1">
              Customer / Depositor
            </div>
            <div className="text-center w-36 border-t border-slate-400 pt-1">
              Authorized Cashier
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
