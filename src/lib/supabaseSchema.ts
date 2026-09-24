export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- LPG MASTER BD - Complete Production Supabase PostgreSQL Schema (Full Spec)
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USER ROLES
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'accountant', 'sales', 'storekeeper', 'delivery')),
    phone TEXT,
    username TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    color TEXT DEFAULT '#0284c7',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUCTS / CYLINDERS CATALOG
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand TEXT,
    name TEXT,
    size TEXT,
    cylinder_size_kg NUMERIC(6, 2) DEFAULT 12.0,
    sku TEXT UNIQUE,
    category TEXT DEFAULT 'Cylinder',
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    dealer_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    minimum_stock INTEGER DEFAULT 10,
    min_stock INTEGER DEFAULT 10,
    full_stock INTEGER NOT NULL DEFAULT 0,
    empty_stock INTEGER NOT NULL DEFAULT 0,
    damaged_stock INTEGER NOT NULL DEFAULT 0,
    lost_stock INTEGER NOT NULL DEFAULT 0,
    customer_held_stock INTEGER NOT NULL DEFAULT 0,
    supplier_held_stock INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CUSTOMERS & DEALERS
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_code TEXT UNIQUE,
    code TEXT,
    business_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    alternative_phone TEXT,
    address TEXT,
    area TEXT,
    thana_upazila TEXT,
    district TEXT DEFAULT 'Dhaka',
    customer_type TEXT DEFAULT 'dealer',
    credit_limit NUMERIC(12, 2) DEFAULT 50000.00,
    credit_period_days INTEGER DEFAULT 15,
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    current_due NUMERIC(12, 2) DEFAULT 0.00,
    bin TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    cylinder_holdings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUPPLIERS & REFINERY DEPOTS
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    supplier_code TEXT UNIQUE,
    code TEXT,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    district TEXT,
    bin TEXT,
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    current_payable NUMERIC(12, 2) DEFAULT 0.00,
    empty_cylinders_due INTEGER DEFAULT 0,
    credit_terms TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SALES & INVOICES
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_no TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    date TEXT NOT NULL,
    sale_type TEXT DEFAULT 'cylinder_sale',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    transport_charge NUMERIC(12, 2) DEFAULT 0.00,
    loading_charge NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) DEFAULT 0.00,
    net_amount NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_amount NUMERIC(12, 2) DEFAULT 0.00,
    current_due NUMERIC(12, 2) DEFAULT 0.00,
    empty_cylinders_received INTEGER DEFAULT 0,
    empty_received_items JSONB DEFAULT '[]'::jsonb,
    payment_status TEXT DEFAULT 'paid',
    status TEXT DEFAULT 'completed',
    sale_status TEXT DEFAULT 'completed',
    payment_method TEXT DEFAULT 'cash',
    account TEXT DEFAULT 'Cash in Hand',
    delivery_type TEXT DEFAULT 'Depot Pickup',
    godown TEXT DEFAULT 'Main Godown',
    driver_name TEXT,
    vehicle_no TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SALE LINE ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    full_qty INTEGER DEFAULT 0,
    empty_qty_received INTEGER DEFAULT 0,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PURCHASES FROM REFINERIES
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    purchase_no TEXT UNIQUE NOT NULL,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    supplier_reference TEXT,
    supplier_invoice_ref TEXT,
    date TEXT NOT NULL,
    truck_number TEXT,
    driver_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    transport_cost NUMERIC(12, 2) DEFAULT 0.00,
    loading_cost NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_amount NUMERIC(12, 2) DEFAULT 0.00,
    empty_cylinders_sent INTEGER DEFAULT 0,
    payment_method TEXT DEFAULT 'Bank Transfer',
    status TEXT DEFAULT 'received',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PURCHASE LINE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id TEXT REFERENCES purchases(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    full_qty_received INTEGER DEFAULT 0,
    empty_qty_sent INTEGER DEFAULT 0,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. STOCK MOVEMENTS LEDGER
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT,
    brand TEXT,
    size TEXT,
    movement_type TEXT NOT NULL,
    full_qty INTEGER DEFAULT 0,
    empty_qty INTEGER DEFAULT 0,
    full_qty_change INTEGER DEFAULT 0,
    empty_qty_change INTEGER DEFAULT 0,
    damaged_qty_change INTEGER DEFAULT 0,
    lost_qty_change INTEGER DEFAULT 0,
    customer_held_qty_change INTEGER DEFAULT 0,
    supplier_held_qty_change INTEGER DEFAULT 0,
    reference TEXT,
    reference_type TEXT,
    reference_id TEXT,
    godown TEXT DEFAULT 'Main Godown',
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CUSTOMER CYLINDER LEDGER
CREATE TABLE IF NOT EXISTS customer_cylinder_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    reference_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    full_delivered INTEGER DEFAULT 0,
    empty_returned INTEGER DEFAULT 0,
    balance_change INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. MONEY RECEIPTS / CUSTOMER PAYMENTS
CREATE TABLE IF NOT EXISTS customer_payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    receipt_no TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT,
    sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
    customer_name TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    payment_date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    payment_method TEXT DEFAULT 'Cash',
    method TEXT DEFAULT 'Cash',
    account TEXT DEFAULT 'Cash in Hand',
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS money_receipts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    receipt_no TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    account TEXT NOT NULL,
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. SUPPLIER PAYMENTS
CREATE TABLE IF NOT EXISTS supplier_payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    voucher_no TEXT UNIQUE NOT NULL,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    payment_method TEXT DEFAULT 'Bank Transfer',
    method TEXT DEFAULT 'Bank Transfer',
    account TEXT DEFAULT 'Bank Account',
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. OPERATING EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    voucher_no TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_from TEXT NOT NULL,
    notes TEXT,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. FINANCIAL TRANSACTIONS & CASHBOOK
CREATE TABLE IF NOT EXISTS financial_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    voucher_no TEXT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    account TEXT NOT NULL,
    party_type TEXT,
    party_id TEXT,
    party_name TEXT,
    debit NUMERIC(12, 2) DEFAULT 0.00,
    credit NUMERIC(12, 2) DEFAULT 0.00,
    amount NUMERIC(12, 2) DEFAULT 0.00,
    reference TEXT,
    description TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. DELIVERIES & CHALLANS
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    challan_no TEXT UNIQUE NOT NULL,
    sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    driver_name TEXT,
    vehicle_no TEXT,
    delivery_address TEXT,
    status TEXT DEFAULT 'pending',
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    reference TEXT,
    details TEXT NOT NULL
);

-- 18. APPLICATION SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cylinder_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow full read/write for all application tables
CREATE POLICY "Allow All on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on brands" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on purchase_items" ON purchase_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on customer_cylinder_ledger" ON customer_cylinder_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on customer_payments" ON customer_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on money_receipts" ON money_receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on supplier_payments" ON supplier_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on financial_transactions" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
-- Seed Popular LPG Brands
INSERT INTO brands (name, code, color) VALUES 
    ('Bashundhara LP Gas', 'BASH', '#ef4444'),
    ('Beximco LPG', 'BEXI', '#3b82f6'),
    ('Omera LPG', 'OMER', '#10b981'),
    ('Jamuna Gas', 'JAMU', '#f59e0b'),
    ('TotalEnergies LPG', 'TOTA', '#dc2626'),
    ('BM LP Gas', 'BMLP', '#8b5cf6'),
    ('Fresh LP Gas', 'FRES', '#06b6d4'),
    ('Sena LPG', 'SENA', '#059669'),
    ('JMI LPG', 'JMIL', '#d97706'),
    ('Petromax LPG', 'PETR', '#2563eb'),
    ('Universal LPG', 'UNIV', '#4f46e5')
ON CONFLICT (name) DO NOTHING;

-- Seed Default Profiles
INSERT INTO profiles (id, name, email, role, phone, username, status) VALUES 
    ('user-1', 'Al-Haj Mizanur Rahman', 'admin@demo.com', 'admin', '01711-889900', 'admin', 'active'),
    ('user-2', 'Kawsar Ahmed', 'sales@demo.com', 'sales', '01722-112233', 'sales', 'active'),
    ('user-3', 'Faridul Islam', 'manager@demo.com', 'manager', '01733-445566', 'manager', 'active'),
    ('user-4', 'Shah Alam', 'accounts@demo.com', 'accountant', '01744-778899', 'accountant', 'active'),
    ('user-5', 'Babul Mia', 'store@demo.com', 'storekeeper', '01811-223344', 'storekeeper', 'active'),
    ('user-6', 'Mohammad Rahim', 'delivery@demo.com', 'delivery', '01899-556677', 'delivery', 'active')
ON CONFLICT (id) DO NOTHING;
`;

export const SUPABASE_QUICK_PATCH_SQL = `-- ==============================================================================
-- LPG MASTER BD - Instant 1-Click Permissions, Missing Tables & Column Migration Patch
-- Run this in Supabase SQL Editor if you already created tables earlier:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Brands & Link Products
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    color TEXT DEFAULT '#0284c7',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Popular LPG Brands if not yet added
INSERT INTO brands (name, code, color) VALUES 
    ('Bashundhara LP Gas', 'BASH', '#ef4444'),
    ('Beximco LPG', 'BEXI', '#3b82f6'),
    ('Omera LPG', 'OMER', '#10b981'),
    ('Jamuna Gas', 'JAMU', '#f59e0b'),
    ('TotalEnergies LPG', 'TOTA', '#dc2626'),
    ('BM LP Gas', 'BMLP', '#8b5cf6'),
    ('Fresh LP Gas', 'FRES', '#06b6d4'),
    ('Sena LPG', 'SENA', '#059669'),
    ('JMI LPG', 'JMIL', '#d97706'),
    ('Petromax LPG', 'PETR', '#2563eb'),
    ('Universal LPG', 'UNIV', '#4f46e5')
ON CONFLICT (name) DO NOTHING;

-- 2. Add missing columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cylinder_size_kg NUMERIC(6, 2) DEFAULT 12.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_stock INTEGER DEFAULT 10;
ALTER TABLE products ALTER COLUMN brand DROP NOT NULL;
ALTER TABLE products ALTER COLUMN size DROP NOT NULL;

-- 3. Add missing columns to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS alternative_phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS thana_upazila TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dhaka';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS bin TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE customers ALTER COLUMN code DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN area DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN contact_person DROP NOT NULL;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_customer_type_check;

-- 4. Add missing columns to suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS supplier_code TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bin TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS credit_terms TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE suppliers ALTER COLUMN code DROP NOT NULL;
ALTER TABLE suppliers ALTER COLUMN contact_person DROP NOT NULL;

-- 5. Add missing columns to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD');
ALTER TABLE sales ADD COLUMN IF NOT EXISTS godown TEXT DEFAULT 'Main Godown';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS transport_charge NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS loading_charge NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS grand_total NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS current_due NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_status TEXT DEFAULT 'completed';
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_status_check;

-- 6. Add missing columns to purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD');
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS supplier_reference TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS transport_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS loading_cost NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS grand_total NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS due_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Bank Transfer';

-- 7. Add missing columns to stock_movements
ALTER TABLE stock_movements ALTER COLUMN brand DROP NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN size DROP NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN reference DROP NOT NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS damaged_qty_change INTEGER DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS lost_qty_change INTEGER DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS customer_held_qty_change INTEGER DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS supplier_held_qty_change INTEGER DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS reference_type TEXT;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- 8. Create missing child and transaction tables
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    full_qty INTEGER DEFAULT 0,
    empty_qty_received INTEGER DEFAULT 0,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id TEXT REFERENCES purchases(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    full_qty_received INTEGER DEFAULT 0,
    empty_qty_sent INTEGER DEFAULT 0,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_cylinder_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    reference_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    full_delivered INTEGER DEFAULT 0,
    empty_returned INTEGER DEFAULT 0,
    balance_change INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    receipt_no TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT,
    sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
    customer_name TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    payment_date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    payment_method TEXT DEFAULT 'Cash',
    method TEXT DEFAULT 'Cash',
    account TEXT DEFAULT 'Cash in Hand',
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    voucher_no TEXT UNIQUE NOT NULL,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    payment_method TEXT DEFAULT 'Bank Transfer',
    method TEXT DEFAULT 'Bank Transfer',
    account TEXT DEFAULT 'Bank Account',
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    challan_no TEXT UNIQUE NOT NULL,
    sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    driver_name TEXT,
    vehicle_no TEXT,
    delivery_address TEXT,
    status TEXT DEFAULT 'pending',
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Enable RLS and Grant Full Access
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cylinder_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All on brands" ON brands;
CREATE POLICY "Allow All on brands" ON brands FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on sale_items" ON sale_items;
CREATE POLICY "Allow All on sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on purchase_items" ON purchase_items;
CREATE POLICY "Allow All on purchase_items" ON purchase_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on customer_cylinder_ledger" ON customer_cylinder_ledger;
CREATE POLICY "Allow All on customer_cylinder_ledger" ON customer_cylinder_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on customer_payments" ON customer_payments;
CREATE POLICY "Allow All on customer_payments" ON customer_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on supplier_payments" ON supplier_payments;
CREATE POLICY "Allow All on supplier_payments" ON supplier_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on deliveries" ON deliveries;
CREATE POLICY "Allow All on deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on settings" ON settings;
CREATE POLICY "Allow All on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Ensure all existing tables have open RLS policies
DROP POLICY IF EXISTS "Allow All on profiles" ON profiles;
CREATE POLICY "Allow All on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on products" ON products;
CREATE POLICY "Allow All on products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on customers" ON customers;
CREATE POLICY "Allow All on customers" ON customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on suppliers" ON suppliers;
CREATE POLICY "Allow All on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on sales" ON sales;
CREATE POLICY "Allow All on sales" ON sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on purchases" ON purchases;
CREATE POLICY "Allow All on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on stock_movements" ON stock_movements;
CREATE POLICY "Allow All on stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on money_receipts" ON money_receipts;
CREATE POLICY "Allow All on money_receipts" ON money_receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on expenses" ON expenses;
CREATE POLICY "Allow All on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on financial_transactions" ON financial_transactions;
CREATE POLICY "Allow All on financial_transactions" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on audit_logs" ON audit_logs;
CREATE POLICY "Allow All on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All on app_settings" ON app_settings;
CREATE POLICY "Allow All on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- 10. Column Relaxations for flexible data entry
ALTER TABLE money_receipts ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE financial_transactions ALTER COLUMN category DROP NOT NULL;
ALTER TABLE financial_transactions ALTER COLUMN voucher_no DROP NOT NULL;

-- 11. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
`;
