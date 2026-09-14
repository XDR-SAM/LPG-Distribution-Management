import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, X, Truck, ShieldCheck, Flame } from 'lucide-react';

export const PrintChallanModal: React.FC = () => {
  const { printChallan, setPrintChallan } = useApp();

  if (!printChallan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs no-print-bg">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4 text-xs print:p-0 print:border-none print:shadow-none print:max-w-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
          <h3 className="text-sm font-bold text-slate-900">
            Delivery Challan - {printChallan.challanNo}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print Challan</span>
            </button>
            <button
              onClick={() => setPrintChallan(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center border-b-2 border-slate-800 pb-2">
            <h1 className="text-xl font-black text-slate-900">RAHMAN LPG DISTRIBUTION</h1>
            <p className="text-slate-500 text-[11px]">Godown Dispatch & Delivery Challan</p>
            <div className="mt-1 inline-block px-3 py-0.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded">
              Gate Pass / Delivery Challan
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">DELIVER TO:</span>
              <div className="font-bold text-slate-900 text-sm">{printChallan.customerName}</div>
              <div className="text-slate-600">{printChallan.destination}</div>
            </div>

            <div className="text-right space-y-0.5">
              <div>Challan No: <strong className="font-mono">{printChallan.challanNo}</strong></div>
              <div>Invoice Ref: <strong className="font-mono">{printChallan.invoiceNo}</strong></div>
              <div>Date: <strong>{printChallan.date}</strong></div>
              <div>Vehicle: <strong>{printChallan.vehicleNo}</strong></div>
              <div>Driver: <strong>{printChallan.driverName} ({printChallan.driverPhone})</strong></div>
            </div>
          </div>

          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="p-2">Cylinder Specification</th>
                  <th className="p-2 text-center">Full Given</th>
                  <th className="p-2 text-center">Empty Received</th>
                  <th className="p-2 text-center text-amber-900">Due Empties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printChallan.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{it.brand} {it.size}</td>
                    <td className="p-2 text-center font-black text-orange-600">{it.fullQty} pcs</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{it.emptyQty} pcs</td>
                    <td className="p-2 text-center font-bold text-amber-800">{it.fullQty - it.emptyQty} pcs</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-black border-t border-slate-300">
                <tr>
                  <td className="p-2">Total Cylinders on Vehicle:</td>
                  <td className="p-2 text-center text-orange-600">{printChallan.totalFull} pcs</td>
                  <td className="p-2 text-center text-emerald-700">{printChallan.totalEmpty} pcs</td>
                  <td className="p-2 text-center text-amber-800">{printChallan.totalFull - printChallan.totalEmpty} pcs</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-10 flex justify-between text-xs text-slate-600">
            <div className="text-center w-36 border-t border-slate-400 pt-1">
              Driver Signature
            </div>
            <div className="text-center w-36 border-t border-slate-400 pt-1">
              Godown Dispatcher
            </div>
            <div className="text-center w-36 border-t border-slate-400 pt-1">
              Customer Receiver
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
