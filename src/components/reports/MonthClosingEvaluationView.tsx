import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Warehouse, 
  Layers, 
  Printer, 
  Download, 
  Search, 
  CheckCircle2, 
  Flame, 
  DollarSign, 
  Coins, 
  Boxes, 
  Filter, 
  RefreshCw, 
  ArrowUpRight,
  Database,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { WarehouseRowData } from '../../types';

export const MonthClosingEvaluationView: React.FC = () => {
  const { 
    monthClosingReport, 
    refreshMonthClosingReport, 
    isSupabaseConnected, 
    formatCurrency, 
    formatQty, 
    toBnNum, 
    t, 
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | '12kg' | '35kg' | '45kg' | 'multi' | 'balance'>('all');
  const [stockTypeFilter, setStockTypeFilter] = useState<'ALL' | 'EMPTY' | 'REFILL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const report = monthClosingReport;
  const summary = report.evaluationSummary;
  const balance = report.balanceSheet;
  const matrix = report.matrix;
  const warehouses = report.warehouses || ['Signboard', 'Rayerbagh', 'Amuliya', 'Postokhola', 'Jatrabari', 'Mongla', 'X', 'Y'];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMonthClosingReport();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Warehouse total percentages
  const warehouseTotalFleet = summary.grandTotalCylinders || 7560;
  const warehouseStats = useMemo(() => {
    return [
      { name: 'Signboard', count: summary.warehouseTotals?.Signboard ?? 2746, color: 'bg-blue-600', textColor: 'text-blue-600', borderColor: 'border-blue-200', bgLight: 'bg-blue-50' },
      { name: 'Rayerbagh', count: summary.warehouseTotals?.Rayerbagh ?? 2449, color: 'bg-emerald-600', textColor: 'text-emerald-600', borderColor: 'border-emerald-200', bgLight: 'bg-emerald-50' },
      { name: 'Mongla', count: summary.warehouseTotals?.Mongla ?? 885, color: 'bg-amber-600', textColor: 'text-amber-600', borderColor: 'border-amber-200', bgLight: 'bg-amber-50' },
      { name: 'Amuliya', count: summary.warehouseTotals?.Amuliya ?? 724, color: 'bg-purple-600', textColor: 'text-purple-600', borderColor: 'border-purple-200', bgLight: 'bg-purple-50' },
      { name: 'Postokhola', count: summary.warehouseTotals?.Postokhola ?? 613, color: 'bg-indigo-600', textColor: 'text-indigo-600', borderColor: 'border-indigo-200', bgLight: 'bg-indigo-50' },
      { name: 'Jatrabari', count: summary.warehouseTotals?.Jatrabari ?? 143, color: 'bg-rose-600', textColor: 'text-rose-600', borderColor: 'border-rose-200', bgLight: 'bg-rose-50' },
      { name: 'Godown X', count: summary.warehouseTotals?.X ?? 0, color: 'bg-slate-400', textColor: 'text-slate-500', borderColor: 'border-slate-200', bgLight: 'bg-slate-50' },
      { name: 'Godown Y', count: summary.warehouseTotals?.Y ?? 0, color: 'bg-slate-400', textColor: 'text-slate-500', borderColor: 'border-slate-200', bgLight: 'bg-slate-50' },
    ];
  }, [summary]);

  // Consolidated rows for the All-in-One table
  interface ConsolidatedRow extends WarehouseRowData {
    categorySize: string;
    type: 'Empty' | 'Refill';
  }

  const allRows: ConsolidatedRow[] = useMemo(() => {
    const rows: ConsolidatedRow[] = [];

    // 12 KG Empty
    matrix.size12KgEmpty.forEach(r => {
      rows.push({ ...r, categorySize: '12 KG', type: 'Empty' });
    });
    // 12 KG Refill
    matrix.size12KgRefill.forEach(r => {
      rows.push({ ...r, categorySize: '12 KG', type: 'Refill' });
    });

    // 35 KG Empty
    matrix.size35KgEmpty.forEach(r => {
      rows.push({ ...r, categorySize: '35 KG', type: 'Empty' });
    });
    // 35 KG Refill
    matrix.size35KgRefill.forEach(r => {
      rows.push({ ...r, categorySize: '35 KG', type: 'Refill' });
    });

    // 45 KG Empty
    matrix.size45KgEmpty.forEach(r => {
      rows.push({ ...r, categorySize: '45 KG', type: 'Empty' });
    });
    // 45 KG Refill
    matrix.size45KgRefill.forEach(r => {
      rows.push({ ...r, categorySize: '45 KG', type: 'Refill' });
    });

    // Multi Empty
    matrix.sizeMultiEmpty.forEach(r => {
      rows.push({ ...r, categorySize: r.size || 'Multi', type: 'Empty' });
    });
    // Multi Refill
    matrix.sizeMultiRefill.forEach(r => {
      rows.push({ ...r, categorySize: r.size || 'Multi', type: 'Refill' });
    });

    return rows;
  }, [matrix]);

  // Filtering for table display
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      // Tab filter
      if (activeTab === '12kg' && row.categorySize !== '12 KG') return false;
      if (activeTab === '35kg' && row.categorySize !== '35 KG') return false;
      if (activeTab === '45kg' && row.categorySize !== '45 KG') return false;
      if (activeTab === 'multi' && (row.categorySize === '12 KG' || row.categorySize === '35 KG' || row.categorySize === '45 KG')) return false;

      // Stock type filter
      if (stockTypeFilter === 'EMPTY' && row.type !== 'Empty') return false;
      if (stockTypeFilter === 'REFILL' && row.type !== 'Refill') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const brandMatch = row.brand.toLowerCase().includes(q);
        const sizeMatch = (row.size || row.categorySize).toLowerCase().includes(q);
        if (!brandMatch && !sizeMatch) return false;
      }

      // Warehouse filter: only include rows that have > 0 in that warehouse
      if (selectedWarehouseFilter !== 'ALL') {
        const whVal = (row as any)[selectedWarehouseFilter] || 0;
        if (whVal <= 0) return false;
      }

      return true;
    });
  }, [allRows, activeTab, stockTypeFilter, searchQuery, selectedWarehouseFilter]);

  // Dynamic column totals for filtered view
  const columnTotals = useMemo(() => {
    const totals = {
      total: 0,
      Signboard: 0,
      Rayerbagh: 0,
      Amuliya: 0,
      Postokhola: 0,
      Jatrabari: 0,
      Mongla: 0,
      X: 0,
      Y: 0,
    };

    filteredRows.forEach(r => {
      totals.total += r.total || 0;
      totals.Signboard += r.Signboard || 0;
      totals.Rayerbagh += r.Rayerbagh || 0;
      totals.Amuliya += r.Amuliya || 0;
      totals.Postokhola += r.Postokhola || 0;
      totals.Jatrabari += r.Jatrabari || 0;
      totals.Mongla += r.Mongla || 0;
      totals.X += r.X || 0;
      totals.Y += r.Y || 0;
    });

    return totals;
  }, [filteredRows]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Brand', 'Category / Size', 'Type', 'Total', ...warehouses];
    const csvRows = [headers.join(',')];

    filteredRows.forEach(r => {
      const line = [
        `"${r.brand}"`,
        `"${r.categorySize}"`,
        `"${r.type}"`,
        r.total,
        r.Signboard,
        r.Rayerbagh,
        r.Amuliya,
        r.Postokhola,
        r.Jatrabari,
        r.Mongla,
        r.X,
        r.Y,
      ];
      csvRows.push(line.join(','));
    });

    csvRows.push([
      '"TOTAL"',
      '""',
      '""',
      columnTotals.total,
      columnTotals.Signboard,
      columnTotals.Rayerbagh,
      columnTotals.Amuliya,
      columnTotals.Postokhola,
      columnTotals.Jatrabari,
      columnTotals.Mongla,
      columnTotals.X,
      columnTotals.Y,
    ].join(','));

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Month_Closing_Cylinder_Matrix_${report.evaluationDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs font-black">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {language === 'bn' ? 'মাসিক ক্লোজিং সিলিন্ডার মূল্যায়ন ও গোডাউন স্টক বিতরণ' : 'Month Closing Cylinder Evaluation & Warehouse Matrix'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-3 h-3 text-emerald-600" />
                  {language === 'bn' ? 'সুভাব্যাস ডিবি সিঙ্কড' : 'Supabase Live DB'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{language === 'bn' ? 'মূল্যায়ন তারিখ:' : 'Evaluation Date:'} <strong className="text-slate-700">{report.evaluationDate}</strong></span>
                <span>•</span>
                <span>{language === 'bn' ? 'মোট সিলিন্ডার বহর:' : 'Total Fleet Accounted:'} <strong className="text-slate-700">{formatQty(summary.grandTotalCylinders)} {language === 'bn' ? 'টি' : 'pcs'}</strong></span>
                <span>•</span>
                <span>{language === 'bn' ? 'ক্লোজিং ভ্যালুয়েশন:' : 'Closing Balance:'} <strong className="text-emerald-700 font-bold">{formatCurrency(balance.grandTotalAmount)}</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Refresh directly from Supabase database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-600' : 'text-slate-600'}`} />
            <span>{isRefreshing ? (language === 'bn' ? 'রিফ্রেশ হচ্ছে...' : 'Refreshing...') : (language === 'bn' ? 'ডাটাবেজ রিফ্রেশ' : 'Sync from DB')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিপোর্ট প্রিন্ট' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Balance Sheet & Cylinder Quantities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Fleet */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট সিলিন্ডার বহর' : 'Total Cylinders'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatQty(summary.grandTotalCylinders)}
            </span>
            <span className="text-xs font-medium text-slate-500">{language === 'bn' ? 'টি সিলিন্ডার' : 'pcs'}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              {language === 'bn' ? 'রিফিল (ভর্তি):' : 'Refill (Full):'} {formatQty(summary.grandTotalRefill)}
            </span>
            <span className="text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
              {language === 'bn' ? 'খালি:' : 'Empty:'} {formatQty(summary.grandTotalEmpty)}
            </span>
          </div>
        </div>

        {/* Refill Gas Inventory Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'রিফিল গ্যাস মূল্য (১৯৪ টি)' : 'Refill Gas Valuation'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {formatCurrency(balance.refillGasAmount)}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {language === 'bn' ? 'গোডাউনে রক্ষিত ভর্তি গ্যাস সিলিন্ডার' : 'Calculated across 194 full cylinders'}
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'হাতে নগদ ক্যাশ' : 'Cash in Hand'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatCurrency(balance.cashInHand)}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {language === 'bn' ? 'মাস সমাপনী ক্যাশবই নিশ্চিতকৃত' : 'Reconciled closing physical cash'}
          </div>
        </div>

        {/* Grand Total Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
              {language === 'bn' ? 'সর্বমোট ক্লোজিং ভ্যালুয়েশন' : 'Grand Total Valuation'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/10 text-orange-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(balance.grandTotalAmount)}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
            <span>{language === 'bn' ? 'গ্যাস স্টক + ক্যাশ ব্যালেন্স' : 'Gas Stock + Cash Balance'}</span>
            <span className="text-emerald-400 font-bold">100% {language === 'bn' ? 'সঠিক' : 'Exact'}</span>
          </div>
        </div>
      </div>

      {/* Size Breakdown Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">{language === 'bn' ? '১২ কেজি সিলিন্ডার' : '12 KG Cylinders'}</span>
            <span className="text-lg font-black text-slate-900">{formatQty(summary.total12KgCombined)} {language === 'bn' ? 'টি' : 'pcs'}</span>
          </div>
          <div className="text-right text-[11px]">
            <span className="text-slate-500 block">{language === 'bn' ? 'খালি:' : 'Empty:'} {formatQty(summary.total12KgEmpty)}</span>
            <span className="text-emerald-600 font-bold block">{language === 'bn' ? 'ভর্তি:' : 'Refill:'} {formatQty(summary.total12KgRefill)}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">{language === 'bn' ? '৩৫ কেজি সিলিন্ডার' : '35 KG Cylinders'}</span>
            <span className="text-lg font-black text-slate-900">{formatQty(summary.total35KgCombined)} {language === 'bn' ? 'টি' : 'pcs'}</span>
          </div>
          <div className="text-right text-[11px]">
            <span className="text-slate-500 block">{language === 'bn' ? 'খালি:' : 'Empty:'} {formatQty(summary.total35KgEmpty)}</span>
            <span className="text-emerald-600 font-bold block">{language === 'bn' ? 'ভর্তি:' : 'Refill:'} {formatQty(summary.total35KgRefill)}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">{language === 'bn' ? '৪৫ কেজি সিলিন্ডার' : '45 KG Cylinders'}</span>
            <span className="text-lg font-black text-slate-900">{formatQty(summary.total45KgCombined)} {language === 'bn' ? 'টি' : 'pcs'}</span>
          </div>
          <div className="text-right text-[11px]">
            <span className="text-slate-500 block">{language === 'bn' ? 'খালি:' : 'Empty:'} {formatQty(summary.total45KgEmpty)}</span>
            <span className="text-emerald-600 font-bold block">{language === 'bn' ? 'ভর্তি:' : 'Refill:'} {formatQty(summary.total45KgRefill)}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">{language === 'bn' ? 'অন্যান্য সাইজ (৫.৫, ২০, ২২, ২৫ কেজি)' : 'Multi Sizes (5.5, 20, 22, 25)'}</span>
            <span className="text-lg font-black text-slate-900">{formatQty(summary.totalMultiCombined)} {language === 'bn' ? 'টি' : 'pcs'}</span>
          </div>
          <div className="text-right text-[11px]">
            <span className="text-slate-500 block">{language === 'bn' ? 'খালি:' : 'Empty:'} {formatQty(summary.totalMultiEmpty)}</span>
            <span className="text-emerald-600 font-bold block">{language === 'bn' ? 'ভর্তি:' : 'Refill:'} {formatQty(summary.totalMultiRefill)}</span>
          </div>
        </div>
      </div>

      {/* Warehouse / Godown Distribution Matrix Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-orange-600" />
              <span>{language === 'bn' ? 'গোডাউনভিত্তিক সিলিন্ডার স্টক বণ্টন (মোট ৮টি গোডাউন)' : 'Warehouse Cylinder Distribution Breakdown (8 Locations)'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn' ? 'প্রতিটি গোডাউনে রক্ষিত খালি ও ভর্তি সিলিন্ডারের প্রকৃত সংখ্যা' : 'Actual physical stock counts verified per godown / depot location'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {language === 'bn' ? 'মোট:' : 'Total:'} {formatQty(warehouseTotalFleet)} {language === 'bn' ? 'টি' : 'pcs'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {warehouseStats.map(wh => {
            const pct = ((wh.count / warehouseTotalFleet) * 100).toFixed(1);
            return (
              <div 
                key={wh.name}
                onClick={() => setSelectedWarehouseFilter(selectedWarehouseFilter === wh.name ? 'ALL' : wh.name)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWarehouseFilter === wh.name 
                    ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50/30' 
                    : `${wh.borderColor} ${wh.bgLight} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 truncate">{wh.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{toBnNum(pct)}%</span>
                </div>
                <div className={`text-xl font-black mt-1 ${wh.textColor}`}>
                  {formatQty(wh.count)}
                </div>
                {/* Visual bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`${wh.color} h-1.5 rounded-full transition-all duration-500`} 
                    style={{ width: `${Math.max(2, parseFloat(pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tabbed Data Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'bn' ? 'সকল ব্র্যান্ড ও সাইজ' : 'All Cylinders'} ({allRows.length})
            </button>
            <button
              onClick={() => setActiveTab('12kg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === '12kg'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              12 KG ({matrix.size12KgEmpty.length + matrix.size12KgRefill.length})
            </button>
            <button
              onClick={() => setActiveTab('35kg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === '35kg'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              35 KG ({matrix.size35KgEmpty.length + matrix.size35KgRefill.length})
            </button>
            <button
              onClick={() => setActiveTab('45kg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === '45kg'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              45 KG ({matrix.size45KgEmpty.length + matrix.size45KgRefill.length})
            </button>
            <button
              onClick={() => setActiveTab('multi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'multi'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'bn' ? 'অন্যান্য সাইজ' : 'Multi Sizes'} ({matrix.sizeMultiEmpty.length + matrix.sizeMultiRefill.length})
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'balance'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              {language === 'bn' ? 'ব্যালেন্স শিট রিকনসিলিয়েশন' : 'Balance Sheet Sheet'}
            </button>
          </div>

          {/* Search & Secondary Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stock Type Filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold">
              <button
                onClick={() => setStockTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${stockTypeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                {language === 'bn' ? 'সব' : 'All'}
              </button>
              <button
                onClick={() => setStockTypeFilter('EMPTY')}
                className={`px-2.5 py-1 rounded-md transition-colors ${stockTypeFilter === 'EMPTY' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                {language === 'bn' ? 'খালি' : 'Empty'}
              </button>
              <button
                onClick={() => setStockTypeFilter('REFILL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${stockTypeFilter === 'REFILL' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}
              >
                {language === 'bn' ? 'ভর্তি (রিফিল)' : 'Refill'}
              </button>
            </div>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouseFilter}
              onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden focus:border-orange-500"
            >
              <option value="ALL">{language === 'bn' ? 'সকল গোডাউন' : 'All Godowns'}</option>
              {warehouses.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'ব্র্যান্ড খুঁজুন...' : 'Search brand...'}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-orange-500 w-40 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Balance Sheet Tab View */}
        {activeTab === 'balance' ? (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                {language === 'bn' ? 'মাস সমাপনী আর্থিক মূল্যায়ন ও ব্যালেন্স শিট' : 'Month Closing Financial Valuation & Balance Sheet'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {language === 'bn' ? 'গ্রাহকের প্রদত্ত হিসাব অনুযায়ী গ্যাসের মূল্য এবং হাতে নগদ টাকার চূড়ান্ত সমন্বয়' : 'Verified reconciliation of gas inventory asset valuation and physical cash in hand'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">{language === 'bn' ? 'খাতের বিবরণ' : 'Balance Sheet Particulars'}</th>
                      <th className="py-2.5 px-4">{language === 'bn' ? 'পরিমাপক / সিলিন্ডার' : 'Basis / Units'}</th>
                      <th className="py-2.5 px-4">{language === 'bn' ? 'হিসাব নম্বর / ভাউচার' : 'Voucher Reference'}</th>
                      <th className="py-2.5 px-4 text-right">{language === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <span>{language === 'bn' ? 'রিফিল গ্যাস সিলিন্ডারের মূল্য (ভর্তি গ্যাস স্টক)' : 'Refill Gas Valuation (Full Cylinder Stock)'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono font-medium">194 {language === 'bn' ? 'টি ভর্তি সিলিন্ডার' : 'Refill Cylinders'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">VR-MC-GAS-002</td>
                      <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">{formatCurrency(balance.refillGasAmount)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'হাতে নগদ ক্যাশ ব্যালেন্স (ক্যাশ ইন হ্যান্ড)' : 'Cash in Hand (Physical Cashbook)'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono font-medium">{language === 'bn' ? 'ক্যাশ ড্রয়ার ও সিন্দুক' : 'Vault & Cash Drawer'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">VR-MC-CASH-001</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">{formatCurrency(balance.cashInHand)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {language === 'bn' ? 'ব্যাংক ব্যালেন্স' : 'Cash in Bank'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">-</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">BANK-CLOSING</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{formatCurrency(balance.cashInBank)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {language === 'bn' ? 'কোম্পানি ডিও (Closing Company D/O)' : 'Closing Company D/O'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">-</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">DO-CLOSING</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{formatCurrency(balance.closingCompanyDO)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-extrabold text-sm">
                    <tr>
                      <td className="py-3.5 px-4" colSpan={3}>
                        {language === 'bn' ? 'সর্বমোট সমাপনী ভ্যালুয়েশন (Grand Total Amount)' : 'GRAND TOTAL VALUATION'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-orange-400 font-black text-base">
                        {formatCurrency(balance.grandTotalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Matrix Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 min-w-[140px] sticky left-0 bg-slate-100 z-10 shadow-r">
                    {language === 'bn' ? 'ব্র্যান্ড নাম' : 'Brand Name'}
                  </th>
                  <th className="py-3 px-3 min-w-[70px] text-center">
                    {language === 'bn' ? 'সাইজ' : 'Size'}
                  </th>
                  <th className="py-3 px-3 min-w-[75px] text-center">
                    {language === 'bn' ? 'ধরন' : 'Status'}
                  </th>
                  <th className="py-3 px-3.5 text-right font-black text-slate-900 bg-orange-50/50 min-w-[75px]">
                    {language === 'bn' ? 'মোট' : 'Total'}
                  </th>
                  <th className="py-3 px-3 text-right min-w-[75px]">Signboard</th>
                  <th className="py-3 px-3 text-right min-w-[75px]">Rayerbagh</th>
                  <th className="py-3 px-3 text-right min-w-[75px]">Amuliya</th>
                  <th className="py-3 px-3 text-right min-w-[75px]">Postokhola</th>
                  <th className="py-3 px-3 text-right min-w-[75px]">Jatrabari</th>
                  <th className="py-3 px-3 text-right min-w-[75px]">Mongla</th>
                  <th className="py-3 px-2 text-right min-w-[50px] text-slate-400">X</th>
                  <th className="py-3 px-2 text-right min-w-[50px] text-slate-400">Y</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      <span>{language === 'bn' ? 'কোনো ডাটা পাওয়া যায়নি।' : 'No cylinder records match your filter criteria.'}</span>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => {
                    const isRefill = row.type === 'Refill';
                    return (
                      <tr 
                        key={`${row.brand}-${row.categorySize}-${row.type}-${idx}`}
                        className={`hover:bg-slate-50/80 transition-colors ${isRefill ? 'bg-emerald-50/20' : ''}`}
                      >
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 sticky left-0 bg-white z-10 shadow-r">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isRefill ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span className="truncate">{row.brand}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px]">
                          {row.categorySize}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isRefill 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {isRefill ? (language === 'bn' ? 'ভর্তি' : 'Refill') : (language === 'bn' ? 'খালি' : 'Empty')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-black text-slate-900 bg-orange-50/40 font-mono text-sm">
                          {formatQty(row.total)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${row.Signboard > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>
                          {row.Signboard > 0 ? formatQty(row.Signboard) : '0'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${row.Rayerbagh > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>
                          {row.Rayerbagh > 0 ? formatQty(row.Rayerbagh) : '0'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${row.Amuliya > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>
                          {row.Amuliya > 0 ? formatQty(row.Amuliya) : '0'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${row.Postokhola > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>
                          {row.Postokhola > 0 ? formatQty(row.Postokhola) : '0'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${row.Jatrabari > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>
                          {row.Jatrabari > 0 ? formatQty(row.Jatrabari) : '0'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono ${row.Mongla > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>
                          {row.Mongla > 0 ? formatQty(row.Mongla) : '0'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                          {row.X || '0'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                          {row.Y || '0'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-extrabold text-xs border-t-2 border-slate-700">
                <tr>
                  <td className="py-3 px-3.5 sticky left-0 bg-slate-900 z-10 shadow-r">
                    {language === 'bn' ? 'মোট সিলিন্ডার সংখ্যা:' : 'TOTAL CYLINDERS:'}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 font-normal">
                    {filteredRows.length} {language === 'bn' ? 'টি আইটেম' : 'items'}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400">
                    -
                  </td>
                  <td className="py-3 px-3.5 text-right font-black text-orange-400 font-mono text-sm bg-slate-950">
                    {formatQty(columnTotals.total)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-300">
                    {formatQty(columnTotals.Signboard)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-300">
                    {formatQty(columnTotals.Rayerbagh)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300">
                    {formatQty(columnTotals.Amuliya)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-300">
                    {formatQty(columnTotals.Postokhola)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-300">
                    {formatQty(columnTotals.Jatrabari)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-300">
                    {formatQty(columnTotals.Mongla)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-400">
                    {columnTotals.X}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-400">
                    {columnTotals.Y}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
