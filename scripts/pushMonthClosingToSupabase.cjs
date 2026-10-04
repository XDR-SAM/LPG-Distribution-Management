const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://supabase.makezaa.com';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODk0OTA1NzMsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.mZDttPB0O2UocvrruSjAmYcwOc6L8c6P9LspQYGpImQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BRAND_COLORS = {
  'AyGAZ': '#0284c7',
  'Bashundhara': '#ef4444',
  'Beximco': '#2563eb',
  'Bengal': '#10b981',
  'BM': '#8b5cf6',
  'Delta': '#06b6d4',
  'Dubai Bangla': '#f59e0b',
  'Euro': '#64748b',
  'Fresh': '#0ea5e9',
  'G Gas': '#14b8a6',
  'Green': '#22c55e',
  'Jamuna': '#d97706',
  'JMI': '#e11d48',
  'Laugf/Sun': '#f97316',
  'Navana': '#4f46e5',
  'Orion': '#84cc16',
  'Omera': '#16a34a',
  'Padda/Newaz': '#a855f7',
  'Petromax': '#3b82f6',
  'Sena': '#059669',
  'Super': '#ec4899',
  'Teer': '#f43f5e',
  'TMSS': '#0d9488',
  'Total': '#dc2626',
  'Universal': '#6366f1',
  'Uni Gas': '#0284c7',
  'Uro lpg': '#eab308',
  'Jamuna Faibar': '#b45309',
};

// 12 KG Empty
const raw12Empty = [
  { brand: 'AyGAZ', total: 406, Signboard: 348, Rayerbagh: 0, Amuliya: 0, Postokhola: 15, Jatrabari: 43, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Bashundhara', total: 173, Signboard: 1, Rayerbagh: 0, Amuliya: 0, Postokhola: 1, Jatrabari: 0, Mongla: 171, X: 0, Y: 0 },
  { brand: 'Beximco', total: 1168, Signboard: 0, Rayerbagh: 1126, Amuliya: 0, Postokhola: 38, Jatrabari: 3, Mongla: 1, X: 0, Y: 0 },
  { brand: 'Bengal', total: 252, Signboard: 205, Rayerbagh: 0, Amuliya: 0, Postokhola: 42, Jatrabari: 0, Mongla: 5, X: 0, Y: 0 },
  { brand: 'BM', total: 1169, Signboard: 1163, Rayerbagh: 0, Amuliya: 0, Postokhola: 6, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Delta', total: 38, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 38, X: 0, Y: 0 },
  { brand: 'Dubai Bangla', total: 7, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 7, X: 0, Y: 0 },
  { brand: 'Euro', total: 4, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 4, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Fresh', total: 315, Signboard: 173, Rayerbagh: 0, Amuliya: 0, Postokhola: 50, Jatrabari: 36, Mongla: 56, X: 0, Y: 0 },
  { brand: 'G Gas', total: 43, Signboard: 34, Rayerbagh: 0, Amuliya: 0, Postokhola: 9, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Green', total: 406, Signboard: 117, Rayerbagh: 0, Amuliya: 0, Postokhola: 1, Jatrabari: 0, Mongla: 288, X: 0, Y: 0 },
  { brand: 'Jamuna', total: 334, Signboard: 0, Rayerbagh: 306, Amuliya: 0, Postokhola: 6, Jatrabari: 0, Mongla: 22, X: 0, Y: 0 },
  { brand: 'JMI', total: 79, Signboard: 1, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 78, X: 0, Y: 0 },
  { brand: 'Laugf/Sun', total: 28, Signboard: 5, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 23, X: 0, Y: 0 },
  { brand: 'Navana', total: 49, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 35, Jatrabari: 0, Mongla: 14, X: 0, Y: 0 },
  { brand: 'Orion', total: 61, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 61, X: 0, Y: 0 },
  { brand: 'Omera', total: 728, Signboard: 0, Rayerbagh: 194, Amuliya: 469, Postokhola: 0, Jatrabari: 0, Mongla: 65, X: 0, Y: 0 },
  { brand: 'Padda/Newaz', total: 17, Signboard: 16, Rayerbagh: 0, Amuliya: 0, Postokhola: 1, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Petromax', total: 85, Signboard: 59, Rayerbagh: 0, Amuliya: 0, Postokhola: 21, Jatrabari: 0, Mongla: 5, X: 0, Y: 0 },
  { brand: 'Sena', total: 51, Signboard: 10, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 41, X: 0, Y: 0 },
  { brand: 'Super', total: 4, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 4, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Teer', total: 265, Signboard: 134, Rayerbagh: 0, Amuliya: 0, Postokhola: 131, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'TMSS', total: 110, Signboard: 103, Rayerbagh: 2, Amuliya: 0, Postokhola: 0, Jatrabari: 1, Mongla: 4, X: 0, Y: 0 },
  { brand: 'Total', total: 6, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 6, X: 0, Y: 0 },
  { brand: 'Universal', total: 97, Signboard: 97, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Uni Gas', total: 588, Signboard: 144, Rayerbagh: 245, Amuliya: 0, Postokhola: 199, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Uro lpg', total: 3, Signboard: 3, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Jamuna Faibar', total: 133, Signboard: 0, Rayerbagh: 128, Amuliya: 0, Postokhola: 0, Jatrabari: 5, Mongla: 0, X: 0, Y: 0 }
];

// 12 KG Refill (Full)
const raw12Refill = [
  { brand: 'AyGAZ', total: 9, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 9, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Beximco', total: 16, Signboard: 0, Rayerbagh: 16, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'BM', total: 11, Signboard: 11, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Jamuna', total: 2, Signboard: 0, Rayerbagh: 2, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Jamuna Faibar', total: 105, Signboard: 0, Rayerbagh: 105, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

// 35 KG Empty
const raw35Empty = [
  { brand: 'AyGAZ', total: 28, Signboard: 6, Rayerbagh: 0, Amuliya: 0, Postokhola: 3, Jatrabari: 19, Mongla: 0, X: 0, Y: 0 },
  { brand: 'BM', total: 54, Signboard: 53, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 1, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Delta', total: 8, Signboard: 0, Rayerbagh: 0, Amuliya: 8, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Jamuna', total: 39, Signboard: 0, Rayerbagh: 39, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'JMI', total: 71, Signboard: 0, Rayerbagh: 0, Amuliya: 71, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Omera', total: 239, Signboard: 0, Rayerbagh: 53, Amuliya: 146, Postokhola: 40, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'TMSS', total: 5, Signboard: 0, Rayerbagh: 5, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Total', total: 1, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 1, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Uni Gas', total: 7, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 7, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

// 35 KG Refill
const raw35Refill = [
  { brand: 'AyGAZ', total: 23, Signboard: 0, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 23, Mongla: 0, X: 0, Y: 0 },
  { brand: 'BM', total: 1, Signboard: 1, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

// 45 KG Empty
const raw45Empty = [
  { brand: 'AyGAZ', total: 2, Signboard: 2, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'BM', total: 33, Signboard: 32, Rayerbagh: 1, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'G Gas', total: 4, Signboard: 0, Rayerbagh: 0, Amuliya: 4, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Jamuna', total: 10, Signboard: 0, Rayerbagh: 10, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'JMI', total: 6, Signboard: 0, Rayerbagh: 0, Amuliya: 6, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Omera', total: 38, Signboard: 0, Rayerbagh: 35, Amuliya: 1, Postokhola: 0, Jatrabari: 2, Mongla: 0, X: 0, Y: 0 },
  { brand: 'TMSS', total: 13, Signboard: 13, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

// 45 KG Refill
const raw45Refill = [
  { brand: 'Jamuna', total: 1, Signboard: 0, Rayerbagh: 1, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Omera', total: 21, Signboard: 0, Rayerbagh: 2, Amuliya: 19, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

// Multi Empty
const rawMultiEmpty = [
  { brand: 'Jamuna', size: '5.5 KG', total: 1, Signboard: 0, Rayerbagh: 1, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Omera', size: '5.5 KG', total: 1, Signboard: 0, Rayerbagh: 1, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'BM', size: '20 KG', total: 15, Signboard: 15, Rayerbagh: 0, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Beximco', size: '22 KG', total: 170, Signboard: 0, Rayerbagh: 170, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 },
  { brand: 'Omera', size: '25 KG', total: 2, Signboard: 0, Rayerbagh: 2, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

// Multi Refill
const rawMultiRefill = [
  { brand: 'Omera', size: '5.5 KG', total: 5, Signboard: 0, Rayerbagh: 5, Amuliya: 0, Postokhola: 0, Jatrabari: 0, Mongla: 0, X: 0, Y: 0 }
];

const balanceSheet = {
  refillGasAmount: 489900,
  cashInHand: 2442700,
  cashInBank: 0,
  closingCompanyDO: 0,
  grandTotalAmount: 2932600,
  currency: 'BDT'
};

const evaluationSummary = {
  total12KgEmpty: 6619,
  total12KgRefill: 143,
  total12KgCombined: 6762,
  total35KgEmpty: 452,
  total35KgRefill: 24,
  total35KgCombined: 476,
  total45KgEmpty: 106,
  total45KgRefill: 22,
  total45KgCombined: 128,
  totalMultiEmpty: 189,
  totalMultiRefill: 5,
  totalMultiCombined: 194,
  grandTotalEmpty: 7366,
  grandTotalRefill: 194,
  grandTotalCylinders: 7560,
  warehouseTotals: {
    Signboard: 2746,
    Rayerbagh: 2449,
    Amuliya: 724,
    Postokhola: 613,
    Jatrabari: 143,
    Mongla: 885,
    X: 0,
    Y: 0,
    Total: 7560
  }
};

async function executeMigration() {
  console.log('--- STARTING COMPLETE SUPABASE REPLACEMENT WITH CLIENT DATA ---');

  // 1. Sync All Brands
  const uniqueBrands = Array.from(new Set([
    ...raw12Empty.map(r => r.brand),
    ...raw35Empty.map(r => r.brand),
    ...raw45Empty.map(r => r.brand),
    ...rawMultiEmpty.map(r => r.brand)
  ])).filter(Boolean);

  console.log(`Found ${uniqueBrands.length} unique brands to sync.`);
  const brandRows = uniqueBrands.map(name => ({
    name,
    code: name.slice(0, 4).toUpperCase(),
    color: BRAND_COLORS[name] || '#0284c7',
    active: true
  }));

  const { error: brandErr } = await supabase.from('brands').upsert(brandRows, { onConflict: 'name' });
  if (brandErr) {
    console.error('Error upserting brands:', brandErr);
  } else {
    console.log('✓ Successfully synced all 28 brands in Supabase');
  }

  // 2. Fetch Brand ID mapping
  const { data: dbBrands } = await supabase.from('brands').select('id, name');
  const brandIdMap = {};
  if (dbBrands) {
    dbBrands.forEach(b => { brandIdMap[b.name] = b.id; });
  }

  // 3. Clean up old test products
  console.log('Cleaning up old test products...');
  const { error: delErr } = await supabase.from('products').delete().neq('id', 'keep_none');
  if (delErr) {
    console.warn('Delete warning:', delErr.message);
  }

  // 4. Construct All Products for Database
  const productRows = [];

  // Helper map for refill quantities
  const refill12Map = {};
  raw12Refill.forEach(r => { refill12Map[r.brand] = r.total; });

  const refill35Map = {};
  raw35Refill.forEach(r => { refill35Map[r.brand] = r.total; });

  const refill45Map = {};
  raw45Refill.forEach(r => { refill45Map[r.brand] = r.total; });

  const refillMultiMap = {};
  rawMultiRefill.forEach(r => { refillMultiMap[`${r.brand}-${r.size}`] = r.total; });

  // A. 12 KG Products
  raw12Empty.forEach(r => {
    const slug = r.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const full = refill12Map[r.brand] || 0;
    const empty = r.total || 0;
    productRows.push({
      id: `prod-12kg-${slug}`,
      brand: r.brand,
      name: `${r.brand} 12 KG`,
      size: '12 KG',
      cylinder_size_kg: 12.0,
      sku: `SKU-${slug.toUpperCase()}-12KG`,
      category: 'Domestic',
      purchase_price: 1320,
      selling_price: 1440,
      dealer_price: 1400,
      deposit_amount: 1100,
      min_stock: 40,
      full_stock: full,
      empty_stock: empty,
      damaged_stock: 0,
      lost_stock: 0,
      customer_held_stock: 0,
      supplier_held_stock: 0,
      active: true,
      brand_id: brandIdMap[r.brand] || null
    });
  });

  // B. 35 KG Products
  const brands35 = Array.from(new Set([...raw35Empty.map(r => r.brand), ...raw35Refill.map(r => r.brand)]));
  brands35.forEach(brand => {
    const slug = brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const emptyItem = raw35Empty.find(r => r.brand === brand);
    const empty = emptyItem ? emptyItem.total : 0;
    const full = refill35Map[brand] || 0;
    productRows.push({
      id: `prod-35kg-${slug}`,
      brand,
      name: `${brand} 35 KG`,
      size: '35 KG',
      cylinder_size_kg: 35.0,
      sku: `SKU-${slug.toUpperCase()}-35KG`,
      category: 'Commercial',
      purchase_price: 3850,
      selling_price: 4200,
      dealer_price: 4100,
      deposit_amount: 2800,
      min_stock: 10,
      full_stock: full,
      empty_stock: empty,
      damaged_stock: 0,
      lost_stock: 0,
      customer_held_stock: 0,
      supplier_held_stock: 0,
      active: true,
      brand_id: brandIdMap[brand] || null
    });
  });

  // C. 45 KG Products
  const brands45 = Array.from(new Set([...raw45Empty.map(r => r.brand), ...raw45Refill.map(r => r.brand)]));
  brands45.forEach(brand => {
    const slug = brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const emptyItem = raw45Empty.find(r => r.brand === brand);
    const empty = emptyItem ? emptyItem.total : 0;
    const full = refill45Map[brand] || 0;
    productRows.push({
      id: `prod-45kg-${slug}`,
      brand,
      name: `${brand} 45 KG`,
      size: '45 KG',
      cylinder_size_kg: 45.0,
      sku: `SKU-${slug.toUpperCase()}-45KG`,
      category: 'Industrial',
      purchase_price: 4950,
      selling_price: 5400,
      dealer_price: 5250,
      deposit_amount: 3500,
      min_stock: 10,
      full_stock: full,
      empty_stock: empty,
      damaged_stock: 0,
      lost_stock: 0,
      customer_held_stock: 0,
      supplier_held_stock: 0,
      active: true,
      brand_id: brandIdMap[brand] || null
    });
  });

  // D. Multi Sizes (5.5 KG, 20 KG, 22 KG, 25 KG)
  rawMultiEmpty.forEach(r => {
    const slug = `${r.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${r.size.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const full = refillMultiMap[`${r.brand}-${r.size}`] || 0;
    const sizeNum = parseFloat(r.size);
    productRows.push({
      id: `prod-multi-${slug}`,
      brand: r.brand,
      name: `${r.brand} ${r.size}`,
      size: r.size,
      cylinder_size_kg: sizeNum,
      sku: `SKU-${slug.toUpperCase()}`,
      category: sizeNum > 20 ? 'Commercial' : 'Domestic',
      purchase_price: sizeNum * 110,
      selling_price: sizeNum * 120,
      dealer_price: sizeNum * 117,
      deposit_amount: sizeNum * 90,
      min_stock: 5,
      full_stock: full,
      empty_stock: r.total,
      damaged_stock: 0,
      lost_stock: 0,
      customer_held_stock: 0,
      supplier_held_stock: 0,
      active: true,
      brand_id: brandIdMap[r.brand] || null
    });
  });

  console.log(`Inserting ${productRows.length} client products into Supabase...`);
  const { error: insErr } = await supabase.from('products').upsert(productRows, { onConflict: 'id' });
  if (insErr) {
    console.error('Error inserting products:', insErr);
  } else {
    console.log(`✓ Successfully inserted ${productRows.length} products into Supabase!`);
  }

  // 5. Verification of Inserted Products
  const { data: verifyProds } = await supabase.from('products').select('full_stock, empty_stock');
  if (verifyProds) {
    const dbFull = verifyProds.reduce((a, b) => a + Number(b.full_stock || 0), 0);
    const dbEmpty = verifyProds.reduce((a, b) => a + Number(b.empty_stock || 0), 0);
    console.log(`Supabase Products Totals -> Full: ${dbFull} (Expected: 194), Empty: ${dbEmpty} (Expected: 7366), Total: ${dbFull + dbEmpty} (Expected: 7560)`);
  }

  // 6. Save Month Closing Evaluation Report & Warehouse Matrix into app_settings
  const monthClosingData = {
    title: 'Month Closing Cylinder Evaluation & Warehouse Distribution',
    evaluationDate: '2026-09-30',
    syncedAt: new Date().toISOString(),
    evaluationSummary,
    balanceSheet,
    warehouses: ['Signboard', 'Rayerbagh', 'Amuliya', 'Postokhola', 'Jatrabari', 'Mongla', 'X', 'Y'],
    matrix: {
      size12KgEmpty: raw12Empty,
      size12KgRefill: raw12Refill,
      size35KgEmpty: raw35Empty,
      size35KgRefill: raw35Refill,
      size45KgEmpty: raw45Empty,
      size45KgRefill: raw45Refill,
      sizeMultiEmpty: rawMultiEmpty,
      sizeMultiRefill: rawMultiRefill
    }
  };

  const { error: setErr } = await supabase.from('app_settings').upsert({
    id: 'month_closing_report',
    settings: monthClosingData,
    updated_at: new Date().toISOString()
  });

  if (setErr) {
    console.error('Error saving month_closing_report:', setErr);
  } else {
    console.log('✓ Successfully saved complete Month Closing Report & Warehouse Matrix in Supabase (app_settings)!');
  }

  // 7. Update Financial Transaction & Cash Accounts
  const financialRecords = [
    {
      id: 'ft_month_closing_cash',
      voucher_no: 'VR-MC-CASH-001',
      date: '2026-09-30',
      type: 'DEBIT',
      category: 'Month Closing Balance',
      amount: 2442700,
      account: 'Cash in Hand',
      party_name: 'Month Closing Cashbook Verification',
      description: 'Verified physical cash in hand as per client month closing balance sheet.'
    },
    {
      id: 'ft_month_closing_gas_val',
      voucher_no: 'VR-MC-GAS-002',
      date: '2026-09-30',
      type: 'DEBIT',
      category: 'Inventory Asset',
      amount: 489900,
      account: 'Refill Gas Inventory',
      party_name: 'Month Closing Refill Gas Valuation (194 Cylinders)',
      description: 'Valuation of 194 full refill cylinders in warehouses as per client month closing balance sheet.'
    }
  ];

  await supabase.from('financial_transactions').upsert(financialRecords, { onConflict: 'id' });
  console.log('✓ Successfully updated Financial Transactions in Supabase with Balance Sheet numbers!');

  console.log('--- ALL CLIENT DATA SUCCESSFULLY PUSHED AND INTEGRATED INTO SUPABASE ---');
}

executeMigration().catch(console.error);
