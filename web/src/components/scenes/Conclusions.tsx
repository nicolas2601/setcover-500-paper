'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { MagneticButton } from '@/components/motion/MagneticButton';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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
  const accentLineRef = useRef<HTMLHeadingElement>(null);

  // Special "settle" treatment for the accent line — after its normal reveal
  // finishes, each char does a subtle yPercent 0 → -8 → 0 micro-overshoot
  // that signals "this is THE point of the section".
  useGSAP(
    () => {
      const head = accentLineRef.current;
      if (!head) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const split = new SplitType(head, { types: 'chars,words' });
      const chars = split.chars;
      if (!chars) return;

      gsap.set(chars, { yPercent: 110, opacity: 0, filter: 'blur(14px)' });

      ScrollTrigger.create({
        trigger: head,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ delay: 0.5 });
          tl.to(chars, {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.8,
            ease: 'expo.out',
            stagger: 0.028,
          });
          // Settle overshoot — each char dips up to -8% then returns
          tl.to(
            chars,
            {
              yPercent: -8,
              duration: 0.45,
              ease: 'expo.out',
              stagger: 0.012,
            },
            '-=0.2',
          );
          tl.to(
            chars,
            {
              yPercent: 0,
              duration: 0.9,
              ease: 'elastic.out(1, 0.5)',
              stagger: 0.012,
            },
            '>-0.1',
          );
        },
      });

      return () => {
        split.revert();
      };
    },
    { scope: accentLineRef },
  );

  return (
    <section
      data-scene="09"
      aria-label="Capítulo 09 · Conclusiones"
      className="bg-cream py-48 md:py-56"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-16 xl:px-24">
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
            delay={0.25}
          >
            el exacto no es óptimo,
          </SplitReveal>
          {/* The accent line is rendered with custom timeline for the settle effect.
              We mark it overflow-hidden manually (SplitReveal adds it normally). */}
          <h2
            ref={accentLineRef}
            className="overflow-hidden font-display text-5xl leading-[0.95] text-accent md:text-7xl"
          >
            el genético no es perfecto.
          </h2>
          <SplitReveal
            as="h2"
            className="font-display text-5xl leading-[0.95] text-ink md:text-7xl"
            delay={0.75}
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

        {/* Pull quote — editorial blockquote with oversized typographic marks
            sitting behind the text (text-accent/20, font-display, leading-none)
            and a proper cite line below. */}
        <figure className="relative mx-auto mt-32 max-w-4xl text-center" data-cursor-text>
          {/* Opening mark — top-left, oversized, decorative. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-12 select-none font-display text-[8rem] leading-none text-accent/20 md:-left-10 md:-top-20 md:text-[12rem]"
          >
            “
          </span>
          {/* Closing mark — bottom-right. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-2 select-none font-display text-[8rem] leading-none text-accent/20 md:-bottom-32 md:-right-10 md:text-[12rem]"
          >
            ”
          </span>

          <blockquote className="relative font-display text-4xl italic leading-[1.1] text-ink md:text-6xl">
            El mejor algoritmo no existe; existe el algoritmo que resuelve tu restricción más
            cara.
          </blockquote>
          <figcaption className="relative mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            <cite className="not-italic">Nicolás Moreno + Julian Arteaga</cite>
            <span aria-hidden className="mx-2 text-ink-faint/60">·</span>
            <span>UNAB 2026</span>
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
            data-link
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors duration-300 ease-[var(--ease-apple)] hover:text-ink"
          >
            <span>Ver el código en MATLAB</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-[var(--ease-apple)] group-hover:translate-x-1"
            >
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
