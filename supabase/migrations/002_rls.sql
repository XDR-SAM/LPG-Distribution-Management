-- ====================================================================
-- 002_rls.sql
-- LPG Distribution Management: Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Helper function to check role of current authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Helper functions for role checks
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_current_user_role() IN ('owner', 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_current_user_role() IN ('owner', 'admin', 'manager');
$$;

-- 3. ENABLE RLS ON ALL TABLES
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_cylinder_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_cylinder_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES

-- Roles: Read-only for authenticated
CREATE POLICY "Allow authenticated read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: Authenticated can read all team profiles, update own profile; admins can update all
CREATE POLICY "Allow authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users update own profile or admin manage"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_owner())
  WITH CHECK (auth.uid() = id OR public.is_admin_or_owner());

CREATE POLICY "Allow admin insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin_or_owner());

-- Brands & Warehouses & Products: All authenticated can read, managers/admins/storekeeper can manage
CREATE POLICY "Allow authenticated read brands" ON public.brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage brands" ON public.brands FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Allow authenticated read warehouses" ON public.warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage warehouses" ON public.warehouses FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Allow authenticated read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage products" ON public.products FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'store_keeper'));

-- Customers: Read for authenticated; Insert/Update for sales, manager, admin, accountant
CREATE POLICY "Allow authenticated read customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage customers" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator', 'accountant'));
CREATE POLICY "Allow staff update customers" ON public.customers FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator', 'accountant'));

-- Suppliers: Read for authenticated; manage for manager, admin, accountant, store_keeper
CREATE POLICY "Allow authenticated read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'accountant', 'store_keeper'));

-- Vehicles & Drivers: Read for all, manage for manager/admin/delivery
CREATE POLICY "Allow authenticated read vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage vehicles" ON public.vehicles FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Allow authenticated read drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage drivers" ON public.drivers FOR ALL TO authenticated USING (public.is_manager_or_above());

-- Sales & Sale Items: All authenticated can read; sales, manager, admin can insert/manage
CREATE POLICY "Allow authenticated read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert sales" ON public.sales FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator'));
CREATE POLICY "Allow staff update sales" ON public.sales FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator'));

CREATE POLICY "Allow authenticated read sale_items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert sale_items" ON public.sale_items FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator'));

-- Purchases & Purchase Items: All authenticated can read; store keeper, manager, admin can manage
CREATE POLICY "Allow authenticated read purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert purchases" ON public.purchases FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'store_keeper', 'accountant'));
CREATE POLICY "Allow staff update purchases" ON public.purchases FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'store_keeper', 'accountant'));

CREATE POLICY "Allow authenticated read purchase_items" ON public.purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert purchase_items" ON public.purchase_items FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'store_keeper', 'accountant'));

-- Payments: All authenticated can read; accountant, sales_operator, manager, admin can manage
CREATE POLICY "Allow authenticated read customer_payments" ON public.customer_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert customer_payments" ON public.customer_payments FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator', 'accountant'));

CREATE POLICY "Allow authenticated read supplier_payments" ON public.supplier_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert supplier_payments" ON public.supplier_payments FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'accountant'));

-- Expenses & Other Income
CREATE POLICY "Allow authenticated read expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'accountant'));

CREATE POLICY "Allow authenticated read other_income" ON public.other_income FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage other_income" ON public.other_income FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'accountant'));

-- Stock Movements & Ledgers:
CREATE POLICY "Allow authenticated read stock_movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert stock_movements" ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'store_keeper', 'sales_operator'));

CREATE POLICY "Allow authenticated read customer_cylinder_ledger" ON public.customer_cylinder_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert customer_cylinder_ledger" ON public.customer_cylinder_ledger FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator', 'store_keeper'));

CREATE POLICY "Allow authenticated read supplier_cylinder_ledger" ON public.supplier_cylinder_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff insert supplier_cylinder_ledger" ON public.supplier_cylinder_ledger FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'store_keeper', 'accountant'));

-- Deliveries: Authenticated can read and update
CREATE POLICY "Allow authenticated read deliveries" ON public.deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow staff manage deliveries" ON public.deliveries FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager', 'sales_operator', 'delivery_staff'));

-- Settings: Read for all authenticated; Update for Admin/Owner only
CREATE POLICY "Allow authenticated read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.is_admin_or_owner());

-- Audit logs: Read for Admin/Owner/Accountant; Insert for any authenticated operation
CREATE POLICY "Allow authorized read audit_logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'accountant', 'manager'));
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Price History: Read for all, insert for Admin/Manager
CREATE POLICY "Allow authenticated read price_history" ON public.price_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage price_history" ON public.price_history FOR ALL TO authenticated
  USING (public.is_manager_or_above());
