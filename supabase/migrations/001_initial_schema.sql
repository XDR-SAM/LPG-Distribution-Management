-- ====================================================================
-- 001_initial_schema.sql
-- LPG Distribution Management Production PostgreSQL Schema
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES
CREATE TABLE IF NOT EXISTS public.roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

INSERT INTO public.roles (id, name, description) VALUES
  ('owner', 'Business Owner', 'Full control over company finances, users, and operations'),
  ('admin', 'Administrator', 'Full system management and configuration access'),
  ('manager', 'Branch Manager', 'Operational control over sales, stock, and purchasing'),
  ('accountant', 'Accountant', 'Access to financial transactions, payments, expenses, and audit'),
  ('sales_operator', 'Sales Operator', 'Billing, sales invoicing, money receipts, and challans'),
  ('store_keeper', 'Store Keeper', 'Godown inventory, cylinder movements, and purchase receiving'),
  ('delivery_staff', 'Delivery Staff', 'Challan delivery tracking, empty returns collection')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES public.roles(id) DEFAULT 'sales_operator',
  phone TEXT,
  username TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WAREHOUSES / GODOWNS
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  location TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  description TEXT,
  logo_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  cylinder_size_kg NUMERIC(8, 2) NOT NULL DEFAULT 12.0,
  sku TEXT UNIQUE,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  dealer_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  alternative_phone TEXT,
  address TEXT,
  area TEXT,
  thana_upazila TEXT,
  district TEXT DEFAULT 'Dhaka',
  customer_type TEXT NOT NULL DEFAULT 'retailer' CHECK (customer_type IN ('retailer', 'dealer', 'commercial', 'household', 'corporate')),
  credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  current_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bin TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  district TEXT,
  bin TEXT,
  opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  current_payable NUMERIC(12, 2) NOT NULL DEFAULT 0,
  credit_terms TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VEHICLES & DRIVERS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_no TEXT NOT NULL UNIQUE,
  model TEXT,
  capacity_cylinders INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active',
  driver_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_no TEXT,
  status TEXT DEFAULT 'active',
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SALES & SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  transport_charge NUMERIC(12, 2) NOT NULL DEFAULT 0,
  loading_charge NUMERIC(12, 2) NOT NULL DEFAULT 0,
  other_charge NUMERIC(12, 2) NOT NULL DEFAULT 0,
  vat NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  previous_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  current_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'due' CHECK (payment_status IN ('paid', 'partial', 'due')),
  sale_status TEXT NOT NULL DEFAULT 'completed' CHECK (sale_status IN ('completed', 'pending', 'cancelled')),
  payment_method TEXT DEFAULT 'Cash',
  account TEXT DEFAULT 'Cash in Hand',
  delivery_type TEXT DEFAULT 'direct',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  full_qty INTEGER NOT NULL DEFAULT 0 CHECK (full_qty >= 0),
  empty_qty_received INTEGER NOT NULL DEFAULT 0 CHECK (empty_qty_received >= 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PURCHASES & PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_no TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_reference TEXT,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  transport_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  loading_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unloading_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  other_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'ordered', 'partial', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  full_qty_received INTEGER NOT NULL DEFAULT 0 CHECK (full_qty_received >= 0),
  empty_qty_sent INTEGER NOT NULL DEFAULT 0 CHECK (empty_qty_sent >= 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENTS (CUSTOMER & SUPPLIER)
CREATE TABLE IF NOT EXISTS public.customer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL CHECK (method IN ('Cash', 'Bank', 'bKash', 'Nagad', 'Rocket', 'Cheque')),
  account TEXT DEFAULT 'Cash in Hand',
  reference TEXT,
  notes TEXT,
  received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL CHECK (method IN ('Cash', 'Bank', 'bKash', 'Nagad', 'Rocket', 'Cheque')),
  account TEXT DEFAULT 'Bank Account',
  reference TEXT,
  notes TEXT,
  paid_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EXPENSES & OTHER INCOME
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN (
    'Transport', 'Fuel', 'Loading/Unloading', 'Salary/Wages', 'Godown Rent',
    'Electricity', 'Mobile/Internet', 'Vehicle Repair', 'Cylinder Repair',
    'Office Expense', 'Food/Allowance', 'Bank Charge', 'Other'
  )),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  paid_from TEXT NOT NULL DEFAULT 'Cash in Hand',
  description TEXT,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.other_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  account TEXT NOT NULL DEFAULT 'Cash in Hand',
  notes TEXT,
  received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STOCK MOVEMENT LEDGER
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'PURCHASE_FULL_IN', 'SALE_FULL_OUT', 'CUSTOMER_EMPTY_IN',
    'EMPTY_SENT_TO_SUPPLIER', 'SALE_RETURN', 'PURCHASE_RETURN',
    'DAMAGED', 'LOST', 'RECOVERED', 'MANUAL_ADJUSTMENT'
  )),
  full_qty_change INTEGER NOT NULL DEFAULT 0,
  empty_qty_change INTEGER NOT NULL DEFAULT 0,
  damaged_qty_change INTEGER NOT NULL DEFAULT 0,
  lost_qty_change INTEGER NOT NULL DEFAULT 0,
  customer_held_qty_change INTEGER NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CYLINDER LEDGERS (CUSTOMER & SUPPLIER)
CREATE TABLE IF NOT EXISTS public.customer_cylinder_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  reference_type TEXT NOT NULL DEFAULT 'sale',
  reference_id TEXT,
  full_delivered INTEGER NOT NULL DEFAULT 0 CHECK (full_delivered >= 0),
  empty_returned INTEGER NOT NULL DEFAULT 0 CHECK (empty_returned >= 0),
  damaged INTEGER NOT NULL DEFAULT 0 CHECK (damaged >= 0),
  settled INTEGER NOT NULL DEFAULT 0,
  balance_change INTEGER NOT NULL DEFAULT 0, -- (+ full_delivered - empty_returned)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_cylinder_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  reference_type TEXT NOT NULL DEFAULT 'purchase',
  reference_id TEXT,
  full_received INTEGER NOT NULL DEFAULT 0 CHECK (full_received >= 0),
  empty_sent INTEGER NOT NULL DEFAULT 0 CHECK (empty_sent >= 0),
  balance_change INTEGER NOT NULL DEFAULT 0, -- (+ full_received - empty_sent)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DELIVERIES
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_no TEXT UNIQUE NOT NULL,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_no TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  area TEXT,
  address TEXT,
  total_qty INTEGER DEFAULT 0,
  empty_to_collect INTEGER DEFAULT 0,
  amount NUMERIC(12, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  delivery_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'app_config',
  business_name TEXT NOT NULL DEFAULT 'Al-Madina LPG Agency & Distribution',
  phone TEXT DEFAULT '+880 1711-223344',
  email TEXT DEFAULT 'contact@almadinalpg.com',
  address TEXT DEFAULT 'Holding #142/A, Station Road, Gazipur Chowrasta, Gazipur',
  vat_rate NUMERIC(5, 2) DEFAULT 0,
  currency TEXT DEFAULT 'BDT',
  low_stock_threshold INTEGER DEFAULT 15,
  allow_negative_stock BOOLEAN DEFAULT FALSE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  godowns JSONB DEFAULT '["Main Godown (Station Road)", "Sub Godown #2 (Tongi)", "Retail Store Counter"]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PRICE HISTORY
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  old_selling_price NUMERIC(12, 2),
  new_selling_price NUMERIC(12, 2) NOT NULL,
  old_purchase_price NUMERIC(12, 2),
  new_purchase_price NUMERIC(12, 2),
  old_dealer_price NUMERIC(12, 2),
  new_dealer_price NUMERIC(12, 2),
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. VIEWS FOR DERIVED STOCK & CYLINDER LEDGER (NO FAKE / SEPARATE CACHE)
CREATE OR REPLACE VIEW public.v_product_stock AS
SELECT 
  p.id AS product_id,
  p.brand_id,
  b.name AS brand_name,
  p.name AS product_name,
  p.cylinder_size_kg,
  p.sku,
  p.purchase_price,
  p.selling_price,
  p.dealer_price,
  p.deposit_amount,
  p.minimum_stock,
  p.active,
  COALESCE(SUM(sm.full_qty_change), 0) AS full_stock,
  COALESCE(SUM(sm.empty_qty_change), 0) AS empty_stock,
  COALESCE(SUM(sm.damaged_qty_change), 0) AS damaged_stock,
  COALESCE(SUM(sm.lost_qty_change), 0) AS lost_stock,
  COALESCE(SUM(sm.customer_held_qty_change), 0) AS customer_held_stock
FROM public.products p
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.stock_movements sm ON p.id = sm.product_id
GROUP BY p.id, b.name;

CREATE OR REPLACE VIEW public.v_customer_cylinder_due AS
SELECT
  ccl.customer_id,
  c.customer_code,
  c.business_name,
  c.phone,
  ccl.product_id,
  p.name AS product_name,
  COALESCE(SUM(ccl.full_delivered), 0) AS total_delivered,
  COALESCE(SUM(ccl.empty_returned), 0) AS total_returned,
  COALESCE(SUM(ccl.damaged), 0) AS total_damaged,
  COALESCE(SUM(ccl.balance_change), 0) AS net_cylinder_due
FROM public.customer_cylinder_ledger ccl
JOIN public.customers c ON ccl.customer_id = c.id
JOIN public.products p ON ccl.product_id = p.id
GROUP BY ccl.customer_id, c.customer_code, c.business_name, c.phone, ccl.product_id, p.name;
