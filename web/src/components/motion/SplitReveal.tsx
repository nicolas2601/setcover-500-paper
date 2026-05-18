'use client';

import { useGSAP } from '@gsap/react';
import { useRef, type ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Props = {
  children: string;
  className?: string;
  as?: ElementType;
  stagger?: number;
  delay?: number;
  start?: string;
  once?: boolean;
  by?: 'chars' | 'words' | 'lines';
};

export function SplitReveal({
  children,
  className,
  as: Tag = 'h2',
  stagger = 0.018,
  delay = 0,
  start = 'top 82%',
  once = true,
  by = 'chars',
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(ref.current, { opacity: 1 });
        return;
      }

      const types: ('chars' | 'words' | 'lines')[] =
        by === 'chars' ? ['chars', 'words'] : by === 'words' ? ['words'] : ['lines'];

      const split = new SplitType(ref.current, { types: types.join(',') as 'chars,words' });
      const targets = by === 'chars' ? split.chars : by === 'words' ? split.words : split.lines;
      if (!targets) return;

      gsap.set(targets, { yPercent: 110, opacity: 0, filter: 'blur(8px)' });
      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start,
          once,
        },
      });

      return () => {
        split.revert();
      };
    },
    { scope: ref, dependencies: [children] },
  );

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={cn('overflow-hidden', className)}>
      {children}
    </Tag>
  );
}
