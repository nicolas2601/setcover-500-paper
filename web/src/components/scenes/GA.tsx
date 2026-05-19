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
  /** Visual aid — minimal SVG diagram rendered inside the right column footer area. */
  visual: 'seed' | 'fitness' | 'select' | 'cross' | 'mutate' | 'elite' | 'patience';
};

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Inicialización',
    body: 'Población de 150 cromosomas binarios. Cada cromosoma es un subconjunto S de antenas candidatas. Semilla controlada para reproducibilidad.',
    meta: 'pop = 150',
    visual: 'seed',
  },
  {
    n: '02',
    title: 'Evaluación',
    body: 'Función de fitness penalizada. Costo total de S más penalización por clientes no cubiertos. Empuja hacia soluciones factibles.',
    meta: 'fitness = Σc + λ · faltantes',
    visual: 'fitness',
  },
  {
    n: '03',
    title: 'Selección',
    body: 'Torneo binario. Dos cromosomas al azar, gana el de menor fitness. Mantiene presión selectiva sin colapsar diversidad temprana.',
    meta: 'torneo k = 2',
    visual: 'select',
  },
  {
    n: '04',
    title: 'Cruce',
    body: 'Recombinación uniforme con probabilidad alta. Cada gen se hereda del padre A o B con probabilidad equitativa cuando hay cruce.',
    meta: 'p_c = 0.9',
    visual: 'cross',
  },
  {
    n: '05',
    title: 'Mutación',
    body: 'Bit-flip adaptativo. Empieza agresiva para explorar, decae para explotar. Cuida no perturbar al élite cuando el frente ya está pulido.',
    meta: 'p_m: 3% → 0.5%',
    visual: 'mutate',
  },
  {
    n: '06',
    title: 'Elitismo',
    body: 'Las tres mejores soluciones pasan intactas a la siguiente generación. Garantiza monotonía: la mejor fitness nunca empeora generación a generación.',
    meta: 'elite = 3',
    visual: 'elite',
  },
  {
    n: '07',
    title: 'Estancamiento',
    body: 'Si la mejor solución no mejora durante 80 generaciones seguidas, el bucle termina. Ahorra evaluaciones cuando el frente ya está estable.',
    meta: 'paciencia = 80 gens',
    visual: 'patience',
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

/* ──────────────────────────────────────────────────────────────────────
   Per-panel mini visual aids. All SVG, no inline style, stroke-based,
   sized via parent. Each visual is a small editorial sketch that
   illustrates the concept of that step.
   ────────────────────────────────────────────────────────────────────── */

function StepVisual({ kind }: { kind: Step['visual'] }) {
  // Common: 200×120 viewbox, hairline strokes, accent for highlights.
  const common = 'h-28 w-full text-ink/30 md:h-32';
  switch (kind) {
    case 'seed':
      // 6 small circles in a loose grid — population of solutions.
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => {
            const c = i % 6;
            const r = Math.floor(i / 6);
            const cx = 18 + c * 32;
            const cy = 22 + r * 32;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={3.5}
                fill="currentColor"
                opacity={(i % 5) / 6 + 0.25}
              />
            );
          })}
        </svg>
      );
    case 'fitness':
      // Histogram-like bars descending — fitness landscape.
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          {[78, 62, 50, 42, 36, 30, 26, 22, 20, 18].map((h, i) => (
            <rect
              key={i}
              x={10 + i * 18}
              y={108 - h}
              width={12}
              height={h}
              fill="currentColor"
              opacity={0.4 + i * 0.05}
            />
          ))}
        </svg>
      );
    case 'select':
      // Two circles → one trophy-ish circle.
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="40" cy="80" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 60 60 L 130 60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="160" cy="60" r="18" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <text
            x="160"
            y="65"
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fill="currentColor"
          >
            ★
          </text>
        </svg>
      );
    case 'cross':
      // Two bit strings merging into one (interleaved).
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          {/* Parent A row */}
          {[0, 1, 1, 0, 1, 0, 1, 1].map((b, i) => (
            <rect
              key={`a${i}`}
              x={20 + i * 12}
              y={22}
              width={9}
              height={9}
              fill={b ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="0.8"
              opacity={0.6}
            />
          ))}
          {/* Parent B row */}
          {[1, 0, 1, 1, 0, 1, 0, 0].map((b, i) => (
            <rect
              key={`b${i}`}
              x={20 + i * 12}
              y={50}
              width={9}
              height={9}
              fill={b ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="0.8"
              opacity={0.6}
            />
          ))}
          {/* Child row (uniform mix) */}
          {[1, 1, 1, 0, 1, 1, 1, 0].map((b, i) => (
            <rect
              key={`c${i}`}
              x={20 + i * 12}
              y={86}
              width={9}
              height={9}
              fill={b ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.1"
              opacity={0.95}
            />
          ))}
        </svg>
      );
    case 'mutate':
      // Single bit string with one highlighted flipped bit.
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          {[1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1].map((b, i) => (
            <rect
              key={i}
              x={12 + i * 14}
              y={52}
              width={11}
              height={11}
              fill={b ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={i === 5 ? '1.6' : '0.8'}
              className={i === 5 ? 'text-accent' : ''}
              opacity={i === 5 ? 1 : 0.55}
            />
          ))}
          <text
            x={12 + 5 * 14 + 5.5}
            y={42}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono)"
            className="text-accent"
            fill="currentColor"
          >
            flip
          </text>
        </svg>
      );
    case 'elite':
      // 3 highlighted stars + dim cloud.
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => {
            const cx = 12 + (i % 8) * 24;
            const cy = 18 + Math.floor(i / 8) * 28;
            return <circle key={i} cx={cx} cy={cy} r={2} fill="currentColor" opacity={0.25} />;
          })}
          {[
            { cx: 50, cy: 60 },
            { cx: 100, cy: 38 },
            { cx: 150, cy: 76 },
          ].map((p, i) => (
            <g key={i} className="text-accent">
              <circle cx={p.cx} cy={p.cy} r={9} fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx={p.cx} cy={p.cy} r={3.5} fill="currentColor" />
            </g>
          ))}
        </svg>
      );
    case 'patience':
      // Plateau line — descends then flattens.
      return (
        <svg viewBox="0 0 200 120" className={common} aria-hidden>
          <path
            d="M 8 30 L 30 38 L 52 50 L 74 64 L 96 78 L 118 86 L 140 90 L 162 91 L 184 91"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity={0.65}
          />
          <path
            d="M 118 86 L 184 91"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="2 4"
            className="text-accent"
          />
          <circle cx={184} cy={91} r={3.5} fill="currentColor" className="text-accent" />
        </svg>
      );
  }
}

/* ──────────────────────────────────────────────────────────────────────
   Big panel — full-bleed 90vh editorial section. Numerator left, content
   right. Pinned individually so the user enters, dwells, then exits.
   ────────────────────────────────────────────────────────────────────── */

type PanelProps = {
  step: Step;
  index: number;
  total: number;
};

function GAPanel({ step, index, total }: PanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const elitesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const num = numRef.current;
      const title = titleRef.current;
      const body = bodyRef.current;
      const meta = metaRef.current;
      const visual = visualRef.current;
      if (!panel || !num || !title || !body || !meta || !visual) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const allowPin = window.matchMedia('(min-width: 768px)').matches && !reduce;

      // ── Reduced motion / mobile — render statically, mark the panel as
      // active when it crosses the viewport (so the side rail still tracks).
      if (!allowPin) {
        gsap.set([num, title, body, meta, visual], { opacity: 1, y: 0, scale: 1 });
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => panel.setAttribute('data-active', 'true'),
          onLeave: () => panel.removeAttribute('data-active'),
          onEnterBack: () => panel.setAttribute('data-active', 'true'),
          onLeaveBack: () => panel.removeAttribute('data-active'),
        });
        return;
      }

      // ── Initial states ────────────────────────────────────────────────
      gsap.set(num, { opacity: 0, scale: 0.92, yPercent: 6 });
      gsap.set(title, { opacity: 0, yPercent: 30 });
      gsap.set(body, { opacity: 0, y: 18 });
      gsap.set(meta, { opacity: 0, y: 10 });
      gsap.set(visual, { opacity: 0, y: 20 });

      // ── Entry timeline: pinned, scrubbed reveal of inner content ─────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: 'top top',
          end: '+=70%',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => panel.setAttribute('data-active', 'true'),
          onEnterBack: () => panel.setAttribute('data-active', 'true'),
          onLeave: () => panel.removeAttribute('data-active'),
          onLeaveBack: () => panel.removeAttribute('data-active'),
        },
      });

      tl.to(num, { opacity: 1, scale: 1.08, yPercent: 0, ease: 'expo.out', duration: 0.6 }, 0)
        .to(title, { opacity: 1, yPercent: 0, ease: 'expo.out', duration: 0.55 }, 0.05)
        .to(body, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.5 }, 0.15)
        .to(visual, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.5 }, 0.2)
        .to(meta, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.45 }, 0.25)
        // Sustained — slow drift inward, then begin the exit.
        .to(num, { scale: 1.02, ease: 'sine.inOut', duration: 0.4 }, 0.55)
        .to([title, body, meta, visual], { opacity: 0, y: -14, ease: 'power3.in', duration: 0.4 }, 0.7)
        .to(num, { opacity: 0, scale: 0.97, ease: 'power3.in', duration: 0.4 }, 0.72);

      // ── Surprise 06 · Elitismo: orbit the 3 highlighted nodes while pinned
      if (step.visual === 'elite' && elitesRef.current) {
        const stars = elitesRef.current.querySelectorAll<HTMLSpanElement>('[data-elite-star]');
        if (stars.length) {
          gsap.set(stars, { opacity: 0, scale: 0.5 });
          gsap.to(stars, {
            opacity: 1,
            scale: 1,
            ease: 'back.out(1.7)',
            stagger: 0.18,
            duration: 0.7,
            scrollTrigger: {
              trigger: panel,
              start: 'top top',
              toggleActions: 'play none none reverse',
            },
          });
          // Slow constellation drift — pure transform.
          stars.forEach((star, i) => {
            const sign = i % 2 === 0 ? 1 : -1;
            gsap.to(star, {
              y: sign * 12,
              x: sign * -6,
              rotation: sign * 8,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              duration: 4 + i * 0.6,
            });
          });
        }
      }

      // ── Surprise 07 · Estancamiento: counter ticks 0/80 → 80/80 while pinned
      if (step.visual === 'patience' && counterRef.current) {
        const node = counterRef.current;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: 80,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: panel,
            start: 'top top',
            end: '+=70%',
            scrub: 0.8,
          },
          onUpdate: () => {
            node.textContent = `${Math.round(obj.v).toString().padStart(2, '0')} / 80`;
          },
        });
      }
    },
    { scope: panelRef, dependencies: [step.n] },
  );

  return (
    <section
      ref={panelRef}
      data-ga-panel={step.n}
      data-ga-index={index}
      data-ga-visual={step.visual}
      className={cn(
        'ga-panel relative flex min-h-[100dvh] items-center overflow-hidden',
        // Soft tonal alternation — odd panels on cream, even on paper.
        index % 2 === 0 ? 'bg-cream' : 'bg-paper',
      )}
    >
      {/* Hairline top — feels like a chapter break inside the GA macro section */}
      <span aria-hidden className="border-hairline absolute inset-x-0 top-0 border-t opacity-60" />

      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-12 gap-6 px-8 py-24 md:gap-12 md:px-16 md:py-28 xl:px-24">
        {/* Numerator column — huge editorial watermark */}
        <div className="relative col-span-12 md:col-span-5">
          <div
            ref={numRef}
            className="font-display tnum text-accent/15 leading-[0.85] text-[clamp(8rem,18vw,16rem)] select-none"
            aria-hidden
          >
            {step.n}
          </div>
          <div className="text-ink-faint font-mono mt-4 text-[10px] uppercase tracking-[0.22em] md:mt-6">
            ETAPA {index + 1} DE {total}
          </div>
        </div>

        {/* Content column */}
        <div className="relative col-span-12 flex flex-col justify-center md:col-span-7">
          <h3
            ref={titleRef}
            className="font-display text-ink text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.95]"
          >
            {step.title}
          </h3>

          <p
            ref={bodyRef}
            className="text-ink-soft mt-8 max-w-2xl text-lg leading-relaxed md:mt-10 md:text-xl"
          >
            {step.body}
          </p>

          {/* Visual aid + meta param sit side-by-side at the bottom */}
          <div ref={visualRef} className="mt-12 grid grid-cols-12 items-end gap-6 md:mt-16">
            <div className="col-span-12 md:col-span-7">
              <div className="text-ink-faint font-mono mb-3 text-[10px] uppercase tracking-[0.22em]">
                Esquema
              </div>
              <StepVisual kind={step.visual} />
            </div>

            <div ref={metaRef} className="col-span-12 md:col-span-5">
              <div className="text-ink-faint font-mono mb-3 text-[10px] uppercase tracking-[0.22em]">
                Parámetro
              </div>
              <div className="font-mono tnum text-ink rounded-[1rem] bg-surface/60 px-4 py-3 text-sm md:text-base">
                {step.meta}
              </div>
            </div>
          </div>

          {/* ── Surprise overlays per panel ─────────────────────────── */}
          {step.visual === 'elite' && (
            <div
              ref={elitesRef}
              aria-hidden
              className="pointer-events-none absolute -right-6 top-4 hidden gap-6 md:flex"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  data-elite-star
                  className="text-accent font-display tnum text-3xl leading-none"
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {step.visual === 'patience' && (
            <div className="border-hairline mt-10 border-t pt-6">
              <div className="text-ink-faint font-mono mb-2 text-[10px] uppercase tracking-[0.22em]">
                Paciencia
              </div>
              <span
                ref={counterRef}
                className="font-display tnum text-accent text-[clamp(3rem,7vw,6rem)] leading-none"
              >
                00 / 80
              </span>
              <div className="text-ink-soft font-mono mt-3 text-[11px] uppercase tracking-[0.18em]">
                generaciones sin mejora
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Side rail — fixed dot column tracking the active panel. Uses
   data-active attribute on each panel as the source of truth.
   ────────────────────────────────────────────────────────────────────── */

function GASideRail({ total }: { total: number }) {
  const railRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rail = railRef.current;
      if (!rail) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;

      const dots = Array.from(rail.querySelectorAll<HTMLLIElement>('[data-rail-dot]'));
      if (!dots.length) return;

      // One global trigger covers the whole flow; on update we read
      // data-active from each panel — no scroll listener needed.
      ScrollTrigger.create({
        trigger: '[data-ga-flow]',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => {
          const panels = document.querySelectorAll<HTMLElement>('[data-ga-panel]');
          let activeIndex = -1;
          panels.forEach((p, i) => {
            if (p.getAttribute('data-active') === 'true') activeIndex = i;
          });
          dots.forEach((dot, i) => {
            dot.setAttribute(
              'data-state',
              i === activeIndex ? 'active' : i < activeIndex ? 'done' : 'pending',
            );
          });
          // Fade the whole rail in/out based on whether the flow is in view.
          const flow = document.querySelector<HTMLElement>('[data-ga-flow]');
          if (flow) {
            const r = flow.getBoundingClientRect();
            const visible = r.bottom > 60 && r.top < window.innerHeight - 60;
            rail.setAttribute('data-visible', visible ? 'true' : 'false');
          }
        },
      });
    },
    { scope: railRef },
  );

  return (
    <aside
      ref={railRef}
      data-visible="false"
      aria-hidden
      className={cn(
        'pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 md:block',
        'data-[visible=true]:opacity-100 data-[visible=false]:opacity-0',
      )}
    >
      <ol className="relative flex flex-col items-center gap-4">
        {/* Hairline connector behind the dots */}
        <span
          aria-hidden
          className="bg-ink/15 absolute left-1/2 top-1 h-[calc(100%-0.5rem)] w-px -translate-x-1/2"
        />
        {Array.from({ length: total }).map((_, i) => (
          <li
            key={i}
            data-rail-dot
            data-state="pending"
            className="group relative z-10 flex items-center gap-3"
          >
            <span className="font-mono tnum text-ink-faint w-6 text-right text-[9px] uppercase tracking-[0.18em] opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'block rounded-full border transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
                'border-ink/30 size-2',
                'group-data-[state=done]:bg-ink group-data-[state=done]:border-ink',
                'group-data-[state=active]:bg-accent group-data-[state=active]:border-accent group-data-[state=active]:size-3',
              )}
            />
          </li>
        ))}
      </ol>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Main scene
   ────────────────────────────────────────────────────────────────────── */

export function GA() {
  return (
    <section
      data-scene="05"
      aria-label="Capítulo 05 · Algoritmo Genético"
      className="bg-cream relative"
    >
      {/* Intro — non-pinned editorial heading */}
      <div className="mx-auto max-w-[1680px] px-8 py-32 md:px-16 md:py-40 xl:px-24">
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

        <div className="border-hairline mt-16 flex items-center justify-between border-t pt-6">
          <span className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
            Flujo del algoritmo
          </span>
          <span className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
            7 etapas · scroll vertical
          </span>
        </div>
      </div>

      {/* Pinned panel flow — vertical, one-by-one */}
      <div data-ga-flow className="relative">
        {STEPS.map((s, i) => (
          <GAPanel key={s.n} step={s} index={i} total={STEPS.length} />
        ))}
      </div>

      {/* Side rail (desktop only) */}
      <GASideRail total={STEPS.length} />

      {/* Hyperparameters + results — preserved, normal-flow outro */}
      <div className="mx-auto max-w-[1680px] px-8 md:px-16 xl:px-24">
        <div className="mt-24 grid grid-cols-12 gap-8 md:gap-12 md:mt-32">
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

        {/* bottom breathing room before the next scene */}
        <div className="h-32 md:h-40" />
      </div>
    </section>
  );
}

export default GA;
