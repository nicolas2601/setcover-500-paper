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

function buildPath(points: ReadonlyArray<{ gen: number; costo: number }>): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.gen).toFixed(2)} ${scaleY(p.costo).toFixed(2)}`)
    .join(' ');
}

type ChartProps = {
  scrubTriggerRef: React.RefObject<HTMLElement | null>;
};

function ConvergenceChart({ scrubTriggerRef }: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  const pathD = useMemo(() => buildPath(convergencia), []);
  const convergePoint = useMemo(
    () => convergencia.find((c) => c.gen === ga.hp.convergencia) ?? convergencia[12],
    [],
  );

  useGSAP(
    () => {
      if (!ref.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const line = ref.current.querySelector<SVGPathElement>('[data-conv-line]');
      const marker = ref.current.querySelector<SVGGElement>('[data-conv-marker]');
      const annoFast = ref.current.querySelector<SVGGElement>('[data-conv-anno="fast"]');
      const annoPlateau = ref.current.querySelector<SVGGElement>('[data-conv-anno="plateau"]');
      const annoMin = ref.current.querySelector<SVGGElement>('[data-conv-anno="min"]');
      const gridLines = ref.current.querySelectorAll<SVGLineElement>('[data-conv-grid]');

      if (reduce) {
        if (line) {
          line.style.strokeDasharray = '';
          line.style.strokeDashoffset = '0';
        }
        gsap.set([marker, annoFast, annoPlateau, annoMin, gridLines], { opacity: 1 });
        return;
      }

      // Initial hidden state
      gsap.set(gridLines, { opacity: 0 });
      gsap.set([marker, annoFast, annoPlateau, annoMin], { opacity: 0, y: 6 });

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
          end: '+=180%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Grid first
      tl.to(gridLines, { opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.03 }, 0);

      // "descenso rápido" annotation fades in early as the line starts drawing
      tl.to(annoFast, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, 0.3);

      // The line draws across the scroll window
      tl.to(line, { strokeDashoffset: 0, duration: 2.2, ease: 'power3.out' }, 0.4);

      // Marker (gen 95 dot) appears when the line crosses the convergence point
      // Roughly the moment we've drawn ~70% of the line — at scrub time ≈ 1.9
      tl.to(marker, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 1.9);

      // "mínimo del GA" callout right after marker
      tl.to(annoMin, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 2.0);

      // "meseta" annotation appears at the end, when the line flattens
      tl.to(annoPlateau, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 2.5);
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

      {/* Marker on convergence */}
      <g data-conv-marker>
        <circle cx={cx} cy={cy} r={14} className="fill-accent/15" />
        <circle cx={cx} cy={cy} r={6} className="fill-accent" />
      </g>

      {/* Annotations */}
      <g data-conv-anno="min">
        <line
          x1={cx + 14}
          x2={cx + 90}
          y1={cy}
          y2={cy - 60}
          strokeWidth={1}
          className="stroke-ink"
        />
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
    </svg>
  );
}

export function Convergencia() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="bg-cream relative py-32 md:py-40">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
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
