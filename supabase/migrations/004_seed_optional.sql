-- ====================================================================
-- 004_seed_optional.sql
-- Optional Development Seed Data
-- CAUTION: Do NOT run this in production if you want a clean database!
-- ====================================================================

-- 1. Warehouses
INSERT INTO public.warehouses (id, name, code, location, is_default)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Main Godown (Station Road)', 'WH-01', 'Holding #142/A, Station Road, Gazipur', true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Sub Godown #2 (Tongi)', 'WH-02', 'Station Road, Tongi Bazar', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Brands
INSERT INTO public.brands (id, name, code, description)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bashundhara LP Gas', 'BLPG', 'Bashundhara Group LP Gas'),
  ('22222222-2222-2222-2222-222222222222', 'Omera LPG', 'OMR', 'Omera Petroleum Limited'),
  ('33333333-3333-3333-3333-333333333333', 'Jamuna Gas', 'JMN', 'Jamuna Spacetech Joint Venture Ltd'),
  ('44444444-4444-4444-4444-444444444444', 'Beximco LPG', 'BXMC', 'Beximco Petroleum Limited'),
  ('55555555-5555-5555-5555-555555555555', 'Navana LPG', 'NVN', 'Navana LPG Unit')
ON CONFLICT (id) DO NOTHING;

-- 3. Products
INSERT INTO public.products (id, brand_id, name, cylinder_size_kg, sku, purchase_price, selling_price, dealer_price, deposit_amount, minimum_stock)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Bashundhara 12 KG', 12.0, 'BLPG-12', 1320.00, 1450.00, 1410.00, 1100.00, 40),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Bashundhara 35 KG Commercial', 35.0, 'BLPG-35', 3850.00, 4200.00, 4100.00, 2500.00, 15),
  ('aaaa3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Omera 12 KG', 12.0, 'OMR-12', 1315.00, 1440.00, 1400.00, 1100.00, 30),
  ('aaaa4444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Jamuna 12 KG', 12.0, 'JMN-12', 1300.00, 1420.00, 1380.00, 1050.00, 25),
  ('aaaa5555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Beximco Smart Cylinder 12 KG', 12.0, 'BXMC-12', 1340.00, 1470.00, 1430.00, 1200.00, 30)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Stock Movements for Products (Giving realistic godown initial inventory)
INSERT INTO public.stock_movements (product_id, movement_type, full_qty_change, empty_qty_change, reference_type, reference_id, notes)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'MANUAL_ADJUSTMENT', 80, 45, 'opening_balance', 'INIT-2026', 'Godown Opening Stock'),
  ('aaaa2222-2222-2222-2222-222222222222', 'MANUAL_ADJUSTMENT', 18, 12, 'opening_balance', 'INIT-2026', 'Godown Opening Stock'),
  ('aaaa3333-3333-3333-3333-333333333333', 'MANUAL_ADJUSTMENT', 65, 30, 'opening_balance', 'INIT-2026', 'Godown Opening Stock'),
  ('aaaa4444-4444-4444-4444-444444444444', 'MANUAL_ADJUSTMENT', 50, 20, 'opening_balance', 'INIT-2026', 'Godown Opening Stock'),
  ('aaaa5555-5555-5555-5555-555555555555', 'MANUAL_ADJUSTMENT', 40, 15, 'opening_balance', 'INIT-2026', 'Godown Opening Stock')
ON CONFLICT DO NOTHING;

-- 5. Customers
INSERT INTO public.customers (id, customer_code, business_name, contact_person, phone, address, area, customer_type, credit_limit, opening_balance, current_due)
VALUES
  ('cccc1111-1111-1111-1111-111111111111', 'CUST-001', 'M/S Nayeem Traders', 'Md. Nayeem Hossain', '01712-345678', 'Chowrasta Bazar, Gazipur', 'Gazipur Chowrasta', 'dealer', 100000.00, 25000.00, 42500.00),
  ('cccc2222-2222-2222-2222-222222222222', 'CUST-002', 'Bismillah Gas & Sanitary', 'Haji Abul Kashem', '01819-876543', 'Tongi Station Road, Gazipur', 'Tongi', 'dealer', 150000.00, 15000.00, 18200.00),
  ('cccc3333-3333-3333-3333-333333333333', 'CUST-003', 'Rahmat Ali Store', 'Rahmat Ali', '01911-223344', 'Konabari Stand, Gazipur', 'Konabari', 'retailer', 30000.00, 0.00, 8500.00),
  ('cccc4444-4444-4444-4444-444444444444', 'CUST-004', 'Hotel Sonargaon Restora', 'Kabir Ahmed (Manager)', '01715-998877', 'Board Bazar, Gazipur', 'Board Bazar', 'commercial', 50000.00, 10000.00, 24000.00)
ON CONFLICT (id) DO NOTHING;

-- 6. Suppliers
INSERT INTO public.suppliers (id, supplier_code, company_name, contact_person, phone, address, district, opening_balance, current_payable)
VALUES
  ('ssss1111-1111-1111-1111-111111111111', 'SUP-001', 'Bashundhara LP Gas Central Depot', 'Engr. Mahbubur Rahman', '01713-001122', 'Bashundhara Industrial Complex, Madanpur', 'Narayanganj', 150000.00, 112500.00),
  ('ssss2222-2222-2222-2222-222222222222', 'SUP-002', 'Omera Petroleum Regional Terminal', 'Saiful Islam (DSO)', '01714-334455', 'Ghorashal Terminal, Palash', 'Narsingdi', 80000.00, 64000.00),
  ('ssss3333-3333-3333-3333-333333333333', 'SUP-003', 'Jamuna Gas Distribution Hub', 'Tariqul Anam', '01811-667788', 'Bhaluka Plant Point', 'Mymensingh', 0.00, 32000.00)
ON CONFLICT (id) DO NOTHING;

-- 7. Vehicles & Drivers
INSERT INTO public.vehicles (id, registration_no, model, capacity_cylinders, status, driver_name)
VALUES
  ('vvvv1111-1111-1111-1111-111111111111', 'Dhaka Metro-TA-11-1234', 'Tata 407 (1.5 Ton)', 120, 'active', 'Rafiqul Islam'),
  ('vvvv2222-2222-2222-2222-222222222222', 'Dhaka Metro-TA-14-5678', 'Mahindra Bolero Maxi Truck', 80, 'active', 'Sohag Mia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drivers (id, name, phone, license_no, status, vehicle_id)
VALUES
  ('dddd1111-1111-1111-1111-111111111111', 'Rafiqul Islam', '01719-556677', 'DH-PROF-88492', 'active', 'vvvv1111-1111-1111-1111-111111111111'),
  ('dddd2222-2222-2222-2222-222222222222', 'Sohag Mia', '01822-443322', 'DH-PROF-33920', 'active', 'vvvv2222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;
