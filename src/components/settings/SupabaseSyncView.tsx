import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  UploadCloud, 
  DownloadCloud, 
  Key, 
  ShieldCheck, 
  ExternalLink,
  Table,
  FileCode,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkSupabaseConnection, isSupabaseConfigured, getSupabaseConfig, SupabaseHealth } from '../../lib/supabase';
import { SUPABASE_SQL_SCHEMA, SUPABASE_QUICK_PATCH_SQL } from '../../lib/supabaseSchema';
import { syncAllToSupabase, pullAllFromSupabase } from '../../services/supabaseSyncService';
import { getSupabase } from '../../lib/supabase';

export const SupabaseSyncView: React.FC = () => {
  const { 
    users, 
    products, 
    customers, 
    suppliers, 
    sales, 
    purchases, 
    stockMovements, 
    moneyReceipts, 
    expenses, 
    settings 
  } = useApp();

  const [health, setHealth] = useState<SupabaseHealth>({
    configured: isSupabaseConfigured(),
    connected: false,
    message: 'Checking connection status...',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [remoteCounts, setRemoteCounts] = useState<Record<string, number | null>>({});
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'tables'>('status');

  const config = getSupabaseConfig();

  const runHealthCheck = async () => {
    setIsChecking(true);
    setSyncStatusMessage(null);
    try {
      const res = await checkSupabaseConnection();
      setHealth(res);

      // Fetch live table counts if connected
      const client = getSupabase();
      if (client) {
        const tableNames = ['profiles', 'products', 'customers', 'suppliers', 'sales', 'purchases', 'stock_movements', 'money_receipts', 'expenses', 'app_settings'];
        const countsObj: Record<string, number | null> = {};
        await Promise.all(
          tableNames.map(async (t) => {
            try {
              const { count, error } = await client.from(t).select('*', { count: 'exact', head: true });
              countsObj[t] = error ? null : (count ?? 0);
            } catch {
              countsObj[t] = null;
            }
          })
        );
        setRemoteCounts(countsObj);
      }
    } catch (e: any) {
      setHealth({
        configured: isSupabaseConfigured(),
        connected: false,
        message: e?.message || 'Connection test failed',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(SUPABASE_QUICK_PATCH_SQL);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatusMessage(null);
    try {
      const res = await syncAllToSupabase({
        users,
        products,
        customers,
        suppliers,
        sales,
        purchases,
        stockMovements,
        moneyReceipts,
        expenses,
        settings,
      });
      setSyncStatusMessage(res.message);
      runHealthCheck();
    } catch (err: any) {
      setSyncStatusMessage('Error: ' + (err?.message || 'Sync failed'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Supabase PostgreSQL Integration</h1>
              {health.connected ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected ({health.latencyMs}ms)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {health.configured ? 'Configured · Awaiting Connection' : 'Local Storage Mode'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Production-grade cloud database with Row Level Security (RLS) policies and automatic offline fallback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runHealthCheck}
            disabled={isChecking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-orange-600' : ''}`} />
            <span>Test Connection</span>
          </button>
          
          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing || !health.configured}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              health.configured
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isSyncing ? 'Syncing...' : 'Sync Local Data to Supabase'}</span>
          </button>
        </div>
      </div>

      {syncStatusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatusMessage}</span>
          </div>
          <button onClick={() => setSyncStatusMessage(null)} className="text-emerald-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
            activeTab === 'status'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Connection & Configuration
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
            activeTab === 'tables'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Database Tables & Counts
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'sql'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>PostgreSQL Schema & RLS SQL</span>
        </button>
      </div>

      {/* TAB 1: Status & Config */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Supabase Environment Credentials</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Project URL (VITE_SUPABASE_URL)</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 break-all">
                    {config.url || <span className="text-slate-400 italic">Not set in .env.example (e.g. https://xyzcompany.supabase.co)</span>}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Public Anon Key (VITE_SUPABASE_ANON_KEY)</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 truncate">
                    {config.anonKey ? `${config.anonKey.slice(0, 16)}••••••••••••••••` : <span className="text-slate-400 italic">Not set in .env.example</span>}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>How it works:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    1. When <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are provided in your environment, the app connects directly to your remote Supabase PostgreSQL database.
                    <br />
                    2. In the meantime, the application operates in <strong>local offline-first mode</strong> with high-speed persistence, ensuring full uptime even without an active internet connection.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Connection Status Log</h2>
              <div className={`p-3 rounded-lg border text-xs font-mono ${
                health.connected 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                {health.message}
              </div>
            </div>
          </div>

          {/* Quick Setup Checklist */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Setup Quick Checklist</h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-800">Create Project in Supabase</div>
                  <p className="text-slate-500 text-[11px]">Go to supabase.com and create a new project with PostgreSQL.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-800">Run Migration SQL</div>
                  <p className="text-slate-500 text-[11px]">
                    Open the <button onClick={() => setActiveTab('sql')} className="text-orange-600 font-bold underline">PostgreSQL Schema tab</button>, copy the SQL, and run it in the Supabase SQL Editor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-800">Add API Keys</div>
                  <p className="text-slate-500 text-[11px]">Copy Project URL & Anon Key from Supabase Project Settings → API into your environment.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <div className="font-bold text-slate-800">Sync Data</div>
                  <p className="text-slate-500 text-[11px]">Click "Sync Local Data to Supabase" to push existing cylinders, customers, and transactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tables Overview */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database Schema Tables & Live Sync Status</h2>
              <p className="text-xs text-slate-500">Compare records saved in browser local storage vs. records in Supabase cloud PostgreSQL</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">12 Tables Configured</span>
              <button 
                onClick={runHealthCheck}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Refresh Counts</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Table Name</th>
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-3 py-2.5">Local Records</th>
                  <th className="px-3 py-2.5">Supabase Remote Records</th>
                  <th className="px-3 py-2.5">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'profiles', desc: 'System users, contact info, and assigned RBAC roles', count: users.length },
                  { name: 'products', desc: 'LPG cylinders catalog, deposit values, full/empty/damaged stock', count: products.length },
                  { name: 'customers', desc: 'Dealers, hotels, restaurants, credit limits, cylinder holdings', count: customers.length },
                  { name: 'suppliers', desc: 'Gas refinery depots, cylinder payables, and dues', count: suppliers.length },
                  { name: 'sales', desc: 'Invoices, delivery challans, cylinder exchange quantities', count: sales.length },
                  { name: 'purchases', desc: 'Refinery depot cylinder truck dispatches and payments', count: purchases.length },
                  { name: 'stock_movements', desc: 'Full/empty movement audit trail across godown transactions', count: stockMovements.length },
                  { name: 'money_receipts', desc: 'Payments collected from customers and dealers', count: moneyReceipts.length },
                  { name: 'expenses', desc: 'Operational godown overheads, transport, and utilities', count: expenses.length },
                  { name: 'app_settings', desc: 'Business profile, VAT mode, trade license, and invoice prefixes', count: 1 },
                ].map((tbl, i) => {
                  const remCount = remoteCounts[tbl.name];
                  const isSyncOk = remCount !== null && remCount !== undefined && remCount > 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono font-bold text-orange-700">{tbl.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{tbl.desc}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{tbl.count}</td>
                      <td className="px-3 py-2.5 font-mono font-bold">
                        {remCount === null || remCount === undefined ? (
                          <span className="text-slate-400 font-normal">Unknown / Error</span>
                        ) : (
                          <span className={remCount > 0 ? 'text-emerald-700' : 'text-slate-500'}>
                            {remCount} records
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {isSyncOk ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Synced ({remCount})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Pending Sync</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PostgreSQL Schema SQL & Quick Patch */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          {/* Quick Patch Box */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>1-Click Permissions & Schema Patch (Recommended)</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  If you already ran the initial tables script, copy and run this short patch in Supabase SQL Editor to instantly grant write permissions to Products & Suppliers and add any missing columns.
                </p>
              </div>
              <button
                onClick={handleCopyPatch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                {copiedPatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPatch ? 'Copied Patch!' : 'Copy Quick Patch SQL'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-amber-300 font-mono text-[11px] rounded overflow-x-auto max-h-44 select-all border border-amber-200">
              <pre className="whitespace-pre">{SUPABASE_QUICK_PATCH_SQL}</pre>
            </div>
          </div>

          {/* Full Master Script */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Complete Master SQL Migration Script</h2>
                <p className="text-xs text-slate-500">Full schema definition for creating all 12 tables, indexes, and full RLS policies from scratch</p>
              </div>
              <button
                onClick={handleCopySQL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Entire SQL!' : 'Copy Full Schema SQL'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-[420px] select-all">
              <pre className="whitespace-pre">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
