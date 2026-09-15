import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, Plus } from 'lucide-react';

export const DamagedLostView: React.FC = () => {
  const { products, recordDamagedCylinder, t, formatQty, formatDate } = useApp();

  const [damagedLogs, setDamagedLogs] = useState([
    {
      id: 'DMG-001',
      date: '2026-09-11',
      brand: 'Bashundhara LP Gas',
      size: '12 KG',
      qty: 2,
      condition: 'Valve Leakage (Safety Pin Failure)',
      location: 'Quarantine Bay A-1',
      status: 'Awaiting Depot Exchange Truck',
    },
    {
      id: 'DMG-002',
      date: '2026-09-08',
      brand: 'Jamuna Gas',
      size: '12 KG',
      qty: 1,
      condition: 'Body Ring Deep Dent',
      location: 'Scrap Zone',
      status: 'Sent to Depot for Re-testing',
    },
    {
      id: 'DMG-003',
      date: '2026-09-05',
      brand: 'Omera LPG',
      size: '35 KG',
      qty: 1,
      condition: 'Tare weight mismatch / Under weight valve leak',
      location: 'Quarantine Bay A-2',
      status: 'Company Credit Replaced',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [condition, setCondition] = useState('Valve Leakage (Safety Defect)');
  const [location, setLocation] = useState('Quarantine Bay A-1');

  const handleAddDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    recordDamagedCylinder(prod.id, qty, condition);

    setDamagedLogs([
      {
        id: `DMG-${Date.now()}`,
        date: '2026-09-14',
        brand: prod.brand,
        size: prod.size,
        qty,
        condition,
        location,
        status: 'Awaiting Depot Exchange Truck',
      },
      ...damagedLogs,
    ]);

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('damage.title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('damage.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('damage.report_btn')}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5">{t('damage.report_id')}</th>
              <th className="px-3 py-2.5">{t('common.date')}</th>
              <th className="px-3 py-2.5">{t('damage.brand_size')}</th>
              <th className="px-3 py-2.5 text-center">{t('damage.defective_units')}</th>
              <th className="px-3 py-2.5">{t('damage.defect_condition')}</th>
              <th className="px-3 py-2.5">{t('damage.storage_bay')}</th>
              <th className="px-3 py-2.5">{t('damage.replacement_status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {damagedLogs.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/80">
                <td className="px-3 py-2.5 font-bold font-mono text-rose-700">{d.id}</td>
                <td className="px-3 py-2.5 text-slate-500">{formatDate(d.date)}</td>
                <td className="px-3 py-2.5 font-bold text-slate-900">{d.brand} - {d.size}</td>
                <td className="px-3 py-2.5 text-center font-black text-rose-600">{formatQty(d.qty)}</td>
                <td className="px-3 py-2.5 text-slate-700">{d.condition}</td>
                <td className="px-3 py-2.5 text-slate-500">{d.location}</td>
                <td className="px-3 py-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 border border-slate-200 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>{t('damage.modal_title')}</span>
            </h3>

            <form onSubmit={handleAddDamaged} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('damage.cylinder_product')}</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('common.quantity')}</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={e => setQty(parseInt(e.target.value) || 1)}
                    className="w-full p-1.5 border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('damage.storage_bay')}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('damage.defect_category')}</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded"
                >
                  <option value="Valve Leakage (Safety Defect)">Valve Leakage (Safety Defect)</option>
                  <option value="Body Ring Deep Dent / Bent Foot">Body Ring Deep Dent / Bent Foot</option>
                  <option value="Collar Handle Broken">Collar Handle Broken</option>
                  <option value="Severe Rust / Shell Corrosion">Severe Rust / Shell Corrosion</option>
                  <option value="Tare Weight Discrepancy">Tare Weight Discrepancy</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
                >
                  {t('damage.confirm_report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
