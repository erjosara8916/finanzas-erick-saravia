import { Decimal } from 'decimal.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePrincipal(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Principal amount is required' };
  }

  try {
    const amount = new Decimal(value);
    if (amount.lte(0)) {
      return { isValid: false, error: 'Principal must be greater than 0' };
    }
    if (amount.gt(1000000000)) {
      return { isValid: false, error: 'Principal amount is too large' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid number format' };
  }
}

export function validateRate(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Annual rate is required' };
  }

  try {
    const rate = new Decimal(value);
    if (rate.lt(0)) {
      return { isValid: false, error: 'Rate cannot be negative' };
    }
    if (rate.gt(1000)) {
      return { isValid: false, error: 'Rate seems unusually high. Please verify.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid number format' };
  }
}

export function validateTermMonths(value: number): ValidationResult {
  if (!value || value <= 0) {
    return { isValid: false, error: 'Term must be greater than 0' };
  }
  if (!Number.isInteger(value)) {
    return { isValid: false, error: 'Term must be a whole number' };
  }
  if (value > 600) {
    return { isValid: false, error: 'Term cannot exceed 600 months (50 years)' };
  }
  return { isValid: true };
}

export function validateDate(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Start date is required' };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  return { isValid: true };
}

export function validateAmount(value: string, allowZero = true): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  try {
    const amount = new Decimal(value);
    if (amount.lt(0)) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }
    if (!allowZero && amount.lte(0)) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid number format' };
  }
}

