'use client';

import { SplitReveal } from '@/components/motion/SplitReveal';
import { robustness, seeds, exact } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

// Dot plot bounds. X axis is gap %
const GAP_MIN = 0;
const GAP_MAX = 2.0;

// Vertical jitter to avoid overlap (manual, deterministic)
const jitter: Record<string, number> = {
  S1: 0.35,
  S2: 0.55,
  S3: 0.65,
  S4: 0.45,
  S5: 0.5,
};

export function Robustness() {
  return (
    <section className="bg-paper py-32 md:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
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
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Distribución · 5 semillas · gap vs PLE-ILP
          </p>
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

        {/* One-liner */}
        <p className="mt-16 max-w-3xl font-display text-2xl leading-snug text-ink md:text-3xl">
          Incluso en su peor corrida (S2), el GA queda a menos del 2% del óptimo certificado, en
          menos de 8 segundos.
        </p>
      </div>
    </section>
  );
}

function DotPlot() {
  const W = 900;
  const H = 320;
  const padX = 60;
  const padY = 40;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  // Baseline line: PLE-ILP at gap=0
  const ilpX = padX + (0 / GAP_MAX) * usableW;

  // Ticks at 0.5 intervals
  const ticks = [0.0, 0.5, 1.0, 1.5, 2.0];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Dot plot de los costos del GA en 5 semillas frente al PLE-ILP"
    >
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

        return (
          <g key={s.id}>
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
  return (
    <div
      className={cn(
        'col-span-12 md:col-span-4 rounded-[1.5rem] bg-cream p-8 ring-1 ring-hairline',
        accent && 'bg-accent-soft ring-accent/30',
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">{label}</p>
      <p
        className={cn(
          'mt-6 font-display tnum text-5xl leading-none text-ink md:text-6xl',
          accent && 'text-accent',
        )}
      >
        {value}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{sub}</p>
      {accent && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          vs PLE · {formatNumber(exact.gapResidual, 3)}% residual
        </p>
      )}
    </div>
  );
}
