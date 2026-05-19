'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * SceneNumber — fixed top-right chapter indicator.
 *
 *   01  ┃  10        (current ┃ total)
 *
 * Uses IntersectionObserver to detect which <section[data-scene]> owns the
 * viewport. When the active scene changes, animates the current numeral with
 * a subtle y-translate + blur on out, then y + blur on in — 300ms expo.
 * Total count stays static.
 *
 * Hidden on mobile (md+ only) because the cursor + corner brackets already
 * compete for that corner space.
 */
type Props = {
  total?: number;
};

export function SceneNumber({ total = 10 }: Props) {
  const [current, setCurrent] = useState(1);
  const numRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<number>(1);

  // Track which section is active via IO. Pick the section with the largest
  // visible area near the centre of the viewport.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scene]'),
    );
    if (!sections.length) return;

    // Map of element → intersection ratio so we can pick the dominant one.
    const visibility = new Map<Element, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target, entry.intersectionRatio);
        }
        // Pick the section with the highest current ratio.
        let bestEl: Element | null = null;
        let bestRatio = 0;
        for (const [el, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestEl = el;
          }
        }
        if (bestEl) {
          const sceneAttr = (bestEl as HTMLElement).dataset.scene;
          const n = sceneAttr ? parseInt(sceneAttr, 10) : NaN;
          if (!Number.isNaN(n)) setCurrent(n);
        }
      },
      {
        // Trigger across the full vertical axis with multiple thresholds
        // so we always know which scene dominates.
        threshold: [0.05, 0.2, 0.4, 0.6, 0.8],
        rootMargin: '-30% 0px -30% 0px',
      },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Animate the current numeral on change.
  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    if (current === prevRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      prevRef.current = current;
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.3 } });
    tl.to(el, { y: -6, filter: 'blur(3px)', opacity: 0 })
      .set(el, { y: 6 })
      .to(el, { y: 0, filter: 'blur(0px)', opacity: 1 });
    prevRef.current = current;
  }, [current]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-6 top-8 z-[55] hidden font-mono uppercase tracking-[0.22em] text-[10px] text-ink-faint md:right-12 md:top-12 md:block"
    >
      <span className="inline-flex items-center gap-2">
        <span
          ref={numRef}
          className="tnum inline-block min-w-[1.6ch] text-right text-ink will-change-transform"
        >
          {pad(current)}
        </span>
        <span aria-hidden className="inline-block h-3 w-px bg-ink-faint/50" />
        <span className="tnum">{pad(total)}</span>
      </span>
    </div>
  );
}

export default SceneNumber;
