import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileUp, 
  FileJson, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Users, 
  Package, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  parseCustomersFromCSV, 
  parseProductsFromCSV, 
  getCustomerCSVTemplate, 
  getProductCSVTemplate, 
  downloadCSV 
} from '../../utils/csvExportImport';

export const RestoreImportPanel: React.FC = () => {
  const { 
    importBackupJSON, 
    importCustomersBatch, 
    importProductsBatch,
    customers,
    products 
  } = useApp();

  const [activeImportType, setActiveImportType] = useState<'json' | 'csv-customers' | 'csv-products'>('json');

  // JSON Restore State
  const [jsonText, setJsonText] = useState('');
  const [jsonFileName, setJsonFileName] = useState<string | null>(null);
  const [jsonInspectData, setJsonInspectData] = useState<any | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string; counts?: any } | null>(null);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [parsedCustomerResult, setParsedCustomerResult] = useState<{ valid: any[]; errors: string[] } | null>(null);
  const [parsedProductResult, setParsedProductResult] = useState<{ valid: any[]; errors: string[] } | null>(null);
  const [csvImportSuccess, setCsvImportSuccess] = useState<string | null>(null);

  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Handle JSON File Reading
  const handleJSONFileSelect = (file: File) => {
    setJsonFileName(file.name);
    setJsonError(null);
    setRestoreResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setJsonText(text);
      validateAndInspectJSON(text);
    };
    reader.onerror = () => {
      setJsonError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const validateAndInspectJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        setJsonError('The file does not contain a valid JSON object.');
        setJsonInspectData(null);
        return;
      }

      if (!parsed.customers && !parsed.products && !parsed.sales) {
        setJsonError('This JSON file does not appear to be an LPG Distribution backup (missing customers, products, or sales).');
        setJsonInspectData(null);
        return;
      }

      setJsonInspectData({
        version: parsed.version || '1.0',
        exportedAt: parsed.exportedAt || 'Unknown',
        businessName: parsed.businessName || parsed.settings?.profile?.businessName || 'LPG Enterprise',
        customersCount: parsed.customers?.length || 0,
        productsCount: parsed.products?.length || 0,
        suppliersCount: parsed.suppliers?.length || 0,
        salesCount: parsed.sales?.length || 0,
        purchasesCount: parsed.purchases?.length || 0,
        movementsCount: parsed.stockMovements?.length || 0,
        transactionsCount: parsed.transactions?.length || 0,
      });
      setJsonError(null);
    } catch (err: any) {
      setJsonError('Syntax Error: ' + (err.message || 'Invalid JSON syntax'));
      setJsonInspectData(null);
    }
  };

  const handleExecuteRestore = () => {
    if (!jsonText.trim()) return;
    setIsConfirmModalOpen(false);

    const res = importBackupJSON(jsonText, restoreMode);
    setRestoreResult(res);
    if (res.success) {
      // Clear inputs
      setJsonText('');
      setJsonInspectData(null);
      setJsonFileName(null);
    }
  };

  // CSV Parsing
  const handleCSVFileSelect = (file: File) => {
    setCsvFile(file);
    setCsvImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);

      if (activeImportType === 'csv-customers') {
        const res = parseCustomersFromCSV(text);
        setParsedCustomerResult(res);
      } else if (activeImportType === 'csv-products') {
        const res = parseProductsFromCSV(text);
        setParsedProductResult(res);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteCustomerImport = () => {
    if (!parsedCustomerResult || parsedCustomerResult.valid.length === 0) return;
    const { added, updated } = importCustomersBatch(parsedCustomerResult.valid);
    setCsvImportSuccess(`Successfully imported ${added} new customers, and updated ${updated} existing records.`);
    setParsedCustomerResult(null);
    setCsvFile(null);
    setCsvText('');
  };

  const handleExecuteProductImport = () => {
    if (!parsedProductResult || parsedProductResult.valid.length === 0) return;
    const { added, updated } = importProductsBatch(parsedProductResult.valid);
    setCsvImportSuccess(`Successfully imported ${added} new products, and updated ${updated} existing records.`);
    setParsedProductResult(null);
    setCsvFile(null);
    setCsvText('');
  };

  return (
    <div className="space-y-6">
      {/* Import Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveImportType('json');
            setCsvImportSuccess(null);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors ${
            activeImportType === 'json'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileJson className="w-4 h-4" />
          <span>Full JSON Database Restore</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveImportType('csv-customers');
            setRestoreResult(null);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors ${
            activeImportType === 'csv-customers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Bulk Import Customers (CSV)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveImportType('csv-products');
            setRestoreResult(null);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors ${
            activeImportType === 'csv-products'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Bulk Import Products (CSV)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* OPTION 1: FULL JSON DATABASE RESTORE */}
      {/* ============================================================ */}
      {activeImportType === 'json' && (
        <div className="space-y-4">
          {/* Result Alert */}
          {restoreResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                restoreResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {restoreResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold text-sm">{restoreResult.message}</div>
                {restoreResult.counts && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                      Customers: <strong>{restoreResult.counts.customers}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                      Products: <strong>{restoreResult.counts.products}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                      Sales: <strong>{restoreResult.counts.sales}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                      Purchases: <strong>{restoreResult.counts.purchases}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-orange-600" />
                <span>Upload Database Backup (.JSON)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Restore your database from an existing <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.json</code> snapshot file.
              </p>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => jsonFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-orange-50/30"
            >
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleJSONFileSelect(file);
                }}
              />
              <FileUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                {jsonFileName ? `Selected: ${jsonFileName}` : 'Click to select or drag and drop a .json backup file'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Supported formats: JSON snapshots created from LPG Manager BD
              </div>
            </div>

            {/* Error Message */}
            {jsonError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            {/* Live Inspection Card */}
            {jsonInspectData && (
              <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-xs text-orange-900">Valid Backup Snapshot Detected</span>
                  </div>
                  <span className="text-[11px] font-mono text-orange-800">
                    Exported: {new Date(jsonInspectData.exportedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-orange-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Party Name</div>
                    <div className="font-bold text-slate-800 truncate">{jsonInspectData.businessName}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-orange-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Customers</div>
                    <div className="font-black text-slate-900">{jsonInspectData.customersCount}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-orange-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Cylinder SKUs</div>
                    <div className="font-black text-slate-900">{jsonInspectData.productsCount}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-orange-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Sales Invoices</div>
                    <div className="font-black text-slate-900">{jsonInspectData.salesCount}</div>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="pt-2 border-t border-orange-100">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Choose Restoration Mode:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label
                      className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                        restoreMode === 'replace'
                          ? 'border-orange-500 bg-white shadow-xs ring-1 ring-orange-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === 'replace'}
                        onChange={() => setRestoreMode('replace')}
                        className="mt-0.5 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <strong className="block text-slate-900 font-bold">Full System Replace (Clean)</strong>
                        <span className="text-[11px] text-slate-500">
                          Completely overwrites the current database with this backup snapshot.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                        restoreMode === 'merge'
                          ? 'border-orange-500 bg-white shadow-xs ring-1 ring-orange-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === 'merge'}
                        onChange={() => setRestoreMode('merge')}
                        className="mt-0.5 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <strong className="block text-slate-900 font-bold">Smart Merge (Keep Current)</strong>
                        <span className="text-[11px] text-slate-500">
                          Updates matching customers & products, appends new sales and purchases.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Commit Button */}
                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Proceed with Restore</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* OPTION 2: BULK IMPORT CUSTOMERS VIA CSV */}
      {/* ============================================================ */}
      {activeImportType === 'csv-customers' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Bulk Import Customers from CSV</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly onboard dealers, retail shops, and commercial customers with opening balances.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const template = getCustomerCSVTemplate();
                downloadCSV('customers-import-template.csv', template);
              }}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Success Banner */}
          {csvImportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{csvImportSuccess}</span>
            </div>
          )}

          {/* CSV File Input */}
          <div
            onClick={() => csvFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-blue-50/30"
          >
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCSVFileSelect(file);
              }}
            />
            <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-800">
              {csvFile ? `Selected: ${csvFile.name}` : 'Click to select or drag and drop a Customers .csv file'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Required columns: Business / Shop Name, Phone Number
            </div>
          </div>

          {/* Customer Parse Preview */}
          {parsedCustomerResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Found <strong className="text-blue-600">{parsedCustomerResult.valid.length}</strong> valid customer rows
                </span>
                {parsedCustomerResult.errors.length > 0 && (
                  <span className="text-rose-600 font-semibold text-[11px]">
                    {parsedCustomerResult.errors.length} rows had errors and were skipped
                  </span>
                )}
              </div>

              {parsedCustomerResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] max-h-28 overflow-y-auto space-y-1">
                  {parsedCustomerResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Code</th>
                      <th className="p-2">Business Name</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Area</th>
                      <th className="p-2">Customer Type</th>
                      <th className="p-2 text-right">Opening Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedCustomerResult.valid.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono">{row.code}</td>
                        <td className="p-2 font-semibold text-slate-800">{row.businessName}</td>
                        <td className="p-2 font-mono">{row.phone}</td>
                        <td className="p-2">{row.area}</td>
                        <td className="p-2 capitalize">{row.customerType?.replace('_', ' ')}</td>
                        <td className="p-2 text-right font-bold text-slate-900">৳{row.openingBalance || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedCustomerResult.valid.length > 5 && (
                <div className="text-[11px] text-slate-400 text-center">
                  ...and {parsedCustomerResult.valid.length - 5} more customers will be imported
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleExecuteCustomerImport}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Import {parsedCustomerResult.valid.length} Customers</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* OPTION 3: BULK IMPORT PRODUCTS VIA CSV */}
      {/* ============================================================ */}
      {activeImportType === 'csv-products' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Bulk Import Cylinder Products from CSV</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk add or update cylinder brands, sizes (12KG/35KG/45KG), rates, and opening godown stocks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const template = getProductCSVTemplate();
                downloadCSV('cylinder-products-template.csv', template);
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Success Banner */}
          {csvImportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{csvImportSuccess}</span>
            </div>
          )}

          {/* CSV File Input */}
          <div
            onClick={() => csvFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-emerald-50/30"
          >
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCSVFileSelect(file);
              }}
            />
            <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-800">
              {csvFile ? `Selected: ${csvFile.name}` : 'Click to select or drag and drop a Products .csv file'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Required columns: SKU, Brand (Bashundhara, Omera, Jamuna, etc.), Size, Selling Price
            </div>
          </div>

          {/* Product Parse Preview */}
          {parsedProductResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Found <strong className="text-emerald-600">{parsedProductResult.valid.length}</strong> valid product rows
                </span>
                {parsedProductResult.errors.length > 0 && (
                  <span className="text-rose-600 font-semibold text-[11px]">
                    {parsedProductResult.errors.length} rows had errors
                  </span>
                )}
              </div>

              {parsedProductResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] max-h-28 overflow-y-auto space-y-1">
                  {parsedProductResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Brand</th>
                      <th className="p-2">Size</th>
                      <th className="p-2 text-right">Full Stock</th>
                      <th className="p-2 text-right">Empty Stock</th>
                      <th className="p-2 text-right">Selling Rate</th>
                      <th className="p-2 text-right">Purchase Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedProductResult.valid.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold">{row.sku}</td>
                        <td className="p-2 font-semibold text-slate-800">{row.brand}</td>
                        <td className="p-2">{row.size}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">{row.fullStock || 0}</td>
                        <td className="p-2 text-right font-bold text-amber-700">{row.emptyStock || 0}</td>
                        <td className="p-2 text-right font-bold text-slate-900">৳{row.sellingPrice || 0}</td>
                        <td className="p-2 text-right text-slate-600">৳{row.purchasePrice || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedProductResult.valid.length > 5 && (
                <div className="text-[11px] text-slate-400 text-center">
                  ...and {parsedProductResult.valid.length - 5} more cylinder products will be imported
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleExecuteProductImport}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>Import {parsedProductResult.valid.length} Products</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Safety Modal for Full JSON Restore */}
      {isConfirmModalOpen && jsonInspectData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Database Restore</h3>
                <p className="text-xs text-slate-500">Please review before executing</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs space-y-1">
              {restoreMode === 'replace' ? (
                <>
                  <p className="font-bold">⚠️ Full System Replace is active:</p>
                  <p>
                    All current records will be replaced with the records in this backup file.
                    Make sure you have exported a recent backup if you need to keep current entries.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold">ℹ️ Smart Merge is active:</p>
                  <p>
                    Existing master customers & products will be updated with this snapshot, and missing records will be added.
                  </p>
                </>
              )}
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-slate-700">
              <div>Party: <strong>{jsonInspectData.businessName}</strong></div>
              <div>Records to load: <strong>{jsonInspectData.customersCount} Customers, {jsonInspectData.productsCount} Products, {jsonInspectData.salesCount} Sales</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteRestore}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yes, Execute Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
