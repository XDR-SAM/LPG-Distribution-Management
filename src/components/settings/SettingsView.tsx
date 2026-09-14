import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Save, RotateCcw, ShieldCheck, Printer, Database, HardDrive, CheckCircle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [companyName, setCompanyName] = useState('Rahman LPG Distribution');
  const [proprietor, setProprietor] = useState('Md. Mustafizur Rahman');
  const [bercLicense, setBercLicense] = useState('BERC/LPG-DIST/DHK-2024/0419');
  const [binNumber, setBinNumber] = useState('002948192-0102');
  const [phone, setPhone] = useState('01711-000000');
  const [email, setEmail] = useState('info@rahmanlpg.bd');
  const [address, setAddress] = useState('Plot 18, Ring Road, Mohammadpur, Dhaka-1207');
  const [godownCount, setGodownCount] = useState(2);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [deposit12, setDeposit12] = useState(2200);
  const [deposit35, setDeposit35] = useState(5500);
  const [deposit45, setDeposit45] = useState(7000);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset demo data back to default state?')) {
      localStorage.removeItem('LPG_MANAGER_BD_STATE_V1');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">System Settings & Company Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dealership details, BERC license numbers, invoice headers, and cylinder deposit benchmarks
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Saved successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Company Profile Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>Distribution Agency Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Agency Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Proprietor / Managing Partner</label>
              <input
                type="text"
                value={proprietor}
                onChange={e => setProprietor(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">BERC Distribution License No *</label>
              <input
                type="text"
                value={bercLicense}
                onChange={e => setBercLicense(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">VAT / BIN Registration No</label>
              <input
                type="text"
                value={binNumber}
                onChange={e => setBinNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Godown Office Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Cylinder Security Deposits Configuration */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Standard Cylinder Security Deposit Rates (BDT)</span>
          </h3>
          <p className="text-slate-500 text-[11px]">
            Default security deposit charged to non-regular customers when cylinders are taken without empty exchange:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">12 KG Cylinder Deposit (৳)</label>
              <input
                type="number"
                value={deposit12}
                onChange={e => setDeposit12(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">35 KG Cylinder Deposit (৳)</label>
              <input
                type="number"
                value={deposit35}
                onChange={e => setDeposit35(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">45 KG Cylinder Deposit (৳)</label>
              <input
                type="number"
                value={deposit45}
                onChange={e => setDeposit45(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded font-black text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-semibold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
