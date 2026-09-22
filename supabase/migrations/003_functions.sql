-- ====================================================================
-- 003_functions.sql
-- LPG Distribution Management: Atomic Database Functions & Sequences
-- ====================================================================

-- 1. Sequences for safe concurrent reference numbering
CREATE SEQUENCE IF NOT EXISTS seq_invoice_no START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS seq_purchase_no START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS seq_receipt_no START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS seq_voucher_no START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS seq_delivery_no START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS seq_expense_no START WITH 1001;

-- Generator function
CREATE OR REPLACE FUNCTION public.generate_document_number(p_prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_num BIGINT;
BEGIN
  IF p_prefix = 'INV' THEN
    v_num := NEXTVAL('seq_invoice_no');
  ELSIF p_prefix = 'PUR' THEN
    v_num := NEXTVAL('seq_purchase_no');
  ELSIF p_prefix = 'MR' THEN
    v_num := NEXTVAL('seq_receipt_no');
  ELSIF p_prefix = 'PV' THEN
    v_num := NEXTVAL('seq_voucher_no');
  ELSIF p_prefix = 'DC' OR p_prefix = 'DEL' THEN
    v_num := NEXTVAL('seq_delivery_no');
  ELSIF p_prefix = 'EXP' THEN
    v_num := NEXTVAL('seq_expense_no');
  ELSE
    v_num := FLOOR(EXTRACT(EPOCH FROM NOW()));
  END IF;

  RETURN p_prefix || '-' || v_year || '-' || LPAD(v_num::TEXT, 6, '0');
END;
$$;

-- 2. Check stock function (to prevent negative stock)
CREATE OR REPLACE FUNCTION public.get_available_full_stock(p_product_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_full INTEGER;
BEGIN
  SELECT COALESCE(SUM(full_qty_change), 0)
  INTO v_full
  FROM public.stock_movements
  WHERE product_id = p_product_id;

  RETURN COALESCE(v_full, 0);
END;
$$;

-- 3. CREATE SALE TRANSACTION (Atomic RPC)
CREATE OR REPLACE FUNCTION public.create_sale_transaction(
  p_sale JSONB,
  p_items JSONB,
  p_allow_negative_stock BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sale_id UUID := gen_random_uuid();
  v_invoice_no TEXT;
  v_customer_id UUID;
  v_customer_record RECORD;
  v_subtotal NUMERIC(12, 2);
  v_discount NUMERIC(12, 2);
  v_grand_total NUMERIC(12, 2);
  v_amount_paid NUMERIC(12, 2);
  v_due_amount NUMERIC(12, 2);
  v_payment_status TEXT;
  v_item JSONB;
  v_prod_id UUID;
  v_full_qty INTEGER;
  v_empty_qty INTEGER;
  v_unit_price NUMERIC(12, 2);
  v_line_total NUMERIC(12, 2);
  v_avail_stock INTEGER;
  v_user_id UUID := auth.uid();
  v_user_role TEXT := public.get_current_user_role();
  v_receipt_no TEXT;
  v_delivery_no TEXT;
  v_total_full_qty INTEGER := 0;
  v_total_empty_qty INTEGER := 0;
BEGIN
  -- Customer verification
  v_customer_id := (p_sale->>'customer_id')::UUID;
  SELECT * INTO v_customer_record FROM public.customers WHERE id = v_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found with id %', v_customer_id;
  END IF;

  -- Generate invoice number
  v_invoice_no := COALESCE(p_sale->>'invoice_no', public.generate_document_number('INV'));

  -- Calculate financial totals
  v_subtotal := COALESCE((p_sale->>'subtotal')::NUMERIC, 0);
  v_discount := COALESCE((p_sale->>'discount')::NUMERIC, 0);
  v_grand_total := COALESCE((p_sale->>'grand_total')::NUMERIC, v_subtotal - v_discount);
  v_amount_paid := COALESCE((p_sale->>'amount_paid')::NUMERIC, 0);
  v_due_amount := v_grand_total - v_amount_paid;

  IF v_amount_paid >= v_grand_total THEN
    v_payment_status := 'paid';
  ELSIF v_amount_paid > 0 THEN
    v_payment_status := 'partial';
  ELSE
    v_payment_status := 'due';
  END IF;

  -- 1. Verify Stock for every item (Prevent negative stock)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := (v_item->>'product_id')::UUID;
    v_full_qty := COALESCE((v_item->>'full_qty')::INTEGER, 0);
    v_empty_qty := COALESCE((v_item->>'empty_qty_received')::INTEGER, 0);
    v_total_full_qty := v_total_full_qty + v_full_qty;
    v_total_empty_qty := v_total_empty_qty + v_empty_qty;

    IF v_full_qty > 0 THEN
      v_avail_stock := public.get_available_full_stock(v_prod_id);
      IF v_avail_stock < v_full_qty AND NOT p_allow_negative_stock THEN
        IF v_user_role NOT IN ('owner', 'admin', 'manager') THEN
          RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', v_prod_id, v_avail_stock, v_full_qty;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- 2. Insert into Sales
  INSERT INTO public.sales (
    id, invoice_no, date, customer_id, warehouse_id, salesperson_id,
    subtotal, discount, transport_charge, loading_charge, other_charge, vat,
    grand_total, previous_due, amount_paid, current_due,
    payment_status, sale_status, payment_method, account, delivery_type, notes
  ) VALUES (
    v_sale_id,
    v_invoice_no,
    COALESCE((p_sale->>'date')::DATE, CURRENT_DATE),
    v_customer_id,
    (p_sale->>'warehouse_id')::UUID,
    COALESCE((p_sale->>'salesperson_id')::UUID, v_user_id),
    v_subtotal,
    v_discount,
    COALESCE((p_sale->>'transport_charge')::NUMERIC, 0),
    COALESCE((p_sale->>'loading_charge')::NUMERIC, 0),
    COALESCE((p_sale->>'other_charge')::NUMERIC, 0),
    COALESCE((p_sale->>'vat')::NUMERIC, 0),
    v_grand_total,
    v_customer_record.current_due,
    v_amount_paid,
    v_due_amount,
    v_payment_status,
    'completed',
    COALESCE(p_sale->>'payment_method', 'Cash'),
    COALESCE(p_sale->>'account', 'Cash in Hand'),
    COALESCE(p_sale->>'delivery_type', 'direct'),
    p_sale->>'notes'
  );

  -- 3. Insert Sale Items, Stock Movements & Cylinder Ledger
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := (v_item->>'product_id')::UUID;
    v_full_qty := COALESCE((v_item->>'full_qty')::INTEGER, 0);
    v_empty_qty := COALESCE((v_item->>'empty_qty_received')::INTEGER, 0);
    v_unit_price := COALESCE((v_item->>'unit_price')::NUMERIC, 0);
    v_line_total := COALESCE((v_item->>'line_total')::NUMERIC, v_full_qty * v_unit_price);

    -- Insert sale item
    INSERT INTO public.sale_items (
      sale_id, product_id, full_qty, empty_qty_received, unit_price, discount, line_total
    ) VALUES (
      v_sale_id, v_prod_id, v_full_qty, v_empty_qty, v_unit_price,
      COALESCE((v_item->>'discount')::NUMERIC, 0), v_line_total
    );

    -- Full out stock movement
    IF v_full_qty > 0 THEN
      INSERT INTO public.stock_movements (
        product_id, movement_type, full_qty_change, customer_held_qty_change,
        reference_type, reference_id, notes, created_by
      ) VALUES (
        v_prod_id, 'SALE_FULL_OUT', -v_full_qty, v_full_qty,
        'sale', v_invoice_no, 'Delivered to ' || v_customer_record.business_name, v_user_id
      );
    END IF;

    -- Empty in stock movement
    IF v_empty_qty > 0 THEN
      INSERT INTO public.stock_movements (
        product_id, movement_type, empty_qty_change, customer_held_qty_change,
        reference_type, reference_id, notes, created_by
      ) VALUES (
        v_prod_id, 'CUSTOMER_EMPTY_IN', v_empty_qty, -v_empty_qty,
        'sale', v_invoice_no, 'Empty return from ' || v_customer_record.business_name, v_user_id
      );
    END IF;

    -- Customer Cylinder Ledger entry
    INSERT INTO public.customer_cylinder_ledger (
      customer_id, product_id, reference_type, reference_id,
      full_delivered, empty_returned, balance_change, notes
    ) VALUES (
      v_customer_id, v_prod_id, 'sale', v_invoice_no,
      v_full_qty, v_empty_qty, (v_full_qty - v_empty_qty),
      'Invoice ' || v_invoice_no || ': ' || v_full_qty || ' full delivered, ' || v_empty_qty || ' empty returned'
    );
  END LOOP;

  -- 4. Update Customer Financial Due
  UPDATE public.customers
  SET current_due = current_due + v_due_amount,
      updated_at = NOW()
  WHERE id = v_customer_id;

  -- 5. If amount paid > 0, create payment receipt entry
  IF v_amount_paid > 0 THEN
    v_receipt_no := public.generate_document_number('MR');
    INSERT INTO public.customer_payments (
      receipt_no, customer_id, sale_id, amount, payment_date,
      method, account, reference, notes, received_by
    ) VALUES (
      v_receipt_no, v_customer_id, v_sale_id, v_amount_paid,
      COALESCE((p_sale->>'date')::DATE, CURRENT_DATE),
      COALESCE(p_sale->>'payment_method', 'Cash'),
      COALESCE(p_sale->>'account', 'Cash in Hand'),
      v_invoice_no,
      'Payment collected at time of sale ' || v_invoice_no,
      v_user_id
    );
  END IF;

  -- 6. Create Delivery Challan
  v_delivery_no := public.generate_document_number('DC');
  INSERT INTO public.deliveries (
    delivery_no, sale_id, customer_id,
    address, area, total_qty, empty_to_collect, amount,
    status, delivery_date, notes
  ) VALUES (
    v_delivery_no, v_sale_id, v_customer_id,
    v_customer_record.address, v_customer_record.area,
    v_total_full_qty, v_total_empty_qty, v_grand_total,
    'pending', COALESCE((p_sale->>'date')::DATE, CURRENT_DATE),
    'Auto challan for sale ' || v_invoice_no
  );

  -- 7. Audit Log
  INSERT INTO public.audit_logs (
    user_id, action, module, reference_type, reference_id, details
  ) VALUES (
    v_user_id, 'CREATE_SALE', 'Sales', 'sale', v_invoice_no,
    'Created sale for ' || v_customer_record.business_name || ' - Total: ৳' || v_grand_total || ' (' || v_total_full_qty || ' full, ' || v_total_empty_qty || ' empty returned)'
  );

  RETURN jsonb_build_object(
    'id', v_sale_id,
    'invoice_no', v_invoice_no,
    'grand_total', v_grand_total,
    'amount_paid', v_amount_paid,
    'current_due', v_due_amount,
    'payment_status', v_payment_status,
    'delivery_no', v_delivery_no
  );
END;
$$;

-- 4. CREATE PURCHASE TRANSACTION (Atomic RPC)
CREATE OR REPLACE FUNCTION public.create_purchase_transaction(
  p_purchase JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase_id UUID := gen_random_uuid();
  v_purchase_no TEXT;
  v_supplier_id UUID;
  v_supplier_record RECORD;
  v_subtotal NUMERIC(12, 2);
  v_discount NUMERIC(12, 2);
  v_grand_total NUMERIC(12, 2);
  v_amount_paid NUMERIC(12, 2);
  v_due_amount NUMERIC(12, 2);
  v_item JSONB;
  v_prod_id UUID;
  v_full_qty INTEGER;
  v_empty_qty INTEGER;
  v_unit_price NUMERIC(12, 2);
  v_line_total NUMERIC(12, 2);
  v_user_id UUID := auth.uid();
  v_voucher_no TEXT;
BEGIN
  v_supplier_id := (p_purchase->>'supplier_id')::UUID;
  SELECT * INTO v_supplier_record FROM public.suppliers WHERE id = v_supplier_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Supplier not found with id %', v_supplier_id;
  END IF;

  v_purchase_no := COALESCE(p_purchase->>'purchase_no', public.generate_document_number('PUR'));

  v_subtotal := COALESCE((p_purchase->>'subtotal')::NUMERIC, 0);
  v_discount := COALESCE((p_purchase->>'discount')::NUMERIC, 0);
  v_grand_total := COALESCE((p_purchase->>'grand_total')::NUMERIC, v_subtotal - v_discount);
  v_amount_paid := COALESCE((p_purchase->>'amount_paid')::NUMERIC, 0);
  v_due_amount := v_grand_total - v_amount_paid;

  -- 1. Insert Purchase
  INSERT INTO public.purchases (
    id, purchase_no, supplier_id, date, supplier_reference, warehouse_id,
    subtotal, discount, transport_cost, loading_cost, unloading_cost, other_cost,
    grand_total, amount_paid, due_amount, payment_method, status, created_by
  ) VALUES (
    v_purchase_id,
    v_purchase_no,
    v_supplier_id,
    COALESCE((p_purchase->>'date')::DATE, CURRENT_DATE),
    p_purchase->>'supplier_reference',
    (p_purchase->>'warehouse_id')::UUID,
    v_subtotal,
    v_discount,
    COALESCE((p_purchase->>'transport_cost')::NUMERIC, 0),
    COALESCE((p_purchase->>'loading_cost')::NUMERIC, 0),
    COALESCE((p_purchase->>'unloading_cost')::NUMERIC, 0),
    COALESCE((p_purchase->>'other_cost')::NUMERIC, 0),
    v_grand_total,
    v_amount_paid,
    v_due_amount,
    COALESCE(p_purchase->>'payment_method', 'Cash'),
    'received',
    v_user_id
  );

  -- 2. Insert Items, Stock Movements & Supplier Cylinder Ledger
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := (v_item->>'product_id')::UUID;
    v_full_qty := COALESCE((v_item->>'full_qty_received')::INTEGER, 0);
    v_empty_qty := COALESCE((v_item->>'empty_qty_sent')::INTEGER, 0);
    v_unit_price := COALESCE((v_item->>'unit_price')::NUMERIC, 0);
    v_line_total := COALESCE((v_item->>'line_total')::NUMERIC, v_full_qty * v_unit_price);

    INSERT INTO public.purchase_items (
      purchase_id, product_id, full_qty_received, empty_qty_sent, unit_price, discount, line_total
    ) VALUES (
      v_purchase_id, v_prod_id, v_full_qty, v_empty_qty, v_unit_price,
      COALESCE((v_item->>'discount')::NUMERIC, 0), v_line_total
    );

    IF v_full_qty > 0 THEN
      INSERT INTO public.stock_movements (
        product_id, movement_type, full_qty_change,
        reference_type, reference_id, notes, created_by
      ) VALUES (
        v_prod_id, 'PURCHASE_FULL_IN', v_full_qty,
        'purchase', v_purchase_no, 'Received from ' || v_supplier_record.company_name, v_user_id
      );
    END IF;

    IF v_empty_qty > 0 THEN
      INSERT INTO public.stock_movements (
        product_id, movement_type, empty_qty_change,
        reference_type, reference_id, notes, created_by
      ) VALUES (
        v_prod_id, 'EMPTY_SENT_TO_SUPPLIER', -v_empty_qty,
        'purchase', v_purchase_no, 'Empties sent to ' || v_supplier_record.company_name, v_user_id
      );
    END IF;

    INSERT INTO public.supplier_cylinder_ledger (
      supplier_id, product_id, reference_type, reference_id,
      full_received, empty_sent, balance_change, notes
    ) VALUES (
      v_supplier_id, v_prod_id, 'purchase', v_purchase_no,
      v_full_qty, v_empty_qty, (v_full_qty - v_empty_qty),
      'Purchase ' || v_purchase_no || ': ' || v_full_qty || ' full in, ' || v_empty_qty || ' empty out'
    );
  END LOOP;

  -- 3. Update Supplier Financial Payable
  UPDATE public.suppliers
  SET current_payable = current_payable + v_due_amount,
      updated_at = NOW()
  WHERE id = v_supplier_id;

  -- 4. Record Supplier Payment if paid > 0
  IF v_amount_paid > 0 THEN
    v_voucher_no := public.generate_document_number('PV');
    INSERT INTO public.supplier_payments (
      voucher_no, supplier_id, purchase_id, amount, payment_date,
      method, account, reference, notes, paid_by
    ) VALUES (
      v_voucher_no, v_supplier_id, v_purchase_id, v_amount_paid,
      COALESCE((p_purchase->>'date')::DATE, CURRENT_DATE),
      COALESCE(p_purchase->>'payment_method', 'Cash'),
      'Bank Account',
      v_purchase_no,
      'Paid on purchase receipt ' || v_purchase_no,
      v_user_id
    );
  END IF;

  -- 5. Audit Log
  INSERT INTO public.audit_logs (
    user_id, action, module, reference_type, reference_id, details
  ) VALUES (
    v_user_id, 'CREATE_PURCHASE', 'Purchase', 'purchase', v_purchase_no,
    'Recorded purchase from ' || v_supplier_record.company_name || ' - Total: ৳' || v_grand_total
  );

  RETURN jsonb_build_object(
    'id', v_purchase_id,
    'purchase_no', v_purchase_no,
    'grand_total', v_grand_total,
    'amount_paid', v_amount_paid,
    'due_amount', v_due_amount
  );
END;
$$;

-- 5. RECEIVE CUSTOMER PAYMENT (Atomic RPC)
CREATE OR REPLACE FUNCTION public.receive_customer_payment(
  p_customer_id UUID,
  p_amount NUMERIC(12, 2),
  p_method TEXT,
  p_account TEXT,
  p_notes TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_id UUID := gen_random_uuid();
  v_receipt_no TEXT;
  v_cust RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT * INTO v_cust FROM public.customers WHERE id = p_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  v_receipt_no := public.generate_document_number('MR');

  INSERT INTO public.customer_payments (
    id, receipt_no, customer_id, amount, payment_date,
    method, account, reference, notes, received_by
  ) VALUES (
    v_payment_id, v_receipt_no, p_customer_id, p_amount, CURRENT_DATE,
    p_method, p_account, p_reference, p_notes, v_user_id
  );

  -- Decrease customer due
  UPDATE public.customers
  SET current_due = GREATEST(0, current_due - p_amount),
      updated_at = NOW()
  WHERE id = p_customer_id;

  -- Audit log
  INSERT INTO public.audit_logs (
    user_id, action, module, reference_type, reference_id, details
  ) VALUES (
    v_user_id, 'RECEIVE_PAYMENT', 'Accounts', 'payment', v_receipt_no,
    'Received ৳' || p_amount || ' from ' || v_cust.business_name || ' via ' || p_method
  );

  RETURN jsonb_build_object(
    'id', v_payment_id,
    'receipt_no', v_receipt_no,
    'amount', p_amount,
    'new_due', GREATEST(0, v_cust.current_due - p_amount)
  );
END;
$$;

-- 6. RECEIVE EMPTY CYLINDERS DIRECTLY (Atomic RPC)
CREATE OR REPLACE FUNCTION public.receive_empty_cylinders(
  p_customer_id UUID,
  p_product_id UUID,
  p_qty INTEGER,
  p_condition TEXT DEFAULT 'Good',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cust RECORD;
  v_prod RECORD;
  v_user_id UUID := auth.uid();
  v_ref TEXT;
BEGIN
  SELECT * INTO v_cust FROM public.customers WHERE id = p_customer_id;
  SELECT * INTO v_prod FROM public.products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer or Product not found';
  END IF;

  v_ref := 'RET-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 6, '0');

  -- Update cylinder ledger
  INSERT INTO public.customer_cylinder_ledger (
    customer_id, product_id, reference_type, reference_id,
    full_delivered, empty_returned, damaged, balance_change, notes
  ) VALUES (
    p_customer_id, p_product_id, 'direct_return', v_ref,
    0, CASE WHEN p_condition = 'Good' THEN p_qty ELSE 0 END,
    CASE WHEN p_condition = 'Damaged' THEN p_qty ELSE 0 END,
    -p_qty,
    'Direct empty cylinder return: ' || p_qty || ' cylinders (' || p_condition || ')'
  );

  -- Stock movement
  INSERT INTO public.stock_movements (
    product_id, movement_type,
    empty_qty_change, damaged_qty_change, customer_held_qty_change,
    reference_type, reference_id, notes, created_by
  ) VALUES (
    p_product_id,
    CASE WHEN p_condition = 'Good' THEN 'CUSTOMER_EMPTY_IN' ELSE 'DAMAGED' END,
    CASE WHEN p_condition = 'Good' THEN p_qty ELSE 0 END,
    CASE WHEN p_condition = 'Damaged' THEN p_qty ELSE 0 END,
    -p_qty,
    'cylinder_return', v_ref,
    'Received empty cylinders from ' || v_cust.business_name || ' (' || p_condition || ')',
    v_user_id
  );

  -- Audit log
  INSERT INTO public.audit_logs (
    user_id, action, module, reference_type, reference_id, details
  ) VALUES (
    v_user_id, 'RECEIVE_EMPTY', 'Cylinders', 'return', v_ref,
    'Received ' || p_qty || ' empty ' || v_prod.name || ' from ' || v_cust.business_name
  );

  RETURN jsonb_build_object('success', true, 'reference', v_ref, 'qty', p_qty);
END;
$$;
