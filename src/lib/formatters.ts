import { Decimal } from 'decimal.js';
import { format as formatDate } from 'date-fns';

// Format currency as USD
export function formatCurrency(amount: number | Decimal): string {
  const numValue = amount instanceof Decimal ? amount.toNumber() : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

// Parse currency string to Decimal
export function parseCurrency(value: string): Decimal {
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    return new Decimal(0);
  }
  
  return new Decimal(parsed);
}

// Format date for display
export function formatDateDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDate(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

// Format date as ISO string (YYYY-MM-DD)
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format months as years and months
export function formatMonthsToYearsAndMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
  }
  
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  
  return `${years} ${years === 1 ? 'año' : 'años'} ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
}

