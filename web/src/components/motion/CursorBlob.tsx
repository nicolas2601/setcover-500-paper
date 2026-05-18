'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'expo.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'expo.out' });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onEnterInteractive = () => {
      gsap.to(el, { scale: 2.4, duration: 0.4, ease: 'expo.out' });
    };
    const onLeaveInteractive = () => {
      gsap.to(el, { scale: 1, duration: 0.4, ease: 'expo.out' });
    };

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, [data-cursor-grow]').forEach((node) => {
      node.addEventListener('mouseenter', onEnterInteractive);
      node.addEventListener('mouseleave', onLeaveInteractive);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.querySelectorAll('a, button, [data-cursor-grow]').forEach((node) => {
        node.removeEventListener('mouseenter', onEnterInteractive);
        node.removeEventListener('mouseleave', onLeaveInteractive);
      });
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[70] -mt-2 -ml-2 h-4 w-4 rounded-full bg-cream mix-blend-difference will-change-transform hidden md:block"
    />
  );
}
