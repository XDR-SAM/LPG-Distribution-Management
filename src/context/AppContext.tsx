import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Brand, 
  CylinderProduct, 
  Customer, 
  Supplier, 
  Sale, 
  SaleItem,
  Purchase, 
  Expense, 
  FinancialTransaction, 
  StockMovement, 
  CustomerCylinderLedgerEntry, 
  SupplierCylinderLedgerEntry, 
  MoneyReceipt, 
  Vehicle, 
  Driver, 
  Delivery, 
  BERCPriceReference, 
  AuditLog, 
  AppSettings,
  AccountType,
  PaymentMethod
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_MONEY_RECEIPTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_CUSTOMER_CYLINDER_LEDGER,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_DELIVERIES,
  INITIAL_BERC_PRICES,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Data
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  users: User[];
  brands: Brand[];
  products: CylinderProduct[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  transactions: FinancialTransaction[];
  moneyReceipts: MoneyReceipt[];
  stockMovements: StockMovement[];
  customerCylinderLedger: CustomerCylinderLedgerEntry[];
  supplierCylinderLedger: SupplierCylinderLedgerEntry[];
  deliveries: Delivery[];
  vehicles: Vehicle[];
  drivers: Driver[];
  bercPrices: BERCPriceReference[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;

  // Selected for modals / views
  selectedCustomerForDetails: Customer | null;
  setSelectedCustomerForDetails: (c: Customer | null) => void;
  printSale: Sale | null;
  setPrintSale: (s: Sale | null) => void;
  printChallan: { sale?: Sale; delivery?: Delivery } | null;
  setPrintChallan: (c: { sale?: Sale; delivery?: Delivery } | null) => void;
  printReceipt: MoneyReceipt | null;
  setPrintReceipt: (r: MoneyReceipt | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAdjustStockModalOpen: boolean;
  setIsAdjustStockModalOpen: (open: boolean) => void;
  isReceiveEmptyModalOpen: boolean;
  setIsReceiveEmptyModalOpen: (open: boolean) => void;

  // Actions
  addSale: (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt' | 'status'> & { id?: string; invoiceNo?: string }) => Sale;
  cancelSale: (saleId: string, reason: string) => void;
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt' | 'status'> & { id?: string; purchaseNo?: string }) => Purchase;
  receivePayment: (data: { customerId: string; amount: number; paymentMethod: PaymentMethod; account: AccountType; notes?: string; transactionRef?: string; allocatedInvoiceId?: string }) => MoneyReceipt;
  makeSupplierPayment: (data: { supplierId: string; amount: number; paymentMethod: PaymentMethod; account: AccountType; notes?: string; transactionRef?: string }) => void;
  addExpense: (data: Omit<Expense, 'id' | 'voucherNo'>) => Expense;
  adjustStock: (productId: string, fullDelta: number, emptyDelta: number, damagedDelta: number, lostDelta: number, reason: string) => void;
  receiveEmptyCylinders: (customerId: string, productId: string, qty: number, condition: 'Good' | 'Damaged', notes?: string) => void;
  sendEmptyToSupplier: (supplierId: string, productId: string, qty: number, notes?: string) => void;
  addCustomer: (c: Omit<Customer, 'id' | 'code' | 'createdAt' | 'currentDue'>) => Customer;
  updateCustomer: (c: Customer) => void;
  addSupplier: (s: Omit<Supplier, 'id' | 'code' | 'currentPayable'>) => Supplier;
  updateSupplier: (s: Supplier) => void;
  addProduct: (p: Omit<CylinderProduct, 'id' | 'fullStock' | 'emptyStock' | 'damagedStock' | 'lostStock' | 'customerHeldStock' | 'supplierHeldStock'>) => CylinderProduct;
  updateProduct: (p: CylinderProduct) => void;
  addBERCPrice: (p: Omit<BERCPriceReference, 'id' | 'updatedAt'>) => void;
  updateDeliveryStatus: (deliveryId: string, status: Delivery['status']) => void;
  resetAllData: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'LPG_MANAGER_BD_STATE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or use mock
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Start logged in as Admin for instant demo access, or allow logout
  const [activeView, setActiveView] = useState<string>('dashboard');

  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [products, setProducts] = useState<CylinderProduct[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [moneyReceipts, setMoneyReceipts] = useState<MoneyReceipt[]>(INITIAL_MONEY_RECEIPTS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [customerCylinderLedger, setCustomerCylinderLedger] = useState<CustomerCylinderLedgerEntry[]>(INITIAL_CUSTOMER_CYLINDER_LEDGER);
  const [supplierCylinderLedger, setSupplierCylinderLedger] = useState<SupplierCylinderLedgerEntry[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [bercPrices, setBercPrices] = useState<BERCPriceReference[]>(INITIAL_BERC_PRICES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modal / UI states
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState<Customer | null>(null);
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const [printChallan, setPrintChallan] = useState<{ sale?: Sale; delivery?: Delivery } | null>(null);
  const [printReceipt, setPrintReceipt] = useState<MoneyReceipt | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isReceiveEmptyModalOpen, setIsReceiveEmptyModalOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Low Stock Alert',
      message: 'Bashundhara 35 KG stock is low (14 units remaining, min required: 15).',
      type: 'warning',
      timestamp: 'Today, 09:10 AM',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Credit Limit Notice',
      message: 'M/S Nayeem Traders has ৳42,500 due (credit limit: ৳1,00,000).',
      type: 'info',
      timestamp: 'Today, 08:30 AM',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Damaged Cylinders',
      message: '4 damaged cylinders require testing / supplier return attention.',
      type: 'danger',
      timestamp: 'Yesterday',
      read: false,
    },
    {
      id: 'notif-4',
      title: 'Cylinder Returns Pending',
      message: '7 customers have outstanding empty cylinder balances.',
      type: 'info',
      timestamp: 'Yesterday',
      read: true,
    }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.moneyReceipts) setMoneyReceipts(parsed.moneyReceipts);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        if (parsed.customerCylinderLedger) setCustomerCylinderLedger(parsed.customerCylinderLedger);
        if (parsed.deliveries) setDeliveries(parsed.deliveries);
        if (parsed.bercPrices) setBercPrices(parsed.bercPrices);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        settings,
        products,
        customers,
        suppliers,
        sales,
        purchases,
        expenses,
        transactions,
        moneyReceipts,
        stockMovements,
        customerCylinderLedger,
        deliveries,
        bercPrices,
        auditLogs,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
    isLoaded,
    settings,
    products,
    customers,
    suppliers,
    sales,
    purchases,
    expenses,
    transactions,
    moneyReceipts,
    stockMovements,
    customerCylinderLedger,
    deliveries,
    bercPrices,
    auditLogs,
  ]);

  // Authentication
  const login = (email: string, pass: string): boolean => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => (u.email || '').toLowerCase() === cleanEmail || (u.username || '').toLowerCase() === cleanEmail);
    if (user && pass === '123456') {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Log an audit entry
  const logAudit = (action: string, module: string, reference: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      user: currentUser ? currentUser.name : 'System',
      action,
      module,
      reference,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ADD SALE
  const addSale = (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt' | 'status'> & { id?: string; invoiceNo?: string }): Sale => {
    const nextSeq = sales.length + 125;
    const invoiceNo = saleData.invoiceNo || `INV-2026-${String(nextSeq).padStart(6, '0')}`;
    const saleId = saleData.id || `sale-${Date.now()}`;
    const now = new Date();
    const formattedNow = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    let status: Sale['status'] = 'due';
    if (saleData.amountPaid >= saleData.grandTotal) {
      status = 'paid';
    } else if (saleData.amountPaid > 0) {
      status = 'partial';
    }

    const newSale: Sale = {
      ...saleData,
      id: saleId,
      invoiceNo,
      status,
      createdAt: formattedNow,
    };

    // 1. Update Product Stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const item = saleData.items.find(i => i.productId === p.id);
        if (!item) return p;
        const netHeld = item.fullQty - item.emptyQtyReceived;
        return {
          ...p,
          fullStock: Math.max(0, p.fullStock - item.fullQty),
          emptyStock: p.emptyStock + item.emptyQtyReceived,
          customerHeldStock: p.customerHeldStock + netHeld,
        };
      });
    });

    // 2. Update Customer Financial Due & records
    setCustomers(prevCustomers => {
      return prevCustomers.map(c => {
        if (c.id !== saleData.customerId) return c;
        const unpaid = saleData.grandTotal - saleData.amountPaid;
        return {
          ...c,
          currentDue: c.currentDue + unpaid,
        };
      });
    });

    // 3. Add Stock Movements
    const newMovements: StockMovement[] = [];
    saleData.items.forEach(item => {
      if (item.fullQty > 0) {
        newMovements.push({
          id: `sm-${Date.now()}-${Math.random()}`,
          date: formattedNow,
          reference: invoiceNo,
          movementType: 'SALE_FULL_OUT',
          productId: item.productId,
          brand: item.brand,
          size: item.size,
          fullQty: -item.fullQty,
          emptyQty: 0,
          user: currentUser?.name || 'Sales Operator',
          notes: `Delivered to ${saleData.customerName}`,
        });
      }
      if (item.emptyQtyReceived > 0) {
        newMovements.push({
          id: `sm-${Date.now()}-${Math.random()}`,
          date: formattedNow,
          reference: invoiceNo,
          movementType: 'CUSTOMER_EMPTY_IN',
          productId: item.productId,
          brand: item.brand,
          size: item.size,
          fullQty: 0,
          emptyQty: item.emptyQtyReceived,
          user: currentUser?.name || 'Sales Operator',
          notes: `Empty cylinder exchange from ${saleData.customerName}`,
        });
      }
    });
    setStockMovements(prev => [...newMovements, ...prev]);

    // 4. Update Customer Cylinder Ledger
    const newCylinderEntries: CustomerCylinderLedgerEntry[] = saleData.items.map(item => ({
      id: `ccl-${Date.now()}-${Math.random()}`,
      date: saleData.date,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      reference: invoiceNo,
      productId: item.productId,
      brand: item.brand,
      size: item.size,
      fullDelivered: item.fullQty,
      emptyReturned: item.emptyQtyReceived,
      damaged: 0,
      balanceCylinders: item.fullQty - item.emptyQtyReceived,
      notes: `Invoice ${invoiceNo}: ${item.fullQty} full, ${item.emptyQtyReceived} empty returned`,
    }));
    setCustomerCylinderLedger(prev => [...newCylinderEntries, ...prev]);

    // 5. If amountPaid > 0, create MoneyReceipt and Financial Transaction
    if (saleData.amountPaid > 0) {
      const receiptNo = `MR-2026-${String(moneyReceipts.length + 129).padStart(6, '0')}`;
      const paymentAccount: AccountType = saleData.paymentMethod === 'bKash' ? 'bKash' :
        saleData.paymentMethod === 'Nagad' ? 'Nagad' :
        saleData.paymentMethod === 'Bank Transfer' ? 'Bank Account' : 'Cash in Hand';

      const newReceipt: MoneyReceipt = {
        id: `mr-${Date.now()}`,
        receiptNo,
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        date: saleData.date,
        amount: saleData.amountPaid,
        paymentMethod: saleData.paymentMethod,
        account: paymentAccount,
        notes: `Paid at time of sale ${invoiceNo}`,
        allocatedInvoices: [{ invoiceId: saleId, invoiceNo, allocatedAmount: saleData.amountPaid }],
      };
      setMoneyReceipts(prev => [newReceipt, ...prev]);

      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        date: saleData.date,
        voucherNo: receiptNo,
        description: `Payment collected against sale ${invoiceNo}`,
        account: paymentAccount,
        type: 'PAYMENT_RECEIVED',
        reference: invoiceNo,
        partyType: 'customer',
        partyId: saleData.customerId,
        partyName: saleData.customerName,
        debit: saleData.amountPaid,
        credit: 0,
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    // 6. Create Delivery Challan entry
    const deliveryNo = `DC-2026-${String(deliveries.length + 95).padStart(6, '0')}`;
    const newDelivery: Delivery = {
      id: `del-${Date.now()}`,
      deliveryNo,
      invoiceNo,
      saleId,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      area: saleData.customerAddress.includes('Mohammadpur') ? 'Mohammadpur' : 'Dhaka Metro',
      address: saleData.customerAddress,
      vehicleNo: 'Dhaka Metro-TA-11-1234',
      driverName: 'Rafiqul Islam',
      driverPhone: '01719-556677',
      totalQty: saleData.totalFullQty,
      emptyToCollect: saleData.totalEmptyReceived,
      amount: saleData.grandTotal,
      status: 'pending',
      deliveryDate: saleData.date,
      expenses: [],
    };
    setDeliveries(prev => [newDelivery, ...prev]);

    setSales(prev => [newSale, ...prev]);
    logAudit('CREATE_INVOICE', 'Sales', invoiceNo, `Created sale for ${saleData.customerName} - ৳${saleData.grandTotal.toLocaleString()} (${saleData.totalFullQty} full, ${saleData.totalEmptyReceived} empty)`);

    return newSale;
  };

  // CANCEL SALE
  const cancelSale = (saleId: string, reason: string) => {
    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale || targetSale.status === 'cancelled') return;

    // Reverse products stock
    setProducts(prev => {
      return prev.map(p => {
        const item = targetSale.items.find(i => i.productId === p.id);
        if (!item) return p;
        const netHeld = item.fullQty - item.emptyQtyReceived;
        return {
          ...p,
          fullStock: p.fullStock + item.fullQty,
          emptyStock: Math.max(0, p.emptyStock - item.emptyQtyReceived),
          customerHeldStock: Math.max(0, p.customerHeldStock - netHeld),
        };
      });
    });

    // Reverse customer financial due
    setCustomers(prev => {
      return prev.map(c => {
        if (c.id !== targetSale.customerId) return c;
        const unpaid = targetSale.grandTotal - targetSale.amountPaid;
        return {
          ...c,
          currentDue: Math.max(0, c.currentDue - unpaid),
        };
      });
    });

    // Mark sale as cancelled
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'cancelled', notes: `${s.notes || ''} [CANCELLED: ${reason}]` } : s));

    logAudit('CANCEL_INVOICE', 'Sales', targetSale.invoiceNo, `Cancelled invoice ${targetSale.invoiceNo}. Reason: ${reason}`);
  };

  // ADD PURCHASE
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt' | 'status'> & { id?: string; purchaseNo?: string }): Purchase => {
    const nextSeq = purchases.length + 79;
    const purchaseNo = purchaseData.purchaseNo || `PUR-2026-${String(nextSeq).padStart(6, '0')}`;
    const purchaseId = purchaseData.id || `pur-${Date.now()}`;
    const now = new Date();
    const formattedNow = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    let status: Purchase['status'] = 'due';
    if (purchaseData.paidAmount >= purchaseData.grandTotal) {
      status = 'paid';
    } else if (purchaseData.paidAmount > 0) {
      status = 'partial';
    }

    const newPurchase: Purchase = {
      ...purchaseData,
      id: purchaseId,
      purchaseNo,
      status,
      createdAt: formattedNow,
    };

    // Update Product Stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const item = purchaseData.items.find(i => i.productId === p.id);
        if (!item) return p;
        return {
          ...p,
          fullStock: p.fullStock + item.fullQtyReceived,
          emptyStock: Math.max(0, p.emptyStock - item.emptyQtySent),
          supplierHeldStock: p.supplierHeldStock + (item.fullQtyReceived - item.emptyQtySent),
        };
      });
    });

    // Update Supplier Payable
    setSuppliers(prev => {
      return prev.map(s => {
        if (s.id !== purchaseData.supplierId) return s;
        return {
          ...s,
          currentPayable: s.currentPayable + purchaseData.dueAmount,
        };
      });
    });

    // Stock Movements
    const newMovements: StockMovement[] = [];
    purchaseData.items.forEach(item => {
      if (item.fullQtyReceived > 0) {
        newMovements.push({
          id: `sm-${Date.now()}-${Math.random()}`,
          date: formattedNow,
          reference: purchaseNo,
          movementType: 'PURCHASE_FULL_IN',
          productId: item.productId,
          brand: item.brand,
          size: item.size,
          fullQty: item.fullQtyReceived,
          emptyQty: 0,
          user: currentUser?.name || 'Store Keeper',
          notes: `Received from ${purchaseData.supplierName}`,
        });
      }
      if (item.emptyQtySent > 0) {
        newMovements.push({
          id: `sm-${Date.now()}-${Math.random()}`,
          date: formattedNow,
          reference: purchaseNo,
          movementType: 'EMPTY_SENT_TO_SUPPLIER',
          productId: item.productId,
          brand: item.brand,
          size: item.size,
          fullQty: 0,
          emptyQty: -item.emptyQtySent,
          user: currentUser?.name || 'Store Keeper',
          notes: `Empties sent back to ${purchaseData.supplierName}`,
        });
      }
    });
    setStockMovements(prev => [...newMovements, ...prev]);

    // Financial Transaction if paid
    if (purchaseData.paidAmount > 0) {
      const paymentAccount: AccountType = purchaseData.paymentMethod === 'Bank Transfer' ? 'Bank Account' : 'Cash in Hand';
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        date: purchaseData.date,
        voucherNo: purchaseNo,
        description: `Payment to supplier ${purchaseData.supplierName} (Ref: ${purchaseData.supplierInvoiceRef})`,
        account: paymentAccount,
        type: 'PAYMENT_MADE',
        reference: purchaseNo,
        partyType: 'supplier',
        partyId: purchaseData.supplierId,
        partyName: purchaseData.supplierName,
        debit: 0,
        credit: purchaseData.paidAmount,
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    setPurchases(prev => [newPurchase, ...prev]);
    logAudit('CREATE_PURCHASE', 'Purchase', purchaseNo, `Recorded purchase from ${purchaseData.supplierName} - ৳${purchaseData.grandTotal.toLocaleString()} (${purchaseData.totalFullReceived} full in, ${purchaseData.totalEmptySent} empty out)`);

    return newPurchase;
  };

  // RECEIVE PAYMENT
  const receivePayment = (data: { 
    customerId: string; 
    amount: number; 
    paymentMethod: PaymentMethod; 
    account: AccountType; 
    notes?: string; 
    transactionRef?: string;
    allocatedInvoiceId?: string;
  }): MoneyReceipt => {
    const customer = customers.find(c => c.id === data.customerId);
    const receiptNo = `MR-2026-${String(moneyReceipts.length + 129).padStart(6, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newReceipt: MoneyReceipt = {
      id: `mr-${Date.now()}`,
      receiptNo,
      customerId: data.customerId,
      customerName: customer ? customer.businessName : 'Customer',
      date: today,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      account: data.account,
      notes: data.notes,
      transactionRef: data.transactionRef,
      allocatedInvoices: data.allocatedInvoiceId ? [{ invoiceId: data.allocatedInvoiceId, invoiceNo: '', allocatedAmount: data.amount }] : undefined,
    };

    // Update Customer Due
    setCustomers(prev => prev.map(c => c.id === data.customerId ? { ...c, currentDue: Math.max(0, c.currentDue - data.amount) } : c));

    // Update Financial Transaction
    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: today,
      voucherNo: receiptNo,
      description: `Money receipt from ${customer?.businessName || 'Customer'}`,
      account: data.account,
      type: 'PAYMENT_RECEIVED',
      reference: receiptNo,
      partyType: 'customer',
      partyId: data.customerId,
      partyName: customer?.businessName,
      debit: data.amount,
      credit: 0,
    };

    setMoneyReceipts(prev => [newReceipt, ...prev]);
    setTransactions(prev => [newTx, ...prev]);

    logAudit('RECEIVE_PAYMENT', 'Accounts', receiptNo, `Received ৳${data.amount.toLocaleString()} from ${customer?.businessName} via ${data.paymentMethod} into ${data.account}`);

    return newReceipt;
  };

  // MAKE SUPPLIER PAYMENT
  const makeSupplierPayment = (data: { 
    supplierId: string; 
    amount: number; 
    paymentMethod: PaymentMethod; 
    account: AccountType; 
    notes?: string; 
    transactionRef?: string;
  }) => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    const voucherNo = `PV-2026-${String(transactions.length + 50).padStart(6, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    setSuppliers(prev => prev.map(s => s.id === data.supplierId ? { ...s, currentPayable: Math.max(0, s.currentPayable - data.amount) } : s));

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: today,
      voucherNo,
      description: `Payment to supplier ${supplier?.companyName}`,
      account: data.account,
      type: 'PAYMENT_MADE',
      reference: voucherNo,
      partyType: 'supplier',
      partyId: data.supplierId,
      partyName: supplier?.companyName,
      debit: 0,
      credit: data.amount,
    };
    setTransactions(prev => [newTx, ...prev]);

    logAudit('SUPPLIER_PAYMENT', 'Accounts', voucherNo, `Paid ৳${data.amount.toLocaleString()} to ${supplier?.companyName} via ${data.paymentMethod}`);
  };

  // ADD EXPENSE
  const addExpense = (data: Omit<Expense, 'id' | 'voucherNo'>): Expense => {
    const voucherNo = `EXP-2026-${String(expenses.length + 33).padStart(5, '0')}`;
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      voucherNo,
    };

    // Financial transaction
    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: data.date,
      voucherNo,
      description: `${data.category}: ${data.description}`,
      account: data.paymentAccount,
      type: 'EXPENSE',
      reference: voucherNo,
      partyType: 'expense',
      debit: 0,
      credit: data.amount,
    };

    setExpenses(prev => [newExpense, ...prev]);
    setTransactions(prev => [newTx, ...prev]);

    logAudit('CREATE_EXPENSE', 'Accounts', voucherNo, `Added expense ${data.category} - ৳${data.amount.toLocaleString()} (${data.description})`);

    return newExpense;
  };

  // ADJUST STOCK (Physical correction, damaged, lost, recovered)
  const adjustStock = (productId: string, fullDelta: number, emptyDelta: number, damagedDelta: number, lostDelta: number, reason: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        fullStock: Math.max(0, p.fullStock + fullDelta),
        emptyStock: Math.max(0, p.emptyStock + emptyDelta),
        damagedStock: Math.max(0, p.damagedStock + damagedDelta),
        lostStock: Math.max(0, p.lostStock + lostDelta),
      };
    }));

    const adjRef = `ADJ-2026-${String(Date.now()).slice(-5)}`;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    let movementType: StockMovement['movementType'] = 'MANUAL_ADJUSTMENT';
    if (damagedDelta > 0) movementType = 'DAMAGED';
    else if (lostDelta > 0) movementType = 'LOST';
    else if (fullDelta > 0 && emptyDelta === 0) movementType = 'RECOVERED';

    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      date: now,
      reference: adjRef,
      movementType,
      productId: product.id,
      brand: product.brand,
      size: product.size,
      fullQty: fullDelta,
      emptyQty: emptyDelta,
      user: currentUser?.name || 'Store Keeper',
      notes: reason,
    };
    setStockMovements(prev => [newMovement, ...prev]);

    logAudit('STOCK_ADJUSTMENT', 'Inventory', adjRef, `Adjusted ${product.brand} ${product.size} (Full: ${fullDelta >= 0 ? '+' : ''}${fullDelta}, Empty: ${emptyDelta >= 0 ? '+' : ''}${emptyDelta}, Damaged: +${damagedDelta}, Lost: +${lostDelta}). Reason: ${reason}`);
  };

  // RECEIVE EMPTY CYLINDERS DIRECTLY FROM CUSTOMER
  const receiveEmptyCylinders = (customerId: string, productId: string, qty: number, condition: 'Good' | 'Damaged', notes?: string) => {
    const customer = customers.find(c => c.id === customerId);
    const product = products.find(p => p.id === productId);
    if (!customer || !product || qty <= 0) return;

    // Update Product: Empty stock increases, customer held decreases
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        emptyStock: condition === 'Good' ? p.emptyStock + qty : p.emptyStock,
        damagedStock: condition === 'Damaged' ? p.damagedStock + qty : p.damagedStock,
        customerHeldStock: Math.max(0, p.customerHeldStock - qty),
      };
    }));

    const ref = `RET-2026-${String(Date.now()).slice(-5)}`;
    const now = new Date().toISOString().split('T')[0];

    // Customer Cylinder Ledger
    const newEntry: CustomerCylinderLedgerEntry = {
      id: `ccl-${Date.now()}`,
      date: now,
      customerId,
      customerName: customer.businessName,
      reference: ref,
      productId,
      brand: product.brand,
      size: product.size,
      fullDelivered: 0,
      emptyReturned: condition === 'Good' ? qty : 0,
      damaged: condition === 'Damaged' ? qty : 0,
      balanceCylinders: -qty,
      notes: notes || `Direct return: ${qty} empty cylinders received (${condition})`,
    };
    setCustomerCylinderLedger(prev => [newEntry, ...prev]);

    // Stock Movement
    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      reference: ref,
      movementType: condition === 'Good' ? 'CUSTOMER_EMPTY_IN' : 'DAMAGED',
      productId,
      brand: product.brand,
      size: product.size,
      fullQty: 0,
      emptyQty: qty,
      user: currentUser?.name || 'Store Keeper',
      notes: `Empty cylinder return from ${customer.businessName}. Condition: ${condition}. ${notes || ''}`,
    };
    setStockMovements(prev => [newMovement, ...prev]);

    logAudit('RECEIVE_EMPTY', 'Cylinders', ref, `Received ${qty} empty ${product.brand} ${product.size} from ${customer.businessName}. Condition: ${condition}`);
  };

  // SEND EMPTY TO SUPPLIER
  const sendEmptyToSupplier = (supplierId: string, productId: string, qty: number, notes?: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const product = products.find(p => p.id === productId);
    if (!supplier || !product || qty <= 0) return;

    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        emptyStock: Math.max(0, p.emptyStock - qty),
        supplierHeldStock: Math.max(0, p.supplierHeldStock - qty),
      };
    }));

    const ref = `SUP-RET-${String(Date.now()).slice(-5)}`;
    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      reference: ref,
      movementType: 'EMPTY_SENT_TO_SUPPLIER',
      productId,
      brand: product.brand,
      size: product.size,
      fullQty: 0,
      emptyQty: -qty,
      user: currentUser?.name || 'Store Keeper',
      notes: `Sent ${qty} empty cylinders back to ${supplier.companyName}. ${notes || ''}`,
    };
    setStockMovements(prev => [newMovement, ...prev]);

    logAudit('SUPPLIER_EMPTY_RETURN', 'Suppliers', ref, `Sent ${qty} empty ${product.brand} ${product.size} to supplier ${supplier.companyName}`);
  };

  const addCustomer = (c: Omit<Customer, 'id' | 'code' | 'createdAt' | 'currentDue'>): Customer => {
    const nextCode = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      code: nextCode,
      currentDue: c.openingBalance || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers(prev => [...prev, newCustomer]);
    logAudit('ADD_CUSTOMER', 'Customers', nextCode, `Added new customer: ${c.businessName} (${c.customerType})`);
    return newCustomer;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    logAudit('UPDATE_CUSTOMER', 'Customers', updated.code, `Updated customer profile: ${updated.businessName}`);
  };

  const addSupplier = (s: Omit<Supplier, 'id' | 'code' | 'currentPayable'>): Supplier => {
    const nextCode = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSupplier: Supplier = {
      ...s,
      id: `sup-${Date.now()}`,
      code: nextCode,
      currentPayable: s.openingBalance || 0,
    };
    setSuppliers(prev => [...prev, newSupplier]);
    logAudit('ADD_SUPPLIER', 'Suppliers', nextCode, `Added supplier: ${s.companyName}`);
    return newSupplier;
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const addProduct = (p: Omit<CylinderProduct, 'id' | 'fullStock' | 'emptyStock' | 'damagedStock' | 'lostStock' | 'customerHeldStock' | 'supplierHeldStock'>): CylinderProduct => {
    const newProduct: CylinderProduct = {
      ...p,
      id: `prod-${Date.now()}`,
      fullStock: 0,
      emptyStock: 0,
      damagedStock: 0,
      lostStock: 0,
      customerHeldStock: 0,
      supplierHeldStock: 0,
    };
    setProducts(prev => [...prev, newProduct]);
    logAudit('ADD_PRODUCT', 'Products', p.sku, `Added product: ${p.brand} ${p.size}`);
    return newProduct;
  };

  const updateProduct = (updated: CylinderProduct) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const addBERCPrice = (p: Omit<BERCPriceReference, 'id' | 'updatedAt'>) => {
    const newRef: BERCPriceReference = {
      ...p,
      id: `berc-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setBercPrices(prev => [newRef, ...prev]);
    logAudit('UPDATE_BERC_RATE', 'Settings', p.effectiveMonth, `Recorded BERC reference rate: ৳${p.referencePrice} for ${p.cylinderSize}`);
  };

  const updateDeliveryStatus = (deliveryId: string, status: Delivery['status']) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status } : d));
    logAudit('UPDATE_DELIVERY', 'Delivery', deliveryId, `Updated delivery status to ${status}`);
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setBrands(INITIAL_BRANDS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setExpenses(INITIAL_EXPENSES);
    setTransactions(INITIAL_TRANSACTIONS);
    setMoneyReceipts(INITIAL_MONEY_RECEIPTS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setCustomerCylinderLedger(INITIAL_CUSTOMER_CYLINDER_LEDGER);
    setDeliveries(INITIAL_DELIVERIES);
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setBercPrices(INITIAL_BERC_PRICES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAudit('RESET_DATABASE', 'System', 'ALL', 'Reset all local storage records to default demo data');
  };

  const exportBackupJSON = (): string => {
    const state = {
      settings,
      products,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      transactions,
      moneyReceipts,
      stockMovements,
      customerCylinderLedger,
      deliveries,
      bercPrices,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(state, null, 2);
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products && parsed.customers && parsed.sales) {
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.moneyReceipts) setMoneyReceipts(parsed.moneyReceipts);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        if (parsed.customerCylinderLedger) setCustomerCylinderLedger(parsed.customerCylinderLedger);
        if (parsed.deliveries) setDeliveries(parsed.deliveries);
        if (parsed.bercPrices) setBercPrices(parsed.bercPrices);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        logAudit('RESTORE_BACKUP', 'System', 'BACKUP_IMPORT', 'Successfully imported backup database file');
        return true;
      }
    } catch (e) {
      console.error('Import backup failed', e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        activeView,
        setActiveView,
        settings,
        updateSettings,
        users,
        brands,
        products,
        customers,
        suppliers,
        sales,
        purchases,
        expenses,
        transactions,
        moneyReceipts,
        stockMovements,
        customerCylinderLedger,
        supplierCylinderLedger,
        deliveries,
        vehicles,
        drivers,
        bercPrices,
        auditLogs,
        notifications,
        markNotificationRead,
        selectedCustomerForDetails,
        setSelectedCustomerForDetails,
        printSale,
        setPrintSale,
        printChallan,
        setPrintChallan,
        printReceipt,
        setPrintReceipt,
        isSearchOpen,
        setIsSearchOpen,
        isAdjustStockModalOpen,
        setIsAdjustStockModalOpen,
        isReceiveEmptyModalOpen,
        setIsReceiveEmptyModalOpen,
        addSale,
        cancelSale,
        addPurchase,
        receivePayment,
        makeSupplierPayment,
        addExpense,
        adjustStock,
        receiveEmptyCylinders,
        sendEmptyToSupplier,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        addProduct,
        updateProduct,
        addBERCPrice,
        updateDeliveryStatus,
        resetAllData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
