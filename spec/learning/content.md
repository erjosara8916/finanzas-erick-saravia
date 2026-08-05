# Aprende — Borrador de contenido (6 artículos)

Copy para los 6 artículos definidos en `review.md` (sección "Aprende"). Español, mismo tono que el resto del sitio (cercano, directo, con ejemplos numéricos). Las fórmulas y umbrales citados aquí son exactamente los que ya usa la app (`src/lib/engine.ts`, `src/store/financialHealthStore.ts`) — no son aproximaciones.

Frontmatter propuesto por artículo (para cuando se implemente como content collection): `title`, `description`, `order`.

---

## 1. ¿Qué es la tasa de interés y cómo afecta tu crédito?

**order: 1**
**description:** La tasa de interés es el costo de pedir dinero prestado. Entiende cómo se calcula y por qué un pequeño cambio en el porcentaje puede significar mucho dinero a lo largo del préstamo.

### Contenido

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

**En la app:** el campo **"Tasa de Interés Anual (%)"** en el simulador de préstamos es exactamente esta tasa. Cambia el valor y observa cómo se recalcula tu cuota mensual y el interés total en la tabla de amortización.

---

## 2. Tasa nominal vs. TAE (costo real de un préstamo)

**order: 2**
**description:** La tasa que anuncia el banco no siempre es el costo real de tu préstamo. Aprende la diferencia entre la tasa nominal y el costo total, incluyendo seguros y cargos.

### Contenido

La **tasa nominal** (o tasa de interés anual) es el porcentaje que el banco usa para calcular tus intereses — es la que revisamos en el artículo anterior. Pero un préstamo casi nunca cuesta *solo* eso.

La mayoría de préstamos incluyen costos adicionales que se suman a tu cuota mensual, aunque no forman parte de la tasa de interés:

- **Seguro mensual** (a menudo obligatorio, cubre el préstamo en caso de que no puedas pagar).
- **Cargos administrativos o de mantenimiento** (comisiones fijas que cobra el banco cada mes).

El **costo real** de tu préstamo — a veces llamado **TAE (Tasa Anual Equivalente)** o, en inglés, **APR (Annual Percentage Rate)** — es el que resulta de sumar la tasa nominal *más* todos estos cargos adicionales, expresado como si fuera una sola tasa.

**Ejemplo:** imagina un préstamo con:

- Tasa nominal: 12% anual
- Cuota calculada por la tasa: $220/mes
- Seguro mensual: $15
- Cargos adicionales: $10

Tu **cuota mensual total** real es:

```
cuota total = cuota calculada + seguro + cargos
cuota total = $220 + $15 + $10 = $245/mes
```

Aunque el banco te muestre "12% anual" como su tasa, tu costo real mensual es más alto que lo que esa tasa por sí sola sugiere — por eso siempre hay que mirar la cuota **total**, no solo la tasa anunciada.

**En la app:** el simulador separa estos conceptos exactamente así — tienes los campos **"Seguro Mensual"** y **"Cuotas Mensuales Adicionales"** por separado de la tasa, y el simulador te muestra tanto la **"Cuota Mensual Calculada"** (solo la parte de capital + interés) como la **"Cuota Mensual Total"** (todo incluido), para que veas la diferencia con tus propios números.

---

## 3. Cómo funciona la tabla de amortización

**order: 3**
**description:** Cada cuota que pagas se divide entre capital e interés — y esa proporción cambia mes a mes. La tabla de amortización te muestra exactamente cómo.

### Contenido

Cuando pagas la cuota mensual de un préstamo, ese dinero no va todo a reducir tu deuda. Cada cuota se divide en dos partes:

- **Interés:** lo que le "cuesta" al banco prestarte el dinero ese mes (saldo pendiente × tasa mensual).
- **Capital (o principal):** lo que realmente reduce tu deuda.

```
cuota mensual = componente de interés + componente de capital
```

La **tabla de amortización** es el desglose, mes a mes, de cuánto de cada cuota va a cada componente, y cuál es el saldo restante después de cada pago.

**Un patrón importante:** al inicio del préstamo, el interés representa la porción más alta que tendrá en toda la vida del crédito — y esa porción baja mes a mes a medida que el saldo se reduce, mientras la parte de capital crece. En préstamos largos (como una hipoteca a 20 o 30 años), esto es tan marcado que durante los primeros años la mayoría de la cuota puede ir a interés. En el ejemplo de abajo, un préstamo más corto, el capital ya es la mayor parte de la cuota desde el primer mes — pero igual notarás cómo el interés baja y el capital sube con cada pago.

**Ejemplo simplificado** (préstamo de $10,000 a 12% anual, cuota fija de $500):

| Mes | Saldo inicial | Interés (1% del saldo) | Capital pagado | Saldo final |
|---|---|---|---|---|
| 1 | $10,000 | $100 | $400 | $9,600 |
| 2 | $9,600 | $96 | $404 | $9,196 |
| 3 | $9,196 | $92 | $408 | $8,788 |

Nota cómo el interés baja ($100 → $96 → $92) y el capital pagado sube ($400 → $404 → $408) aunque la cuota se mantenga en $500 los tres meses.

**Un dato relevante para tu presupuesto:** el dinero que pagas en interés, seguro y cargos adicionales es dinero que *no* reduce tu deuda — es el "costo" real de haber pedido el préstamo. En la app a esto se le llama **costo hundido** (sunk cost): todo lo que pagas que no sea capital.

**En la app:** la sección **"Tabla de Amortización"** del simulador te muestra fila por fila, para cada mes de tu préstamo, exactamente esta división entre capital e interés, además del saldo restante — calculada con tus propios números, no con un ejemplo genérico.

---

## 4. Pagos extra: cómo te ahorran dinero e intereses

**order: 4**
**description:** Abonar dinero extra a capital, incluso ocasionalmente, puede reducir años de pagos y miles en intereses. Entiende por qué funciona y cómo calcularlo.

### Contenido

Como vimos en el artículo anterior, el interés que pagas cada mes se calcula sobre tu **saldo pendiente**. Eso significa que si reduces ese saldo más rápido de lo previsto — pagando dinero extra directamente a capital — pagarás menos interés en todos los meses que quedan del préstamo.

Esto es diferente a simplemente pagar tu cuota normal. Un **abono extra a capital** es un pago adicional, por fuera de tu cuota mensual, que se resta directamente del saldo antes de calcular el interés del siguiente período.

```
nuevo saldo = saldo anterior - capital de la cuota - abono extra
interés del siguiente mes = nuevo saldo × tasa mensual
```

**Por qué "ahorra" dinero:** cada dólar que abonas de más hoy es un dólar sobre el que ya no pagarás interés en ningún mes futuro del préstamo. Mientras más temprano hagas el abono (más al inicio del préstamo, cuando el saldo es más alto), mayor es el ahorro total, porque ese dólar habría generado interés durante más meses.

**Ejemplo:** sobre el préstamo de $10,000 al 12% anual del artículo anterior, si en el mes 1 haces un abono extra de $1,000 (además de tu cuota normal):

```
saldo después del mes 1 sin abono extra:  $9,600
saldo después del mes 1 con abono extra:  $9,600 - $1,000 = $8,600
```

Ese $8,600 en vez de $9,600 significa que **todos los meses siguientes** calculan su interés sobre un saldo menor. En este ejemplo, ese abono de $1,000 reduce el interés total del préstamo de aproximadamente $1,213 a $984 — un ahorro de unos $229 — y adelanta el fin del préstamo en 3 meses. Mientras más largo sea el plazo restante en el momento del abono, mayor será el ahorro en intereses.

**En la app:** la sección **"Abonos a Capital"** del simulador te permite registrar estos pagos extra en cualquier mes del préstamo. La tabla de amortización y el resumen se recalculan automáticamente, y el resumen te muestra el **"Plazo Real"** — cuántos meses (menos que el plazo original) tomará terminar de pagar gracias a tus abonos.

---

## 5. ¿Qué es el DTI (relación deuda-ingreso) y por qué importa?

**order: 5**
**description:** El DTI mide qué porcentaje de tus ingresos ya se destina a gastos y deudas. Es el número que los bancos — y tú mismo — deberían mirar antes de asumir un nuevo préstamo.

### Contenido

El **DTI** (Debt-to-Income, o "relación deuda-ingreso") es un porcentaje que indica cuánto de tu ingreso mensual ya se está destinando a gastos y deudas existentes. Es una de las métricas más usadas para saber si una persona tiene margen para asumir un préstamo nuevo, o si ya está en una situación financiera ajustada.

```
DTI = (total de gastos mensuales / total de ingresos mensuales) × 100
```

**Ejemplo:** si tus ingresos mensuales son $2,000 y tus gastos (incluyendo deudas existentes) suman $900:

```
DTI = ($900 / $2,000) × 100 = 45%
```

Un DTI del 45% significa que el 45% de lo que ganas ya está comprometido en gastos — dejándote un 55% disponible para ahorro, imprevistos, o nuevas obligaciones como un préstamo.

**Cómo interpretar el resultado** (estos son los umbrales que usa la app):

| DTI | Estado |
|---|---|
| Menor a 50% | **Excelente** — tienes buen margen financiero |
| Entre 50% y 75% | **Ajustado** — tu presupuesto está comprometido, sé cuidadoso con nuevas deudas |
| Mayor a 75% | **Crítico** — la mayoría de tu ingreso ya está destinado a gastos y deudas |

**¿Cuánto puedo pagar de un préstamo nuevo, entonces?** La app calcula una **capacidad de pago sugerida**, que no es simplemente "todo lo que te sobra" — deja un margen de seguridad del 20% para imprevistos:

```
flujo disponible = ingresos - gastos
capacidad de pago sugerida = flujo disponible × 80%
```

**Ejemplo** (mismos números de arriba): con $2,000 de ingresos y $900 de gastos, el flujo disponible es $1,100. La capacidad de pago sugerida sería:

```
$1,100 × 80% = $880
```

Es decir, aunque técnicamente te "sobran" $1,100 al mes, lo prudente es no comprometer una cuota de préstamo mayor a $880 — dejando el 20% restante ($220) como colchón para gastos inesperados.

**En la app:** la herramienta **Salud Financiera** calcula tu DTI y tu capacidad de pago sugerida automáticamente a partir de las transacciones que registres, y el simulador de préstamos te avisa si la cuota de un préstamo que estás evaluando supera esa capacidad sugerida.

---

## 6. Presupuesto básico y fondo de emergencia

**order: 6**
**description:** Antes de pensar en préstamos o inversiones, todo presupuesto sólido empieza por dos cosas: saber exactamente a dónde va tu dinero, y tener un colchón para lo inesperado.

### Contenido

Un presupuesto no es una lista de restricciones — es simplemente saber, con números reales, cuánto entra y cuánto sale de tu bolsillo cada mes. Sin ese punto de partida, es imposible saber si puedes asumir un préstamo, cuánto puedes ahorrar, o si estás gastando más de lo que ganas sin darte cuenta.

**Los tres pasos básicos de cualquier presupuesto:**

1. **Registra todos tus ingresos** del mes (salario, bonos, ingresos adicionales).
2. **Registra todos tus gastos**, agrupados por categoría (vivienda, alimentación, transporte, deudas existentes, ocio, etc.) — entre más detallado, más útil.
3. **Compara ambos totales.** Si tus gastos superan tus ingresos, el presupuesto ya te está diciendo dónde debes ajustar, incluso antes de mirar cualquier otra métrica.

```
flujo disponible = ingresos totales - gastos totales
```

Si ese número es negativo, no hay margen para ahorro, inversión, ni nuevas deudas hasta que se corrija.

**El fondo de emergencia**

Un fondo de emergencia es dinero apartado — separado de tu cuenta del día a día — destinado únicamente a cubrir imprevistos serios: pérdida de empleo, una reparación urgente, un gasto médico inesperado. La recomendación general es que cubra entre **3 y 6 meses de tus gastos esenciales** (no de tus ingresos):

```
fondo de emergencia recomendado = gastos mensuales esenciales × (3 a 6)
```

**Ejemplo:** si tus gastos mensuales esenciales (vivienda, alimentación, servicios, transporte, deudas) suman $800, tu fondo de emergencia objetivo estaría entre:

```
$800 × 3 = $2,400  (mínimo)
$800 × 6 = $4,800  (recomendado para mayor tranquilidad)
```

**Por qué esto va antes que cualquier préstamo o inversión:** sin un fondo de emergencia, cualquier imprevisto te obliga a usar deuda (tarjetas de crédito, préstamos de emergencia con tasas altas) para cubrir gastos que un fondo ya apartado hubiera cubierto sin costo adicional. Es, en la práctica, la base sobre la que se construye toda la salud financiera del resto de estos artículos.

**En la app:** registrar tus ingresos y gastos en la herramienta **Salud Financiera** es exactamente el primer paso de este proceso — una vez tengas tus categorías registradas, la app calcula tu flujo disponible, tu DTI y tu capacidad de pago automáticamente, dándote la base numérica para decidir cuánto destinar a tu fondo de emergencia y cuánto margen tienes para el resto de tus metas financieras.
