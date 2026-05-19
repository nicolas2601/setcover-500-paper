'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { robustness, seeds, exact } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Dot plot bounds. X axis is gap %
const GAP_MAX = 2.0;

// Vertical jitter to avoid overlap (manual, deterministic)
const jitter: Record<string, number> = {
  S1: 0.35,
  S2: 0.55,
  S3: 0.65,
  S4: 0.45,
  S5: 0.5,
};

// Reveal order — S1 first (best), then S3 (best), S4, S5, S2 (worst) last.
const REVEAL_ORDER = ['S1', 'S3', 'S4', 'S5', 'S2'] as const;

export function Robustness() {
  return (
    <section
      data-scene="08"
      aria-label="Capítulo 08 · Robustez · 5 semillas"
      className="bg-paper py-32 md:py-40"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-16 xl:px-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          CAPÍTULO 08 · ROBUSTEZ
        </p>

        <SplitReveal
          as="h2"
          className="mt-8 max-w-4xl font-display text-5xl leading-[0.95] text-ink md:text-7xl"
        >
          Cinco semillas. CV de 0.46%. El GA es estable.
        </SplitReveal>

        <div className="mt-10 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft md:text-xl">
          <p>
            Ejecutamos el mismo GA cinco veces, cambiando solo la semilla aleatoria. Mismo
            instance, mismos hiperparámetros, distintos puntos de partida en la búsqueda.
          </p>
          <p>
            Cada corrida es una muestra independiente. El coeficiente de variación mide cuánto
            varía el resultado frente a la media. Por debajo del 1% se considera muy estable.
          </p>
        </div>

        {/* Dot plot */}
        <div className="mt-20 rounded-[1.5rem] ring-1 ring-hairline bg-cream p-8 md:p-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              Distribución · 5 semillas · gap vs PLE-ILP
            </p>
            <p
              data-robustness-delta
              className="font-mono tnum text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            >
              Δ entre best (${formatNumber(50253)}) y worst (${formatNumber(50795)}) ={' '}
              ${formatNumber(542)} · {formatNumber(0.55, 2)} puntos %
            </p>
          </div>
          <div className="mt-8">
            <DotPlot />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint tnum">
            <span>0.0 %</span>
            <span>0.5 %</span>
            <span>1.0 %</span>
            <span>1.5 %</span>
            <span>2.0 %</span>
          </div>
        </div>

        {/* Stat blocks */}
        <div className="mt-16 grid grid-cols-12 gap-6">
          <StatCard
            label="Media μ"
            value={formatMoney(robustness.media)}
            sub="costo promedio de las 5 corridas"
          />
          <StatCard
            label="Desviación σ"
            value={`$${formatNumber(robustness.std, 1)}`}
            sub="dispersión absoluta"
          />
          <StatCard
            label="CV"
            value={`${formatNumber(robustness.cv, 2)} %`}
            sub="dispersión relativa · σ / μ"
            accent
          />
        </div>

        {/* One-liner — plain-language wrap-up after all the numbers */}
        <p className="mt-16 max-w-3xl font-display text-2xl leading-snug text-ink md:text-3xl">
          El coeficiente de variación es {formatNumber(robustness.cv, 2)} %. En lenguaje plano: si
          volvés a correr el GA, la respuesta apenas se mueve.
        </p>
      </div>
    </section>
  );
}

function DotPlot() {
  const W = 900;
  // Taller plot — 320 → 380 — so the trace lines + dots breathe
  // and the contrast between seeds is more legible.
  const H = 380;
  const padX = 60;
  const padY = 40;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  const svgRef = useRef<SVGSVGElement>(null);

  // Baseline line: PLE-ILP at gap=0
  const ilpX = padX + (0 / GAP_MAX) * usableW;

  // Ticks at 0.5 intervals
  const ticks = [0.0, 0.5, 1.0, 1.5, 2.0];

  // Reveal in order S1, S3, S4, S5, S2 with stagger 0.18 + back.out(1.6)
  // Then start a slow breathing loop on S2 (the worst).
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const groups = Array.from(svg.querySelectorAll<SVGGElement>('[data-seed]'));
      if (!groups.length) return;

      // Hide all dots initially
      gsap.set(groups, { opacity: 0, scale: 0, transformOrigin: 'center center' });

      const ordered = REVEAL_ORDER
        .map((id) => groups.find((g) => g.dataset.seed === id))
        .filter((g): g is SVGGElement => !!g);

      ScrollTrigger.create({
        trigger: svg,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(ordered, {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: 'back.out(1.6)',
            stagger: 0.18,
            onComplete: () => {
              // After reveal, S2 starts breathing — subtle 1 → 1.05 → 1 loop.
              const s2 = svg.querySelector<SVGGElement>('[data-seed="S2"]');
              if (s2) {
                gsap.to(s2, {
                  scale: 1.05,
                  duration: 1.5,
                  ease: 'sine.inOut',
                  yoyo: true,
                  repeat: -1,
                  transformOrigin: 'center center',
                });
              }
            },
          });
        },
      });
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Dot plot de los costos del GA en 5 semillas frente al PLE-ILP"
    >
      <title>Dot plot · gap del GA por semilla vs PLE-ILP</title>
      {/* x-axis baseline */}
      <line
        x1={padX}
        x2={W - padX}
        y1={H - padY}
        y2={H - padY}
        className="stroke-hairline"
        strokeWidth={1}
      />

      {/* Ticks on x-axis */}
      {ticks.map((t) => {
        const x = padX + (t / GAP_MAX) * usableW;
        return (
          <line
            key={t}
            x1={x}
            x2={x}
            y1={H - padY}
            y2={H - padY + 6}
            className="stroke-hairline"
            strokeWidth={1}
          />
        );
      })}

      {/* Vertical line at ILP baseline (gap=0) */}
      <line
        x1={ilpX}
        x2={ilpX}
        y1={padY - 10}
        y2={H - padY}
        className="stroke-ink"
        strokeDasharray="4 4"
        strokeWidth={1.5}
      />
      <text
        x={ilpX + 8}
        y={padY}
        className="fill-ink font-mono"
        fontSize={11}
        fontWeight={600}
        letterSpacing="0.15em"
      >
        PLE · ILP $49,988
      </text>

      {/* Dots */}
      {seeds.map((s) => {
        const x = padX + (s.gap / GAP_MAX) * usableW;
        const y = padY + jitter[s.id] * usableH;
        const isWorst = s.id === 'S2';
        const isBest = s.id === 'S1' || s.id === 'S3';
        const fillClass = isWorst
          ? 'fill-warning'
          : isBest
          ? 'fill-accent'
          : 'fill-ink-soft';
        const textClass = isWorst
          ? 'fill-warning'
          : isBest
          ? 'fill-accent'
          : 'fill-ink';
        const traceClass = isWorst
          ? 'stroke-warning'
          : isBest
          ? 'stroke-accent'
          : 'stroke-ink-soft';

        return (
          <g
            key={s.id}
            data-seed={s.id}
            className="[transform-box:fill-box] [transform-origin:center]"
          >
            {/* Trace line — baseline → dot. Very faint dashed, gives the
                visual sense of each seed "shooting" away from the optimum. */}
            <line
              data-seed-trace
              x1={ilpX}
              x2={x - 12}
              y1={y}
              y2={y}
              className={cn('opacity-40', traceClass)}
              strokeDasharray="2 3"
              strokeWidth={1}
            />
            <circle cx={x} cy={y} r={10} className={fillClass} />
            <circle
              cx={x}
              cy={y}
              r={18}
              className={fillClass}
              opacity={0.15}
            />
            <text
              x={x + 22}
              y={y - 4}
              className={cn('font-mono', textClass)}
              fontSize={12}
              fontWeight={600}
              letterSpacing="0.05em"
            >
              {s.id} · seed {s.seed}
            </text>
            <text
              x={x + 22}
              y={y + 12}
              className="fill-ink-faint font-mono tnum"
              fontSize={11}
            >
              ${formatNumber(s.costo)} · +{formatNumber(s.gap, 2)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  // The CV card uses Doppelrand nested architecture so it reads as the
  // headline finding of the scene; the other two stay flat single-surface.
  if (accent) {
    return (
      <div className="col-span-12 rounded-[1.5rem] bg-accent-soft p-1.5 ring-1 ring-accent/40 md:col-span-4">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-accent-soft px-8 py-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {label}
          </p>
          <p className="mt-6 font-display tnum text-accent text-5xl leading-none md:text-7xl">
            {value}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{sub}</p>
          <CvSparkline />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            vs PLE · {formatNumber(exact.gapResidual, 3)}% residual
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-[1.5rem] bg-cream p-8 ring-1 ring-hairline md:col-span-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">{label}</p>
      <p className="mt-6 font-display tnum text-5xl leading-none text-ink md:text-6xl">
        {value}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{sub}</p>
    </div>
  );
}

function CvSparkline() {
  // 5 dots + connecting line representing the 5 seeds — no labels, no axis.
  // Pure shape of dispersion. Best (S1, S3) in accent, worst (S2) in warning.
  const W = 160;
  const H = 28;
  const padX = 4;
  const padY = 4;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const gaps = seeds.map((s) => s.gap);
  const min = Math.min(...gaps);
  const max = Math.max(...gaps);
  const range = max - min || 1;
  const points = seeds.map((s, i) => {
    const x = padX + (i / (seeds.length - 1)) * usableW;
    const y = padY + (1 - (s.gap - min) / range) * usableH;
    return {
      x,
      y,
      isWorst: s.id === 'S2',
      isBest: s.id === 'S1' || s.id === 'S3',
    };
  });
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-5 block h-7 w-full"
      role="img"
      aria-label="Sparkline de los 5 seeds en orden cronológico"
    >
      <path
        d={path}
        fill="none"
        strokeWidth={1}
        className="stroke-accent/60"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.isWorst ? 2.2 : p.isBest ? 2 : 1.7}
          className={cn(
            p.isWorst
              ? 'fill-warning'
              : p.isBest
                ? 'fill-accent'
                : 'fill-ink-soft',
          )}
        />
      ))}
    </svg>
  );
}
