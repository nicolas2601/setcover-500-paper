'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { exact, ga } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Row = {
  metric: string;
  ple: string;
  gaValue: string;
};

const rows: Row[] = [
  { metric: 'Costo', ple: formatMoney(exact.costo), gaValue: formatMoney(ga.costo) },
  { metric: '|S|', ple: `${exact.antenas} antenas`, gaValue: `${ga.antenas} antenas` },
  {
    metric: 'Tiempo',
    ple: `${formatNumber(exact.tiempo, 2)} s (10 min)`,
    gaValue: `${formatNumber(ga.tiempo, 2)} s`,
  },
  {
    metric: 'Gap',
    ple: `ref (${formatNumber(exact.gapResidual, 3)} % residual)`,
    gaValue: `+${formatNumber(ga.gap, 2)} %`,
  },
  { metric: 'Garantía', ple: 'IntegerFeasible', gaValue: 'sin garantía' },
];

// Baseline-zoom chart bounds
const BASE = 49000;
const TOP = 51500;
const RANGE = TOP - BASE; // 2500
const pleVal = exact.costo; // 49988
const gaVal = ga.costo; // 50795
const pleHeightPct = ((pleVal - BASE) / RANGE) * 100;
const gaHeightPct = ((gaVal - BASE) / RANGE) * 100;
const diff = gaVal - pleVal; // 807

// Horizontal cost gridlines inside the chart — drawn as hairlines so the
// reader can resolve the bar tops to dollar amounts at a glance.
const COST_GRID = [49500, 50000, 50500, 51000] as const;

type Explainer = {
  eyebrow: string;
  ple: string;
  ga: string;
  note: string;
};

const EXPLAINERS: Explainer[] = [
  {
    eyebrow: 'Cardinalidad',
    ple: 'PLE 22',
    ga: 'GA 23',
    note: 'el GA usa 1 antena extra',
  },
  {
    eyebrow: 'Tiempo',
    ple: '600 s',
    ga: '7.23 s',
    note: 'GA es 83× más rápido',
  },
  {
    eyebrow: 'Garantía',
    ple: 'IntegerFeasible',
    ga: 'sin certificación formal',
    note: 'el PLE acota residual a 0.386 %',
  },
];

export function Comparison() {
  const chartRef = useRef<HTMLDivElement>(null);
  const speedupRef = useRef<HTMLDivElement>(null);

  // Bars + leaders — mini-scrub localized to the chart card. Bars scaleY 0→1
  // with transform-origin: bottom, leaders fade in trailing the bars.
  useGSAP(
    () => {
      const root = chartRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const ctx = gsap.context(() => {
        const bars = root.querySelectorAll<SVGRectElement>('[data-cmp-bar]');
        const pill = root.querySelector<SVGGElement>('[data-cmp-pill]');
        const leaders = root.querySelectorAll<SVGLineElement>('[data-cmp-leader]');

        if (!bars.length) return;

        gsap.set(bars, { scaleY: 0, transformOrigin: 'center bottom' });
        gsap.set(leaders, { opacity: 0 });
        if (pill) gsap.set(pill, { opacity: 0, scale: 0.6, transformOrigin: 'center center' });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1,
          },
        });

        tl.to(bars, {
          scaleY: 1,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.2,
        });
        tl.to(leaders, { opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.1 }, '-=0.3');

        // Pill — pops in once with back.out after bars finish. Not scrubbed.
        ScrollTrigger.create({
          trigger: root,
          start: 'top 35%',
          once: true,
          onEnter: () => {
            if (pill) {
              gsap.to(pill, {
                opacity: 1,
                scale: 1,
                duration: 1.0,
                ease: 'back.out(1.7)',
              });
            }
          },
        });
      }, root);

      return () => ctx.revert();
    },
    { scope: chartRef },
  );

  // 83× hero numeral — scale 0.92 → 1, opacity 0 → 1 with expo.out duration 1.6
  useGSAP(
    () => {
      const node = speedupRef.current?.querySelector<HTMLElement>('[data-cmp-speedup]');
      if (!node) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(node, { scale: 0.92, opacity: 0, transformOrigin: 'left center' });
      gsap.to(node, {
        scale: 1,
        opacity: 1,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: node,
          start: 'top 80%',
          once: true,
        },
      });
    },
    { scope: speedupRef },
  );

  return (
    <section
      data-scene="07"
      aria-label="Capítulo 07 · Comparación PLE vs GA"
      className="bg-cream py-32 md:py-40"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-16 xl:px-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          CAPÍTULO 07 · COMPARACIÓN
        </p>

        <SplitReveal
          as="h2"
          className="mt-8 max-w-4xl font-display text-5xl leading-[0.95] text-ink md:text-7xl"
        >
          Dos métodos. Una respuesta práctica.
        </SplitReveal>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
          La diferencia se ve mejor con baseline-zoom. En escala completa, ambos costos parecen
          idénticos. La verdad está en el delta.
        </p>

        {/* Comparison table */}
        <div className="mt-20 overflow-hidden rounded-[1.5rem] ring-1 ring-hairline bg-paper">
          <div className="grid grid-cols-12 px-8 py-6 ring-1 ring-hairline">
            <div className="col-span-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              Métrica
            </div>
            <div className="col-span-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
              PLE · ILP (B&amp;B)
            </div>
            <div className="col-span-4 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              Algoritmo Genético
            </div>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.metric}
              className={cn(
                'grid grid-cols-12 px-8 py-7 transition-colors duration-300',
                i !== rows.length - 1 && 'ring-1 ring-hairline',
              )}
            >
              <div className="col-span-4 self-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                {row.metric}
              </div>
              <div className="col-span-4 self-center font-display tnum text-2xl text-ink md:text-3xl">
                {row.ple}
              </div>
              <div className="col-span-4 self-center font-display tnum text-2xl text-accent md:text-3xl">
                {row.gaValue}
              </div>
            </div>
          ))}
        </div>

        {/* Baseline-zoom bar chart */}
        <div className="mt-24 grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              Costo · baseline-zoom desde {formatMoney(BASE)}
            </p>

            <div
              ref={chartRef}
              className="mt-6 rounded-[1.5rem] ring-1 ring-hairline bg-paper p-8"
            >
              <ChartBaselineZoom
                pleHeightPct={pleHeightPct}
                gaHeightPct={gaHeightPct}
              />
              <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint tnum">
                <span>{formatMoney(BASE)}</span>
                <span>baseline</span>
                <span>{formatMoney(TOP)}</span>
              </div>
            </div>

            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              Eje Y truncado para revelar el delta real. No empieza en cero.
            </p>
          </div>

          {/* RIGHT — Speedup hero + 3 editorial explainer rows */}
          <div ref={speedupRef} className="col-span-12 md:col-span-5 md:pl-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              Speedup
            </p>
            <div
              data-cmp-speedup
              className="mt-6 font-display tnum text-[10rem] leading-[0.85] text-ink will-change-transform md:text-[14rem]"
            >
              83×
            </div>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
              más rápido
            </p>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-ink-soft">
              El GA termina en {formatNumber(ga.tiempo, 2)} s. El PLE necesita 10 minutos completos
              y aún así no certifica el óptimo.
            </p>

            {/* 3 mini Doppelrand explainer cards — laid as a list with a
                hairline divider above so they read as evidence, not chrome. */}
            <ul
              data-explainers
              className="mt-12 space-y-3 border-t border-hairline pt-8"
              aria-label="Explicación de la diferencia entre PLE y GA"
            >
              {EXPLAINERS.map((ex) => (
                <li
                  key={ex.eyebrow}
                  className="rounded-[1.1rem] ring-1 ring-hairline bg-paper/60 p-1"
                >
                  <div className="rounded-[calc(1.1rem-0.25rem)] bg-paper px-5 py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                        {ex.eyebrow}
                      </span>
                      <span className="font-mono tnum text-[11px] text-ink-soft">
                        <span className="text-ink">{ex.ple}</span>
                        <span className="mx-2 text-ink-faint">·</span>
                        <span className="text-accent">{ex.ga}</span>
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                      {ex.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Delta callout */}
        <div className="mt-16 rounded-[1.5rem] bg-surface px-8 py-10 ring-1 ring-hairline md:px-12 md:py-14">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                Delta de costo
              </p>
              <p className="mt-3 font-display tnum text-5xl text-ink md:text-6xl">
                +${formatNumber(diff)}
              </p>
              <p className="mt-2 font-mono tnum text-sm text-ink-soft">
                +{formatNumber(ga.gap, 2)} %
              </p>
            </div>
            <div className="col-span-12 md:col-span-9 md:pl-8">
              <p className="font-display text-2xl leading-snug text-ink md:text-3xl">
                Para producción a escala, la elección es obvia. El PLE fija el techo de calidad; el
                GA decide en segundos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChartBaselineZoom({
  pleHeightPct,
  gaHeightPct,
}: {
  pleHeightPct: number;
  gaHeightPct: number;
}) {
  // Taller chart for more drama — viewBox grew from 360 to 480
  // (≈ h-[420px] → h-[560px] equivalence at the same width).
  const W = 600;
  const H = 480;
  const padTop = 56;
  const padBottom = 48;
  const usableH = H - padTop - padBottom; // 376
  const barW = 140;
  const pleX = 110;
  const gaX = 360;

  const pleH = (pleHeightPct / 100) * usableH;
  const gaH = (gaHeightPct / 100) * usableH;
  const pleY = H - padBottom - pleH;
  const gaY = H - padBottom - gaH;

  // Map a cost in [BASE, TOP] to its Y inside the chart — used by the
  // horizontal cost gridlines so the reader can resolve bar tops at a glance.
  const yForCost = (cost: number) => {
    const pct = (cost - BASE) / RANGE;
    return H - padBottom - pct * usableH;
  };

  // Annotation line between bar tops — a bit higher so the pill breathes.
  const annotY = Math.min(pleY, gaY) - 40;
  const pillCenterX = (pleX + gaX + barW) / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Comparación de costo entre PLE-ILP y Algoritmo Genético con baseline zoom"
    >
      <title>Comparación de costo PLE vs GA · baseline-zoom desde $49,000</title>
      {/* Horizontal cost gridlines at $49.5k, $50k, $50.5k, $51k —
          hairlines with mono labels to the left. Adds info density. */}
      {COST_GRID.map((cost) => {
        const y = yForCost(cost);
        return (
          <g key={`cgrid-${cost}`} data-cost-grid>
            <line
              x1={40}
              x2={W - 18}
              y1={y}
              y2={y}
              className="stroke-hairline"
              strokeDasharray="2 6"
              strokeWidth={1}
            />
            <text
              x={36}
              y={y + 3}
              textAnchor="end"
              className="fill-ink-faint font-mono tnum"
              fontSize={9}
              letterSpacing="0.16em"
            >
              ${formatNumber(cost / 1000, 1)}k
            </text>
          </g>
        );
      })}

      {/* Baseline gridline (full ink) */}
      <line
        x1={40}
        x2={W - 18}
        y1={H - padBottom}
        y2={H - padBottom}
        className="stroke-ink"
        strokeWidth={1}
      />
      {/* Top gridline */}
      <line
        x1={40}
        x2={W - 18}
        y1={padTop}
        y2={padTop}
        className="stroke-hairline"
        strokeDasharray="2 4"
        strokeWidth={1}
      />

      {/* PLE bar */}
      <rect
        data-cmp-bar
        x={pleX}
        y={pleY}
        width={barW}
        height={pleH}
        className="fill-ink"
        rx={4}
      />
      <text
        x={pleX + barW / 2}
        y={pleY - 14}
        textAnchor="middle"
        className="fill-ink font-mono tnum"
        fontSize={16}
        fontWeight={600}
      >
        $49,988
      </text>
      <text
        x={pleX + barW / 2}
        y={H - 14}
        textAnchor="middle"
        className="fill-ink-faint font-mono"
        fontSize={11}
        letterSpacing="0.18em"
      >
        PLE · ILP
      </text>

      {/* GA bar */}
      <rect
        data-cmp-bar
        x={gaX}
        y={gaY}
        width={barW}
        height={gaH}
        className="fill-accent"
        rx={4}
      />
      <text
        x={gaX + barW / 2}
        y={gaY - 14}
        textAnchor="middle"
        className="fill-accent font-mono tnum"
        fontSize={16}
        fontWeight={600}
      >
        $50,795
      </text>
      <text
        x={gaX + barW / 2}
        y={H - 14}
        textAnchor="middle"
        className="fill-ink-faint font-mono"
        fontSize={11}
        letterSpacing="0.18em"
      >
        GA
      </text>

      {/* Annotation: connecting verticals + editorial delta pill */}
      <line
        data-cmp-leader
        x1={pleX + barW / 2}
        x2={pleX + barW / 2}
        y1={pleY - 4}
        y2={annotY}
        className="stroke-ink-faint"
        strokeWidth={1}
      />
      <line
        data-cmp-leader
        x1={gaX + barW / 2}
        x2={gaX + barW / 2}
        y1={gaY - 4}
        y2={annotY}
        className="stroke-ink-faint"
        strokeWidth={1}
      />
      <line
        data-cmp-leader
        x1={pleX + barW / 2}
        x2={gaX + barW / 2}
        y1={annotY}
        y2={annotY}
        className="stroke-ink-faint"
        strokeWidth={1}
      />

      {/* Editorial delta pill — wider, ink stroke, ↗ glyph inside,
          mono sub-label "+$0,807 · gap" right below it. */}
      <g data-cmp-pill className="[transform-box:fill-box] [transform-origin:center]">
        <rect
          x={pillCenterX - 86}
          y={annotY - 26}
          width={172}
          height={30}
          rx={15}
          className="fill-paper stroke-ink"
          strokeWidth={1}
        />
        <text
          x={pillCenterX - 70}
          y={annotY - 7}
          className="fill-ink font-mono"
          fontSize={13}
          fontWeight={600}
        >
          ↗
        </text>
        <text
          x={pillCenterX + 10}
          y={annotY - 7}
          textAnchor="middle"
          className="fill-ink font-mono tnum"
          fontSize={12}
          fontWeight={600}
        >
          +$807 · +1.61 %
        </text>
        <text
          x={pillCenterX}
          y={annotY + 18}
          textAnchor="middle"
          className="fill-ink-faint font-mono tnum uppercase"
          fontSize={9}
          letterSpacing="0.22em"
        >
          +$0,807 · gap
        </text>
      </g>
    </svg>
  );
}
