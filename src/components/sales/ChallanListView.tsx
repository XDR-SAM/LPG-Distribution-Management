import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, Printer, Search, Plus, Calendar, CheckCircle } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export const ChallanListView: React.FC = () => {
  const { sales, setPrintChallan, setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const challans = sales.map(s => ({
    id: `CH-${s.id}`,
    challanNo: `CH-${s.invoiceNo.replace('INV-', '')}`,
    saleId: s.id,
    invoiceNo: s.invoiceNo,
    date: s.date,
    customerName: s.customerName,
    customerAddress: s.customerAddress,
    totalFullQty: s.totalFullQty,
    totalEmptyReceived: s.totalEmptyReceived,
    driverName: 'Mohammad Rahim',
    vehicleNo: 'Dhaka Metro-Ta 11-4521',
    status: s.status === 'cancelled' ? 'Cancelled' : 'Delivered',
    sale: s,
  })).filter(c => {
    const term = (searchTerm || '').toLowerCase();
    return (
      (c.challanNo || '').toLowerCase().includes(term) ||
      (c.customerName || '').toLowerCase().includes(term) ||
      (c.invoiceNo || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Delivery Challans</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transport & gate pass delivery challans for LPG cylinder transit across Bangladesh
          </p>
        </div>

        <button
          onClick={() => setActiveView('sales_new')}
          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search challan #, customer, invoice..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
          />
        </div>
        <div className="text-slate-500">
          Showing <strong>{challans.length}</strong> challans
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Challan No</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Invoice Ref</th>
                <th className="px-3 py-2.5">Customer & Destination</th>
                <th className="px-3 py-2.5 text-center">Full Cylinders</th>
                <th className="px-3 py-2.5 text-center">Empty Returns</th>
                <th className="px-3 py-2.5">Vehicle & Driver</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challans.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 font-bold text-slate-900">
                    <span className="text-blue-700">{c.challanNo}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{c.date}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-700">{c.invoiceNo}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-900">{c.customerName}</div>
                    <div className="text-[11px] text-slate-400">{c.customerAddress}</div>
                  </td>
                  <td className="px-3 py-2.5 text-center font-extrabold text-orange-600">
                    {c.totalFullQty} pcs
                  </td>
                  <td className="px-3 py-2.5 text-center font-extrabold text-emerald-700">
                    {c.totalEmptyReceived} pcs
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-slate-800">{c.vehicleNo}</div>
                    <div className="text-[11px] text-slate-400">Driver: {c.driverName}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800 line-through'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => setPrintChallan({ sale: c.sale, vehicleNo: c.vehicleNo, driverName: c.driverName })}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Challan</span>
                    </button>
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
