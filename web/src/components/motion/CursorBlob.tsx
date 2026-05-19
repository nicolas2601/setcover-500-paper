'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * CursorBlob — Two-layer custom cursor.
 *  - Outer ring (28×28) follows mouse with lerp, ring border ink/15.
 *  - Inner core (4×4) follows tighter, mix-blend-difference for contrast.
 *
 * Interaction states (driven by GSAP timeline targets, never inline styles):
 *  - button: outer scale 2.4×, inner opacity 0 → ring-only "cinematic" mode.
 *  - link  ([data-link], <a>): inner stays visible, outer expands 1.6×.
 *  - data-cursor-text: outer ring border-ink/40 (more opaque), no scale.
 *
 * Hidden entirely on coarse pointers (mobile) and when reduced-motion is on.
 */
export function CursorBlob() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapperRef.current;
    const ring = ringRef.current;
    const core = coreRef.current;
    if (!wrap || !ring || !core) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Outer ring follows with slight lag, inner core snappier.
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'expo.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'expo.out' });
    const coreX = gsap.quickTo(core, 'x', { duration: 0.25, ease: 'expo.out' });
    const coreY = gsap.quickTo(core, 'y', { duration: 0.25, ease: 'expo.out' });

    const onMove = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      coreX(e.clientX);
      coreY(e.clientY);
    };

    // ── State helpers ──
    const enterButton = () => {
      gsap.to(ring, { scale: 2.4, borderColor: 'rgba(10,9,8,0.15)', duration: 0.4, ease: 'expo.out' });
      gsap.to(core, { opacity: 0, duration: 0.3, ease: 'expo.out' });
    };
    const enterLink = () => {
      gsap.to(ring, { scale: 1.6, borderColor: 'rgba(10,9,8,0.25)', duration: 0.4, ease: 'expo.out' });
      gsap.to(core, { opacity: 1, scale: 1.1, duration: 0.3, ease: 'expo.out' });
    };
    const enterText = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(10,9,8,0.4)', duration: 0.4, ease: 'expo.out' });
      gsap.to(core, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' });
    };
    const resetState = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(10,9,8,0.15)', duration: 0.4, ease: 'expo.out' });
      gsap.to(core, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' });
    };

    // Delegated approach: walk the path once on enter using closest()
    // so we don't have to re-bind every time the DOM mutates.
    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target || !target.closest) return;
      if (target.closest('[data-cursor-text]')) {
        enterText();
        return;
      }
      if (target.closest('button, [data-cursor-grow]')) {
        enterButton();
        return;
      }
      if (target.closest('a, [data-link]')) {
        enterLink();
        return;
      }
    };
    const onPointerOut = (e: PointerEvent) => {
      const next = e.relatedTarget as Element | null;
      // Reset only if we're leaving an interactive zone (not just bubbling out of a child).
      if (
        !next ||
        !(
          next.closest('button, [data-cursor-grow], a, [data-link], [data-cursor-text]')
        )
      ) {
        resetState();
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
    };
  }, []);

  return (
    <div ref={wrapperRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      {/* Outer ring — 28×28 hollow */}
      <div
        ref={ringRef}
        className="pointer-events-none absolute left-0 top-0 -ml-[14px] -mt-[14px] h-7 w-7 rounded-full border border-ink/15 will-change-transform"
      />
      {/* Inner core — 4×4 mix-blend-difference dot */}
      <div
        ref={coreRef}
        className="pointer-events-none absolute left-0 top-0 -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-cream mix-blend-difference will-change-transform"
      />
    </div>
  );
}
