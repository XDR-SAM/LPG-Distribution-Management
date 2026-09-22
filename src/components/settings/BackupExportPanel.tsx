import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  ArrowLeftRight, 
  DollarSign, 
  Receipt,
  FileCode,
  Calendar,
  Layers,
  Archive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  downloadCSV, 
  exportCustomersToCSV, 
  exportProductsToCSV, 
  exportSalesToCSV, 
  exportPurchasesToCSV, 
  exportStockMovementsToCSV, 
  exportCustomerCylinderLedgerToCSV, 
  exportTransactionsToCSV, 
  exportExpensesToCSV 
} from '../../utils/csvExportImport';

export const BackupExportPanel: React.FC = () => {
  const { 
    customers, 
    products, 
    suppliers, 
    sales, 
    purchases, 
    stockMovements, 
    customerCylinderLedger, 
    transactions, 
    expenses, 
    settings, 
    exportBackupJSON 
  } = useApp();

  const [copiedJSON, setCopiedJSON] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [jsonPreviewText, setJsonPreviewText] = useState('');

  const dateSlug = new Date().toISOString().split('T')[0];

  const triggerDownload = (content: string, filename: string, mimeType = 'application/json') => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFullJSON = () => {
    const json = exportBackupJSON();
    const filename = `lpg-database-backup-${dateSlug}.json`;
    triggerDownload(json, filename, 'application/json');
    setDownloadSuccessMsg(`Downloaded full database backup (${filename})`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  const handleCopyJSON = () => {
    const json = exportBackupJSON();
    navigator.clipboard.writeText(json).then(() => {
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2500);
    });
  };

  const handleOpenPreview = () => {
    const json = exportBackupJSON();
    // Show only the first 500 lines if too large
    setJsonPreviewText(json);
    setShowJSONPreview(true);
  };

  // CSV Exporters
  const handleExportCustomersCSV = () => {
    const csv = exportCustomersToCSV(customers);
    downloadCSV(`customers-list-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${customers.length} customers to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportProductsCSV = () => {
    const csv = exportProductsToCSV(products);
    downloadCSV(`cylinder-inventory-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${products.length} products to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportSalesCSV = () => {
    const csv = exportSalesToCSV(sales);
    downloadCSV(`sales-invoices-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${sales.length} sales invoices to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportPurchasesCSV = () => {
    const csv = exportPurchasesToCSV(purchases);
    downloadCSV(`purchases-depot-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${purchases.length} purchases to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportMovementsCSV = () => {
    const csv = exportStockMovementsToCSV(stockMovements);
    downloadCSV(`cylinder-movements-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${stockMovements.length} stock movements to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportCustomerLedgerCSV = () => {
    const csv = exportCustomerCylinderLedgerToCSV(customerCylinderLedger);
    downloadCSV(`customer-cylinder-holding-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${customerCylinderLedger.length} cylinder ledger records to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportTransactionsCSV = () => {
    const csv = exportTransactionsToCSV(transactions);
    downloadCSV(`cashbook-transactions-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${transactions.length} financial transactions to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportExpensesCSV = () => {
    const csv = exportExpensesToCSV(expenses);
    downloadCSV(`expenses-${dateSlug}.csv`, csv);
    setDownloadSuccessMsg(`Exported ${expenses.length} expense records to CSV`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportAllCSV = () => {
    handleExportCustomersCSV();
    setTimeout(handleExportProductsCSV, 200);
    setTimeout(handleExportSalesCSV, 400);
    setTimeout(handleExportPurchasesCSV, 600);
    setTimeout(handleExportMovementsCSV, 800);
    setTimeout(handleExportCustomerLedgerCSV, 1000);
    setTimeout(handleExportTransactionsCSV, 1200);
    setTimeout(handleExportExpensesCSV, 1400);
    setDownloadSuccessMsg('Downloading all 8 CSV modules...');
    setTimeout(() => setDownloadSuccessMsg(null), 5000);
  };

  const totalRecords = customers.length + products.length + suppliers.length + sales.length + purchases.length + stockMovements.length + transactions.length + expenses.length;

  const csvCards = [
    {
      id: 'cust-csv',
      title: 'Customers & Balance',
      icon: Users,
      count: customers.length,
      unit: 'parties',
      desc: 'Party names, phone, address, credit limit, and receivables due.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      action: handleExportCustomersCSV,
    },
    {
      id: 'prod-csv',
      title: 'Cylinder Inventory',
      icon: Package,
      count: products.length,
      unit: 'SKUs',
      desc: 'LPG brands, sizes, full cylinders, empty stocks, and sales/cost rates.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      action: handleExportProductsCSV,
    },
    {
      id: 'sales-csv',
      title: 'Sales & Invoices',
      icon: ShoppingCart,
      count: sales.length,
      unit: 'invoices',
      desc: 'All invoices, cylinder quantities delivered, payments, and balances.',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      action: handleExportSalesCSV,
    },
    {
      id: 'purch-csv',
      title: 'Purchases & Depot Receipts',
      icon: Truck,
      count: purchases.length,
      unit: 'vouchers',
      desc: 'Plant challans, full received, empties sent back, and payments.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      action: handleExportPurchasesCSV,
    },
    {
      id: 'move-csv',
      title: 'Cylinder In/Out Ledger',
      icon: ArrowLeftRight,
      count: stockMovements.length,
      unit: 'movements',
      desc: 'Daily physical cylinder movement vouchers and refilling flow.',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      action: handleExportMovementsCSV,
    },
    {
      id: 'cyl-ledger-csv',
      title: 'Customer Cylinder Holding',
      icon: Layers,
      count: customerCylinderLedger.length,
      unit: 'entries',
      desc: 'Detailed cylinder holding balance and empty return history per party.',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      action: handleExportCustomerLedgerCSV,
    },
    {
      id: 'cash-csv',
      title: 'Cashbook & Banking',
      icon: DollarSign,
      count: transactions.length,
      unit: 'vouchers',
      desc: 'Cash in drawer, Bank (Islami/DBBL), bKash/Nagad transactions.',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      action: handleExportTransactionsCSV,
    },
    {
      id: 'exp-csv',
      title: 'Operating Expenses',
      icon: Receipt,
      count: expenses.length,
      unit: 'records',
      desc: 'Truck diesel, driver wages, godown rent, labor, and utility costs.',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      action: handleExportExpensesCSV,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {downloadSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800 text-xs font-semibold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccessMsg}</span>
          </div>
          <span className="text-[11px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Ready in downloads folder</span>
        </div>
      )}

      {/* SECTION 1: Full Database JSON Backup */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Complete Database Backup (.JSON)</h3>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-semibold text-[10px] rounded-full">
                  Recommended for full disaster recovery
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Takes a complete, snapshot backup of your entire LPG system: customers, cylinder inventory, 
                sales invoices, depot purchases, cylinder holding ledgers, cashbook transactions, and system settings.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Backup:</span>
              <span className="font-bold text-slate-900">
                {settings?.lastBackupTime || 'Not recorded yet'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Total Database Records: <strong className="text-slate-700">{totalRecords.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Record count summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customers</div>
            <div className="text-sm font-black text-slate-800">{customers.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Products</div>
            <div className="text-sm font-black text-slate-800">{products.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suppliers</div>
            <div className="text-sm font-black text-slate-800">{suppliers.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sales</div>
            <div className="text-sm font-black text-slate-800">{sales.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Purchases</div>
            <div className="text-sm font-black text-slate-800">{purchases.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Movements</div>
            <div className="text-sm font-black text-slate-800">{stockMovements.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cashbook</div>
            <div className="text-sm font-black text-slate-800">{transactions.length}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expenses</div>
            <div className="text-sm font-black text-slate-800">{expenses.length}</div>
          </div>
        </div>

        {/* JSON Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJSON}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedJSON ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJSON ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPreview}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-4 h-4 text-slate-600" />
              <span>Preview Snapshot</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportFullJSON}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2 transition-all transform active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Database JSON Backup</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Modular CSV Exports */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Module CSV Exports (Excel / Google Sheets)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Export clean, formatted CSV spreadsheets with UTF-8 BOM encoding for Microsoft Excel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportAllCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Export All Modules as CSV Bundle</span>
          </button>
        </div>

        {/* 8 Modular CSV Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {csvCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex flex-col justify-between transition-all hover:shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      {card.count.toLocaleString()} <span className="font-normal text-slate-400 text-[10px]">{card.unit}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={card.action}
                  className="mt-3 w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Download CSV</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Preview Modal */}
      {showJSONPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-sm text-slate-900">Database JSON Snapshot Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJSONPreview(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950 font-mono text-[11px] text-emerald-400">
              <pre className="whitespace-pre-wrap break-all">
                {jsonPreviewText.slice(0, 50000)}
                {jsonPreviewText.length > 50000 && '\n\n... [Content truncated for preview. Download file to view complete snapshot.]'}
              </pre>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Payload Size: <strong>{Math.round(jsonPreviewText.length / 1024)} KB</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                >
                  {copiedJSON ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportFullJSON();
                    setShowJSONPreview(false);
                  }}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
