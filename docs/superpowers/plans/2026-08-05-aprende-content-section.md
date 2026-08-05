# Aprende Content Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Aprende" educational content section described in `spec/learning/review.md` (Part 1) — 6 articles about credit and personal finance, authored in `spec/learning/content.md`, published as a real Astro content collection with an index page, a per-article page, and a new top-level nav entry.

**Architecture:** Astro content collections (the current Content Layer API — `glob()` loader + Zod schema in `src/content.config.ts`) store the 6 articles as plain Markdown in `src/content/aprende/*.md`. Two Astro pages consume the collection: `src/pages/aprende/index.astro` (lists all articles) and `src/pages/aprende/[slug].astro` (renders one, via `getStaticPaths()` + `render()`). Since Tailwind's Preflight (active via `@tailwind base` in `src/index.css`) strips all default styling from headings/tables/code/blockquotes, and this codebase has no prose-styling solution today, this plan adds `@tailwindcss/typography` and a small set of brand-colored overrides — the standard, low-cost way to make raw rendered Markdown look intentional without hand-rolling CSS for every element Markdown can produce.

**Tech Stack:** Astro 7 content collections (`astro:content`, `astro/loaders`, `astro/zod` — all ship with Astro itself, no new runtime dependency), `@tailwindcss/typography` ^0.5.20 (new devDependency, CSS-only, zero runtime cost), existing `BaseLayout`/`Card` components.

## Global Constraints

- This repo has **no test runner** — verification is `npm run build` (type-check + build) and scoped `npx eslint` on any `.ts`/`.tsx` files this plan touches (the `.astro`/`.md` files aren't covered by `npm run lint`, which only lints `.ts`/`.tsx` per `CLAUDE.md`), plus manual verification in the dev server.
- `npm run lint` (bare, repo-wide) has pre-existing unrelated failures (documented in the guided-tool-tour plan) — not this plan's concern, and this plan touches no `.ts`/`.tsx` files with pre-existing issues in the first place (`Header.astro`, `tailwind.config.js`, `package.json`, `src/index.css`, `src/content.config.ts`, `src/pages/**/*.astro` — `.astro`/`.js`/`.css`/`.json` aren't eslint's concern; `src/content.config.ts` is the only new `.ts` file and must be 100% lint-clean since it's brand new).
- The article copy is already written and reviewed content, not something to rewrite: `spec/learning/content.md` is the exact source of truth for every article's prose, formulas, and examples. Copy it verbatim into each collection entry — do not paraphrase, shorten, or "improve" the wording. The one deliberate transformation (see Task 2) is converting each article's closing "**En la app:**" paragraph from a plain paragraph into a Markdown blockquote (`>` prefix), so it renders as a distinct callout — this is a markup change, not a content change; the words themselves stay identical.
- Follow existing conventions: Spanish UI copy, `BaseLayout`/`Card` primitives from `src/layouts`/`src/components/ui`, `../../` relative imports from `src/pages/aprende/*`, dark mode via paired `dark:` Tailwind classes (never a JS theme check), the `container mx-auto px-4 py-8 pb-24 max-w-7xl animate-fade-in` wrapper shape already used by every other top-level page.
- Nothing in this plan touches money/loan business logic (`src/lib/engine.ts`) or the guided-tour feature (`src/hooks/useTour.ts`, `src/lib/tours/*`) — those are separate, already-shipped work.

---

## Task 1: `@tailwindcss/typography` + brand-colored prose/callout styling

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Produces: a `.aprende-article` CSS class (to be applied alongside Tailwind's `prose`/`dark:prose-invert` utility classes on the wrapper element Task 3 creates) that brand-colors headings/links and turns `blockquote` elements into an orange callout box matching the site's existing recommendation-banner look (see `src/components/features/LoanProjectionPage.tsx`'s amber banner for the visual reference this mirrors, in the site's brand orange instead of amber).

- [ ] **Step 1: Add the `@tailwindcss/typography` devDependency**

Edit `package.json`. In the `devDependencies` block, insert `"@tailwindcss/typography": "^0.5.20"` as the **first** entry (alphabetically, `@tailwindcss` sorts before `@types` and `@typescript-eslint`):

```json
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.20",
    "@types/jspdf": "^1.3.3",
```

- [ ] **Step 2: Install it**

Run: `npm install` (or `npm install --legacy-peer-deps` if the plain form errors on the pre-existing `@astrojs/tailwind`/`astro` peer conflict — matching this repo's documented CI install command).
Expected: `package-lock.json` updates to include `@tailwindcss/typography`; install completes with no errors.

- [ ] **Step 3: Register the plugin**

Edit `tailwind.config.js`. Change:

```js
  plugins: [require('tailwindcss-animate')],
```

to:

```js
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
```

- [ ] **Step 4: Add the brand-colored prose/callout overrides**

Edit `src/index.css`. Append this block at the end of the file (it follows the same `.dark`-scoped override pattern already used elsewhere in this file, e.g. the existing `.custom-scrollbar`/`select option` rules):

```css
/* Aprende articles — Tailwind Typography ("prose") brand overrides.
   Uses the plugin's own :where()/:not(:where([class~="not-prose"] *))
   selector shape so these overrides win without needing !important. */
.aprende-article :where(a):not(:where([class~="not-prose"] *)) {
  color: #ea580c; /* orange-600 */
}

.aprende-article :where(h2, h3, h4):not(:where([class~="not-prose"] *)) {
  color: #111827; /* gray-900 */
}

.dark .aprende-article :where(h2, h3, h4):not(:where([class~="not-prose"] *)) {
  color: #ffffff;
}

/* "En la app:" tie-in callout, rendered as a blockquote in the source Markdown —
   styled like the site's existing amber recommendation banners, in brand orange. */
.aprende-article :where(blockquote):not(:where([class~="not-prose"] *)) {
  border-left-color: #ea580c; /* orange-600 */
  background-color: #fff7ed; /* orange-50 */
  color: #9a3412; /* orange-800 */
  font-style: normal;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  quotes: none;
}

.aprende-article :where(blockquote p):not(:where([class~="not-prose"] *))::before,
.aprende-article :where(blockquote p):not(:where([class~="not-prose"] *))::after {
  content: none;
}

.dark .aprende-article :where(blockquote):not(:where([class~="not-prose"] *)) {
  background-color: rgba(154, 52, 18, 0.15);
  color: #fdba74; /* orange-300 */
  border-left-color: #fb923c; /* orange-400 */
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds with zero type errors. (There's no `.ts`/`.tsx` file to lint in this task — `tailwind.config.js` and `src/index.css` aren't covered by `npm run lint`.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tailwind.config.js src/index.css
git commit -m "feat: add tailwindcss/typography and brand prose styling for Aprende articles"
```

---

## Task 2: `aprende` content collection schema + the 6 articles

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/aprende/tasa-de-interes.md`
- Create: `src/content/aprende/tasa-nominal-vs-tae.md`
- Create: `src/content/aprende/tabla-de-amortizacion.md`
- Create: `src/content/aprende/pagos-extra.md`
- Create: `src/content/aprende/dti-relacion-deuda-ingreso.md`
- Create: `src/content/aprende/presupuesto-y-fondo-emergencia.md`

**Interfaces:**
- Produces: the `aprende` collection, queryable via `getCollection('aprende')` and `render(entry)` from `astro:content` — each entry's `.id` is its filename without extension (e.g. `tasa-de-interes`), used as the article's URL slug by Task 3. Each entry's `.data` matches the schema: `{ title: string, description: string, order: number }`.

- [ ] **Step 1: Define the collection schema**

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const aprende = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/aprende' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { aprende };
```

- [ ] **Step 2: Author the 6 article files**

Read `spec/learning/content.md` in full — it's already-written, already-reviewed Spanish copy for all 6 articles. Create one Markdown file per article using the mapping below. For each file:

1. Frontmatter: `title` (exact article heading from `content.md`, without the leading `## N. `), `description` (the `**description:**` line already given under that article in `content.md`), `order` (the `**order: N**` value already given).
2. Body: everything under that article's `### Contenido` heading in `content.md`, copied verbatim — **except** the final paragraph, which starts with `**En la app:**`. Convert that paragraph to a Markdown blockquote by prefixing every line of it with `> ` (a single `>` and a space). Nothing else in the body changes — do not alter headings, tables, code fences, or any other paragraph.

| File | `content.md` section | title | order |
|---|---|---|---|
| `tasa-de-interes.md` | `## 1. ¿Qué es la tasa de interés y cómo afecta tu crédito?` | `¿Qué es la tasa de interés y cómo afecta tu crédito?` | `1` |
| `tasa-nominal-vs-tae.md` | `## 2. Tasa nominal vs. TAE (costo real de un préstamo)` | `Tasa nominal vs. TAE (costo real de un préstamo)` | `2` |
| `tabla-de-amortizacion.md` | `## 3. Cómo funciona la tabla de amortización` | `Cómo funciona la tabla de amortización` | `3` |
| `pagos-extra.md` | `## 4. Pagos extra: cómo te ahorran dinero e intereses` | `Pagos extra: cómo te ahorran dinero e intereses` | `4` |
| `dti-relacion-deuda-ingreso.md` | `## 5. ¿Qué es el DTI (relación deuda-ingreso) y por qué importa?` | `¿Qué es el DTI (relación deuda-ingreso) y por qué importa?` | `5` |
| `presupuesto-y-fondo-emergencia.md` | `## 6. Presupuesto básico y fondo de emergencia` | `Presupuesto básico y fondo de emergencia` | `6` |

Example of the required shape, using article 1 (`tasa-de-interes.md`) worked out in full so there's no ambiguity about the blockquote conversion:

```md
---
title: "¿Qué es la tasa de interés y cómo afecta tu crédito?"
description: "La tasa de interés es el costo de pedir dinero prestado. Entiende cómo se calcula y por qué un pequeño cambio en el porcentaje puede significar mucho dinero a lo largo del préstamo."
order: 1
---

Cuando un banco te presta dinero, no te cobra solo el monto que pediste (el **capital** o **principal**): te cobra un porcentaje adicional por el tiempo que tardas en devolverlo. Ese porcentaje es la **tasa de interés**.

En El Salvador, como en la mayoría de bancos, esta tasa se expresa de forma **anual** (Tasa de Interés Anual), aunque tus cuotas las pagas **mes a mes**. Por eso, antes de calcular cuánto interés pagas cada mes, hay que convertir la tasa anual en una tasa mensual:

```
tasa mensual = tasa anual / 12
```

**Ejemplo:** si tu préstamo tiene una tasa anual del 12%, tu tasa mensual es:

```
12% / 12 = 1% mensual
```

Ese 1% se aplica sobre el **saldo pendiente** de tu préstamo, no sobre el monto original. Esto es clave: a medida que vas pagando capital, el saldo baja, y por lo tanto el interés que pagas cada mes también baja — aunque tu cuota se mantenga igual.

**Ejemplo numérico:** con un préstamo de $10,000 a 12% anual:

```
interés del primer mes = $10,000 × 1% = $100
```

Si al mes siguiente tu saldo bajó a $9,800, el interés de ese mes sería:

```
interés del segundo mes = $9,800 × 1% = $98
```

**Por qué te importa:** una diferencia de apenas 2 o 3 puntos porcentuales en la tasa anual (por ejemplo, 12% vs. 15%) puede representar cientos o miles de dólares extra a lo largo de un préstamo largo. Por eso siempre vale la pena comparar ofertas de distintos bancos antes de decidir.

> **En la app:** el campo **"Tasa de Interés Anual (%)"** en el simulador de préstamos es exactamente esta tasa. Cambia el valor y observa cómo se recalcula tu cuota mensual y el interés total en la tabla de amortización.
```

Apply the identical pattern (frontmatter from the table above + verbatim body from `content.md` + blockquote-ify only the closing "En la app:" paragraph) to the other 5 articles. Every article in `content.md` ends with exactly one such paragraph, so there's exactly one blockquote conversion per file.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with zero type errors — Astro validates every `.md` file's frontmatter against the Zod schema at build time, so a missing/mistyped `title`/`description`/`order` field would fail the build here.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/aprende/
git commit -m "feat: add aprende content collection with 6 articles"
```

---

## Task 3: Aprende index page, article page, and nav entry

**Files:**
- Create: `src/pages/aprende/index.astro`
- Create: `src/pages/aprende/[slug].astro`
- Modify: `src/components/layout/Header.astro`

**Interfaces:**
- Consumes: the `aprende` collection from Task 2 (`getCollection('aprende')`, `render(entry)`), the `.aprende-article` CSS class from Task 1, and the existing `BaseLayout`/`Card` components.

- [ ] **Step 1: Build the index page**

Create `src/pages/aprende/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Card from '../../components/ui/Card';

const articles = (await getCollection('aprende')).sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout
  title="Aprende"
  description="Aprende los conceptos clave de créditos y salud financiera, con ejemplos y fórmulas reales."
>
  <div class="container mx-auto px-4 py-8 pb-24 max-w-7xl animate-fade-in">
    <header class="mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Aprende</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Conceptos clave de créditos y salud financiera, con ejemplos y fórmulas reales.
      </p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {
        articles.map((article) => (
          <a href={`/aprende/${article.id}`} class="block">
            <Card
              title={article.data.title}
              description={article.data.description}
              className="h-full hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            />
          </a>
        ))
      }
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Build the article template**

Create `src/pages/aprende/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Card from '../../components/ui/Card';

export async function getStaticPaths() {
  const articles = await getCollection('aprende');
  return articles.map((article) => ({
    params: { slug: article.id },
    props: { article },
  }));
}

const { article } = Astro.props;
const { Content } = await render(article);
---

<BaseLayout title={article.data.title} description={article.data.description}>
  <div class="container mx-auto px-4 py-8 pb-24 max-w-3xl animate-fade-in">
    <a href="/aprende" class="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
      ← Volver a Aprende
    </a>
    <h1 class="mt-4 mb-6 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
      {article.data.title}
    </h1>
    <Card className="aprende-article prose dark:prose-invert max-w-none">
      <Content />
    </Card>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Add "Aprende" to the top-level nav**

Edit `src/components/layout/Header.astro`. Change:

```ts
const navItems = [
  { path: '/', label: 'Inicio' },
  { path: '/contacto', label: 'Contacto' },
];
```

to:

```ts
const navItems = [
  { path: '/', label: 'Inicio' },
  { path: '/aprende', label: 'Aprende' },
  { path: '/contacto', label: 'Contacto' },
];
```

This single change updates both the desktop nav and the mobile nav (both map over the same `navItems` array further down in this file) — no other edits needed in this file.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds with zero type errors; build output lists the new static routes (`/aprende/index.html` plus one HTML file per article slug, alongside the existing 5 pages).

- [ ] **Step 5: Manual verification in the dev server**

Run: `npm run dev`.
- Visit `/aprende` — confirm all 6 article cards render, sorted in the order from the table in Task 2, each showing its title/description.
- Click into a couple of articles — confirm headings, the numeric example code blocks, and the DTI/amortization tables all render with visible styling (not raw unstyled browser defaults), and that the closing "En la app:" paragraph renders as a distinct orange-tinted callout box, not a plain paragraph.
- Toggle dark mode — confirm the callout box and headings switch to their dark-mode colors, and body text stays readable.
- Check both desktop and mobile nav — confirm "Aprende" appears between "Inicio" and "Contacto" in both, and highlights as active while on any `/aprende*` route.

- [ ] **Step 6: Commit**

```bash
git add src/pages/aprende/ src/components/layout/Header.astro
git commit -m "feat: add aprende index/article pages and nav entry"
```
