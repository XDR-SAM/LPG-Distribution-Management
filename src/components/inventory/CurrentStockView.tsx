import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockStatusBadge } from '../common/Badge';
import { formatBDT, formatNumber } from '../../utils/formatters';
import { Product } from '../../types';
import { RoleGate } from '../common/RoleGate';
import {
  Boxes,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Printer,
  Search,
  Flame,
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  Edit,
  X
} from 'lucide-react';

export const CurrentStockView: React.FC = () => {
  const {
    products,
    updateProduct,
    setIsAdjustStockModalOpen,
    setIsReceiveEmptyModalOpen,
    t,
    language,
    formatCurrency,
    formatQty,
    toBnNum,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Totals
  const totalFull = products.reduce((sum, p) => sum + p.fullStock, 0);
  const totalEmpty = products.reduce((sum, p) => sum + p.emptyStock, 0);
  const totalCustomerHeld = products.reduce((sum, p) => sum + p.customerHeldStock, 0);
  const totalSupplierHeld = products.reduce((sum, p) => sum + p.supplierHeldStock, 0);
  const totalDamaged = products.reduce((sum, p) => sum + p.damagedStock, 0);
  const totalAllCylinders = products.reduce((sum, p) => sum + p.totalCylinders, 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.fullStock * p.purchasePrice), 0);

  const brands = Array.from(new Set(products.map(p => p.brand)));

  const term = (searchTerm || '').toLowerCase();
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      (p.brand || '').toLowerCase().includes(term) ||
      (p.size || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term);
    const matchesBrand = brandFilter === 'ALL' || p.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const pcsUnit = language === 'bn' ? 'টি' : 'pcs';

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('stock.matrix_title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('stock.matrix_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <RoleGate action="adjust_stock">
            <button
              onClick={() => setIsAdjustStockModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('lpg.stock_adjust')}</span>
            </button>
          </RoleGate>

          <RoleGate action="receive_empty">
            <button
              onClick={() => setIsReceiveEmptyModalOpen(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('lpg.receive_empty')}</span>
            </button>
          </RoleGate>
        </div>
      </div>

      {/* 6 High-Level Inventory Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[11px] font-semibold">{t('lpg.total_cylinders')}</span>
          <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{formatQty(totalAllCylinders)} {pcsUnit}</span>
          <span className="text-[10px] text-slate-400">{t('stock.all_company_assets')}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-orange-200 bg-orange-50/20 shadow-2xs">
          <span className="text-orange-700 block text-[11px] font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-600" /> {t('stock.full_godown')}
          </span>
          <span className="text-lg font-extrabold text-orange-600 mt-0.5 block">{formatQty(totalFull)} {pcsUnit}</span>
          <span className="text-[10px] text-slate-500">{t('stock.ready_for_sale')}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-600 block text-[11px] font-semibold flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> {t('stock.empty_godown')}
          </span>
          <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{formatQty(totalEmpty)} {pcsUnit}</span>
          <span className="text-[10px] text-slate-400">{t('stock.for_refilling')}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-purple-200 bg-purple-50/20 shadow-2xs">
          <span className="text-purple-800 block text-[11px] font-bold">{t('stock.cust_held')}</span>
          <span className="text-lg font-extrabold text-purple-700 mt-0.5 block">{formatQty(totalCustomerHeld)} {pcsUnit}</span>
          <span className="text-[10px] text-purple-600">{t('stock.receivable_dues')}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-blue-800 block text-[11px] font-bold">{t('stock.with_suppliers')}</span>
          <span className="text-lg font-extrabold text-blue-700 mt-0.5 block">{formatQty(totalSupplierHeld)} {pcsUnit}</span>
          <span className="text-[10px] text-blue-600">{t('stock.at_depots')}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-rose-800 block text-[11px] font-bold flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> {t('stock.damaged_lost')}
          </span>
          <span className="text-lg font-extrabold text-rose-700 mt-0.5 block">{formatQty(totalDamaged)} {pcsUnit}</span>
          <span className="text-[10px] text-rose-500">{t('stock.requires_repair')}</span>
        </div>
      </div>

      {/* Search & Brand Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'ব্র্যান্ড, সাইজ (১২ কেজি, ৩৫ কেজি), কোড দিয়ে খুঁজুন...' : 'Search product by brand, size (12 KG, 35 KG), SKU...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900 text-xs"
            />
          </div>

          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700"
          >
            <option value="ALL">{language === 'bn' ? `সকল ব্র্যান্ড (${formatQty(brands.length)})` : `All Brands (${brands.length})`}</option>
            {brands.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-600 font-bold">
          {t('stock.valuation')}: <span className="text-emerald-700">{formatCurrency(totalStockValue)}</span>
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">{t('stock.brand_spec')}</th>
                <th className="px-2 py-2.5">{t('stock.sku_code')}</th>
                <th className="px-2 py-2.5 text-center bg-orange-50/70 text-orange-950 font-black">{t('stock.full_godown')}</th>
                <th className="px-2 py-2.5 text-center bg-slate-100 font-bold">{t('stock.empty_godown')}</th>
                <th className="px-2 py-2.5 text-center text-purple-900">{t('stock.cust_held')}</th>
                <th className="px-2 py-2.5 text-center text-blue-900">{t('stock.depot_held')}</th>
                <th className="px-2 py-2.5 text-center text-rose-700">{t('stock.damaged')}</th>
                <th className="px-2 py-2.5 text-center font-black">{t('stock.total_pcs')}</th>
                <th className="px-2 py-2.5 text-right">{t('stock.cost_rate')}</th>
                <th className="px-2 py-2.5 text-right">{t('stock.dealer_rate')}</th>
                <th className="px-2 py-2.5 text-right">{t('stock.retail_rate')}</th>
                <th className="px-2 py-2.5 text-right">{t('stock.full_value')}</th>
                <th className="px-3 py-2.5">{t('common.status')}</th>
                <th className="px-2 py-2.5 text-right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const itemFullValue = p.fullStock * p.purchasePrice;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900">{p.brand}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{language === 'bn' ? toBnNum(p.size) : p.size} ({p.category})</div>
                    </td>

                    <td className="px-2 py-2.5 font-mono text-[11px] text-slate-500">
                      {p.sku}
                    </td>

                    <td className="px-2 py-2.5 text-center font-black text-orange-600 bg-orange-50/30 text-sm">
                      {formatQty(p.fullStock)}
                    </td>

                    <td className="px-2 py-2.5 text-center font-bold text-slate-800 text-sm">
                      {formatQty(p.emptyStock)}
                    </td>

                    <td className="px-2 py-2.5 text-center font-bold text-purple-700">
                      {formatQty(p.customerHeldStock)}
                    </td>

                    <td className="px-2 py-2.5 text-center font-bold text-blue-700">
                      {formatQty(p.supplierHeldStock)}
                    </td>

                    <td className="px-2 py-2.5 text-center font-bold text-rose-600">
                      {formatQty(p.damagedStock)}
                    </td>

                    <td className="px-2 py-2.5 text-center font-black text-slate-900">
                      {formatQty(p.totalCylinders)}
                    </td>

                    <td className="px-2 py-2.5 text-right font-medium text-slate-600">
                      {formatCurrency(p.purchasePrice)}
                    </td>

                    <td className="px-2 py-2.5 text-right font-bold text-slate-800">
                      {formatCurrency(p.dealerPrice)}
                    </td>

                    <td className="px-2 py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>

                    <td className="px-2 py-2.5 text-right font-bold text-emerald-700">
                      {formatCurrency(itemFullValue)}
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <StockStatusBadge current={p.fullStock} min={p.minStockLevel} />
                    </td>

                    <td className="px-2 py-2.5 text-right">
                      <RoleGate action="edit_product">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          title={t('stock.edit_prices')}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </RoleGate>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Prices Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('stock.edit_prices')} - {editingProduct.brand} {editingProduct.size}
                </h3>
                <p className="text-slate-500">
                  {language === 'bn'
                    ? 'ক্রয় দর, পাইকারি দর এবং খুচরা বিক্রয় মূল্য কনফিগার করুন'
                    : 'Configure cost price, wholesale rate, and retail selling rate'}
                </p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'ক্রয় / খরচ দর (৳)' : 'Cost / Purchase Price (৳)'}
                </label>
                <input
                  type="number"
                  value={editingProduct.purchasePrice}
                  onChange={e => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'ডিলার / পাইকারি দর (৳)' : 'Dealer / Wholesale Price (৳)'}
                </label>
                <input
                  type="number"
                  value={editingProduct.dealerPrice}
                  onChange={e => setEditingProduct({ ...editingProduct, dealerPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'খুচরা বিক্রয় দর (৳)' : 'Retail Selling Price (৳)'}
                </label>
                <input
                  type="number"
                  value={editingProduct.sellingPrice}
                  onChange={e => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'সর্বনিম্ন মজুদ সতর্কতা (পিস)' : 'Low Stock Warning Threshold (Units)'}
                </label>
                <input
                  type="number"
                  value={editingProduct.minStockLevel}
                  onChange={e => setEditingProduct({ ...editingProduct, minStockLevel: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold"
                >
                  {t('stock.update_product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
