'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { meta } from '@/data/setcover';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MARQUEE_TEXT =
  'SET COVER 500×500 · INVESTIGACIÓN DE OPERACIONES · UNAB 2026 · NICOLÁS MORENO · JULIAN ARTEAGA · ';

export function SiteFooter() {
  return (
    <footer
      data-scene="10"
      aria-label="Capítulo 10 · Créditos y enlaces"
      className="bg-ink text-cream"
    >
      <Marquee />

      <div className="mx-auto max-w-[1680px] px-8 py-24 md:px-16 md:py-32 xl:px-24">
        <div className="grid grid-cols-12 gap-10">
          {/* Autores */}
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50">
              Autores
            </p>
            <ul className="mt-6 space-y-3">
              {meta.autores.map((a) => (
                <li key={a} className="font-display text-2xl leading-tight text-cream">
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cream/60">UNAB · Bucaramanga</p>
          </div>

          {/* Proyecto */}
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50">
              Proyecto
            </p>
            <ul className="mt-6 space-y-3 text-base">
              <li>
                <a
                  href="#paper"
                  data-link
                  className="group inline-flex items-center gap-1.5 text-cream transition-colors duration-300 ease-[var(--ease-apple)] hover:text-cream/70"
                >
                  <span>Paper IEEE</span>
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-[var(--ease-apple)] group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#code"
                  data-link
                  className="group inline-flex items-center gap-1.5 text-cream transition-colors duration-300 ease-[var(--ease-apple)] hover:text-cream/70"
                >
                  <span>Código MATLAB</span>
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-[var(--ease-apple)] group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#slides"
                  data-link
                  className="group inline-flex items-center gap-1.5 text-cream transition-colors duration-300 ease-[var(--ease-apple)] hover:text-cream/70"
                >
                  <span>Slides de sustentación</span>
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-[var(--ease-apple)] group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Materia */}
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50">
              Materia
            </p>
            <p className="mt-6 font-display text-2xl leading-tight text-cream">
              Investigación de Operaciones
            </p>
            <p className="mt-3 font-mono tnum text-sm text-cream/60">2026 · semestre I</p>
            <p className="mt-3 text-sm text-cream/60">Programación lineal entera. Heurísticas.</p>
          </div>

          {/* Colofón */}
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50">
              Colofón
            </p>
            <ul className="mt-6 space-y-2 text-sm text-cream/60">
              <li>Fraunces · titulares</li>
              <li>Geist Sans · cuerpo</li>
              <li>Geist Mono · datos</li>
              <li>Next.js 15 · App Router</li>
              <li>Tailwind v4 · GSAP · Lenis</li>
              <li className="font-mono tnum">año 2026</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="ring-1 ring-cream/10">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-8 py-8 md:px-16 xl:px-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/60">
            © 2026 NICOLÁS MORENO &amp; JULIAN ARTEAGA · UNAB
          </p>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-cream/40 md:block">
            SET COVER · 500×500
          </p>
        </div>
      </div>
    </footer>
  );
}

function Marquee() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const DEFAULT_BASE = 90; // px/s
  const HOVER_BASE = 18;   // px/s when cursor parks on the marquee (0.2× the default)
  const baseSpeedRef = useRef(DEFAULT_BASE);
  const speedRef = useRef(DEFAULT_BASE);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const measure = () => {
      // Track contains two copies of the content. Half-width = one copy width.
      widthRef.current = track.scrollWidth / 2;
    };
    measure();

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    // Pause-on-hover — drop the base speed to ~20% while the cursor is over
    // the marquee. The decay() function does the smooth easing back.
    const onEnter = () => {
      baseSpeedRef.current = HOVER_BASE;
    };
    const onLeave = () => {
      baseSpeedRef.current = DEFAULT_BASE;
    };
    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);

    // Velocity-aware scrolling driven by ScrollTrigger (no raw scroll listeners).
    // ScrollTrigger.getVelocity() returns pixels-per-second of the scroll.
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const vel = Math.abs(self.getVelocity()); // px/s
        // Boost up to 8× the base speed on fast scrolls
        const mult = 1 + Math.min(7, vel / 750);
        speedRef.current = baseSpeedRef.current * mult;
      },
    });

    // Decay speed back to base — slower decay so the boost lingers longer
    const decay = () => {
      speedRef.current = speedRef.current * 0.95 + baseSpeedRef.current * 0.05;
    };

    const tick = (t: number) => {
      if (lastTRef.current === null) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      decay();
      offsetRef.current -= speedRef.current * dt;
      const w = widthRef.current;
      if (w > 0) {
        if (offsetRef.current <= -w) offsetRef.current += w;
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', onResize);
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      st.kill();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Render two copies of the content for seamless loop
  const repeated = MARQUEE_TEXT.repeat(4);

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden border-y border-cream/10 py-8 md:py-10"
    >
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap will-change-transform font-display text-4xl leading-none text-cream md:text-6xl lg:text-7xl"
      >
        <span className="pr-8">{repeated}</span>
        <span aria-hidden className="pr-8">
          {repeated}
        </span>
      </div>
    </div>
  );
}
