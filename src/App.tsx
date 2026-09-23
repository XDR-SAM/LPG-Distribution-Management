import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { GlobalSearchPalette } from './components/modals/GlobalSearchPalette';
import { CylinderAdjustmentModal } from './components/inventory/CylinderAdjustmentModal';
import { ReceiveEmptyModal } from './components/inventory/ReceiveEmptyModal';
import { PrintInvoiceModal } from './components/modals/PrintInvoiceModal';
import { PrintChallanModal } from './components/modals/PrintChallanModal';
import { PrintMoneyReceiptModal } from './components/modals/PrintMoneyReceiptModal';

// RBAC & Supabase views
import { UsersRolesView } from './components/settings/UsersRolesView';
import { SupabaseSyncView } from './components/settings/SupabaseSyncView';
import { RestrictedView } from './components/common/RestrictedView';
import { canAccessView } from './utils/rbac';

// Standard Views
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
import { LoginView } from './components/auth/LoginView';
import { AIAgentChatView } from './components/ai/AIAgentChatView';
import { FloatingAIAssistant } from './components/ai/FloatingAIAssistant';

const MainContent: React.FC = () => {
  const { activeView, currentUser } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Protected Route Check: Show LoginView if unauthenticated
  if (!currentUser) {
    return <LoginView />;
  }

  const currentRole = currentUser?.role || 'admin';


  const renderView = () => {
    // 1. RBAC Check: Ensure role is permitted to access activeView
    if (activeView !== 'dashboard' && !canAccessView(currentRole, activeView)) {
      return <RestrictedView viewName={activeView} />;
    }

    // 2. Render target view
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'sales_pos':
      case 'sales_new':
        return <NewSaleView />;
      case 'sales_list':
        return <SalesListView />;
      case 'sales_challan':
      case 'sales_challans':
      case 'delivery_list':
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
      case 'reports_center':
        return <DailyReportView />;
      case 'report_cylinder_audit':
        return <CylinderAuditView />;
      case 'ai_agent':
        return <AIAgentChatView />;
      case 'settings':
        return <SettingsView />;
      case 'audit_log':
      case 'audit_logs':
        return <AuditLogsView />;
      case 'users_roles':
        return <UsersRolesView />;
      case 'supabase_sync':
        return <SupabaseSyncView />;
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
        {/* Top bar with quick stats, search trigger, notifications, and RBAC switcher */}
        <TopBar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          setMobileOpen={setMobileOpen}
        />

        {/* Dynamic View Scroll Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-16 sm:pb-12">
          {renderView()}
        </main>
      </div>

      {/* Global Modals & Floating Assistant */}
      <FloatingAIAssistant />
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
    <LanguageProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </LanguageProvider>
  );
}
