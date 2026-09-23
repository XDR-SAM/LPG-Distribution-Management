export type UserRole = 
  | 'owner'
  | 'admin' 
  | 'manager' 
  | 'accountant' 
  | 'sales_operator'
  | 'store_keeper'
  | 'delivery_staff'
  | 'sales' 
  | 'storekeeper' 
  | 'delivery';


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  username: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export type CylinderSize = 
  | '5.5 KG' 
  | '12 KG' 
  | '15 KG' 
  | '25 KG' 
  | '35 KG' 
  | '45 KG';

export interface Brand {
  id: string;
  name: string;
  code: string;
  color: string;
  active: boolean;
}

export interface CylinderProduct {
  id: string;
  brand: string;
  size: CylinderSize;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  dealerPrice: number;
  depositAmount: number;
  minStock: number;
  minStockLevel?: number;
  active: boolean;
  
  // Stock states
  fullStock: number;
  emptyStock: number;
  damagedStock: number;
  lostStock: number;
  customerHeldStock: number;
  supplierHeldStock: number;
  totalCylinders?: number;
}

export type Product = CylinderProduct;

export type CustomerType = 
  | 'dealer' 
  | 'retail_shop' 
  | 'restaurant' 
  | 'hotel' 
  | 'commercial' 
  | 'other';

export interface CustomerCylinderHolding {
  brand: string;
  size: string;
  emptyDue: number;
  depositHeld: number;
}

export interface Customer {
  id: string;
  code: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  altPhone?: string;
  address: string;
  area: string;
  thana?: string;
  district?: string;
  customerType: CustomerType;
  creditLimit: number;
  creditPeriodDays?: number;
  currentDue: number;
  openingBalance: number;
  cylinderHoldings?: CustomerCylinderHolding[];
  bin?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  district: string;
  bin?: string;
  openingBalance: number;
  currentPayable: number;
  creditTerms: string;
  notes?: string;
}

export type CylinderSettlementType = 
  | 'exchange' 
  | 'due' 
  | 'deposit' 
  | 'sold_permanently';

export interface SaleItem {
  id: string;
  productId: string;
  brand: string;
  size: CylinderSize;
  fullQty: number;
  emptyQtyReceived: number;
  unitPrice: number;
  discount: number;
  amount: number;
  cylinderSettlement: CylinderSettlementType;
  depositAmount?: number;
}

export type PaymentMethod = 
  | 'Cash' 
  | 'bKash' 
  | 'Nagad' 
  | 'Rocket' 
  | 'Bank Transfer' 
  | 'Cheque' 
  | 'Credit / Due'
  | 'Split Payment';

export interface SplitPaymentDetail {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export type SaleStatus = 'paid' | 'partial' | 'due' | 'cancelled' | 'returned';

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerType: CustomerType;
  customerPhone: string;
  customerAddress: string;
  salesperson: string;
  godown: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  transportCharge: number;
  loadingCharge: number;
  otherCharge: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  previousDue: number;
  amountPaid: number;
  currentDue: number;
  totalFullQty: number;
  totalEmptyReceived: number;
  netCylinderDueAdded: number;
  paymentMethod: PaymentMethod;
  splitDetails?: SplitPaymentDetail[];
  status: SaleStatus;
  notes?: string;
  overrideCreditLimit?: boolean;
  overrideReason?: string;
  createdAt: string;
}

export interface SaleReturn {
  id: string;
  returnNo: string;
  invoiceId: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  date: string;
  reason: 'Wrong Product' | 'Damaged Product' | 'Customer Cancelled' | 'Other';
  productId: string;
  productName: string;
  qtyReturned: number;
  refundAmount: number;
  condition: 'Good' | 'Damaged';
  notes?: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  brand: string;
  size: CylinderSize;
  fullQtyReceived: number;
  emptyQtySent: number;
  unitPurchasePrice?: number;
  unitCost?: number;
  discount?: number;
  amount: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierInvoiceRef: string;
  date: string;
  supplierId: string;
  supplierName: string;
  godown: string;
  items: PurchaseItem[];
  subtotal: number;
  transportCost: number;
  loadingCost: number;
  otherExpense: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  totalFullReceived: number;
  totalEmptySent: number;
  netSupplierCylinderDue: number;
  paymentMethod: PaymentMethod;
  status: 'paid' | 'partial' | 'due' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type StockMovementType = 
  | 'PURCHASE_FULL_IN'
  | 'SALE_FULL_OUT'
  | 'CUSTOMER_EMPTY_IN'
  | 'EMPTY_SENT_TO_SUPPLIER'
  | 'SALE_RETURN'
  | 'PURCHASE_RETURN'
  | 'DAMAGED'
  | 'LOST'
  | 'RECOVERED'
  | 'MANUAL_ADJUSTMENT'
  | 'GODOWN_TRANSFER';

export interface StockMovement {
  id: string;
  date: string;
  reference: string;
  movementType: StockMovementType;
  productId: string;
  brand: string;
  size: CylinderSize;
  fullQty: number;
  emptyQty: number;
  user: string;
  notes: string;
}

export interface CustomerCylinderLedgerEntry {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  reference: string;
  productId: string;
  brand: string;
  size: CylinderSize;
  fullDelivered: number;
  emptyReturned: number;
  damaged: number;
  balanceCylinders: number;
  notes?: string;
}

export interface SupplierCylinderLedgerEntry {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  reference: string;
  productId: string;
  brand: string;
  size: CylinderSize;
  fullReceived: number;
  emptySent: number;
  balanceCylinders: number;
  notes?: string;
}

export type AccountType = 
  | 'Cash in Hand' 
  | 'bKash' 
  | 'Nagad' 
  | 'Rocket' 
  | 'Bank Account';

export interface FinancialTransaction {
  id: string;
  date: string;
  voucherNo: string;
  description: string;
  account: AccountType;
  type: 'SALE' | 'PAYMENT_RECEIVED' | 'PURCHASE' | 'PAYMENT_MADE' | 'EXPENSE' | 'INCOME' | 'ADJUSTMENT';
  reference: string;
  partyType?: 'customer' | 'supplier' | 'expense' | 'other';
  partyId?: string;
  partyName?: string;
  debit: number; // money in
  credit: number; // money out
  balanceAfter?: number;
}

export interface MoneyReceipt {
  id: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  account: AccountType;
  transactionRef?: string;
  notes?: string;
  allocatedInvoices?: { invoiceId: string; invoiceNo: string; allocatedAmount: number }[];
}

export interface PaymentVoucher {
  id: string;
  voucherNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  account: AccountType;
  transactionRef?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'Transport'
  | 'Fuel'
  | 'Loading/Unloading'
  | 'Salary/Wages'
  | 'Godown Rent'
  | 'Electricity'
  | 'Mobile/Internet'
  | 'Vehicle Repair'
  | 'Cylinder Repair'
  | 'Office Expense'
  | 'Food/Allowance'
  | 'Bank Charge'
  | 'Other';

export interface Expense {
  id: string;
  voucherNo: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentAccount: AccountType;
  reference?: string;
  enteredBy: string;
}

export interface Income {
  id: string;
  voucherNo: string;
  date: string;
  category: 'Cylinder Deposit' | 'Delivery Charge' | 'Scrap Sale' | 'Other';
  customerId?: string;
  customerName?: string;
  amount: number;
  paymentAccount: AccountType;
  notes?: string;
}

export interface Vehicle {
  id: string;
  vehicleNo: string;
  vehicleType: string;
  capacityCylinders: number;
  driverName: string;
  driverPhone: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  nid?: string;
  licenseNo: string;
  assignedVehicle?: string;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface Delivery {
  id: string;
  deliveryNo: string;
  invoiceNo: string;
  saleId: string;
  customerId: string;
  customerName: string;
  area: string;
  address: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  totalQty: number;
  emptyToCollect: number;
  amount: number;
  status: 'pending' | 'loading' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryDate: string;
  expenses: { type: string; amount: number }[];
}

export interface BERCPriceReference {
  id: string;
  effectiveMonth: string;
  cylinderSize: CylinderSize;
  referencePrice: number;
  sourceNote: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  reference: string;
  details: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  thana: string;
  district: string;
  bin: string;
  tradeLicense: string;
  tin?: string;
}

export interface AppSettings {
  profile: BusinessProfile;
  invoicePrefix: string;
  purchasePrefix: string;
  receiptPrefix: string;
  voucherPrefix: string;
  challanPrefix: string;
  footerText: string;
  currencySymbol: string;
  timezone: string;
  vatModeEnabled: boolean;
  vatRatePercent: number;
  mushakPrefix: string;
  defaultInvoiceFormat: 'a4' | 'thermal_80mm' | 'dot_matrix';
  creditLimitWarningPercent: number;
  financialYear: string;
  lastBackupTime: string;
  aiSettings?: AISettings;
}

export type LLMProvider = 'gemini' | 'openai';

export type GeminiModel = 
  | 'gemini-3.5-flash' 
  | 'gemini-3.1-pro-preview' 
  | 'gemini-3.1-flash-lite';

export interface AISettings {
  provider: LLMProvider;
  geminiModel: GeminiModel;
  openaiConfig: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };
  agentRole: string;
  autoExecuteActions: boolean;
  systemInstructionCustom?: string;
}

export type AgentActionType = 
  | 'CREATE_SALE' 
  | 'RECEIVE_PAYMENT' 
  | 'ADJUST_STOCK' 
  | 'RECEIVE_EMPTY' 
  | 'ADD_EXPENSE' 
  | 'ADD_CUSTOMER' 
  | 'MAKE_SUPPLIER_PAYMENT'
  | 'SEND_EMPTY_SUPPLIER';

export interface AgentAction {
  id: string;
  type: AgentActionType;
  params: Record<string, any>;
  status: 'pending' | 'executed' | 'failed';
  resultMessage?: string;
  resultData?: Record<string, any>;
  executedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: LLMProvider;
  action?: AgentAction;
}

