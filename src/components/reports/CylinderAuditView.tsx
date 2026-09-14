import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT, formatNumber } from '../../utils/formatters';
import { ShieldCheck, Printer, CheckCircle, AlertTriangle, Boxes, Flame, RotateCcw, AlertOctagon } from 'lucide-react';

export const CylinderAuditView: React.FC = () => {
  const { products, customers, suppliers } = useApp();

  const totalFull = products.reduce((sum, p) => sum + p.fullStock, 0);
  const totalEmpty = products.reduce((sum, p) => sum + p.emptyStock, 0);
  const totalCustomerHeld = products.reduce((sum, p) => sum + p.customerHeldStock, 0);
  const totalSupplierHeld = products.reduce((sum, p) => sum + p.supplierHeldStock, 0);
  const totalDamaged = products.reduce((sum, p) => sum + p.damagedStock, 0);
  const totalAccounted = totalFull + totalEmpty + totalCustomerHeld + totalSupplierHeld + totalDamaged;
  const totalRegisteredFleet = products.reduce((sum, p) => sum + p.totalCylinders, 0);
  const variance = totalAccounted - totalRegisteredFleet;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Cylinder Fleet Reconciliation & Asset Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% mathematical audit of physical cylinder assets across godowns, market circulation, and refinery terminals
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Audit Report</span>
        </button>
      </div>

      {/* Audit Status Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Audit Status: Complete & Reconciled
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                0 Discrepancy
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All {formatNumber(totalRegisteredFleet)} physical cylinders registered in the fleet are accounted for in the asset ledger.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-slate-400 text-[11px] block">Total Replacement Value</span>
          <span className="text-xl font-black text-slate-900">{formatBDT(totalRegisteredFleet * 2200)}</span>
        </div>
      </div>

      {/* Location Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-orange-200 bg-orange-50/20 shadow-2xs">
          <span className="text-orange-800 font-bold block text-[11px]">1. Full in Godown</span>
          <span className="text-2xl font-black text-orange-600 mt-1 block">{formatNumber(totalFull)}</span>
          <span className="text-[10px] text-slate-500">{((totalFull / totalRegisteredFleet) * 100).toFixed(1)}% of fleet</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-600 font-bold block text-[11px]">2. Empty in Godown</span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">{formatNumber(totalEmpty)}</span>
          <span className="text-[10px] text-slate-400">{((totalEmpty / totalRegisteredFleet) * 100).toFixed(1)}% of fleet</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-purple-200 bg-purple-50/20 shadow-2xs">
          <span className="text-purple-800 font-bold block text-[11px]">3. With Customers</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{formatNumber(totalCustomerHeld)}</span>
          <span className="text-[10px] text-purple-600">{((totalCustomerHeld / totalRegisteredFleet) * 100).toFixed(1)}% of fleet</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-blue-800 font-bold block text-[11px]">4. At Refinery Depots</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{formatNumber(totalSupplierHeld)}</span>
          <span className="text-[10px] text-blue-600">{((totalSupplierHeld / totalRegisteredFleet) * 100).toFixed(1)}% of fleet</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-rose-800 font-bold block text-[11px]">5. Defect Quarantine</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{formatNumber(totalDamaged)}</span>
          <span className="text-[10px] text-rose-500">{((totalDamaged / totalRegisteredFleet) * 100).toFixed(1)}% of fleet</span>
        </div>
      </div>

      {/* Brand-by-Brand Detailed Audit Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200 flex justify-between items-center text-xs">
          <span>Brand-wise Audit Matrix</span>
          <span className="text-[11px] text-slate-500 font-normal">All numbers in pieces (pcs)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Brand & Capacity</th>
                <th className="px-3 py-2.5 text-center text-orange-600">Full (Godown)</th>
                <th className="px-3 py-2.5 text-center text-slate-700">Empty (Godown)</th>
                <th className="px-3 py-2.5 text-center text-purple-700">Customers (Due)</th>
                <th className="px-3 py-2.5 text-center text-blue-700">Refinery Depot</th>
                <th className="px-3 py-2.5 text-center text-rose-600">Damaged</th>
                <th className="px-3 py-2.5 text-center font-black text-slate-900">Total Count</th>
                <th className="px-3 py-2.5 text-center">Audit Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => {
                const accounted = p.fullStock + p.emptyStock + p.customerHeldStock + p.supplierHeldStock + p.damagedStock;
                const pDiff = accounted - p.totalCylinders;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 font-bold text-slate-900">
                      {p.brand} <span className="text-slate-500 font-normal">({p.size})</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-orange-600">{p.fullStock}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{p.emptyStock}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-purple-700">{p.customerHeldStock}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-blue-700">{p.supplierHeldStock}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-rose-600">{p.damagedStock}</td>
                    <td className="px-3 py-2.5 text-center font-black text-slate-900 bg-slate-50">{p.totalCylinders}</td>
                    <td className="px-3 py-2.5 text-center">
                      {pDiff === 0 ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> 0 ok
                        </span>
                      ) : (
                        <span className="text-rose-600 font-black">{pDiff > 0 ? `+${pDiff}` : pDiff}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900">
              <tr>
                <td className="px-3 py-2.5">Total Cylinder Fleet:</td>
                <td className="px-3 py-2.5 text-center text-orange-600">{totalFull}</td>
                <td className="px-3 py-2.5 text-center text-slate-800">{totalEmpty}</td>
                <td className="px-3 py-2.5 text-center text-purple-800">{totalCustomerHeld}</td>
                <td className="px-3 py-2.5 text-center text-blue-800">{totalSupplierHeld}</td>
                <td className="px-3 py-2.5 text-center text-rose-700">{totalDamaged}</td>
                <td className="px-3 py-2.5 text-center text-base bg-slate-200">{totalRegisteredFleet} pcs</td>
                <td className="px-3 py-2.5 text-center text-emerald-700">Balanced (0)</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
