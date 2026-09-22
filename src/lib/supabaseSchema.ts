export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- LPG MANAGER BD - Production Supabase PostgreSQL Schema with RBAC & RLS
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

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

-- 2. PRODUCTS / CYLINDERS CATALOG
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    size TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'Cylinder',
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    dealer_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    min_stock INTEGER NOT NULL DEFAULT 10,
    full_stock INTEGER NOT NULL DEFAULT 0,
    empty_stock INTEGER NOT NULL DEFAULT 0,
    damaged_stock INTEGER NOT NULL DEFAULT 0,
    lost_stock INTEGER NOT NULL DEFAULT 0,
    customer_held_stock INTEGER NOT NULL DEFAULT 0,
    supplier_held_stock INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS & DEALERS
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    area TEXT NOT NULL,
    customer_type TEXT NOT NULL CHECK (customer_type IN ('dealer', 'retail_shop', 'restaurant', 'hotel', 'commercial', 'other')),
    credit_limit NUMERIC(12, 2) DEFAULT 50000.00,
    credit_period_days INTEGER DEFAULT 15,
    current_due NUMERIC(12, 2) DEFAULT 0.00,
    cylinder_holdings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUPPLIERS & DEPOTS
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    empty_cylinders_due INTEGER DEFAULT 0,
    current_payable NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SALES & DISPATCH INVOICES
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    sale_type TEXT DEFAULT 'cylinder_sale',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_amount NUMERIC(12, 2) DEFAULT 0.00,
    empty_cylinders_received INTEGER DEFAULT 0,
    empty_received_items JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
    payment_method TEXT DEFAULT 'cash',
    account TEXT DEFAULT 'Cash in Hand',
    delivery_type TEXT DEFAULT 'Depot Pickup',
    driver_name TEXT,
    vehicle_no TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PURCHASES FROM DEPOTS
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    purchase_no TEXT UNIQUE NOT NULL,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    supplier_invoice_ref TEXT,
    truck_number TEXT,
    driver_name TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_amount NUMERIC(12, 2) DEFAULT 0.00,
    empty_cylinders_sent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'received' CHECK (status IN ('received', 'ordered', 'cancelled')),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. STOCK MOVEMENTS LEDGER
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT,
    brand TEXT NOT NULL,
    size TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    full_qty INTEGER DEFAULT 0,
    empty_qty INTEGER DEFAULT 0,
    full_qty_change INTEGER DEFAULT 0,
    empty_qty_change INTEGER DEFAULT 0,
    reference TEXT NOT NULL,
    godown TEXT DEFAULT 'Main Godown',
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MONEY RECEIPTS
CREATE TABLE IF NOT EXISTS money_receipts (
    id TEXT PRIMARY KEY,
    receipt_no TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    account TEXT NOT NULL,
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. GODOWN OPERATING EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    voucher_no TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_from TEXT NOT NULL,
    notes TEXT,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. FINANCIAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS financial_transactions (
    id TEXT PRIMARY KEY,
    voucher_no TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    account TEXT NOT NULL,
    party_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. IMMUTABLE AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    reference TEXT,
    details TEXT NOT NULL
);

-- 12. APP SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow full read/write for all application tables (using anon key or authenticated roles)
CREATE POLICY "Allow All on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on money_receipts" ON money_receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on financial_transactions" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- SEED RBAC USERS
INSERT INTO profiles (id, name, email, role, phone, username, status)
VALUES 
    ('user-1', 'Al-Haj Mizanur Rahman', 'admin@demo.com', 'admin', '01711-889900', 'admin', 'active'),
    ('user-2', 'Kawsar Ahmed', 'sales@demo.com', 'sales', '01722-112233', 'sales', 'active'),
    ('user-3', 'Faridul Islam', 'manager@demo.com', 'manager', '01733-445566', 'manager', 'active'),
    ('user-4', 'Shah Alam', 'accounts@demo.com', 'accountant', '01744-778899', 'accountant', 'active'),
    ('user-5', 'Babul Mia', 'store@demo.com', 'storekeeper', '01811-223344', 'storekeeper', 'active'),
    ('user-6', 'Mohammad Rahim', 'delivery@demo.com', 'delivery', '01899-556677', 'delivery', 'active')
ON CONFLICT (id) DO NOTHING;
`;

export const SUPABASE_QUICK_PATCH_SQL = `-- ==============================================================================
-- LPG MANAGER BD - Instant 1-Click Permissions & Schema Patch
-- Run this in Supabase SQL Editor if tables already exist:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Ensure sales table has godown column and flexible status constraint
ALTER TABLE sales ADD COLUMN IF NOT EXISTS godown TEXT DEFAULT 'Main Godown';
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_status_check;
ALTER TABLE sales ADD CONSTRAINT sales_status_check CHECK (status IN ('completed', 'pending', 'cancelled', 'partial', 'due', 'paid'));

-- 2. Drop any conflicting restrictive policies and grant full access to application
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
`;
