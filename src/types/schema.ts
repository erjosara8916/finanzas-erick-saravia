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

