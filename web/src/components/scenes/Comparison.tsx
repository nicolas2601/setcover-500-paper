'use client';

import { SplitReveal } from '@/components/motion/SplitReveal';
import { exact, ga } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

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

export function Comparison() {
  return (
    <section className="bg-cream py-32 md:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
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

            <div className="mt-6 rounded-[1.5rem] ring-1 ring-hairline bg-paper p-8">
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

          <div className="col-span-12 md:col-span-5 md:pl-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              Speedup
            </p>
            <div className="mt-6 font-display tnum text-[10rem] leading-[0.85] text-ink md:text-[14rem]">
              83×
            </div>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
              más rápido
            </p>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-ink-soft">
              El GA termina en {formatNumber(ga.tiempo, 2)} s. El PLE necesita 10 minutos completos
              y aún así no certifica el óptimo.
            </p>
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
  // SVG viewBox: 600 wide × 360 tall. Bars occupy y in [40, 320]
  const W = 600;
  const H = 360;
  const padTop = 40;
  const padBottom = 40;
  const usableH = H - padTop - padBottom; // 280
  const barW = 140;
  const pleX = 110;
  const gaX = 360;

  const pleH = (pleHeightPct / 100) * usableH;
  const gaH = (gaHeightPct / 100) * usableH;
  const pleY = H - padBottom - pleH;
  const gaY = H - padBottom - gaH;

  // Annotation line between bar tops
  const annotY = Math.min(pleY, gaY) - 22;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Comparación de costo entre PLE-ILP y Algoritmo Genético con baseline zoom"
    >
      {/* Baseline gridline */}
      <line
        x1={40}
        x2={W - 40}
        y1={H - padBottom}
        y2={H - padBottom}
        className="stroke-hairline"
        strokeWidth={1}
      />
      {/* Top gridline */}
      <line
        x1={40}
        x2={W - 40}
        y1={padTop}
        y2={padTop}
        className="stroke-hairline"
        strokeDasharray="2 4"
        strokeWidth={1}
      />

      {/* PLE bar */}
      <rect
        x={pleX}
        y={pleY}
        width={barW}
        height={pleH}
        className="fill-ink"
        rx={4}
      />
      <text
        x={pleX + barW / 2}
        y={pleY - 12}
        textAnchor="middle"
        className="fill-ink font-mono tnum"
        fontSize={16}
        fontWeight={600}
      >
        $49,988
      </text>
      <text
        x={pleX + barW / 2}
        y={H - 12}
        textAnchor="middle"
        className="fill-ink-faint font-mono"
        fontSize={11}
        letterSpacing="0.18em"
      >
        PLE · ILP
      </text>

      {/* GA bar */}
      <rect
        x={gaX}
        y={gaY}
        width={barW}
        height={gaH}
        className="fill-accent"
        rx={4}
      />
      <text
        x={gaX + barW / 2}
        y={gaY - 12}
        textAnchor="middle"
        className="fill-accent font-mono tnum"
        fontSize={16}
        fontWeight={600}
      >
        $50,795
      </text>
      <text
        x={gaX + barW / 2}
        y={H - 12}
        textAnchor="middle"
        className="fill-ink-faint font-mono"
        fontSize={11}
        letterSpacing="0.18em"
      >
        GA
      </text>

      {/* Annotation: connecting line + delta label */}
      <line
        x1={pleX + barW / 2}
        x2={pleX + barW / 2}
        y1={pleY - 4}
        y2={annotY}
        className="stroke-ink-faint"
        strokeWidth={1}
      />
      <line
        x1={gaX + barW / 2}
        x2={gaX + barW / 2}
        y1={gaY - 4}
        y2={annotY}
        className="stroke-ink-faint"
        strokeWidth={1}
      />
      <line
        x1={pleX + barW / 2}
        x2={gaX + barW / 2}
        y1={annotY}
        y2={annotY}
        className="stroke-ink-faint"
        strokeWidth={1}
      />
      <rect
        x={(pleX + gaX + barW) / 2 - 70}
        y={annotY - 22}
        width={140}
        height={26}
        rx={13}
        className="fill-paper stroke-ink-faint"
        strokeWidth={1}
      />
      <text
        x={(pleX + gaX + barW) / 2}
        y={annotY - 5}
        textAnchor="middle"
        className="fill-ink font-mono tnum"
        fontSize={12}
        fontWeight={600}
      >
        +$807 · +1.61%
      </text>
    </svg>
  );
}
