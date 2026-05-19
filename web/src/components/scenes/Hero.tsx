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
      gsap.set(head.querySelectorAll('[data-word]'), {
        opacity: 1,
        yPercent: 0,
        y: 0,
        filter: 'blur(0px)',
      });
      return;
    }

    const words = head.querySelectorAll('[data-word]');
    gsap.set(words, { yPercent: 110, y: 24, opacity: 0, filter: 'blur(14px)' });
    gsap.to(words, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.6,
      ease: 'expo.out',
      stagger: 0.06,
      delay: 0.18,
    });
  }, []);

  // Ambient pulse on the decorative "500" — extremely slow, sine yoyo
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const mark = markRef.current;
    if (!mark) return;
    const deco = mark.querySelector<HTMLElement>('.deco-500');
    if (!deco) return;

    const tween = gsap.to(deco, {
      rotate: '+=2',
      duration: 18,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    return () => {
      tween.kill();
    };
  }, []);

  // Mouse parallax — ONE window listener, gated by reduced-motion + coarse pointer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const mark = markRef.current;
    const dots = dotsRef.current;
    if (!mark || !dots) return;

    const markX = gsap.quickTo(mark, 'x', { duration: 2.0, ease: 'expo.out' });
    const markY = gsap.quickTo(mark, 'y', { duration: 2.0, ease: 'expo.out' });
    const dotsX = gsap.quickTo(dots, 'x', { duration: 2.0, ease: 'expo.out' });
    const dotsY = gsap.quickTo(dots, 'y', { duration: 2.0, ease: 'expo.out' });

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      // 3-layer parallax: mark = front, dots = back. Strengths tuned per spec.
      markX(dx * 48);
      markY(dy * 32);
      dotsX(dx * -18);
      dotsY(dy * -12);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="main"
      data-scene="01"
      aria-label="Capítulo 01 · Hero"
      className="relative min-h-[100dvh] w-full overflow-hidden bg-cream"
    >
      {/* Decorative dot matrix — back layer */}
      <div
        ref={dotsRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] will-change-transform"
      >
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          role="img"
          aria-label="Patrón decorativo de puntos"
        >
          <title>Patrón decorativo de puntos</title>
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="fill-ink-faint" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      {/* Oversized "500" decorative mark — top-right.
          On sm- it floods the canvas (80vw) so it still reads as a graphic
          mark; from md+ it relaxes back to the editorial 58vw. */}
      <div
        ref={markRef}
        aria-hidden
        className="pointer-events-none absolute -right-[6vw] top-[4vh] select-none font-display text-ink leading-[0.78] opacity-[0.055] will-change-transform"
      >
        <span className="deco-500 block rotate-[-6deg] text-[80vw] tracking-[-0.06em] will-change-transform sm:text-[68vw] md:text-[58vw]">500</span>
      </div>

      {/* Eyebrow top-left */}
      <div className="absolute left-5 top-6 sm:left-8 sm:top-8 md:left-16 md:top-12 xl:left-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint sm:text-[11px] md:text-[12px]">
          INVESTIGACIÓN DE OPERACIONES · UNAB 2026 · CAPÍTULO 01
        </span>
      </div>

      {/* Top-right meta lives in <SceneNumber /> mounted from layout.tsx. */}

      {/* Main grid — full-bleed editorial */}
      <div className="relative mx-auto grid min-h-[100dvh] max-w-none grid-cols-12 items-center gap-x-6 px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 md:gap-x-8 md:px-16 md:pb-32 md:pt-40 xl:px-24">
        {/* Headline + subhead — wider, occupies more of the canvas */}
        <div className="col-span-12 md:col-start-1 md:col-span-11">
          <h1
            ref={headlineRef}
            className="font-display text-ink text-[clamp(2.25rem,9vw,7rem)] font-normal leading-[0.96] tracking-[-0.04em]"
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

          <p className="mt-8 max-w-[58ch] font-body text-base leading-[1.55] text-ink-soft sm:mt-10 md:mt-12 md:text-lg xl:text-xl">
            Un problema NP-difícil del paper de Karp resuelto con dos métodos opuestos:
            Branch &amp; Bound exacto y un Algoritmo Genético.
            La diferencia: 83 veces más rápido por solo 1.61% de gap.
          </p>
        </div>

        {/* Asymmetric inline metrics row — full canvas width, justify-between.
            On sm- they stack so each value gets the room it needs to dominate. */}
        <div className="col-span-12 mt-14 sm:mt-16 md:mt-20">
          <div className="flex flex-col gap-y-8 border-t border-hairline pt-8 md:flex-row md:items-end md:justify-between md:gap-x-12">
            {/* Block 1 — left edge */}
            <div className="md:flex-1">
              <div className="font-display tnum text-4xl font-normal leading-[0.95] text-ink md:text-5xl xl:text-6xl">
                $49,988
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:text-[12px]">
                PLE Branch &amp; Bound · 600.96 s
              </div>
            </div>
            {/* Block 2 — center */}
            <div className="md:flex-1 md:text-center">
              <div className="font-display tnum text-4xl font-normal leading-[0.95] text-ink md:text-5xl xl:text-6xl">
                22 / 23
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:text-[12px]">
                antenas activadas · exacto / GA
              </div>
            </div>
            {/* Block 3 — right edge, accent on speed */}
            <div className="md:flex-1 md:text-right">
              <div className="font-display tnum text-4xl font-normal leading-[0.95] text-accent md:text-5xl xl:text-6xl">
                7.23 s
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:text-[12px]">
                Algoritmo Genético
              </div>
            </div>
          </div>
        </div>

        {/* CTA row — full-width buttons on sm- so touch targets stay generous */}
        <div className="col-span-12 mt-14 flex flex-col items-stretch gap-6 sm:items-start sm:mt-16 md:mt-20 md:flex-row md:items-center md:gap-10">
          <MagneticButton
            aria-label="Recorrer el estudio"
            className="w-full justify-center sm:w-auto"
          >
            <span>Recorrer el estudio</span>
            <span aria-hidden className="ml-1">↓</span>
          </MagneticButton>
          <a
            href="#paper"
            data-link
            className={cn(
              'group inline-flex min-h-[44px] items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft',
              'underline decoration-hairline decoration-[1px] underline-offset-[6px]',
              'transition-colors duration-300 ease-[var(--ease-apple)] hover:text-ink hover:decoration-ink',
            )}
          >
            <span>Ver el paper completo</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-[var(--ease-apple)] group-hover:translate-x-1"
            >
              ↗
            </span>
          </a>
        </div>
      </div>

      {/* Authors footer of hero — scene number lives in <SceneNumber /> globally. */}
      <div className="absolute inset-x-0 bottom-6 px-5 sm:bottom-8 sm:px-8 md:bottom-10 md:px-16 xl:px-24">
        <div className="flex items-center justify-between border-t border-hairline pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint sm:text-[11px]">
            NICOLÁS MORENO  ·  JULIAN ARTEAGA  ·  MAYO 2026
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint md:inline">
            SET COVER · 500 × 500
          </span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
