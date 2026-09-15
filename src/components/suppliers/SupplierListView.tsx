import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { Building2, Plus, Search, FileText, ArrowUpRight, Phone, MapPin, Edit, X } from 'lucide-react';

export const SupplierListView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, setActiveView, t, formatCurrency, formatQty, toBnNum } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const term = (searchTerm || '').toLowerCase();
  const filtered = suppliers.filter(s =>
    (s.companyName || '').toLowerCase().includes(term) ||
    (s.contactPerson || '').toLowerCase().includes(term) ||
    (s.phone || '').includes(searchTerm)
  );

  const openAdd = () => {
    setEditingSupplier(null);
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setCompanyName(s.companyName);
    setContactPerson(s.contactPerson);
    setPhone(s.phone);
    setAddress(s.address);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        companyName,
        contactPerson,
        phone,
        address,
      });
    } else {
      addSupplier({
        companyName,
        contactPerson,
        phone,
        address,
        currentPayable: 0,
        emptyCylindersHeld: 0,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('supplier.title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('supplier.subtitle')}
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('supplier.add_btn')}</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('supplier.search_placeholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
          />
        </div>
        <div className="text-slate-500 font-medium">
          Showing <strong>{toBnNum(filtered.length)}</strong> suppliers
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">{t('supplier.company_name')}</th>
                <th className="px-3 py-2.5">{t('supplier.contact_person')}</th>
                <th className="px-3 py-2.5">{t('supplier.phone')} & {t('supplier.address')}</th>
                <th className="px-3 py-2.5 text-right">{t('supplier.current_payable')}</th>
                <th className="px-3 py-2.5 text-center">{t('supplier.empty_held')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-900 text-sm">{s.companyName}</div>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{s.contactPerson}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {s.phone}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {s.address}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-black text-rose-600 text-sm">{formatCurrency(s.currentPayable)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-xs bg-blue-100 text-blue-900 border border-blue-200">
                      {formatQty(s.emptyCylindersHeld)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setActiveView('supplier_ledger')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span>{t('supplier.ledger_btn')}</span>
                      </button>
                      <button
                        onClick={() => setActiveView('accounts_pay')}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        title={t('supplier.pay_btn')}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title={t('common.edit')}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{editingSupplier ? t('supplier.modal_edit_title') : t('supplier.modal_add_title')}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.company_name')} *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Beximco LPG Central Terminal"
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.contact_person')}</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 01711-223344"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.address')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Narayanganj Terminal Plant"
                  className="w-full p-2 border border-slate-300 rounded"
                />
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
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
