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

  const areas = Array.from(new Set(customers.map(c => c.area).filter(Boolean)));

  const term = (searchTerm || '').toLowerCase();
  const filtered = customers.filter(c => {
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
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Customers & Dealer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dealer credit accounts, retail stores, restaurant clients, and cylinder receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('customer_cylinder_due')}
            className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-purple-600" />
            <span>Cylinder Due Account</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
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
              placeholder="Search by business name, proprietor, phone, area..."
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
            <option value="ALL">All Categories</option>
            <option value="dealer">Dealers</option>
            <option value="retail_shop">Retail Shops</option>
            <option value="restaurant">Restaurants</option>
            <option value="hotel">Hotels</option>
            <option value="commercial">Commercial</option>
          </select>

          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">All Delivery Areas</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> of <strong>{customers.length}</strong> customers
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Business & Contact</th>
                <th className="px-3 py-2.5">Phone & Area</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5 text-right">Current Due (৳)</th>
                <th className="px-3 py-2.5 text-right">Credit Limit (৳)</th>
                <th className="px-3 py-2.5 text-center">Empty Cylinders Due</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const totalEmptyDue = c.cylinderHoldings.reduce((s, h) => s + h.emptyDue, 0);
                const isOverLimit = c.currentDue > c.creditLimit;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900">{c.businessName}</div>
                      <div className="text-[11px] text-slate-500">Prop: {c.contactPerson}</div>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
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
                        {formatBDT(c.currentDue)}
                      </span>
                      {isOverLimit && (
                        <div className="text-[10px] text-rose-700 font-bold flex items-center justify-end gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Over Limit!
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {formatBDT(c.creditLimit)}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <CylinderDueBadge count={totalEmptyDue} label="due" />
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedCustomerForDetails(c);
                            setActiveView('customer_ledger');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] flex items-center gap-1"
                          title="View Ledger Statement"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>Ledger</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomerForDetails(c);
                            setActiveView('accounts_receive');
                          }}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                          title="Receive Payment"
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit Customer Details"
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
                <span>{editingCustomer ? 'Edit Customer Profile' : 'Add New Customer / Dealer'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Business / Shop Name *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Proprietor / Contact Person *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Primary Phone Number *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Customer Category</label>
                  <select
                    value={customerType}
                    onChange={e => setCustomerType(e.target.value as CustomerType)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="dealer">LPG Dealer / Sub-Dealer</option>
                    <option value="retail_shop">Retail Grocery / Hardware Shop</option>
                    <option value="restaurant">Restaurant / Hotel Kitchen</option>
                    <option value="hotel">Commercial Hotel</option>
                    <option value="commercial">Industrial / Commercial Plant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Area / Zone</label>
                  <input
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder="e.g. Mohammadpur, Dhanmondi"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Limit (৳)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Terms (Days)</label>
                  <input
                    type="number"
                    value={creditPeriodDays}
                    onChange={e => setCreditPeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Shop Address</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
