import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerTypeBadge, CylinderDueBadge } from '../common/Badge';
import { formatBDT } from '../../utils/formatters';
import { Customer, CustomerType } from '../../types';
import {
  Users,
  Plus,
  Search,
  FileText,
  ArrowDownLeft,
  RotateCcw,
  Edit,
  Phone,
  MapPin,
  Flame,
  AlertTriangle,
  X
} from 'lucide-react';

export const CustomerListView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    setActiveView,
    setSelectedCustomerForDetails,
    setIsReceiveEmptyModalOpen,
    t,
    language,
    formatCurrency,
    formatQty,
    toBnNum,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Mohammadpur');
  const [customerType, setCustomerType] = useState<CustomerType>('dealer');
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [creditPeriodDays, setCreditPeriodDays] = useState<number>(15);

  const safeCustomers = customers || [];
  const areas = Array.from(new Set(safeCustomers.map(c => c.area).filter(Boolean)));

  const term = (searchTerm || '').toLowerCase();
  const filtered = safeCustomers.filter(c => {
    const matchesSearch =
      (c.businessName || '').toLowerCase().includes(term) ||
      (c.contactPerson || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term) ||
      (c.area || '').toLowerCase().includes(term);

    const matchesType = typeFilter === 'ALL' || c.customerType === typeFilter;
    const matchesArea = areaFilter === 'ALL' || c.area === areaFilter;

    return matchesSearch && matchesType && matchesArea;
  });

  const openAddModal = () => {
    setEditingCustomer(null);
    setBusinessName('');
    setContactPerson('');
    setPhone('');
    setAltPhone('');
    setAddress('');
    setArea('Mohammadpur');
    setCustomerType('dealer');
    setCreditLimit(50000);
    setCreditPeriodDays(15);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setBusinessName(c.businessName);
    setContactPerson(c.contactPerson);
    setPhone(c.phone);
    setAltPhone(c.altPhone || '');
    setAddress(c.address);
    setArea(c.area);
    setCustomerType(c.customerType);
    setCreditLimit(c.creditLimit);
    setCreditPeriodDays(c.creditPeriodDays);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        businessName,
        contactPerson,
        phone,
        altPhone,
        address,
        area,
        customerType,
        creditLimit,
        creditPeriodDays,
      });
    } else {
      addCustomer({
        businessName,
        contactPerson,
        phone,
        altPhone,
        address,
        area,
        customerType,
        creditLimit,
        creditPeriodDays,
        currentDue: 0,
        cylinderHoldings: [],
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('customer.directory_title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('customer.directory_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('customer_cylinder_due')}
            className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-purple-600" />
            <span>{t('customer.cylinder_due_account')}</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('customer.add_customer')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('customer.search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">{t('customer.all_categories')}</option>
            <option value="dealer">{t('sales.dealer')}</option>
            <option value="retail_shop">{t('sales.retailer')}</option>
            <option value="restaurant">{t('customer.restaurants')}</option>
            <option value="hotel">{t('customer.hotels')}</option>
            <option value="commercial">{t('sales.commercial')}</option>
          </select>

          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">{t('customer.all_areas')}</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          {language === 'bn' ? (
            <>মোট <strong>{toBnNum(customers.length)}</strong> জনের মধ্যে <strong>{toBnNum(filtered.length)}</strong> জন গ্রাহক প্রদর্শিত হচ্ছে</>
          ) : (
            <>Showing <strong>{filtered.length}</strong> of <strong>{customers.length}</strong> customers</>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">{t('customer.business_contact')}</th>
                <th className="px-3 py-2.5">{t('customer.phone_area')}</th>
                <th className="px-3 py-2.5">{t('sales.type')}</th>
                <th className="px-3 py-2.5 text-right">{t('customer.current_due')}</th>
                <th className="px-3 py-2.5 text-right">{t('customer.credit_limit')}</th>
                <th className="px-3 py-2.5 text-center">{t('customer.empty_cylinders_due')}</th>
                <th className="px-3 py-2.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const holdings = c.cylinderHoldings || [];
                const totalEmptyDue = holdings.reduce((s, h) => s + (h.emptyDue || 0), 0);
                const isOverLimit = (c.currentDue || 0) > (c.creditLimit || 0);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900">{c.businessName}</div>
                      <div className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'স্বত্বাধিকারী: ' : 'Prop: '}{c.contactPerson}
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {toBnNum(c.phone)}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {c.area}
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <CustomerTypeBadge type={c.customerType} />
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <span className={`font-black text-sm ${c.currentDue > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {formatCurrency(c.currentDue)}
                      </span>
                      {isOverLimit && (
                        <div className="text-[10px] text-rose-700 font-bold flex items-center justify-end gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> {t('customer.over_limit')}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {formatCurrency(c.creditLimit)}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <CylinderDueBadge count={totalEmptyDue} label={language === 'bn' ? 'বাকি' : 'due'} />
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedCustomerForDetails(c);
                            setActiveView('customer_ledger');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] flex items-center gap-1"
                          title={t('customer.ledger')}
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>{t('customer.ledger')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomerForDetails(c);
                            setActiveView('accounts_receive');
                          }}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                          title={t('customer.receive_payment')}
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title={t('common.edit')}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span>{editingCustomer ? t('customer.edit_profile') : t('customer.add_new')}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.shop_name')}</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. M/S Nayeem Traders"
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.proprietor')}</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="e.g. Mohammad Nayeem"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.primary_phone')}</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 01712-345678"
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.category')}</label>
                  <select
                    value={customerType}
                    onChange={e => setCustomerType(e.target.value as CustomerType)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="dealer">{t('customer.dealers')}</option>
                    <option value="retail_shop">{t('customer.retail_shops')}</option>
                    <option value="restaurant">{t('customer.restaurants')}</option>
                    <option value="hotel">{t('customer.hotels')}</option>
                    <option value="commercial">{t('customer.commercial_plants')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.delivery_area')}</label>
                  <input
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder="e.g. Mohammadpur, Dhanmondi"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.credit_limit')}</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.credit_terms_days')}</label>
                  <input
                    type="number"
                    value={creditPeriodDays}
                    onChange={e => setCreditPeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.shop_address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Plot 14, Ring Road, Mohammadpur, Dhaka"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold"
                >
                  {editingCustomer ? t('customer.save_btn') : t('customer.create_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
