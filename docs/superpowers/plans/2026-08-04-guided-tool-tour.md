# Guided Tool Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the driver.js-powered guided tour for the loan simulator and financial health calculator described in `spec/learning/review.md` (Part 2), auto-starting on each tool's first visit and replayable on demand.

**Architecture:** A single shared `useTour` hook wraps `driver.js`, taking a step array and a `localStorage` key; two step-config files (one per tool) describe what to highlight; a handful of existing components gain `data-tour`/`data-step-index` attributes so the steps have stable selectors to target. Each tool's page component wires the hook to a new "¿Cómo funciona?" button and to its own auto-start condition.

**Tech Stack:** React 19 (existing islands), `driver.js` ^1.8.0 (new dependency), Tailwind CSS (dark-mode overrides for the popover), `localStorage` (tour-seen flags — no Zustand store, no new persistence layer).

## Global Constraints

- This repo has **no test runner** (no Jest/Vitest, no test script — confirmed in `CLAUDE.md`). Every task's verification step uses `npm run build` (type-check + build) and `npm run lint` (`--max-warnings 0`, so zero tolerance for lint warnings), plus a manual check in the dev server (`npm run dev`) — not automated tests.
- Money/loan business logic (`src/lib/engine.ts`) is untouched by this feature — the tour only reads the DOM, it does not participate in loan math.
- TypeScript `strict: true` is on — all new files must be fully typed, no `any`.
- Money values, business rules, and existing component behavior must not change — this plan only adds new files and adds non-visual `data-*` attributes / a header button to existing components.
- Follow existing conventions: Spanish UI copy throughout, `cn()` from `../../lib/utils` for conditional classnames, `Button`/`Card` primitives from `src/components/ui/`, path style `../../` relative imports (no `@/` alias in use inside `src/components`/`src/hooks`/`src/lib` — confirmed by existing files).
- **Known trade-off (intentional, not a bug):** on `LoanProjectionPage`, the tour does not auto-start on a visit where the "complete tu salud financiera" recommendation modal is also about to show (i.e., when the user has no financial-health data yet) — showing both a full-screen modal and a tour overlay at once would be a broken, overlapping UI. The tour auto-starts on a later visit once financial-health data exists, and remains reachable anytime via the manual "¿Cómo funciona?" button. `FinancialHealthPage` has no competing modal on mount, so its tour always auto-starts on first visit.
- **Known trade-off (intentional, not a bug):** both pages gate their step content behind a `Stepper` (`activeStep` state), and the second step's content (`ExtraPaymentsManager` on the loan page; `TransactionSummary`/`HealthGaugeChart` on the financial health page) isn't in the DOM until the user clicks into that step — so it can't be highlighted directly on a first-open auto-tour without also driving the stepper's state from inside the tour (out of scope here). Both tours instead highlight the `Stepper`'s second tab (`[data-step-index="1"]`) itself and describe that step's purpose in the popover text, rather than skipping it.

---

## Task 1: `driver.js` dependency, dark-mode styling, shared `useTour` hook

**Files:**
- Modify: `package.json`
- Modify: `src/index.css`
- Create: `src/hooks/useTour.ts`

**Interfaces:**
- Produces: `useTour(steps: DriveStep[], storageKey: string, options?: { enabled?: boolean }): { startTour: () => void }` — imported by Task 2 and Task 3 as `import { useTour } from '../../hooks/useTour'`. `DriveStep` is re-exported by the `driver.js` package itself (`import type { DriveStep } from 'driver.js'`), used by Task 2's step-config files.

- [ ] **Step 1: Add the `driver.js` dependency**

Edit `package.json`, in the `dependencies` block, insert `"driver.js": "^1.8.0"` alphabetically between `"decimal.js"` and `"jspdf"`:

```json
    "decimal.js": "^10.4.3",
    "driver.js": "^1.8.0",
    "jspdf": "^3.0.4",
```

- [ ] **Step 2: Install it**

Run: `npm install`
Expected: `package-lock.json` updates to include `driver.js`; install completes with no errors.

- [ ] **Step 3: Add the CSS import and dark-mode popover overrides**

Edit `src/index.css`. Add the driver.js stylesheet import right after the existing `@fontsource` imports (CSS requires `@import` statements before other rules, so it must stay above the `@tailwind` directives):

```css
@import '@fontsource/geist-mono/600.css';
@import 'driver.js/dist/driver.css';

@tailwind base;
```

Then append this block at the end of the file (it follows the same `.dark` scoping pattern already used for `.custom-scrollbar` and `select option` further up in this file):

```css
/* Driver.js tour popover — dark mode override to match the app's theme */
.dark .driver-popover {
  background-color: #1f2937; /* gray-800 */
  color: #f3f4f6; /* gray-100 */
}

.dark .driver-popover-title,
.dark .driver-popover-description,
.dark .driver-popover-progress-text {
  color: #f3f4f6;
}

.dark .driver-popover-close-btn {
  color: #9ca3af; /* gray-400 */
}

.dark .driver-popover-close-btn:hover {
  color: #f3f4f6;
}

.dark .driver-popover-footer-btn {
  background-color: #ea580c; /* orange-600, matches Button's primary variant */
  color: #ffffff;
  border-color: #ea580c;
  text-shadow: none;
}

.dark .driver-popover-footer-btn:hover {
  background-color: #c2410c; /* orange-700 */
}

.dark .driver-popover-arrow-side-left.driver-popover-arrow {
  border-left-color: #1f2937;
}

.dark .driver-popover-arrow-side-right.driver-popover-arrow {
  border-right-color: #1f2937;
}

.dark .driver-popover-arrow-side-top.driver-popover-arrow {
  border-top-color: #1f2937;
}

.dark .driver-popover-arrow-side-bottom.driver-popover-arrow {
  border-bottom-color: #1f2937;
}
```

- [ ] **Step 4: Create the shared `useTour` hook**

Create `src/hooks/useTour.ts`:

```ts
import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';

interface UseTourOptions {
  enabled?: boolean;
}

/**
 * Wraps driver.js: auto-starts the tour once per browser (tracked via
 * `storageKey` in localStorage) and exposes `startTour` to replay it manually.
 */
export function useTour(steps: DriveStep[], storageKey: string, options: UseTourOptions = {}) {
  const { enabled = true } = options;
  const hasAutoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    const tourDriver = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps,
      onDestroyed: () => {
        localStorage.setItem(storageKey, 'true');
      },
    });
    tourDriver.drive();
  }, [steps, storageKey]);

  useEffect(() => {
    if (!enabled || hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;
    if (!localStorage.getItem(storageKey)) {
      startTour();
    }
  }, [enabled, startTour]);

  return { startTour };
}
```

- [ ] **Step 5: Verify it builds and lints clean**

Run: `npm run build && npm run lint`
Expected: both succeed — `astro check` resolves the `driver.js` types, `useTour.ts` has zero type errors, and `npm run lint` reports zero warnings (the `--max-warnings 0` gate).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/index.css src/hooks/useTour.ts
git commit -m "feat: add driver.js and shared useTour hook for guided tool tours"
```

---

## Task 2: Loan simulator guided tour

**Files:**
- Modify: `src/components/ui/Stepper.tsx:20`
- Modify: `src/components/loan/LoanSummary.tsx:37,66`
- Modify: `src/components/loan/AmortizationTable.tsx:35,49`
- Modify: `src/components/features/LoanProjectionPage.tsx`
- Create: `src/lib/tours/loanTourSteps.ts`

**Interfaces:**
- Consumes: `useTour` from Task 1 (`src/hooks/useTour.ts`).
- Produces: `loanTourSteps: DriveStep[]` exported from `src/lib/tours/loanTourSteps.ts`, consumed only by `LoanProjectionPage.tsx` in this task.
- Selectors this task wires up (consumed by `loanTourSteps.ts`): `#principal`, `#annualRate`, `#termMonths` (already-existing input ids in `LoanForm.tsx` — no change needed there), `[data-tour="loan-page-header"]`, `[data-step-index="1"]` (the Stepper's "Abonos a Capital" tab), `[data-tour="loan-amortization-table"]`, `[data-tour="loan-summary"]`.

- [ ] **Step 1: Add a stable selector to each Stepper step**

Edit `src/components/ui/Stepper.tsx`. This attribute is generic (works for any `Stepper` instance, including the one Task 3 reuses in `FinancialHealthPage`) — change:

```tsx
        <div key={index} className="flex items-center flex-1">
```

to:

```tsx
        <div key={index} className="flex items-center flex-1" data-step-index={index}>
```

- [ ] **Step 2: Tag the loan summary cards**

Edit `src/components/loan/LoanSummary.tsx`. Add `data-tour="loan-summary"` to both the empty-state card and the populated wrapper — this component only ever renders one or the other, so both need the attribute for the tour to find the element in either state:

```tsx
    return (
      <Card title="Resumen del Préstamo" data-tour="loan-summary">
```

(around line 37, replacing `<Card title="Resumen del Préstamo">`), and:

```tsx
  return (
    <div className="space-y-4 sm:space-y-6" data-tour="loan-summary">
```

(around line 66, replacing `<div className="space-y-4 sm:space-y-6">`).

- [ ] **Step 3: Tag the amortization table cards**

Edit `src/components/loan/AmortizationTable.tsx`. Same reasoning — both the empty-state and populated `Card` need the attribute:

```tsx
      <Card title="Tabla de Amortización" data-tour="loan-amortization-table">
```

Apply this to both occurrences (around line 35 and line 49).

- [ ] **Step 4: Write the loan tour's step config**

Create `src/lib/tours/loanTourSteps.ts`:

```ts
import type { DriveStep } from 'driver.js';

export const loanTourSteps: DriveStep[] = [
  {
    element: '[data-tour="loan-page-header"]',
    popover: {
      title: '¡Bienvenido al simulador de préstamos!',
      description: 'Te mostramos rápidamente cómo usar esta herramienta para calcular tu tabla de amortización.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#principal',
    popover: {
      title: 'Monto principal',
      description: 'Ingresa el monto total del préstamo que vas a solicitar. Sobre este valor se calcularán los intereses.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#annualRate',
    popover: {
      title: 'Tasa de interés anual',
      description: 'La tasa que te ofrece el banco. Determina cuánto pagarás en intereses durante la vida del préstamo.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#termMonths',
    popover: {
      title: 'Plazo en meses',
      description: 'El número de meses en los que pagarás el préstamo. A mayor plazo, menor cuota mensual pero más interés total.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-step-index="1"]',
    popover: {
      title: 'Abonos a capital',
      description: 'En este paso podrás registrar abonos extra a capital para reducir tu deuda y pagar menos intereses.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="loan-amortization-table"]',
    popover: {
      title: 'Tabla de amortización',
      description: 'Aquí verás cada cuota mes a mes: cuánto va a capital, cuánto a interés y el saldo restante.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="loan-summary"]',
    popover: {
      title: 'Resumen del préstamo',
      description: 'Un resumen con el total a pagar, el costo total en intereses y el plazo real considerando tus abonos extra.',
      side: 'top',
      align: 'start',
    },
  },
];
```

- [ ] **Step 5: Wire the tour into `LoanProjectionPage`**

Edit `src/components/features/LoanProjectionPage.tsx`.

Add two imports alongside the existing ones:

```tsx
import { Info, AlertTriangle, HelpCircle } from 'lucide-react';
```

(replacing the existing `import { Info, AlertTriangle } from 'lucide-react';` line), and add:

```tsx
import { useTour } from '../../hooks/useTour';
import { loanTourSteps } from '../../lib/tours/loanTourSteps';
```

Right after the `hasFinancialHealthData` const (currently line 35: `const hasFinancialHealthData = transactions.length > 0 && (totalIncome.gt(0) || totalExpenses.gt(0));`), add:

```tsx
  const { startTour } = useTour(loanTourSteps, 'loan_tour_seen_v1', { enabled: hasFinancialHealthData });
```

Replace the existing `<header>` block:

```tsx
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Proyección de pagos para préstamos bancarios
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Calcula y visualiza tablas de amortización de préstamos con precisión
          </p>
        </header>
```

with:

```tsx
        <header className="mb-4 sm:mb-8" data-tour="loan-page-header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Proyección de pagos para préstamos bancarios
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Calcula y visualiza tablas de amortización de préstamos con precisión
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startTour}
              className="flex items-center gap-1.5 shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">¿Cómo funciona?</span>
            </Button>
          </div>
        </header>
```

- [ ] **Step 6: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with zero errors/warnings.

- [ ] **Step 7: Manual verification in the dev server**

Run: `npm run dev`, open `/proyeccion-crediticia` in a browser with devtools open.
- Clear `localStorage` for the site (or open an incognito window) and reload — with no financial-health data, the recommendation modal should appear, and the tour should **not** auto-start alongside it (per the documented trade-off).
- Dismiss the modal, go to `/salud-financiera`, add one income transaction, return to `/proyeccion-crediticia` and reload — the tour should now auto-start, spotlighting the header, the three loan fields, the "Abonos a Capital" step, the amortization table, and the summary, in order.
- Reload again — the tour should **not** auto-start a second time (flag persisted).
- Click "¿Cómo funciona?" — the tour should replay regardless of the flag.
- Toggle dark mode and re-open the tour — the popover should use the dark background/text/button colors added in Task 1, not the driver.js light-mode default.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/Stepper.tsx src/components/loan/LoanSummary.tsx src/components/loan/AmortizationTable.tsx src/components/features/LoanProjectionPage.tsx src/lib/tours/loanTourSteps.ts
git commit -m "feat: add guided tour to the loan simulator"
```

---

## Task 3: Financial health calculator guided tour

**Files:**
- Modify: `src/components/financial-health/TransactionForm.tsx:130`
- Modify: `src/components/financial-health/TransactionList.tsx:148`
- Modify: `src/components/features/FinancialHealthPage.tsx`
- Create: `src/lib/tours/financialHealthTourSteps.ts`

**Interfaces:**
- Consumes: `useTour` from Task 1, and reuses the `[data-step-index="N"]` attribute Task 2 already added to `Stepper.tsx` — no further Stepper change needed here.
- Produces: `financialHealthTourSteps: DriveStep[]` exported from `src/lib/tours/financialHealthTourSteps.ts`, consumed only by `FinancialHealthPage.tsx`.
- Selectors this task wires up: `[data-tour="fh-page-header"]`, `[data-tour="tx-form"]`, `[data-tour="tx-list"]`, `[data-step-index="1"]` (the Stepper's "Análisis Financiero" tab).

- [ ] **Step 1: Tag the transaction form**

Edit `src/components/financial-health/TransactionForm.tsx`. Change:

```tsx
    <Card 
      title={transactionToEdit ? "Editar Transacción" : "Agregar Transacción"}
      description="💡 Recuerda ingresar tus gastos e ingresos en montos mensuales. Esto nos ayudará a calcular con precisión tu capacidad de pago."
    >
```

(around line 130) to:

```tsx
    <Card 
      title={transactionToEdit ? "Editar Transacción" : "Agregar Transacción"}
      description="💡 Recuerda ingresar tus gastos e ingresos en montos mensuales. Esto nos ayudará a calcular con precisión tu capacidad de pago."
      data-tour="tx-form"
    >
```

- [ ] **Step 2: Tag the transaction list**

Edit `src/components/financial-health/TransactionList.tsx`. Tag the outer grid container (line 148) rather than either inner `Card` — that container renders unconditionally whether the income/expense columns are empty-state cards or populated lists, so it's the one element guaranteed to exist regardless of transaction count:

```tsx
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="tx-list">
```

(replacing `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">`).

- [ ] **Step 3: Write the financial health tour's step config**

Create `src/lib/tours/financialHealthTourSteps.ts`:

```ts
import type { DriveStep } from 'driver.js';

export const financialHealthTourSteps: DriveStep[] = [
  {
    element: '[data-tour="fh-page-header"]',
    popover: {
      title: 'Bienvenido a Salud Financiera',
      description: 'Te mostramos cómo evaluar tu capacidad de endeudamiento en pocos pasos.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tx-form"]',
    popover: {
      title: 'Registra tus transacciones',
      description: 'Agrega aquí tus ingresos y gastos mensuales. Mientras más completa sea la información, más preciso será tu análisis.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tx-list"]',
    popover: {
      title: 'Tus transacciones',
      description: 'Aquí verás la lista de ingresos y gastos que has registrado, organizados en columnas.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-step-index="1"]',
    popover: {
      title: 'Análisis financiero',
      description: 'Cuando registres al menos un ingreso, aquí podrás ver tu análisis completo: capacidad de pago sugerida y tu relación deuda-ingreso (DTI).',
      side: 'bottom',
      align: 'center',
    },
  },
];
```

- [ ] **Step 4: Wire the tour into `FinancialHealthPage`**

Edit `src/components/features/FinancialHealthPage.tsx`.

Replace the existing icon import line:

```tsx
import { AlertCircle } from 'lucide-react';
```

with:

```tsx
import { AlertCircle, HelpCircle } from 'lucide-react';
```

Add two more imports alongside the existing ones:

```tsx
import { useTour } from '../../hooks/useTour';
import { financialHealthTourSteps } from '../../lib/tours/financialHealthTourSteps';
```

Inside the component, after the existing `const hasIncome = totalIncome.gt(0);` line, add:

```tsx
  const { startTour } = useTour(financialHealthTourSteps, 'financial_health_tour_seen_v1');
```

Replace the existing `<header>` block:

```tsx
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Salud Financiera
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analiza tu estado financiero y calcula tu capacidad de endeudamiento
          </p>
        </header>
```

with:

```tsx
        <header className="mb-8" data-tour="fh-page-header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Salud Financiera
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Analiza tu estado financiero y calcula tu capacidad de endeudamiento
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startTour}
              className="flex items-center gap-1.5 shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">¿Cómo funciona?</span>
            </Button>
          </div>
        </header>
```

- [ ] **Step 5: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with zero errors/warnings.

- [ ] **Step 6: Manual verification in the dev server**

Run: `npm run dev`, open `/salud-financiera` in a browser with devtools open, with `localStorage` cleared (or an incognito window).
- On first load, the tour should auto-start immediately (no competing modal on this page), spotlighting the header, the transaction form, the transaction list, and the "Análisis Financiero" step, in order.
- Reload — it should not auto-start again.
- Click "¿Cómo funciona?" — it should replay on demand.
- Confirm dark mode styling matches Task 2's verification (same shared CSS).

- [ ] **Step 7: Commit**

```bash
git add src/components/financial-health/TransactionForm.tsx src/components/financial-health/TransactionList.tsx src/components/features/FinancialHealthPage.tsx src/lib/tours/financialHealthTourSteps.ts
git commit -m "feat: add guided tour to the financial health calculator"
```
