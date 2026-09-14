import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../utils/formatters';
import { Expense } from '../../types';
import { DollarSign, Plus, Search, Filter, Fuel, Truck, Users, Home, Zap, Shield, Coffee, X } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [date, setDate] = useState('2026-09-14');
  const [category, setCategory] = useState('Labor / Coolie Loading-Unloading');
  const [amount, setAmount] = useState<number>(850);
  const [paidFrom, setPaidFrom] = useState('Cash in Hand');
  const [notes, setNotes] = useState('Loading 150 cylinders for wholesale route');

  const categories = [
    'Labor / Coolie Loading-Unloading',
    'Vehicle Fuel & CNG (Delivery Van)',
    'Vehicle Maintenance & Tyre',
    'Godown Rent & Depot Lease',
    'Electricity, Water & Utilities',
    'BERC / Explosive License & Legal',
    'Staff Salary & Driver Daily TA/DA',
    'Tea, Snacks & Entertainment',
    'Safety Equipment & Fire Extinguisher',
  ];

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const term = (searchTerm || '').toLowerCase();
  const filtered = expenses.filter(e => {
    const matchesSearch =
      (e.category || '').toLowerCase().includes(term) ||
      (e.notes || '').toLowerCase().includes(term) ||
      (e.paidFrom || '').toLowerCase().includes(term);
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    addExpense({
      date,
      category,
      amount,
      paidFrom,
      notes,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Godown Operating Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record day-to-day operational costs: Cylinder coolie loading, vehicle fuel, godown rent, and regulatory fees
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold block text-[11px] uppercase">Total Month Expenses</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{formatBDT(totalExpense)}</span>
          <span className="text-[10px] text-slate-400">Recorded across all godown activities</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold block text-[11px] uppercase">Fuel & Transport Cost</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {formatBDT(
              expenses
                .filter(e => e.category.includes('Fuel') || e.category.includes('Vehicle'))
                .reduce((s, e) => s + e.amount, 0)
            )}
          </span>
          <span className="text-[10px] text-slate-400">Delivery trucks & pickups</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold block text-[11px] uppercase">Labor & Loading Coolie</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {formatBDT(
              expenses
                .filter(e => e.category.includes('Labor'))
                .reduce((s, e) => s + e.amount, 0)
            )}
          </span>
          <span className="text-[10px] text-slate-400">Unloading full & loading empty trucks</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expense category, notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500">
          Showing <strong>{filtered.length}</strong> records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Paid Via Account</th>
                <th className="px-3 py-2.5">Notes / Purpose</th>
                <th className="px-3 py-2.5 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{e.date}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{e.category}</td>
                  <td className="px-3 py-2.5 text-slate-600">{e.paidFrom}</td>
                  <td className="px-3 py-2.5 text-slate-700">{e.notes}</td>
                  <td className="px-3 py-2.5 text-right font-black text-rose-600 text-sm">
                    {formatBDT(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Record Operational Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Paid (৳) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded font-black text-rose-600 text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method / Account</label>
                <select
                  value={paidFrom}
                  onChange={e => setPaidFrom(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="Cash in Hand">Cash in Hand (Drawer)</option>
                  <option value="bKash Merchant">bKash Merchant</option>
                  <option value="Islami Bank">Islami Bank</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Particulars / Reason</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. 50L Diesel for pickup Dhaka Metro-Ta 11-4521"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
