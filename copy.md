# Copy Documentation

Inventory of every user-facing string in the app (Spanish, `es`), organized by where it lives, so a developer can find and change copy without grepping the whole repo. Companion to [`spec/copy-improvement/review.md`](spec/copy-improvement/review.md), which explains *why* the CTA labels below were chosen — read that first if you're about to introduce a new CTA rather than edit an existing one.

Static text lives directly in `.astro` files or as JSX in `.tsx` components — there is no i18n layer or central strings file. To change a string, edit it at the file:line listed below.

## 1. Canonical CTA labels

Reusable action labels. If you're adding a new button/link to one of these destinations, use the label in this table — don't invent a new variant (see `review.md` §1 for the drift this caused before it was standardized).

| Destination | Canonical action label | Canonical nav/identity label |
|---|---|---|
| `/proyeccion-crediticia` | **Simular mi Préstamo** | Proyección Crediticia |
| `/salud-financiera` | **Evaluar mi Salud Financiera** | Salud Financiera |
| Add an entry (extra payment / transaction) | **Agregar** | — |
| Acknowledge a warning/info modal | **Entendido** | — |
| View a details dialog | **Ver detalles** | — |

## 2. Site-wide chrome

### `src/layouts/BaseLayout.astro`
Per-page `<title>`/`<meta description>` are passed in as props from each page (listed under each page below), not hardcoded here.

### `src/components/layout/Header.astro`
| String | Line |
|---|---|
| "METIS \| Finanzas" (logo text, desktop + mobile sidebar) | 28, 103 |
| "Inicio" (nav item) | 7 |
| "Contacto" (nav item) | 8 |
| `aria-label`/`title` "Cambiar tema" (theme toggle) | 55–56, 69–70 |
| `aria-label` "Abrir menú" / "Cerrar menú" | 79, 109 |
| "Menú" (mobile menu label) | 83 |
| "Modo claro" / "Modo oscuro" (mobile menu theme toggle text) | 179–180 |

### `src/components/layout/HerramientasDropdown.astro`
| String | Line |
|---|---|
| "Herramientas" (dropdown trigger label) | 33 |
| Nav items ("Salud Financiera", "Proyección Crediticia") | passed in as `items` prop from `Header.astro:11-12` |

### `src/components/layout/Footer.astro`
| String | Line |
|---|---|
| "Todos los derechos reservados." | 20 |

### `src/pages/404.astro`
| String | Line |
|---|---|
| Page title / description ("Página no encontrada" / "La página que buscas no existe o fue movida.") | 5 |
| "404" | 7 |
| "La página que buscas no existe o fue movida." (body text) | 8 |
| "Volver al inicio" | 13 |

## 3. Landing page — `src/pages/index.astro`

All copy is inline in this file (page title/description at line 88–89), organized into data arrays consumed by the template — edit the array entries, not the JSX. Rewritten for a bolder, more direct marketing voice (bank-callout framing, loan simulator as the primary CTA) — see "Rewrite rationale" below.

| Section | What to edit | Lines |
|---|---|---|
| Hero H1/subhead ("¿Sabes cuánto le estás pagando de más a tu banco?") | inline JSX | 96–102 |
| Hero CTA + micro-copy below it | inline JSX, label "Simular mi Préstamo" | 104–115 |
| `tools` array (Simulador de Préstamos / Chequeo de Salud Financiera cards, incl. `buttonText` + per-card `privacyNote`) | `tools` array | 54–74 |
| Tools section heading/subhead ("La claridad que tu banco no te da") | inline JSX | 122–127 |
| `features` array (4 feature cards: Sin errores de calculadora, Tu deuda de un vistazo, Cada pago desglosado, Decide antes de comprometerte) | `features` array | 6–27 |
| Features section heading ("Esto es lo que tu banco no te muestra") | inline JSX | 162 |
| `benefits` array (4 checklist bullets) | `benefits` array | 29–34 |
| Benefits section heading ("Hecho para ti, no para el banco") | inline JSX | 185 |
| `steps` array ("Toma el mando en 3 pasos" — heading unchanged, step titles/descriptions rewritten) | `steps` array | 36–52 |
| Newsletter section heading/subhead ("Aprende a jugarle al banco con sus propias reglas") | inline JSX | 228–232 |
| Bottom CTA section heading/subhead + two CTA buttons (now using the canonical action labels "Simular mi Préstamo" / "Evaluar mi Salud Financiera", loan simulator first with the primary `ctaButton` style) | inline JSX | 242–262 |

Newsletter form itself (email/name fields, submit button, success/error states) lives in `src/components/features/NewsletterForm.tsx` — see §7.

**Rewrite rationale:** the previous copy used vague/generic language ("optimiza tus finanzas con datos reales", "interfaz amigable diseñada para usuarios") and repeated the same privacy disclaimer verbatim 3× on this page. The rewrite (1) leads with a specific, checkable claim in every section instead of a vague one, (2) uses a consistent "your bank vs. you" point of view as the throughline, (3) gives each privacy mention distinct wording via the `tools` array's per-card `privacyNote` field instead of one repeated string, and (4) fixes the bottom CTA section to use the canonical action labels from §1 instead of the nav-identity labels it had before (a gap `spec/copy-improvement/review.md` §1 flagged but the prior copy pass didn't actually close).

## 4. Contact page — `src/pages/contacto.astro`

| String | Line |
|---|---|
| Page title / description | 8–9 |
| "Contacto" (H1) | 13 |
| "Tu opinión impulsa este proyecto" | 20 |
| "Email" label + address | 25, 30 |
| "Leemos cada mensaje. Tus reportes y sugerencias..." | 35 |
| "¿Encontraste un error o tienes una idea?" | 41 |
| "Esta plataforma está en constante evolución..." | 42–45 |

Contact form itself lives in `src/components/features/ContactForm.tsx` — see §6.

## 5. Loan tool — `/proyeccion-crediticia`

### `src/pages/proyeccion-crediticia.astro`
Page title/description only (lines 7–8).

### `src/components/features/LoanProjectionPage.tsx`
| String | Line |
|---|---|
| H1 "Proyección de pagos para préstamos bancarios" + subhead | 223–228 |
| Stepper labels: "Información del Préstamo" / "Abonos a Capital" / "Proyección" | 164, 169, 174 |
| "Siguiente" / "Anterior" (step nav buttons) | 277, 293, 296, 305 |
| Recommendation banner (inline, shown when no financial-health data) | 239–247 |
| "Recomendación" modal (title 330; body 337–340; buttons "Entendido" / "Evaluar mi Salud Financiera" 344, 348) | 330–350 |
| "Alerta de Capacidad de Pago" modal (title 363; body 370–381; buttons 385, 389) | 363–391 |

### `src/components/loan/LoanForm.tsx`
Card title/description: "Detalles del Préstamo" / description (line 130). Field labels + tooltip copy, one block per field:

| Field | Label line | Tooltip line |
|---|---|---|
| Nombre del préstamo (alias) | 148 | 150 |
| Monto Principal | 164 | 166 |
| Tasa de Interés Anual (%) | 183 | 185 |
| Plazo (Meses) | 205 | 207 |
| Cuota Mensual Calculada | 227 | 229 |
| Cuota Mensual Total (+ "Cuota fija personalizada" switch label) | 246, 263 | 248–250 |
| Fecha de Inicio | 294 | 296 |
| Seguro Mensual | 313 | 316 |
| Cuotas Mensuales Adicionales | 333 | 335 |

"Capacidad de Endeudamiento Sugerida:" banner label at line 135. Field-level error strings come from `src/lib/validation.ts` (see §8), not from this file.

### `src/components/loan/ExtraPaymentsManager.tsx`
| String | Line |
|---|---|
| Card title/description "Abonos a Capital" / "Agrega abonos a capital..." | 302 |
| "Máximo Abono Sugerido:" banner label + tooltip | 306–312 |
| "Tipo de Pago" label + tooltip + options ("Pago único" / "Pago periódico") | 321–322, 337–338 |
| Single-payment fields: "Período (Mes)" (346), "Monto" (364) | 346–365 |
| Periodic fields: "Mes Inicio" (382), "Mes Final" (400), "Monto" (418) | 382–419 |
| "Agregar" (submit button, both modes) | 375, 429 |
| Inline validation errors (period range, conflicts) | 165, 170, 198, 203, 208, 221 |
| "Resumen de Abonos a Capital" + row labels (Cantidad de abonos, Total de abonos, Costo total sin/con abonos, Fecha de finalización, Finaliza antes, Ahorro) | 443–493 |
| "Ver abonos" (opens dialog) | 502 |
| Dialog title "Abonos a Capital Programados" + "Eliminar todos" + empty state "No hay abonos a capital programados" | 514, 525, 560 |

### `src/components/loan/AmortizationTable.tsx`
| String | Line |
|---|---|
| Card title "Tabla de Amortización" | 35, 49 |
| Empty state "Por favor completa los detalles del préstamo..." | 37 |
| Column headers + tooltips: Período, Fecha, Pago Total, Interés, Seguro/Cuotas, Principal, Pago Extra, Saldo, Costo Acumulado | 56–107 |

### `src/components/loan/LoanSummary.tsx`
| String | Line |
|---|---|
| Empty state card "Resumen del Préstamo" / "Por favor completa..." | 37–39 |
| "Métricas Clave" card + "Descargar PDF" / "PDF" (responsive abbreviation) | 68, 76–77 |
| Metric labels + tooltips: Total a Pagar (84–85), Costo total (93–94), Plazo Real (102–103, "antes" suffix at 111) | 84–111 |
| "Visualización de Amortización" card title | 117 |
| "Desglose de Costos" card + row labels (Principal, Total Pagado, "Costo Total (Total pagos - Capital recibido)") | 121–141 |

### `src/components/loan/CapacityWarning.tsx`
"Alerta de Capacidad de Pago" heading (line 20), body copy (23–31, links to "Salud Financiera"), footer note (34). This same copy is duplicated inline inside `LoanProjectionPage.tsx`'s "Alerta de Capacidad de Pago" modal (370–381) — keep both in sync if you edit one.

## 6. Financial health tool — `/salud-financiera`

### `src/pages/salud-financiera.astro`
Page title/description only (lines 7–8).

### `src/components/features/FinancialHealthPage.tsx`
| String | Line |
|---|---|
| H1 "Salud Financiera" + subhead | 64–68 |
| Stepper labels "Registro de Transacciones" / "Análisis Financiero" | 24, 29 |
| "Siguiente" / "Anterior" / "Volver al registro" | 100, 114, 134, 176 |
| No-income empty state "No hay datos disponibles..." | 111–113 |
| "Simular mi Préstamo" (step-2 completion CTA to loan tool) | 139 |
| "Ingresos requeridos" dialog (title 159; body copy varies by step 166–168; buttons "Volver al registro" / "Entendido" 176, 180) | 151–182 |

### `src/components/financial-health/TransactionForm.tsx`
| String | Line |
|---|---|
| Card title (dynamic: "Editar Transacción" / "Agregar Transacción") + description | 131–132 |
| "+ Ingreso" / "- Gasto" toggle buttons | 148, 161 |
| Field labels: Descripción (167), Monto ($) (194), Categoría (218) | 167–244 |
| `incomeCategories` labels (Salario Fijo, Bonos/Comisiones, Renta/Alquileres, Inversiones, Otros) | 13–18 |
| `expenseCategories` labels (Vivienda, Alimentación, Transporte, Servicios, Deudas Existentes, Ocio/Vicios, Educación, Salud, Caridad/Regalos, Familia, Otros) | 21–32 |
| Validation errors (descripción/monto/categoría requeridos) | 74, 78, 82 |
| Buttons "Cancelar" / "Guardar cambios" (edit) / "Agregar" (create) | 265, 269 |

**⚠️ Duplicated category labels:** `incomeCategories`/`expenseCategories` here are the source of truth (kept in sync with `src/types/schema.ts`'s category unions). `TransactionList.tsx`, `TransactionSummary.tsx`, and `TransactionTotals.tsx` each keep their **own separate copy** of the same label maps (as plain `Record<string, string>`, not the typed array here). If you add/rename a category, update all four places or a transaction will show its raw slug (e.g. `caridad_regalos`) in whichever view you missed.

### `src/components/financial-health/TransactionList.tsx`
| String | Line |
|---|---|
| `incomeCategoryLabels` / `expenseCategoryLabels` (duplicate of TransactionForm's — see warning above) | 12–32 |
| "Ingresos" / "Gastos" column headings | 152, 172 |
| Empty states "No hay ingresos registrados" / "No hay gastos registrados" | 157, 177 |
| `aria-label`s "Editar transacción" / "Eliminar transacción" | 126, 137 |
| Delete confirmation dialog: title "Confirmar eliminación", body "¿Estás seguro...?", buttons "Cancelar"/"Eliminar" | 193–236 |

### `src/components/financial-health/TransactionSummary.tsx`
Mounted from `FinancialHealthPage.tsx` (step 2, left column). Duplicate category label maps (11–31, see warning above).

| String | Line |
|---|---|
| Card title "Resumen" | 54 |
| "Ingresos Totales" / "Gastos Totales" / "Flujo de Caja Libre" / "Capacidad de Endeudamiento" (+ "(80% del flujo de caja libre)" caption) | 60–119 |
| "Ver detalles" button | 86 |
| Details dialog title "Detalle de Transacciones" + section headings "Ingresos (n)"/"Gastos (n)" + empty state "No hay transacciones registradas" | 130, 138, 184, 231 |

### `src/components/financial-health/TransactionTotals.tsx`
**Not currently rendered anywhere** (no import found outside this file) — this is a dead/duplicate component of `TransactionSummary.tsx`'s totals row (same "Ingresos Totales"/"Gastos Totales"/"Ver detalles"/details-dialog copy, same category label duplication). Editing copy here has no visible effect; confirm with the team whether to delete it or wire it up before touching its text.

### `src/components/financial-health/FinancialMetrics.tsx`
**Not currently rendered anywhere** (no import found outside this file) — same situation as `TransactionTotals.tsx`. Contains its own copy of "Ingresos Totales"/"Gastos Totales"/"Flujo de Caja Libre" (32–65) plus a critical-DTI alert banner ("¡Cuidado! Tus gastos actuales..." at line 23–26) and "Capacidad sugerida: ..." caption (72). Dead code — verify before editing.

### `src/components/financial-health/HealthGaugeChart.tsx`
"Tu gasto corresponde al **{X}%** de tu ingreso" (lines 62–66).

### `src/components/financial-health/HealthStatusIndicator.tsx`
`statusConfig` labels shown next to the DTI gauge — **excellent**: "Salud Financiera Excelente" (12), **adjusted**: "Finanzas Ajustadas" (19), **critical**: "Alerta: Capacidad Crítica" (26). These three strings are the only place the DTI health-status wording lives; the underlying thresholds (`<50%` / `50–75%` / `>75%`) are business rules defined in `financialHealthStore.ts`, not here — don't change the thresholds by editing this file.

## 7. Shared forms — Newsletter & Contact

### `src/components/features/NewsletterForm.tsx`
| String | Line |
|---|---|
| Success banner "¡Te has suscrito exitosamente!..." | 67 |
| Error banner label "Error al suscribirte" + validation message "Por favor, ingresa un email válido" (26) / generic fallback (51) | 76–77 |
| Field labels "Correo Electrónico *" / "Nombre (Opcional)" | 84, 97 |
| Submit button "Suscribirme" / loading state "Suscribiendo..." | 117, 121 |
| "Nunca compartimos tu correo. Cero spam, prometido." | 126 |

This line used to read "Tus datos se procesan localmente en tu dispositivo" — a data-locality claim that isn't actually true for this form, since submitting it does send the email off-device via `emailService.ts`/EmailJS. It was rewritten to make a claim about this specific action (no sharing, no spam) instead.

### `src/components/features/ContactForm.tsx`
| String | Line |
|---|---|
| Card heading "Envíanos un Mensaje" | 100 |
| Success banner "¡Mensaje enviado exitosamente!..." | 105 |
| Error banner label "Error al enviar el mensaje" + validation messages (email/subject/message required) | 113, 29–39 |
| Field labels: Asunto (121), Nombre (134), Correo (148), Teléfono (161), Mensaje (175) + placeholders | 121–185 |
| Submit button "Enviar Mensaje" / loading state "Enviando..." | 195, 191 |

## 8. Shared UI chrome & validation

### `src/components/ui/Dialog.tsx`
`aria-label="Cerrar"` on the close button (line 66) — the only hardcoded string; `title` and body content are passed in by each caller (see the per-feature sections above for each dialog's actual title/body).

### `src/components/ui/Tooltip.tsx`
No hardcoded copy — `message` is passed in per-instance by every caller listed above.

### `src/components/analytics/ErrorBoundary.tsx`
Fallback UI shown on an uncaught render error: "Algo salió mal" (57), body copy (60–61), "Recargar página" button (67).

### `src/components/analytics/CookieConsent.tsx`
Two near-duplicate copies of the same message exist — the `react-cookie-consent` library path (118–129) and the manual fallback used if that library fails to load (55–58). Buttons: "Rechazar" / "Aceptar" (both paths).

### `src/components/ui/OrientationWarning.tsx`
Currently unreachable: the component always returns `null` because the orientation-detection logic that would set `isMobile`/`isPortrait` to `true` is commented out (lines 17–29). Copy is intact for whenever that's re-enabled: "Gira tu dispositivo" (103), "usa el teléfono en formato horizontal" (110), footnote (117).

### `src/lib/validation.ts`
All inline field-validation error strings for the loan form (`validatePrincipal`, `validateRate`, `validateTermMonths`, `validateDate`, `validateAmount`) — shared by `LoanForm.tsx` and `ExtraPaymentsManager.tsx`. Edit here, not at the call site, to change a validation message everywhere it's used.

### `src/lib/pdfGenerator.ts`
All copy inside the exported amortization PDF is generated here as plain strings passed to `jsPDF`/`jspdf-autotable` — section headings ("Información del Préstamo", "Métricas Clave", "Desglose de Costos", "Tabla de Amortización"), field labels, column headers, and the footer ("Página X de Y", "Generado el ..."). This is the one place copy exists outside the rendered DOM, so it's easy to miss when doing a copy pass on the app.

### `src/lib/emailService.ts`
User-facing only via thrown error messages surfaced in `NewsletterForm.tsx`/`ContactForm.tsx` ("EmailJS no está configurado correctamente...", "El email proporcionado no es válido"). The newsletter-subscription email's own subject/body ("Nueva suscripción a notificaciones...") is sent to the site owner, not shown to the user.
