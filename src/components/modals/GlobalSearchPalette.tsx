import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, FileText, User, Building2, Flame, ArrowDownLeft } from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const GlobalSearchPalette: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    sales,
    customers,
    suppliers,
    products,
    moneyReceipts,
    setActiveView,
    setPrintSale,
    setSelectedCustomerForDetails,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedSales = trimmed ? sales.filter(
    s => (s.invoiceNo || '').toLowerCase().includes(trimmed) || (s.customerName || '').toLowerCase().includes(trimmed)
  ).slice(0, 5) : [];

  const matchedCustomers = trimmed ? customers.filter(
    c => (c.businessName || '').toLowerCase().includes(trimmed) || (c.phone || '').includes(trimmed) || (c.area || '').toLowerCase().includes(trimmed)
  ).slice(0, 5) : [];

  const matchedSuppliers = trimmed ? suppliers.filter(
    s => (s.companyName || '').toLowerCase().includes(trimmed) || (s.phone || '').includes(trimmed)
  ).slice(0, 3) : [];

  const matchedProducts = trimmed ? products.filter(
    p => (p.brand || '').toLowerCase().includes(trimmed) || (p.size || '').toLowerCase().includes(trimmed) || (p.sku || '').toLowerCase().includes(trimmed)
  ).slice(0, 4) : [];

  const matchedReceipts = trimmed ? moneyReceipts.filter(
    r => (r.receiptNo || '').toLowerCase().includes(trimmed) || (r.customerName || '').toLowerCase().includes(trimmed)
  ).slice(0, 4) : [];

  const hasMatches =
    matchedSales.length > 0 ||
    matchedCustomers.length > 0 ||
    matchedSuppliers.length > 0 ||
    matchedProducts.length > 0 ||
    matchedReceipts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search invoice (INV-...), customer name, phone, supplier, cylinder..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={() => setIsSearchOpen(false)}
            className="cursor-pointer px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded"
          >
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 text-xs divide-y divide-slate-100">
          {!trimmed && (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Flame className="w-8 h-8 text-orange-400 mx-auto opacity-70" />
              <p className="font-semibold text-slate-600">LPG Master Quick Search</p>
              <p className="text-[11px]">Type an invoice number (e.g. 124), customer name (e.g. Nayeem), or brand (Bashundhara)</p>
            </div>
          )}

          {trimmed && !hasMatches && (
            <div className="p-8 text-center text-slate-400">
              <p className="font-semibold">No results found for "{query}"</p>
              <p className="text-[11px] mt-1">Try searching with a customer name, phone number, or invoice ID.</p>
            </div>
          )}

          {/* Invoices */}
          {matchedSales.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sales Invoices ({matchedSales.length})
              </div>
              {matchedSales.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setPrintSale(s);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 hover:bg-orange-50 rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-orange-900">{s.invoiceNo}</div>
                      <div className="text-[11px] text-slate-500">{s.customerName} · {s.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatBDT(s.grandTotal)}</div>
                    <div className="text-[10px] text-slate-500">{s.totalFullQty} full / {s.totalEmptyReceived} empty</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customers */}
          {matchedCustomers.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Customers / Dealers ({matchedCustomers.length})
              </div>
              {matchedCustomers.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomerForDetails(c);
                    setActiveView('customer_list');
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 hover:bg-purple-50 rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-purple-950">{c.businessName}</div>
                      <div className="text-[11px] text-slate-500">{c.contactPerson} · {c.phone} ({c.area})</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-600">Due: {formatBDT(c.currentDue)}</div>
                    <div className="text-[10px] text-slate-400">{c.customerType}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cylinders */}
          {matchedProducts.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cylinder Stock ({matchedProducts.length})
              </div>
              {matchedProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveView('inventory_stock');
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 hover:bg-emerald-50 rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">{p.brand} - {p.size}</div>
                      <div className="text-[11px] text-slate-500">SKU: {p.sku} · Price: {formatBDT(p.sellingPrice)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{p.fullStock} Full / {p.emptyStock} Empty</div>
                    <div className="text-[10px] text-amber-600">{p.customerHeldStock} held by customers</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suppliers */}
          {matchedSuppliers.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Suppliers ({matchedSuppliers.length})
              </div>
              {matchedSuppliers.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveView('supplier_list');
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-800">{s.companyName}</div>
                      <div className="text-[11px] text-slate-500">{s.contactPerson} · {s.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-600">Payable: {formatBDT(s.currentPayable)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Money Receipts */}
          {matchedReceipts.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Money Receipts ({matchedReceipts.length})
              </div>
              {matchedReceipts.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setActiveView('accounts_cashbook');
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">{r.receiptNo}</div>
                      <div className="text-[11px] text-slate-500">{r.customerName} · {r.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{formatBDT(r.amount)}</div>
                    <div className="text-[10px] text-slate-400">{r.paymentMethod} ({r.account})</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
