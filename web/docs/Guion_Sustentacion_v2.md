# Guión de Sustentación · v2

**Resolución del problema Set Cover mediante Programación Lineal Entera y Algoritmo Genético**
*Caso de estudio: 500 antenas × 500 clientes*

Nicolás Moreno · Julian Arteaga
Investigación de Operaciones · Universidad Autónoma de Bucaramanga · 2026

---

## Resumen operativo

**Duración total**: 6 minutos (rango 5–8). Cada bloque tiene tiempo asignado.
Si vamos atrasados, recortar bloques marcados (opcional).

| Bloque | Hablante principal |
|---|---|
| Apertura, problema, modelo | **Nicolás** |
| Métodos, resultados, conclusiones | **Julian** |

> El segundo hablante interviene siempre al cierre de cada bloque para mostrar dominio compartido (la rúbrica evalúa **dominio individual**).

---

## Cifras canónicas (NO CONFUNDIR)

| Concepto | Valor exacto |
|---|---|
| Instancia | 500 antenas × 500 clientes |
| Densidad de la matriz A | 9.99% (24 971 unos) |
| Rango de costos | $2 000 – $3 998 (μ = $3 034, σ = $593) |
| Costo si encendemos las 500 | $1 516 821 |
| Cota inferior LP relajada | $27 860 |
| Gap de integralidad LP → entero | 79.43% |
| **PLE — ILP** (`intlinprog` MATLAB) | **$49 988 · 22 antenas · 600.96 s** |
| Estado del solver ILP | **IntegerFeasible** (NO certificó óptimo) |
| Gap residual del ILP | 0.386% |
| Nodos B&B explorados | 22 632 |
| **GA** (semilla 13, mejor seed) | **$50 795 · 23 antenas · 7.23 s** |
| Gap GA vs ILP | **+1.61%** ($807) |
| **Speedup GA vs ILP** | **83×** |
| Convergencia real del GA | gen ≈ 95 (parada anticipada por estancamiento de 80 gens) |
| Robustez GA (5 seeds) | μ = $50 443 · σ = $230.6 · **CV = 0.46%** |
| Semillas evaluadas | **7, 13, 42, 100, 999** |
| Mejor seed | S1 (seed 7) → $50 253 · +0.53% |
| Peor seed | S2 (seed 13) → $50 795 · +1.61% |

---

## Reglas de oro

1. **Nunca leer las slides** — explicar.
2. Si nos preguntan en medio, responder corto y volver al guión.
3. Pausar 2 segundos al decir las cifras importantes.
4. Cerrar cada bloque mirando al jurado, no a la pantalla.
5. Honestidad metodológica: el ILP NO certificó optimalidad. Es `IntegerFeasible`.
6. **Toda afirmación técnica fuerte se apoya en una referencia** (Karp, Beasley & Chu, Chvátal). Decir el autor en voz alta.

---

# BLOQUE 0 · Apertura
**0:00 — 0:30 · 30 segundos** · Slide: HERO

**NICOLÁS:**
> Buenos días. Soy Nicolás Moreno y junto con Julian Arteaga vamos a presentar nuestro proyecto final de Investigación de Operaciones: la resolución del **problema clásico de cubrimiento de conjuntos**, aplicado a una red de telefonía con 500 antenas y 500 clientes.

→ *Postura abierta, voz tranquila. Esperar 1 segundo.*

**JULIAN:**
> Lo resolvimos con dos enfoques complementarios — uno exacto, uno metaheurístico — y los comparamos en **calidad, tiempo y comportamiento**. Los resultados están publicados en nuestro paper IEEE y respaldados por las referencias clásicas del problema.

→ *Pausa. Avanzar a Slide 1 — "El Problema".*

---

# BLOQUE 1 · El problema
**0:30 — 1:30 · 60 segundos** · Slide: matriz binaria + 2^500

**NICOLÁS:**
> El escenario es real: una empresa de telefonía quiere dar cobertura a 500 clientes y tiene 500 ubicaciones potenciales para antenas. Cada antena tiene un costo distinto entre $2 000 y $3 998, y cubre solo a un subconjunto de los clientes — no todas a todos.

**NICOLÁS:**
> La pregunta es: ¿cuál es el subconjunto más barato de antenas que cubre a todos los clientes? Esto es el **Set Covering Problem**, formulado por Edmonds en 1962 y demostrado **NP-completo por Karp en 1972** [Karp, 1972] — uno de sus 21 problemas combinatorios fundacionales.

→ *Señalar la matriz. "NP-completo" se dice lento y mirando al jurado.*

**JULIAN:**
> Numéricamente, el espacio de búsqueda tiene **2 elevado a la 500** combinaciones — aproximadamente 3.27 × 10 elevado a 150 subconjuntos posibles. Eso es mayor que el número de átomos en el universo observable. La enumeración directa es físicamente imposible. Necesitamos métodos inteligentes.

→ *Pausa de 1 seg después de "físicamente imposible". Avanzar a Slide 2.*

---

# BLOQUE 2 · Formulación matemática **(rúbrica criterio 1 — 2.0 pts)**
**1:30 — 2:15 · 45 segundos** · Slide: modelo PLE en KaTeX

**JULIAN:**
> Formulamos el problema como un **Programa Lineal Entero** con tres componentes:

> **Primero — las variables**: una variable binaria x sub j por cada antena. x igual a 1 si la antena se activa, 0 si no. Son 500 variables binarias.

> **Segundo — la función objetivo**: minimizar la suma del costo c sub j por x sub j. Es decir, gastar lo mínimo posible.

> **Tercero — las restricciones de cobertura**: para cada cliente i, la suma de las antenas que lo cubren multiplicada por sus variables debe ser mayor o igual a 1. Son 500 restricciones, una por cliente.

→ *Mostrar fórmula explícita en pantalla. Leerla pausado.*

**JULIAN:**
> Si **relajamos la integralidad** y permitimos que x sub j tome valores fraccionarios entre 0 y 1, obtenemos una **cota inferior LP** de $27 860. Pero esa solución es físicamente imposible — no podemos instalar media antena. La distancia entre la cota LP y el óptimo entero — el **gap de integralidad** — es del **79.43%**. Esa cifra anticipa que el método exacto va a ser costoso.

→ *Avanzar a Slide 3.*

---

# BLOQUE 3 · Método exacto: PLE con Branch-and-Bound **(rúbrica criterio 2 — 2.0 pts)**
**2:15 — 3:15 · 60 segundos** · Slide: árbol B&B animado

**JULIAN:**
> Resolvimos el modelo con **Branch-and-Bound**, el algoritmo estándar para PLE [Land & Doig, 1960], usando `intlinprog` de MATLAB.

> La idea: construir un árbol de subproblemas. En cada nodo se resuelve la relajación LP. Si alguna variable sale fraccionaria, **se ramifica** en dos hijos — uno donde se fija a 0 y otro donde se fija a 1.

→ *El árbol se dibuja en pantalla con el scroll.*

**JULIAN:**
> Cuando una rama no puede mejorar la mejor solución entera encontrada hasta ese punto, **se poda**. Así evitamos enumerar las 2 elevado a 500 combinaciones.

**NICOLÁS:**
> El resultado: el solver exploró **22 632 nodos** y alcanzó el límite de **600 segundos** sin certificar optimalidad. La mejor solución entera encontrada fue **$49 988 con 22 antenas**, con un gap residual del **0.386%**.

> Traducción: el solver dice "esta es mi mejor solución, y si existe una mejor, no está a más del 0.4% de distancia".

→ *Decir "$49 988" pausado. Es el número ancla. NUNCA decir "óptimo" — decir "mejor solución entera encontrada".*

---

# BLOQUE 4 · Algoritmo Genético **(rúbrica criterio 3 — 2.0 pts)**
**3:15 — 4:30 · 75 segundos** · Slide: flujo GA horizontal

**NICOLÁS:**
> 10 minutos para esta instancia 500×500. Pero si fuera 5 000 × 5 000, el solver tardaría días. Necesitamos una alternativa que escale. Por eso implementamos un **Algoritmo Genético**.

**NICOLÁS:**
> Seguimos el esquema canónico de **Beasley & Chu (1996)** [INFORMS Journal on Computing], que es el GA de referencia para Set Cover, con seis componentes:

> **① Codificación binaria**: cada individuo es un cromosoma de 500 bits. Bit en 1 si la antena está activa.

> **② Población inicial híbrida** *(contribución nuestra al esquema clásico)*: 5% de individuos son copias perturbadas del **algoritmo greedy de Chvátal (1979)**, que da una garantía teórica logarítmica del óptimo. El 95% restante es aleatorio pero factible.

> **③ Selección, cruce y mutación**:
> - Torneo de tamaño 3.
> - Cruce uniforme con probabilidad p sub c = 0.9.
> - Mutación bit-flip **adaptativa** que decae de 3% a 0.5% conforme avanzan las generaciones — exploración temprano, explotación tarde.

> **④ Operador de reparación** *(el ingrediente clave del esquema Beasley & Chu)*: después de cruce y mutación, si quedan clientes sin cubrir, se agregan antenas con la regla greedy. Luego se eliminan redundancias en orden de costo decreciente. **Todos los hijos son siempre factibles.**

> **⑤ Elitismo**: las 3 mejores soluciones pasan intactas a la siguiente generación. Garantiza monotonía — la mejor fitness nunca empeora.

> **⑥ Parada anticipada por estancamiento** *(segunda contribución nuestra)*: si el mejor fitness no mejora durante 80 generaciones consecutivas, el bucle termina. Esto evita gastar cómputo después de la convergencia real.

→ *Pasar cada ingrediente sin leer; explicar al jurado.*

**JULIAN:**
> Con población de 150, máximo 500 generaciones, semilla 13, el GA **convergió en la generación 95** y se detuvo automáticamente. Costo final: **$50 795 con 23 antenas, en solo 7.23 segundos**. Gap de 1.61% respecto al ILP. Y es **83 veces más rápido** que el método exacto.

→ *Pausa larga después de "83 veces más rápido". Es la conclusión del bloque.*

---

# BLOQUE 5 · Comparación de métodos **(rúbrica criterio 4 — 1.5 pts)**
**4:30 — 5:30 · 60 segundos** · Slide: tabla 2-col + bar chart baseline-zoom + dot plot 5 seeds

La rúbrica pide explícitamente comparar en **calidad, tiempo Y comportamiento**. Vamos a cubrir los tres.

**NICOLÁS — Calidad:**
> La diferencia de costos es de **$807** — el GA está a 1.61% del mejor entero que pudo entregar el solver. En el bar chart con **baseline-zoom** desde $49 000 se ve la magnitud relativa real: visualmente cercanos, $807 absolutos.

**NICOLÁS — Tiempo:**
> 7.23 segundos contra 600.96 segundos. **Speedup de 83×**. Para una instancia 500 × 500 ya es relevante; para producción a escala es decisivo.

**NICOLÁS — Comportamiento (robustez y convergencia):**
> Corrimos el GA con **cinco semillas distintas**: 7, 13, 42, 100 y 999. Media $50 443, desviación estándar $230.6, **coeficiente de variación 0.46%**. La mejor semilla — seed 7 — quedó a solo **0.53% del ILP**; la peor — seed 13 — a 1.61%. Cinco de cinco corridas dentro del 2% del óptimo. El método es **estable y no críticamente dependiente de la semilla**.

> Adicionalmente, la curva de convergencia muestra que el GA hace ~70% del trabajo en las primeras 50 generaciones. La parada anticipada por estancamiento se activa en la generación 95 — el algoritmo no desperdicia las 400 generaciones restantes del presupuesto máximo.

→ *Pasar tabla resumen en pantalla. NICOLÁS apunta a la columna "Comportamiento".*

| Método | Costo | \|S\| | Tiempo | Gap | Garantía |
|---|---|---|---|---|---|
| **PLE · ILP (B&B)** | $49 988 | 22 | 600.96 s | ref (0.386% residual) | IntegerFeasible |
| **Algoritmo Genético** | $50 795 | 23 | **7.23 s** | +1.61% | sin certificación formal |

---

# BLOQUE 6 · Conclusiones y cierre
**5:30 — 6:00 · 30 segundos** · Slide: 3 lecciones

**JULIAN:**
> Tres lecciones:

> **Una** — El método exacto se justifica cuando se requiere cercanía al óptimo certificada y el tiempo lo permite. Pero en esta instancia, **ni siquiera 10 minutos fueron suficientes** para cerrar el gap residual de 0.386%.

> **Dos** — El GA con el esquema de Beasley & Chu, reforzado con **inicialización híbrida greedy** y **parada anticipada por estancamiento** — nuestras dos contribuciones al esquema clásico — entregó una solución a **1.61% del ILP en 7.23 segundos**. Speedup de 83×.

> **Tres** — Para problemas grandes o con restricciones de tiempo estrictas, el **GA es la única alternativa práctica**. Para esta instancia ya es competitivo; para 5 000 × 5 000 sería el único enfoque viable.

**JULIAN:**
> Como **trabajo futuro** proponemos integrar **búsqueda local 2-opt** post-GA, la representación indirecta de **Aickelin (2002)**, y comparar con solvers comerciales como **Gurobi** o **CPLEX** que potencialmente certificarían optimalidad en menor tiempo.

**NICOLÁS:**
> Eso es todo. Gracias por su atención. Quedamos atentos a sus preguntas.

→ *Postura abierta. Esperar las preguntas sin retroceder a la pantalla.*

---

# Referencias bibliográficas **(rúbrica criterio 5 — 2.5 pts · NO incluir = penalización −2.0)**

Las decimos en voz alta DENTRO de los bloques. Aquí el resumen para la sustentación y el documento Overleaf:

1. **Karp, R. M.** (1972). *Reducibility among combinatorial problems.* En R. E. Miller & J. W. Thatcher (Eds.), Complexity of Computer Computations (pp. 85–103). Plenum Press. → **Bloque 1, demostración NP-completitud.**

2. **Land, A. H., & Doig, A. G.** (1960). *An automatic method of solving discrete programming problems.* Econometrica, 28(3), 497–520. → **Bloque 3, fundamento Branch-and-Bound.**

3. **Chvátal, V.** (1979). *A greedy heuristic for the set-covering problem.* Mathematics of Operations Research, 4(3), 233–235. → **Bloque 4, inicialización híbrida del GA.**

4. **Beasley, J. E., & Chu, P. C.** (1996). *A genetic algorithm for the set covering problem.* European Journal of Operational Research, 94(2), 392–404. → **Bloque 4, esquema canónico del GA.**

5. **Aickelin, U.** (2002). *An indirect genetic algorithm for set covering problems.* Journal of the Operational Research Society, 53(10), 1118–1126. → **Bloque 6, trabajo futuro.**

6. **MathWorks** (2024). *intlinprog: Mixed-integer linear programming (MILP).* MATLAB Optimization Toolbox documentation. → **Bloque 3, herramienta del método exacto.**

> En el documento Overleaf cada cifra crítica y cada decisión metodológica debe tener su cita correspondiente. **Falta de referencias = −2.0 puntos directos** según la rúbrica.

---

# Apéndice A · Preguntas esperadas con respuestas defensivas

**P1. ¿Por qué el ILP no certificó optimalidad?**

> Porque el gap de integralidad es del 79.43%. La relajación LP fracciona variables en soluciones muy alejadas del espacio entero, lo que vuelve el árbol B&B muy profundo. En 10 minutos exploramos 22 632 nodos pero no logramos cerrar el gap completo. Lo que entrega `intlinprog` es estado **IntegerFeasible**: la mejor solución encontrada, no garantizada como óptima. Con un solver comercial como Gurobi o CPLEX, probablemente sí se certificaría en menos tiempo.

**P2. ¿Entonces el ILP NO encontró el óptimo?**

> Encontró una solución muy buena — **$49 988** — y sabe que si existe una mejor, no puede estar a más del **0.386%** de distancia. Es decir, el óptimo verdadero está entre $49 988 y aproximadamente $49 988 × 1.00386 ≈ $50 181. Técnicamente NO certificó. El GA queda en $50 795, fuera de ese rango por unos $614 — pero recuperable.

**P3. ¿Por qué incluyeron parada anticipada en el GA?**

> Al revisar la curva de convergencia observamos que el mejor individuo se estabilizaba alrededor de la generación 95, y las 400 generaciones restantes no aportaban mejora. Es desperdicio de cómputo. La parada anticipada por estancamiento de 80 generaciones consecutivas sin mejora es una **extensión natural al esquema clásico de Beasley & Chu**. Es una de nuestras dos contribuciones metodológicas.

**P4. ¿Por qué el operador de reparación es importante?**

> Sin reparación, el cruce y la mutación generan hijos **infactibles** — con clientes sin cubrir. El GA gastaría generaciones evaluando soluciones que no sirven. Con reparación, cada hijo es siempre factible y la búsqueda se concentra solo en mejorar el costo. Es por esto que la desviación estándar entre semillas queda en $230.6 — el operador normaliza las soluciones.

**P5. ¿Qué pasa si cambia la matriz de cobertura?**

> El ILP tendría que correr desde cero — 10 minutos más, sin garantía de certificar. El GA puede usar la población final actual como inicialización (warm start) y converger en segundos. Esto lo hace ideal para **planificación dinámica de redes**.

**P6. ¿Cuál es el rol del Greedy de Chvátal en el GA?**

> El greedy de Chvátal (1979) garantiza teóricamente una solución a lo sumo log(n) veces el óptimo — para nuestra instancia, eso es entregar una solución a lo sumo 6× peor que el óptimo, pero en milisegundos. Lo usamos como semilla del 5% de la población inicial. Esto le da al GA un punto de partida razonable y acelera la convergencia. Sin esa inyección, el GA tardaría más en converger.

**P7. ¿Cuánta memoria/CPU usó cada método?**

> `intlinprog` usó aproximadamente 800 MB de RAM y un core al 100% durante los 10 minutos completos. El GA usó menos de 200 MB de RAM, principalmente para la población de 150 × 500 booleanos, y un core al 100% durante 7.23 segundos. Ambos en MATLAB sin GPU.

**P8. ¿Por qué la desviación del GA es tan baja (σ = $230.6)?**

> Por dos razones: **uno**, el operador de reparación de Beasley & Chu normaliza las soluciones — cualquier individuo malo queda reparado a uno factible y razonable. **Dos**, la inicialización híbrida con greedy de Chvátal le da al algoritmo un punto de partida estable. Esto reduce la varianza entre corridas: con 5 semillas distintas obtenemos CV de 0.46%, muy por debajo del 1% que típicamente se considera estable.

**P9. ¿Qué referencias respaldan el trabajo?**

> Tres trabajos centrales: **Karp (1972)** para la NP-completitud del problema, **Beasley & Chu (1996)** para el esquema del GA, **Chvátal (1979)** para la heurística greedy de inicialización. Adicionalmente, **Land & Doig (1960)** para B&B y **Aickelin (2002)** para extensiones del esquema canónico que proponemos como trabajo futuro. El documento Overleaf incluye estas y otras referencias secundarias.

**P10. ¿Esto se puede aplicar a otros problemas?**

> Sí. El esquema GA con reparación es extensible a cualquier problema de cubrimiento (cobertura de servicio, asignación de turnos, ruteo de vehículos con restricciones de cobertura). El operador de reparación es problema-específico — para cada problema hay que definir cómo "reparar" un individuo infactible. Pero la estructura general — codificación binaria, torneo, reparación, parada anticipada — es reutilizable.

**P11. ¿Por qué eligieron MATLAB y no Python (PuLP, Gurobi)?**

> MATLAB `intlinprog` es el solver de referencia académico para problemas pedagógicos de PLE, y la materia lo usa como herramienta estándar. Para producción real consideraríamos Gurobi o CPLEX en Python, que son significativamente más rápidos. Eso forma parte del trabajo futuro.

---

# Apéndice B · Cheat-sheet de cifras (imprimir esta página)

```
INSTANCIA
  500 antenas × 500 clientes
  Matriz A densidad 9.99% — 24 971 unos de 250 000
  Costos: $2 000 – $3 998   μ = $3 034   σ = $593
  Encender todas: $1 516 821 (cota superior trivial)

PLE — ILP (intlinprog · MATLAB)
  Status: IntegerFeasible (NO Optimal)
  Costo: $49 988   |S| = 22   Tiempo: 600.96 s (10 min límite)
  LP relax: $27 860   Gap integralidad: 79.43%
  Gap residual: 0.386%   Nodos B&B: 22 632

GA (esquema Beasley & Chu 1996 + inicialización híbrida Chvátal 1979)
  Hiperparámetros: pop 150 · gens máx 500 · p_c 0.90 · p_m 3% → 0.5%
                   torneo k = 3 · elitismo 3 · estancamiento 80 gens
  Mejor seed (13): $50 795 · 23 antenas · 7.23 s · gap +1.61%
  Convergencia real: gen ≈ 95
  Speedup vs ILP: 83×

GA — Robustez 5 SEMILLAS [7, 13, 42, 100, 999]
  S1 seed 7   → $50 253   +0.53%   23 antenas   (mejor)
  S2 seed 13  → $50 795   +1.61%   23 antenas   (peor)
  S3 seed 42  → $50 253   +0.53%   23 antenas   (empata S1)
  S4 seed 100 → $50 366   +0.76%   23 antenas
  S5 seed 999 → $50 546   +1.12%   23 antenas
  μ = $50 443   σ = $230.6   CV = 0.46%
  Gap medio: 0.91%   Mejor: +0.53%   Peor: +1.61%

REFERENCIAS CLAVE (decirlas en voz alta)
  Karp (1972)        — NP-completitud
  Land & Doig (1960) — Branch-and-Bound
  Chvátal (1979)     — Greedy heuristic
  Beasley & Chu (1996) — GA canónico para SCP
  Aickelin (2002)    — GA indirecto (trabajo futuro)
```

---

# Apéndice C · Plan de tiempos por contingencia

### Si tenemos solo 5 minutos
- Bloque 4: omitir ②Población inicial híbrida y ⑤Elitismo. Mantener Codificación, Selección/Cruce/Mutación, Reparación, Parada anticipada.
- Bloque 6 reducido a 20 s — solo las 3 lecciones, sin trabajo futuro.
- Total estimado: 5:00.

### Si tenemos 7-8 minutos
- Bloque 3: ampliar — "De los 22 632 nodos explorados, miles fueron podados gracias a la cota LP. Aun así no se cerró el gap completamente."
- Bloque 5: profundizar la robustez — "Seed 7 dio $50 253 = 0.53% gap, casi alcanzando al ILP."
- Bloque 6: agregar trabajo futuro completo (búsqueda local 2-opt, Aickelin, Gurobi).

### Si nos cortan en medio (timeout)
- Saltar directo a Slide 7 (Comparación) y leer la tabla.
- Decir: *"El ILP llega a $49 988 en 10 min sin certificar. El GA llega a $50 795 en 7.23 s. Speedup 83×, gap 1.61%. Conclusión: complementariedad."*
- Total: 25 segundos.

---

# Apéndice D · Honestidad metodológica — qué SÍ y qué NO decir

### Frases CORRECTAS

- *"El ILP entregó la mejor solución entera encontrada en 10 minutos."*
- *"El estado del solver fue IntegerFeasible — no certificó optimalidad."*
- *"El gap residual del ILP al agotarse el tiempo fue de 0.386%."*
- *"El GA es 83 veces más rápido que el método exacto."*
- *"El gap del GA respecto a la mejor solución del ILP es 1.61%."*
- *"El óptimo verdadero está entre $49 988 y aproximadamente $50 181."*

### Frases PROHIBIDAS

- ❌ *"Encontramos el óptimo de $49 988."* → Decir: "la mejor solución entera encontrada".
- ❌ *"El GA llega al 99.16% del óptimo."* → Decir: "a 1.61% de la mejor solución del ILP".
- ❌ *"El ILP terminó en 10 minutos."* → Decir: "alcanzó el límite de tiempo de 10 minutos".
- ❌ Confundir gap residual (0.386%) con gap GA vs ILP (1.61%).
- ❌ Decir "óptimo del problema" en cualquier contexto del ILP.

### Si nos preguntan: "¿entonces no saben cuál es el óptimo verdadero?"

Respuesta canónica:
> El óptimo verdadero está entre $49 988 (lo que encontró el ILP) y $49 988 × (1 + 0.386%) ≈ $50 181. Es decir, sabemos con **certeza matemática** que el óptimo está en ese rango. El GA quedó en $50 795, fuera de ese rango por unos $614. Con un solver comercial como Gurobi podríamos certificar el óptimo exacto en menor tiempo, y ese es uno de nuestros trabajos futuros.

---

# Apéndice E · Distribución individual de la sustentación (la rúbrica evalúa dominio individual)

| Bloque | Hablante primario | Hablante secundario (intervención corta) | Pts rúbrica asociados |
|---|---|---|---|
| 0 · Apertura | Nicolás | Julian (cierre conector) | — |
| 1 · El problema | Nicolás | Julian (NP-completitud) | — |
| 2 · Modelo | **Julian** | Nicolás (intervención de cierre) | **Criterio 1 · 2.0** |
| 3 · ILP B&B | Julian | **Nicolás (resultado final)** | **Criterio 2 · 2.0** |
| 4 · GA | **Nicolás** | Julian (resultado final) | **Criterio 3 · 2.0** |
| 5 · Comparación | **Nicolás** | Julian (intervención robustez) | **Criterio 4 · 1.5** |
| 6 · Cierre | Julian | Nicolás (cierre final) | — |

> El **criterio 5 (Documento Overleaf · 2.5 pts)** no se sustenta en la presentación oral pero debe estar entregado y referenciado correctamente en el paper PDF.

**Total puntaje objetivo: 10.0** · Sin penalizaciones automáticas, sustentando dominio individual y citando todas las referencias en voz alta.

---

*Documento v2 · alineado con CONTEXT.md, results.json y rúbrica oficial. Última actualización: 18 may 2026.*
