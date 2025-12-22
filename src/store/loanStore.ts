import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, LoanInput, ExtraPayments } from '../types/schema';

// Generate UUID helper
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface LoanStore extends AppState {
  // Actions
  updateLoanInput: (input: Partial<LoanInput>) => void;
  addExtraPayment: (period: number, amount: string) => void;
  removeExtraPayment: (period: number) => void;
  removeAllExtraPayments: () => void;
  setActiveScenario: (id: string) => void;
  resetScenario: () => void;
  getActiveLoanInput: () => LoanInput | null;
  getActiveExtraPayments: () => ExtraPayments;
}

const createDefaultLoanInput = (): LoanInput => ({
  id: generateUUID(),
  name: 'Default Scenario',
  principal: '',
  annualRate: '',
  termMonths: 0,
  startDate: new Date().toISOString().split('T')[0],
  insuranceAmount: '0',
  additionalFees: '0',
  useFixedPayment: false,
  fixedMonthlyPayment: '',
});

const defaultState: AppState = {
  scenarios: [createDefaultLoanInput()],
  activeScenarioId: '',
  extraPayments: {},
};

// Initialize default state with active scenario ID
const initialState: AppState = {
  ...defaultState,
  activeScenarioId: defaultState.scenarios[0].id,
};

export const useLoanStore = create<LoanStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateLoanInput: (input) => {
        const state = get();
        const activeId = state.activeScenarioId;
        
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === activeId
              ? { ...scenario, ...input }
              : scenario
          ),
        }));
      },

      addExtraPayment: (period, amount) => {
        const state = get();
        const activeId = state.activeScenarioId;
        const currentExtras = state.extraPayments[activeId] || {};
        
        set((state) => ({
          extraPayments: {
            ...state.extraPayments,
            [activeId]: {
              ...currentExtras,
              [period]: amount,
            },
          },
        }));
      },

      removeExtraPayment: (period) => {
        const state = get();
        const activeId = state.activeScenarioId;
        const currentExtras = state.extraPayments[activeId] || {};
        const rest = { ...currentExtras };
        delete rest[period];
        
        set((state) => ({
          extraPayments: {
            ...state.extraPayments,
            [activeId]: rest,
          },
        }));
      },

      removeAllExtraPayments: () => {
        const state = get();
        const activeId = state.activeScenarioId;
        
        set((state) => ({
          extraPayments: {
            ...state.extraPayments,
            [activeId]: {},
          },
        }));
      },

      setActiveScenario: (id) => {
        set({ activeScenarioId: id });
      },

      resetScenario: () => {
        const state = get();
        const activeId = state.activeScenarioId;
        const defaultInput = createDefaultLoanInput();
        defaultInput.id = activeId;
        
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === activeId ? defaultInput : scenario
          ),
          extraPayments: {
            ...state.extraPayments,
            [activeId]: {},
          },
        }));
      },

      getActiveLoanInput: () => {
        const state = get();
        return state.scenarios.find((s) => s.id === state.activeScenarioId) || null;
      },

      getActiveExtraPayments: () => {
        const state = get();
        return state.extraPayments[state.activeScenarioId] || {};
      },
    }),
    {
      name: 'loan_simulator_v1',
    }
  )
);

