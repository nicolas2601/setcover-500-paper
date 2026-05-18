'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { ga } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Step = {
  n: string;
  title: string;
  body: string;
  meta: string;
};

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Inicialización',
    body: 'Población de 150 cromosomas binarios. Cada cromosoma es un subconjunto S de antenas candidatas. Semilla controlada para reproducibilidad.',
    meta: 'pop = 150',
  },
  {
    n: '02',
    title: 'Evaluación',
    body: 'Función de fitness penalizada. Costo total de S más penalización por clientes no cubiertos. Empuja hacia soluciones factibles.',
    meta: 'fitness = Σc + λ · faltantes',
  },
  {
    n: '03',
    title: 'Selección',
    body: 'Torneo binario. Dos cromosomas al azar, gana el de menor fitness. Mantiene presión selectiva sin colapsar diversidad temprana.',
    meta: 'torneo k = 2',
  },
  {
    n: '04',
    title: 'Cruce',
    body: 'Recombinación uniforme con probabilidad alta. Cada gen se hereda del padre A o B con probabilidad equitativa cuando hay cruce.',
    meta: 'p_c = 0.9',
  },
  {
    n: '05',
    title: 'Mutación',
    body: 'Bit-flip adaptativo. Empieza agresiva para explorar, decae para explotar. Cuida no perturbar al élite cuando el frente ya está pulido.',
    meta: 'p_m: 3% → 0.5%',
  },
  {
    n: '06',
    title: 'Elitismo',
    body: 'Las tres mejores soluciones pasan intactas a la siguiente generación. Garantiza monotonía: la mejor fitness nunca empeora generación a generación.',
    meta: 'elite = 3',
  },
  {
    n: '07',
    title: 'Estancamiento',
    body: 'Si la mejor solución no mejora durante 80 generaciones seguidas, el bucle termina. Ahorra evaluaciones cuando el frente ya está estable.',
    meta: 'paciencia = 80 gens',
  },
];

type MetricProps = {
  eyebrow: string;
  value: string;
  caption?: string;
  accent?: boolean;
};

function Metric({ eyebrow, value, caption, accent }: MetricProps) {
  return (
    <div className="bg-paper ring-hairline rounded-[1.25rem] p-6 ring-1 md:p-7">
      <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
        {eyebrow}
      </div>
      <div
        className={cn(
          'font-display tnum mt-4 text-3xl leading-none md:text-4xl',
          accent ? 'text-accent' : 'text-ink',
        )}
      >
        {value}
      </div>
      {caption ? (
        <div className="text-ink-soft font-mono tnum mt-3 text-[11px] uppercase tracking-[0.18em]">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

type Row = {
  k: string;
  v: string;
};

const HYPER: Row[] = [
  { k: 'Población', v: String(ga.hp.poblacion) },
  { k: 'Generaciones (máx.)', v: String(ga.hp.generaciones) },
  { k: 'Prob. cruce p_c', v: String(ga.hp.pCruce) },
  { k: 'Prob. mutación p_m', v: ga.hp.pMutacion },
  { k: 'Elitismo', v: String(ga.hp.elitismo) },
  { k: 'Criterio de parada', v: ga.hp.parada },
  { k: 'Convergencia (gen)', v: String(ga.hp.convergencia) },
  { k: 'Semilla', v: String(ga.hp.semilla) },
];

export function GA() {
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  // Pin the horizontal-scroll panel and convert vertical scroll into horizontal translation
  useGSAP(
    () => {
      const pinSection = pinSectionRef.current;
      const track = trackRef.current;
      if (!pinSection || !track) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;

      // Only pin on viewport widths big enough to host 7 cards horizontally
      const mql = window.matchMedia('(min-width: 768px)');
      if (!mql.matches) return;

      const ctx = gsap.context(() => {
        // Compute the distance the track must travel — i.e. its overflow on the X axis
        const getDistance = () => track.scrollWidth - pinSection.clientWidth;

        gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinSection,
            start: 'top top',
            end: () => `+=${getDistance() + window.innerHeight * 0.6}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }, pinSection);

      return () => ctx.revert();
    },
    { scope: pinSectionRef },
  );

  return (
    <section className="bg-cream relative py-32 md:py-40">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
          CAPÍTULO 05 · ALGORITMO GENÉTICO
        </div>

        <div className="mt-12 grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-8">
            <SplitReveal
              as="h2"
              className="font-display text-ink text-[clamp(2rem,4.6vw,3.8rem)] font-medium leading-[1.04]"
            >
              {`Una población. Cien y media de soluciones tentativas. Evolución hacia el mínimo.`}
            </SplitReveal>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p className="text-ink-soft mt-2 text-[15px] leading-relaxed md:text-base">
              El método metaheurístico no certifica optimalidad. A cambio explora el espacio
              combinatorio en segundos, no en minutos. La pregunta no es si llega al óptimo:
              es qué tan cerca llega y a qué costo.
            </p>
          </div>
        </div>
      </div>

      {/* Pin + horizontal track — full bleed for the pin section */}
      <div ref={pinSectionRef} className="relative mt-20 min-h-[100dvh] overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1320px] flex-col px-6 md:px-10">
          <div className="text-ink-faint font-mono mb-10 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
            <span>Flujo del algoritmo</span>
            <span>7 etapas · scroll para avanzar</span>
          </div>

          <div className="border-hairline border-t pt-10" />

          <div className="flex flex-1 items-center">
            <ol
              ref={trackRef}
              className="flex gap-5 will-change-transform md:gap-7"
            >
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="bg-paper ring-hairline w-[300px] shrink-0 rounded-[1.25rem] p-6 ring-1 md:w-[360px] md:p-8"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono tnum text-ink-faint text-[11px] tracking-[0.12em]">
                      {s.n}
                    </span>
                    <span className="bg-ink/30 h-px w-8" aria-hidden />
                  </div>
                  <h3 className="font-display text-ink mt-5 text-xl leading-tight md:text-[1.4rem]">
                    {s.title}
                  </h3>
                  <p className="text-ink-soft mt-3 text-[13px] leading-relaxed md:text-[13.5px]">
                    {s.body}
                  </p>
                  <div className="border-hairline mt-5 border-t pt-3">
                    <span className="font-mono tnum text-ink-faint text-[10px] uppercase tracking-[0.18em]">
                      {s.meta}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Mobile fallback — show steps stacked when no pin (md:hidden so they don't dup desktop) */}
      <div className="mx-auto max-w-[1320px] px-6 md:hidden">
        <ol className="mt-12 grid grid-cols-1 gap-5">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="bg-paper ring-hairline rounded-[1.25rem] p-5 ring-1"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono tnum text-ink-faint text-[11px] tracking-[0.12em]">
                  {s.n}
                </span>
                <span className="bg-ink/30 h-px w-8" aria-hidden />
              </div>
              <h3 className="font-display text-ink mt-5 text-xl leading-tight">
                {s.title}
              </h3>
              <p className="text-ink-soft mt-3 text-[12.5px] leading-relaxed">{s.body}</p>
              <div className="border-hairline mt-5 border-t pt-3">
                <span className="font-mono tnum text-ink-faint text-[10px] uppercase tracking-[0.18em]">
                  {s.meta}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="mt-24 grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-5">
            <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
              Hiperparámetros
            </div>
            <dl className="border-hairline mt-6 border-t">
              {HYPER.map((row) => (
                <div
                  key={row.k}
                  className="border-hairline grid grid-cols-2 gap-6 border-b py-3.5"
                >
                  <dt className="text-ink-soft text-[13px]">{row.k}</dt>
                  <dd className="text-ink font-mono tnum text-right text-[13px]">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
              Resultado · seed 13
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6">
              <Metric
                eyebrow="Costo"
                value={formatMoney(ga.costo)}
                caption="mejor encontrada"
                accent
              />
              <Metric eyebrow="|S| Antenas" value={String(ga.antenas)} caption="activadas" />
              <Metric
                eyebrow="Tiempo"
                value={`${formatNumber(ga.tiempo, 2)}s`}
                caption={`speedup ×${ga.speedup}`}
              />
              <Metric
                eyebrow="Gap vs ILP"
                value={`+${formatNumber(ga.gap, 2)}%`}
                caption="distancia al mejor entero"
              />
            </div>

            <blockquote className="border-hairline mt-12 border-t pt-8">
              <p className="font-display text-ink text-2xl leading-snug md:text-3xl">
                “Mejor semilla. <span className="text-accent">seed 13</span>. Convergió en{' '}
                <span className="tnum">gen 95</span>.”
              </p>
              <footer className="text-ink-faint font-mono mt-4 text-[10px] uppercase tracking-[0.22em]">
                Bitácora de corridas · 5 semillas
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GA;
