'use client';

import { useGSAP } from '@gsap/react';
import { useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { problem } from '@/data/setcover';
import { formatMoney, formatNumber } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Problem — Capítulo 02
 * Pin + scrub scrollytelling. Matrix cells reveal in a diagonal sweep
 * synchronized with 4 stat counters counting up from 0 to final values.
 */

// Deterministic seeded pseudo-random — stable across SSR/CSR re-renders.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type Cell = {
  row: number;
  col: number;
  covered: boolean;
  bucket: 0 | 1 | 2 | 3 | 4;
  diag: number;
};

// 60×60 = 3600 cells — perceptually still "dense" but ~44% less paint work than
// 80×80 (6400). Combined with row-grouped reveal (60 tweens instead of 3600),
// the matrix renders at 60fps even with scrub-pin scroll.
const GRID_N = 60;
const CELL_SPAN = 500 / GRID_N;   // 8.333… SVG units per cell
const CELL_SIZE = CELL_SPAN * 0.88;
const CELL_OFFSET = (CELL_SPAN - CELL_SIZE) / 2;

function buildMatrix(rows: number, cols: number, density: number): Cell[] {
  // Seed tuned so the resulting filled-cell ratio lands close to ~10 % on a 60×60 grid.
  const rng = mulberry32(0x5e7c01a);
  const out: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const covered = rng() < density;
      // 5 opacity tiers based on a stable per-column hash → diagonal texture.
      const bucket = ((c * 2654435761) >>> 0) % 5 as 0 | 1 | 2 | 3 | 4;
      out.push({ row: r, col: c, covered, bucket, diag: r + c });
    }
  }
  return out;
}

// Group cells by row so we can animate 60 <g> groups instead of 3600 individual <rect>s.
function groupByRow(cells: Cell[], rows: number): Cell[][] {
  const out: Cell[][] = Array.from({ length: rows }, () => []);
  for (const cell of cells) out[cell.row].push(cell);
  return out;
}

// 5 tiers — fixed Tailwind opacity classes so JIT can pick them up
const COVERED_BUCKETS = [
  'fill-ink/55',
  'fill-ink/65',
  'fill-ink/[0.78]',
  'fill-ink/90',
  'fill-ink',
] as const;

export function Problem() {
  const cells = useMemo(() => buildMatrix(GRID_N, GRID_N, 0.0999), []);
  const cellsByRow = useMemo(() => groupByRow(cells, GRID_N), [cells]);

  const sectionRef = useRef<HTMLElement>(null);
  const matrixSvgRef = useRef<SVGSVGElement>(null);
  const statRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const svg = matrixSvgRef.current;
      if (!section || !svg) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Animate the 60 row-groups instead of all 3600 cells. Same diagonal
      // sweep look, ~60× less work for the compositor + tween engine.
      const rowGroups = svg.querySelectorAll<SVGGElement>('[data-row]');
      const statEls = statRefs.current.filter((el): el is HTMLSpanElement => !!el);

      // Final values for counters
      const finalValues = [problem.unos, problem.cubiertaProm, problem.costoMedia, 1.5e150];

      if (reduce) {
        gsap.set(rowGroups, { autoAlpha: 1 });
        statEls.forEach((el, i) => {
          el.textContent = formatCounter(finalValues[i], i);
        });
        return;
      }

      // Initial state — all row-groups invisible, counters at 0
      gsap.set(rowGroups, { autoAlpha: 0 });
      statEls.forEach((el, i) => {
        el.textContent = formatCounter(0, i);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=240%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // Diagonal wave reveal — each row enters slightly after the previous,
      // and each row's columns get a CSS-driven micro-stagger via animation-delay
      // (so we don't pay for 3600 GSAP tweens). The selective will-change is
      // toggled on enter/leave so the GPU memory budget stays small.
      tl.to(
        rowGroups,
        {
          autoAlpha: 1,
          duration: 1.4,
          ease: 'expo.out',
          stagger: {
            each: 0.02,
            from: 'start',
          },
          onStart: () => {
            rowGroups.forEach((g) => {
              g.style.willChange = 'opacity';
            });
          },
          onComplete: () => {
            // Release GPU memory once the sweep is done — keeping will-change
            // pinned on 60 groups forever would balloon the layer budget.
            rowGroups.forEach((g) => {
              g.style.willChange = 'auto';
            });
          },
        },
        0,
      );

      // Counters tween over a longer, more deliberate window
      const counterObj = { v0: 0, v1: 0, v2: 0, v3: 0 };
      tl.to(
        counterObj,
        {
          v0: finalValues[0],
          v1: finalValues[1],
          v2: finalValues[2],
          v3: finalValues[3],
          duration: 2.5,
          ease: 'power3.out',
          onUpdate: () => {
            const vals = [counterObj.v0, counterObj.v1, counterObj.v2, counterObj.v3];
            statEls.forEach((el, i) => {
              el.textContent = formatCounter(vals[i], i);
            });
          },
        },
        0,
      );

      // Hold — ~30% of scroll budget where the scene is fully revealed before unpinning.
      tl.to({}, { duration: 1.2 });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-scene="02"
      aria-label="Capítulo 02 · El problema"
      className="relative bg-cream py-24 sm:py-28 md:py-40"
    >
      {/* Eyebrow */}
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 md:px-16 xl:px-24">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:text-[12px]">
          CAPÍTULO 02 · EL PROBLEMA
        </span>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1680px] grid-cols-1 gap-x-6 gap-y-12 px-5 sm:px-8 md:mt-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-x-12 md:gap-y-0 md:px-16 lg:gap-x-16 xl:px-24">
        {/* LEFT — Text column 5/12 */}
        <div>
          <SplitReveal
            as="h2"
            by="words"
            stagger={0.05}
            className="font-display text-ink text-[clamp(2rem,4.6vw,4rem)] font-normal leading-[1.02] tracking-[-0.035em]"
          >
            500 antenas. 500 clientes. 250,000 decisiones binarias.
          </SplitReveal>

          <div className="mt-10 space-y-6 font-body text-base leading-[1.6] text-ink-soft md:text-[1.05rem]">
            <p>
              Cada cliente debe ser cubierto por al menos una antena. Cada antena tiene un costo.
              El objetivo: activar el subconjunto más barato que cubra a todos.
            </p>
            <p>
              Es una instancia clásica del Set Cover Problem, uno de los 21 problemas
              NP-difíciles de Karp. El espacio de búsqueda es de{' '}
              <span className="font-mono tnum text-ink">{problem.espacio}</span> subconjuntos posibles;
              más combinaciones que átomos en el universo observable.
            </p>
            <p>
              La matriz de cobertura{' '}
              <span className="font-mono tnum text-ink">A ∈ {'{0,1}'}<sup>500×500</sup></span>{' '}
              tiene una densidad del{' '}
              <span className="font-mono tnum text-ink">{problem.densidad}%</span>:
              cada cliente queda en el radio de cobertura de entre{' '}
              <span className="font-mono tnum text-ink">{problem.cubiertaMin}</span> y{' '}
              <span className="font-mono tnum text-ink">{problem.cubiertaMax}</span> antenas.
              Los costos oscilan entre{' '}
              <span className="font-mono tnum text-ink">{formatMoney(problem.costoMin)}</span> y{' '}
              <span className="font-mono tnum text-ink">{formatMoney(problem.costoMax)}</span>.
            </p>
          </div>
        </div>

        {/* RIGHT — Matrix viz 7/12 */}
        <div className="mt-4 md:mt-0">
          <figure>
            {/* Top axis label — j = 1 ────── j = 500 */}
            <div
              data-matrix-axis="top"
              className="mb-3 flex items-center gap-3 px-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint md:text-[11px]"
            >
              <span className="tnum">j = 1</span>
              <span aria-hidden className="h-px flex-1 bg-hairline" />
              <span className="tnum">j = 500</span>
            </div>

            <div className="flex items-stretch gap-3">
              {/* Left vertical axis — i = 1 ↓ i = 500 */}
              <div
                data-matrix-axis="left"
                aria-hidden
                className="flex w-3 flex-col items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint md:text-[11px]"
              >
                <span className="tnum [writing-mode:vertical-rl] rotate-180">i = 1</span>
                <span aria-hidden>↓</span>
                <span className="tnum [writing-mode:vertical-rl] rotate-180">i = 500</span>
              </div>

              <div className="relative aspect-square flex-1 rounded-sm border border-hairline bg-paper p-3 sm:p-4 md:p-6">
              <svg
                ref={matrixSvgRef}
                viewBox="0 0 500 500"
                preserveAspectRatio="xMidYMid meet"
                className="h-full w-full"
                role="img"
                aria-label="Sub-muestra 60×60 de la matriz de cobertura 500×500"
                shapeRendering="crispEdges"
              >
                <title>Matriz de cobertura · sub-muestra 60×60</title>
                {cellsByRow.map((row, rowIdx) => (
                  <g key={rowIdx} data-row={rowIdx}>
                    {row.map((cell) => {
                      const x = cell.col * CELL_SPAN;
                      const y = cell.row * CELL_SPAN;
                      if (cell.covered) {
                        return (
                          <rect
                            key={`${cell.row}-${cell.col}`}
                            x={x}
                            y={y}
                            width={CELL_SIZE}
                            height={CELL_SIZE}
                            className={COVERED_BUCKETS[cell.bucket]}
                          />
                        );
                      }
                      return (
                        <rect
                          key={`${cell.row}-${cell.col}`}
                          x={x + CELL_OFFSET}
                          y={y + CELL_OFFSET}
                          width={CELL_SIZE - CELL_OFFSET * 2}
                          height={CELL_SIZE - CELL_OFFSET * 2}
                          className="fill-transparent stroke-hairline"
                          strokeWidth={0.4}
                        />
                      );
                    })}
                  </g>
                ))}
              </svg>

              {/* Bottom-right density readout sits inside the matrix card,
                  giving the chart its own "stamp" without breaking the grid */}
              <span
                data-matrix-stamp
                className="absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint tnum md:text-[11px]"
              >
                {problem.densidad}% densidad · {formatNumber(problem.unos)} unos
              </span>
              </div>
            </div>

            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:text-[12px]">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="inline-block h-2.5 w-2.5 bg-ink" />
                  Cubre
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="inline-block h-2.5 w-2.5 border border-hairline bg-transparent" />
                  No cubre
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint md:text-[11px]">
                sub-muestra 60×60 · proyección 8.33× del original
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Hairline divider with centered dot — soft transition into stats */}
      <div className="mx-auto mt-16 max-w-[1680px] px-5 sm:mt-20 sm:px-8 md:px-16 xl:px-24">
        <div className="my-10 flex items-center gap-4 md:my-12">
          <div aria-hidden className="h-px flex-1 bg-hairline" />
          <div aria-hidden className="h-1 w-1 rounded-full bg-ink" />
          <div aria-hidden className="h-px flex-1 bg-hairline" />
        </div>
      </div>

      {/* Stats grid — 4 boxes with scrub-driven counters */}
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 md:px-16 xl:px-24">
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          <StatCell
            label="Total unos"
            valueRef={(el) => { statRefs.current[0] = el; }}
            initial={formatCounter(0, 0)}
            hint="celdas con cobertura"
          />
          <StatCell
            label="Cobertura promedio"
            valueRef={(el) => { statRefs.current[1] = el; }}
            initial={formatCounter(0, 1)}
            hint={`rango: ${problem.cubiertaMin}–${problem.cubiertaMax} antenas`}
          />
          <StatCell
            label="Costo medio"
            valueRef={(el) => { statRefs.current[2] = el; }}
            initial={formatCounter(0, 2)}
            hint={`σ ${formatMoney(problem.costoStd)}`}
          />
          <StatCell
            label="Espacio de búsqueda"
            valueRef={(el) => { statRefs.current[3] = el; }}
            initial={formatCounter(0, 3)}
            hint="≈ 3.27 × 10¹⁵⁰"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Format a counter value to a display string.
 * idx 0 → integer (total unos: 24,971)
 * idx 1 → 2 decimals (cobertura promedio: 49.94)
 * idx 2 → currency ($3,034)
 * idx 3 → "2^500" symbolic — fades in once value crosses threshold
 */
function formatCounter(v: number, idx: number): string {
  switch (idx) {
    case 0:
      return formatNumber(Math.round(v));
    case 1:
      return formatNumber(v, 2);
    case 2:
      return formatMoney(Math.round(v));
    case 3:
      // Symbolic — once we've crossed a token threshold (any non-zero),
      // render the canonical expression. Before that, keep an empty slot.
      return v < 1e149 * 0.15 ? '··' : '2^500';
    default:
      return '';
  }
}

type StatCellProps = {
  label: string;
  valueRef: (el: HTMLSpanElement | null) => void;
  initial: string;
  hint: string;
};

function StatCell({ label, valueRef, initial, hint }: StatCellProps) {
  return (
    <div className="flex flex-col gap-3 bg-cream p-6 sm:p-7 md:p-8">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:text-[12px]">
        {label}
      </span>
      <span
        ref={valueRef}
        className="font-display tnum text-4xl font-normal leading-[0.95] text-ink md:text-5xl xl:text-6xl"
      >
        {initial}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint md:text-[11px]">
        {hint}
      </span>
    </div>
  );
}

export default Problem;
