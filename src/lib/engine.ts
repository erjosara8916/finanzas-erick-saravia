import { Decimal } from 'decimal.js';
import { addMonths, parseISO } from 'date-fns';
import type { LoanInput, ExtraPayments, AmortizationRow } from '../types/schema';

/**
 * Calculate the monthly payment for an amortizing loan
 * Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * P = Principal
 * r = Monthly interest rate (annual rate / 12)
 * n = Number of payments
 */
function calculateMonthlyPayment(
  principal: Decimal,
  annualRate: Decimal,
  termMonths: number
): Decimal {
  if (termMonths === 0) {
    return new Decimal(0);
  }

  const monthlyRate = annualRate.div(100).div(12);
  const numPayments = new Decimal(termMonths);

  if (monthlyRate.equals(0)) {
    // If no interest, just divide principal by months
    return principal.div(numPayments);
  }

  const onePlusRate = new Decimal(1).plus(monthlyRate);
  const numerator = monthlyRate.times(onePlusRate.pow(numPayments));
  const denominator = onePlusRate.pow(numPayments).minus(1);

  return principal.times(numerator.div(denominator));
}

/**
 * Calculate the complete amortization table
 */
export function calculateAmortizationTable(
  input: LoanInput,
  extras: ExtraPayments
): AmortizationRow[] {
  // Validate inputs
  const principal = new Decimal(input.principal || 0);
  const annualRate = new Decimal(input.annualRate || 0);
  const termMonths = input.termMonths || 0;
  const insurance = new Decimal(input.insuranceAmount || 0);
  const fees = new Decimal(input.additionalFees || 0);
  const startDate = parseISO(input.startDate);

  // Validation
  if (principal.lte(0) || annualRate.lt(0) || termMonths <= 0) {
    return [];
  }

  const rows: AmortizationRow[] = [];
  let balance = principal;
  let sunkCostAccumulated = new Decimal(0);
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const monthlyRate = annualRate.div(100).div(12);
  let currentDate = startDate;
  let period = 1;

  // Calculate each period until balance is paid off
  while (balance.gt(0) && period <= termMonths * 2) { // Safety limit: 2x term
    const interestForPeriod = balance.times(monthlyRate);
    const extraPayment = new Decimal(extras[period] || 0);
    
    // Check if this is the last payment (balance is small or we've reached the term)
    const remainingAfterInterest = balance.minus(interestForPeriod);
    const isLastPayment = remainingAfterInterest.lte(0.01) || (period === termMonths && balance.lte(monthlyPayment.plus(0.01)));
    
    let actualPrincipalReduction: Decimal;
    let actualExtraPayment: Decimal;
    let finalRegularPayment: Decimal;
    
    if (isLastPayment) {
      // Last payment: pay remaining balance + interest
      actualPrincipalReduction = balance;
      actualExtraPayment = new Decimal(0); // No extra payment on last payment
      finalRegularPayment = balance.plus(interestForPeriod);
      balance = new Decimal(0);
    } else {
      // Regular payment: calculate principal from payment
      let principalFromPayment = monthlyPayment.minus(interestForPeriod);
      
      // If principal from payment is negative, adjust
      if (principalFromPayment.lt(0)) {
        principalFromPayment = new Decimal(0);
      }

      // Total principal reduction (from payment + extra)
      const totalPrincipalReduction = principalFromPayment.plus(extraPayment);
      
      // Adjust if it would make balance negative
      actualPrincipalReduction = totalPrincipalReduction.gt(balance) 
        ? balance 
        : totalPrincipalReduction;

      // Calculate actual extra payment applied
      actualExtraPayment = actualPrincipalReduction.gt(principalFromPayment)
        ? actualPrincipalReduction.minus(principalFromPayment)
        : new Decimal(0);

      // Update balance
      balance = balance.minus(actualPrincipalReduction);
      finalRegularPayment = monthlyPayment;
    }

    // Calculate total monthly payment (payment + insurance + fees + extra)
    const totalMonthlyPayment = finalRegularPayment.plus(insurance).plus(fees).plus(actualExtraPayment);

    // Update sunk cost (interest + insurance + fees)
    sunkCostAccumulated = sunkCostAccumulated.plus(interestForPeriod).plus(insurance).plus(fees);

    // Calculate actual principal component (may differ from calculated if it's the last payment)
    const actualPrincipalComponent = actualPrincipalReduction;

    rows.push({
      period,
      paymentDate: currentDate.toISOString().split('T')[0],
      monthlyPayment: totalMonthlyPayment.toNumber(),
      interestComponent: interestForPeriod.toNumber(),
      principalComponent: actualPrincipalComponent.toNumber(),
      extraComponent: actualExtraPayment.toNumber(),
      balance: balance.toNumber(),
      sunkCostAccumulated: sunkCostAccumulated.toNumber(),
    });

    // Move to next month
    currentDate = addMonths(currentDate, 1);
    period++;

    // If balance is zero or negative, stop
    if (balance.lte(0)) {
      break;
    }
  }

  return rows;
}

/**
 * Calculate summary metrics from amortization table
 */
export interface LoanSummary {
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
  totalSunkCost: number;
  actualTermMonths: number;
}

export function calculateLoanSummary(rows: AmortizationRow[]): LoanSummary {
  if (rows.length === 0) {
    return {
      totalPaid: 0,
      totalInterest: 0,
      totalPrincipal: 0,
      totalSunkCost: 0,
      actualTermMonths: 0,
    };
  }

  const totalPaid = rows.reduce((sum, row) => sum + row.monthlyPayment, 0);
  const totalInterest = rows.reduce((sum, row) => sum + row.interestComponent, 0);
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principalComponent, 0);
  const lastRow = rows[rows.length - 1];
  const totalSunkCost = lastRow.sunkCostAccumulated;
  const actualTermMonths = rows.length;

  return {
    totalPaid,
    totalInterest,
    totalPrincipal,
    totalSunkCost,
    actualTermMonths,
  };
}

