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
    <footer className="bg-ink text-cream">
      <Marquee />

      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
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
                <a href="#paper" className="text-cream transition-opacity hover:opacity-70">
                  Paper IEEE
                </a>
              </li>
              <li>
                <a href="#code" className="text-cream transition-opacity hover:opacity-70">
                  Código MATLAB
                </a>
              </li>
              <li>
                <a href="#slides" className="text-cream transition-opacity hover:opacity-70">
                  Slides de sustentación
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 md:px-10">
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
  const trackRef = useRef<HTMLDivElement>(null);
  const baseSpeedRef = useRef(60); // px/s
  const speedRef = useRef(60);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      // Track contains two copies of the content. Half-width = one copy width.
      widthRef.current = track.scrollWidth / 2;
    };
    measure();

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    // Velocity-aware scrolling driven by ScrollTrigger (no raw scroll listeners).
    // ScrollTrigger.getVelocity() returns pixels-per-second of the scroll.
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const vel = Math.abs(self.getVelocity()); // px/s
        const mult = 1 + Math.min(4, vel / 750);
        speedRef.current = baseSpeedRef.current * mult;
      },
    });

    // Decay speed back to base
    const decay = () => {
      speedRef.current = speedRef.current * 0.92 + baseSpeedRef.current * 0.08;
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
      st.kill();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Render two copies of the content for seamless loop
  const repeated = MARQUEE_TEXT.repeat(4);

  return (
    <div className="relative overflow-hidden border-y border-cream/10 py-8 md:py-10">
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
