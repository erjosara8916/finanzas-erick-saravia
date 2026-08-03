# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Astro dev server on port 3000
npm run build     # Type-check (astro check) then build to dist/
npm run preview   # Preview the production build
npm run lint      # ESLint (max-warnings 0), .ts/.tsx only (does not lint .astro files)
```

There is no test suite/runner configured in this repo (no Jest/Vitest, no test script). The `spec/` directory contains product/requirements documents (`landing.spec.md`, `salud-financiera.spec.md`), not executable tests — same for `tech.spec.md` at the root. `spec/astro-setup/` holds the review/plan for the Vite→Astro migration described below. Treat these as specs to consult when working on related features, not as things to run.

CI (`.github/workflows/deploy.yml`) runs `npm ci --legacy-peer-deps` then `npm run build` on push to `main`/`master`, and deploys `dist/` to GitHub Pages. It requires `PUBLIC_GA_MEASUREMENT_ID` and `PUBLIC_EMAILJS_*` secrets (see `.github/README.md` for setup) — Astro exposes client-side env vars via a `PUBLIC_` prefix, not Vite's `VITE_` prefix. Path alias `@` → `src/` is configured in `astro.config.mjs` (`vite.resolve.alias`) and `tsconfig.json`.

## Architecture

This is an Astro 7 + React 19 + TypeScript site, statically built (`output: 'static'`) for GitHub Pages. Astro's file-based routing in `src/pages/` replaces the old `react-router-dom` SPA — every route is a real static HTML document with its own `<title>`/meta tags:

- `/` (`src/pages/index.astro`) — Landing page, mostly static markup
- `/contacto` (`src/pages/contacto.astro`) — Contact page, mostly static markup
- `/proyeccion-crediticia` (`src/pages/proyeccion-crediticia.astro`) — Loan amortization simulator, a full React island
- `/salud-financiera` (`src/pages/salud-financiera.astro`) — Personal financial health / DTI calculator, a full React island

### Astro islands: what's static vs. what's React

- `src/layouts/BaseLayout.astro` — shared `<head>` (per-page title/description/canonical/OG tags), theme-init inline script, mounts `Header.astro`/`Footer.astro` plus the `CookieConsentBanner` island and the GA-init script.
- `src/components/layout/*.astro` (`Header`, `HerramientasDropdown`, `Footer`) — native Astro components, zero React shipped. Active-link state is computed at render time from `Astro.url.pathname` (no `NavLink` equivalent needed since every nav link is a real `<a href>` and every navigation is a full page load). Mobile menu, theme toggle, and the herramientas dropdown are plain `<script>` tags doing DOM/class toggling, not React state.
- `src/pages/index.astro` / `contacto.astro` — static hero/feature/info markup with lucide-react icons rendered **without** a `client:*` directive (Astro renders framework components to static HTML with zero client JS when no client directive is given). The newsletter form and contact form are the only stateful pieces, extracted into `src/components/features/NewsletterForm.tsx` / `ContactForm.tsx` and mounted as `client:visible` islands. CTA click tracking and scroll/time/section engagement tracking run as plain `<script>` tags (see `src/lib/engagementTracking.ts`) rather than React, since they're pure side effects with no UI.
- `src/pages/proyeccion-crediticia.astro` / `salud-financiera.astro` — thin wrappers that mount `src/components/features/LoanProjectionPage.tsx` / `FinancialHealthPage.tsx` as full `client:load` islands (must be eager, not lazy — both Zustand stores touch `localStorage` during initial render via `persist` middleware, which breaks under anything less eager). Each top-level island is wrapped in `ErrorBoundary`.
- GA pageview tracking no longer listens for client-side route changes (`PageTracker` was removed) — since every navigation is now a real page load, `initGA()` (called once per page load from `BaseLayout.astro`) naturally fires one pageview per navigation.

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
- `src/lib/emailService.ts` — EmailJS wrapper for the contact form (needs `PUBLIC_EMAILJS_*` env vars).
- `src/lib/analytics.ts` — GA4 wrapper gated by cookie consent (`hasUserConsent`/`setUserConsent`, `localStorage['cookie-consent']`); GA only initializes after explicit consent. Needs `PUBLIC_GA_MEASUREMENT_ID`.
- `src/lib/engagementTracking.ts` — vanilla-JS scroll-depth/time-on-page/section-visibility tracking for the landing page, invoked from a `<script>` tag in `index.astro` (a plain-JS port of the old `useEngagementTracking` React hook, since it has no UI to render).

### Component layout

- `components/ui/` — atomic/reusable primitives (Button, Card, Input, InputCurrency, Select, Dialog, Tooltip, Switch, Stepper, Collapsible, etc.) — feature components are built from these, not raw HTML elements.
- `components/loan/` — loan feature (`LoanForm`, `AmortizationTable`, `LoanSummary`, `ExtraPaymentsManager`, `CapacityWarning`).
- `components/financial-health/` — financial health feature (`TransactionForm`, `TransactionList`, `TransactionSummary`, `TransactionTotals`, `FinancialMetrics`, `HealthGaugeChart`, `HealthStatusIndicator`).
- `components/features/` — the four React islands: `LoanProjectionPage`/`FinancialHealthPage` (the full calculator tools, moved here from the old `pages/` since Astro's `src/pages/` is routable and can't hold plain React components) and `NewsletterForm`/`ContactForm` (extracted from the old `LandingPage`/`ContactPage` so only the interactive form needs to hydrate, not the whole marketing page).
- `components/charts/` — Recharts wrappers (`AmortizationChart`).
- `components/analytics/` — `ErrorBoundary`, `CookieConsent` (mounted as a `client:load` island from `BaseLayout.astro`).
- `components/layout/` — `Header.astro`, `HerramientasDropdown.astro`, `Footer.astro` (native Astro, no React) — see `src/layouts/BaseLayout.astro` for how they're composed.

### React 19 conventions

Per `tech.spec.md`, this codebase intentionally avoids `useEffect` for derived calculations — amortization tables and financial metrics are computed directly during render or in event handlers, relying on Decimal.js/plain JS rather than manual `useMemo` gymnastics.
