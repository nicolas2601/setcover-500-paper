'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * PageProgress — fixed hairline bar at the very top of the viewport that tracks
 * global scroll progress. Uses scaleX on the inner element so we only animate
 * transform + opacity. No setTimeout, no scroll listeners — all ScrollTrigger.
 */
export function PageProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const fill = fillRef.current;
      if (!fill) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
        return;
      }

      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });

      gsap.to(fill, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
        },
      });
    },
    { scope: trackRef },
  );

  return (
    <div
      ref={trackRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] h-[2px] w-full bg-transparent"
    >
      <div
        ref={fillRef}
        className="h-full w-full bg-accent will-change-transform"
      />
    </div>
  );
}

export default PageProgress;
