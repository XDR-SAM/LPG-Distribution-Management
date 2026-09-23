import { 
  AISettings, 
  ChatMessage, 
  AgentAction, 
  Customer, 
  Supplier, 
  CylinderProduct, 
  Sale, 
  AppSettings,
  FinancialTransaction,
  BERCPriceReference,
  PaymentMethod,
  AccountType,
  CustomerType
} from '../types';

export interface DatabaseSnapshotContext {
  business: {
    name: string;
    owner: string;
    phone: string;
    address: string;
    tradeLicense: string;
    bin: string;
    bercLicense?: string;
  };
  inventorySummary: {
    id: string;
    brand: string;
    size: string;
    fullStock: number;
    emptyStock: number;
    damagedStock: number;
    sellingPrice: number;
    costPrice: number;
  }[];
  customersSummary: {
    id: string;
    name: string;
    phone: string;
    area: string;
    type: string;
    currentDue: number;
    cylindersDue?: number;
  }[];
  suppliersSummary: {
    id: string;
    name: string;
    phone: string;
    currentPayable: number;
    emptyWithSupplier?: number;
  }[];
  accountsSummary: {
    cashInHand: number;
    bkash: number;
    bankAccount: number;
    totalAvailable: number;
  };
  recentSales: {
    invoiceNo: string;
    customer: string;
    date: string;
    total: number;
    paid: number;
    due: number;
    itemsSummary: string;
  }[];
  bercPrices: {
    size: string;
    price: number;
    month: string;
  }[];
}

/**
 * Builds a structured, compact live database snapshot for the AI agent context
 */
export const buildDatabaseSnapshot = (params: {
  settings: AppSettings;
  products: CylinderProduct[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  transactions: FinancialTransaction[];
  bercPrices: BERCPriceReference[];
}): DatabaseSnapshotContext => {
  const { settings, products, customers, suppliers, sales, transactions, bercPrices } = params;

  // Calculate live account balances from transactions
  let cashInHand = 85400; // base opening
  let bkash = 42300;
  let bankAccount = 350000;

  transactions.forEach(tx => {
    const net = (tx.debit || 0) - (tx.credit || 0);
    if (tx.account === 'Cash in Hand') cashInHand += net;
    else if (tx.account === 'bKash') bkash += net;
    else if (tx.account === 'Bank Account') bankAccount += net;
  });

  return {
    business: {
      name: settings.profile.businessName || 'Rahman LPG Distribution',
      owner: settings.profile.ownerName || 'Al-Haj Mizanur Rahman',
      phone: settings.profile.phone || '01711-889900',
      address: `${settings.profile.address}, ${settings.profile.area}, ${settings.profile.district}`,
      tradeLicense: settings.profile.tradeLicense,
      bin: settings.profile.bin,
    },
    inventorySummary: products.map(p => ({
      id: p.id,
      brand: p.brand,
      size: p.size,
      fullStock: p.fullStock,
      emptyStock: p.emptyStock,
      damagedStock: p.damagedStock,
      sellingPrice: p.sellingPrice,
      costPrice: p.purchasePrice,
    })),
    customersSummary: customers.slice(0, 30).map(c => ({
      id: c.id,
      name: c.businessName || c.contactPerson,
      phone: c.phone,
      area: c.area,
      type: c.customerType,
      currentDue: c.currentDue,
    })),
    suppliersSummary: suppliers.map(s => ({
      id: s.id,
      name: s.companyName || s.contactPerson,
      phone: s.phone,
      currentPayable: s.currentPayable,
    })),
    accountsSummary: {
      cashInHand: Math.max(0, cashInHand),
      bkash: Math.max(0, bkash),
      bankAccount: Math.max(0, bankAccount),
      totalAvailable: Math.max(0, cashInHand + bkash + bankAccount),
    },
    recentSales: sales.slice(0, 10).map(s => ({
      invoiceNo: s.invoiceNo,
      customer: s.customerName,
      date: s.date,
      total: s.grandTotal,
      paid: s.amountPaid,
      due: s.currentDue,
      itemsSummary: s.items.map(i => `${i.fullQty}x ${i.brand} ${i.size}`).join(', '),
    })),
    bercPrices: bercPrices.slice(0, 6).map(b => ({
      size: b.cylinderSize,
      price: b.referencePrice,
      month: b.effectiveMonth,
    })),
  };
};

/**
 * Extracts action JSON blocks from LLM reply if present
 */
export const extractActionFromReply = (rawReply: string): { cleanText: string; action: AgentAction | null } => {
  // Regex to look for ```json:action ... ``` or ```json\n{ "action": ... }
  const actionRegex = /```(?:json:action|json)\s*(\{[\s\S]*?"action"[\s\S]*?\})\s*```/i;
  const match = rawReply.match(actionRegex);

  if (!match) {
    return { cleanText: rawReply.trim(), action: null };
  }

  try {
    const jsonStr = match[1];
    const parsed = JSON.parse(jsonStr);

    if (parsed && parsed.action && typeof parsed.action === 'string') {
      const cleanText = rawReply.replace(match[0], '').trim();
      let rawType = parsed.action.toUpperCase();
      let normalizedType: any = rawType;

      if (rawType.includes('SELL') || rawType.includes('SALE')) normalizedType = 'CREATE_SALE';
      else if (rawType.includes('RECEIVE_PAYMENT') || rawType.includes('PAYMENT') || rawType.includes('RECEIPT')) normalizedType = 'RECEIVE_PAYMENT';
      else if (rawType.includes('ADJUST') || rawType.includes('DAMAGE') || rawType.includes('STOCK')) normalizedType = 'ADJUST_STOCK';
      else if (rawType.includes('EMPTY')) normalizedType = 'RECEIVE_EMPTY';
      else if (rawType.includes('EXPENSE')) normalizedType = 'ADD_EXPENSE';
      else if (rawType.includes('CUSTOMER')) normalizedType = 'ADD_CUSTOMER';
      else if (rawType.includes('SUPPLIER_PAY') || rawType.includes('PAY_SUPPLIER')) normalizedType = 'MAKE_SUPPLIER_PAYMENT';

      const rawParams = parsed.params || parsed.parameters || { ...parsed };
      delete rawParams.action;

      const actionObj: AgentAction = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: normalizedType,
        params: rawParams,
        status: 'pending',
      };
      return { cleanText, action: actionObj };
    }
  } catch (err) {
    console.warn('Failed to parse AI action JSON block:', err);
  }

  return { cleanText: rawReply.trim(), action: null };
};

/**
 * Sends conversation to the backend AI agent endpoint
 */
export const sendChatMessageToAgent = async (params: {
  messages: ChatMessage[];
  aiSettings: AISettings;
  databaseContext: DatabaseSnapshotContext;
}): Promise<{ reply: string; action: AgentAction | null; modelUsed: string; providerUsed: string }> => {
  const { messages, aiSettings, databaseContext } = params;

  const payload = {
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    provider: aiSettings.provider,
    model: aiSettings.provider === 'gemini' ? aiSettings.geminiModel : aiSettings.openaiConfig.model,
    systemInstruction: `You are the AI Godown Operations Agent for "LPG Manager BD" (Mohammadpur Godown, Rahman LPG Distribution, Dhaka, Bangladesh).
Your role: ${aiSettings.agentRole || 'Senior Operations Manager & Godown In-Charge'}.
You speak fluent English and Bengali (Bangla/Banglish as the user prefers). You are courteous, highly competent, and precise with numbers and BDT currency (৳).

CAPABILITIES:
1. Awareness: You have full real-time access to the godown's stocks, customers, suppliers, dues, cashbooks, recent sales, and official BERC rates.
2. Answering: Explain stock levels, who owes money, inventory deficits, profits, delivery statuses, and price differences accurately.
3. Taking Actions (Working as an Agent):
When the user gives a command to perform a task (e.g. "Sell 5 12kg cylinders to Kalam Store for 7000 cash", "Record 10,000 tk receipt from Bismillah Hotel", "Report 2 damaged Omera cylinders", "Record 1500 fuel expense"), you MUST formulate your friendly answer AND append a structured JSON action block at the end in this format:

\`\`\`json:action
{
  "action": "<ACTION_NAME>",
  "params": { ... }
}
\`\`\`

SUPPORTED ACTIONS AND PARAMS:
- CREATE_SALE:
  params: {
    customerName: string, // or customerId
    brand: string, // e.g. "Bashundhara", "Beximco", "Omera", "Jamuna"
    size: "12kg" | "35kg" | "45kg",
    qty: number,
    unitPrice: number, // optional, defaults to product selling price
    emptyReceived: number, // cylinders exchanged
    amountPaid: number, // amount collected now
    paymentMethod: "Cash" | "bKash" | "Nagad" | "Bank Transfer",
    cylinderSettlement: "exchange" | "due" | "deposit"
  }

- RECEIVE_PAYMENT:
  params: {
    customerName: string, // or customerId
    amount: number,
    paymentMethod: "Cash" | "bKash" | "Nagad" | "Bank Transfer",
    account: "Cash in Hand" | "bKash" | "Nagad" | "Bank Account",
    notes?: string
  }

- ADJUST_STOCK:
  params: {
    brand: string,
    size: "12kg" | "35kg" | "45kg",
    fullDelta: number, // e.g. -2 if damaged or +10 if added
    emptyDelta: number,
    damagedDelta: number,
    lostDelta: number,
    reason: string
  }

- RECEIVE_EMPTY:
  params: {
    customerName: string,
    brand: string,
    size: "12kg" | "35kg" | "45kg",
    qty: number,
    condition: "Good" | "Damaged",
    notes?: string
  }

- ADD_EXPENSE:
  params: {
    category: "Transport & Fuel" | "Godown Staff Food" | "Vehicle Repair & Service" | "Labor & Loading" | "Electricity & Utility" | "Office Expense" | "Police / Local Fee" | "Other",
    amount: number,
    paymentAccount: "Cash in Hand" | "bKash" | "Bank Account",
    description: string
  }

- ADD_CUSTOMER:
  params: {
    name: string,
    phone: string,
    address: string,
    area: string,
    customerType: "hotel_restaurant" | "dealer_retailer" | "tea_stall" | "household" | "industrial",
    initialDue?: number
  }

- MAKE_SUPPLIER_PAYMENT:
  params: {
    supplierName: string,
    amount: number,
    paymentMethod: "Cash" | "Bank Transfer" | "bKash",
    account: "Cash in Hand" | "Bank Account" | "bKash",
    notes?: string
  }

Always be concise, professional, and clear with exact invoice numbers, cylinder quantities, and amounts in BDT.`,
    databaseContext,
    openaiConfig: aiSettings.openaiConfig,
  };

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawReply = data.reply || '';
  const { cleanText, action } = extractActionFromReply(rawReply);

  return {
    reply: cleanText,
    action,
    modelUsed: data.model || aiSettings.geminiModel,
    providerUsed: data.provider || aiSettings.provider,
  };
};

/**
 * Executes an AgentAction against the AppContext state and database
 */
export const executeAgentAction = (
  action: AgentAction,
  context: {
    products: CylinderProduct[];
    customers: Customer[];
    suppliers: Supplier[];
    addSale: any;
    receivePayment: any;
    adjustStock: any;
    receiveEmptyCylinders: any;
    addExpense: any;
    addCustomer: any;
    makeSupplierPayment: any;
    sendEmptyToSupplier: any;
    settings: AppSettings;
    currentUser: any;
  }
): { success: boolean; message: string; data?: any } => {
  try {
    const { params } = action;

    switch (action.type) {
      case 'CREATE_SALE': {
        const customerSearch = (params.customerName || '').toLowerCase().trim();
        const customer = context.customers.find(
          c => (c.businessName && c.businessName.toLowerCase().includes(customerSearch)) ||
               (c.contactPerson && c.contactPerson.toLowerCase().includes(customerSearch)) ||
               c.id === params.customerId
        ) || context.customers[0];
        const custName = customer.businessName || customer.contactPerson || 'Customer';

        const brandName = params.brand || '';
        const sizeStr = params.size || '12kg';
        const product = context.products.find(
          p => (params.productId && p.id === params.productId) ||
               (brandName && p.brand.toLowerCase() === brandName.toLowerCase() && p.size === sizeStr) ||
               (brandName && p.brand.toLowerCase().includes(brandName.toLowerCase()))
        ) || context.products[0];

        const fullQty = Number(params.qty || params.quantity) || 1;
        const unitPrice = Number(params.unitPrice) || product.sellingPrice || 1400;
        const emptyReceived = Number(params.emptyReceived !== undefined ? params.emptyReceived : params.emptiesReceived) || (params.cylinderSettlement === 'exchange' ? fullQty : 0);
        const subtotal = fullQty * unitPrice;
        const amountPaid = params.amountPaid !== undefined ? Number(params.amountPaid) : subtotal;

        const createdSale = context.addSale({
          date: new Date().toISOString().split('T')[0],
          customerId: customer.id,
          customerName: custName,
          customerType: customer.customerType,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          salesperson: context.currentUser?.name || 'AI Godown Agent',
          godown: 'Mohammadpur Godown',
          items: [
            {
              id: `item-${Date.now()}`,
              productId: product.id,
              brand: product.brand,
              size: product.size,
              fullQty,
              emptyQtyReceived: emptyReceived,
              unitPrice,
              discount: 0,
              amount: subtotal,
              cylinderSettlement: params.cylinderSettlement || (emptyReceived >= fullQty ? 'exchange' : 'due'),
            },
          ],
          subtotal,
          discount: 0,
          transportCharge: 0,
          loadingCharge: 0,
          otherCharge: 0,
          vatRate: 0,
          vatAmount: 0,
          grandTotal: subtotal,
          previousDue: customer.currentDue,
          amountPaid,
          currentDue: customer.currentDue + (subtotal - amountPaid),
          paymentMethod: (params.paymentMethod as PaymentMethod) || 'Cash',
          paymentAccount: (params.paymentMethod === 'bKash' ? 'bKash' : 'Cash in Hand') as AccountType,
          cylinderSettlement: params.cylinderSettlement || (emptyReceived >= fullQty ? 'exchange' : 'due'),
          emptyCylindersDue: Math.max(0, fullQty - emptyReceived),
          emptyCylindersReceived: emptyReceived,
          deliveryType: 'godown_pickup',
          notes: params.notes || 'Created automatically via LPG AI Godown Agent',
        });

        return {
          success: true,
          message: `Sale invoice ${createdSale.invoiceNo} generated for ${custName}. Amount: ৳${subtotal.toLocaleString()}, Paid: ৳${amountPaid.toLocaleString()}. Stock updated (-${fullQty} full, +${emptyReceived} empty).`,
          data: createdSale,
        };
      }

      case 'RECEIVE_PAYMENT': {
        const customerSearch = (params.customerName || '').toLowerCase().trim();
        const customer = context.customers.find(
          c => (c.businessName && c.businessName.toLowerCase().includes(customerSearch)) ||
               (c.contactPerson && c.contactPerson.toLowerCase().includes(customerSearch)) ||
               c.id === params.customerId
        );

        if (!customer) {
          return { success: false, message: `Customer "${params.customerName}" not found.` };
        }
        const custName = customer.businessName || customer.contactPerson || 'Customer';

        const amount = Number(params.amount) || 0;
        if (amount <= 0) {
          return { success: false, message: 'Invalid payment amount specified.' };
        }

        const method = (params.paymentMethod as PaymentMethod) || 'Cash';
        const account = (params.account as AccountType) || (method === 'bKash' ? 'bKash' : 'Cash in Hand');

        const receipt = context.receivePayment({
          customerId: customer.id,
          amount,
          paymentMethod: method,
          account,
          notes: params.notes || 'Payment recorded by AI Godown Agent',
        });

        return {
          success: true,
          message: `Money Receipt ${receipt.receiptNo} created for ${custName}. Received: ৳${amount.toLocaleString()} via ${method} into ${account}. Customer due reduced.`,
          data: receipt,
        };
      }

      case 'ADJUST_STOCK': {
        const brandName = params.brand || '';
        const sizeStr = params.size || '12kg';
        const product = context.products.find(
          p => p.brand.toLowerCase().includes(brandName.toLowerCase()) && p.size === sizeStr
        ) || context.products[0];

        const fullDelta = Number(params.fullDelta) || 0;
        const emptyDelta = Number(params.emptyDelta) || 0;
        const damagedDelta = Number(params.damagedDelta) || 0;
        const lostDelta = Number(params.lostDelta) || 0;
        const reason = params.reason || 'Stock adjustment recorded by AI Agent';

        context.adjustStock(product.id, fullDelta, emptyDelta, damagedDelta, lostDelta, reason);

        return {
          success: true,
          message: `Stock updated for ${product.brand} ${product.size}: Full (${fullDelta >= 0 ? '+' : ''}${fullDelta}), Empty (${emptyDelta >= 0 ? '+' : ''}${emptyDelta}), Damaged (${damagedDelta >= 0 ? '+' : ''}${damagedDelta}). Reason: ${reason}.`,
          data: { productId: product.id, fullDelta, emptyDelta, damagedDelta, reason },
        };
      }

      case 'RECEIVE_EMPTY': {
        const customerSearch = (params.customerName || '').toLowerCase().trim();
        const customer = context.customers.find(
          c => (c.businessName && c.businessName.toLowerCase().includes(customerSearch)) ||
               (c.contactPerson && c.contactPerson.toLowerCase().includes(customerSearch)) ||
               c.id === params.customerId
        ) || context.customers[0];
        const custName = customer.businessName || customer.contactPerson || 'Customer';

        const brandName = params.brand || '';
        const sizeStr = params.size || '12kg';
        const product = context.products.find(
          p => p.brand.toLowerCase().includes(brandName.toLowerCase()) && p.size === sizeStr
        ) || context.products[0];

        const qty = Number(params.qty) || 1;
        const condition = params.condition === 'Damaged' ? 'Damaged' : 'Good';

        context.receiveEmptyCylinders(customer.id, product.id, qty, condition, params.notes || 'Received by AI Agent');

        return {
          success: true,
          message: `Received ${qty} empty ${product.brand} ${product.size} (${condition}) from ${custName}. Customer cylinder ledger and godown inventory updated.`,
          data: { customerId: customer.id, productId: product.id, qty, condition },
        };
      }

      case 'ADD_EXPENSE': {
        const amount = Number(params.amount) || 0;
        const category = params.category || 'Transport & Fuel';
        const account = (params.paymentAccount as AccountType) || 'Cash in Hand';
        const description = params.description || 'Godown operation expense';

        const expense = context.addExpense({
          date: new Date().toISOString().split('T')[0],
          category,
          amount,
          paymentAccount: account,
          paidTo: params.paidTo || 'Cash Paid',
          description,
          approvedBy: context.currentUser?.name || 'Admin',
          notes: params.notes || 'Added by AI Godown Agent',
        });

        return {
          success: true,
          message: `Expense voucher ${expense.voucherNo} created: ৳${amount.toLocaleString()} for "${description}" (${category}) paid from ${account}.`,
          data: expense,
        };
      }

      case 'ADD_CUSTOMER': {
        const name = params.name || 'New Customer';
        const phone = params.phone || '01700-000000';
        const area = params.area || 'Mohammadpur';
        const address = params.address || `${area}, Dhaka`;
        const customerType = (params.customerType as CustomerType) || 'restaurant';

        const newCustomer = context.addCustomer({
          businessName: name,
          contactPerson: params.contactPerson || name,
          phone,
          address,
          area,
          customerType,
          creditLimit: Number(params.creditLimit) || 20000,
          openingBalance: Number(params.initialDue) || 0,
          status: 'active',
          notes: 'Added via AI Godown Agent',
        });

        return {
          success: true,
          message: `Customer ${newCustomer.businessName} (${newCustomer.code}) registered successfully in ${area} area.`,
          data: newCustomer,
        };
      }

      case 'MAKE_SUPPLIER_PAYMENT': {
        const supplierSearch = (params.supplierName || '').toLowerCase().trim();
        const supplier = context.suppliers.find(
          s => (s.companyName && s.companyName.toLowerCase().includes(supplierSearch)) ||
               (s.contactPerson && s.contactPerson.toLowerCase().includes(supplierSearch)) ||
               s.id === params.supplierId
        ) || context.suppliers[0];
        const suppName = supplier.companyName || supplier.contactPerson || 'Supplier';

        const amount = Number(params.amount) || 0;
        const method = (params.paymentMethod as PaymentMethod) || 'Bank Transfer';
        const account = (params.account as AccountType) || 'Bank Account';

        context.makeSupplierPayment({
          supplierId: supplier.id,
          amount,
          paymentMethod: method,
          account,
          notes: params.notes || 'Supplier payment recorded by AI Godown Agent',
        });

        return {
          success: true,
          message: `Payment of ৳${amount.toLocaleString()} made to ${suppName} via ${method} (${account}). Supplier payable updated.`,
          data: { supplierId: supplier.id, amount, method, account },
        };
      }

      default:
        return { success: false, message: `Unknown action type: ${action.type}` };
    }
  } catch (err: any) {
    console.error('Failed to execute agent action:', err);
    return {
      success: false,
      message: `Failed to execute action: ${err.message || 'Unknown error occurred'}`,
    };
  }
};
