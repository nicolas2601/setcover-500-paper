# Set Cover 500×500 — Sitio de presentación

Sitio web del paper de Investigación de Operaciones (UNAB 2026) que compara Branch & Bound (PLE) vs Algoritmo Genético sobre el Set Cover Problem.

## Stack

- **Next.js 15** App Router + Turbopack
- **React 19** Server Components
- **TypeScript 5** estricto
- **Tailwind v4** con `@theme` tokens en `globals.css`
- **Lenis 1.3** smooth scroll
- **GSAP 3.13** + `@gsap/react` + ScrollTrigger
- **split-type** para text reveals char-by-char
- **Framer Motion 12** para micro-interacciones
- **KaTeX** para fórmulas matemáticas

## Arrancar en local

```bash
cd web
npm install        # o bun install / pnpm install
npm run dev        # corre en http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Estructura

```
web/
├── docs/
│   ├── PRODUCT.md       # contrato editorial (audiencia, tono, anti-references)
│   └── DESIGN.md        # contrato visual (paleta, motion philosophy, scene map)
├── src/
│   ├── app/
│   │   ├── layout.tsx   # Fraunces + Geist + Lenis + NoiseOverlay + CursorBlob
│   │   ├── page.tsx     # Orquestador de las 10 escenas
│   │   └── globals.css  # Tailwind v4 @theme tokens OKLCH
│   ├── components/
│   │   ├── motion/      # Spine: LenisProvider, MagneticButton, SplitReveal,
│   │   │                #         ScrubReveal, NoiseOverlay, CursorBlob
│   │   └── scenes/      # 10 escenas (Hero, Problem, Modelo, ExactMethod, GA,
│   │                    #              Convergencia, Comparison, Robustness,
│   │                    #              Conclusions, SiteFooter)
│   ├── data/
│   │   └── setcover.ts  # Cifras canónicas del paper
│   └── lib/
│       ├── tokens.ts    # OKLCH palette + font vars
│       ├── motion.ts    # ease / stagger / duration tokens
│       └── utils.ts     # cn() + formatMoney / formatNumber
```

## Cifras canónicas

| Métrica | PLE-ILP (B&B) | Algoritmo Genético |
|---|---|---|
| Costo | $49,988 | $50,795 |
| Antenas | 22 | 23 |
| Tiempo | 600.96 s | 7.23 s |
| Gap | ref (0.386% residual) | +1.61% |
| Garantía | IntegerFeasible | sin garantía |
| Speedup | — | 83× |

5 semillas GA: $50,253 · $50,795 · $50,253 · $50,366 · $50,546 (μ=$50,443 · σ=$230.6 · CV=0.46%)

## Autores

**Nicolás Moreno** y **Julian Arteaga** · UNAB · Investigación de Operaciones · 2026
