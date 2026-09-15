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
      const formattedSales = data.sales.map(s => ({
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
        status: s.status,
        payment_method: s.paymentMethod,
        godown: s.godown,
        notes: s.notes || '',
        created_by: s.salesperson,
        created_at: s.createdAt,
      }));
      const { error: saleErr } = await supabase.from('sales').upsert(formattedSales, { onConflict: 'id' });
      if (saleErr) {
        errors.push(`sales: ${saleErr.message} (code: ${saleErr.code})`);
      } else {
        counts.sales = formattedSales.length;
      }
    }

    // 6. Settings
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

    return {
      success: true,
      message: `Successfully synchronized ${totalSynced} records across tables with Supabase!${errors.length > 0 ? ` Note: ${errors.length} tables had issues.` : ''}`,
      syncedCounts: counts,
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
      { data: profiles },
    ] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('customers').select('*'),
      supabase.from('suppliers').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('profiles').select('*'),
    ]);

    return {
      success: true,
      data: {
        products: products || [],
        customers: customers || [],
        suppliers: suppliers || [],
        sales: sales || [],
        profiles: profiles || [],
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to pull from Supabase',
    };
  }
};
