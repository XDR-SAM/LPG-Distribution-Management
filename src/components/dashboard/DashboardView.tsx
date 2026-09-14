import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { PaymentStatusBadge, CylinderDueBadge } from '../common/Badge';
import { formatBDT, formatNumber } from '../../utils/formatters';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Package,
  RotateCcw,
  Users,
  Receipt,
  Plus,
  ArrowDownLeft,
  Flame,
  ShoppingBag,
  Truck,
  Printer,
  ChevronRight,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    settings,
    products,
    customers,
    suppliers,
    sales,
    expenses,
    transactions,
    setActiveView,
    setPrintSale,
    setIsReceiveEmptyModalOpen,
    setIsAdjustStockModalOpen,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'This Week' | 'This Month'>('Today');

  // Compute live aggregates based on current data
  const totalFullCylinders = products.reduce((sum, p) => sum + p.fullStock, 0);
  const totalEmptyCylinders = products.reduce((sum, p) => sum + p.emptyStock, 0);
  const totalCustomerHeld = products.reduce((sum, p) => sum + p.customerHeldStock, 0);
  const totalCustomerDue = customers.reduce((sum, c) => sum + c.currentDue, 0);
  const totalSupplierPayable = suppliers.reduce((sum, s) => sum + s.currentPayable, 0);

  // Today's sales (from sales dated 2026-09-14)
  const todaySales = sales
    .filter(s => s.date === '2026-09-14' && s.status !== 'cancelled')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  // Today's collection
  const todayCollection = transactions
    .filter(t => t.date === '2026-09-14' && t.type === 'PAYMENT_RECEIVED')
    .reduce((sum, t) => sum + t.debit, 0);

  // Today's expenses
  const todayExpenses = expenses
    .filter(e => e.date === '2026-09-14')
    .reduce((sum, e) => sum + e.amount, 0);

  // 7-day Sales Overview Chart Data
  const salesChartData = [
    { date: '08 Sep', sales: 64200, collection: 52000 },
    { date: '09 Sep', sales: 71500, collection: 61000 },
    { date: '10 Sep', sales: 58900, collection: 48000 },
    { date: '11 Sep', sales: 82400, collection: 70000 },
    { date: '12 Sep', sales: 94100, collection: 79000 },
    { date: '13 Sep', sales: 76800, collection: 65000 },
    { date: '14 Sep (Today)', sales: todaySales || 86450, collection: todayCollection || 64500 },
  ];

  // Cash vs Due Chart Data
  const collectionVsDueData = [
    { category: 'Dealers', collected: 185000, due: 138250 },
    { category: 'Retailers', collected: 94000, due: 65600 },
    { category: 'Restaurants', collected: 72000, due: 47000 },
    { category: 'Commercial', collected: 110000, due: 68000 },
    { category: 'Hotels', collected: 45000, due: 24000 },
  ];

  // Cylinder Stock by Brand Donut Data
  const brandStockData = [
    { name: 'Bashundhara', full: 99, empty: 41, color: '#dc2626' },
    { name: 'Omera', full: 90, empty: 53, color: '#ea580c' },
    { name: 'Jamuna', full: 61, empty: 28, color: '#0284c7' },
    { name: 'Beximco', full: 95, empty: 36, color: '#16a34a' },
    { name: 'Navana', full: 81, empty: 30, color: '#7c3aed' },
  ];

  // Brand summary items
  const brandSummaryItems = [
    { brand: 'Bashundhara LP Gas', size: '12 KG', full: 85, empty: 32, due: 18, color: 'text-rose-600' },
    { brand: 'Omera LPG', size: '12 KG', full: 72, empty: 41, due: 13, color: 'text-orange-600' },
    { brand: 'Jamuna Gas', size: '12 KG', full: 61, empty: 28, due: 21, color: 'text-blue-600' },
    { brand: 'Beximco LPG', size: '12 KG', full: 95, empty: 36, due: 17, color: 'text-emerald-600' },
    { brand: 'Navana LPG', size: '12 KG', full: 81, empty: 30, due: 15, color: 'text-purple-600' },
    { brand: 'Bashundhara LP Gas', size: '35 KG', full: 14, empty: 9, due: 5, color: 'text-rose-700' },
  ];

  const recentSales = sales.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Good Evening, {settings.profile.businessName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Godown Operational
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is today's business overview · Mohammadpur, Dhaka · 14 Sep 2026
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 self-start md:self-auto text-xs">
          {(['Today', 'Yesterday', 'This Week', 'This Month'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setDateFilter(tab)}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                dateFilter === tab
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Today's Sales"
          value={formatBDT(todaySales || 86450)}
          subtitle="Total delivered orders"
          icon={TrendingUp}
          color="blue"
          trend={{ value: '+12.5%', isPositive: true }}
          onClick={() => setActiveView('sales_list')}
        />
        <StatCard
          title="Today's Collection"
          value={formatBDT(todayCollection || 64500)}
          subtitle="Cash, bKash, Bank in"
          icon={CreditCard}
          color="green"
          onClick={() => setActiveView('accounts_cashbook')}
        />
        <StatCard
          title="Customer Due"
          value={formatBDT(totalCustomerDue)}
          subtitle="10 customers balance"
          icon={AlertCircle}
          color="red"
          onClick={() => setActiveView('customer_list')}
        />
        <StatCard
          title="Supplier Payable"
          value={formatBDT(totalSupplierPayable)}
          subtitle="Due to 3 refineries"
          icon={Receipt}
          color="amber"
          onClick={() => setActiveView('supplier_list')}
        />
        <StatCard
          title="Full Cylinders"
          value={`${formatNumber(totalFullCylinders)} Units`}
          subtitle="Ready for distribution"
          icon={Flame}
          color="orange"
          badge="In Godown"
          onClick={() => setActiveView('inventory_stock')}
        />
        <StatCard
          title="Empty Cylinders"
          value={`${formatNumber(totalEmptyCylinders)} Units`}
          subtitle="Awaiting supplier dispatch"
          icon={RotateCcw}
          color="slate"
          badge="Stock"
          onClick={() => setActiveView('inventory_stock')}
        />
        <StatCard
          title="With Customers"
          value={`${formatNumber(totalCustomerHeld)} Units`}
          subtitle="7 dealers/shops holding"
          icon={Users}
          color="purple"
          badge="Holdings"
          onClick={() => setActiveView('customer_cylinder_due')}
        />
        <StatCard
          title="Today's Expenses"
          value={formatBDT(todayExpenses || 8750)}
          subtitle="Fuel, loading, wages"
          icon={Receipt}
          color="amber"
          onClick={() => setActiveView('accounts_expenses')}
        />
      </div>

      {/* Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-3 px-4 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">Frequent Actions</div>
            <div className="text-[11px] text-slate-400">One-click operations for sales & godown staff</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveView('sales_new')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Sale (POS)</span>
          </button>
          <button
            onClick={() => setActiveView('purchase_new')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>New Purchase</span>
          </button>
          <button
            onClick={() => setActiveView('accounts_receive')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Receive Payment</span>
          </button>
          <button
            onClick={() => setActiveView('accounts_expenses')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setIsReceiveEmptyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cylinder Return</span>
          </button>
          <button
            onClick={() => setActiveView('reports_center')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Daily Report</span>
          </button>
        </div>
      </div>

      {/* Main Charts & Stock Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">7-Day Sales & Collection Overview</h2>
              <p className="text-xs text-slate-500">Comparing gross revenue vs collected funds (৳)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded bg-orange-500"></span> Sales
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Collection
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={val => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatBDT(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="collection" name="Collection" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollection)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cylinder Stock by Brand (Donut) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Stock by Brand</h2>
              <button
                onClick={() => setActiveView('inventory_stock')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center"
              >
                View Stock <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Filled cylinders share by brand</p>
          </div>

          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandStockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="full"
                >
                  {brandStockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Full Cylinders`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{totalFullCylinders}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Full Pcs</span>
            </div>
          </div>

          {/* Legend Table */}
          <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
            {brandStockData.map(b => (
              <div key={b.name} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="font-medium text-slate-700">{b.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{b.full} Full</span>
                  <span className="text-slate-400 font-mono text-[11px]">{b.empty} Empty</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Summary Widget & Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Brand Stock Summary Widget */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Key Cylinder Size Stock Matrix
              </h2>
            </div>
            <button
              onClick={() => setIsAdjustStockModalOpen(true)}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300"
            >
              Manual Adjustment
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {brandSummaryItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-800 truncate">{item.brand}</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 bg-slate-200 text-slate-700 rounded font-bold">
                      {item.size}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Full:</span>
                      <span className="font-bold text-emerald-700">{item.full} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Empty:</span>
                      <span className="font-bold text-slate-700">{item.empty} Units</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 text-[11px]">Customer Due:</span>
                      <span className="font-bold text-amber-700">{item.due} Units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actionable Alerts Panel */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-3.5 bg-amber-500/10 border-b border-amber-200/60 flex items-center justify-between text-amber-950">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Priority Alerts (5)</span>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">Action Required</span>
          </div>

          <div className="p-3 space-y-2 text-xs flex-1 divide-y divide-slate-100">
            <div className="pt-1.5 first:pt-0">
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Low Stock: Bashundhara 35 KG
                </span>
                <span className="text-[10px] text-slate-400">Critical</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Only 14 filled units remaining in godown (Minimum threshold: 15 units).</p>
            </div>

            <div className="pt-1.5">
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> M/S Nayeem Traders Due
                </span>
                <span className="text-[10px] font-bold text-rose-600">৳ 42,500</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Dealer balance reached 42.5% of credit limit (৳1,00,000).</p>
            </div>

            <div className="pt-1.5">
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-purple-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span> 7 Customers Cylinder Overdue
                </span>
                <span className="text-[10px] font-bold text-purple-700">93 pcs</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Al-Madina Restaurant and Tasty Foods have empty returns due.</p>
            </div>

            <div className="pt-1.5">
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Supplier Payment Due
                </span>
                <span className="text-[10px] text-slate-500">Tomorrow</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Bashundhara LP Gas Central Depot due invoice payment is scheduled.</p>
            </div>

            <div className="pt-1.5">
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> 4 Damaged Cylinders
                </span>
                <span className="text-[10px] text-rose-600 font-bold">In Bay 5</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Requires safety inspection before sending on depot truck.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Recent Sales & Dispatch Transactions
            </h2>
            <p className="text-[11px] text-slate-500">Latest orders processed through the godown POS</p>
          </div>
          <button
            onClick={() => setActiveView('sales_list')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Sales ({sales.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Invoice No</th>
                <th className="px-3 py-2.5">Date & Time</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Cylinders (Full/Empty)</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Payment</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-slate-900">
                    {sale.invoiceNo}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sale.createdAt || sale.date}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-900">{sale.customerName}</div>
                    <div className="text-[11px] text-slate-400">{sale.customerType}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-800">
                      {sale.totalFullQty} full delivered
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {sale.totalEmptyReceived} empty collected
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-900">{formatBDT(sale.grandTotal)}</div>
                    {sale.currentDue > 0 && (
                      <div className="text-[10px] text-rose-600 font-semibold">
                        Due: {formatBDT(sale.grandTotal - sale.amountPaid)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">
                    {sale.paymentMethod}
                  </td>
                  <td className="px-3 py-2.5">
                    <PaymentStatusBadge status={sale.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setPrintSale(sale)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
