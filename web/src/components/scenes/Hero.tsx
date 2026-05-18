'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { cn } from '@/lib/utils';

/**
 * Hero — Capítulo 01
 * Editorial split layout, NOT centered.
 * Mouse parallax on decorative typographic mark + dot matrix.
 * H1 manually word-split + animated via useGSAP so the inline italic span survives.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  // Headline reveal — runs once on mount, no scroll trigger needed (above fold)
  useEffect(() => {
    const head = headlineRef.current;
    if (!head) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(head.querySelectorAll('[data-word]'), { opacity: 1, yPercent: 0, filter: 'blur(0px)' });
      return;
    }

    const words = head.querySelectorAll('[data-word]');
    gsap.set(words, { yPercent: 110, opacity: 0, filter: 'blur(8px)' });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.055,
      delay: 0.15,
    });
  }, []);

  // Mouse parallax — ONE window listener, gated by reduced-motion + coarse pointer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const mark = markRef.current;
    const dots = dotsRef.current;
    if (!mark || !dots) return;

    const markX = gsap.quickTo(mark, 'x', { duration: 1.4, ease: 'expo.out' });
    const markY = gsap.quickTo(mark, 'y', { duration: 1.4, ease: 'expo.out' });
    const dotsX = gsap.quickTo(dots, 'x', { duration: 1.1, ease: 'expo.out' });
    const dotsY = gsap.quickTo(dots, 'y', { duration: 1.1, ease: 'expo.out' });

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      markX(dx * 28);
      markY(dy * 18);
      dotsX(dx * -12);
      dotsY(dy * -8);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-cream"
    >
      {/* Decorative dot matrix — back layer */}
      <div
        ref={dotsRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] will-change-transform"
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="fill-ink-faint" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      {/* Oversized "500" decorative mark — top-right */}
      <div
        ref={markRef}
        aria-hidden
        className="pointer-events-none absolute -right-[6vw] top-[4vh] select-none font-display text-ink leading-[0.78] opacity-[0.055] will-change-transform"
      >
        <span className="block rotate-[-6deg] text-[42vw] tracking-[-0.06em]">500</span>
      </div>

      {/* Eyebrow top-left */}
      <div className="absolute left-6 top-8 md:left-12 md:top-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          INVESTIGACIÓN DE OPERACIONES · UNAB 2026 · CAPÍTULO 01
        </span>
      </div>

      {/* Top-right meta */}
      <div className="absolute right-6 top-8 hidden md:block md:right-12 md:top-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          SET COVER · 500 × 500
        </span>
      </div>

      {/* Main grid */}
      <div className="relative grid min-h-[100dvh] grid-cols-12 items-center gap-x-6 px-6 pb-24 pt-32 md:gap-x-8 md:px-12 md:pb-32 md:pt-40">
        {/* Headline + subhead — offset, asymmetric */}
        <div className="col-span-12 md:col-start-2 md:col-span-9 lg:col-start-2 lg:col-span-8">
          <h1
            ref={headlineRef}
            className="font-display text-ink text-[clamp(2.6rem,7vw,6.5rem)] font-normal leading-[0.96] tracking-[-0.04em]"
          >
            <span className="block overflow-hidden">
              <span data-word className="inline-block will-change-transform">Cubrir&nbsp;</span>
              <em data-word className="inline-block font-light italic text-ink-soft will-change-transform">500&nbsp;clientes</em>
            </span>
            <span className="block overflow-hidden">
              <span data-word className="inline-block will-change-transform">con&nbsp;</span>
              <span data-word className="inline-block will-change-transform">el&nbsp;</span>
              <span data-word className="inline-block will-change-transform">costo&nbsp;</span>
              <span data-word className="inline-block will-change-transform">mínimo&nbsp;</span>
              <span data-word className="inline-block will-change-transform">posible.</span>
            </span>
          </h1>

          <p className="mt-10 max-w-[58ch] font-body text-base leading-[1.55] text-ink-soft md:mt-12 md:text-lg">
            Un problema NP-difícil del paper de Karp resuelto con dos métodos opuestos:
            Branch &amp; Bound exacto y un Algoritmo Genético.
            La diferencia: 83 veces más rápido por solo 1.61% de gap.
          </p>
        </div>

        {/* Asymmetric inline metrics row */}
        <div className="col-span-12 mt-16 md:col-start-2 md:col-span-10 md:mt-20 lg:col-start-2 lg:col-span-9">
          <div className="grid grid-cols-1 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-3 sm:gap-x-8">
            {/* Block 1 — slight indent */}
            <div className="sm:pl-0">
              <div className="font-mono tnum text-[clamp(1.6rem,2.8vw,2.4rem)] font-light leading-none text-ink">
                $49,988
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                PLE Branch &amp; Bound · 600.96 s
              </div>
            </div>
            {/* Block 2 — pushed right */}
            <div className="sm:pl-6">
              <div className="font-mono tnum text-[clamp(1.6rem,2.8vw,2.4rem)] font-light leading-none text-ink">
                22 / 23
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                antenas activadas · exacto / GA
              </div>
            </div>
            {/* Block 3 — accent on the speed */}
            <div className="sm:pl-12">
              <div className="font-mono tnum text-[clamp(1.6rem,2.8vw,2.4rem)] font-light leading-none text-accent">
                7.23 s
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                Algoritmo Genético
              </div>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="col-span-12 mt-16 flex flex-col items-start gap-6 md:col-start-2 md:col-span-10 md:mt-20 md:flex-row md:items-center md:gap-10">
          <MagneticButton aria-label="Recorrer el estudio">
            <span>Recorrer el estudio</span>
            <span aria-hidden className="ml-1">↓</span>
          </MagneticButton>
          <a
            href="#paper"
            className={cn(
              'group font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft',
              'underline decoration-hairline decoration-[1px] underline-offset-[6px]',
              'transition-colors duration-300 ease-[var(--ease-apple)] hover:text-ink hover:decoration-ink',
            )}
          >
            Ver el paper completo →
          </a>
        </div>
      </div>

      {/* Authors footer of hero */}
      <div className="absolute inset-x-0 bottom-8 px-6 md:bottom-10 md:px-12">
        <div className="flex items-center justify-between border-t border-hairline pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            NICOLÁS MORENO  ·  JULIAN ARTEAGA  ·  MAYO 2026
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint md:inline">
            01 / 10
          </span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
