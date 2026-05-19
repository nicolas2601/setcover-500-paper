'use client';

import { useGSAP } from '@gsap/react';
import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Props = {
  children: ReactNode;
  className?: string;
  /** Disable the scrub-driven scale/y component (e.g. inside pinned sections). */
  staticEnter?: boolean;
};

/**
 * SectionTransition
 * Wraps a section and applies a subtle scrub-driven enter / hold-on-exit handover:
 * - opacity 0.4 → 1
 * - y 60 → 0
 * - scale 0.985 → 1
 *
 * Uses scrub: 1.5 for a smooth, never jumpy feel. Respects reduced-motion.
 * Animates ONLY transform + opacity — no width/height/margin.
 */
export function SectionTransition({ children, className, staticEnter = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(node, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      // Initial state — only set, never animate dimensional props.
      gsap.set(node, {
        opacity: staticEnter ? 1 : 0.4,
        y: staticEnter ? 0 : 60,
        scale: staticEnter ? 1 : 0.985,
        transformOrigin: 'center top',
        willChange: 'transform, opacity',
      });

      if (staticEnter) return;

      // Scrub-driven enter — section reveals progressively as it crosses 95% → 30%.
      gsap.to(node, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top 95%',
          end: 'top 30%',
          scrub: 1.5,
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default SectionTransition;
