import { Customer, CylinderProduct, Sale, Purchase, StockMovement, CustomerCylinderLedgerEntry, FinancialTransaction, Expense } from '../types';

/**
 * Escapes a single CSV cell value, wrapping with quotes if it contains commas, quotes, or newlines.
 */
export function escapeCSVCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts array of objects or rows to CSV string with UTF-8 BOM for full Excel/Google Sheets compatibility
 */
export function buildCSV(headers: { key: string; label: string }[], rows: any[]): string {
  const headerLine = headers.map(h => escapeCSVCell(h.label)).join(',');
  const rowLines = rows.map(row => 
    headers.map(h => escapeCSVCell(row[h.key] ?? '')).join(',')
  );
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Triggers a client-side file download for CSV with UTF-8 BOM
 */
export function downloadCSVFile(filename: string, csvContent: string): void {
  // Prepend UTF-8 BOM (\uFEFF) so Excel opens Bangla text and numbers seamlessly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const downloadCSV = downloadCSVFile;

/**
 * Triggers a client-side file download for JSON
 */
export function downloadJSONFile(filename: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =========================================================================
// MODULE SPECIFIC CSV EXPORTERS
// =========================================================================

export function exportCustomersToCSV(customers: Customer[]): string {
  const headers = [
    { key: 'code', label: 'Customer Code' },
    { key: 'businessName', label: 'Business / Shop Name' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'customerType', label: 'Customer Type' },
    { key: 'area', label: 'Area' },
    { key: 'address', label: 'Address' },
    { key: 'creditLimit', label: 'Credit Limit (BDT)' },
    { key: 'currentDue', label: 'Current Financial Due (BDT)' },
    { key: 'status', label: 'Status' },
    { key: 'bin', label: 'VAT/BIN No' },
    { key: 'createdAt', label: 'Created Date' },
  ];

  return buildCSV(headers, customers);
}

export function exportProductsToCSV(products: CylinderProduct[]): string {
  const headers = [
    { key: 'sku', label: 'SKU / Item Code' },
    { key: 'brand', label: 'LPG Brand' },
    { key: 'size', label: 'Cylinder Size' },
    { key: 'category', label: 'Category' },
    { key: 'fullStock', label: 'Full Cylinders Stock' },
    { key: 'emptyStock', label: 'Empty Cylinders Stock' },
    { key: 'damagedStock', label: 'Damaged Stock' },
    { key: 'lostStock', label: 'Lost Stock' },
    { key: 'customerHeldStock', label: 'Cylinders with Customers' },
    { key: 'supplierHeldStock', label: 'Cylinders at Plant' },
    { key: 'sellingPrice', label: 'Selling Price (Refill) BDT' },
    { key: 'purchasePrice', label: 'Purchase Cost BDT' },
    { key: 'dealerPrice', label: 'Dealer Price BDT' },
    { key: 'depositAmount', label: 'Security Deposit BDT' },
    { key: 'minStock', label: 'Min Alert Stock' },
  ];

  return buildCSV(headers, products);
}

export function exportSalesToCSV(sales: Sale[]): string {
  const headers = [
    { key: 'invoiceNo', label: 'Invoice No' },
    { key: 'date', label: 'Date' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerPhone', label: 'Customer Phone' },
    { key: 'totalFullQty', label: 'Full Cylinders Qty' },
    { key: 'totalEmptyReceived', label: 'Empty Returned Qty' },
    { key: 'netCylinderDueAdded', label: 'Net Cylinder Due' },
    { key: 'subtotal', label: 'Subtotal (BDT)' },
    { key: 'discount', label: 'Discount (BDT)' },
    { key: 'transportCharge', label: 'Transport Charge' },
    { key: 'grandTotal', label: 'Grand Total (BDT)' },
    { key: 'amountPaid', label: 'Amount Paid (BDT)' },
    { key: 'currentDue', label: 'Remaining Due (BDT)' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'status', label: 'Payment Status' },
    { key: 'notes', label: 'Notes' },
  ];

  return buildCSV(headers, sales);
}

export function exportPurchasesToCSV(purchases: Purchase[]): string {
  const headers = [
    { key: 'purchaseNo', label: 'Purchase No' },
    { key: 'supplierInvoiceRef', label: 'Supplier Ref No' },
    { key: 'date', label: 'Date' },
    { key: 'supplierName', label: 'Supplier Company' },
    { key: 'totalFullReceived', label: 'Full Cylinders Received' },
    { key: 'totalEmptySent', label: 'Empty Sent to Plant' },
    { key: 'netSupplierCylinderDue', label: 'Net Cylinder Difference' },
    { key: 'subtotal', label: 'Subtotal (BDT)' },
    { key: 'transportCost', label: 'Transport Cost' },
    { key: 'loadingCost', label: 'Loading Cost' },
    { key: 'grandTotal', label: 'Grand Total (BDT)' },
    { key: 'paidAmount', label: 'Paid Amount (BDT)' },
    { key: 'dueAmount', label: 'Due Payable (BDT)' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'status', label: 'Status' },
  ];

  return buildCSV(headers, purchases);
}

export function exportStockMovementsToCSV(movements: StockMovement[]): string {
  const headers = [
    { key: 'date', label: 'Date & Time' },
    { key: 'reference', label: 'Reference Voucher' },
    { key: 'movementType', label: 'Movement Type' },
    { key: 'brand', label: 'Brand' },
    { key: 'size', label: 'Size' },
    { key: 'fullQty', label: 'Full Qty Change' },
    { key: 'emptyQty', label: 'Empty Qty Change' },
    { key: 'user', label: 'Handled By' },
    { key: 'notes', label: 'Remarks / Notes' },
  ];

  return buildCSV(headers, movements);
}

export function exportCustomerCylinderLedgerToCSV(ledger: CustomerCylinderLedgerEntry[]): string {
  const headers = [
    { key: 'date', label: 'Date' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'reference', label: 'Invoice / Receipt Ref' },
    { key: 'brand', label: 'LPG Brand' },
    { key: 'size', label: 'Size' },
    { key: 'fullDelivered', label: 'Full Cylinders Delivered' },
    { key: 'emptyReturned', label: 'Empty Cylinders Returned' },
    { key: 'damaged', label: 'Damaged' },
    { key: 'balanceCylinders', label: 'Net Change' },
    { key: 'notes', label: 'Particulars / Notes' },
  ];

  return buildCSV(headers, ledger);
}

export function exportTransactionsToCSV(transactions: FinancialTransaction[]): string {
  const headers = [
    { key: 'voucherNo', label: 'Voucher No' },
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Transaction Type' },
    { key: 'account', label: 'Account' },
    { key: 'partyName', label: 'Party / Account Head' },
    { key: 'debit', label: 'Cash In (Debit BDT)' },
    { key: 'credit', label: 'Cash Out (Credit BDT)' },
    { key: 'description', label: 'Description' },
    { key: 'reference', label: 'Reference' },
  ];

  return buildCSV(headers, transactions);
}

export function exportExpensesToCSV(expenses: Expense[]): string {
  const headers = [
    { key: 'voucherNo', label: 'Voucher No' },
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Expense Category' },
    { key: 'amount', label: 'Amount (BDT)' },
    { key: 'paymentAccount', label: 'Payment Account' },
    { key: 'paidTo', label: 'Paid To' },
    { key: 'approvedBy', label: 'Approved By' },
    { key: 'description', label: 'Description' },
  ];

  return buildCSV(headers, expenses);
}

// =========================================================================
// CSV PARSING & IMPORT ENGINE
// =========================================================================

/**
 * Parses raw CSV text handling quotes, commas, escaped quotes and CRLF
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  // Strip BOM if present
  let text = csvText.replace(/^\uFEFF/, '').trim();
  if (!text) return { headers: [], rows: [] };

  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\r' && nextChar === '\n') && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
      i++;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  // Parse header
  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const nc = line[i + 1];
      if (c === '"') {
        if (inside && nc === '"') {
          field += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === ',' && !inside) {
        fields.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map(h => h.trim());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Returns blank CSV template with instructions for Customer bulk import
 */
export function getCustomerCSVTemplate(): string {
  const headers = [
    { key: 'code', label: 'Customer Code' },
    { key: 'businessName', label: 'Business / Shop Name*' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone Number*' },
    { key: 'customerType', label: 'Customer Type (retail_shop/dealer/restaurant/hotel/commercial)' },
    { key: 'area', label: 'Area' },
    { key: 'address', label: 'Address' },
    { key: 'creditLimit', label: 'Credit Limit (BDT)' },
    { key: 'openingBalance', label: 'Opening Balance (BDT)' },
    { key: 'bin', label: 'VAT/BIN No' },
  ];

  const sampleRows = [
    {
      code: 'CUST-050',
      businessName: 'Bismillah Gas & Store',
      contactPerson: 'Abdur Rahim',
      phone: '01711-223344',
      customerType: 'retail_shop',
      area: 'Mohammadpur',
      address: '22 Ring Road, Dhaka',
      creditLimit: '50000',
      openingBalance: '0',
      bin: '123456789-0101',
    },
    {
      code: 'CUST-051',
      businessName: 'Cafe Al-Madina',
      contactPerson: 'Tareq Hossain',
      phone: '01819-887766',
      customerType: 'restaurant',
      area: 'Dhanmondi',
      address: 'Road 27, Dhanmondi',
      creditLimit: '30000',
      openingBalance: '1500',
      bin: '',
    },
  ];

  return buildCSV(headers, sampleRows);
}

/**
 * Returns blank CSV template with instructions for Product/Stock bulk import
 */
export function getProductCSVTemplate(): string {
  const headers = [
    { key: 'sku', label: 'SKU / Item Code*' },
    { key: 'brand', label: 'Brand (Bashundhara/Omera/Jamuna/Beximco/BM)*' },
    { key: 'size', label: 'Size (12 KG/35 KG/45 KG)*' },
    { key: 'category', label: 'Category' },
    { key: 'fullStock', label: 'Initial Full Stock' },
    { key: 'emptyStock', label: 'Initial Empty Stock' },
    { key: 'sellingPrice', label: 'Selling Price (BDT)*' },
    { key: 'purchasePrice', label: 'Purchase Cost (BDT)*' },
    { key: 'dealerPrice', label: 'Dealer Price (BDT)' },
    { key: 'depositAmount', label: 'Security Deposit (BDT)' },
  ];

  const sampleRows = [
    {
      sku: 'LPG-BASH-12',
      brand: 'Bashundhara',
      size: '12 KG',
      category: 'Commercial / Household',
      fullStock: '120',
      emptyStock: '45',
      sellingPrice: '1450',
      purchasePrice: '1380',
      dealerPrice: '1410',
      depositAmount: '2200',
    },
    {
      sku: 'LPG-OMERA-12',
      brand: 'Omera',
      size: '12 KG',
      category: 'Commercial / Household',
      fullStock: '85',
      emptyStock: '30',
      sellingPrice: '1440',
      purchasePrice: '1370',
      dealerPrice: '1400',
      depositAmount: '2200',
    },
  ];

  return buildCSV(headers, sampleRows);
}

/**
 * Validates and transforms parsed CSV into Customer objects
 */
export function parseCustomersFromCSV(csvText: string): { valid: Partial<Customer>[]; errors: string[] } {
  const { rows } = parseCSV(csvText);
  const valid: Partial<Customer>[] = [];
  const errors: string[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // +1 for header, +1 for 1-based line
    // Find fields regardless of slight header variations
    const businessName = row['Business / Shop Name*'] || row['Business / Shop Name'] || row['businessName'] || row['Name'] || '';
    const phone = row['Phone Number*'] || row['Phone Number'] || row['phone'] || '';
    const code = row['Customer Code'] || row['code'] || `CUST-IMP-${idx + 1}`;
    const contactPerson = row['Contact Person'] || row['contactPerson'] || '';
    const area = row['Area'] || row['area'] || 'Dhaka';
    const address = row['Address'] || row['address'] || '';
    const rawType = (row['Customer Type (retail_shop/dealer/restaurant/hotel/commercial)'] || row['Customer Type'] || row['customerType'] || 'retail_shop').toLowerCase().trim();
    const customerType = ['dealer', 'retail_shop', 'restaurant', 'hotel', 'commercial', 'other'].includes(rawType) 
      ? (rawType as any) 
      : 'retail_shop';
    const creditLimit = parseFloat(row['Credit Limit (BDT)'] || row['creditLimit'] || '0') || 0;
    const openingBalance = parseFloat(row['Opening Balance (BDT)'] || row['openingBalance'] || '0') || 0;
    const bin = row['VAT/BIN No'] || row['bin'] || '';

    if (!businessName.trim()) {
      errors.push(`Row ${rowNum}: Business / Shop Name is required.`);
      return;
    }
    if (!phone.trim()) {
      errors.push(`Row ${rowNum}: Phone number is required for "${businessName}".`);
      return;
    }

    valid.push({
      code: code.trim(),
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      area: area.trim(),
      address: address.trim(),
      customerType,
      creditLimit,
      openingBalance,
      currentDue: openingBalance,
      bin: bin.trim(),
      status: 'active',
    });
  });

  return { valid, errors };
}

/**
 * Validates and transforms parsed CSV into CylinderProduct objects
 */
export function parseProductsFromCSV(csvText: string): { valid: Partial<CylinderProduct>[]; errors: string[] } {
  const { rows } = parseCSV(csvText);
  const valid: Partial<CylinderProduct>[] = [];
  const errors: string[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const sku = row['SKU / Item Code*'] || row['SKU / Item Code'] || row['sku'] || '';
    const brand = row['Brand (Bashundhara/Omera/Jamuna/Beximco/BM)*'] || row['Brand'] || row['brand'] || '';
    const size = row['Size (12 KG/35 KG/45 KG)*'] || row['Size'] || row['size'] || '12 KG';
    const category = row['Category'] || row['category'] || 'LPG Cylinder';
    const fullStock = parseInt(row['Initial Full Stock'] || row['fullStock'] || '0', 10) || 0;
    const emptyStock = parseInt(row['Initial Empty Stock'] || row['emptyStock'] || '0', 10) || 0;
    const sellingPrice = parseFloat(row['Selling Price (BDT)*'] || row['Selling Price'] || row['sellingPrice'] || '0') || 0;
    const purchasePrice = parseFloat(row['Purchase Cost (BDT)*'] || row['Purchase Cost (BDT)'] || row['purchasePrice'] || row['Cost Price (BDT)*'] || '0') || 0;
    const dealerPrice = parseFloat(row['Dealer Price (BDT)'] || row['dealerPrice'] || '0') || sellingPrice;
    const depositAmount = parseFloat(row['Security Deposit (BDT)'] || row['depositAmount'] || '0') || 2200;

    if (!sku.trim()) {
      errors.push(`Row ${rowNum}: SKU is required.`);
      return;
    }
    if (!brand.trim()) {
      errors.push(`Row ${rowNum}: Brand is required for SKU ${sku}.`);
      return;
    }

    valid.push({
      sku: sku.trim().toUpperCase(),
      brand: brand.trim(),
      size: size.trim() as any,
      category,
      fullStock,
      emptyStock,
      damagedStock: 0,
      lostStock: 0,
      customerHeldStock: 0,
      supplierHeldStock: 0,
      sellingPrice,
      purchasePrice,
      dealerPrice,
      depositAmount,
      minStock: 15,
      active: true,
    });
  });

  return { valid, errors };
}

