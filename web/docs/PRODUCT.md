# PRODUCT — Set Cover 500×500

> Contrato de producto. Cualquier decisión de UI/UX, copy o información que se construya en `/web` debe poder justificarse contra este documento.
> Si una decisión lo contradice, este archivo manda.

---

## 1. Identidad

| Campo | Valor |
|---|---|
| Proyecto | **Set Cover 500×500 — Exacto vs Metaheurístico** |
| Tipo | Sitio de presentación académica (single-page scrollytelling) |
| Autores | **Nicolás Moreno** y **Julian Arteaga** |
| Universidad | UNAB · Universidad Autónoma de Bucaramanga |
| Materia | Investigación de Operaciones |
| Año | 2026 |
| Idioma | Español Colombia |
| URL canónica (placeholder) | `setcover.nicolasmoreno.dev` |

---

## 2. Audiencia

### Primaria — Jurado académico UNAB
- Profesores de Investigación de Operaciones evaluando la sustentación final.
- Esperan rigor matemático, honestidad metodológica, y referencias correctas (Karp, B&B, GA).
- Si ven una cifra inflada o un "óptimo certificado" donde no lo hay, **bajan la nota**.
- Escena física: proyector en aula UNAB, navegación adelante/atrás durante la defensa, lectura post-defensa en pantalla 13"–24".

### Secundaria — Lectores del paper IEEE
- Investigadores que llegan al sitio buscando reproducibilidad: hiperparámetros del GA, instancia exacta, semillas usadas.
- Necesitan la cheat-sheet del CONTEXT.md sección 7 accesible sin scroll infinito.
- Escena física: lectura técnica en monitor 27" lado a lado con el PDF.

### Terciaria — Empleadores que ven el portfolio de Nicolás
- Tech leads / hiring managers escaneando proyectos en 90 segundos.
- Tienen que pensar literalmente: "alguien diría '$150k agency build', no 'template académico'".
- Escena física: una pestaña entre 12 abiertas, atención de 2 minutos máximo, click decisivo en hero.

---

## 3. Tono y voz

### Lo que es
- **Editorial científico honesto**. Magazine académico, no PowerPoint corporativo.
- **Sobrio**. Las cifras hablan; el copy las acompaña sin adornarlas.
- **Preciso**. `IntegerFeasible` cuando es `IntegerFeasible`. `+1.61 %` cuando es `+1.61 %`. Nunca redondeos engañosos.
- **Bilingüe técnico**: español natural, términos técnicos en inglés cuando son canónicos (`Branch & Bound`, `Set Cover`, `intlinprog`).
- **Confiado pero humilde**. El speedup 83× es un hallazgo, no una victoria de marketing.

### Lo que NO es
- ❌ Marketing SaaS ("Elevate", "Unleash", "Seamless", "Next-Gen", "Cutting-edge")
- ❌ Em-dashes `—` ni dobles guiones `--` (Paula los odia y arruinan el ritmo del español)
- ❌ Bullet points decorativos donde la prosa funciona mejor
- ❌ Exclamaciones, emojis, "✨", "🚀"
- ❌ Frases vacías tipo "En este proyecto exploramos...", "Es importante destacar que...", "Cabe mencionar..."
- ❌ Anglicismos forzados ("workflows", "stakeholders") cuando hay palabra natural
- ❌ Falsa modestia ("solo un proyecto de clase") ni falso vuelo ("revolucionario")

### Registro de copy (ejemplos canónicos)

| Contexto | Mal | Bien |
|---|---|---|
| Hero subtítulo | "Comparativa de algoritmos para optimización combinatoria" | "Programación entera vs un algoritmo genético, sobre 500 antenas y 500 clientes." |
| Speedup framing | "¡83 veces más rápido!" | "El GA llega en 7.23 s. El exacto necesita 600.96 s. Speedup ≈ 83×." |
| PLE status | "Solución óptima encontrada" | "IntegerFeasible. El solver paró por timeout a los 10 minutos con un residual del 0.386 %." |
| Cierre | "Conclusión: el GA es mejor." | "El GA es la elección práctica. El PLE sigue siendo la referencia de calidad. No compiten, se complementan." |

---

## 4. Anti-references (qué NO puede parecer)

- ❌ Landing SaaS estilo Stripe / Linear / Vercel. Esto es académico, no comercial.
- ❌ Hero-metric template: número gigante centrado + label chico + 3 stats supporting. Es el cliché que matamos primero.
- ❌ Tres cards iguales en grid 3-col con icono + heading + texto. Síntoma de template.
- ❌ Glassmorphism como default surface. Solo cards puntuales si justifican narrativa.
- ❌ Side-stripe `border-left` accents (clásico del Bootstrap medical).
- ❌ Charts en cards diminutos con espacio muerto alrededor.
- ❌ Layout diagonal donde texto y gráfica quedan separados con vacío entre medio.
- ❌ "Scroll to explore" con chevron rebotando.
- ❌ Comparación de costos con baseline = 0 → la diferencia 1.61 % se ve plana y la gráfica miente.
- ❌ Tabla comparativa con 4 métodos (LP, Greedy, GA, PLE). Solo **2**: PLE-ILP y GA.
- ❌ Citar costos distintos de `$49,988` (PLE) y `$50,795` (GA). Esos son los oficiales.

---

## 5. North-star

> **"Alguien diría '$150k agency build', no 'template académico'."**

Concreto:
- Si un Principal Designer de basement.studio abre el sitio y dice "esto es decente", ganamos.
- Si un profesor UNAB dice "entendí el problema en 30 segundos y la honestidad metodológica está respetada", ganamos.
- Si un hiring manager dice "este chico sabe diseñar, no solo codear", ganamos.

Si cualquiera de los tres dice "es un template con buenas fonts", **fallamos**.

---

## 6. Principios estratégicos

### 6.1 Honestidad metodológica primero
- El PLE NO es óptimo certificado. Es `IntegerFeasible` con gap residual 0.386 %.
- El GA NO es perfecto. Tiene gap +1.61 % vs el mejor entero encontrado.
- Ambos son útiles para distintos contextos. Esa es la tesis.
- Cualquier copy que sugiera lo contrario es una falla del producto.

### 6.2 Cifras como protagonistas
- Toda cifra del CONTEXT.md sección 3 va con `tabular-nums` y `font-mono` para los números.
- Las cifras grandes son lectura rápida. Las pequeñas son auditoría.
- `$49,988`, `$50,795`, `22`, `23`, `600.96 s`, `7.23 s`, `83×`, `0.386 %`, `+1.61 %`, `0.46 %` son sagradas.

### 6.3 Storytelling de 3 ideas (CONTEXT sección 4)
1. El problema parece simple pero es NP-difícil (`2^500 ≈ 3.27 × 10^150`).
2. El método exacto pesa: 10 minutos y aún `IntegerFeasible`.
3. La metaheurística llega en segundos con gap del 1.61 %.
4. Cierre honesto: ambos métodos, ambos útiles, distintos contextos.

### 6.4 Diferenciación visual entre métodos
- **PLE** se asocia con `ink` (charcoal/negro tintado). Sobrio, institucional, peso.
- **GA** se asocia con `accent` (azul cofounder OKLCH ≈ `#0081c0`). Acción, velocidad, hallazgo.
- Esa dualidad cromática es el ancla visual del paper entero.

### 6.5 Baseline zoom obligatorio
- En la comparación de costos, baseline NO puede ser 0. Tiene que ser ~$49,000 para que el `+1.61 %` (=$807 absolutos) se vea.
- Si la gráfica se ve "casi iguales", el chart está mintiendo y hay que rehacerlo.

### 6.6 Tabla final: solo 2 columnas
- PLE-ILP y GA. No LP relajada. No Greedy. Esa fue decisión explícita de los autores.

---

## 7. Out of scope

- ❌ Dashboard interactivo donde el usuario "corre el GA en vivo". No es un playground.
- ❌ Implementación en JS/WASM del solver. Los resultados ya están calculados.
- ❌ Comparación con otros solvers (CPLEX, Gurobi). Solo MATLAB `intlinprog`.
- ❌ Login, analytics, comments. Es sitio estático de presentación.
- ❌ Modo oscuro toggle (el sitio es light editorial; un dark switch dispersa el foco).
- ❌ i18n. Español Colombia, hardcodeado.
- ❌ Blog, news, "related projects". Single-page, una sola narrativa.
- ❌ Generador automático de paper PDF. El PDF ya existe; el sitio solo lo enlaza si aplica.

---

## 8. Métricas de éxito (no business, calidad)

- **Lighthouse Performance ≥ 90** mobile.
- **CLS = 0** en todo el scroll.
- **LCP < 2.5 s** desktop fibra.
- **AA contrast ≥ 4.5:1** en body text.
- **`prefers-reduced-motion`** respetado: el sitio sigue siendo legible sin un solo movimiento.
- **Cero menciones falsas** de "óptimo" / "certificado" cuando es `IntegerFeasible`.
- **Las 10 cifras canónicas** (CONTEXT sección 7) renderizadas literal, sin redondeo creativo.

---

## 9. Referencias prohibidas explícitas

| Pattern | Por qué no | Qué hacer |
|---|---|---|
| Hero centrado + número gigante + label chico | Template SaaS, 0 originalidad | Editorial split asimétrico con Fraunces a `clamp(64px, 9vw, 144px)` |
| 3-col equal cards (`grid-cols-3`) | Síntoma de slop | Bento asimétrico 12-col con celdas de span variable |
| Gradient text via `bg-clip-text` | Truco AI cliché | Tipografía sólida sobre paper, peso editorial |
| `shadow-md` / `shadow-lg` | Genérico Tailwind | `ring-1 ring-hairline` + inner highlight + Doppelrand |
| `border-l-4 border-blue-500` | Side-stripe Bootstrap | Eyebrow tag uppercase + spacing real |
| Em-dashes `—` para separar cláusulas | Reescritura típica de LLM | Punto seguido, dos puntos, o coma según corresponda |
| "Scroll to explore" + chevron | Cliché muerto desde 2018 | Confianza editorial: el contenido invita, no el copy |

---

## 10. Snapshot 1-línea (elevator)

> "Cómo seleccionar 22 antenas que cubran a 500 clientes minimizando $49,988, contado con honestidad metodológica: PLE-ILP para el techo, algoritmo genético para producción a 7.23 s."
