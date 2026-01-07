import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Decimal } from 'decimal.js';
import type { 
  FinancialTransaction, 
  FinancialHealthState, 
  TransactionType,
  HealthStatus 
} from '../types/schema';

// Generate UUID helper
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface FinancialHealthStore extends FinancialHealthState {
  // Actions
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  removeTransaction: (id: string) => void;
  getTransactionsByType: (type: TransactionType) => FinancialTransaction[];
  
  // Calculated metrics
  totalIncome: () => Decimal;
  totalExpenses: () => Decimal;
  availableCashFlow: () => Decimal;
  suggestedPaymentCapacity: () => Decimal;
  dtiRatio: () => number;
  healthStatus: () => HealthStatus;
}

const defaultState: FinancialHealthState = {
  transactions: [],
  lastUpdated: new Date().toISOString(),
};

export const useFinancialHealthStore = create<FinancialHealthStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addTransaction: (transaction) => {
        const newTransaction: FinancialTransaction = {
          ...transaction,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
          lastUpdated: new Date().toISOString(),
        }));
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...transaction,
                  id: t.id, // Mantener el ID original
                  createdAt: t.createdAt, // Mantener la fecha de creación original
                }
              : t
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      },

      getTransactionsByType: (type) => {
        const state = get();
        return state.transactions.filter((t) => t.type === type);
      },

      totalIncome: () => {
        const state = get();
        return state.transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum.plus(new Decimal(t.amount || 0)), new Decimal(0));
      },

      totalExpenses: () => {
        const state = get();
        return state.transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum.plus(new Decimal(t.amount || 0)), new Decimal(0));
      },

      availableCashFlow: () => {
        const income = get().totalIncome();
        const expenses = get().totalExpenses();
        return income.minus(expenses);
      },

      suggestedPaymentCapacity: () => {
        const available = get().availableCashFlow();
        // 80% of available cash flow (20% safety reserve)
        return available.times(0.80);
      },

      dtiRatio: () => {
        const income = get().totalIncome();
        const expenses = get().totalExpenses();
        
        if (income.equals(0)) {
          return 0;
        }
        
        return expenses.div(income).times(100).toNumber();
      },

      healthStatus: (): HealthStatus => {
        const dti = get().dtiRatio();
        
        if (dti < 50) {
          return 'excellent';
        } else if (dti <= 75) {
          return 'adjusted';
        } else {
          return 'critical';
        }
      },
    }),
    {
      name: 'financial_health_v1',
    }
  )
);

