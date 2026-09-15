-- ==============================================================================
-- LPG MANAGER BD - Production Supabase PostgreSQL Schema with RBAC & RLS
-- ==============================================================================
-- Compatible with Supabase SQL Editor: Run this entire script to provision
-- tables, foreign keys, indexes, Row-Level Security (RLS) policies, and seed users.
-- ==============================================================================

-- Enable UUID extension
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

-- 7. STOCK MOVEMENTS LEDGER (AUDIT FOR FULL & EMPTY CYLINDERS)
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

-- 10. FINANCIAL TRANSACTIONS (CASHBOOK & LEDGER)
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

-- 11. IMMUTABLE SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    reference TEXT,
    details TEXT NOT NULL
);

-- 12. APP SETTINGS & BUSINESS PROFILE
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR OPTIMAL PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_money_receipts_cust ON money_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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

-- Allow public read & auth write for initial setup / testing with Supabase Anon Key
CREATE POLICY "Public Read Access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Access Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Access Customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public Read Access Suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public Read Access Sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Public Read Access Purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Public Read Access Stock Movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Public Read Access Receipts" ON money_receipts FOR SELECT USING (true);
CREATE POLICY "Public Read Access Expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Public Read Access Transactions" ON financial_transactions FOR SELECT USING (true);
CREATE POLICY "Public Read Access Audit" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Read Access Settings" ON app_settings FOR SELECT USING (true);

-- Allow authenticated and anon inserts/updates for the POS and ERP
CREATE POLICY "Allow Insert Sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Update Sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Allow Insert Customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Update Customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow Insert Stock Movements" ON stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Update Products Stock" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow Insert Money Receipts" ON money_receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Transactions" ON financial_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Audit Logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Upsert Settings" ON app_settings FOR ALL USING (true);

-- ==============================================================================
-- SEED INITIAL RBAC USERS
-- ==============================================================================
INSERT INTO profiles (id, name, email, role, phone, username, status)
VALUES 
    ('user-1', 'Al-Haj Mizanur Rahman', 'admin@demo.com', 'admin', '01711-889900', 'admin', 'active'),
    ('user-2', 'Kawsar Ahmed', 'sales@demo.com', 'sales', '01722-112233', 'sales', 'active'),
    ('user-3', 'Faridul Islam', 'manager@demo.com', 'manager', '01733-445566', 'manager', 'active'),
    ('user-4', 'Shah Alam', 'accounts@demo.com', 'accountant', '01744-778899', 'accountant', 'active'),
    ('user-5', 'Babul Mia', 'store@demo.com', 'storekeeper', '01811-223344', 'storekeeper', 'active'),
    ('user-6', 'Mohammad Rahim', 'delivery@demo.com', 'delivery', '01899-556677', 'delivery', 'active')
ON CONFLICT (id) DO NOTHING;
