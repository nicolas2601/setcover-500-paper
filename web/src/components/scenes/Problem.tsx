'use client';

import { useGSAP } from '@gsap/react';
import { useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { problem } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

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

type Cell = { row: number; col: number; covered: boolean; bucket: 0 | 1 | 2 | 3; diag: number };

const GRID_N = 50;

function buildMatrix(rows: number, cols: number, density: number): Cell[] {
  const rng = mulberry32(0xc0ffee);
  const out: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const covered = rng() < density;
      const bucket = Math.floor((c / cols) * 4) as 0 | 1 | 2 | 3;
      out.push({ row: r, col: c, covered, bucket, diag: r + c });
    }
  }
  return out;
}

const COVERED_BUCKETS = ['fill-ink/60', 'fill-ink/75', 'fill-ink/90', 'fill-ink'] as const;

export function Problem() {
  const cells = useMemo(() => buildMatrix(GRID_N, GRID_N, 0.0999), []);

  const sectionRef = useRef<HTMLElement>(null);
  const matrixSvgRef = useRef<SVGSVGElement>(null);
  const statRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const svg = matrixSvgRef.current;
      if (!section || !svg) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const cellEls = svg.querySelectorAll<SVGRectElement>('[data-cell]');
      const statEls = statRefs.current.filter((el): el is HTMLSpanElement => !!el);

      // Final values for counters
      const finalValues = [problem.unos, problem.cubiertaProm, problem.costoMedia, 1.5e150];

      if (reduce) {
        gsap.set(cellEls, { autoAlpha: 1 });
        statEls.forEach((el, i) => {
          el.textContent = formatCounter(finalValues[i], i);
        });
        return;
      }

      // Initial state — all cells invisible, counters at 0
      gsap.set(cellEls, { autoAlpha: 0 });
      statEls.forEach((el, i) => {
        el.textContent = formatCounter(0, i);
      });

      // Diagonal sweep grouping — each diagonal reveals as a wave
      const maxDiag = (GRID_N - 1) * 2;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=180%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Wave reveal — cells appear in diagonal bands
      tl.to(cellEls, {
        autoAlpha: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: {
          each: 0.004,
          from: 'start',
          grid: [GRID_N, GRID_N],
        },
      }, 0);

      // Counters tween simultaneously over the same scrub window
      const counterObj = { v0: 0, v1: 0, v2: 0, v3: 0 };
      tl.to(
        counterObj,
        {
          v0: finalValues[0],
          v1: finalValues[1],
          v2: finalValues[2],
          v3: finalValues[3],
          duration: 1,
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

      // Subtle accent emphasis on the matrix card at the end
      void maxDiag;
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative bg-cream py-32 md:py-40">
      {/* Eyebrow */}
      <div className="px-6 md:px-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          CAPÍTULO 02 · EL PROBLEMA
        </span>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-6 px-6 md:mt-14 md:gap-x-8 md:px-12">
        {/* LEFT — Text column 5/12 */}
        <div className="col-span-12 md:col-start-1 md:col-span-5">
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
        <div className="col-span-12 mt-16 md:col-start-7 md:col-span-6 md:mt-0">
          <figure>
            <div className="relative aspect-square w-full rounded-sm border border-hairline bg-paper p-4 md:p-6">
              <svg
                ref={matrixSvgRef}
                viewBox="0 0 500 500"
                preserveAspectRatio="xMidYMid meet"
                className="h-full w-full"
                aria-label="Sub-muestra 50×50 de la matriz de cobertura 500×500"
              >
                {cells.map((cell) => {
                  const x = cell.col * 10;
                  const y = cell.row * 10;
                  if (cell.covered) {
                    return (
                      <rect
                        key={`${cell.row}-${cell.col}`}
                        data-cell
                        data-diag={cell.diag}
                        x={x}
                        y={y}
                        width={9}
                        height={9}
                        className={cn(
                          COVERED_BUCKETS[cell.bucket],
                          'transition-opacity duration-200 ease-[var(--ease-apple)]',
                          'hover:fill-accent',
                        )}
                      />
                    );
                  }
                  return (
                    <rect
                      key={`${cell.row}-${cell.col}`}
                      data-cell
                      data-diag={cell.diag}
                      x={x + 0.5}
                      y={y + 0.5}
                      width={8}
                      height={8}
                      className={cn(
                        'fill-transparent stroke-hairline',
                        'transition-colors duration-200 ease-[var(--ease-apple)]',
                        'hover:stroke-ink-faint',
                      )}
                      strokeWidth={0.6}
                    />
                  );
                })}
              </svg>

              {/* Corner ticks */}
              <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                i = 1
              </span>
              <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                j = 500
              </span>
            </div>

            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="inline-block h-2.5 w-2.5 bg-ink" />
                  Cubre
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="inline-block h-2.5 w-2.5 border border-hairline bg-transparent" />
                  No cubre
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                ~{problem.densidad}% densidad · sub-muestra 10×
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Stats grid — 4 boxes with scrub-driven counters */}
      <div className="mt-24 px-6 md:mt-28 md:px-12">
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline lg:grid-cols-4">
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
            hint="antenas por cliente"
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
    <div className="flex flex-col gap-2 bg-cream p-6 md:p-7">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </span>
      <span
        ref={valueRef}
        className="font-mono tnum text-[clamp(1.4rem,2.4vw,2rem)] font-light leading-none text-ink"
      >
        {initial}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        {hint}
      </span>
    </div>
  );
}

export default Problem;
