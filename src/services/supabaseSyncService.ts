import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  CylinderProduct, 
  Customer, 
  Supplier, 
  Sale, 
  Purchase, 
  StockMovement, 
  MoneyReceipt, 
  Expense, 
  User, 
  AppSettings 
} from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCounts?: Record<string, number>;
  error?: string;
}

export const syncAllToSupabase = async (data: {
  users: User[];
  products: CylinderProduct[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  stockMovements: StockMovement[];
  moneyReceipts: MoneyReceipt[];
  expenses: Expense[];
  settings: AppSettings;
}): Promise<SyncResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Could not connect to Supabase client.' };
  }

  const counts: Record<string, number> = {};
  const errors: string[] = [];

  try {
    // 1. Profiles / Users
    if (data.users.length > 0) {
      const formattedProfiles = data.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        username: u.username,
        status: u.status,
      }));
      const { error: profErr } = await supabase.from('profiles').upsert(formattedProfiles, { onConflict: 'id' });
      if (profErr) {
        errors.push(`profiles: ${profErr.message} (code: ${profErr.code})`);
      } else {
        counts.profiles = formattedProfiles.length;
      }
    }

    // 2. Products
    if (data.products.length > 0) {
      const formattedProducts = data.products.map(p => ({
        id: p.id,
        brand: p.brand,
        size: p.size,
        sku: p.sku,
        category: p.category || 'Cylinder',
        purchase_price: p.purchasePrice,
        selling_price: p.sellingPrice,
        dealer_price: p.dealerPrice,
        deposit_amount: p.depositAmount,
        min_stock: p.minStock,
        full_stock: p.fullStock,
        empty_stock: p.emptyStock,
        damaged_stock: p.damagedStock,
        lost_stock: p.lostStock,
        customer_held_stock: p.customerHeldStock,
        supplier_held_stock: p.supplierHeldStock,
        active: p.active,
      }));
      const { error: prodErr } = await supabase.from('products').upsert(formattedProducts, { onConflict: 'id' });
      if (prodErr) {
        errors.push(`products: ${prodErr.message} (code: ${prodErr.code})`);
      } else {
        counts.products = formattedProducts.length;
      }
    }

    // 3. Customers
    if (data.customers.length > 0) {
      const formattedCustomers = data.customers.map(c => ({
        id: c.id,
        code: c.code,
        business_name: c.businessName,
        contact_person: c.contactPerson,
        phone: c.phone,
        address: c.address,
        area: c.area,
        customer_type: c.customerType,
        credit_limit: c.creditLimit,
        credit_period_days: c.creditPeriodDays,
        current_due: c.currentDue,
        cylinder_holdings: c.cylinderHoldings || [],
      }));
      const { error: custErr } = await supabase.from('customers').upsert(formattedCustomers, { onConflict: 'id' });
      if (custErr) {
        errors.push(`customers: ${custErr.message} (code: ${custErr.code})`);
      } else {
        counts.customers = formattedCustomers.length;
      }
    }

    // 4. Suppliers
    if (data.suppliers.length > 0) {
      const formattedSuppliers = data.suppliers.map(s => ({
        id: s.id,
        code: s.code,
        company_name: s.companyName,
        contact_person: s.contactPerson,
        phone: s.phone,
        address: s.address,
        empty_cylinders_due: 0,
        current_payable: s.currentPayable,
      }));
      const { error: suppErr } = await supabase.from('suppliers').upsert(formattedSuppliers, { onConflict: 'id' });
      if (suppErr) {
        errors.push(`suppliers: ${suppErr.message} (code: ${suppErr.code})`);
      } else {
        counts.suppliers = formattedSuppliers.length;
      }
    }

    // 5. Sales
    if (data.sales.length > 0) {
      const formattedSales = data.sales.map(s => {
        const allowedStatus = ['completed', 'pending', 'cancelled'].includes(s.status)
          ? s.status
          : (s.currentDue > 0 ? 'pending' : 'completed');

        return {
          id: s.id,
          invoice_no: s.invoiceNo,
          customer_id: s.customerId,
          customer_name: s.customerName,
          customer_phone: s.customerPhone,
          customer_address: s.customerAddress,
          items: s.items,
          total_amount: s.subtotal,
          discount: s.discount,
          net_amount: s.grandTotal,
          paid_amount: s.amountPaid,
          due_amount: s.currentDue,
          empty_cylinders_received: s.totalEmptyReceived,
          empty_received_items: [],
          status: allowedStatus,
          payment_method: s.paymentMethod,
          notes: s.notes || '',
          created_by: s.salesperson,
          created_at: s.createdAt,
        };
      });

      const { error: saleErr } = await supabase.from('sales').upsert(formattedSales, { onConflict: 'id' });
      if (saleErr) {
        errors.push(`sales: ${saleErr.message} (code: ${saleErr.code})`);
      } else {
        counts.sales = formattedSales.length;
      }
    }

    // 6. Purchases
    if (data.purchases && data.purchases.length > 0) {
      const formattedPurchases = data.purchases.map(p => ({
        id: p.id,
        purchase_no: p.purchaseNo,
        supplier_id: p.supplierId,
        supplier_name: p.supplierName,
        supplier_invoice_ref: p.supplierInvoiceRef,
        items: p.items,
        total_amount: p.grandTotal,
        paid_amount: p.paidAmount,
        due_amount: p.dueAmount,
        empty_cylinders_sent: p.totalEmptySent,
        status: ['received', 'ordered', 'cancelled'].includes(p.status) ? p.status : 'received',
        created_by: 'Admin',
        created_at: p.createdAt || new Date().toISOString(),
      }));

      const { error: purchErr } = await supabase.from('purchases').upsert(formattedPurchases, { onConflict: 'id' });
      if (purchErr) {
        errors.push(`purchases: ${purchErr.message} (code: ${purchErr.code})`);
      } else {
        counts.purchases = formattedPurchases.length;
      }
    }

    // 7. Stock Movements
    if (data.stockMovements && data.stockMovements.length > 0) {
      const formattedMovements = data.stockMovements.map(m => ({
        id: m.id,
        date: m.date,
        product_id: m.productId,
        product_name: `${m.brand} ${m.size}`,
        brand: m.brand,
        size: m.size,
        movement_type: m.movementType,
        full_qty: m.fullQty,
        empty_qty: m.emptyQty,
        reference: m.reference,
        notes: m.notes,
        created_by: m.user,
        created_at: new Date().toISOString(),
      }));

      const { error: movErr } = await supabase.from('stock_movements').upsert(formattedMovements, { onConflict: 'id' });
      if (movErr) {
        errors.push(`stock_movements: ${movErr.message} (code: ${movErr.code})`);
      } else {
        counts.stockMovements = formattedMovements.length;
      }
    }

    // 8. Money Receipts
    if (data.moneyReceipts && data.moneyReceipts.length > 0) {
      const formattedReceipts = data.moneyReceipts.map(r => ({
        id: r.id,
        receipt_no: r.receiptNo,
        date: r.date,
        customer_id: r.customerId,
        customer_name: r.customerName,
        amount: r.amount,
        payment_method: r.paymentMethod,
        account: r.account,
        notes: r.notes || '',
        received_by: 'Admin',
        created_at: new Date().toISOString(),
      }));

      const { error: recErr } = await supabase.from('money_receipts').upsert(formattedReceipts, { onConflict: 'id' });
      if (recErr) {
        errors.push(`money_receipts: ${recErr.message} (code: ${recErr.code})`);
      } else {
        counts.moneyReceipts = formattedReceipts.length;
      }
    }

    // 9. Expenses
    if (data.expenses && data.expenses.length > 0) {
      const formattedExpenses = data.expenses.map(e => ({
        id: e.id,
        voucher_no: e.voucherNo,
        date: e.date,
        category: e.category,
        amount: e.amount,
        paid_from: e.paymentAccount,
        notes: e.description,
        approved_by: e.enteredBy,
        created_at: new Date().toISOString(),
      }));

      const { error: expErr } = await supabase.from('expenses').upsert(formattedExpenses, { onConflict: 'id' });
      if (expErr) {
        errors.push(`expenses: ${expErr.message} (code: ${expErr.code})`);
      } else {
        counts.expenses = formattedExpenses.length;
      }
    }

    // 10. Settings
    const { error: settErr } = await supabase.from('app_settings').upsert({
      id: 'primary',
      settings: data.settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (settErr) {
      errors.push(`app_settings: ${settErr.message} (code: ${settErr.code})`);
    } else {
      counts.settings = 1;
    }

    const totalSynced = Object.values(counts).reduce((a, b) => a + b, 0);

    if (errors.length > 0 && totalSynced === 0) {
      const isMissingTables = errors.some(e => e.includes('PGRST205') || e.includes('does not exist') || e.includes('schema cache'));
      return {
        success: false,
        message: isMissingTables
          ? 'Cannot push data to Supabase: The PostgreSQL tables have not been created yet in this Supabase database (PGRST205: table not found in schema cache). Please open your Supabase project SQL Editor and execute the schema.sql script to provision the tables.'
          : `Push failed with errors: ${errors.slice(0, 3).join('; ')}`,
        error: errors.join('; '),
      };
    }

    const errorTableNames = errors.map(e => e.split(':')[0]).join(', ');
    return {
      success: true,
      message: `Successfully synchronized ${totalSynced} records to Supabase!${errors.length > 0 ? ` (Note: ${errors.length} tables need RLS write policies: ${errorTableNames})` : ''}`,
      syncedCounts: counts,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to sync with Supabase: ' + (err?.message || 'Unknown error'),
      error: err?.message,
    };
  }
};

export const pullAllFromSupabase = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Could not connect to Supabase.' };
  }

  try {
    const [
      { data: products },
      { data: customers },
      { data: suppliers },
      { data: sales },
      { data: purchases },
      { data: stockMovements },
      { data: moneyReceipts },
      { data: expenses },
      { data: profiles },
      { data: appSettings },
    ] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('customers').select('*'),
      supabase.from('suppliers').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('purchases').select('*'),
      supabase.from('stock_movements').select('*'),
      supabase.from('money_receipts').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('app_settings').select('*'),
    ]);

    return {
      success: true,
      data: {
        products: products || [],
        customers: customers || [],
        suppliers: suppliers || [],
        sales: sales || [],
        purchases: purchases || [],
        stockMovements: stockMovements || [],
        moneyReceipts: moneyReceipts || [],
        expenses: expenses || [],
        profiles: profiles || [],
        appSettings: appSettings?.[0]?.settings || null,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to pull from Supabase',
    };
  }
};
