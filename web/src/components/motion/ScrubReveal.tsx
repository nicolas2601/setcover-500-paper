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
  end?: string;
  pinTarget?: string;
};

export function ScrubReveal({ children, className, end = '+=180%' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const ctx = gsap.context(() => {
        const items = ref.current!.querySelectorAll<HTMLElement>('[data-scrub-item]');
        if (!items.length) return;

        gsap.set(items, { autoAlpha: 0, y: 40 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current!,
            start: 'top top',
            end,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        items.forEach((item, i) => {
          tl.to(item, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, i)
            .to(item, { autoAlpha: i === items.length - 1 ? 1 : 0.4, duration: 1 }, i + 0.8);
        });
      }, ref);

      return () => ctx.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
