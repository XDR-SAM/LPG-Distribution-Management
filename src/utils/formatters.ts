/**
 * Format BDT currency with Bangladeshi Taka symbol: ৳
 * e.g., ৳ 45,500 or ৳ 1,25,000
 */
export function formatBDT(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '৳ 0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  
  // Format with standard locale or South Asian grouping
  const formatted = absAmount.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}৳ ${formatted}`;
}

/**
 * Format numbers with comma separation
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Format date for Bangladesh context: "14 Sep 2026"
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return String(dateStr);
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date with time: "14 Sep 2026, 04:30 PM"
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return String(dateStr);
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Validate Bangladesh phone numbers (e.g. 01712-345678, 018XXXXXXXX)
 */
export function isValidBDPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return /^01[3-9]\d{8}$/.test(cleaned);
}

/**
 * Format Bangladesh phone number with hyphen
 */
export function formatBDPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
  }
  return phone;
}
