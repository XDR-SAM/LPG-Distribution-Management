import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle, 
  Database, 
  DownloadCloud, 
  UploadCloud, 
  FileSpreadsheet, 
  FileJson,
  Layers,
  Settings,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { BackupExportPanel } from './BackupExportPanel';
import { RestoreImportPanel } from './RestoreImportPanel';
import { AIAgentSettingsPanel } from './AIAgentSettingsPanel';
import { Bot, Sparkles } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t, settings, updateSettings, customers, products, sales } = useApp();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'profile' | 'ai_agent'>('ai_agent');

  // Form states initialized from settings context
  const [companyName, setCompanyName] = useState(settings?.profile?.businessName || 'Rahman LPG Distribution');
  const [proprietor, setProprietor] = useState(settings?.profile?.proprietor || 'Md. Mustafizur Rahman');
  const [bercLicense, setBercLicense] = useState(settings?.profile?.bercLicense || 'BERC/LPG-DIST/DHK-2024/0419');
  const [binNumber, setBinNumber] = useState(settings?.profile?.bin || '002948192-0102');
  const [phone, setPhone] = useState(settings?.profile?.phone || '01711-000000');
  const [email, setEmail] = useState(settings?.profile?.email || 'info@rahmanlpg.bd');
  const [address, setAddress] = useState(settings?.profile?.address || 'Plot 18, Ring Road, Mohammadpur, Dhaka-1207');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [deposit12, setDeposit12] = useState(2200);
  const [deposit35, setDeposit35] = useState(5500);
  const [deposit45, setDeposit45] = useState(7000);

  // Sync state if settings change
  useEffect(() => {
    if (settings?.profile) {
      if (settings.profile.businessName) setCompanyName(settings.profile.businessName);
      if (settings.profile.proprietor) setProprietor(settings.profile.proprietor);
      if (settings.profile.bercLicense) setBercLicense(settings.profile.bercLicense);
      if (settings.profile.bin) setBinNumber(settings.profile.bin);
      if (settings.profile.phone) setPhone(settings.profile.phone);
      if (settings.profile.email) setEmail(settings.profile.email);
      if (settings.profile.address) setAddress(settings.profile.address);
    }
  }, [settings]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      profile: {
        ...settings.profile,
        businessName: companyName,
        proprietor,
        bercLicense,
        bin: binNumber,
        phone,
        email,
        address,
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset demo data back to default state?')) {
      localStorage.removeItem('LPG_MANAGER_BD_STATE_V1');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {t('settings.title')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manual database backups (JSON / CSV), bulk data import, and company distribution preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Backup:</span>
            <strong className="text-slate-900">{settings?.lastBackupTime || 'None taken'}</strong>
          </div>

          <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-1.5 text-orange-800 font-bold">
            <Database className="w-3.5 h-3.5 text-orange-600" />
            <span>{customers.length} Customers · {products.length} Products · {sales.length} Sales</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ai_agent')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'ai_agent'
              ? 'bg-linear-to-r from-orange-600 to-amber-600 text-white shadow-xs scale-102 ring-1 ring-orange-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-300" />
          <span>AI Agent & LLM Provider</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'backup'
              ? 'bg-orange-600 text-white shadow-xs scale-102'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Data Backup & Export (JSON / CSV)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('restore')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'restore'
              ? 'bg-slate-900 text-white shadow-xs scale-102'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Data Import & Restore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-xs scale-102'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & Deposit Rates</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 0: AI AGENT & LLM PROVIDER */}
      {/* ============================================================ */}
      {activeTab === 'ai_agent' && (
        <div className="space-y-4">
          <AIAgentSettingsPanel />
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: DATA BACKUP & EXPORT */}
      {/* ============================================================ */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <BackupExportPanel />
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DATA IMPORT & RESTORE */}
      {/* ============================================================ */}
      {activeTab === 'restore' && (
        <div className="space-y-4">
          <RestoreImportPanel />
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: COMPANY PROFILE & DEPOSIT RATES */}
      {/* ============================================================ */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-4xl">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 font-bold text-xs animate-fade-in shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Company details & preferences saved successfully!</span>
            </div>
          )}

          {/* Company Profile Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>{t('settings.business_profile')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.company_name')} *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proprietor / Managing Partner</label>
                <input
                  type="text"
                  value={proprietor}
                  onChange={e => setProprietor(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">BERC Distribution License No *</label>
                <input
                  type="text"
                  value={bercLicense}
                  onChange={e => setBercLicense(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">VAT / BIN Registration No</label>
                <input
                  type="text"
                  value={binNumber}
                  onChange={e => setBinNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">{t('supplier.address')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Cylinder Security Deposits Configuration */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
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
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">35 KG Cylinder Deposit (৳)</label>
                <input
                  type="number"
                  value={deposit35}
                  onChange={e => setDeposit35(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">45 KG Cylinder Deposit (৳)</label>
                <input
                  type="number"
                  value={deposit45}
                  onChange={e => setDeposit45(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-black text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t('common.save')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
