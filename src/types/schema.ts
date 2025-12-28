// User input data
export interface LoanInput {
  id: string;                 // UUID to differentiate future scenarios
  name: string;               // e.g., "Bank X Offer"
  principal: string;          // Loan amount (String for Decimal.js)
  annualRate: string;         // Annual rate %
  termMonths: number;         // Term in months
  startDate: string;          // ISO YYYY-MM-DD
  insuranceAmount: string;    // Fixed monthly insurance (USD)
  additionalFees: string;     // Other fixed monthly charges (USD)
  useFixedPayment?: boolean;  // Use fixed monthly payment instead of calculated
  fixedMonthlyPayment?: string; // Fixed monthly payment amount (USD)
}

// Extra payments (Map: Month -> Amount)
export interface ExtraPayments {
  [period: number]: string; 
}

// A calculated row of the table
export interface AmortizationRow {
  period: number;
  paymentDate: string;        // Calculated date
  monthlyPayment: number;     // What the client pays (Payment + Insurance + Extras)
  interestComponent: number;  // Pure interest
  principalComponent: number; // Pure capital (Payment - Interest + Extra)
  extraComponent: number;     // Extra payment visually broken down
  balance: number;            // Remaining balance
  sunkCostAccumulated: number;// (Interest + Insurance + Fees) accumulated
}

// Global state (prepared for Phase 2)
export interface AppState {
  scenarios: LoanInput[];     // Array of scenarios
  activeScenarioId: string;   // Which one we're viewing/editing
  extraPayments: Record<string, ExtraPayments>; // Scenario ID -> Payments
}

// Financial Health Types
export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 
  | 'salario_fijo' 
  | 'bonos_comisiones' 
  | 'renta_alquileres' 
  | 'inversiones'
  | 'otros';

export type ExpenseCategory = 
  | 'vivienda' 
  | 'alimentacion' 
  | 'transporte' 
  | 'servicios' 
  | 'deudas_existentes' 
  | 'ocio_vicios' 
  | 'educacion'
  | 'salud'
  | 'caridad_regalos'
  | 'familia'
  | 'otros';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: string; // String for Decimal.js compatibility
  description: string;
  category: IncomeCategory | ExpenseCategory;
  createdAt: string; // ISO date string
}

export interface FinancialHealthState {
  transactions: FinancialTransaction[];
  lastUpdated: string; // ISO date string
}

export type HealthStatus = 'excellent' | 'adjusted' | 'critical';


