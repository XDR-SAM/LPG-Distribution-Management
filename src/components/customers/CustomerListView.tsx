import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerTypeBadge, CylinderDueBadge } from '../common/Badge';
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
  X,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight
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
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');

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

  // Live aggregates
  const totalMarketDue = safeCustomers.reduce((sum, c) => sum + (c.currentDue || 0), 0);
  const totalEmptyDue = safeCustomers.reduce(
    (sum, c) => sum + (c.cylinderHoldings || []).reduce((s, h) => s + (h.emptyDue || 0), 0),
    0
  );
  const overCreditLimitCount = safeCustomers.filter(
    c => (c.currentDue || 0) > (c.creditLimit || 0) && (c.creditLimit || 0) > 0
  ).length;

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

  const handleQuickSale = (c: Customer) => {
    setSelectedCustomerForDetails(c);
    setActiveView('sales_new');
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

  // Color avatar helper
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600 text-white',
      'bg-orange-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
      'bg-rose-600 text-white',
      'bg-cyan-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const categories = [
    { id: 'ALL', label: t('customer.all_categories'), count: safeCustomers.length },
    { id: 'dealer', label: t('sales.dealer'), count: safeCustomers.filter(c => c.customerType === 'dealer').length },
    { id: 'retail_shop', label: t('sales.retailer'), count: safeCustomers.filter(c => c.customerType === 'retail_shop').length },
    { id: 'restaurant', label: t('customer.restaurants'), count: safeCustomers.filter(c => c.customerType === 'restaurant').length },
    { id: 'hotel', label: t('customer.hotels'), count: safeCustomers.filter(c => c.customerType === 'hotel').length },
    { id: 'commercial', label: t('sales.commercial'), count: safeCustomers.filter(c => c.customerType === 'commercial').length },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Main Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('customer.directory_title')}</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60">
              {formatQty(safeCustomers.length)} {language === 'bn' ? 'টি একাউন্ট' : 'Accounts'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('customer.directory_subtitle')} · Mohammadpur & Dhanmondi Territories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('customer_cylinder_due')}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-purple-600" />
            <span>{t('customer.cylinder_due_account')}</span>
            <span className="text-[10px] bg-purple-200 text-purple-950 px-1 rounded font-mono font-black">
              {formatQty(totalEmptyDue)}
            </span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t('customer.add_customer')}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 border-t-3 border-t-blue-500 rounded-xl p-3.5 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'bn' ? 'নিবন্ধিত গ্রাহক' : 'Total Customers'}
            </span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums block mt-1">
              {formatQty(safeCustomers.length)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {safeCustomers.filter(c => c.customerType === 'dealer').length} {language === 'bn' ? 'ডিলার' : 'Dealers'} · {safeCustomers.filter(c => c.customerType === 'retail_shop').length} {language === 'bn' ? 'খুচরা দোকান' : 'Retail'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 border-t-3 border-t-rose-500 rounded-xl p-3.5 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'bn' ? 'মোট বাজার বাকি' : 'Total Market Due'}
            </span>
            <span className="text-2xl font-extrabold text-rose-600 tabular-nums block mt-1">
              {formatCurrency(totalMarketDue)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {language === 'bn' ? '১০ জন গ্রাহকের কাছে বাকি' : 'Receivables outstanding'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 border-t-3 border-t-purple-500 rounded-xl p-3.5 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'bn' ? 'সিলিন্ডার গ্রাহকে বাকি' : 'Cylinders In Market'}
            </span>
            <span className="text-2xl font-extrabold text-purple-700 tabular-nums block mt-1">
              {formatQty(totalEmptyDue)} {language === 'bn' ? 'টি' : 'Units'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {language === 'bn' ? 'কোম্পানি ফেরতযোগ্য খালি' : 'Empty cylinders to collect'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 border-t-3 border-t-amber-500 rounded-xl p-3.5 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'bn' ? 'ক্রেডিট লিমিট সতর্কতা' : 'Credit Limit Risk'}
            </span>
            <span className="text-2xl font-extrabold text-amber-600 tabular-nums block mt-1">
              {formatQty(overCreditLimitCount)} {language === 'bn' ? 'টি একাউন্ট' : 'Accounts'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {language === 'bn' ? 'নির্ধারিত লিমিট অতিক্রম করেছে' : 'Exceeding approved credit'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Category Segmented Control & Search Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Segmented Category Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 text-xs select-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setTypeFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                typeFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  typeFilter === cat.id ? 'bg-slate-800 text-orange-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {formatQty(cat.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Area Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('customer.search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">{t('customer.all_areas')}</option>
              {areas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-medium text-[11px]">
            {language === 'bn' ? (
              <>মোট <strong>{toBnNum(safeCustomers.length)}</strong> জনের মধ্যে <strong>{toBnNum(filtered.length)}</strong> জন প্রদর্শিত</>
            ) : (
              <>Showing <strong>{filtered.length}</strong> of <strong>{safeCustomers.length}</strong> accounts</>
            )}
          </div>
        </div>
      </div>

      {/* Customer Master Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3">{t('customer.business_contact')}</th>
                <th className="px-3 py-3">{t('customer.phone_area')}</th>
                <th className="px-3 py-3">{t('sales.type')}</th>
                <th className="px-3 py-3 text-right">{t('customer.current_due')}</th>
                <th className="px-3 py-3">{t('customer.credit_limit')}</th>
                <th className="px-3 py-3 text-center">{t('customer.empty_cylinders_due')}</th>
                <th className="px-3 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No customers found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your category filter or search keywords.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setAreaFilter('ALL'); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const holdings = c.cylinderHoldings || [];
                  const emptyCount = holdings.reduce((s, h) => s + (h.emptyDue || 0), 0);
                  const isOverLimit = (c.currentDue || 0) > (c.creditLimit || 0) && (c.creditLimit || 0) > 0;
                  const creditPercent = c.creditLimit > 0 ? Math.min(100, Math.round((c.currentDue / c.creditLimit) * 100)) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Customer Avatar & Name */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getAvatarColor(c.businessName)}`}>
                            {c.businessName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                              {c.businessName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {language === 'bn' ? 'স্বত্বাধিকারী: ' : 'Prop: '}{c.contactPerson}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Area */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{toBnNum(c.phone)}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.area}</span>
                        </div>
                      </td>

                      {/* Category Tag */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <CustomerTypeBadge type={c.customerType} />
                      </td>

                      {/* Current Balance Due */}
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <span className={`font-extrabold text-sm tabular-nums ${c.currentDue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatCurrency(c.currentDue)}
                        </span>
                        {isOverLimit && (
                          <div className="text-[10px] text-rose-700 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{t('customer.over_limit')}</span>
                          </div>
                        )}
                      </td>

                      {/* Credit Limit & Visual Meter */}
                      <td className="px-3 py-2.5 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                          <span className="text-slate-500 tabular-nums">{formatCurrency(c.creditLimit)}</span>
                          <span className={`font-bold font-mono text-[10px] ${
                            creditPercent > 90 ? 'text-rose-600' : creditPercent > 70 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {creditPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              creditPercent > 90 ? 'bg-rose-500' : creditPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${creditPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Cylinders Due */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <CylinderDueBadge count={emptyCount} label={language === 'bn' ? 'বাকি' : 'due'} />
                      </td>

                      {/* Quick Actions */}
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Sell Button */}
                          <button
                            onClick={() => handleQuickSale(c)}
                            className="px-2 py-1 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-700 border border-orange-200/80 rounded-md font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
                            title="Open New Sale (POS) for this customer"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>{language === 'bn' ? 'বিক্রয়' : 'Sell'}</span>
                          </button>

                          {/* Ledger Button */}
                          <button
                            onClick={() => {
                              setSelectedCustomerForDetails(c);
                              setActiveView('customer_ledger');
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title={t('customer.ledger')}
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span className="hidden sm:inline">{t('customer.ledger')}</span>
                          </button>

                          {/* Quick Cash Receipt */}
                          <button
                            onClick={() => {
                              setSelectedCustomerForDetails(c);
                              setActiveView('accounts_receive');
                            }}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title={t('customer.receive_payment')}
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          {/* Edit Customer */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span>{editingCustomer ? t('customer.edit_profile') : t('customer.add_new')}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
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
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.category')}</label>
                  <select
                    value={customerType}
                    onChange={e => setCustomerType(e.target.value as CustomerType)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.credit_limit')}</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold tabular-nums focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.credit_terms_days')}</label>
                  <input
                    type="number"
                    value={creditPeriodDays}
                    onChange={e => setCreditPeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg tabular-nums focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">{t('customer.shop_address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Plot 14, Ring Road, Mohammadpur, Dhaka"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-xs transition-colors"
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
