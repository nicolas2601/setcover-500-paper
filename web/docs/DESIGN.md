# DESIGN — Set Cover 500×500

> Contrato visual y de motion. Si construís código para `/web` y una decisión rompe este doc, este doc gana.
> Las 18 leyes del `wow-playbook` aplican por encima de cualquier intuición.

---

## 1. Atmósfera

**Archetype**: `editorial-premium` + `dashboards` (híbrido magazine-grade con disciplina de números).
**Dials**: `DV = 8` · `MI = 9` · `VD = 4`.

### Justificación
- **DV 8 (alto)** porque jurado UNAB + portfolio Nicolás necesitan que el sitio se sienta intencional, no template. Layout asimétrico, grid 12-col que se rompe, hero offset.
- **MI 9 (muy alto)** porque el storytelling de 3 ideas (CONTEXT §4) requiere scrollytelling pinned + scrubbed: matriz binaria que se forma, árbol B&B que crece, GA que evoluciona, convergencia que aplana.
- **VD 4 (gallery)** porque cada cifra canónica merece aire. `py-32` mínimo entre scenes, `gap-y-20` entre cifras grandes. Las páginas que respiran se sienten caras.

### Sensación target
Magazine científico premium (Monocle / NYT Mag / Bloomberg Cityscape) cruzado con dashboard de cuant fund. Serif display que reposa al ojo + numerales mono tabulares + un solo acento azul cofounder que aparece para marcar el GA. Grain sutil, hairlines obsesivas, micro-elevations.

---

## 2. Paleta (ya cargada en `src/app/globals.css` vía `@theme`)

Estrategia: **Committed monochrome + 1 accent** (≤ 7 colores OKLCH-tinted, sin pure black/white).

| Token | Rol | Notas |
|---|---|---|
| `--ink` | Texto principal, off-black `#0A0908`-equiv | Tintado warm hacia el cream, nunca `#000` |
| `--ink-soft` | Texto secundario | ~70% peso de `--ink` |
| `--ink-faint` | Captions, meta, eyebrows | ~45% peso |
| `--cream` | Background canvas | Off-white `#FDFBF7`-equiv, warm |
| `--paper` | Cards, surface elevation 1 | Un tick por encima del cream |
| `--surface` | Elevación 2 (sticky, modales si aplica) | |
| `--hairline` | Borders, dividers, ring-1 | `rgba(ink, 0.08)` aprox |
| `--accent` | Azul cofounder OKLCH (≈ `#0081c0`) | **Solo para marcar GA** y CTAs primarios |
| `--accent-soft` | Acento muted | Para fills de chart GA con transparencia |
| `--warning` | Amarillo editorial muted | Para anotar `IntegerFeasible` / `+1.61 %` |
| `--success` | Verde muted | Para `83×` speedup como hallazgo |

### Reglas de uso
- **PLE = ink/charcoal**. Sobrio, peso, institucional.
- **GA = accent azul**. Hallazgo, velocidad, acción.
- **Cream** es el canvas. Casi todo respira sobre él.
- **Nunca** `#000` puro, **nunca** `#fff` puro, **nunca** Tailwind `gray-*` genérico.

---

## 3. Tipografía (ya wired en `src/app/layout.tsx` vía `next/font`)

| Familia | Rol | Variable CSS |
|---|---|---|
| **Fraunces** | Display, serif editorial con `opsz` variable | `--font-display` |
| **Geist Sans** | Body, UI, captions | `--font-body` |
| **Geist Mono** | Numerales tabulares, código, `tnum` | `--font-mono` |

### Scale (ratio ≥ 1.25)

```
Hero h1     →  font-display  clamp(64px, 9vw, 144px)   leading-[0.92]  tracking-[-0.02em]
Section h2  →  font-display  clamp(48px, 6vw, 96px)    leading-[0.95]  tracking-[-0.015em]
h3          →  font-display  clamp(32px, 3.5vw, 56px)  leading-[1.05]
h4          →  font-body     clamp(20px, 1.8vw, 28px)  leading-[1.2]   font-medium
Body lead   →  font-body     clamp(18px, 1.4vw, 22px)  leading-[1.55]
Body        →  font-body     1.125rem (18px)           leading-[1.5]   max-w-[68ch]
Meta        →  font-body     0.875rem (14px)           leading-[1.4]   text-ink-soft
Eyebrow     →  font-body     0.6875rem (11px)          uppercase tracking-[0.22em] font-medium
Numeral XL  →  font-mono     clamp(56px, 7vw, 112px)   tabular-nums   tracking-[-0.03em]
Numeral L   →  font-mono     clamp(32px, 3.5vw, 56px)  tabular-nums
Caption num →  font-mono     0.75rem (12px)            tabular-nums   text-ink-faint
```

### Numerales (regla crítica)
**Cualquier número que sea dato del proyecto** (`$49,988`, `22`, `600.96 s`, `+1.61 %`, `83×`, `0.386 %`, `$50,443`, `σ $230.6`, `CV 0.46 %`) renderiza con `.tnum` que aplica:
```css
font-family: var(--font-mono);
font-feature-settings: 'tnum' 1, 'lnum' 1, 'zero' 1;
font-variant-numeric: tabular-nums lining-nums;
```

### Italics
Fraunces tiene italic real (no oblique). Úsalo para énfasis editorial puntual: `<em>NP-difícil</em>`, `<em>IntegerFeasible</em>`. Nunca italic chorreado.

---

## 4. Spacing & Rhythm

```
Container max-width    →  1320px  (no 1200, deja respirar)
Gutter horizontal      →  clamp(24px, 4vw, 80px)
Section vertical pad   →  clamp(96px, 14vh, 200px)   ≈ py-32 / lg:py-44
Inter-block (dentro de scene)  →  clamp(48px, 8vh, 96px)
Card internal padding  →  clamp(24px, 3vw, 48px)
Stack rhythm body      →  space-y-6 (1.5rem)
Eyebrow → h2 gap       →  mb-6 (24px)
H2 → body lead gap     →  mb-12 (48px)
```

**Grid base**: `grid-cols-12 gap-x-6 md:gap-x-8` para todas las scenes. Las columnas se rompen explícitamente (`col-span-7`, `col-span-5`, `col-start-3`) — no `grid-cols-3` simétrico.

---

## 5. Motion philosophy (spine ya construida en `src/components/motion/`)

### Stack
- **Lenis 1.3** (`LenisProvider`) — smooth scroll global, lerp 0.1, syncTouch off.
- **GSAP 3.13 + @gsap/react + ScrollTrigger** — timelines pin+scrub para las 4 scenes largas.
- **split-type 0.3** — chars stagger en todos los headlines.
- **Framer Motion 12** — micro-interactions (hover, focus, layout cambios).

### Easings (ya en globals.css, banned: linear/ease/ease-in-out)
```
--ease-apple  →  cubic-bezier(0.32, 0.72, 0, 1)    default UI
--ease-expo   →  cubic-bezier(0.16, 1, 0.3, 1)     text reveals, magnetic
--ease-quart  →  cubic-bezier(0.22, 1, 0.36, 1)    micro hovers
--ease-back   →  cubic-bezier(0.34, 1.56, 0.64, 1) puntual, casi nunca
```

### Patterns canónicos (componer, no reinventar)

| Pattern | Cuándo | Componente |
|---|---|---|
| Text reveal chars stagger | Todo h1 y h2 al entrar viewport | `<SplitReveal>` (stagger 0.018s, yPercent 110→0, blur 8→0, duration 1.2, ease expo) |
| Magnetic CTA | Botones primarios | `<MagneticButton>` (GSAP quickTo, factor 0.3, ease expo, leave→0) |
| Cursor parallax hero | Solo `pointer:fine`, scene 1 | Mouse parallax 3 capas (back -10/-6, mid -20/-12, front +30/+18) |
| Cursor blob global | Todo el sitio salvo touch | `<CursorBlob>` mix-blend-difference 32px, GSAP quickTo lerp |
| Noise grain overlay | Fixed, 4% opacity, mix-blend-overlay | `<NoiseOverlay>` SVG fractalNoise |
| Scroll reveal cards | Cards entrando viewport | `<ScrubReveal>` opacity 0→1, y 24→0, ease expo, once |
| Pin + scrub scrollytelling | 4 scenes largas (matriz, B&B, GA, convergencia) | ScrollTrigger pin + scrub 1, end +=200% |
| Marquee velocity-aware | Footer / autores | `xPercent -50` infinito + timeScale 1+abs(velocity/-500) |
| Numeral count-up | Cifras grandes al entrar | GSAP `to` con `snap.value: 1`, ease expo, duration 1.6 |

### Pin+scrub scenes (las 4 narrativas largas)

1. **Scene 02 Matriz binaria**: pin section, scrub forma la matriz 500×500 con `clip-path` que revela cuadrantes; números laterales (n=500, m=500, densidad 9.99%) cuentan; final reveal: highlight de las 22 columnas seleccionadas.
2. **Scene 04 Árbol B&B**: pin, scrub anima el árbol creciendo desde root, líneas dibujándose con `stroke-dashoffset`, nodos podados se desvanecen a `opacity 0.15`; counter de nodos sube 0 → 22,632; final: highlight de la mejor hoja `$49,988`.
3. **Scene 05 GA flujo**: pin, scrub avanza por los pasos (población → selección → cruce → mutación → elitismo); flechas se dibujan; al final `7.23 s` aparece con count-up.
4. **Scene 06 Convergencia**: pin, scrub dibuja el path de la curva costo vs generación; el área bajo la curva se rellena con `accent-soft`; punto destacado en gen 95 (convergencia mejor seed); 5 seeds aparecen como dot-plot lateral.

### Reduced motion
`prefers-reduced-motion: reduce` desactiva: cursor blob, parallax, magnetic, scrub. Mantiene: opacity transitions (≤ 200ms), focus rings, hover de color. El sitio es totalmente legible y narrativo sin un solo movimiento.

---

## 6. Component architecture

### Doppelrand cards (nested concentric)
```
<div className="rounded-[28px] p-1.5 ring-1 ring-hairline bg-ink/[0.03]">
  <div className="rounded-[22px] p-8 bg-paper shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]">
    {/* content */}
  </div>
</div>
```
Outer ring + inner solid, radios concéntricos (28 − 6 padding = 22). Aplica a: cards de cifras grandes, callout boxes, KPI tiles.

### Button-in-Button (CTA primario)
```
<button class="group rounded-full pl-6 pr-2 py-2 bg-ink text-cream flex items-center gap-3">
  <span class="text-[15px]">Ver paper IEEE</span>
  <span class="w-9 h-9 rounded-full bg-cream/10 grid place-items-center transition-transform duration-[400ms] ease-[var(--ease-apple)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
    ↗
  </span>
</button>
```
Trailing icon en pill nested. Magnetic wrapper.

### Eyebrow tag
```
<span class="text-[11px] uppercase tracking-[0.22em] font-medium text-ink-faint">
  Escena 04 · Método exacto
</span>
```
Nunca `LABEL // YEAR` formatting. Siempre `Escena XX · Descriptor`.

### KPI tile (cifras canónicas)
```
+---------------------------------------+
| EYEBROW · MÉTODO EXACTO              |  ← 11px tracking 0.22em
|                                       |
| $49,988                               |  ← Numeral XL mono tnum
| 22 antenas seleccionadas              |  ← Body 18px
|                                       |
| ─────────────                         |  ← hairline divider
| Status     IntegerFeasible            |  ← row meta-key right
| Tiempo     600.96 s                   |
| Gap        0.386 % residual           |
+---------------------------------------+
```
Inside Doppelrand. Key-value rows usan grid-cols-[1fr_auto] con dotted leader opcional.

### Tabular numerals everywhere
Clase utility `.tnum` global. Cualquier `<span>`, `<td>`, `<div>` con número del proyecto la lleva.

---

## 7. The 10 scenes (ASCII grid map)

Container width = 1320px max. Grid = 12 cols. Hairlines separan scenes con `border-t border-hairline` opcional.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 01 — HERO                                              min-h-100dvh
│  cols 12, asymmetric editorial split (left text 7 / right anchor 5)
│  ┌─ col-span-7 ────────────────────┐ ┌─ col-span-5 ──────────────┐
│  │ eyebrow: UNAB 2026 · Inv. Op.   │ │ floating tag offset right  │
│  │                                  │ │ Nicolás Moreno             │
│  │ Set Cover                       │ │ Julian Arteaga             │
│  │  500 × 500                       │ │                            │
│  │     [italic] honesto.            │ │ ↓ mouse parallax 3 layers │
│  │                                  │ │   (back / mid / front)    │
│  │ subtítulo body lead 22px        │ │                            │
│  │ ~80ch dos líneas                 │ │ CTA: Ver paper ↗          │
│  └──────────────────────────────────┘ └────────────────────────────┘
│  cursor blob + grain overlay + Fraunces clamp(64,9vw,144)
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 02 — EL PROBLEMA (pin + scrub)                          h-300vh
│  Sticky canvas: matriz 500×500 SVG izquierda 7 cols, copy derecha 5 cols
│  ┌─ col-span-7 sticky ─────────────┐ ┌─ col-span-5 prose ─────────┐
│  │  ◼◼ ◼  ◼◼◼   ◼  ◼ ◼◼◼  ◼ ◼ ◼   │ │ "9.99 % de densidad"      │
│  │ ◼ ◼◼ ◼ ◼  ◼◼◼ ◼ ◼◼ ◼◼◼ ◼   ◼   │ │ "24,971 unos / 250,000"   │
│  │   ◼  ◼ ◼ ◼ ◼   ◼ ◼ ◼  ◼ ◼ ◼◼◼  │ │                            │
│  │ ◼◼◼ ◼ ◼ ◼◼ ◼  ◼ ◼◼ ◼ ◼◼  ◼ ◼   │ │ "2^500 ≈ 3.27 × 10^150"   │
│  │  (heatmap revealing on scrub)   │ │  → Karp 1972, NP-completo │
│  └──────────────────────────────────┘ └────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 03 — EL MODELO PLE                                      py-44
│  cols 12 — editorial wide. KaTeX block centrado col-start-3 col-span-8
│                                                                          
│   eyebrow: Capítulo 03 · Formulación                                    
│   h2: "Programación Lineal Entera."                                     
│                                                                          
│         min Σ c_j x_j                          ← KaTeX                   
│         s.a. Σ A_ij x_j ≥ 1   ∀ i                                       
│              x_j ∈ {0, 1}                                                
│                                                                          
│   margin note right (col-span-3 offset): "LP relax = $27,859.93         
│   gap integralidad 79.43 %"                                              
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 04 — MÉTODO EXACTO (pin + scrub)                        h-300vh
│  sticky: árbol B&B SVG col-span-8, KPI tile Doppelrand col-span-4
│  ┌─ col-span-8 sticky tree ────────┐ ┌─ col-span-4 KPI tile ──────┐
│  │           ●                      │ │ EXACT PLE · B&B           │
│  │          ╱ ╲                     │ │ ─────────────────────────  │
│  │         ●   ●                    │ │  $49,988                  │
│  │        ╱ ╲ ╱ ╲                   │ │  22 antenas               │
│  │       ●  ✗●   ●  ← podados gray  │ │ ─────────────────────────  │
│  │      ╱ ╲   ╲                     │ │ Status  IntegerFeasible   │
│  │     ●   ●   ●                    │ │ Tiempo  600.96 s          │
│  │   counter: 22,632 nodos          │ │ Nodos   22,632            │
│  │   best leaf highlight cream      │ │ Gap     0.386 % residual  │
│  └──────────────────────────────────┘ └────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 05 — MÉTODO GA (pin + scrub)                            h-250vh
│  sticky: flujo horizontal del GA (5 pasos) col-span-12 hairlines
│  ┌──────────────────────────────────────────────────────────────────┐
│  │ POBLAC. → SELECC. → CRUCE → MUTAC. → ELITISMO ↻ ESTANCAMIENTO  │
│  │  150       tourn.    0.9     3%→0.5%   3        80 gens         │
│  │  (flechas se dibujan con stroke-dashoffset)                      │
│  └──────────────────────────────────────────────────────────────────┘
│  Debajo: 2 cols
│  ┌─ col-span-7 hyperparams table ──┐ ┌─ col-span-5 KPI tile accent┐
│  │ pop 150 · gens 500 · p_c 0.9    │ │ GA · seed 13              │
│  │ p_m 3%→0.5% adaptativa · elit 3 │ │ ─────────────────────────  │
│  │ conv ≈ gen 95 (mejor seed)     │ │  $50,795                  │
│  │ parada: stagnant 80 gens        │ │  23 antenas               │
│  │                                  │ │ ─────────────────────────  │
│  │                                  │ │ Tiempo  7.23 s            │
│  │                                  │ │ Gap     +1.61 %           │
│  │                                  │ │ Speedup 83×               │
│  └──────────────────────────────────┘ └────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 06 — CONVERGENCIA (pin + scrub)                         h-250vh
│  sticky chart full bleed col-span-12 alto 70vh
│  ┌──────────────────────────────────────────────────────────────────┐
│  │ Costo                                                            │
│  │ $80k │\                                                          │
│  │      │ \                                                          │
│  │ $60k │  \___                                                     │
│  │      │      \____                                                │
│  │ $50k │           \_______ ← punto gen 95 marcado                │
│  │      └────────────────────────────                              │
│  │       0    50   100  150  175  ← Generación                    │
│  │   path stroke accent · area fill accent-soft 0.12               │
│  └──────────────────────────────────────────────────────────────────┘
│  lateral dots (col-span-3 offset) = 5 seeds plot                      
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 07 — COMPARACIÓN (2 columnas, NO 3, NO 4)               py-44
│  cols 12 → tabla horizontal grande hairlines arriba/abajo
│  ┌─────────────────────────────┬──────────────────────────────────┐
│  │ PLE · ILP B&B               │ GA · accent                      │
│  │ ─────────────────────────── │ ─────────────────────────────── │
│  │ Costo      $49,988          │ Costo      $50,795              │
│  │ |S|        22               │ |S|        23                    │
│  │ Tiempo     600.96 s         │ Tiempo     7.23 s               │
│  │ Gap        0.386 % residual │ Gap        +1.61 % vs ILP       │
│  │ Garantía   IntegerFeasible  │ Garantía   sin garantía         │
│  └─────────────────────────────┴──────────────────────────────────┘
│  Debajo: bar chart costo BASELINE-ZOOMED desde $49,000 (NO desde 0)
│  para que el +1.61 % ($807 abs) se vea visualmente.                  
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 08 — ROBUSTEZ 5 SEMILLAS                                py-32
│  cols 12 split 5/7
│  ┌─ col-span-5 prose ──────────────┐ ┌─ col-span-7 dot plot ──────┐
│  │ "5 corridas con seeds distintos │ │  ILP $49,988 ─────────── ← │
│  │  para validar que el GA no es   │ │     ·       ←  $50,253 s1 │
│  │  un golpe de suerte."           │ │       ·     ←  $50,253 s3 │
│  │                                  │ │         ·   ←  $50,366 s4 │
│  │  μ = $50,443                    │ │           · ←  $50,546 s5 │
│  │  σ = $230.6                     │ │            ·←  $50,795 s2 │
│  │  CV = 0.46 %                    │ │  μ $50,443 hairline ───── │
│  │                                  │ │  σ band ±$230.6 accent-soft│
│  └──────────────────────────────────┘ └────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 09 — CONCLUSIONES                                       py-44
│  cols 12 → 2 cards Doppelrand asimétricas (no 3-col equal)
│  ┌─ col-span-7 ink card ─────────┐  ┌─ col-span-5 accent card ───┐
│  │ "PLE para fijar el techo de   │  │ "GA para producción a      │
│  │  calidad. IntegerFeasible no  │  │  escala. 7.23 s y CV       │
│  │  es óptimo certificado, pero  │  │  < 0.5 %. Decisión hoy."   │
│  │  el residual 0.386 % acota."  │  │                             │
│  └────────────────────────────────┘  └────────────────────────────┘
│  Cierre full-width: "Speedup ≈ 83× · No compiten, se complementan."  
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 10 — FOOTER                                             py-24
│  marquee velocity-aware Fraunces: "NICOLÁS MORENO · JULIAN ARTEAGA ·   
│  UNAB 2026 · INV. OPERACIONES · SET COVER 500×500 · ..."             
│  cols 12 → meta row con: repo, paper PDF link, fecha, créditos        
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Charts (custom SVG, NO librerías pesadas)

### Reglas
- Construidos en SVG manual con paths. Sin Recharts, sin Chart.js, sin Plotly.
- Hairlines de eje en `--hairline`. Ticks mínimos, labels en `font-mono` 12px.
- **Baseline zoom obligatorio** en el chart de costo PLE vs GA. Mínimo $49,000, no 0.
- Línea del GA en `--accent`. Línea/área del PLE en `--ink`. Areas con `accent-soft` 0.12 opacity.
- Anotaciones de cifras en mono tnum, colocadas con offset claro al punto.
- No leyendas flotantes; las series se etiquetan inline en la curva.

---

## 9. Hard banned list (absolutos, copia del playbook + específicos del proyecto)

### Tipografía
- ❌ Inter, Roboto, Arial, Open Sans, Helvetica, `system-ui` como display
- ❌ Cualquier sans no-Geist para body
- ❌ Numerales no-monoespaciados en cifras de dato

### Color
- ❌ Pure `#000` / pure `#fff`
- ❌ Tailwind `gray-*`, `slate-*`, `zinc-*` genéricos
- ❌ Cualquier gradient text con `bg-clip-text`
- ❌ Glassmorphism como surface default

### Sombras y bordes
- ❌ `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
- ❌ `rgba(0,0,0,*)` directo. Usar `var(--hairline)` o ink-tinted
- ❌ Side-stripe `border-left-4` accents
- ❌ Bordes `border-*` genéricos. Solo `ring-1 ring-hairline`

### Motion
- ❌ `ease-in-out`, `linear`, `ease`, `ease-in`, `ease-out`
- ❌ Animar `width`, `height`, `top`, `left`, `margin`, `padding`
- ❌ `setTimeout` para animation timing
- ❌ `window.addEventListener('scroll')` raw (usar Lenis + ScrollTrigger)
- ❌ "Scroll to explore" + chevron rebotando

### Layout
- ❌ `grid-cols-3` simétrico con 3 cards iguales
- ❌ Hero centrado con número gigante + label chico (hero-metric template)
- ❌ Hero metric template (big stat + 3 supporting)
- ❌ Diagonales de vacío entre texto y gráfica
- ❌ Charts diminutos en cards gigantes con espacio muerto
- ❌ `h-screen` (usar `min-h-[100dvh]`)
- ❌ `backdrop-blur` en scrolling containers

### Copy / información
- ❌ Em-dashes `—` y dobles guiones `--`
- ❌ AI clichés: "Elevate", "Unleash", "Seamless", "Next-Gen"
- ❌ Fake stats inventados. **SOLO** las cifras del CONTEXT.md §3
- ❌ Llamar al PLE "óptimo" o "certificado". Es `IntegerFeasible`
- ❌ Llamar al GA "óptimo" o "perfecto". Tiene gap +1.61 %
- ❌ Tabla comparativa con LP relajada o Greedy. Solo PLE-ILP y GA
- ❌ Baseline = 0 en chart de costos. Mínimo $49,000

---

## 10. Stack confirmation (ya instalado en `web/package.json`)

```
next            ^15
react           ^19
typescript      ^5
tailwindcss     ^4    (con @theme tokens en globals.css)
lenis           ^1.3
gsap            ^3.13
@gsap/react     ^2
split-type      ^0.3
framer-motion   ^12
katex           ^0.16   (formulas scene 03)
clsx + tailwind-merge
```

No R3F / Three (el storytelling es 2D scrollytelling + charts SVG, MI alto pero sin 3D necesario).

---

## 11. Pre-delivery audit (compactado del playbook §9)

Antes de decir "scene N lista":
- [ ] Tokens y fonts respetados, 0 inline styles
- [ ] `.tnum` aplicada a cada cifra canónica
- [ ] `<SplitReveal>` en el h2 de la scene
- [ ] Easing custom (apple/expo/quart), nunca ease-in-out
- [ ] Doppelrand en cards de cifras
- [ ] Eyebrow tag presente arriba del h2
- [ ] `prefers-reduced-motion` respetado
- [ ] Sin emoji, sin em-dashes, sin marketing
- [ ] Cifras = exactas a CONTEXT.md §3 (auditables contra `src/data/setcover.ts`)
- [ ] El PLE se llama `IntegerFeasible`, no "óptimo"
- [ ] El GA se llama "aproximado / +1.61 %", no "óptimo"
- [ ] No `grid-cols-3` simétrico
- [ ] No hero-metric template

Si cualquier check falla → fix antes de seguir.

---

## 12. Una línea de filosofía

> Editorial premium de magazine académico con disciplina obsesiva de números: Fraunces respira, Geist Mono certifica, accent azul marca el hallazgo, y la honestidad metodológica es lo que separa esto de un template.
