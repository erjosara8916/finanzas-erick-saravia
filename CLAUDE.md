# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server on port 3000
npm run build     # Type-check (tsc) then build to dist/
npm run preview   # Preview the production build
npm run lint      # ESLint (max-warnings 0), .ts/.tsx only
```

There is no test suite/runner configured in this repo (no Jest/Vitest, no test script). The `spec/` directory contains product/requirements documents (`landing.spec.md`, `salud-financiera.spec.md`), not executable tests — same for `tech.spec.md` at the root. Treat these as specs to consult when working on related features, not as things to run.

CI (`.github/workflows/deploy.yml`) runs `npm ci --legacy-peer-deps` then `npm run build` on push to `main`/`master`, and deploys `dist/` to GitHub Pages. It requires `VITE_GA_MEASUREMENT_ID` and `VITE_EMAILJS_*` secrets (see `.github/README.md` for setup). Path alias `@` → `src/` is configured in `vite.config.ts` and `tsconfig.json`.

## Architecture

This is a client-only React 19 + TypeScript SPA (Vite) with two independent financial tools sharing one shell (`Layout`/`Header`), routed via `react-router-dom`:

- `/proyeccion-crediticia` — Loan amortization simulator
- `/salud-financiera` — Personal financial health / DTI calculator
- `/` — Landing page, `/contacto` — contact form (EmailJS)

### Money math: Decimal.js everywhere

All monetary/rate values are stored and passed as **strings** in state/types (e.g. `LoanInput.principal: string`) and converted to `Decimal` (`decimal.js`) at the point of calculation. Native `number` is only used for final display values (chart/table rows store `number`, produced via `.toNumber()` at the end of a calculation). Never introduce raw float arithmetic on money — always go through `Decimal`.

### Loan engine (`src/lib/engine.ts`)

Pure, React-free calculation module — the core business logic:

- `calculateMonthlyPayment` — standard amortization formula.
- `calculateAmortizationTable(input, extras)` — builds the full row-by-row schedule. Key behaviors baked into the loop:
  - Supports two modes: calculated fixed payment vs. user-supplied `useFixedPayment`/`fixedMonthlyPayment`.
  - Extra principal payments (`ExtraPayments`, a `{ [period]: amountString }` map) reduce the balance before next period's interest.
  - Tracks `sunkCostAccumulated` (interest + insurance + fees only — **never** principal).
  - Loop terminates when balance hits 0, with a `termMonths * 2` safety cap; the final payment is force-adjusted to clear the remaining balance exactly (never trust the formula's last-period rounding).
  - Month stepping uses `date-fns/addMonths`, which correctly clamps month-end overflow (e.g. Jan 31 → Feb 28/29).
- `calculateLoanSummary(rows)` — aggregates totals from a computed table.

When modifying loan math, treat `engine.ts` as the single source of truth — don't duplicate calculation logic in components.

### State: Zustand, one persisted store per feature

- `src/store/loanStore.ts` — `AppState` (`scenarios: LoanInput[]`, `activeScenarioId`, `extraPayments`). Modeled as an array of scenarios today even though only one is used, to support a planned multi-scenario comparison (Phase 2 per `tech.spec.md`) without a schema migration. Persisted to localStorage as `loan_simulator_v1`.
- `src/store/financialHealthStore.ts` — flat `FinancialTransaction[]` list; exposes derived metrics as store methods (`totalIncome`, `totalExpenses`, `availableCashFlow`, `suggestedPaymentCapacity`, `dtiRatio`, `healthStatus`), all computed via `Decimal` from the transaction list rather than stored redundantly. Persisted as `financial_health_v1`.

Both stores use `zustand/middleware persist` — no custom localStorage hook is used despite `tech.spec.md` describing one; state changes auto-save on every mutation.

### Financial health business rules (see `spec/salud-financiera.spec.md`)

- Suggested payment capacity = `(income - expenses) * 0.80` (20% safety reserve baked in, not configurable).
- DTI health thresholds: `< 50%` excellent, `50–75%` adjusted, `> 75%` critical — see `HealthStatus` in `src/types/schema.ts` and `healthStatus()` in the store. These thresholds are business rules, not arbitrary constants — don't change them without checking the spec.

### Types (`src/types/schema.ts`)

Central type definitions for both features (`LoanInput`/`AmortizationRow`/`AppState` for loans; `FinancialTransaction`/`TransactionType`/`IncomeCategory`/`ExpenseCategory`/`HealthStatus` for financial health). Category unions are the source of truth for what dropdown options exist in the transaction form.

### Other lib modules

- `src/lib/formatters.ts` — currency (`Intl.NumberFormat`, `en-US`/USD) and date formatting/parsing helpers.
- `src/lib/validation.ts` — form-field validators returning `{ isValid, error? }`, used by both `LoanForm` and `TransactionForm`.
- `src/lib/pdfGenerator.ts` — jsPDF/jspdf-autotable export of the amortization table.
- `src/lib/emailService.ts` — EmailJS wrapper for the contact form (needs `VITE_EMAILJS_*` env vars).
- `src/lib/analytics.ts` — GA4 wrapper gated by cookie consent (`hasUserConsent`/`setUserConsent`, `localStorage['cookie-consent']`); GA only initializes after explicit consent.

### Component layout

- `components/ui/` — atomic/reusable primitives (Button, Card, Input, InputCurrency, Select, Dialog, Tooltip, Switch, Stepper, Collapsible, etc.) — feature components are built from these, not raw HTML elements.
- `components/loan/` — loan feature (`LoanForm`, `AmortizationTable`, `LoanSummary`, `ExtraPaymentsManager`, `CapacityWarning`).
- `components/financial-health/` — financial health feature (`TransactionForm`, `TransactionList`, `TransactionSummary`, `TransactionTotals`, `FinancialMetrics`, `HealthGaugeChart`, `HealthStatusIndicator`).
- `components/charts/` — Recharts wrappers (`AmortizationChart`).
- `components/analytics/` — `PageTracker` (route-change GA pageviews), `ErrorBoundary`, `CookieConsent`.
- `components/layout/` — `Layout`, `Header`, `HerramientasDropdown` (the tools nav menu linking the two calculators).

### React 19 conventions

Per `tech.spec.md`, this codebase intentionally avoids `useEffect` for derived calculations — amortization tables and financial metrics are computed directly during render or in event handlers, relying on Decimal.js/plain JS rather than manual `useMemo` gymnastics.
