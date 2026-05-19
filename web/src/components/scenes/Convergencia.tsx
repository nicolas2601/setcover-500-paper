'use client';

import { useGSAP } from '@gsap/react';
import { useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { convergencia, ga } from '@/data/setcover';
import { formatMoney, formatNumber } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const VB_W = 1280;
const VB_H = 720;
const PAD_L = 96;
const PAD_R = 40;
const PAD_T = 56;
const PAD_B = 96;

const X_MIN = 0;
const X_MAX = 175;
const Y_MIN = 50000;
const Y_MAX = 80000;

const Y_GRID = [52000, 55000, 60000, 70000];
const X_TICKS = [0, 50, 95, 175];

function scaleX(gen: number): number {
  const t = (gen - X_MIN) / (X_MAX - X_MIN);
  return PAD_L + t * (VB_W - PAD_L - PAD_R);
}

function scaleY(cost: number): number {
  const t = (cost - Y_MIN) / (Y_MAX - Y_MIN);
  return PAD_T + (1 - t) * (VB_H - PAD_T - PAD_B);
}

/**
 * Build a smoothed SVG path using quadratic Beziers through the midpoints
 * between consecutive samples. Visually softer than straight L commands while
 * still passing exactly through the first and last points.
 */
function buildPath(points: ReadonlyArray<{ gen: number; costo: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${scaleX(p.gen).toFixed(2)} ${scaleY(p.costo).toFixed(2)}`;
  }
  const first = points[0];
  const segments: string[] = [`M ${scaleX(first.gen).toFixed(2)} ${scaleY(first.costo).toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cx = scaleX(curr.gen);
    const cy = scaleY(curr.costo);
    const nx = scaleX(next.gen);
    const ny = scaleY(next.costo);
    const mx = (cx + nx) / 2;
    const my = (cy + ny) / 2;
    if (i === 0) {
      segments.push(`Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`);
    } else {
      segments.push(`T ${mx.toFixed(2)} ${my.toFixed(2)}`);
    }
  }
  const last = points[points.length - 1];
  segments.push(`T ${scaleX(last.gen).toFixed(2)} ${scaleY(last.costo).toFixed(2)}`);
  return segments.join(' ');
}

/**
 * Closed path for the gradient area under the curve — reuses the same
 * smoothed top and closes it down to the baseline + back to the start.
 */
function buildAreaPath(
  points: ReadonlyArray<{ gen: number; costo: number }>,
  baselineY: number,
): string {
  const top = buildPath(points);
  if (!top) return '';
  const first = points[0];
  const last = points[points.length - 1];
  const xStart = scaleX(first.gen).toFixed(2);
  const xEnd = scaleX(last.gen).toFixed(2);
  return `${top} L ${xEnd} ${baselineY.toFixed(2)} L ${xStart} ${baselineY.toFixed(2)} Z`;
}

// Vertical micro gridlines every 25 gens for extra info density.
const X_MICRO_GRID = [25, 75, 100, 125, 150];

type ChartProps = {
  scrubTriggerRef: React.RefObject<HTMLElement | null>;
};

function ConvergenceChart({ scrubTriggerRef }: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  const pathD = useMemo(() => buildPath(convergencia), []);
  const areaD = useMemo(
    () => buildAreaPath(convergencia, VB_H - PAD_B),
    [],
  );
  const convergePoint = useMemo(
    () => convergencia.find((c) => c.gen === ga.hp.convergencia) ?? convergencia[12],
    [],
  );

  useGSAP(
    () => {
      if (!ref.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const line = ref.current.querySelector<SVGPathElement>('[data-conv-line]');
      const area = ref.current.querySelector<SVGPathElement>('[data-conv-area]');
      const marker = ref.current.querySelector<SVGGElement>('[data-conv-marker]');
      const annoFast = ref.current.querySelector<SVGGElement>('[data-conv-anno="fast"]');
      const annoPlateau = ref.current.querySelector<SVGGElement>('[data-conv-anno="plateau"]');
      const annoMin = ref.current.querySelector<SVGGElement>('[data-conv-anno="min"]');
      const annoLine = ref.current.querySelector<SVGLineElement>('[data-conv-anno-line]');
      const annoDot = ref.current.querySelector<SVGCircleElement>('[data-conv-anno-dot]');
      const annoText = ref.current.querySelector<SVGGElement>('[data-conv-anno-text]');
      const gridLines = ref.current.querySelectorAll<SVGLineElement>('[data-conv-grid]');

      if (reduce) {
        if (line) {
          line.style.strokeDasharray = '';
          line.style.strokeDashoffset = '0';
        }
        gsap.set(
          [marker, annoFast, annoPlateau, annoMin, annoLine, annoDot, annoText, gridLines, area],
          { opacity: 1 },
        );
        return;
      }

      // Initial hidden state
      gsap.set(gridLines, { opacity: 0 });
      gsap.set([marker, annoFast, annoPlateau], { opacity: 0, y: 6 });
      gsap.set(annoMin, { opacity: 1 }); // parent visible, children animate
      if (area) gsap.set(area, { opacity: 0 });

      // Callout cascade — leader line draws via dashoffset, dot pops in, text fades
      if (annoLine) {
        const len = annoLine.getTotalLength
          ? annoLine.getTotalLength()
          : Math.hypot(76, 60);
        annoLine.style.strokeDasharray = `${len}`;
        annoLine.style.strokeDashoffset = `${len}`;
      }
      if (annoDot) gsap.set(annoDot, { opacity: 0, scale: 0, transformOrigin: 'center' });
      if (annoText) gsap.set(annoText, { opacity: 0, y: 6 });

      if (line) {
        const len = line.getTotalLength();
        line.style.strokeDasharray = `${len}`;
        line.style.strokeDashoffset = `${len}`;
      }

      const trigger = scrubTriggerRef.current ?? ref.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: '+=260%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Grid first
      tl.to(gridLines, { opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.04 }, 0);

      // "descenso rápido" annotation fades in early as the line starts drawing
      tl.to(annoFast, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.3);

      // The line draws across the scroll window — slower for a more deliberate draw
      tl.to(line, { strokeDashoffset: 0, duration: 3.5, ease: 'power3.out' }, 0.4);

      // Area gradient fills behind the curve once the line is mostly drawn
      if (area) {
        tl.to(area, { opacity: 0.12, duration: 1.2, ease: 'power3.out' }, 2.6);
      }

      // Marker (gen 95 dot) appears when the line crosses the convergence point
      tl.to(marker, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 3.0);

      // Callout cascade — leader line (0.6s) → dot pop (0.4s) → text fade (0.6s)
      if (annoLine) {
        tl.to(annoLine, { strokeDashoffset: 0, duration: 0.6, ease: 'expo.out' }, 3.2);
      }
      if (annoDot) {
        tl.to(
          annoDot,
          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' },
          3.7,
        );
      }
      if (annoText) {
        tl.to(annoText, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 4.0);
      }

      // "meseta" annotation appears at the end, when the line flattens
      tl.to(annoPlateau, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 4.4);
    },
    { scope: ref },
  );

  const cx = scaleX(convergePoint.gen);
  const cy = scaleY(convergePoint.costo);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-auto w-full"
      role="img"
      aria-label="Curva de convergencia del algoritmo genético"
    >
      <title>Costo del GA por generación · convergencia en gen 95</title>
      <defs>
        {/* Gradient fill under the curve. Stops use the --accent token via
            currentColor so it adapts to theme tokens automatically. */}
        <linearGradient
          id="conv-area-grad"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Soft vertical micro gridlines every 25 gens. Static, very faint —
          they add information density without competing with the curve. */}
      {X_MICRO_GRID.map((g) => {
        const x = scaleX(g);
        return (
          <line
            key={`micro-${g}`}
            data-conv-grid
            data-conv-micro
            x1={x}
            x2={x}
            y1={PAD_T}
            y2={VB_H - PAD_B}
            strokeWidth={1}
            strokeDasharray="1 6"
            className="stroke-hairline"
            opacity={0.3}
          />
        );
      })}

      {/* Y grid */}
      {Y_GRID.map((v) => {
        const y = scaleY(v);
        return (
          <g key={`y-${v}`}>
            <line
              data-conv-grid
              x1={PAD_L}
              x2={VB_W - PAD_R}
              y1={y}
              y2={y}
              strokeWidth={1}
              strokeDasharray="2 6"
              className="stroke-hairline"
            />
            <text
              x={PAD_L - 14}
              y={y + 4}
              textAnchor="end"
              className="fill-ink-faint font-mono uppercase"
              fontSize={11}
              letterSpacing="0.18em"
            >
              ${formatNumber(v / 1000)}k
            </text>
          </g>
        );
      })}

      {/* X ticks */}
      {X_TICKS.map((g) => {
        const x = scaleX(g);
        const isConverge = g === 95;
        const isStagnant = g === 175;
        return (
          <g key={`x-${g}`}>
            {isConverge || isStagnant ? (
              <line
                data-conv-grid
                x1={x}
                x2={x}
                y1={PAD_T}
                y2={VB_H - PAD_B}
                strokeWidth={1}
                strokeDasharray="2 6"
                className="stroke-ink-faint/55"
              />
            ) : null}
            <text
              x={x}
              y={VB_H - PAD_B + 28}
              textAnchor="middle"
              className="fill-ink-faint font-mono uppercase"
              fontSize={11}
              letterSpacing="0.18em"
            >
              gen {g}
            </text>
            {isConverge ? (
              <text
                x={x}
                y={VB_H - PAD_B + 50}
                textAnchor="middle"
                className="fill-accent font-mono uppercase"
                fontSize={10}
                letterSpacing="0.22em"
              >
                convergencia
              </text>
            ) : null}
            {isStagnant ? (
              <text
                x={x}
                y={VB_H - PAD_B + 50}
                textAnchor="middle"
                className="fill-ink-faint font-mono uppercase"
                fontSize={10}
                letterSpacing="0.22em"
              >
                estancamiento
              </text>
            ) : null}
          </g>
        );
      })}

      {/* X axis baseline */}
      <line
        x1={PAD_L}
        x2={VB_W - PAD_R}
        y1={VB_H - PAD_B}
        y2={VB_H - PAD_B}
        strokeWidth={1}
        className="stroke-ink"
      />

      {/* Axis labels */}
      <text
        x={PAD_L}
        y={PAD_T - 24}
        className="fill-ink-faint font-mono uppercase"
        fontSize={11}
        letterSpacing="0.22em"
      >
        Costo · COP
      </text>
      <text
        x={VB_W - PAD_R}
        y={VB_H - 24}
        textAnchor="end"
        className="fill-ink-faint font-mono uppercase"
        fontSize={11}
        letterSpacing="0.22em"
      >
        Generación
      </text>

      {/* Gradient area beneath the curve — uses the accent token via
          currentColor so the gradient stops inherit the same hue as the line. */}
      <path
        data-conv-area
        d={areaD}
        fill="url(#conv-area-grad)"
        className="text-accent"
      />

      {/* The curve */}
      <path
        data-conv-line
        d={pathD}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-ink"
      />

      {/* Marker on convergence (gen 95) — three stacked circles so the
          motion agent can pulse them independently as dot → halo → ring. */}
      <g data-conv-marker>
        <circle
          className="gen-95-ring fill-none stroke-accent"
          cx={cx}
          cy={cy}
          r={20}
          strokeWidth={1}
          strokeOpacity={0.35}
        />
        <circle
          className="gen-95-halo fill-accent/15"
          cx={cx}
          cy={cy}
          r={14}
        />
        <circle
          className="gen-95-dot fill-accent"
          cx={cx}
          cy={cy}
          r={6}
        />
      </g>

      {/* Annotations — split into 3 staggered groups so they cascade:
          (1) leader line draws, (2) dot pop-in, (3) text fade. */}
      <g data-conv-anno="min">
        <line
          data-conv-anno-line
          x1={cx + 14}
          x2={cx + 90}
          y1={cy}
          y2={cy - 60}
          strokeWidth={1}
          className="stroke-ink"
        />
        <circle
          data-conv-anno-dot
          cx={cx + 90}
          cy={cy - 60}
          r={3.2}
          className="fill-ink"
        />
        <g data-conv-anno-text>
          <text
            x={cx + 96}
            y={cy - 62}
            className="fill-ink font-mono tnum"
            fontSize={14}
            fontWeight={600}
          >
            {formatMoney(ga.costo)}
          </text>
          <text
            x={cx + 96}
            y={cy - 46}
            className="fill-ink-faint font-mono uppercase"
            fontSize={10}
            letterSpacing="0.22em"
          >
            mínimo del GA
          </text>
        </g>
      </g>

      <g data-conv-anno="fast">
        <text
          x={scaleX(8)}
          y={scaleY(74000)}
          className="fill-ink-faint font-mono uppercase"
          fontSize={10}
          letterSpacing="0.22em"
        >
          descenso rápido
        </text>
      </g>

      <g data-conv-anno="plateau">
        <text
          x={scaleX(130)}
          y={scaleY(51400)}
          className="fill-ink-faint font-mono uppercase"
          fontSize={10}
          letterSpacing="0.22em"
        >
          meseta · sin mejora
        </text>
      </g>

      {/* Three editorial micro-annotations — they add narrative density
          without competing with the curve. Mono uppercase 8 px text-ink-faint. */}
      <g data-conv-anno="gen-zero">
        <text
          x={scaleX(0) + 6}
          y={scaleY(78420) - 14}
          className="fill-ink-faint font-mono uppercase tnum"
          fontSize={8}
          letterSpacing="0.22em"
        >
          ↑ generación 0 · pob. aleatoria · costo ≈ $78.4k
        </text>
      </g>

      <g data-conv-anno="seventy">
        <text
          x={scaleX(35)}
          y={scaleY(60100) - 12}
          className="fill-ink-faint font-mono uppercase tnum"
          fontSize={8}
          letterSpacing="0.22em"
        >
          ↘ ~70% del trabajo en las primeras 50 gens
        </text>
      </g>

      <g data-conv-anno="afterconv">
        <text
          x={scaleX(110)}
          y={scaleY(50795) + 22}
          className="fill-ink-faint font-mono uppercase tnum"
          fontSize={8}
          letterSpacing="0.22em"
        >
          → después del gen 95 nada cambia
        </text>
      </g>
    </svg>
  );
}

export function Convergencia() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      data-scene="06"
      aria-label="Capítulo 06 · Convergencia"
      className="bg-cream relative py-32 md:py-40"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-16 xl:px-24">
        <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
          CAPÍTULO 06 · CONVERGENCIA
        </div>

        <div className="mt-12 grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-7">
            <SplitReveal
              as="h2"
              className="font-display text-ink text-[clamp(2rem,4.6vw,3.8rem)] font-medium leading-[1.04]"
            >
              {`La curva cae rápido. Después se queda quieta.`}
            </SplitReveal>
          </div>
          <div className="col-span-12 md:col-span-5">
            <p className="text-ink-soft mt-2 text-[15px] leading-relaxed md:text-base">
              El GA hace la mayor parte del trabajo en las primeras 95 generaciones. Después
              solo pule. A los 175 estanca y devuelve.
            </p>
          </div>
        </div>

        <div className="bg-paper ring-hairline mt-16 rounded-[1.75rem] p-6 ring-1 md:p-10">
          <div className="text-ink-faint font-mono mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
            <span>Mejor fitness vs generación</span>
            <span className="tnum">seed {ga.hp.semilla}</span>
          </div>
          <ConvergenceChart scrubTriggerRef={sectionRef} />
        </div>

        <dl className="border-hairline mt-12 grid grid-cols-2 gap-y-6 border-t pt-8 md:grid-cols-4">
          <div>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
              Generación de convergencia
            </dt>
            <dd className="font-display tnum text-ink mt-2 text-2xl md:text-3xl">
              {ga.hp.convergencia}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
              Semilla
            </dt>
            <dd className="font-display tnum text-ink mt-2 text-2xl md:text-3xl">
              {ga.hp.semilla}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
              Tiempo
            </dt>
            <dd className="font-display tnum text-ink mt-2 text-2xl md:text-3xl">
              {formatNumber(ga.tiempo, 2)}s
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
              Población
            </dt>
            <dd className="font-display tnum text-ink mt-2 text-2xl md:text-3xl">
              {ga.hp.poblacion}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default Convergencia;
