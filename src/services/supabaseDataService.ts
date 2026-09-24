import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Customer,
  Supplier,
  Brand,
  CylinderProduct,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  StockMovement,
  MoneyReceipt,
  Expense,
  CustomerCylinderLedgerEntry,
  SupplierCylinderLedgerEntry,
  Delivery,
  AuditLog,
  AppSettings,
  User,
  PaymentMethod,
  AccountType
} from '../types';

// ==========================================
// 1. CUSTOMERS
// ==========================================
export const fetchCustomersFromDb = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((c: any) => ({
    id: c.id,
    code: c.customer_code || '',
    businessName: c.business_name || '',
    contactPerson: c.contact_person || '',
    phone: c.phone || '',
    altPhone: c.alternative_phone || '',
    address: c.address || '',
    area: c.area || '',
    thana: c.thana_upazila || '',
    district: c.district || 'Dhaka',
    customerType: c.customer_type || 'dealer',
    creditLimit: Number(c.credit_limit || 0),
    openingBalance: Number(c.opening_balance || 0),
    currentDue: Number(c.current_due || 0),
    bin: c.bin || '',
    notes: c.notes || '',
    status: c.status || 'active',
    createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '',
  }));
};

export const createCustomerInDb = async (c: Omit<Customer, 'id' | 'currentDue' | 'code' | 'createdAt'> & { code?: string; createdAt?: string }): Promise<Customer> => {
  const payload = {
    customer_code: c.code || `CUST-${Date.now().toString().slice(-4)}`,
    business_name: c.businessName,
    contact_person: c.contactPerson || null,
    phone: c.phone,
    alternative_phone: c.altPhone || null,
    address: c.address || null,
    area: c.area || null,
    thana_upazila: c.thana || null,
    district: c.district || 'Dhaka',
    customer_type: c.customerType || 'retailer',
    credit_limit: c.creditLimit || 0,
    opening_balance: c.openingBalance || 0,
    current_due: c.openingBalance || 0,
    bin: c.bin || null,
    notes: c.notes || null,
    status: c.status || 'active',
  };


  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    code: data.customer_code,
    businessName: data.business_name,
    contactPerson: data.contact_person || '',
    phone: data.phone,
    altPhone: data.alternative_phone || '',
    address: data.address || '',
    area: data.area || '',
    thana: data.thana_upazila || '',
    district: data.district || '',
    customerType: data.customer_type,
    creditLimit: Number(data.credit_limit || 0),
    openingBalance: Number(data.opening_balance || 0),
    currentDue: Number(data.current_due || 0),
    bin: data.bin || '',
    notes: data.notes || '',
    status: data.status,
    createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
  };
};

export const updateCustomerInDb = async (c: Customer): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .update({
      business_name: c.businessName,
      contact_person: c.contactPerson || null,
      phone: c.phone,
      alternative_phone: c.altPhone || null,
      address: c.address || null,
      area: c.area || null,
      thana_upazila: c.thana || null,
      district: c.district || 'Dhaka',
      customer_type: c.customerType,
      credit_limit: c.creditLimit,
      opening_balance: c.openingBalance,
      current_due: c.currentDue,
      bin: c.bin || null,
      notes: c.notes || null,
      status: c.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', c.id);

  if (error) throw error;
};

// ==========================================
// 2. SUPPLIERS
// ==========================================
export const fetchSuppliersFromDb = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((s: any) => ({
    id: s.id,
    code: s.supplier_code || '',
    companyName: s.company_name || '',
    contactPerson: s.contact_person || '',
    phone: s.phone || '',
    address: s.address || '',
    district: s.district || '',
    bin: s.bin || '',
    openingBalance: Number(s.opening_balance || 0),
    currentPayable: Number(s.current_payable || 0),
    creditTerms: s.credit_terms || '',
    notes: s.notes || '',
  }));
};

export const createSupplierInDb = async (s: Omit<Supplier, 'id' | 'currentPayable' | 'code'> & { code?: string }): Promise<Supplier> => {
  const payload = {
    supplier_code: s.code || `SUP-${Date.now().toString().slice(-4)}`,
    company_name: s.companyName,
    contact_person: s.contactPerson || null,
    phone: s.phone,
    address: s.address || null,
    district: s.district || null,
    bin: s.bin || null,
    opening_balance: s.openingBalance || 0,
    current_payable: s.openingBalance || 0,
    credit_terms: s.creditTerms || null,
    notes: s.notes || null,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('suppliers')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    code: data.supplier_code,
    companyName: data.company_name,
    contactPerson: data.contact_person || '',
    phone: data.phone,
    address: data.address || '',
    district: data.district || '',
    bin: data.bin || '',
    openingBalance: Number(data.opening_balance || 0),
    currentPayable: Number(data.current_payable || 0),
    creditTerms: data.credit_terms || '',
    notes: data.notes || '',
  };
};

export const updateSupplierInDb = async (s: Supplier): Promise<void> => {
  const { error } = await supabase
    .from('suppliers')
    .update({
      company_name: s.companyName,
      contact_person: s.contactPerson || null,
      phone: s.phone,
      address: s.address || null,
      district: s.district || null,
      bin: s.bin || null,
      opening_balance: s.openingBalance,
      current_payable: s.currentPayable,
      credit_terms: s.creditTerms || null,
      notes: s.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', s.id);

  if (error) throw error;
};

// ==========================================
// 3. BRANDS & PRODUCTS
// ==========================================
export const fetchBrandsFromDb = async (): Promise<Brand[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) throw error;
  if (!data) return [];

  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    code: b.code || b.name.slice(0, 4).toUpperCase(),
    color: '#0284c7',
    active: b.active ?? true,
  }));
};

export const fetchProductsFromDb = async (): Promise<CylinderProduct[]> => {
  // 1. Fetch raw products with brand
  const { data: prods, error: pErr } = await supabase
    .from('products')
    .select('*, brands(id, name, code)')
    .order('name');

  if (pErr) throw pErr;
  if (!prods) return [];

  // 2. Fetch stock movements to calculate true stock amounts
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('product_id, full_qty_change, empty_qty_change, damaged_qty_change, lost_qty_change, customer_held_qty_change');

  const stockMap: Record<string, { full: number; empty: number; damaged: number; lost: number; held: number }> = {};

  if (movements) {
    for (const m of movements) {
      const pid = m.product_id;
      if (!stockMap[pid]) {
        stockMap[pid] = { full: 0, empty: 0, damaged: 0, lost: 0, held: 0 };
      }
      stockMap[pid].full += (m.full_qty_change || 0);
      stockMap[pid].empty += (m.empty_qty_change || 0);
      stockMap[pid].damaged += (m.damaged_qty_change || 0);
      stockMap[pid].lost += (m.lost_qty_change || 0);
      stockMap[pid].held += (m.customer_held_qty_change || 0);
    }
  }

  return prods.map((p: any) => {
    const s = stockMap[p.id] || { full: 0, empty: 0, damaged: 0, lost: 0, held: 0 };
    const brandName = p.brands?.name || p.name.split(' ')[0] || 'LPG';
    const sizeStr = `${p.cylinder_size_kg || 12} KG` as any;

    return {
      id: p.id,
      brand: brandName,
      size: sizeStr,
      sku: p.sku || `${brandName.slice(0, 4)}-${p.cylinder_size_kg}`,
      category: p.cylinder_size_kg > 20 ? 'Commercial' : 'Domestic',
      purchasePrice: Number(p.purchase_price || 0),
      sellingPrice: Number(p.selling_price || 0),
      dealerPrice: Number(p.dealer_price || p.selling_price || 0),
      depositAmount: Number(p.deposit_amount || 1100),
      minStock: Number(p.minimum_stock || 10),
      minStockLevel: Number(p.minimum_stock || 10),
      active: p.active ?? true,
      fullStock: Math.max(0, s.full),
      emptyStock: Math.max(0, s.empty),
      damagedStock: Math.max(0, s.damaged),
      lostStock: Math.max(0, s.lost),
      customerHeldStock: Math.max(0, s.held),
      supplierHeldStock: 0,
      totalCylinders: Math.max(0, s.full) + Math.max(0, s.empty) + Math.max(0, s.damaged),
    };
  });
};

export const createProductInDb = async (p: Omit<CylinderProduct, 'id' | 'fullStock' | 'emptyStock' | 'damagedStock' | 'lostStock' | 'customerHeldStock' | 'supplierHeldStock'>): Promise<CylinderProduct> => {
  // Ensure brand exists or find brand_id
  let brandId: string | null = null;
  const { data: brandMatch } = await supabase
    .from('brands')
    .select('id')
    .ilike('name', p.brand)
    .limit(1)
    .maybeSingle();

  if (brandMatch) {
    brandId = brandMatch.id;
  } else {
    const { data: newBrand } = await supabase
      .from('brands')
      .insert({ name: p.brand, code: p.brand.slice(0, 4).toUpperCase() })
      .select('id')
      .single();
    if (newBrand) brandId = newBrand.id;
  }

  const sizeKg = parseFloat(p.size.replace(/[^0-9.]/g, '')) || 12;

  const payload = {
    brand_id: brandId,
    name: `${p.brand} ${p.size}`,
    cylinder_size_kg: sizeKg,
    sku: p.sku || `${p.brand.slice(0, 4)}-${sizeKg}`,
    purchase_price: p.purchasePrice,
    selling_price: p.sellingPrice,
    dealer_price: p.dealerPrice,
    deposit_amount: p.depositAmount,
    minimum_stock: p.minStock,
    active: p.active,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return {
    ...p,
    id: data.id,
    fullStock: 0,
    emptyStock: 0,
    damagedStock: 0,
    lostStock: 0,
    customerHeldStock: 0,
    supplierHeldStock: 0,
  };
};

export const updateProductInDb = async (p: CylinderProduct): Promise<void> => {
  const sizeKg = parseFloat(p.size.replace(/[^0-9.]/g, '')) || 12;
  const { error } = await supabase
    .from('products')
    .update({
      purchase_price: p.purchasePrice,
      selling_price: p.sellingPrice,
      dealer_price: p.dealerPrice,
      deposit_amount: p.depositAmount,
      minimum_stock: p.minStock,
      active: p.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', p.id);

  if (error) throw error;
};

// ==========================================
// 4. STOCK MOVEMENTS & ADJUSTMENTS
// ==========================================
export const fetchStockMovementsFromDb = async (): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*, products(id, name, cylinder_size_kg, brands(name))')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw error;
  if (!data) return [];

  return data.map((m: any) => {
    const brand = m.products?.brands?.name || 'LPG';
    const size = `${m.products?.cylinder_size_kg || 12} KG` as any;
    return {
      id: m.id,
      date: m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '',
      reference: m.reference_id || m.reference_type || 'MOV',
      movementType: m.movement_type as any,
      productId: m.product_id,
      brand,
      size,
      fullQty: m.full_qty_change || 0,
      emptyQty: m.empty_qty_change || 0,
      user: 'Store Keeper',
      notes: m.notes || '',
    };
  });
};

export const insertStockAdjustmentInDb = async (
  productId: string,
  fullDelta: number,
  emptyDelta: number,
  damagedDelta: number,
  lostDelta: number,
  reason: string,
  user?: string
): Promise<void> => {
  let movementType = 'MANUAL_ADJUSTMENT';
  if (damagedDelta > 0) movementType = 'DAMAGED';
  else if (lostDelta > 0) movementType = 'LOST';
  else if (fullDelta > 0 && emptyDelta === 0) movementType = 'RECOVERED';

  const ref = `ADJ-${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from('stock_movements').insert({
    product_id: productId,
    movement_type: movementType,
    full_qty_change: fullDelta,
    empty_qty_change: emptyDelta,
    damaged_qty_change: damagedDelta,
    lost_qty_change: lostDelta,
    reference_type: 'adjustment',
    reference_id: ref,
    notes: reason,
  });

  if (error) throw error;

  await logAuditInDb('STOCK_ADJUSTMENT', 'Inventory', ref, `Stock adjusted (Full: ${fullDelta}, Empty: ${emptyDelta}, Damaged: ${damagedDelta}, Lost: ${lostDelta}). Reason: ${reason}`);
};

export const receiveEmptyCylindersInDb = async (
  customerId: string,
  productId: string,
  qty: number,
  condition: 'Good' | 'Damaged',
  notes?: string
): Promise<void> => {
  // Call RPC receive_empty_cylinders if available, otherwise direct inserts
  const { error: rpcError } = await supabase.rpc('receive_empty_cylinders', {
    p_customer_id: customerId,
    p_product_id: productId,
    p_qty: qty,
    p_condition: condition,
    p_notes: notes || null,
  });

  if (rpcError) {
    // Fallback direct insert
    const ref = `RET-${Date.now().toString().slice(-6)}`;
    await supabase.from('customer_cylinder_ledger').insert({
      customer_id: customerId,
      product_id: productId,
      reference_type: 'direct_return',
      reference_id: ref,
      full_delivered: 0,
      empty_returned: condition === 'Good' ? qty : 0,
      damaged: condition === 'Damaged' ? qty : 0,
      balance_change: -qty,
      notes: notes || `Direct return ${qty} empty cylinders`,
    });

    await supabase.from('stock_movements').insert({
      product_id: productId,
      movement_type: condition === 'Good' ? 'CUSTOMER_EMPTY_IN' : 'DAMAGED',
      empty_qty_change: condition === 'Good' ? qty : 0,
      damaged_qty_change: condition === 'Damaged' ? qty : 0,
      customer_held_qty_change: -qty,
      reference_type: 'cylinder_return',
      reference_id: ref,
      notes: `Empty cylinder return (${condition})`,
    });
  }
};

// ==========================================
// 5. SALES & INVOICES
// ==========================================
export const fetchSalesFromDb = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*, customers(id, business_name, phone, address, customer_type), sale_items(*, products(name, cylinder_size_kg, brands(name)))')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((s: any) => {
    const items: SaleItem[] = (s.sale_items || []).map((it: any) => ({
      productId: it.product_id,
      brand: it.products?.brands?.name || 'LPG',
      size: `${it.products?.cylinder_size_kg || 12} KG` as any,
      fullQty: it.full_qty || 0,
      emptyQtyReceived: it.empty_qty_received || 0,
      unitPrice: Number(it.unit_price || 0),
      discount: Number(it.discount || 0),
      amount: Number(it.line_total || (it.full_qty * it.unit_price)),
      cylinderSettlement: 'Return Immediately',
    }));

    const totalFull = items.reduce((acc, i) => acc + i.fullQty, 0);
    const totalEmpty = items.reduce((acc, i) => acc + i.emptyQtyReceived, 0);

    return {
      id: s.id,
      invoiceNo: s.invoice_no,
      customerId: s.customer_id,
      customerName: s.customers?.business_name || 'Customer',
      customerType: s.customers?.customer_type || 'retailer',
      customerPhone: s.customers?.phone || '',
      customerAddress: s.customers?.address || '',
      salesperson: s.created_by || 'Admin',
      godown: 'Main Depot Godown',
      date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
      items,
      subtotal: Number(s.subtotal || 0),
      discount: Number(s.discount || 0),
      transportCharge: Number(s.transport_charge || 0),
      loadingCharge: Number(s.loading_charge || 0),
      otherCharge: 0,
      vatRate: 0,
      vatAmount: 0,
      grandTotal: Number(s.grand_total || 0),
      previousDue: 0,
      amountPaid: Number(s.amount_paid || 0),
      currentDue: Number(s.current_due || (s.grand_total - s.amount_paid)),
      paymentMethod: s.payment_method || 'Cash',
      status: s.payment_status === 'paid' ? 'paid' : (s.payment_status === 'partial' ? 'partial' : 'due'),
      totalFullQty: totalFull,
      totalEmptyReceived: totalEmpty,
      netCylinderDueAdded: totalFull - totalEmpty,
      notes: s.notes || '',
      createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    };
  });
};

export const createSaleInDb = async (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt' | 'status'> & { id?: string; invoiceNo?: string }): Promise<Sale> => {
  const invoiceNo = saleData.invoiceNo || `INV-2026-${Date.now().toString().slice(-6)}`;
  
  // Format items for PostgreSQL RPC create_sale_transaction
  const itemsPayload = saleData.items.map(it => ({
    product_id: it.productId,
    full_qty: it.fullQty,
    empty_qty_received: it.emptyQtyReceived,
    unit_price: it.unitPrice,
    discount: it.discount || 0,
    line_total: it.amount,
  }));

  const salePayload = {
    invoice_no: invoiceNo,
    customer_id: saleData.customerId,
    date: saleData.date,
    subtotal: saleData.subtotal,
    discount: saleData.discount,
    transport_charge: saleData.transportCharge || 0,
    loading_charge: saleData.loadingCharge || 0,
    grand_total: saleData.grandTotal,
    amount_paid: saleData.amountPaid,
    payment_method: saleData.paymentMethod,
    delivery_type: 'direct',
    notes: saleData.notes || '',
  };

  // Attempt RPC first for single atomic transaction
  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_sale_transaction', {
    p_sale: salePayload,
    p_items: itemsPayload,
    p_allow_negative_stock: true, // Controlled override
  });

  let createdId = saleData.id || `sale-${Date.now()}`;

  if (rpcError) {
    console.warn('RPC create_sale_transaction error, falling back to sequential database inserts:', rpcError.message);
    
    // Direct Insert into sales table
    const saleInsertPayload: any = {
      invoice_no: invoiceNo,
      customer_id: saleData.customerId,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      transport_charge: saleData.transportCharge || 0,
      loading_charge: saleData.loadingCharge || 0,
      grand_total: saleData.grandTotal,
      amount_paid: saleData.amountPaid,
      current_due: saleData.grandTotal - saleData.amountPaid,
      payment_status: saleData.amountPaid >= saleData.grandTotal ? 'paid' : (saleData.amountPaid > 0 ? 'partial' : 'due'),
      sale_status: 'completed',
      payment_method: saleData.paymentMethod,
      notes: saleData.notes || '',
    };
    if (saleData.date) {
      saleInsertPayload.date = saleData.date;
    }

    let insertedSale: any = null;
    let sErr: any = null;

    const firstTry = await supabase
      .from('sales')
      .insert(saleInsertPayload)
      .select('id')
      .single();

    if (firstTry.error && firstTry.error.message?.includes("'date'")) {
      delete saleInsertPayload.date;
      const retry = await supabase
        .from('sales')
        .insert(saleInsertPayload)
        .select('id')
        .single();
      insertedSale = retry.data;
      sErr = retry.error;
    } else {
      insertedSale = firstTry.data;
      sErr = firstTry.error;
    }

    if (sErr) throw sErr;
    createdId = insertedSale.id;

    // Insert sale_items
    for (const it of saleData.items) {
      await supabase.from('sale_items').insert({
        sale_id: createdId,
        product_id: it.productId,
        full_qty: it.fullQty,
        empty_qty_received: it.emptyQtyReceived,
        unit_price: it.unitPrice,
        discount: it.discount || 0,
        line_total: it.amount,
      });

      // Stock movements
      if (it.fullQty > 0) {
        await supabase.from('stock_movements').insert({
          product_id: it.productId,
          movement_type: 'SALE_FULL_OUT',
          full_qty_change: -it.fullQty,
          customer_held_qty_change: it.fullQty,
          reference_type: 'sale',
          reference_id: invoiceNo,
          notes: `Delivered to ${saleData.customerName}`,
        });
      }
      if (it.emptyQtyReceived > 0) {
        await supabase.from('stock_movements').insert({
          product_id: it.productId,
          movement_type: 'CUSTOMER_EMPTY_IN',
          empty_qty_change: it.emptyQtyReceived,
          customer_held_qty_change: -it.emptyQtyReceived,
          reference_type: 'sale',
          reference_id: invoiceNo,
          notes: `Empty return from ${saleData.customerName}`,
        });
      }

      // Customer cylinder ledger
      await supabase.from('customer_cylinder_ledger').insert({
        customer_id: saleData.customerId,
        product_id: it.productId,
        reference_type: 'sale',
        reference_id: invoiceNo,
        full_delivered: it.fullQty,
        empty_returned: it.emptyQtyReceived,
        balance_change: it.fullQty - it.emptyQtyReceived,
        notes: `Invoice ${invoiceNo}`,
      });
    }

    // Customer financial due
    const unpaid = saleData.grandTotal - saleData.amountPaid;
    if (unpaid > 0) {
      const { data: cust } = await supabase.from('customers').select('current_due').eq('id', saleData.customerId).single();
      const newDue = (cust?.current_due || 0) + unpaid;
      await supabase.from('customers').update({ current_due: newDue }).eq('id', saleData.customerId);
    }

    // If money received, create customer payment
    if (saleData.amountPaid > 0) {
      const mrNo = `MR-2026-${Date.now().toString().slice(-6)}`;
      await supabase.from('customer_payments').insert({
        receipt_no: mrNo,
        customer_id: saleData.customerId,
        sale_id: createdId,
        amount: saleData.amountPaid,
        method: saleData.paymentMethod === 'Bank Transfer' ? 'Bank' : (saleData.paymentMethod as any),
        reference: invoiceNo,
        notes: `Payment on sale ${invoiceNo}`,
      });
    }

    // Log audit
    await logAuditInDb('CREATE_SALE', 'Sales', invoiceNo, `Created sale for ${saleData.customerName} - ৳${saleData.grandTotal.toLocaleString()}`);
  } else if (rpcResult?.id) {
    createdId = rpcResult.id;
  }

  return {
    ...saleData,
    id: createdId,
    invoiceNo,
    status: saleData.amountPaid >= saleData.grandTotal ? 'paid' : (saleData.amountPaid > 0 ? 'partial' : 'due'),
    createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
};

export const cancelSaleInDb = async (saleId: string, reason: string): Promise<void> => {
  const { error } = await supabase
    .from('sales')
    .update({ sale_status: 'cancelled', notes: `CANCELLED: ${reason}` })
    .eq('id', saleId);

  if (error) throw error;
  await logAuditInDb('CANCEL_SALE', 'Sales', saleId, `Cancelled sale ${saleId}. Reason: ${reason}`);
};

// ==========================================
// 6. PURCHASES
// ==========================================
export const fetchPurchasesFromDb = async (): Promise<Purchase[]> => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*, suppliers(id, company_name, phone), purchase_items(*, products(name, cylinder_size_kg, brands(name)))')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((p: any) => {
    const items: PurchaseItem[] = (p.purchase_items || []).map((it: any) => ({
      id: it.id,
      productId: it.product_id,
      brand: it.products?.brands?.name || 'LPG',
      size: `${it.products?.cylinder_size_kg || 12} KG` as any,
      fullQtyReceived: it.full_qty_received || 0,
      emptyQtySent: it.empty_qty_sent || 0,
      unitCost: Number(it.unit_price || 0),
      unitPurchasePrice: Number(it.unit_price || 0),
      amount: Number(it.line_total || 0),
    }));

    const totalFull = items.reduce((acc: number, i: any) => acc + i.fullQtyReceived, 0);
    const totalEmpty = items.reduce((acc: number, i: any) => acc + i.emptyQtySent, 0);

    return {
      id: p.id,
      purchaseNo: p.purchase_no,
      supplierId: p.supplier_id,
      supplierName: p.suppliers?.company_name || 'Supplier',
      supplierInvoiceRef: p.supplier_reference || '',
      godown: 'Main Depot Godown',
      date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
      items,
      subtotal: Number(p.subtotal || 0),
      transportCost: Number(p.transport_cost || 0),
      loadingCost: Number(p.loading_cost || 0),
      otherExpense: 0,
      grandTotal: Number(p.grand_total || 0),
      paidAmount: Number(p.amount_paid || 0),
      dueAmount: Number(p.due_amount || 0),
      paymentMethod: p.payment_method || 'Cash',
      status: p.amount_paid >= p.grand_total ? 'paid' : (p.amount_paid > 0 ? 'partial' : 'due'),
      totalFullReceived: totalFull,
      totalEmptySent: totalEmpty,
      netSupplierCylinderDue: totalFull - totalEmpty,
      notes: '',
      createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    };
  });
};

export const createPurchaseInDb = async (purchaseData: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt' | 'status'>): Promise<Purchase> => {
  const purchaseNo = `PUR-2026-${Date.now().toString().slice(-6)}`;
  
  const itemsPayload = purchaseData.items.map(it => ({
    product_id: it.productId,
    full_qty_received: it.fullQtyReceived,
    empty_qty_sent: it.emptyQtySent,
    unit_price: it.unitCost || it.unitPurchasePrice || 0,
    line_total: it.amount,
  }));

  const purchasePayload = {
    purchase_no: purchaseNo,
    supplier_id: purchaseData.supplierId,
    supplier_reference: purchaseData.supplierInvoiceRef,
    date: purchaseData.date,
    subtotal: purchaseData.subtotal,
    transport_cost: purchaseData.transportCost,
    loading_cost: purchaseData.loadingCost,
    grand_total: purchaseData.grandTotal,
    amount_paid: purchaseData.paidAmount,
    payment_method: purchaseData.paymentMethod,
  };

  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_purchase_transaction', {
    p_purchase: purchasePayload,
    p_items: itemsPayload,
  });

  let createdId = `pur-${Date.now()}`;

  if (rpcError) {
    console.warn('RPC create_purchase_transaction error, falling back to direct inserts:', rpcError.message);
    const purchaseInsertPayload: any = {
      purchase_no: purchaseNo,
      supplier_id: purchaseData.supplierId,
      supplier_reference: purchaseData.supplierInvoiceRef,
      subtotal: purchaseData.subtotal,
      transport_cost: purchaseData.transportCost,
      loading_cost: purchaseData.loadingCost,
      grand_total: purchaseData.grandTotal,
      amount_paid: purchaseData.paidAmount,
      due_amount: purchaseData.dueAmount,
      payment_method: purchaseData.paymentMethod,
      status: 'received',
    };
    if (purchaseData.date) {
      purchaseInsertPayload.date = purchaseData.date;
    }

    let ins: any = null;
    let pErr: any = null;

    const firstTry = await supabase
      .from('purchases')
      .insert(purchaseInsertPayload)
      .select('id')
      .single();

    if (firstTry.error && firstTry.error.message?.includes("'date'")) {
      delete purchaseInsertPayload.date;
      const retry = await supabase
        .from('purchases')
        .insert(purchaseInsertPayload)
        .select('id')
        .single();
      ins = retry.data;
      pErr = retry.error;
    } else {
      ins = firstTry.data;
      pErr = firstTry.error;
    }

    if (pErr) throw pErr;
    createdId = ins.id;

    for (const it of purchaseData.items) {
      await supabase.from('purchase_items').insert({
        purchase_id: createdId,
        product_id: it.productId,
        full_qty_received: it.fullQtyReceived,
        empty_qty_sent: it.emptyQtySent,
        unit_price: it.unitCost || it.unitPurchasePrice || 0,
        line_total: it.amount,
      });

      if (it.fullQtyReceived > 0) {
        await supabase.from('stock_movements').insert({
          product_id: it.productId,
          movement_type: 'PURCHASE_FULL_IN',
          full_qty_change: it.fullQtyReceived,
          reference_type: 'purchase',
          reference_id: purchaseNo,
          notes: `Received from ${purchaseData.supplierName}`,
        });
      }
      if (it.emptyQtySent > 0) {
        await supabase.from('stock_movements').insert({
          product_id: it.productId,
          movement_type: 'EMPTY_SENT_TO_SUPPLIER',
          empty_qty_change: -it.emptyQtySent,
          reference_type: 'purchase',
          reference_id: purchaseNo,
          notes: `Empties sent to ${purchaseData.supplierName}`,
        });
      }
    }

    if (purchaseData.dueAmount > 0) {
      const { data: sup } = await supabase.from('suppliers').select('current_payable').eq('id', purchaseData.supplierId).single();
      const newPayable = (sup?.current_payable || 0) + purchaseData.dueAmount;
      await supabase.from('suppliers').update({ current_payable: newPayable }).eq('id', purchaseData.supplierId);
    }
  } else if (rpcResult?.id) {
    createdId = rpcResult.id;
  }

  await logAuditInDb('CREATE_PURCHASE', 'Purchase', purchaseNo, `Recorded purchase from ${purchaseData.supplierName} - ৳${purchaseData.grandTotal.toLocaleString()}`);

  return {
    ...purchaseData,
    id: createdId,
    purchaseNo,
    status: purchaseData.paidAmount >= purchaseData.grandTotal ? 'paid' : (purchaseData.paidAmount > 0 ? 'partial' : 'due'),
    createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
};

// ==========================================
// 7. PAYMENTS & FINANCIAL TRANSACTIONS
// ==========================================
export const fetchCustomerPaymentsFromDb = async (): Promise<MoneyReceipt[]> => {
  const { data, error } = await supabase
    .from('customer_payments')
    .select('*, customers(business_name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((cp: any) => ({
    id: cp.id,
    receiptNo: cp.receipt_no,
    customerId: cp.customer_id,
    customerName: cp.customers?.business_name || 'Customer',
    date: cp.payment_date ? new Date(cp.payment_date).toISOString().split('T')[0] : '',
    amount: Number(cp.amount || 0),
    paymentMethod: cp.method as any,
    account: (cp.account || 'Cash in Hand') as any,
    notes: cp.notes || '',
    transactionRef: cp.reference || '',
  }));
};

export const createCustomerPaymentInDb = async (data: {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  account: AccountType;
  notes?: string;
  transactionRef?: string;
}): Promise<MoneyReceipt> => {
  const { data: rpcResult, error: rpcError } = await supabase.rpc('receive_customer_payment', {
    p_customer_id: data.customerId,
    p_amount: data.amount,
    p_method: data.paymentMethod,
    p_account: data.account,
    p_notes: data.notes || null,
    p_reference: data.transactionRef || null,
  });

  const receiptNo = rpcResult?.receipt_no || `MR-2026-${Date.now().toString().slice(-6)}`;
  const paymentId = rpcResult?.id || `cp-${Date.now()}`;

  if (rpcError) {
    const { data: ins, error: insErr } = await supabase
      .from('customer_payments')
      .insert({
        receipt_no: receiptNo,
        customer_id: data.customerId,
        amount: data.amount,
        method: data.paymentMethod === 'Bank Transfer' ? 'Bank' : (data.paymentMethod as any),
        account: data.account,
        notes: data.notes || '',
        reference: data.transactionRef || '',
      })
      .select('id')
      .single();

    if (insErr) throw insErr;

    // Decrease customer current_due
    const { data: cust } = await supabase.from('customers').select('current_due, business_name').eq('id', data.customerId).single();
    if (cust) {
      const updatedDue = Math.max(0, (cust.current_due || 0) - data.amount);
      await supabase.from('customers').update({ current_due: updatedDue }).eq('id', data.customerId);
    }
  }

  await logAuditInDb('RECEIVE_PAYMENT', 'Accounts', receiptNo, `Received ৳${data.amount.toLocaleString()} via ${data.paymentMethod} into ${data.account}`);

  return {
    id: paymentId,
    receiptNo,
    customerId: data.customerId,
    customerName: 'Customer',
    date: new Date().toISOString().split('T')[0],
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    account: data.account,
    notes: data.notes || '',
    transactionRef: data.transactionRef || '',
  };
};

export const makeSupplierPaymentInDb = async (data: {
  supplierId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  account: AccountType;
  notes?: string;
  transactionRef?: string;
}): Promise<void> => {
  const voucherNo = `PV-2026-${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from('supplier_payments').insert({
    voucher_no: voucherNo,
    supplier_id: data.supplierId,
    amount: data.amount,
    method: data.paymentMethod === 'Bank Transfer' ? 'Bank' : (data.paymentMethod as any),
    account: data.account,
    notes: data.notes || '',
    reference: data.transactionRef || '',
  });

  if (error) throw error;

  // Decrease supplier current_payable
  const { data: sup } = await supabase.from('suppliers').select('current_payable, company_name').eq('id', data.supplierId).single();
  if (sup) {
    const updatedPayable = Math.max(0, (sup.current_payable || 0) - data.amount);
    await supabase.from('suppliers').update({ current_payable: updatedPayable }).eq('id', data.supplierId);
  }

  await logAuditInDb('SUPPLIER_PAYMENT', 'Accounts', voucherNo, `Paid ৳${data.amount.toLocaleString()} to ${sup?.company_name || 'Supplier'} via ${data.paymentMethod}`);
};

// ==========================================
// 8. EXPENSES
// ==========================================
export const fetchExpensesFromDb = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((e: any) => ({
    id: e.id,
    voucherNo: e.voucher_no,
    category: e.category,
    amount: Number(e.amount || 0),
    paymentAccount: (e.paid_from || 'Cash in Hand') as any,
    date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
    description: e.description || e.notes || '',
    enteredBy: 'Staff',
  }));
};

export const createExpenseInDb = async (data: Omit<Expense, 'id' | 'voucherNo'>): Promise<Expense> => {
  const voucherNo = `EXP-2026-${Date.now().toString().slice(-5)}`;

  const { data: ins, error } = await supabase
    .from('expenses')
    .insert({
      voucher_no: voucherNo,
      date: data.date,
      category: data.category,
      amount: data.amount,
      paid_from: data.paymentAccount,
      description: data.description,
    })
    .select('id')
    .single();

  if (error) throw error;

  await logAuditInDb('CREATE_EXPENSE', 'Accounts', voucherNo, `Expense: ${data.category} - ৳${data.amount.toLocaleString()}`);

  return {
    ...data,
    id: ins.id,
    voucherNo,
  };
};

// ==========================================
// 9. CYLINDER LEDGERS
// ==========================================
export const fetchCustomerCylinderLedgerFromDb = async (customerId?: string): Promise<CustomerCylinderLedgerEntry[]> => {
  let query = supabase
    .from('customer_cylinder_ledger')
    .select('*, customers(business_name), products(name, cylinder_size_kg, brands(name))')
    .order('created_at', { ascending: false });

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  return data.map((l: any) => ({
    id: l.id,
    date: l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '',
    customerId: l.customer_id,
    customerName: l.customers?.business_name || 'Customer',
    reference: l.reference_id || l.reference_type || 'CCL',
    productId: l.product_id,
    brand: l.products?.brands?.name || 'LPG',
    size: `${l.products?.cylinder_size_kg || 12} KG` as any,
    fullDelivered: l.full_delivered || 0,
    emptyReturned: l.empty_returned || 0,
    damaged: l.damaged || 0,
    balanceCylinders: l.balance_change || (l.full_delivered - l.empty_returned),
    notes: l.notes || '',
  }));
};

// ==========================================
// 10. DELIVERIES
// ==========================================
export const fetchDeliveriesFromDb = async (): Promise<Delivery[]> => {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*, customers(business_name, address, phone), sales(invoice_no)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((d: any) => ({
    id: d.id,
    deliveryNo: d.delivery_no,
    invoiceNo: d.sales?.invoice_no || '',
    saleId: d.sale_id || '',
    customerId: d.customer_id,
    customerName: d.customers?.business_name || 'Customer',
    area: d.area || 'Metro Area',
    address: d.address || d.customers?.address || '',
    vehicleNo: d.vehicle_no || 'Tata 407 (Metro-TA-11-1234)',
    driverName: d.driver_name || 'Rafiqul Islam',
    driverPhone: d.driver_phone || '01719-556677',
    totalQty: d.total_qty || 0,
    emptyToCollect: d.empty_to_collect || 0,
    amount: Number(d.amount || 0),
    status: d.status || 'pending',
    deliveryDate: d.delivery_date ? new Date(d.delivery_date).toISOString().split('T')[0] : '',
    expenses: [],
  }));
};

export const updateDeliveryStatusInDb = async (deliveryId: string, status: Delivery['status']): Promise<void> => {
  const { error } = await supabase
    .from('deliveries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', deliveryId);

  if (error) throw error;
  await logAuditInDb('UPDATE_DELIVERY', 'Deliveries', deliveryId, `Updated delivery status to ${status}`);
};

// ==========================================
// 11. AUDIT LOGS
// ==========================================
export const fetchAuditLogsFromDb = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  if (!data) return [];

  return data.map((a: any) => ({
    id: a.id,
    timestamp: a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '',
    user: a.user_name || 'System / Staff',
    action: a.action,
    module: a.module,
    reference: a.reference_id || a.reference_type || '',
    details: a.details || '',
  }));
};

export const logAuditInDb = async (action: string, module: string, reference: string, details: string): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert({
      action,
      module,
      reference_id: reference,
      reference_type: module.toLowerCase(),
      details,
    });
  } catch (err) {
    console.warn('Audit logging skipped or failed:', err);
  }
};

// ==========================================
// 12. SETTINGS
// ==========================================
export const fetchSettingsFromDb = async (): Promise<AppSettings | null> => {
  // Try 'settings' table first
  let { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  // If 'settings' is not found, fallback to 'app_settings'
  if (error || !data) {
    const fallback = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (fallback.data?.settings) {
      return fallback.data.settings as AppSettings;
    }
    if (!fallback.error && fallback.data) {
      data = fallback.data;
    }
  }

  if (!data) return null;

  if (data.settings && typeof data.settings === 'object') {
    return data.settings as AppSettings;
  }

  return {
    profile: {
      businessName: data.business_name || 'Rahman LPG Distribution',
      ownerName: data.owner_name || 'Al-Haj Mizanur Rahman',
      phone: data.phone || '01711-889900',
      email: data.email || 'info@rahmanlpg.com',
      address: data.address || 'Plot 14, Main Road, Block-D',
      area: data.area || 'Mohammadpur',
      thana: data.thana || 'Mohammadpur',
      district: data.district || 'Dhaka',
      bin: data.bin || '001234567-0101',
      tradeLicense: data.trade_license || 'TRAD/DNCC/045812/2024',
      tin: data.tin || '7845-1234-9876',
    },
    invoicePrefix: data.invoice_prefix || 'INV-2026-',
    purchasePrefix: data.purchase_prefix || 'PUR-2026-',
    receiptPrefix: data.receipt_prefix || 'MR-2026-',
    voucherPrefix: data.voucher_prefix || 'PV-2026-',
    challanPrefix: data.challan_prefix || 'DC-2026-',
    footerText: data.footer_text || 'Thank you for choosing Rahman LPG Distribution.',
    currencySymbol: data.currency_symbol || '৳',
    timezone: data.timezone || 'Asia/Dhaka',
    vatModeEnabled: Boolean(data.vat_mode_enabled),
    vatRatePercent: Number(data.vat_rate || 7.5),
    mushakPrefix: data.mushak_prefix || 'MUS-6.3-',
    defaultInvoiceFormat: 'a4',
    creditLimitWarningPercent: 80,
    financialYear: '2026-2027 (July - June)',
    lastBackupTime: 'Today, 08:30 PM',
  };
};

export const updateSettingsInDb = async (s: Partial<AppSettings>): Promise<void> => {
  // Always update app_settings which exists in the database
  try {
    await supabase
      .from('app_settings')
      .upsert({ id: 'primary', settings: s, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('app_settings save error:', err);
  }

  // Also attempt settings table
  try {
    const payload: any = {};
    if (s.profile?.businessName) payload.business_name = s.profile.businessName;
    if (s.profile?.ownerName) payload.owner_name = s.profile.ownerName;
    if (s.profile?.phone) payload.phone = s.profile.phone;
    if (s.profile?.email) payload.email = s.profile.email;
    if (s.profile?.address) payload.address = s.profile.address;
    if (s.profile?.bin) payload.bin = s.profile.bin;
    if (s.vatRatePercent !== undefined) payload.vat_rate = s.vatRatePercent;
    if (s.currencySymbol) payload.currency_symbol = s.currencySymbol;
    if (s.invoicePrefix) payload.invoice_prefix = s.invoicePrefix;
    if (s.purchasePrefix) payload.purchase_prefix = s.purchasePrefix;
    if (s.receiptPrefix) payload.receipt_prefix = s.receiptPrefix;
    if (s.voucherPrefix) payload.voucher_prefix = s.voucherPrefix;
    if (s.challanPrefix) payload.challan_prefix = s.challanPrefix;
    if (s.footerText) payload.footer_text = s.footerText;
    payload.updated_at = new Date().toISOString();

    await supabase
      .from('settings')
      .upsert({ id: 'app_config', ...payload });
  } catch {
    // Ignore if table doesn't exist yet
  }
};

// ==========================================
// 13. PROFILES / USERS
// ==========================================
export const fetchProfilesFromDb = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  if (error) throw error;
  if (!data) return [];

  return data.map((p: any) => ({
    id: p.id,
    name: p.full_name || 'Staff Member',
    email: p.username ? `${p.username}@almadinalpg.com` : 'staff@almadinalpg.com',
    role: p.role as any,
    phone: p.phone || '',
    username: p.username || '',
    status: p.status || 'active',
    lastLogin: p.last_login ? new Date(p.last_login).toLocaleDateString('en-GB') : 'Recently',
  }));
};
