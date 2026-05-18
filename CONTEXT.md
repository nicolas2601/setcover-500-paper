# SET COVER 500×500 — CONTEXTO COMPLETO PARA FRONTEND

> **Para la IA que reciba este documento:** construye un sitio web de presentación
> (single-page o multi-section) que comunique el proyecto descrito abajo. NO necesitas
> el código de los algoritmos — los resultados ya están calculados y son los del
> apartado **3. Resultados (cifras canónicas)**. Usa exactamente esos números, no
> los inventes ni los modifiques.

---

## 0. Identidad del proyecto

| Campo | Valor |
|---|---|
| Título | **Set Cover 500×500 — Exacto vs Metaheurístico** |
| Materia | Investigación de Operaciones |
| Universidad | UNAB · Universidad Autónoma de Bucaramanga |
| Año | 2026 |
| Autores | **Nicolás Moreno** y **Julian Arteaga** |
| Lenguaje de implementación | MATLAB (ambos métodos) |
| Tipo de entrega | Presentación final + paper estilo IEEE |
| Idioma del sitio | Español (Colombia) |

---

## 1. El problema

### 1.1. Enunciado

Una empresa de telecomunicaciones debe seleccionar el **subconjunto mínimo
de antenas** (de un total de **500 candidatas**) que **cubra a los 500 clientes**
del territorio, **minimizando el costo total** de las antenas activadas.

Cada antena cubre un subconjunto distinto de clientes. Cada cliente debe ser
cubierto por **al menos una** antena seleccionada.

Es una instancia clásica de **Set Cover Problem (SCP)** — NP-difícil.

### 1.2. Datos de entrada (instancia)

- **n = 500** clientes (filas de la matriz de cobertura)
- **m = 500** antenas candidatas (columnas)
- **Matriz A ∈ {0,1}^(500×500)**: A[i][j] = 1 si la antena `j` cubre al cliente `i`
- **Vector c ∈ ℝ^500**: costo de activar cada antena
- Densidad de A: **9.99 %** (≈ 24,971 unos sobre 250,000 celdas)
- Cada cliente es cubierto por entre **32 y 70 antenas** (promedio 49.94)
- Costos por antena: **$2,000 – $3,998** (media $3,034, mediana $3,080, σ $593)
- Costo si seleccionáramos las 500 antenas: **$1,516,821** (cota superior trivial)
- Cota inferior por cliente (mínima posible): **$2,313**
- Instancia factible: no hay clientes huérfanos, no hay antenas inútiles

### 1.3. Por qué es difícil

El espacio de búsqueda completo es **2^500 ≈ 3.27 × 10^150** subconjuntos posibles.
Es uno de los **21 problemas NP-completos de Karp**. No existe algoritmo
polinómico conocido. Resolverlo exacto sólo es viable con poda inteligente
(Branch & Bound), y aún así puede no terminar dentro de un tiempo razonable.

---

## 2. El modelo matemático

### 2.1. Formulación PLE (Programación Lineal Entera)

```
Variables:
  x_j ∈ {0, 1}   para j = 1, …, 500   (1 si se activa la antena j)

Función objetivo:
  min  Σ_{j=1..500} c_j · x_j

Sujeto a:
  Σ_{j=1..500} A[i][j] · x_j ≥ 1     ∀ i = 1, …, 500   (cobertura)
  x_j ∈ {0, 1}                        ∀ j               (binariedad)
```

- La relajación LP (con x_j ∈ [0,1]) da una **cota inferior**: $27,859.93
- El gap de integralidad (LP vs entera) es enorme: **79.43 %**, lo que explica
  por qué el Branch & Bound se vuelve costoso.

### 2.2. Los dos métodos a comparar

| | **Método Exacto (PLE)** | **Metaheurística (GA)** |
|---|---|---|
| **Algoritmo** | Branch & Bound | Algoritmo Genético |
| **Implementación** | `intlinprog` de MATLAB | Código propio en MATLAB |
| **Garantía** | Óptimo si termina (aquí: IntegerFeasible por timeout) | Solución aproximada, sin garantía |
| **Para qué sirve** | Saber el "mejor posible" como referencia | Decisión rápida cuando no se puede esperar 10 min |

---

## 3. Resultados (cifras canónicas — USAR EXACTO)

> Estas son las cifras del paper final. No inventar otras.
> Fuente: `resultados_setcover.txt` y `proyecto_de_investigación_de_operaciones.pdf`.

### 3.1. Método Exacto — PLE con Branch & Bound

| Métrica | Valor |
|---|---|
| Status | **IntegerFeasible** (timeout 10 min, no óptimo certificado) |
| Antenas seleccionadas `|S|` | **22** |
| Costo total | **$49,988** |
| Tiempo de cómputo | **600.96 s** (10 min, MaxTime hit) |
| LP relajada (cota inferior) | $27,859.93 |
| Gap de integralidad (LP vs entera) | **79.43 %** |
| Gap residual (best int vs best LP en el árbol) | **0.386 %** |
| Nodos B&B explorados | **22,632** |

**Honestidad metodológica importante:** NO se debe vender esto como "óptimo".
El solver MATLAB devolvió `IntegerFeasible`, lo que significa que encontró una
solución entera buena pero NO probó que sea la mejor. El gap residual del
**0.386 %** indica que cualquier mejor solución entera estaría como máximo
~$193 por debajo. Es la mejor solución encontrada con 10 minutos de cómputo.

### 3.2. Método Metaheurístico — Algoritmo Genético

| Hiperparámetro | Valor |
|---|---|
| Tamaño de población | 150 |
| Generaciones máximas | 500 |
| Probabilidad de cruce | 0.9 |
| Probabilidad de mutación | Adaptativa 3 % → 0.5 % |
| Elitismo | 3 |
| Criterio de parada | Estancamiento por 80 generaciones |
| Generación de convergencia (mejor seed) | 95 |
| Semilla de la mejor corrida | 13 |

| Resultado (mejor de 5 corridas) | Valor |
|---|---|
| Antenas seleccionadas `|S|` | **23** |
| Costo total | **$50,795** |
| Tiempo de cómputo | **7.23 s** |
| Gap vs exacto | **+1.61 %** |
| Speedup vs exacto | **≈ 83×** más rápido |

### 3.3. Robustez del GA — 5 semillas

| Semilla | Costo | Gap vs ILP | `|S|` | Notas |
|---|---|---|---|---|
| S1 (seed 7)  | $50,253 | +0.53 % | 23 | **mejor** |
| S2 (seed 13) | $50,795 | +1.61 % | 23 | peor |
| S3 (seed 42) | $50,253 | +0.53 % | 23 | empata con S1 |
| S4 (seed 100)| $50,366 | +0.76 % | 23 | |
| S5 (seed 999)| $50,546 | +1.12 % | 23 | |

| Estadístico | Valor |
|---|---|
| Media μ | **$50,443** |
| Desviación estándar σ | **$230.6** |
| Coeficiente de variación CV | **0.46 %** |
| Gap medio vs ILP | 0.91 % |
| Peor caso (S2) | +1.61 % |
| Mejor caso (S1, S3) | +0.53 % |

**Lectura:** el GA es **muy estable** (CV < 0.5 %). Incluso en su peor corrida
queda a menos del 2 % del óptimo certificado, en menos de 8 segundos.

### 3.4. Tabla comparativa final (la que va en el paper)

| Método | Costo | `|S|` | Tiempo | Gap | Garantía |
|---|---|---|---|---|---|
| **PLE — ILP (B&B)** | **$49,988** | 22 | 600.96 s | ref. (0.386 % residual) | IntegerFeasible |
| **Algoritmo Genético** | $50,795 | 23 | **7.23 s** | +1.61 % | sin garantía |

> ⚠️ **NO** mostrar LP relajada ni Greedy en esta tabla. Sólo dos columnas
> de método: PLE-ILP y GA. Ese fue un cambio explícito de los autores
> respecto al paper original.

---

## 4. Narrativa para la presentación (storytelling)

El sitio debe contar **tres ideas en orden**:

### Idea 1 — "El problema parece simple pero no lo es"
Mostrar que con 500 antenas hay 2^500 combinaciones (≈ 3.27 × 10^150).
Una computadora ejecutando 10^12 evaluaciones/segundo necesitaría más años que
la edad del universo para enumerar todo. Es NP-difícil.

### Idea 2 — "Hay un método exacto, pero pesa"
El PLE garantiza el mejor resultado posible, pero en 10 minutos solo
llegó a `IntegerFeasible` con un residual de 0.386 %. Explorar 22,632 nodos
del árbol de B&B con MATLAB `intlinprog`. La poda funciona, pero el problema
sigue siendo grande.

### Idea 3 — "Una metaheurística llega en segundos al 1.61 %"
El GA encuentra una solución de $50,795 en 7.23 segundos — **83 veces más rápido**
que el exacto, con un gap del 1.61 % vs el mejor entero encontrado.
Para una empresa que necesita decidir hoy, el GA es la elección obvia.

### Cierre — "Honestidad metodológica"
El exacto NO es "el óptimo certificado", es `IntegerFeasible`. El GA NO es
"perfecto", tiene 1.61 % de gap. Ambos son útiles para distintos contextos:
PLE para fijar el techo de calidad, GA para producción a escala.

---

## 5. Lo que el frontend debe mostrar (lista de scenes/sections)

Estructura sugerida (10 secciones, pueden combinarse):

1. **Hero** — Título "Set Cover 500×500" + nombre autores + UNAB 2026 + frase ancla.
2. **El problema** — 500 antenas, 500 clientes, matriz binaria 500×500, densidad 9.99 %, visualización de la matriz (heatmap o sub-muestra).
3. **El modelo** — Formulación PLE en LaTeX/KaTeX (ver sección 2.1 de este doc).
4. **Método exacto** — Branch & Bound, intlinprog, mostrar el árbol de B&B animado o estático, las 4 métricas grandes: $49,988 / 22 antenas / 600.96 s / gap residual 0.386 %.
5. **Método genético** — Diagrama del flujo del GA (población → selección → cruce → mutación → elitismo → estancamiento), hiperparámetros, métricas: $50,795 / 23 antenas / 7.23 s.
6. **Convergencia del GA** — Gráfico de costo vs generación (la curva baja rápido las primeras ~95 generaciones y luego se aplana hasta estancarse en gen ~175).
7. **Comparación** — Tabla **solo de 2 métodos** (PLE vs GA). Barras horizontales o verticales, idealmente con baseline-zoom para que el 1.61 % de diferencia en costo se vea visualmente (la diferencia absoluta es solo $807, ~1.6 % — con baseline 0 las barras se ven casi iguales y no comunica).
8. **Robustez** — 5 semillas del GA, media $50,443 / σ $231 / CV 0.46 %, dot plot con los 5 puntos vs línea horizontal del ILP óptimo.
9. **Conclusiones** — Recomendar GA para producción, PLE para benchmark / certificación de calidad. Honestidad sobre IntegerFeasible. Speedup 83×.
10. **Footer** — Repositorio, fecha, créditos.

---

## 6. Lecciones / errores a EVITAR en el diseño

Estos son errores que cometieron las versiones anteriores del sitio:

- ❌ Mostrar la tabla comparativa con **4 métodos** (LP relajada, Greedy, GA, PLE).
  → Solo **2 métodos**: PLE-ILP y GA. Esa fue una decisión explícita.
- ❌ Decir "Óptimo $50,123" o cualquier costo diferente de **$49,988** para el PLE.
- ❌ Decir "Gap 0 %" o "0.00 %" para el PLE. El gap residual es **0.386 %** porque es `IntegerFeasible`.
- ❌ Usar baseline = 0 para comparar costos del PLE vs GA → la diferencia 1.61 % no se ve y la gráfica miente visualmente.
- ❌ Hacer barras o charts diminutas en cards gigantes con espacio muerto.
- ❌ Layout en grid donde texto y gráfica quedan separados con diagonal de espacio en blanco.
- ❌ Usar datos hardcodeados que no coincidan con `results.json` / sección 3 de este doc.
- ❌ Llamar al GA "óptimo" o al PLE "exacto certificado". Son **IntegerFeasible** y **aproximado** respectivamente.
- ❌ Inventar hiperparámetros del GA distintos a los de la sección 3.2.
- ❌ Datos de las 5 semillas distintos a [50253, 50795, 50253, 50366, 50546].

---

## 7. Cifras de referencia rápida (cheat-sheet 1-página)

```
PROBLEMA
  n = 500 clientes · m = 500 antenas · A ∈ {0,1}^(500×500)
  Densidad: 9.99 %  |  Total unos: 24,971
  Costos antenas: [$2,000 – $3,998]  |  μ = $3,034
  Cota inferior: $2,313  |  Cota superior trivial: $1,516,821
  Espacio de búsqueda: 2^500 ≈ 3.27e150

PLE (intlinprog · MATLAB)
  Status: IntegerFeasible (timeout 10 min)
  Costo: $49,988  |  |S| = 22  |  Tiempo: 600.96 s
  Nodos B&B: 22,632  |  Gap residual: 0.386 %
  LP relax: $27,859.93  |  Gap integralidad: 79.43 %

GA (MATLAB custom)
  pop 150 · gens 500 · p_c 0.9 · p_m 3%→0.5% · elite 3
  parada: estancamiento 80 gens  |  conv ≈ gen 95
  Mejor seed: 13
  Costo: $50,795  |  |S| = 23  |  Tiempo: 7.23 s
  Gap vs ILP: +1.61 %  |  Speedup: 83×

GA × 5 SEMILLAS
  Corridas: [$50,253, $50,795, $50,253, $50,366, $50,546]
  Media μ: $50,443  |  σ: $230.6  |  CV: 0.46 %
  Gap medio: 0.91 %  |  Mejor: +0.53 % (s1, s3)  |  Peor: +1.61 % (s2)

TABLA FINAL (solo PLE vs GA, dos columnas)
                  PLE — ILP        GA
  Costo           $49,988          $50,795
  |S|             22               23
  Tiempo          600.96 s         7.23 s
  Gap             ref (0.386 %)    +1.61 %
  Garantía        IntegerFeasible  sin garantía
```

---

## 8. Stack técnico recomendado para el frontend

Sugerencias (la IA receptora decide), pero el sitio anterior usaba:

- Next.js 16 + Turbopack
- TypeScript estricto
- Tailwind v4 + design tokens (paleta GIC light: azul cofounder #0081c0, dark charcoal #171717, canvas blanco #ffffff)
- Framer Motion / GSAP + ScrollTrigger para animaciones
- KaTeX para fórmulas matemáticas
- Charts en SVG custom (no librerías pesadas como Recharts) para máximo control
- Crimson Pro (serif para titulares) + Inter (sans) + JetBrains Mono (mono para números)

**Lo importante NO es la stack, es que las cifras coincidan con la sección 3 y la
narrativa de la sección 4 esté clara.**

---

## 9. Tono y estética sugeridos

- **Editorial científico moderno**, no "presentación corporativa con bullet points"
- Cifras grandes con `tabular-nums` (font-feature-settings: 'tnum')
- Diferenciar visualmente el GA (color de acento, azul cofounder) del PLE (charcoal/negro)
- Mostrar la diferencia 1.61 % de costo con **baseline zoom** (no escala desde 0)
- Mostrar el 83× speedup como hallazgo principal
- Honestidad por encima de marketing: "IntegerFeasible", no "óptimo"
- Espacio en blanco generoso pero **sin dejar diagonales vacías** entre texto y gráficas

---

## 10. Glosario rápido

| Término | Definición |
|---|---|
| **Set Cover Problem (SCP)** | Dado un universo U y una colección de subconjuntos S, encontrar el menor sub-colección de S cuya unión sea U. NP-completo. |
| **PLE / ILP** | Programación Lineal Entera. Variables enteras (aquí binarias). |
| **Branch & Bound (B&B)** | Algoritmo que enumera implícitamente el árbol de soluciones, podando ramas que no pueden mejorar al mejor conocido. |
| **LP relax** | Relajación lineal del PLE: x_j ∈ [0,1] en vez de {0,1}. Da una cota inferior. |
| **Gap de integralidad** | (PLE − LP) / PLE. Mide qué tan lejos está la LP de la entera. |
| **Gap residual** | (best integer − best bound) / best integer. Mide qué tan certificado está el óptimo. 0 % = óptimo probado. |
| **IntegerFeasible** | El solver encontró una solución entera factible, pero NO certificó que sea óptima. |
| **Metaheurística** | Heurística de propósito general que explora el espacio sin garantía pero con buena calidad práctica. |
| **GA / Algoritmo Genético** | Metaheurística inspirada en evolución: población → selección → cruce → mutación → elitismo. |
| **Cromosoma** | En el GA, vector binario de longitud 500 (1 = antena seleccionada). |
| **Estancamiento** | Generaciones sin mejora del mejor individuo. Criterio de parada anticipada. |
| **Speedup** | Tiempo método A / tiempo método B. Aquí 600.96 / 7.23 ≈ 83×. |
| **Coeficiente de variación (CV)** | σ / μ. Mide dispersión relativa. CV < 1 % = muy estable. |

---

## Apéndice — Fuentes de la verdad

- `proyecto_de_investigación_de_operaciones (1).pdf` → paper IEEE final con todas las cifras
- `resultados_setcover.txt` → log raw del solver MATLAB
- `results.json` → cifras estructuradas listas para consumir desde JS
- `Guion_Sustentacion_SetCover.docx` → guión hablado de 5–8 minutos para Nicolás y Julian

Cualquier discrepancia: **el paper PDF manda**. Este documento (CONTEXT.md) refleja
el estado del paper a fecha mayo 2026.
