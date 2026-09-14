import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { GlobalSearchPalette } from './components/modals/GlobalSearchPalette';
import { CylinderAdjustmentModal } from './components/inventory/CylinderAdjustmentModal';
import { ReceiveEmptyModal } from './components/inventory/ReceiveEmptyModal';
import { PrintInvoiceModal } from './components/modals/PrintInvoiceModal';
import { PrintChallanModal } from './components/modals/PrintChallanModal';
import { PrintMoneyReceiptModal } from './components/modals/PrintMoneyReceiptModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { NewSaleView } from './components/sales/NewSaleView';
import { SalesListView } from './components/sales/SalesListView';
import { ChallanListView } from './components/sales/ChallanListView';
import { SaleReturnsView } from './components/sales/SaleReturnsView';
import { NewPurchaseView } from './components/purchases/NewPurchaseView';
import { PurchaseListView } from './components/purchases/PurchaseListView';
import { CurrentStockView } from './components/inventory/CurrentStockView';
import { StockMovementsView } from './components/inventory/StockMovementsView';
import { DamagedLostView } from './components/inventory/DamagedLostView';
import { CustomerListView } from './components/customers/CustomerListView';
import { CustomerCylinderDueView } from './components/customers/CustomerCylinderDueView';
import { CustomerLedgerView } from './components/customers/CustomerLedgerView';
import { SupplierListView } from './components/suppliers/SupplierListView';
import { SupplierLedgerView } from './components/suppliers/SupplierLedgerView';
import { CashbookView } from './components/accounts/CashbookView';
import { ReceivePaymentView } from './components/accounts/ReceivePaymentView';
import { MakePaymentView } from './components/accounts/MakePaymentView';
import { ExpensesView } from './components/accounts/ExpensesView';
import { AccountsSummaryView } from './components/accounts/AccountsSummaryView';
import { DailyReportView } from './components/reports/DailyReportView';
import { CylinderAuditView } from './components/reports/CylinderAuditView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';

const MainContent: React.FC = () => {
  const { activeView } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'sales_pos':
      case 'sales_new':
        return <NewSaleView />;
      case 'sales_list':
        return <SalesListView />;
      case 'sales_challans':
        return <ChallanListView />;
      case 'sales_returns':
        return <SaleReturnsView />;
      case 'purchase_new':
        return <NewPurchaseView />;
      case 'purchase_list':
        return <PurchaseListView />;
      case 'inventory_stock':
        return <CurrentStockView />;
      case 'inventory_movements':
        return <StockMovementsView />;
      case 'inventory_damaged':
        return <DamagedLostView />;
      case 'customer_list':
        return <CustomerListView />;
      case 'customer_cylinder_due':
        return <CustomerCylinderDueView />;
      case 'customer_ledger':
        return <CustomerLedgerView />;
      case 'supplier_list':
        return <SupplierListView />;
      case 'supplier_ledger':
        return <SupplierLedgerView />;
      case 'accounts_cashbook':
        return <CashbookView />;
      case 'accounts_receive':
        return <ReceivePaymentView />;
      case 'accounts_pay':
        return <MakePaymentView />;
      case 'accounts_expenses':
        return <ExpensesView />;
      case 'accounts_summary':
        return <AccountsSummaryView />;
      case 'report_daily':
        return <DailyReportView />;
      case 'report_cylinder_audit':
        return <CylinderAuditView />;
      case 'settings':
        return <SettingsView />;
      case 'audit_logs':
        return <AuditLogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Desktop ERP Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top bar with quick stats, search trigger, and notifications */}
        <TopBar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          setMobileOpen={setMobileOpen}
        />

        {/* Dynamic View Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 pb-12">
          {renderView()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchPalette />
      <CylinderAdjustmentModal />
      <ReceiveEmptyModal />
      <PrintInvoiceModal />
      <PrintChallanModal />
      <PrintMoneyReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
