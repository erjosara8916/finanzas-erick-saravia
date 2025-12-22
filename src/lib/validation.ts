import { Decimal } from 'decimal.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePrincipal(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'El monto principal es requerido' };
  }

  try {
    const amount = new Decimal(value);
    if (amount.lte(0)) {
      return { isValid: false, error: 'El monto principal debe ser mayor que 0' };
    }
    if (amount.gt(1000000000)) {
      return { isValid: false, error: 'El monto principal es demasiado grande' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Formato de número inválido' };
  }
}

export function validateRate(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'La tasa anual es requerida' };
  }

  try {
    const rate = new Decimal(value);
    if (rate.lt(0)) {
      return { isValid: false, error: 'La tasa no puede ser negativa' };
    }
    if (rate.gt(1000)) {
      return { isValid: false, error: 'La tasa parece inusualmente alta. Por favor verifica.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Formato de número inválido' };
  }
}

export function validateTermMonths(value: number): ValidationResult {
  if (!value || value <= 0) {
    return { isValid: false, error: 'El plazo debe ser mayor que 0' };
  }
  if (!Number.isInteger(value)) {
    return { isValid: false, error: 'El plazo debe ser un número entero' };
  }
  if (value > 600) {
    return { isValid: false, error: 'El plazo no puede exceder 600 meses (50 años)' };
  }
  return { isValid: true };
}

export function validateDate(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'La fecha de inicio es requerida' };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Formato de fecha inválido' };
  }

  return { isValid: true };
}

export function validateAmount(value: string, allowZero = true): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'El monto es requerido' };
  }

  try {
    const amount = new Decimal(value);
    if (amount.lt(0)) {
      return { isValid: false, error: 'El monto no puede ser negativo' };
    }
    if (!allowZero && amount.lte(0)) {
      return { isValid: false, error: 'El monto debe ser mayor que 0' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Formato de número inválido' };
  }
}

