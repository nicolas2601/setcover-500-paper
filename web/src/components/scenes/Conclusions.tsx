'use client';

import { SplitReveal } from '@/components/motion/SplitReveal';
import { MagneticButton } from '@/components/motion/MagneticButton';

const pleCases = [
  'Benchmark de calidad. Fija el techo de lo posible.',
  'Certificación: el residual del 0.386% mide qué tan cerca estás del óptimo verdadero.',
  'Validación de heurísticas nuevas antes de pasarlas a producción.',
];

const gaCases = [
  'Producción a escala. Cuando el problema crece y el tiempo de respuesta es la restricción.',
  'Decisiones rápidas: 7.23 s vs 10 min cambia el flujo operativo.',
  'Sensibilidad alta a tiempo. Acepta el 1 a 2 % de gap como costo del realismo.',
];

export function Conclusions() {
  return (
    <section className="bg-cream py-48 md:py-56">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          CAPÍTULO 09 · CIERRE
        </p>

        <div className="mt-12 space-y-1">
          <SplitReveal
            as="h2"
            className="font-display text-5xl leading-[0.95] text-ink md:text-7xl"
          >
            Honestidad metodológica:
          </SplitReveal>
          <SplitReveal
            as="h2"
            className="font-display text-5xl leading-[0.95] text-ink-soft md:text-7xl"
            delay={0.1}
          >
            el exacto no es óptimo,
          </SplitReveal>
          <SplitReveal
            as="h2"
            className="font-display text-5xl leading-[0.95] text-accent md:text-7xl"
            delay={0.2}
          >
            el genético no es perfecto.
          </SplitReveal>
          <SplitReveal
            as="h2"
            className="font-display text-5xl leading-[0.95] text-ink md:text-7xl"
            delay={0.3}
          >
            Cada uno sirve para algo distinto.
          </SplitReveal>
        </div>

        {/* 2-col asymmetric layout */}
        <div className="mt-24 grid grid-cols-12 gap-8">
          {/* LEFT · PLE */}
          <div className="col-span-12 md:col-span-7">
            <div className="rounded-[1.5rem] ring-1 ring-hairline bg-paper p-10 md:p-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                Cuándo usar el PLE · ILP
              </p>
              <p className="mt-6 font-display text-3xl leading-tight text-ink md:text-4xl">
                Cuando puedes esperar y necesitas saber el mejor resultado posible.
              </p>
              <ul className="mt-10 space-y-5">
                {pleCases.map((c, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-2 inline-block size-2 rounded-full bg-ink shrink-0" />
                    <span className="text-base leading-relaxed text-ink-soft md:text-lg">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                No en producción si hay timeout.
              </p>
            </div>
          </div>

          {/* RIGHT · GA */}
          <div className="col-span-12 md:col-span-5 md:mt-24">
            <div className="rounded-[1.5rem] ring-1 ring-accent/30 bg-accent-soft p-10 md:p-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                Cuándo usar el GA
              </p>
              <p className="mt-6 font-display text-3xl leading-tight text-ink md:text-4xl">
                Cuando el tiempo manda y un gap del 1 a 2 % es aceptable.
              </p>
              <ul className="mt-10 space-y-5">
                {gaCases.map((c, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-2 inline-block size-2 rounded-full bg-accent shrink-0" />
                    <span className="text-base leading-relaxed text-ink-soft md:text-lg">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-10 font-mono tnum text-[11px] uppercase tracking-[0.18em] text-accent">
                83× más rápido · CV 0.46 %
              </p>
            </div>
          </div>
        </div>

        {/* Pull quote */}
        <figure className="mt-32 mx-auto max-w-4xl text-center">
          <blockquote className="font-display italic text-4xl leading-[1.1] text-ink md:text-6xl">
            &ldquo;El mejor algoritmo no existe; existe el algoritmo que resuelve tu restricción más
            cara.&rdquo;
          </blockquote>
          <figcaption className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            UNAB · Investigación de Operaciones · 2026
          </figcaption>
        </figure>

        {/* CTAs */}
        <div className="mt-24 flex flex-col items-start gap-6 md:flex-row md:items-center">
          <MagneticButton aria-label="Leer el paper completo en PDF">
            Leer el paper completo (PDF)
            <span aria-hidden className="font-mono">
              ↗
            </span>
          </MagneticButton>

          <a
            href="#code"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors duration-300 hover:text-ink"
          >
            <span>Ver el código en MATLAB</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
