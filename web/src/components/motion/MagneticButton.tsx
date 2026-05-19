'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  strength?: number;
};

export const MagneticButton = forwardRef<HTMLButtonElement, Props>(
  function MagneticButton({ children, className, strength = 0.3, ...rest }, _outerRef) {
    const innerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(pointer: coarse)').matches) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'expo.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'expo.out' });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    }, [strength]);

    return (
      <button
        ref={innerRef}
        className={cn(
          'group relative inline-flex min-h-[44px] items-center gap-3 overflow-hidden rounded-full px-7 py-3.5',
          'bg-ink text-cream',
          'font-mono text-[11px] uppercase tracking-[0.22em]',
          'transition-[background] duration-300 ease-[var(--ease-apple)]',
          'hover:bg-ink-soft active:scale-[0.98] will-change-transform',
          className,
        )}
        {...rest}
      >
        {/* Shimmer pulse — expands from centre on hover, fades through opacity curve. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 m-auto h-full w-full origin-center scale-0 rounded-full bg-accent/20 opacity-0 transition-[transform,opacity] duration-[800ms] ease-[var(--ease-expo)] group-hover:scale-150 group-hover:opacity-100 motion-reduce:hidden"
        />
        <span className="relative z-[1] inline-flex items-center gap-3">{children}</span>
      </button>
    );
  },
);
